-- The only PostgREST gateway for diagnostic data. EXECUTE granted to service_role
-- only; the Edge Function must validate the JWT before supplying p_actor.
-- NO direct grants or RLS policies on keyed private tables for browser roles.

create or replace function private.vocabulary_diagnostic_safe_question(
  p_session uuid, p_position integer
) returns jsonb
language sql stable
set search_path = ''
as $$
  select jsonb_build_object(
    'sessionId',s.id,
    'questionId',i.item_id,
    'questionVersion',i.version,
    'position',fi.position,
    'stem',i.stem,
    'options',(
      select coalesce(jsonb_agg(
        jsonb_build_object('id',o.option->>'id','text',o.option->>'text')
        order by ord.pos
      ),'[]'::jsonb)
      from unnest(fi.option_order) with ordinality as ord(option_id,pos)
      join lateral jsonb_array_elements(i.options) as o(option) on o.option->>'id'=ord.option_id
    ),
    'allowUnknown',true
  )
  from private.vocabulary_diagnostic_sessions s
  join private.vocabulary_diagnostic_form_items fi
    on fi.form_id=s.form_id and fi.position=p_position
  join private.vocabulary_diagnostic_items i
    on i.item_id=fi.item_id and i.version=fi.item_version
  where s.id=p_session;
$$;
revoke all on function private.vocabulary_diagnostic_safe_question(uuid,integer)
 from public,anon,authenticated;

create or replace function public.vocabulary_diagnostic_api(
  p_actor uuid, p_action text, p_data jsonb default '{}'::jsonb
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role text;
  v_student uuid;
  v_form uuid;
  v_kind text;
  v_assignment private.vocabulary_diagnostic_assignments%rowtype;
  v_session private.vocabulary_diagnostic_sessions%rowtype;
  v_item private.vocabulary_diagnostic_items%rowtype;
  v_slot private.vocabulary_diagnostic_form_items%rowtype;
  v_prior private.vocabulary_diagnostic_responses%rowtype;
  v_result private.vocabulary_diagnostic_results%rowtype;
  v_session_id uuid;
  v_assignment_id uuid;
  v_request_id uuid;
  v_answer text;
  v_hash text;
  v_position integer;
  v_count integer;
  v_next jsonb;
  v_coverage jsonb;
  v_latest timestamptz;
begin
  -- Caller identity is verified by the Edge Function using auth.getUser(token).
  -- Never expose this function to 'authenticated' or accept actor IDs directly
  -- from the browser. Only service_role can EXECUTE, enforced by grants.
  select role::text into v_role
  from public.profiles where id=p_actor and active=true;
  if v_role is null then raise exception 'ACCESS_DENIED'; end if;

  if p_action = 'assign' then
    if v_role not in ('teacher','admin') then raise exception 'ACCESS_DENIED'; end if;
    v_student := nullif(p_data->>'studentId','')::uuid;
    v_form := nullif(p_data->>'formId','')::uuid;
    v_kind := coalesce(p_data->>'kind','baseline');
    if v_kind not in ('baseline','follow_up','teacher_retake')
      then raise exception 'INVALID_KIND'; end if;
    if not exists(select 1 from public.profiles
      where id=v_student and active=true and role::text='student')
      then raise exception 'STUDENT_UNAVAILABLE'; end if;
    if v_role='teacher' and not exists(
      select 1 from public.student_class_memberships m
      join public.teacher_classes tc on tc.class_id=m.class_id
      where m.student_id=v_student and m.ended_at is null
        and tc.teacher_id=p_actor
    ) then raise exception 'ACCESS_DENIED'; end if;
    if not exists(select 1 from private.vocabulary_diagnostic_forms
      where id=v_form and status='pilot')
      then raise exception 'FORM_UNAVAILABLE'; end if;
    if v_kind='baseline' and exists(
      select 1 from private.vocabulary_diagnostic_assignments
      where student_id=v_student and kind='baseline' and cancelled_at is null
    ) then raise exception 'BASELINE_ALREADY_ASSIGNED'; end if;
    if v_kind='follow_up' and not exists(
      select 1 from private.vocabulary_diagnostic_results r
      join private.vocabulary_diagnostic_sessions s on s.id=r.session_id
      where r.student_id=v_student and s.kind='baseline'
    ) then raise exception 'BASELINE_REQUIRED'; end if;
    insert into private.vocabulary_diagnostic_assignments
      (student_id,assigned_by,form_id,kind,available_at,expires_at)
    values (v_student,p_actor,v_form,v_kind,
      coalesce(nullif(p_data->>'availableAt','')::timestamptz,now()),
      nullif(p_data->>'expiresAt','')::timestamptz)
    returning id into v_assignment_id;
    return jsonb_build_object('assignmentId',v_assignment_id,'assigned',true);

  elsif p_action='status' then
    if v_role<>'student' then raise exception 'ACCESS_DENIED'; end if;
    select * into v_session from private.vocabulary_diagnostic_sessions
    where student_id=p_actor
    order by started_at desc limit 1;
    select id into v_assignment_id
    from private.vocabulary_diagnostic_assignments a
    where a.student_id=p_actor and a.cancelled_at is null
      and a.available_at<=now()
      and (a.expires_at is null or a.expires_at>now())
      and not exists(select 1 from private.vocabulary_diagnostic_sessions s
        where s.assignment_id=a.id)
    order by a.created_at desc limit 1;
    return jsonb_build_object('sessionId',v_session.id,'state',v_session.state,
      'assignmentId',v_assignment_id,'pilot',true,'levelEstimate',null);

  elsif p_action='start' then
    if v_role<>'student' then raise exception 'ACCESS_DENIED'; end if;
    v_assignment_id:=nullif(p_data->>'assignmentId','')::uuid;
    select * into v_assignment from private.vocabulary_diagnostic_assignments
      where id=v_assignment_id and student_id=p_actor for update;
    if not found or v_assignment.cancelled_at is not null
       or v_assignment.available_at>now()
       or (v_assignment.expires_at is not null and v_assignment.expires_at<=now())
      then raise exception 'ASSIGNMENT_UNAVAILABLE'; end if;
    select * into v_session from private.vocabulary_diagnostic_sessions
      where assignment_id=v_assignment.id for update;
    if found then
      if v_session.state not in ('in_progress','interrupted')
        then raise exception 'SESSION_CLOSED'; end if;
      if v_session.state='interrupted' then
        update private.vocabulary_diagnostic_sessions set state='in_progress'
         where id=v_session.id;
      end if;
    else
      if exists(select 1 from private.vocabulary_diagnostic_sessions
        where student_id=p_actor and state in ('in_progress','interrupted'))
        then raise exception 'OPEN_SESSION_EXISTS'; end if;
      if not exists(select 1 from private.vocabulary_diagnostic_forms
        where id=v_assignment.form_id and status='pilot')
        then raise exception 'FORM_UNAVAILABLE'; end if;
      select count(*) into v_count from private.vocabulary_diagnostic_form_items
       where form_id=v_assignment.form_id;
      if v_count<1 then raise exception 'EMPTY_FORM'; end if;
      -- Do not ever serve a draft, malformed or ambiguously keyed form.
      if exists(
        select 1
        from private.vocabulary_diagnostic_form_items fi
        join private.vocabulary_diagnostic_items i
          on i.item_id=fi.item_id and i.version=fi.item_version
        where fi.form_id=v_assignment.form_id
          and (
            i.review_status not in ('pilot','approved')
            or (select count(distinct e->>'id') from jsonb_array_elements(i.options) e) <> 4
            or (select count(*) from jsonb_array_elements(i.options) e
                  where e->>'id' in ('A','B','C','D')) <> 4
            or not exists(select 1 from jsonb_array_elements(i.options) e
                  where e->>'id'=i.correct_option_id)
            or (select count(distinct x) from unnest(fi.option_order) x) <> 4
            or (select count(*) from unnest(fi.option_order) x
                 where x in ('A','B','C','D')) <> 4
          )
      ) then raise exception 'FORM_INVALID'; end if;
      if v_assignment.kind='follow_up' then
        select max(completed_at) into v_latest
        from private.vocabulary_diagnostic_results where student_id=p_actor;
        if v_latest is null or v_latest>now()-interval '56 days'
          then raise exception 'FOLLOWUP_NOT_DUE'; end if;
      end if;
      if v_assignment.kind='baseline' and exists(
        select 1 from private.vocabulary_diagnostic_results r
        join private.vocabulary_diagnostic_sessions s on s.id=r.session_id
        where r.student_id=p_actor and s.kind='baseline'
      ) then raise exception 'BASELINE_COMPLETE'; end if;
      insert into private.vocabulary_diagnostic_sessions
        (assignment_id,student_id,form_id,kind)
      values (v_assignment.id,p_actor,v_assignment.form_id,v_assignment.kind)
      returning * into v_session;
    end if;
    v_next:=private.vocabulary_diagnostic_safe_question(
      v_session.id,v_session.next_position);
    if v_next is null then raise exception 'FORM_INVALID'; end if;
    return jsonb_build_object('state','in_progress','question',v_next);

  elsif p_action='respond' then
    if v_role<>'student' then raise exception 'ACCESS_DENIED'; end if;
    v_session_id:=nullif(p_data->>'sessionId','')::uuid;
    v_request_id:=nullif(p_data->>'requestId','')::uuid;
    v_position:=nullif(p_data->>'position','')::integer;
    v_answer:=p_data->>'answerId';
    v_hash:=md5(concat_ws('|',p_data->>'sessionId',p_data->>'questionId',
      p_data->>'questionVersion',p_data->>'position',p_data->>'answerId'));
    select * into v_session from private.vocabulary_diagnostic_sessions
     where id=v_session_id and student_id=p_actor for update;
    if not found then raise exception 'SESSION_UNAVAILABLE'; end if;
    -- A safe retry returns the original acknowledgement even after completion.
    select * into v_prior from private.vocabulary_diagnostic_responses
     where session_id=v_session.id and request_id=v_request_id;
    if found then
      if v_prior.request_hash<>v_hash then raise exception 'REPLAY_CONFLICT'; end if;
      return jsonb_build_object('accepted',true,'duplicate',true,
        'state',v_session.state,
        'question',case when v_session.state='in_progress'
          then private.vocabulary_diagnostic_safe_question(v_session.id,v_session.next_position)
          else null end);
    end if;
    if v_session.state<>'in_progress' then raise exception 'SESSION_CLOSED'; end if;
    if v_position is distinct from v_session.next_position
      then raise exception 'OUT_OF_SEQUENCE'; end if;
    select * into v_slot from private.vocabulary_diagnostic_form_items
      where form_id=v_session.form_id and position=v_position;
    if not found or v_slot.item_id is distinct from p_data->>'questionId'
      or v_slot.item_version is distinct from nullif(p_data->>'questionVersion','')::integer
      then raise exception 'QUESTION_MISMATCH'; end if;
    select * into v_item from private.vocabulary_diagnostic_items
      where item_id=v_slot.item_id and version=v_slot.item_version;
    if v_answer not in ('A','B','C','D','unknown') or v_answer is null
      then raise exception 'INVALID_OPTION'; end if;
    insert into private.vocabulary_diagnostic_responses
      (session_id,position,item_id,item_version,answer_id,correct,request_id,request_hash)
    values (v_session.id,v_position,v_item.item_id,v_item.version,
      v_answer,v_answer=v_item.correct_option_id,v_request_id,v_hash);

    v_next:=private.vocabulary_diagnostic_safe_question(v_session.id,v_position+1);
    if v_next is not null then
      update private.vocabulary_diagnostic_sessions
       set next_position=v_position+1 where id=v_session.id;
      return jsonb_build_object('accepted',true,'duplicate',false,
        'state','in_progress','question',v_next);
    end if;

    update private.vocabulary_diagnostic_sessions
       set state='completed',completed_at=now(),next_position=v_position+1
       where id=v_session.id;
    select coalesce(jsonb_object_agg(level,detail),'{}'::jsonb)
      into v_coverage from (
      select i.level_hypothesis as level,
        jsonb_build_object('administered',count(*),
          'correct',count(*) filter(where r.correct),
          'unknown',count(*) filter(where r.answer_id='unknown')) as detail
      from private.vocabulary_diagnostic_responses r
      join private.vocabulary_diagnostic_items i
        on i.item_id=r.item_id and i.version=r.item_version
      where r.session_id=v_session.id group by i.level_hypothesis
    ) bands;
    insert into private.vocabulary_diagnostic_results
       (session_id,student_id,total,correct,unknown,band_coverage,
        form_version,item_bank_version,model_version)
    select v_session.id,p_actor,
      (select count(*) from private.vocabulary_diagnostic_responses where session_id=v_session.id),
      (select count(*) from private.vocabulary_diagnostic_responses where session_id=v_session.id and correct),
      (select count(*) from private.vocabulary_diagnostic_responses where session_id=v_session.id and answer_id='unknown'),
      v_coverage,f.version,f.item_bank_version,v_session.score_model_version
    from private.vocabulary_diagnostic_forms f where f.id=v_session.form_id
    returning * into v_result;
    return jsonb_build_object('accepted',true,'duplicate',false,
      'state','completed','result',jsonb_build_object(
        'scoreStatus','uncalibrated','levelEstimate',null,
        'total',v_result.total,'correct',v_result.correct,
        'unknown',v_result.unknown,'coverage',v_result.band_coverage));

  elsif p_action='history' then
    if v_role<>'student' then raise exception 'ACCESS_DENIED'; end if;
    return jsonb_build_object('results',coalesce((
      select jsonb_agg(jsonb_build_object(
        'sessionId',r.session_id,'completedAt',r.completed_at,
        'scoreStatus',r.score_status,'levelEstimate',null,
        'total',r.total,'correct',r.correct,'unknown',r.unknown,
        'coverage',r.band_coverage) order by r.completed_at desc)
      from (select * from private.vocabulary_diagnostic_results
        where student_id=p_actor order by completed_at desc limit 20) r
    ),'[]'::jsonb));

  elsif p_action='report' then
    if v_role not in ('teacher','admin') then raise exception 'ACCESS_DENIED'; end if;
    -- Per-student membership check, not broad profiles/memberships SELECT.
    return jsonb_build_object('results',coalesce((
      select jsonb_agg(jsonb_build_object(
        'studentId',r.student_id,'studentName',p.display_name,
        'completedAt',r.completed_at,'scoreStatus',r.score_status,
        'levelEstimate',null,'total',r.total,'correct',r.correct,'unknown',r.unknown))
      from (select distinct on (student_id) * from private.vocabulary_diagnostic_results
        order by student_id,completed_at desc) r
      join public.profiles p on p.id=r.student_id
      where v_role='admin' or exists(
        select 1 from public.student_class_memberships m
        join public.teacher_classes tc on tc.class_id=m.class_id
        where m.student_id=r.student_id and m.ended_at is null
          and tc.teacher_id=p_actor)
    ),'[]'::jsonb));
  end if;
  raise exception 'UNKNOWN_ACTION';
end;
$$;
revoke all on function public.vocabulary_diagnostic_api(uuid,text,jsonb)
 from public,anon,authenticated;
grant execute on function public.vocabulary_diagnostic_api(uuid,text,jsonb)
 to service_role;
comment on function public.vocabulary_diagnostic_api(uuid,text,jsonb) is
 'SERVICE_ROLE ONLY; actor ID MUST come from verified Auth JWT inside trusted Edge Function.';

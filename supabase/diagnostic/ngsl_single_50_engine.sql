-- One 50-question NGSL diagnostic. Separate from historic CEFR draft tables.
-- Only service_role can invoke the RPC; the Edge Function derives p_actor from verified JWT.
create table if not exists private.ngsl_baseline_items(
 position integer primary key check(position between 1 and 50),
 target text not null unique,
 ngsl_rank integer not null unique check(ngsl_rank between 1 and 2809),
 ngsl_band integer not null check(ngsl_band between 1 and 5),
 sentence text not null,
 options jsonb not null check(jsonb_typeof(options)='object'),
 correct_answer text not null check(correct_answer in ('A','B','C','D')),
 source_version text not null default 'NGSL 1.2'
);
create table if not exists private.ngsl_baseline_sessions(
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null unique references auth.users(id),
 question_order integer[] not null,
 answer_orders jsonb not null,
 next_index integer not null default 1 check(next_index between 1 and 51),
 state text not null default 'in_progress' check(state in ('in_progress','interrupted','completed')),
 started_at timestamptz not null default now(),
 completed_at timestamptz
);
create table if not exists private.ngsl_baseline_responses(
 id uuid primary key default gen_random_uuid(),
 session_id uuid not null references private.ngsl_baseline_sessions(id),
 question_index integer not null check(question_index between 1 and 50),
 item_position integer not null references private.ngsl_baseline_items(position),
 selected_letter text not null check(selected_letter in ('A','B','C','D')),
 source_letter text not null check(source_letter in ('A','B','C','D')),
 correct boolean not null,
 request_id uuid not null,
 request_hash text not null,
 submitted_at timestamptz not null default now(),
 unique(session_id,question_index),
 unique(session_id,request_id)
);
create table if not exists private.ngsl_baseline_results(
 session_id uuid primary key references private.ngsl_baseline_sessions(id),
 student_id uuid not null references auth.users(id),
 total integer not null,
 correct integer not null,
 band_scores jsonb not null,
 missed_targets jsonb not null,
 completed_at timestamptz not null default now(),
 model_version text not null default 'ngsl-frequency-five-bands-v1'
);
revoke all on private.ngsl_baseline_items,private.ngsl_baseline_sessions,
 private.ngsl_baseline_responses,private.ngsl_baseline_results from public,anon,authenticated;
create or replace function private.ngsl_baseline_safe_question(p_session uuid)
returns jsonb language plpgsql security definer set search_path='' as $fn$
declare s private.ngsl_baseline_sessions%rowtype;
 i private.ngsl_baseline_items%rowtype; v_map jsonb;v_options jsonb:='[]'::jsonb;
 n integer;v_original text;
begin
 select * into s from private.ngsl_baseline_sessions where id=p_session;
 if not found or s.state='completed' or s.next_index>50 then return null; end if;
 select * into i from private.ngsl_baseline_items where position=s.question_order[s.next_index];
 if not found then raise exception 'FORM_INVALID'; end if;
 v_map:=s.answer_orders->(i.position::text);
 if jsonb_array_length(v_map)<>4 then raise exception 'FORM_INVALID'; end if;
 for n in 0..3 loop
  v_original:=v_map->>n;
  v_options:=v_options || jsonb_build_array(jsonb_build_object('id',chr(65+n),'text',i.options->>v_original));
 end loop;
 return jsonb_build_object('sessionId',s.id,'questionId','NGSL-'||i.position,
  'questionVersion',1,'position',s.next_index,'total',50,
  'stem',i.sentence,'target',i.target,'options',v_options);
end;$fn$;
revoke all on function private.ngsl_baseline_safe_question(uuid) from public,anon,authenticated;
grant execute on function private.ngsl_baseline_safe_question(uuid) to service_role;

create or replace function public.vocabulary_ngsl_api(p_actor uuid,p_action text,p_data jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path='' as $fn$
declare s private.ngsl_baseline_sessions%rowtype;item private.ngsl_baseline_items%rowtype;
 r private.ngsl_baseline_responses%rowtype; v_order integer[]; v_answers jsonb:='{}'::jsonb;
 v_perm text[];v_idx integer;v_original text;v_selected text;v_hash text;v_rid uuid;
 v_question text;v_result jsonb;v_bands jsonb;v_missed jsonb;v_total integer;v_correct integer;
begin
 if p_actor is null or not exists(select 1 from public.profiles p
     where p.id=p_actor and p.active=true and p.role::text='student')
 then
  if p_action='teacher-report' and exists(select 1 from public.profiles p where
    p.id=p_actor and p.active=true and p.role::text in ('teacher','admin'))
  then
   return jsonb_build_object('results',coalesce((
     select jsonb_agg(jsonb_build_object('studentId',z.student_id,'studentName',p.display_name,
        'total',z.total,'correct',z.correct,'bandScores',z.band_scores,'completedAt',z.completed_at)
        order by z.completed_at desc)
     from private.ngsl_baseline_results z join public.profiles p on p.id=z.student_id
     where exists(select 1 from public.profiles staff where staff.id=p_actor and staff.role::text='admin')
       or exists(select 1 from public.student_class_memberships m
        join public.teacher_classes tc on tc.class_id=m.class_id
        where m.student_id=z.student_id and m.ended_at is null and tc.teacher_id=p_actor)
   ),'[]'::jsonb));
  end if;
  raise exception 'ACCESS_DENIED';
 end if;
 if p_action='status' then
   select * into s from private.ngsl_baseline_sessions where student_id=p_actor;
   return jsonb_build_object('completed',coalesce(s.state='completed',false),
     'sessionState',s.state,'hasSession',s.id is not null,
     'total',50,'assessment','NGSL');
 end if;
 if p_action='start' then
  if (select count(*) from private.ngsl_baseline_items)<>50
     or exists(select 1 from generate_series(1,5) b(n) where
       (select count(*) from private.ngsl_baseline_items i where i.ngsl_band=b.n)<>10)
  then raise exception 'FORM_INVALID'; end if;
  select * into s from private.ngsl_baseline_sessions where student_id=p_actor for update;
  if not found then
    select array_agg(position order by random()) into v_order from private.ngsl_baseline_items;
    for item in select * from private.ngsl_baseline_items loop
      select array_agg(letter order by random()) into v_perm
        from (select unnest(array['A','B','C','D']) letter) shuffled;
      v_answers:=v_answers||jsonb_build_object(item.position::text,to_jsonb(v_perm));
    end loop;
    insert into private.ngsl_baseline_sessions(student_id,question_order,answer_orders)
     values(p_actor,v_order,v_answers)
     on conflict(student_id) do nothing;
    select * into s from private.ngsl_baseline_sessions where student_id=p_actor for update;
  end if;
  if s.state='completed' then
   select jsonb_build_object('total',z.total,'correct',z.correct,'percentage',round(100.0*z.correct/z.total,1),
      'bandScores',z.band_scores,'missedTargets',z.missed_targets)
      into v_result from private.ngsl_baseline_results z where z.session_id=s.id;
   return jsonb_build_object('state','completed','result',v_result);
  end if;
  update private.ngsl_baseline_sessions set state='in_progress' where id=s.id;
  return jsonb_build_object('state','in_progress',
   'question',private.ngsl_baseline_safe_question(s.id));
 end if;
 if p_action='history' then
  select jsonb_build_object('total',z.total,'correct',z.correct,'percentage',round(100.0*z.correct/z.total,1),
       'bandScores',z.band_scores,'missedTargets',z.missed_targets,'completedAt',z.completed_at)
   into v_result from private.ngsl_baseline_results z where z.student_id=p_actor;
  return jsonb_build_object('result',v_result);
 end if;
 if p_action not in ('pause','respond') then raise exception 'UNKNOWN_ACTION'; end if;
 select * into s from private.ngsl_baseline_sessions where id=nullif(p_data->>'sessionId','')::uuid
   and student_id=p_actor for update;
 if not found then raise exception 'SESSION_UNAVAILABLE'; end if;
 if p_action='pause' then
   if s.state='completed' then raise exception 'SESSION_CLOSED';end if;
   update private.ngsl_baseline_sessions set state='interrupted' where id=s.id;
   return jsonb_build_object('state','interrupted');
 end if;
 v_rid:=nullif(p_data->>'requestId','')::uuid;
 v_idx:=nullif(p_data->>'position','')::integer;
 v_selected:=p_data->>'answerId';
 v_question:=p_data->>'questionId';
 if v_rid is null or v_idx is null or v_selected not in ('A','B','C','D')
  or v_question is null then raise exception 'INVALID_REQUEST';end if;
 v_hash:=md5(concat_ws('|',s.id::text,v_idx::text,v_question,v_selected));
 select * into r from private.ngsl_baseline_responses
  where session_id=s.id and request_id=v_rid;
 if found then
  if r.request_hash<>v_hash then raise exception 'REPLAY_CONFLICT';end if;
  if s.state='completed' then
   select jsonb_build_object('total',z.total,'correct',z.correct,'percentage',round(100.0*z.correct/z.total,1),
      'bandScores',z.band_scores,'missedTargets',z.missed_targets)
    into v_result from private.ngsl_baseline_results z where z.session_id=s.id;
   return jsonb_build_object('state','completed','result',v_result,'duplicate',true);
  end if;
  return jsonb_build_object('state',s.state,'question',private.ngsl_baseline_safe_question(s.id),'duplicate',true);
 end if;
 if s.state<>'in_progress' then raise exception 'SESSION_CLOSED';end if;
 if v_idx<>s.next_index then raise exception 'OUT_OF_SEQUENCE';end if;
 select * into item from private.ngsl_baseline_items where position=s.question_order[v_idx];
 if not found or v_question <> 'NGSL-'||item.position then raise exception 'QUESTION_MISMATCH';end if;
 v_original:=s.answer_orders->(item.position::text)->>(ascii(v_selected)-65);
 if v_original not in ('A','B','C','D') then raise exception 'FORM_INVALID';end if;
 insert into private.ngsl_baseline_responses(session_id,question_index,item_position,selected_letter,
   source_letter,correct,request_id,request_hash)
 values(s.id,v_idx,item.position,v_selected,v_original,v_original=item.correct_answer,v_rid,v_hash);
 if v_idx<50 then
  update private.ngsl_baseline_sessions set next_index=v_idx+1 where id=s.id;
  return jsonb_build_object('state','in_progress','question',private.ngsl_baseline_safe_question(s.id));
 end if;
 update private.ngsl_baseline_sessions set state='completed',next_index=51,completed_at=now()
   where id=s.id;
 select count(*)::integer,count(*) filter(where correct)::integer into v_total,v_correct
  from private.ngsl_baseline_responses where session_id=s.id;
 if v_total<>50 then raise exception 'FORM_INVALID';end if;
 select jsonb_object_agg(ngsl_band::text,jsonb_build_object('correct',correct_count,'total',10))
  into v_bands from (
   select i.ngsl_band,count(*) filter(where r.correct)::integer correct_count
    from private.ngsl_baseline_responses r
    join private.ngsl_baseline_items i on i.position=r.item_position
    where r.session_id=s.id group by i.ngsl_band
  ) scores;
 select coalesce(jsonb_agg(jsonb_build_object('target',i.target,'band',i.ngsl_band)
    order by r.question_index) filter(where not r.correct),'[]'::jsonb) into v_missed
 from private.ngsl_baseline_responses r
 join private.ngsl_baseline_items i on i.position=r.item_position where r.session_id=s.id;
 insert into private.ngsl_baseline_results(session_id,student_id,total,correct,band_scores,missed_targets)
 values(s.id,p_actor,v_total,v_correct,v_bands,v_missed);
 return jsonb_build_object('state','completed','result',jsonb_build_object(
   'total',v_total,'correct',v_correct,'percentage',round(100.0*v_correct/v_total,1),
   'bandScores',v_bands,'missedTargets',v_missed));
end;$fn$;
revoke all on function public.vocabulary_ngsl_api(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.vocabulary_ngsl_api(uuid,text,jsonb) to service_role;

-- Reuse the existing authenticated teacher-preview action, but expose exactly one
-- NGSL form. No correct keys or frequency ranks leave the private schema.
create or replace function public.vocabulary_ngsl_teacher_form_preview(p_actor uuid,p_form text)
returns jsonb language plpgsql security definer set search_path='' as $fn$
declare v_rows jsonb; v_count integer;
begin
 if not exists(select 1 from public.profiles p where p.id=p_actor and p.active=true
  and p.role::text in ('teacher','admin')) then raise exception 'REVIEW_ACCESS_DENIED';end if;
 if p_form<>'A' or p_form is null then raise exception 'INVALID_FORM';end if;
 select count(*) into v_count from private.ngsl_baseline_items;
 if v_count<>50 then raise exception 'FORM_INVALID';end if;
 select jsonb_agg(jsonb_build_object('position',i.position,'target',i.target,'stem',i.sentence,
  'options',jsonb_build_array(
  jsonb_build_object('id','A','text',i.options->>'B'),
  jsonb_build_object('id','B','text',i.options->>'D'),
  jsonb_build_object('id','C','text',i.options->>'A'),
  jsonb_build_object('id','D','text',i.options->>'C')
  )) order by i.position) into v_rows from private.ngsl_baseline_items i;
 return jsonb_build_object('form','A','total',50,'questions',v_rows);
end;$fn$;
revoke all on function public.vocabulary_ngsl_teacher_form_preview(uuid,text) from public,anon,authenticated;
grant execute on function public.vocabulary_ngsl_teacher_form_preview(uuid,text) to service_role;

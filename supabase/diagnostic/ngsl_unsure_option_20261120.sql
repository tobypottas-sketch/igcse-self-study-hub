-- Enable an explicit unknown response. Four randomized choices and sessions unchanged.
-- U remains incorrect; all original A-D answers remain valid.
begin;
alter table private.ngsl_baseline_responses drop constraint if exists ngsl_baseline_responses_selected_letter_check;
alter table private.ngsl_baseline_responses add constraint ngsl_baseline_responses_selected_letter_check check (selected_letter in ('A','B','C','D','U'));
alter table private.ngsl_baseline_responses drop constraint if exists ngsl_baseline_responses_source_letter_check;
alter table private.ngsl_baseline_responses add constraint ngsl_baseline_responses_source_letter_check check (source_letter in ('A','B','C','D','U'));
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
        'total',z.total,'correct',z.correct,'unsure',(select count(*) from private.ngsl_baseline_responses b where b.session_id=z.session_id and b.selected_letter='U'),'bandScores',z.band_scores,'completedAt',z.completed_at)
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
      'unsure',(select count(*) from private.ngsl_baseline_responses b where b.session_id=z.session_id and b.selected_letter='U'),'bandScores',z.band_scores,'missedTargets',z.missed_targets)
      into v_result from private.ngsl_baseline_results z where z.session_id=s.id;
   return jsonb_build_object('state','completed','result',v_result);
  end if;
  update private.ngsl_baseline_sessions set state='in_progress' where id=s.id;
  return jsonb_build_object('state','in_progress',
   'question',private.ngsl_baseline_safe_question(s.id));
 end if;
 if p_action='history' then
  select jsonb_build_object('total',z.total,'correct',z.correct,'percentage',round(100.0*z.correct/z.total,1),
       'unsure',(select count(*) from private.ngsl_baseline_responses b where b.session_id=z.session_id and b.selected_letter='U'),'bandScores',z.band_scores,'missedTargets',z.missed_targets,'completedAt',z.completed_at)
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
 if v_rid is null or v_idx is null or (v_selected is null or v_selected not in ('A','B','C','D','U'))
  or v_question is null then raise exception 'INVALID_REQUEST';end if;
 v_hash:=md5(concat_ws('|',s.id::text,v_idx::text,v_question,v_selected));
 select * into r from private.ngsl_baseline_responses
  where session_id=s.id and request_id=v_rid;
 if found then
  if r.request_hash<>v_hash then raise exception 'REPLAY_CONFLICT';end if;
  if s.state='completed' then
   select jsonb_build_object('total',z.total,'correct',z.correct,'percentage',round(100.0*z.correct/z.total,1),
      'unsure',(select count(*) from private.ngsl_baseline_responses b where b.session_id=z.session_id and b.selected_letter='U'),'bandScores',z.band_scores,'missedTargets',z.missed_targets)
    into v_result from private.ngsl_baseline_results z where z.session_id=s.id;
   return jsonb_build_object('state','completed','result',v_result,'duplicate',true);
  end if;
  return jsonb_build_object('state',s.state,'question',private.ngsl_baseline_safe_question(s.id),'duplicate',true);
 end if;
 if s.state<>'in_progress' then raise exception 'SESSION_CLOSED';end if;
 if v_idx<>s.next_index then raise exception 'OUT_OF_SEQUENCE';end if;
 select * into item from private.ngsl_baseline_items where position=s.question_order[v_idx];
 if not found or v_question <> 'NGSL-'||item.position then raise exception 'QUESTION_MISMATCH';end if;
 v_original:=case when v_selected='U' then 'U' else s.answer_orders->(item.position::text)->>(ascii(v_selected)-65) end;
 if v_original not in ('A','B','C','D','U') then raise exception 'FORM_INVALID';end if;
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
   select i.ngsl_band,count(*) filter(where resp.correct)::integer correct_count
    from private.ngsl_baseline_responses resp
    join private.ngsl_baseline_items i on i.position=resp.item_position
    where resp.session_id=s.id group by i.ngsl_band
  ) scores;
 select coalesce(jsonb_agg(jsonb_build_object('target',i.target,'band',i.ngsl_band)
    order by resp.question_index) filter(where not resp.correct),'[]'::jsonb) into v_missed
 from private.ngsl_baseline_responses resp
 join private.ngsl_baseline_items i on i.position=resp.item_position where resp.session_id=s.id;
 insert into private.ngsl_baseline_results(session_id,student_id,total,correct,band_scores,missed_targets)
 values(s.id,p_actor,v_total,v_correct,v_bands,v_missed);
 return jsonb_build_object('state','completed','result',jsonb_build_object(
   'total',v_total,'correct',v_correct,'percentage',round(100.0*v_correct/v_total,1),
   'unsure',(select count(*) from private.ngsl_baseline_responses b where b.session_id=s.id and b.selected_letter='U'),'bandScores',v_bands,'missedTargets',v_missed));
end;$fn$;
commit;
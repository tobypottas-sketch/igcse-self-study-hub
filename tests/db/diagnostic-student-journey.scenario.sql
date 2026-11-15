-- Full 40-question student journey: status, start, respond, retry, pause, resume, complete.
-- THROWAWAY local Postgres only. Synthetic placeholder content only.
-- Run: tests/db/run-diagnostic-lifecycle-scenario.sh tests/db/diagnostic-student-journey.scenario.sql
create schema journey;
create function journey.expect_error(p_sql text, p_code text) returns void language plpgsql as $$
declare v_succeeded boolean:=false;
begin
  begin execute p_sql; v_succeeded:=true;
  exception when others then
    if sqlerrm not like '%'||p_code||'%' then raise exception 'EXPECTED % GOT %', p_code, sqlerrm; end if;
  end;
  if v_succeeded then raise exception 'EXPECTED % BUT STATEMENT SUCCEEDED: %', p_code, p_sql; end if;
end $$;
-- Per level: how many the synthetic student answers correctly / with "I'm not sure".
create table journey.plan(level text primary key, n_correct int, n_unknown int);
insert into journey.plan values ('A1',8,0),('A2',7,1),('B1',6,1),('B2',3,2),('C1',1,4);
create table journey.ids(name text primary key, id uuid);
insert into public.profiles(id,role,active) values
 ('00000000-0000-0000-0000-0000000000a1','admin',true),
 ('00000000-0000-0000-0000-0000000000e1','student',true),
 ('00000000-0000-0000-0000-0000000000e2','student',true);

-- 40 synthetic items, 8 per level; keys and option order rotate so each displayed slot holds 10 keys.
do $$ declare v_form uuid; v_level text; p int; k text; begin
  for p in 1..40 loop
    v_level:=(array['A1','A2','B1','B2','C1'])[((p-1)/8)+1];
    k:=(array['A','B','C','D'])[((p-1)%4)+1];
    insert into private.vocabulary_diagnostic_items(item_id,version,form_family,level_hypothesis,lemma,tested_sense,stem,options,correct_option_id)
    values ('diag-synthetic-j'||p,1,'synthetic-journey',v_level,'placeholder'||p,'synthetic sense','Synthetic journey stem '||p||'?',
      jsonb_build_array(jsonb_build_object('id','A','text','alpha'||p),jsonb_build_object('id','B','text','beta'||p),
        jsonb_build_object('id','C','text','gamma'||p),jsonb_build_object('id','D','text','delta'||p)),k);
  end loop;
  update private.vocabulary_diagnostic_items set review_status='pilot' where form_family='synthetic-journey';
  insert into private.vocabulary_diagnostic_forms(form_code,version,status,item_bank_version)
    values ('SYN-JOURNEY',1,'draft','syn') returning id into v_form;
  for p in 1..40 loop
    insert into private.vocabulary_diagnostic_form_items(form_id,position,item_id,item_version,option_order)
    values (v_form,p,'diag-synthetic-j'||p,1,
      case (p/4)%2 when 0 then array['A','B','C','D'] else array['D','C','B','A'] end);
  end loop;
  update private.vocabulary_diagnostic_forms set status='pilot' where id=v_form;
  insert into journey.ids values ('form',v_form);
end $$;

-- Synthetic answer for a served question: correct / unknown / wrong according to journey.plan.
create function journey.answer_for(q jsonb) returns text language sql as $$
  select case
    when rank_in_level<=pl.n_correct then i.correct_option_id
    when rank_in_level<=pl.n_correct+pl.n_unknown then 'unknown'
    else (select x from unnest(array['A','B','C','D']) x where x<>i.correct_option_id limit 1) end
  from private.vocabulary_diagnostic_items i
  join journey.plan pl on pl.level=i.level_hypothesis
  cross join lateral (select ((q->>'position')::int-1)%8+1 as rank_in_level) r
  where i.item_id=q->>'questionId' and i.version=(q->>'questionVersion')::int
$$;
create function journey.respond(q jsonb, p_request uuid default gen_random_uuid()) returns jsonb language sql as $$
  select public.vocabulary_diagnostic_api('00000000-0000-0000-0000-0000000000e1','respond',jsonb_build_object(
    'sessionId',q->>'sessionId','questionId',q->>'questionId','questionVersion',(q->>'questionVersion')::int,
    'position',(q->>'position')::int,'answerId',journey.answer_for(q),'requestId',p_request))
$$;

do $$ declare st jsonb; r jsonb; q jsonb; v_assign uuid; v_req uuid; v_session text; i int; begin
  -- No assignment yet: nothing to start, baseline not complete.
  st:=public.vocabulary_diagnostic_api('00000000-0000-0000-0000-0000000000e1','status','{}');
  if (st->>'baselineCompleted') is distinct from 'false' or (st->'baselineAssignmentId') is distinct from 'null' then raise exception 'STATUS BEFORE ASSIGN %',st; end if;

  r:=public.vocabulary_diagnostic_api('00000000-0000-0000-0000-0000000000a1','assign',jsonb_build_object(
    'studentId','00000000-0000-0000-0000-0000000000e1','formId',(select id from journey.ids where name='form'),'kind','baseline'));
  v_assign:=(r->>'assignmentId')::uuid;
  insert into journey.ids values ('assignment',v_assign);
  st:=public.vocabulary_diagnostic_api('00000000-0000-0000-0000-0000000000e1','status','{}');
  if (st->>'baselineCompleted') is distinct from 'false' or (st->>'baselineAssignmentId')::uuid is distinct from v_assign or (st->'baselineSessionState') is distinct from 'null'
    then raise exception 'STATUS AFTER ASSIGN %',st; end if;
  -- Another student sees nothing and cannot start this assignment.
  st:=public.vocabulary_diagnostic_api('00000000-0000-0000-0000-0000000000e2','status','{}');
  if (st->'baselineAssignmentId') is distinct from 'null' then raise exception 'OTHER STUDENT SEES ASSIGNMENT %',st; end if;

  r:=public.vocabulary_diagnostic_api('00000000-0000-0000-0000-0000000000e1','start',jsonb_build_object('assignmentId',v_assign));
  q:=r->'question'; v_session:=q->>'sessionId';
  if (q->>'position')::int<>1 or jsonb_array_length(q->'options')<>4 or (q->>'allowUnknown') is distinct from 'true' then raise exception 'FIRST QUESTION %',q; end if;
  for i in 1..15 loop
    if r::text ~* '(correct|rationale|levelHypothesis|level_hypothesis|calibration)' then raise exception 'LEAK AT %: %',i,r; end if;
    if i=15 then
      -- Network retry with the same request id is idempotent.
      v_req:=gen_random_uuid();
      r:=journey.respond(q,v_req);
      if (journey.respond(q,v_req))->'question'<>r->'question' then raise exception 'RETRY NOT IDEMPOTENT'; end if;
    else r:=journey.respond(q); end if;
    q:=r->'question';
    if (q->>'position')::int<>i+1 then raise exception 'SEQUENCE % %',i,q; end if;
  end loop;

  -- Save & exit, then resume from question 16 without losing answers.
  r:=public.vocabulary_diagnostic_api('00000000-0000-0000-0000-0000000000e1','pause',jsonb_build_object('sessionId',v_session));
  if (r->>'state') is distinct from 'interrupted' then raise exception 'PAUSE %',r; end if;
  st:=public.vocabulary_diagnostic_api('00000000-0000-0000-0000-0000000000e1','status','{}');
  if (st->>'baselineSessionState') is distinct from 'interrupted' or (st->>'baselineAssignmentId')::uuid is distinct from v_assign
     or st->>'baselineSessionId'<>v_session or (st->>'baselineCompleted') is distinct from 'false' then raise exception 'STATUS PAUSED %',st; end if;
  perform journey.expect_error(format('select journey.respond(%L::jsonb)',q),'SESSION_CLOSED');
  r:=public.vocabulary_diagnostic_api('00000000-0000-0000-0000-0000000000e1','start',jsonb_build_object('assignmentId',v_assign));
  q:=r->'question';
  if (q->>'position')::int<>16 or q->>'sessionId'<>v_session then raise exception 'RESUME POSITION %',q; end if;
  if (select count(*) from private.vocabulary_diagnostic_responses where session_id=v_session::uuid)<>15 then raise exception 'ANSWERS LOST ON RESUME'; end if;
  st:=public.vocabulary_diagnostic_api('00000000-0000-0000-0000-0000000000e1','status','{}');
  if (st->>'baselineSessionState') is distinct from 'in_progress' then raise exception 'STATUS RESUMED %',st; end if;

  for i in 16..40 loop
    r:=journey.respond(q);
    if i<40 then
      if (r->>'state') is distinct from 'in_progress' or r ? 'result' then raise exception 'EARLY RESULT AT % %',i,r; end if;
      q:=r->'question';
    end if;
  end loop;
  if (r->>'state') is distinct from 'completed' or (r->'result'->>'total')::int<>40 then raise exception 'COMPLETION %',r; end if;
  if r->'result'->'coverage'<>'{"A1":{"administered":8,"correct":8,"unknown":0},"A2":{"administered":8,"correct":7,"unknown":1},"B1":{"administered":8,"correct":6,"unknown":1},"B2":{"administered":8,"correct":3,"unknown":2},"C1":{"administered":8,"correct":1,"unknown":4}}'::jsonb
    then raise exception 'COVERAGE %',r->'result'->'coverage'; end if;
  if (r->'result'->>'correct')::int<>25 or (r->'result'->>'unknown')::int<>8 then raise exception 'TOTALS %',r; end if;

  st:=public.vocabulary_diagnostic_api('00000000-0000-0000-0000-0000000000e1','status','{}');
  if (st->>'baselineCompleted') is distinct from 'true' or (st->'baselineAssignmentId') is distinct from 'null' or (st->'baselineSessionId') is distinct from 'null'
    then raise exception 'STATUS COMPLETED %',st; end if;
  perform journey.expect_error(format('select public.vocabulary_diagnostic_api(%L,%L,%L::jsonb)',
    '00000000-0000-0000-0000-0000000000e1','start',jsonb_build_object('assignmentId',v_assign)),'SESSION_CLOSED');
  r:=public.vocabulary_diagnostic_api('00000000-0000-0000-0000-0000000000e1','history','{}');
  if jsonb_array_length(r->'results')<>1 or r->'results'->0->>'sessionId'<>v_session
     or (r->'results'->0->>'total')::int<>40 then raise exception 'HISTORY %',r; end if;

  -- A later follow-up assignment never reopens or masquerades as the baseline.
  perform public.vocabulary_diagnostic_api('00000000-0000-0000-0000-0000000000a1','assign',jsonb_build_object(
    'studentId','00000000-0000-0000-0000-0000000000e1','formId',(select id from journey.ids where name='form'),'kind','follow_up'));
  st:=public.vocabulary_diagnostic_api('00000000-0000-0000-0000-0000000000e1','status','{}');
  if (st->>'baselineCompleted') is distinct from 'true' or (st->'baselineAssignmentId') is distinct from 'null' then raise exception 'FOLLOW-UP CONFUSED WITH BASELINE %',st; end if;
end $$;
select 'PASS' as result;

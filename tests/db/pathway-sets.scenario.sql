-- Behavioural scenario for 20261024160000_vocabulary_pathway_sets.sql. Synthetic ids only. Run through tests/db/run-local-scenarios.sh
-- (throwaway local Postgres, NOT Supabase). Every row of the result table must be "t".
\set ON_ERROR_STOP off
insert into public.profiles(id) values ('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222'),('33333333-3333-4333-8333-333333333333');
create temp table r(label text, ok boolean, detail text);
grant all on r to authenticated, anon;

-- One whole mission through the SERVER: start (server decides the step) -> the student's graded attempts -> record. Returns the Set row afterwards.
create or replace function pg_temp.mission(p_student uuid, p_pathway text, p_correct int, p_set int default null, p_claim_stage text default null, p_attempt_stage text default null)
returns jsonb language plpgsql as $$
declare j jsonb; m uuid; i int; st text; rec jsonb; s public.vocabulary_pathway_sets;
begin
  perform set_config('request.jwt.claim.sub', p_student::text, false);
  j := public.start_vocabulary_mission(1, 'pathway', p_pathway, coalesce(p_claim_stage, 'recognise'), 'stage', false, true, p_set);
  m := (j->>'mission_id')::uuid; st := coalesce(p_attempt_stage, j->>'pathway_stage');
  for i in 1..10 loop
    insert into public.activity_events(user_id,app_key,event_type,set_id,metadata) values (p_student,'vocabulary_paraphrase','question_attempt','unit-1',
      jsonb_build_object('mission_id',m,'unit_number',1,'occurrence_id','u1_t'||i,'attempt_number',1,'outcome',case when i<=p_correct then 'correct' else 'try_again' end,'mission_kind','pathway','practice_family','recommended','mission_size',10,'pathway_id',p_pathway,'pathway_stage',st));
    if i > p_correct then
      insert into public.activity_events(user_id,app_key,event_type,set_id,metadata) values (p_student,'vocabulary_paraphrase','question_attempt','unit-1',
        jsonb_build_object('mission_id',m,'unit_number',1,'occurrence_id','u1_t'||i,'attempt_number',2,'outcome','try_again','recovery',true,'mission_kind','pathway','practice_family','recommended','mission_size',10,'pathway_id',p_pathway,'pathway_stage',st));
    end if;
  end loop;
  rec := public.record_vocabulary_mission(m);
  return jsonb_build_object('start', j, 'record', rec);
end $$;

create or replace function pg_temp.sets(p_student uuid, p_pathway text) returns text language sql as $$
  select coalesce(string_agg(set_number || ':' || stage || '/' || phase || '/' || status, ' ' order by set_number), '(none)')
  from public.vocabulary_pathway_sets where student_id = p_student and unit_number = 1 and pathway_id = p_pathway $$;
create or replace function pg_temp.row(p_student uuid, p_pathway text, p_set int) returns public.vocabulary_pathway_sets language sql as $$
  select * from public.vocabulary_pathway_sets where student_id = p_student and unit_number = 1 and pathway_id = p_pathway and set_number = p_set $$;

-- S1 a new student starts Set 1 at Recognise, decided by the server (the caller claimed 'mastery' and set 9)
do $$ declare j jsonb; begin
  perform set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
  j := public.start_vocabulary_mission(1,'pathway','precision_use','mastery','recovery',false,true,9);
  insert into r values ('S1 first start: Set 1, Recognise, stage phase, whatever the caller claimed', (j->>'set_number')='1' and j->>'pathway_stage'='recognise' and j->>'set_phase'='stage' and j->>'mission_phase'='stage', j::text);
end $$;
update public.vocabulary_mission_starts set status='abandoned' where student_id='11111111-1111-4111-8111-111111111111';

-- S2 the exact live regression: Apply 10/10 -> Recall (same Set)
select pg_temp.mission('11111111-1111-4111-8111-111111111111','precision_use',10);   -- recognise -> match
select pg_temp.mission('11111111-1111-4111-8111-111111111111','precision_use',10);   -- match -> apply
insert into r select 'S2a after two passes the Set is at Apply', pg_temp.sets('11111111-1111-4111-8111-111111111111','precision_use') = '1:apply/stage/active', pg_temp.sets('11111111-1111-4111-8111-111111111111','precision_use');
create temp table s2 as select pg_temp.mission('11111111-1111-4111-8111-111111111111','precision_use',10) j;
insert into r select 'S2 Apply 10/10 -> same Set, Recall (never Recognise, never another Set)', pg_temp.sets('11111111-1111-4111-8111-111111111111','precision_use') = '1:recall/stage/active' and (select j->'start'->>'pathway_stage' from s2)='apply', pg_temp.sets('11111111-1111-4111-8111-111111111111','precision_use');
insert into r select 'S2b the next start (Continue studying) is Set 1 Recall', (select (pg_temp.mission('11111111-1111-4111-8111-111111111111','precision_use',10))->'start'->>'pathway_stage') = 'recall', pg_temp.sets('11111111-1111-4111-8111-111111111111','precision_use');
insert into r select 'S3 Recall 10/10 -> Mastery', pg_temp.sets('11111111-1111-4111-8111-111111111111','precision_use') = '1:mastery/stage/active', pg_temp.sets('11111111-1111-4111-8111-111111111111','precision_use');
select pg_temp.mission('11111111-1111-4111-8111-111111111111','precision_use',9);
insert into r select 'S4 Mastery pass -> the Set is Maintain', pg_temp.sets('11111111-1111-4111-8111-111111111111','precision_use') = '1:mastery/stage/maintain' and (pg_temp.row('11111111-1111-4111-8111-111111111111','precision_use',1)).completed_stages = array['recognise','match','apply','recall','mastery'] and (pg_temp.row('11111111-1111-4111-8111-111111111111','precision_use',1)).completed_at is not null, pg_temp.sets('11111111-1111-4111-8111-111111111111','precision_use');
-- S5 with Set 1 in Maintain the next start opens Set 2 at Recognise only when the caller says Set 2 exists; with no hint there is no further Set
do $$ declare j jsonb; begin
  perform set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
  begin perform public.start_vocabulary_mission(1,'pathway','precision_use',null,'stage',false,true,null); insert into r values ('S5a no further Set without the caller naming the next one',false,'started'); exception when others then insert into r values ('S5a no further Set without the caller naming the next one',true,sqlerrm); end;
  begin perform public.start_vocabulary_mission(1,'pathway','precision_use',null,'stage',false,true,4); insert into r values ('S5b a Set may not be skipped (asked for Set 4, Set 2 is next)',false,'started'); exception when others then insert into r values ('S5b a Set may not be skipped (asked for Set 4, Set 2 is next)',true,sqlerrm); end;
  j := public.start_vocabulary_mission(1,'pathway','precision_use',null,'stage',false,true,2);
  insert into r values ('S5 Maintain -> next Set opens at Recognise', (j->>'set_number')='2' and j->>'pathway_stage'='recognise', j::text);
end $$;
update public.vocabulary_mission_starts set status='abandoned' where student_id='11111111-1111-4111-8111-111111111111' and status='open';
insert into r select 'S5c Set 1 stays Maintain when Set 2 starts', pg_temp.sets('11111111-1111-4111-8111-111111111111','precision_use') like '1:mastery/stage/maintain 2:recognise/stage/active', pg_temp.sets('11111111-1111-4111-8111-111111111111','precision_use');

-- S6 6-7 -> Consolidate (same stage); Consolidate pass -> advance
select pg_temp.mission('22222222-2222-4222-8222-222222222222','meaning',7);
insert into r select 'S6 7/10 -> same stage, pending Consolidate, weak targets kept', pg_temp.sets('22222222-2222-4222-8222-222222222222','meaning') = '1:recognise/consolidate/active' and (pg_temp.row('22222222-2222-4222-8222-222222222222','meaning',1)).weak_target_ids = array['u1_t10','u1_t8','u1_t9'], (pg_temp.row('22222222-2222-4222-8222-222222222222','meaning',1)).weak_target_ids::text;
create temp table s6b as select pg_temp.mission('22222222-2222-4222-8222-222222222222','meaning',8) j;
insert into r select 'S6b the next mission is a Consolidate mission; passing it advances', (select j->'start'->>'set_phase' from s6b)='consolidate' and (select j->'start'->>'mission_phase' from s6b)='consolidate' and pg_temp.sets('22222222-2222-4222-8222-222222222222','meaning') = '1:match/stage/active', pg_temp.sets('22222222-2222-4222-8222-222222222222','meaning');
-- S7 <=5 -> Recovery (never advances) -> fresh -> advance whatever the score, with support
select pg_temp.mission('22222222-2222-4222-8222-222222222222','meaning',5);
insert into r select 'S7 5/10 -> Recovery pending, same stage', pg_temp.sets('22222222-2222-4222-8222-222222222222','meaning') = '1:match/recovery/active', pg_temp.sets('22222222-2222-4222-8222-222222222222','meaning');
select pg_temp.mission('22222222-2222-4222-8222-222222222222','meaning',10);        -- a perfect RECOVERY mission still does not advance
insert into r select 'S7b Recovery never advances, even 10/10; a fresh stage mission is next', pg_temp.sets('22222222-2222-4222-8222-222222222222','meaning') = '1:match/fresh/active', pg_temp.sets('22222222-2222-4222-8222-222222222222','meaning');
create temp table s7c as select pg_temp.mission('22222222-2222-4222-8222-222222222222','meaning',3) j;
insert into r select 'S7c fresh mission at 3/10 advances anyway, advanced_with_support + weak ids kept, never blocking',
  pg_temp.sets('22222222-2222-4222-8222-222222222222','meaning') = '1:apply/stage/active'
  and jsonb_array_length((pg_temp.row('22222222-2222-4222-8222-222222222222','meaning',1)).advanced_with_support)=1
  and ((pg_temp.row('22222222-2222-4222-8222-222222222222','meaning',1)).support_flags->0->>'blocksProgression')='false'
  and jsonb_array_length((pg_temp.row('22222222-2222-4222-8222-222222222222','meaning',1)).support_flags->0->'targetIds')=7, (pg_temp.row('22222222-2222-4222-8222-222222222222','meaning',1)).support_flags::text;
-- S8 finite escape: stage 6 -> consolidate fail -> recovery -> fresh -> advance (4 missions at most per stage)
select pg_temp.mission('22222222-2222-4222-8222-222222222222','meaning',6);
select pg_temp.mission('22222222-2222-4222-8222-222222222222','meaning',6);
insert into r select 'S8 Consolidate failed -> Recovery', pg_temp.sets('22222222-2222-4222-8222-222222222222','meaning') = '1:apply/recovery/active', pg_temp.sets('22222222-2222-4222-8222-222222222222','meaning');
select pg_temp.mission('22222222-2222-4222-8222-222222222222','meaning',0);
select pg_temp.mission('22222222-2222-4222-8222-222222222222','meaning',0);
insert into r select 'S8b stage -> consolidate -> recovery -> fresh: the learner is through after four missions, however low', pg_temp.sets('22222222-2222-4222-8222-222222222222','meaning') = '1:recall/stage/active', pg_temp.sets('22222222-2222-4222-8222-222222222222','meaning');

-- S9 resume: restarting mid-step returns the SAME mission and the same step
do $$ declare a jsonb; b jsonb; begin
  perform set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',false);
  a := public.start_vocabulary_mission(1,'pathway','context','recognise','stage',false,true,null);
  b := public.start_vocabulary_mission(1,'pathway','context','recall','stage',false,true,null);
  insert into r values ('S9 refresh/resume: same mission id and seed, same Set and stage (the caller''s stage is ignored)', a->>'mission_id'=b->>'mission_id' and a->>'mission_seed'=b->>'mission_seed' and (b->>'resumed')='true' and b->>'pathway_stage'='recognise', b::text);
  b := public.start_vocabulary_mission(1,'pathway','context','recognise','stage',true,true,null);
  insert into r values ('S9b explicit new abandons it and issues a different mission for the same step', a->>'mission_id'<>b->>'mission_id' and b->>'set_number'='1' and b->>'pathway_stage'='recognise', b::text);
  insert into r select 'S9c the abandoned mission is abandoned, one is open', (select count(*) from public.vocabulary_mission_starts where student_id='33333333-3333-4333-8333-333333333333' and status='open')=1 and (select count(*) from public.vocabulary_mission_starts where student_id='33333333-3333-4333-8333-333333333333' and status='abandoned')=1, '';
end $$;

-- S10 server authority
-- 10a replaying settlement cannot advance twice
do $$ declare j jsonb; m uuid; again jsonb; begin
  perform set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',false);
  j := public.start_vocabulary_mission(1,'pathway','context','recognise','stage',false,true,null); m := (j->>'mission_id')::uuid;
  for i in 1..10 loop insert into public.activity_events(user_id,app_key,event_type,set_id,metadata) values ('33333333-3333-4333-8333-333333333333','vocabulary_paraphrase','question_attempt','unit-1',jsonb_build_object('mission_id',m,'unit_number',1,'occurrence_id','u1_t'||i,'attempt_number',1,'outcome','correct','mission_kind','pathway','practice_family','recommended','mission_size',10,'pathway_id','context','pathway_stage','recognise')); end loop;
  perform public.record_vocabulary_mission(m);
  again := public.record_vocabulary_mission(m);
  insert into r values ('S10a duplicate settlement is idempotent and does not advance twice', (again->>'duplicate')='true' and pg_temp.sets('33333333-3333-4333-8333-333333333333','context') = '1:match/stage/active', pg_temp.sets('33333333-3333-4333-8333-333333333333','context'));
end $$;
-- 10b a mission whose attempts claim a later stage than the server issued cannot advance the Set (forged mission stage)
select pg_temp.mission('33333333-3333-4333-8333-333333333333','context',10,null,null,'mastery');
insert into r select 'S10b forged attempt stage (mastery) while the server issued Match: the Set does not move', pg_temp.sets('33333333-3333-4333-8333-333333333333','context') = '1:match/stage/active', pg_temp.sets('33333333-3333-4333-8333-333333333333','context');
-- 10c another student's Set state cannot be changed: student 3's missions never touch student 2's rows
insert into r select 'S10c one student''s missions leave another student''s Sets untouched', pg_temp.sets('22222222-2222-4222-8222-222222222222','meaning') = '1:recall/stage/active' and pg_temp.sets('22222222-2222-4222-8222-222222222222','context') = '(none)', '';
-- 10d a closed mission cannot be recorded again to advance (enforcement, 1400) and an abandoned one cannot advance
do $$ declare a jsonb; b jsonb; begin
  perform set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',false);
  a := public.start_vocabulary_mission(1,'pathway','context',null,'stage',false,true,null);
  b := public.start_vocabulary_mission(1,'pathway','context',null,'stage',true,true,null);       -- abandons a
  for i in 1..10 loop insert into public.activity_events(user_id,app_key,event_type,set_id,metadata) values ('33333333-3333-4333-8333-333333333333','vocabulary_paraphrase','question_attempt','unit-1',jsonb_build_object('mission_id',a->>'mission_id','unit_number',1,'occurrence_id','u1_t'||i,'attempt_number',1,'outcome','correct','mission_kind','pathway','practice_family','recommended','mission_size',10,'pathway_id','context','pathway_stage','match')); end loop;
  begin perform public.record_vocabulary_mission((a->>'mission_id')::uuid); insert into r values ('S10d an abandoned mission cannot be recorded or advance anything',false,'recorded'); exception when others then insert into r values ('S10d an abandoned mission cannot be recorded or advance anything',true,sqlerrm); end;
  insert into r values ('S10e ...and the Set did not move', pg_temp.sets('33333333-3333-4333-8333-333333333333','context') = '1:match/stage/active', pg_temp.sets('33333333-3333-4333-8333-333333333333','context'));
end $$;

-- S11 a free-practice mission (no Set progression) never moves a Set but still records, and coexists with a Set mission at the same stage
do $$ declare free jsonb; setm jsonb; m uuid; begin
  perform set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',false);
  setm := public.start_vocabulary_mission(1,'pathway','context','match','stage',false,true,null);
  free := public.start_vocabulary_mission(1,'pathway','context','match','stage',false,false,null);
  insert into r values ('S11 a free-practice start is a different mission from the Set mission at the same stage', free->>'mission_id'<>setm->>'mission_id' and free->>'set_number' is null, free::text);
  m := (free->>'mission_id')::uuid;
  for i in 1..10 loop insert into public.activity_events(user_id,app_key,event_type,set_id,metadata) values ('33333333-3333-4333-8333-333333333333','vocabulary_paraphrase','question_attempt','unit-1',jsonb_build_object('mission_id',m,'unit_number',1,'occurrence_id','u1_t'||i,'attempt_number',1,'outcome','correct','mission_kind','pathway','practice_family','definition_to_word','mission_size',10,'pathway_id','context','pathway_stage','match')); end loop;
  perform public.record_vocabulary_mission(m);
  insert into r values ('S11b a free-practice 10/10 does not move the Set', pg_temp.sets('33333333-3333-4333-8333-333333333333','context') = '1:match/stage/active', pg_temp.sets('33333333-3333-4333-8333-333333333333','context'));
end $$;

-- S12 permissions: students read their own rows only and cannot write
set role authenticated; select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',false);
insert into r select 'S12a a student reads only their own Set rows', count(*) > 0 and count(*) filter (where student_id <> '22222222-2222-4222-8222-222222222222') = 0, count(*)::text from public.vocabulary_pathway_sets;
do $$ begin begin update public.vocabulary_pathway_sets set stage='mastery'; insert into r values ('S12b a student cannot update Set state directly',false,'updated'); exception when others then insert into r values ('S12b a student cannot update Set state directly',true,sqlerrm); end; end $$;
do $$ begin begin insert into public.vocabulary_pathway_sets(student_id,unit_number,pathway_id,set_number,stage) values ('22222222-2222-4222-8222-222222222222',1,'meaning',7,'mastery'); insert into r values ('S12c a student cannot insert a Set row directly',false,'inserted'); exception when others then insert into r values ('S12c a student cannot insert a Set row directly',true,sqlerrm); end; end $$;
do $$ begin begin delete from public.vocabulary_pathway_sets; insert into r values ('S12d a student cannot delete Set state',false,'deleted'); exception when others then insert into r values ('S12d a student cannot delete Set state',true,sqlerrm); end; end $$;
reset role;
set role anon;
do $$ begin begin perform count(*) from public.vocabulary_pathway_sets; insert into r values ('S12e anon cannot read Set state',false,'read'); exception when others then insert into r values ('S12e anon cannot read Set state',true,sqlerrm); end; end $$;
reset role;

-- S13 older client call shape (six positional arguments) still works and does not create Set state
do $$ declare j jsonb; before_count int; begin
  perform set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
  select count(*) into before_count from public.vocabulary_pathway_sets;
  j := public.start_vocabulary_mission(1,'mixed',null,null,'stage',false);
  insert into r values ('S13 the pre-Set call shape still works for Mixed and writes no Set row', j->>'mission_kind'='mixed' and (select count(*) from public.vocabulary_pathway_sets)=before_count, j::text);
end $$;

select label || ' | ' || case when ok then 't' else 'F' end || ' | ' || coalesce(detail,'') from r order by 1;
select 'FAILED=' || count(*) filter (where not ok) || ' TOTAL=' || count(*) from r;

-- Behavioural scenario for 20261024140000_vocabulary_mission_enforcement.sql. Synthetic ids only.
-- Apply order: stubs, 20261023120000_vocabulary_missions.sql, 20261024120000_vocabulary_mission_identity.sql, 20261024140000_vocabulary_mission_enforcement.sql, then this file.
\set ON_ERROR_STOP off
insert into public.profiles(id) values ('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222');
create temp table r(label text, ok boolean, detail text);
grant all on r to authenticated;
create or replace function pg_temp.play(p_mission uuid, p_student uuid, p_correct int, p_stage text) returns void language plpgsql as $$
declare i int; begin
 for i in 1..10 loop
  insert into public.activity_events(user_id,app_key,event_type,set_id,metadata) values (p_student,'vocabulary_paraphrase','question_attempt','unit-1',jsonb_build_object('mission_id',p_mission,'unit_number',1,'occurrence_id','u1_t'||i,'attempt_number',1,'outcome',case when i<=p_correct then 'correct' else 'try_again' end,'mission_kind','pathway','practice_family','pathway:meaning','mission_size',10,'pathway_id','meaning','pathway_stage',p_stage));
  if i > p_correct then
   insert into public.activity_events(user_id,app_key,event_type,set_id,metadata) values (p_student,'vocabulary_paraphrase','question_attempt','unit-1',jsonb_build_object('mission_id',p_mission,'unit_number',1,'occurrence_id','u1_t'||i,'attempt_number',2,'outcome','try_again','recovery',true,'mission_kind','pathway','practice_family','pathway:meaning','mission_size',10,'pathway_id','meaning','pathway_stage',p_stage));
  end if;
 end loop; end $$;

set role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
create temp table a as select public.start_vocabulary_mission(1,'pathway','meaning','recognise') j;
reset role;
select pg_temp.play((a.j->>'mission_id')::uuid,'11111111-1111-4111-8111-111111111111',9,'recognise') from a;
set role authenticated; select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
create temp table rec as select public.record_vocabulary_mission((a.j->>'mission_id')::uuid) j from a;
insert into r select 'E1 a server-issued, open, own mission records and gets the server-derived outcome', (j->>'score')='9' and (j->>'outcome')='pass', j::text from rec;
create temp table rec2 as select public.record_vocabulary_mission((a.j->>'mission_id')::uuid) j from a;
insert into r select 'E2 duplicate settlement of the closed mission is still idempotent', (j->>'duplicate')='true', j::text from rec2;

-- forged / client-minted id with plausible attempts
reset role;
select pg_temp.play('33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111',10,'recognise');
set role authenticated; select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
do $$ begin begin perform public.record_vocabulary_mission('33333333-3333-4333-8333-333333333333'); insert into r values ('E3 client-minted mission id cannot be recorded',false,'recorded'); exception when others then insert into r values ('E3 client-minted mission id cannot be recorded',true,sqlerrm); end; end $$;
reset role; insert into r select 'E3b no mission row was created', count(*)=0, count(*)::text from public.vocabulary_missions where mission_id='33333333-3333-4333-8333-333333333333';

-- another student's mission
set role authenticated; select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',false);
create temp table b as select public.start_vocabulary_mission(1,'pathway','meaning','match') j;
reset role;
select pg_temp.play((b.j->>'mission_id')::uuid,'22222222-2222-4222-8222-222222222222',10,'match') from b;
set role authenticated; select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
do $$ begin begin perform public.record_vocabulary_mission((select (j->>'mission_id')::uuid from b)); insert into r values ('E4 another student cannot record my mission',false,'recorded'); exception when others then insert into r values ('E4 another student cannot record my mission',true,sqlerrm); end; end $$;

-- abandoned mission cannot be recorded
set role authenticated; select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
create temp table c1 as select public.start_vocabulary_mission(1,'pathway','meaning','apply') j;
create temp table c2 as select public.start_vocabulary_mission(1,'pathway','meaning','apply','stage',true) j;   -- explicit NEW abandons c1
reset role;
select pg_temp.play((c1.j->>'mission_id')::uuid,'11111111-1111-4111-8111-111111111111',10,'apply') from c1;
set role authenticated; select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
do $$ begin begin perform public.record_vocabulary_mission((select (j->>'mission_id')::uuid from c1)); insert into r values ('E5 abandoned mission cannot be recorded',false,'recorded'); exception when others then insert into r values ('E5 abandoned mission cannot be recorded',true,sqlerrm); end; end $$;
reset role; select pg_temp.play((c2.j->>'mission_id')::uuid,'11111111-1111-4111-8111-111111111111',8,'apply') from c2;
set role authenticated; select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
create temp table crec as select public.record_vocabulary_mission((c2.j->>'mission_id')::uuid) j from c2;
insert into r select 'E6 the replacement (open) mission records normally', (j->>'score')='8' and (j->>'outcome')='pass', j::text from crec;

-- stale rule: an open mission untouched for 12h is replaced on the next start
reset role;
update public.vocabulary_mission_starts set last_resumed_at = now() - interval '13 hours'
 where status='open' and student_id='22222222-2222-4222-8222-222222222222';
set role authenticated; select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',false);
create temp table st as select public.start_vocabulary_mission(1,'pathway','meaning','match') j;
insert into r select 'E7 a 13-hour-old open mission is replaced (new id and seed, not resumed)', (st.j->>'mission_id')<>(b.j->>'mission_id') and (st.j->>'mission_seed')<>(b.j->>'mission_seed') and (st.j->>'resumed')='false', st.j::text from st, b;
reset role; insert into r select 'E7b the stale one is abandoned', status='abandoned', status from public.vocabulary_mission_starts where mission_id=(select (j->>'mission_id')::uuid from b);
set role authenticated; select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',false);
create temp table fresh as select public.start_vocabulary_mission(1,'pathway','meaning','match') j;
insert into r select 'E8 a fresh open mission resumes (same id and seed)', (fresh.j->>'mission_id')=(st.j->>'mission_id') and (fresh.j->>'mission_seed')=(st.j->>'mission_seed') and (fresh.j->>'resumed')='true', fresh.j::text from fresh, st;

-- a direct client insert is still impossible
set role authenticated; select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
do $$ begin begin insert into public.vocabulary_missions(mission_id,student_id,unit_number,mission_kind,pathway_id,pathway_stage,practice_family,mission_size,score,stars,best_streak,completed_at) values ('44444444-4444-4444-8444-444444444444','11111111-1111-4111-8111-111111111111',1,'pathway','meaning','match','pathway:meaning',10,10,3,10,now()); insert into r values ('E9 client cannot insert a mission row',false,''); exception when others then insert into r values ('E9 client cannot insert a mission row',true,sqlerrm); end; end $$;
reset role;
-- even the table owner cannot slip a mission in without a server-issued open start row
do $$ begin begin insert into public.vocabulary_missions(mission_id,student_id,unit_number,mission_kind,pathway_id,pathway_stage,practice_family,mission_size,score,stars,best_streak,completed_at) values ('55555555-5555-4555-8555-555555555555','11111111-1111-4111-8111-111111111111',1,'pathway','meaning','match','pathway:meaning',10,10,3,10,now()); insert into r values ('E10 a mission row without an open server start row is refused at the table',false,''); exception when others then insert into r values ('E10 a mission row without an open server start row is refused at the table',true,sqlerrm); end; end $$;

select label, case when ok then 'PASS' else 'FAIL' end as result, left(detail, 90) as detail from r order by label;

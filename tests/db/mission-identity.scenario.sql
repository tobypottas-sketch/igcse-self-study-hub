-- Behavioural scenario for 20261024120000_vocabulary_mission_identity.sql (17 checks, all PASS when last run on Postgres 16 with local-postgres-stubs.sql).
-- Apply order: stubs, 20261023120000_vocabulary_missions.sql, 20261024120000_vocabulary_mission_identity.sql, then this file. Synthetic ids only.
\set ON_ERROR_STOP off
insert into public.profiles(id) values ('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222');
create temp table r(label text, ok boolean, detail text);
grant all on r to authenticated;
set role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
create temp table s as select public.start_vocabulary_mission(1,'pathway','meaning','recognise') j;
create temp table s2 as select public.start_vocabulary_mission(1,'pathway','meaning','recognise') j;
insert into r select '1 new mission gets id+seed', (j->>'mission_id') is not null and length(j->>'mission_seed')>=16 and (j->>'resumed')='false', j::text from s;
insert into r select '2 resume keeps id AND seed', (s.j->>'mission_id')=(s2.j->>'mission_id') and (s.j->>'mission_seed')=(s2.j->>'mission_seed') and (s2.j->>'resumed')='true', s2.j::text from s, s2;
create temp table s3 as select public.start_vocabulary_mission(1,'pathway','meaning','recognise','stage',true) j;
insert into r select '3 explicit NEW after open => new id+seed', (s.j->>'mission_id')<>(s3.j->>'mission_id') and (s.j->>'mission_seed')<>(s3.j->>'mission_seed') and (s3.j->>'resumed')='false', s3.j::text from s, s3;
reset role; insert into r select '3b old mission abandoned', status='abandoned' and ended_at is not null, status from public.vocabulary_mission_starts where mission_id=(select (j->>'mission_id')::uuid from s);
set role authenticated; select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
create temp table s4 as select public.start_vocabulary_mission(1,'pathway','meaning','match') j;
insert into r select '4 other stage is a separate mission', (s4.j->>'mission_id')<>(s3.j->>'mission_id'), s4.j::text from s3, s4;
-- tamper attempts
do $$ begin begin insert into public.vocabulary_mission_starts(mission_id,mission_seed,student_id,unit_number,mission_kind,pathway_id,pathway_stage) values (gen_random_uuid(),'aaaaaaaaaaaaaaaaaaaa','11111111-1111-4111-8111-111111111111',1,'pathway','meaning','apply'); insert into r values ('5 client cannot insert its own start row',false,'inserted'); exception when others then insert into r values ('5 client cannot insert its own start row',true,sqlerrm); end; end $$;
do $$ begin begin update public.vocabulary_mission_starts set mission_seed='forgedforgedforged1'; insert into r values ('6 client cannot change a seed',false,'updated'); exception when others then insert into r values ('6 client cannot change a seed',true,sqlerrm); end; end $$;
do $$ begin begin perform public.start_vocabulary_mission(1,'pathway','meaning',null); insert into r values ('7 pathway start without stage rejected',false,''); exception when others then insert into r values ('7 pathway start without stage rejected',true,sqlerrm); end; end $$;
do $$ begin begin perform public.start_vocabulary_mission(99,'mixed'); insert into r values ('8 bad unit rejected',false,''); exception when others then insert into r values ('8 bad unit rejected',true,sqlerrm); end; end $$;
do $$ begin begin insert into public.vocabulary_missions(mission_id,student_id,unit_number,mission_kind,pathway_id,pathway_stage,practice_family,mission_size,score,stars,best_streak,completed_at,outcome) values (gen_random_uuid(),'11111111-1111-4111-8111-111111111111',1,'pathway','meaning','match','pathway:meaning',10,10,3,10,now(),'pass'); insert into r values ('9 client cannot insert a mission row',false,''); exception when others then insert into r values ('9 client cannot insert a mission row',true,sqlerrm); end; end $$;
-- another student cannot see or resume mine
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',false);
insert into r select '10 other student sees none of my starts', count(*)=0, count(*)::text from public.vocabulary_mission_starts;
create temp table o as select public.start_vocabulary_mission(1,'pathway','meaning','match') j;
insert into r select '10b other student gets their OWN mission for the same slot', (o.j->>'mission_id')<>(s4.j->>'mission_id') and (o.j->>'mission_seed')<>(s4.j->>'mission_seed'), o.j::text from o, s4;
reset role;
-- settle missions of different scores through the real function
create or replace function pg_temp.play(p_mission uuid, p_student uuid, p_correct int, p_stage text) returns void language plpgsql as $$
declare i int; begin
 for i in 1..10 loop
  if i <= p_correct then
   insert into public.activity_events(user_id,app_key,event_type,set_id,metadata) values (p_student,'vocabulary_paraphrase','question_attempt','unit-1',jsonb_build_object('mission_id',p_mission,'unit_number',1,'occurrence_id','u1_t'||i,'attempt_number',1,'outcome','correct','mission_kind','pathway','practice_family','pathway:meaning','mission_size',10,'pathway_id','meaning','pathway_stage',p_stage));
  else
   insert into public.activity_events(user_id,app_key,event_type,set_id,metadata) values (p_student,'vocabulary_paraphrase','question_attempt','unit-1',jsonb_build_object('mission_id',p_mission,'unit_number',1,'occurrence_id','u1_t'||i,'attempt_number',1,'outcome','try_again','mission_kind','pathway','practice_family','pathway:meaning','mission_size',10,'pathway_id','meaning','pathway_stage',p_stage));
   insert into public.activity_events(user_id,app_key,event_type,set_id,metadata) values (p_student,'vocabulary_paraphrase','question_attempt','unit-1',jsonb_build_object('mission_id',p_mission,'unit_number',1,'occurrence_id','u1_t'||i,'attempt_number',2,'outcome','try_again','recovery',true,'mission_kind','pathway','practice_family','pathway:meaning','mission_size',10,'pathway_id','meaning','pathway_stage',p_stage));
  end if;
 end loop; end $$;
select pg_temp.play((s4.j->>'mission_id')::uuid,'11111111-1111-4111-8111-111111111111',7,'match') from s4;
set role authenticated; select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
create temp table rec as select public.record_vocabulary_mission((s4.j->>'mission_id')::uuid) j from s4;
insert into r select '11 score 7 => outcome consolidate (server-derived)', (j->>'score')='7' and (j->>'outcome')='consolidate', j::text from rec;
create temp table rec2 as select public.record_vocabulary_mission((s4.j->>'mission_id')::uuid) j from s4;
insert into r select '12 duplicate settlement idempotent, same outcome', (j->>'duplicate')='true' and (j->>'outcome')='consolidate', j::text from rec2;
insert into r select '13 start row closed by settlement', (select status from public.vocabulary_mission_starts where mission_id=(s4.j->>'mission_id')::uuid)='completed', '' from s4;
create temp table nx as select public.start_vocabulary_mission(1,'pathway','meaning','match') j;
insert into r select '14 after completion the next start is a NEW id+seed', (nx.j->>'mission_id')<>(s4.j->>'mission_id') and (nx.j->>'mission_seed')<>(s4.j->>'mission_seed') and (nx.j->>'resumed')='false', nx.j::text from nx, s4;
-- incomplete mission cannot be recorded
reset role;
select pg_temp.play((s3.j->>'mission_id')::uuid,'11111111-1111-4111-8111-111111111111',10,'recognise') from s3;
delete from public.activity_events where metadata->>'mission_id'=(select j->>'mission_id' from s3) and metadata->>'occurrence_id' in ('u1_t9','u1_t10');
set role authenticated; select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
do $$ begin begin perform public.record_vocabulary_mission((select (j->>'mission_id')::uuid from s3)); insert into r values ('15 incomplete mission cannot be recorded',false,''); exception when others then insert into r values ('15 incomplete mission cannot be recorded',true,sqlerrm); end; end $$;
-- outcome boundaries via the trigger (superuser inserts with a forged outcome)
reset role;
insert into public.vocabulary_missions(mission_id,student_id,unit_number,mission_kind,pathway_id,pathway_stage,practice_family,mission_size,score,stars,best_streak,completed_at,outcome)
select gen_random_uuid(),'11111111-1111-4111-8111-111111111111',1,'pathway','meaning','apply','pathway:meaning',10,sc,0,0,now(),'pass' from generate_series(0,10) sc;
insert into r select '16 trigger derives outcome for every score and discards a forged value', bool_and(outcome = case when score>=8 then 'pass' when score>=6 then 'consolidate' else 'recovery' end) and count(*)=11, string_agg(score||':'||outcome, ' ' order by score) from public.vocabulary_missions where pathway_stage='apply';
select label, case when ok then 'PASS' else 'FAIL' end res, left(detail,110) detail from r order by label;

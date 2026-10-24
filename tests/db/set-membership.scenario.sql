-- Behavioural scenario for 20261024170000_vocabulary_set_membership.sql: a Set advances only when the mission's finished targets ARE the Set's
-- authoritative members. Synthetic ids only (Set 1 = u1_t1..u1_t10, Set 2 = u1_t11..u1_t20). Run through tests/db/run-local-scenarios.sh.
\set ON_ERROR_STOP off
insert into public.profiles(id) select ('bbbbbbbb-0000-4000-8000-0000000000' || lpad(g::text,2,'0'))::uuid from generate_series(1,30) g;
create temp table r(label text, ok boolean, detail text);
grant all on r to authenticated, anon;

create or replace function pg_temp.sid(n int) returns uuid language sql as $$ select ('bbbbbbbb-0000-4000-8000-0000000000' || lpad(n::text,2,'0'))::uuid $$;
create or replace function pg_temp.occs(a int, b int) returns text[] language sql as $$ select array_agg('u1_t' || i order by i) from generate_series(a,b) i $$;

-- Starts the Set mission the server hands out, writes the given attempts as the student's graded events, then records the mission.
-- p_missed: occurrences answered wrong first time (then a recovery re-ask, also wrong). p_extra: extra repeat asks of a target (clean, different question).
create or replace function pg_temp.play(p_student uuid, p_pathway text, p_occs text[], p_missed text[] default '{}', p_extra text[] default '{}',
                                        p_claim_pathway text default null, p_claim_stage text default null, p_set int default null, p_record_as uuid default null)
returns jsonb language plpgsql as $$
declare j jsonb; m uuid; o text; res jsonb; err text;
begin
  perform set_config('request.jwt.claim.sub', p_student::text, false);
  j := public.start_vocabulary_mission(1, 'pathway', p_pathway, 'recognise', 'stage', false, true, p_set);
  m := (j->>'mission_id')::uuid;
  foreach o in array p_occs loop
    insert into public.activity_events(user_id,app_key,event_type,set_id,metadata) values (p_student,'vocabulary_paraphrase','question_attempt','unit-1',
      jsonb_build_object('mission_id',m,'unit_number',1,'occurrence_id',o,'attempt_number',1,'outcome',case when o = any(p_missed) then 'try_again' else 'correct' end,
        'mission_kind','pathway','practice_family','recommended','mission_size',10,'pathway_id',coalesce(p_claim_pathway,p_pathway),'pathway_stage',coalesce(p_claim_stage,j->>'pathway_stage')));
    if o = any(p_missed) then
      insert into public.activity_events(user_id,app_key,event_type,set_id,metadata) values (p_student,'vocabulary_paraphrase','question_attempt','unit-1',
        jsonb_build_object('mission_id',m,'unit_number',1,'occurrence_id',o,'attempt_number',2,'outcome','try_again','recovery',true,
          'mission_kind','pathway','practice_family','recommended','mission_size',10,'pathway_id',coalesce(p_claim_pathway,p_pathway),'pathway_stage',coalesce(p_claim_stage,j->>'pathway_stage')));
    end if;
  end loop;
  foreach o in array p_extra loop       -- a repeat ask of a member (another question for the same target, answered wrong first time)
    insert into public.activity_events(user_id,app_key,event_type,set_id,metadata) values (p_student,'vocabulary_paraphrase','question_attempt','unit-1',
      jsonb_build_object('mission_id',m,'unit_number',1,'occurrence_id',o,'attempt_number',1,'outcome','try_again',
        'mission_kind','pathway','practice_family','recommended','mission_size',10,'pathway_id',coalesce(p_claim_pathway,p_pathway),'pathway_stage',coalesce(p_claim_stage,j->>'pathway_stage')));
  end loop;
  begin
    perform set_config('request.jwt.claim.sub', coalesce(p_record_as, p_student)::text, false);
    res := public.record_vocabulary_mission(m);
  exception when others then
    get stacked diagnostics err = message_text;
    res := jsonb_build_object('error', err);
  end;
  perform set_config('request.jwt.claim.sub', p_student::text, false);
  return jsonb_build_object('mission', m, 'start', j, 'record', res);
end $$;

create or replace function pg_temp.sets(p_student uuid, p_pathway text) returns text language sql as $$
  select coalesce(string_agg(set_number || ':' || stage || '/' || phase || '/' || status, ' ' order by set_number), '(none)')
  from public.vocabulary_pathway_sets where student_id = p_student and unit_number = 1 and pathway_id = p_pathway $$;
create or replace function pg_temp.rejected(p_student uuid, p_pathway text) returns int language sql as $$
  select count(*)::int from public.vocabulary_pathway_sets s, jsonb_array_elements(s.history) h
  where s.student_id = p_student and s.pathway_id = p_pathway and h->>'rejected' = 'targets_not_set_members' $$;

-- M0 the seeding itself: every Set has exactly ten members, authored positions 1..10
insert into r select 'M0 synthetic members: 12 Sets of 10', (select count(*) from public.vocabulary_set_members) = 120 and not exists (select 1 from public.vocabulary_set_members group by unit_number, pathway_id, set_number having count(*) <> 10), '';

-- V1 valid: the ten members in a different order -> advances Recognise -> Match
create temp table v1 as select pg_temp.play(pg_temp.sid(1), 'meaning', array['u1_t7','u1_t3','u1_t10','u1_t1','u1_t5','u1_t2','u1_t9','u1_t4','u1_t8','u1_t6']) j;
insert into r select 'V1 the ten Set members in any order advance the Set', pg_temp.sets(pg_temp.sid(1),'meaning') = '1:match/stage/active', pg_temp.sets(pg_temp.sid(1),'meaning');
-- V2 duplicate settlement is idempotent
do $$ declare m uuid := (select (j->>'mission')::uuid from v1); d jsonb; begin
  perform set_config('request.jwt.claim.sub', pg_temp.sid(1)::text, false);
  d := public.record_vocabulary_mission(m);
  insert into r values ('V2 duplicate settlement is idempotent (no second advance)', (d->>'duplicate')='true' and pg_temp.sets(pg_temp.sid(1),'meaning') = '1:match/stage/active', pg_temp.sets(pg_temp.sid(1),'meaning'));
end $$;

-- I1 nine Set targets only
select pg_temp.play(pg_temp.sid(2), 'meaning', pg_temp.occs(1,9));
insert into r select 'I1 nine Set targets: the mission cannot be recorded and nothing advances', pg_temp.sets(pg_temp.sid(2),'meaning') = '1:recognise/stage/active' and not exists (select 1 from public.vocabulary_missions where student_id = pg_temp.sid(2)), pg_temp.sets(pg_temp.sid(2),'meaning');
-- I2 ten attempts, nine distinct targets (one target asked twice)
select pg_temp.play(pg_temp.sid(3), 'meaning', pg_temp.occs(1,9), '{}', array['u1_t1']);
insert into r select 'I2 ten attempts but nine distinct targets: nothing advances', pg_temp.sets(pg_temp.sid(3),'meaning') = '1:recognise/stage/active' and not exists (select 1 from public.vocabulary_missions where student_id = pg_temp.sid(3)), pg_temp.sets(pg_temp.sid(3),'meaning');
-- I3 nine Set targets + one outside target
create temp table i3 as select pg_temp.play(pg_temp.sid(4), 'meaning', pg_temp.occs(1,9) || array['u1_t99']) j;
insert into r select 'I3 nine Set targets + one outside target: evidence kept, Set does not advance', pg_temp.sets(pg_temp.sid(4),'meaning') = '1:recognise/stage/active' and pg_temp.rejected(pg_temp.sid(4),'meaning') = 1
  and (select count(*) from public.activity_events where user_id = pg_temp.sid(4)) = 10, pg_temp.sets(pg_temp.sid(4),'meaning');
-- I4 ten completely different targets
select pg_temp.play(pg_temp.sid(5), 'meaning', pg_temp.occs(21,30));
insert into r select 'I4 ten targets from outside the Set: no advance', pg_temp.sets(pg_temp.sid(5),'meaning') = '1:recognise/stage/active' and pg_temp.rejected(pg_temp.sid(5),'meaning') = 1, pg_temp.sets(pg_temp.sid(5),'meaning');
-- I5 right targets, wrong Set id: Set 1 is Maintain, Set 2 is open, and the mission plays Set 1's words
do $$ declare i int; begin
  for i in 1..5 loop perform pg_temp.play(pg_temp.sid(6), 'meaning', pg_temp.occs(1,10)); end loop;
end $$;
insert into r select 'I5a Set 1 reached Maintain through valid missions', pg_temp.sets(pg_temp.sid(6),'meaning') = '1:mastery/stage/maintain', pg_temp.sets(pg_temp.sid(6),'meaning');
select pg_temp.play(pg_temp.sid(6), 'meaning', pg_temp.occs(1,10), '{}', '{}', null, null, 2);
insert into r select 'I5 Set 2 mission played with Set 1 words: Set 2 does not advance', pg_temp.sets(pg_temp.sid(6),'meaning') = '1:mastery/stage/maintain 2:recognise/stage/active' and pg_temp.rejected(pg_temp.sid(6),'meaning') = 1, pg_temp.sets(pg_temp.sid(6),'meaning');
-- I6 right targets, wrong pathway claimed by the attempts
select pg_temp.play(pg_temp.sid(7), 'meaning', pg_temp.occs(1,10), '{}', '{}', 'context');
insert into r select 'I6 attempts claim another pathway: no advance', pg_temp.sets(pg_temp.sid(7),'meaning') = '1:recognise/stage/active', pg_temp.sets(pg_temp.sid(7),'meaning');
-- I7 right targets, wrong stage claimed
select pg_temp.play(pg_temp.sid(8), 'meaning', pg_temp.occs(1,10), '{}', '{}', null, 'mastery');
insert into r select 'I7 attempts claim another stage: no advance', pg_temp.sets(pg_temp.sid(8),'meaning') = '1:recognise/stage/active', pg_temp.sets(pg_temp.sid(8),'meaning');
-- I8 another student's mission: student 10 tries to record student 9's mission
create temp table i8 as select pg_temp.play(pg_temp.sid(9), 'meaning', pg_temp.occs(1,10), '{}', '{}', null, null, null, pg_temp.sid(10)) j;
insert into r select 'I8 another student cannot settle my mission', pg_temp.sets(pg_temp.sid(9),'meaning') = '1:recognise/stage/active' and (select j->'record'->>'error' from i8) is not null and pg_temp.sets(pg_temp.sid(10),'meaning') = '(none)', (select j->'record'->>'error' from i8);
-- I9 abandoned mission: a NEW start abandons the first; the first can no longer be settled into the Set
do $$ declare a jsonb; m1 uuid; b jsonb; res jsonb; i int; begin
  perform set_config('request.jwt.claim.sub', pg_temp.sid(11)::text, false);
  a := public.start_vocabulary_mission(1,'pathway','meaning','recognise','stage',false,true,null); m1 := (a->>'mission_id')::uuid;
  b := public.start_vocabulary_mission(1,'pathway','meaning','recognise','stage',true,true,null);
  for i in 1..10 loop insert into public.activity_events(user_id,app_key,event_type,set_id,metadata) values (pg_temp.sid(11),'vocabulary_paraphrase','question_attempt','unit-1',
    jsonb_build_object('mission_id',m1,'unit_number',1,'occurrence_id','u1_t'||i,'attempt_number',1,'outcome','correct','mission_kind','pathway','practice_family','recommended','mission_size',10,'pathway_id','meaning','pathway_stage','recognise')); end loop;
  begin res := public.record_vocabulary_mission(m1); exception when others then res := jsonb_build_object('error', sqlerrm); end;
  insert into r values ('I9 an abandoned mission cannot advance the Set', pg_temp.sets(pg_temp.sid(11),'meaning') = '1:recognise/stage/active', coalesce(res::text, ''));
end $$;
-- I10 replayed attempts cannot manufacture completeness: the same nine targets asked twice each
select pg_temp.play(pg_temp.sid(12), 'meaning', pg_temp.occs(1,9), '{}', pg_temp.occs(1,9));
insert into r select 'I10 replayed duplicate attempts do not create a tenth target', pg_temp.sets(pg_temp.sid(12),'meaning') = '1:recognise/stage/active', pg_temp.sets(pg_temp.sid(12),'meaning');
-- I11 a stage mission that substitutes ONE outside target for a member never advances, at any stage
do $$ declare i int; begin
  for i in 1..4 loop perform pg_temp.play(pg_temp.sid(13), 'meaning', array_remove(pg_temp.occs(1,10),'u1_t10') || array['u1_t55']); end loop;
  insert into r values ('I11 four substituted missions: still Recognise (one member missing, one outsider)', pg_temp.sets(pg_temp.sid(13),'meaning') = '1:recognise/stage/active' and pg_temp.rejected(pg_temp.sid(13),'meaning') = 4, pg_temp.sets(pg_temp.sid(13),'meaning'));
end $$;

-- C: Consolidate. 7/10 first (t1..t3 missed) -> pending Consolidate with weak = t1..t3
select pg_temp.play(pg_temp.sid(14), 'context', pg_temp.occs(1,10), array['u1_t1','u1_t2','u1_t3']);
insert into r select 'C0 7/10 -> Consolidate pending with the three weak targets', pg_temp.sets(pg_temp.sid(14),'context') = '1:recognise/consolidate/active' and (select weak_target_ids from public.vocabulary_pathway_sets where student_id = pg_temp.sid(14)) = array['u1_t1','u1_t2','u1_t3'], pg_temp.sets(pg_temp.sid(14),'context');
-- C1 outside target in place of a non-weak member -> rejected, still Consolidate
select pg_temp.play(pg_temp.sid(14), 'context', array_remove(pg_temp.occs(1,10),'u1_t10') || array['u1_t77']);
insert into r select 'C1 Consolidate with an outside target: rejected, still Consolidate', pg_temp.sets(pg_temp.sid(14),'context') = '1:recognise/consolidate/active' and pg_temp.rejected(pg_temp.sid(14),'context') = 1, pg_temp.sets(pg_temp.sid(14),'context');
-- C2 a required weak target missing (replaced by an outside target) -> rejected
select pg_temp.play(pg_temp.sid(14), 'context', array_remove(pg_temp.occs(1,10),'u1_t1') || array['u1_t78']);
insert into r select 'C2 Consolidate missing a weak target: rejected', pg_temp.sets(pg_temp.sid(14),'context') = '1:recognise/consolidate/active' and pg_temp.rejected(pg_temp.sid(14),'context') = 2, pg_temp.sets(pg_temp.sid(14),'context');
-- C3 valid Consolidate: weak targets first, the rest of the SAME Set, the weak targets asked once more with a different question -> advances
select pg_temp.play(pg_temp.sid(14), 'context', array['u1_t1','u1_t2','u1_t3','u1_t4','u1_t5','u1_t6','u1_t7','u1_t8','u1_t9','u1_t10'], '{}', array['u1_t1','u1_t2','u1_t3']);
insert into r select 'C3 valid Consolidate (weak targets repeated, all in the Set): advances to Match', pg_temp.sets(pg_temp.sid(14),'context') = '1:match/stage/active', pg_temp.sets(pg_temp.sid(14),'context');

-- R: Recovery. 4/10 -> Recovery pending
select pg_temp.play(pg_temp.sid(15), 'meaning', pg_temp.occs(1,10), array['u1_t1','u1_t2','u1_t3','u1_t4','u1_t5','u1_t6']);
insert into r select 'R0 4/10 -> Recovery pending', pg_temp.sets(pg_temp.sid(15),'meaning') = '1:recognise/recovery/active', pg_temp.sets(pg_temp.sid(15),'meaning');
-- R1 outside target: rejected, still Recovery
select pg_temp.play(pg_temp.sid(15), 'meaning', array_remove(pg_temp.occs(1,10),'u1_t10') || array['u1_t88']);
insert into r select 'R1 Recovery with an outside target: rejected, still Recovery', pg_temp.sets(pg_temp.sid(15),'meaning') = '1:recognise/recovery/active' and pg_temp.rejected(pg_temp.sid(15),'meaning') = 1, pg_temp.sets(pg_temp.sid(15),'meaning');
-- R2 valid Recovery (weak first, repeats of weak members allowed): never advances; the fresh stage mission follows
select pg_temp.play(pg_temp.sid(15), 'meaning', array['u1_t1','u1_t2','u1_t3','u1_t4','u1_t5','u1_t6','u1_t7','u1_t8','u1_t9','u1_t10'], '{}', array['u1_t1','u1_t2']);
insert into r select 'R2 valid Recovery never advances: same stage, fresh mission next', pg_temp.sets(pg_temp.sid(15),'meaning') = '1:recognise/fresh/active', pg_temp.sets(pg_temp.sid(15),'meaning');
-- R3 the finite escape is unchanged: the fresh mission over the Set's members advances at any score
select pg_temp.play(pg_temp.sid(15), 'meaning', pg_temp.occs(1,10), array['u1_t1','u1_t2','u1_t3','u1_t4','u1_t5','u1_t6','u1_t7','u1_t8','u1_t9','u1_t10']);
insert into r select 'R3 finite escape unchanged: fresh mission advances regardless of score', pg_temp.sets(pg_temp.sid(15),'meaning') = '1:match/stage/active', pg_temp.sets(pg_temp.sid(15),'meaning');

-- G: guards. A Set row cannot exist without its ten members, even when the start RPC is asked for it
do $$ declare ok boolean; i int; begin
  for i in 1..5 loop perform pg_temp.play(pg_temp.sid(16), 'spelling_recall', pg_temp.occs(1,10)); end loop;
  delete from public.vocabulary_set_members where unit_number = 1 and pathway_id = 'spelling_recall' and set_number = 2 and position = 10;
  perform set_config('request.jwt.claim.sub', pg_temp.sid(16)::text, false);
  begin perform public.start_vocabulary_mission(1,'pathway','spelling_recall','recognise','stage',false,true,2); ok := false; exception when others then ok := sqlerrm like '%No further Set%'; end;
  insert into public.vocabulary_set_members values (1,'spelling_recall',2,10,'u1_t20');
  insert into r values ('G1 a Set without ten members cannot be opened', ok and pg_temp.sets(pg_temp.sid(16),'spelling_recall') = '1:mastery/stage/maintain', pg_temp.sets(pg_temp.sid(16),'spelling_recall'));
end $$;
-- G2 students read members but cannot change them
set role authenticated;
do $$ declare n int; ok boolean := true; begin
  select count(*) into n from public.vocabulary_set_members;
  begin delete from public.vocabulary_set_members; ok := false; exception when others then null; end;
  begin insert into public.vocabulary_set_members values (1,'meaning',9,1,'u1_t1'); ok := false; exception when others then null; end;
  begin update public.vocabulary_set_members set occurrence_id = 'u1_t999'; ok := false; exception when others then null; end;
  insert into r values ('G2 authenticated can read members (' || n || ') but not write them', n > 0 and ok, '');
end $$;
reset role;
set role anon;
do $$ declare ok boolean := false; begin begin perform count(*) from public.vocabulary_set_members; exception when others then ok := true; end; insert into r values ('G3 anon cannot read members', ok, ''); end $$;
reset role;

select label || ' | ' || case when ok then 't' else 'f' end || ' | ' || coalesce(detail,'') from r order by 1;
select 'FAILED=' || count(*) filter (where not ok) || ' TOTAL=' || count(*) from r;

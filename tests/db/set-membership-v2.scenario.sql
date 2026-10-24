-- Behavioural scenario for 20261025130000_vocabulary_set_membership_v2.sql (guarded Set replacement: Job 9 = Word Families Sets 1-2). Throwaway local Postgres only.
-- Run through tests/db/run-local-scenarios.sh. Synthetic student ids; no private data.
\set ON_ERROR_STOP off
create temp table r(label text, ok boolean, detail text);
grant all on r to authenticated, anon;
-- restore the REAL seed (the runner replaced it with synthetic members)
delete from public.vocabulary_set_members;
\i supabase/migrations/20261024170000_vocabulary_set_membership.sql
select count(*) as seeded_other_rows from public.vocabulary_set_members where pathway_id<>'word_families' \gset
select string_agg(occurrence_id, ',' order by position) as seed_wf3 from public.vocabulary_set_members where pathway_id='word_families' and set_number=3 \gset
insert into r select 'seed has three word families sets of ten', (select count(*) from public.vocabulary_set_members where pathway_id='word_families')=30, '';
insert into r select 'seed lists permit (no eligible family) in word families set 1', exists(select 1 from public.vocabulary_set_members where pathway_id='word_families' and set_number=1 and occurrence_id='u1_06_permit'), '';
\i supabase/migrations/20261025130000_vocabulary_set_membership_v2.sql
insert into r select 'delta removes permit, urge and demand from word families', not exists(select 1 from public.vocabulary_set_members where pathway_id='word_families' and occurrence_id in ('u1_06_permit','u1_08_urge','u1_10_demand')), '';
insert into r select 'word families sets 1 and 2 hold exactly ten distinct members each', (select count(distinct occurrence_id) from public.vocabulary_set_members where pathway_id='word_families' and set_number=1)=10 and (select count(distinct occurrence_id) from public.vocabulary_set_members where pathway_id='word_families' and set_number=2)=10, '';
insert into r select 'word families set 3 is removed by the delta (no rows remain)', (select count(*) from public.vocabulary_set_members where pathway_id='word_families' and set_number=3)=0, '';
insert into r select 'final word families membership is exactly Sets 1-2 (20 rows)', (select count(*) from public.vocabulary_set_members where pathway_id='word_families')=20, '';
insert into r select 'final Unit 1 membership is exactly 200 authoritative rows', (select count(*) from public.vocabulary_set_members where unit_number=1)=200, '';
-- an unavailable third Set can no longer be opened (the before-insert trigger needs members)
do $$ begin
  insert into public.profiles(id) values ('cccccccc-0000-4000-8000-000000000002');
  begin
    insert into public.vocabulary_pathway_sets(student_id, unit_number, pathway_id, set_number) values ('cccccccc-0000-4000-8000-000000000002', 1, 'word_families', 3);
    insert into r values ('word families set 3 cannot be opened after the delta', false, 'insert succeeded');
  exception when others then
    insert into r values ('word families set 3 cannot be opened after the delta', true, sqlerrm);
  end;
end $$;
insert into r select 'every other pathway is untouched (meaning, context, precision, spelling = 180 rows)', (select count(*) from public.vocabulary_set_members where pathway_id<>'word_families')=:seeded_other_rows and :seeded_other_rows=180, '';
insert into r select 'meaning set 4 still holds historic and competitor (no Meaning change in Job 9)', (select count(*) from public.vocabulary_set_members where pathway_id='meaning' and set_number=4 and occurrence_id in ('u1_36_competitor','u1_42_historic'))=2, '';
-- idempotent: running again is harmless when the Sets are unstarted
\i supabase/migrations/20261025130000_vocabulary_set_membership_v2.sql
insert into r select 'delta is re-runnable while unstarted', (select count(*) from public.vocabulary_set_members where pathway_id='word_families' and set_number in (1,2))=20, '';
-- a started Set is never rewritten: the migration raises. First, a REMOVED Set that was started also aborts the whole migration:
delete from public.vocabulary_set_members where pathway_id='word_families' and set_number=3;
insert into public.vocabulary_set_members(unit_number, pathway_id, set_number, position, occurrence_id) select 1,'word_families',3,g,'u1_98_probe'||g from generate_series(1,10) g;
insert into public.profiles(id) values ('cccccccc-0000-4000-8000-000000000001');
insert into public.vocabulary_pathway_sets(student_id, unit_number, pathway_id, set_number) values ('cccccccc-0000-4000-8000-000000000001', 1, 'word_families', 3);
\i supabase/migrations/20261025130000_vocabulary_set_membership_v2.sql
insert into r select 'started removed set: migration raised and the set 3 rows are untouched', (select count(*) from public.vocabulary_set_members where pathway_id='word_families' and set_number=3)=10, '';
delete from public.vocabulary_pathway_sets where student_id='cccccccc-0000-4000-8000-000000000001';
delete from public.profiles where id='cccccccc-0000-4000-8000-000000000001';
\i supabase/migrations/20261025130000_vocabulary_set_membership_v2.sql
insert into r select 'unstarted removed set is deleted again on re-run', (select count(*) from public.vocabulary_set_members where pathway_id='word_families' and set_number=3)=0, '';
insert into public.profiles(id) values ('cccccccc-0000-4000-8000-000000000001');
insert into public.vocabulary_pathway_sets(student_id, unit_number, pathway_id, set_number) values ('cccccccc-0000-4000-8000-000000000001', 1, 'word_families', 2);
update public.vocabulary_set_members set occurrence_id = 'u1_99_probe' where pathway_id='word_families' and set_number=2 and position=10;
\i supabase/migrations/20261025130000_vocabulary_set_membership_v2.sql
insert into r select 'started set: migration raised and left members as they were', exists(select 1 from public.vocabulary_set_members where pathway_id='word_families' and set_number=2 and occurrence_id='u1_99_probe'), 'the probe member must still be there';
select label || ' => ' || case when ok then 'PASS' else 'FAIL ' || detail end from r;
-- leave the shared scratch database exactly as the other scenarios expect it (synthetic members, no probe rows), so run order does not matter
delete from public.vocabulary_pathway_sets where student_id = 'cccccccc-0000-4000-8000-000000000001';
delete from public.profiles where id in ('cccccccc-0000-4000-8000-000000000001','cccccccc-0000-4000-8000-000000000002');
\i tests/db/set-members.synthetic.sql

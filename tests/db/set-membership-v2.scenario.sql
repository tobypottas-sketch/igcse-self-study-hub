-- Behavioural scenario for 20261025130000_vocabulary_set_membership_v2.sql (guarded Set replacement). Throwaway local Postgres only.
-- Run through tests/db/run-local-scenarios.sh. Synthetic student ids; no private data.
\set ON_ERROR_STOP off
create temp table r(label text, ok boolean, detail text);
grant all on r to authenticated, anon;
-- restore the REAL seed (the runner replaced it with synthetic members)
delete from public.vocabulary_set_members;
\i supabase/migrations/20261024170000_vocabulary_set_membership.sql
insert into r select 'seed has historic in meaning set 4', exists(select 1 from public.vocabulary_set_members where pathway_id='meaning' and set_number=4 and occurrence_id='u1_42_historic'), '';
select count(*) as seeded_wf_rows from public.vocabulary_set_members where pathway_id='word_families' \gset
\i supabase/migrations/20261025130000_vocabulary_set_membership_v2.sql
insert into r select 'delta swaps competitor+historic for selection+produce', not exists(select 1 from public.vocabulary_set_members where pathway_id='meaning' and set_number=4 and occurrence_id in ('u1_36_competitor','u1_42_historic'))
  and (select count(*) from public.vocabulary_set_members where pathway_id='meaning' and set_number=4 and occurrence_id in ('u1_43_selection','u1_44_produce'))=2, '';
insert into r select 'meaning set 4 still has exactly ten distinct members', (select count(distinct occurrence_id) from public.vocabulary_set_members where pathway_id='meaning' and set_number=4)=10 and (select count(*) from public.vocabulary_set_members where pathway_id='meaning' and set_number=4)=10, '';
insert into r select 'other sets untouched (meaning 1-3, context, precision, spelling counts unchanged)', (select count(*) from public.vocabulary_set_members where pathway_id<>'word_families')=180, '';
insert into r select 'word families seed rows are left in place', (select count(*) from public.vocabulary_set_members where pathway_id='word_families')=:seeded_wf_rows, '';
-- idempotent: running again is harmless when the Set is unstarted
\i supabase/migrations/20261025130000_vocabulary_set_membership_v2.sql
insert into r select 'delta is re-runnable while unstarted', (select count(*) from public.vocabulary_set_members where pathway_id='meaning' and set_number=4)=10, '';
-- a started Set is never rewritten: the migration raises
insert into public.profiles(id) values ('cccccccc-0000-4000-8000-000000000001');
insert into public.vocabulary_pathway_sets(student_id, unit_number, pathway_id, set_number) values ('cccccccc-0000-4000-8000-000000000001', 1, 'meaning', 4);
update public.vocabulary_set_members set occurrence_id = 'u1_99_probe' where pathway_id='meaning' and set_number=4 and position=10;
\i supabase/migrations/20261025130000_vocabulary_set_membership_v2.sql
insert into r select 'started set: migration raised and left members as they were', exists(select 1 from public.vocabulary_set_members where pathway_id='meaning' and set_number=4 and occurrence_id='u1_99_probe'), '';
select label || ' => ' || case when ok then 'PASS' else 'FAIL ' || detail end from r;
-- leave the shared scratch database exactly as the other scenarios expect it (synthetic members, no probe rows), so run order does not matter
delete from public.vocabulary_pathway_sets where student_id = 'cccccccc-0000-4000-8000-000000000001';
delete from public.profiles where id = 'cccccccc-0000-4000-8000-000000000001';
\i tests/db/set-members.synthetic.sql

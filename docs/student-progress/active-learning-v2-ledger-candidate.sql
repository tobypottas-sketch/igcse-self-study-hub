-- DESIGN CANDIDATE ONLY. Not a migration. Run in isolated PostgreSQL first.
-- A separate V2 ledger prevents historical estimates becoming verified V2 time.
create table public.active_learning_intervals_v2 (
  student_id uuid not null references public.profiles(id),
  batch_id uuid not null,
  item_index integer not null check(item_index between 0 and 119),
  class_id uuid references public.classes(id),
  app_key text not null check(app_key in ('vocabulary_paraphrase','reading','listening','paraphrasing','essay_writing','email_writing','review_writing')),
  unit_id text, pathway_id text, activity_id text not null, mode text,
  started_at timestamptz not null, ended_at timestamptz not null,
  received_at timestamptz not null default now(),
  primary key(student_id,batch_id,item_index),
  check(ended_at > started_at and ended_at-started_at <= interval '30 seconds')
);
alter table public.active_learning_intervals_v2 enable row level security;
revoke all on public.active_learning_intervals_v2 from public, anon, authenticated;
grant select on public.active_learning_intervals_v2 to authenticated;
create policy active_learning_v2_read on public.active_learning_intervals_v2
for select to authenticated using (
  (select private."current_role"()) is not null and (
    student_id=(select auth.uid()) or
    (select private."current_role"())='admin' or
    ((select private."current_role"())='teacher' and
      (select private.teacher_can_access_student(active_learning_intervals_v2.student_id)))
  )
);
-- No client INSERT grant. Ingestion must be a separately reviewed authenticated
-- server endpoint, deriving identity and membership server-side, validating the
-- published learning context and enforcing replay-safe atomic writes.
-- Reporting must union intervals across ALL modules/devices BEFORE aggregation.
-- PostgreSQL 14+ range_agg gives a multirange union, including partial overlaps.
-- Clip to reporting period and enrolment window before union.
-- Example total (internal query, not exposed view):
-- select student_id, sum(extract(epoch from upper(r)-lower(r))) as seconds
-- from (select student_id, range_agg(tstzrange(started_at,ended_at,'[)')) as spans
--       from public.active_learning_intervals_v2 group by student_id) s
-- cross join lateral unnest(s.spans) r group by student_id;

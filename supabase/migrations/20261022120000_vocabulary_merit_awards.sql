-- Merits: one row per merit a teacher has awarded. Merits are EARNED by progress that is already
-- stored (10 passed pathway stages = 1 merit) and are worked out on the teacher side; this table
-- only remembers which ones have been handed out. Students cannot write to it.
create table if not exists public.vocabulary_merit_awards (
  student_id uuid not null references public.profiles(id) on delete cascade,
  merit_number integer not null check (merit_number >= 1 and merit_number <= 1000),
  awarded_by uuid not null references public.profiles(id) on delete restrict,
  awarded_at timestamptz not null default now(),
  primary key (student_id, merit_number)
);

alter table public.vocabulary_merit_awards enable row level security;

revoke all on public.vocabulary_merit_awards from anon, authenticated;
grant select, insert on public.vocabulary_merit_awards to authenticated;

create policy vocabulary_merit_awards_select on public.vocabulary_merit_awards
for select to authenticated
using (
  student_id = (select auth.uid())
  or (select private.current_role()) = 'admin'::public.user_role
  or (
    (select private.current_role()) = 'teacher'::public.user_role
    and (select private.teacher_can_access_student(student_id))
  )
);

create policy vocabulary_merit_awards_insert on public.vocabulary_merit_awards
for insert to authenticated
with check (
  awarded_by = (select auth.uid())
  and (
    (select private.current_role()) = 'admin'::public.user_role
    or (
      (select private.current_role()) = 'teacher'::public.user_role
      and (select private.teacher_can_access_student(student_id))
    )
  )
);

create index if not exists vocabulary_merit_awards_awarded_by_idx
on public.vocabulary_merit_awards(awarded_by);

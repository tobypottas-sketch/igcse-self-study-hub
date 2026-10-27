create table public.vocabulary_unit_check_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  unit_number integer not null check (unit_number > 0),
  form_id text not null check (form_id in ('A','B','C')),
  attempt_number integer not null check (attempt_number between 1 and 3),
  score integer not null,
  max_score integer not null check (max_score = 10),
  completed_at timestamptz not null default now(),
  unique (student_id, unit_number, attempt_number),
  unique (student_id, unit_number, form_id),
  check (score between 0 and max_score),
  check (
    (attempt_number = 1 and form_id = 'A') or
    (attempt_number = 2 and form_id = 'B') or
    (attempt_number = 3 and form_id = 'C')
  )
);

create index vocabulary_unit_check_attempts_student_unit_idx
on public.vocabulary_unit_check_attempts(student_id, unit_number, completed_at desc);

alter table public.vocabulary_unit_check_attempts enable row level security;

revoke all on public.vocabulary_unit_check_attempts from anon, authenticated;
grant select, insert on public.vocabulary_unit_check_attempts to authenticated;

create policy vocabulary_unit_check_attempts_select_own
on public.vocabulary_unit_check_attempts
for select to authenticated
using (student_id = (select auth.uid()));

create policy vocabulary_unit_check_attempts_insert_own
on public.vocabulary_unit_check_attempts
for insert to authenticated
with check (
  student_id = (select auth.uid())
  and (select private.current_role()) = 'student'::public.user_role
);

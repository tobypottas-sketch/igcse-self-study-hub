-- No AI calls or activity/XP changes. Only explicit student submissions are stored.
create table public.student_writing_submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  app_key text not null check (app_key in ('review_writing','email_writing','essay_writing')),
  task text not null check (char_length(btrim(task)) between 1 and 12000),
  response text not null check (char_length(btrim(response)) between 1 and 30000),
  submitted_at timestamptz not null default now()
);
alter table public.student_writing_submissions enable row level security;
revoke all on public.student_writing_submissions from public, anon, authenticated;
grant select on public.student_writing_submissions to authenticated;
grant insert (app_key,task,response) on public.student_writing_submissions to authenticated;
create index writing_student_date_idx on public.student_writing_submissions(student_id,submitted_at desc);
create index writing_app_date_idx on public.student_writing_submissions(app_key,submitted_at desc);
create policy writing_student_insert on public.student_writing_submissions for insert to authenticated
with check (student_id = (select auth.uid()) and (select private.current_role()) = 'student'
  and exists (select 1 from public.profiles p where p.id=(select auth.uid()) and not p.must_change_password));
create policy writing_scoped_read on public.student_writing_submissions for select to authenticated
using (
  ((select private.current_role()) = 'student' and student_id=(select auth.uid()))
  or ((select private.current_role()) = 'admin')
  or ((select private.current_role()) = 'teacher' and (select private.teacher_can_access_student(student_id)))
);

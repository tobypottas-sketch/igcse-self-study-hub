drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
for select to authenticated
using (
  id = (select auth.uid())
  or (select private.current_role()) in ('admin'::user_role, 'teacher'::user_role)
);

drop policy if exists classes_select on public.classes;
create policy classes_select on public.classes
for select to authenticated
using (
  (select private.current_role()) in ('admin'::user_role, 'teacher'::user_role)
  or exists (
    select 1
    from public.student_class_memberships scm
    where scm.student_id = (select auth.uid())
      and scm.class_id = classes.id
      and scm.ended_at is null
  )
);

drop policy if exists memberships_select on public.student_class_memberships;
create policy memberships_select on public.student_class_memberships
for select to authenticated
using (
  student_id = (select auth.uid())
  or (select private.current_role()) in ('admin'::user_role, 'teacher'::user_role)
);

drop policy if exists teacher_classes_select on public.teacher_classes;
create policy teacher_classes_select on public.teacher_classes
for select to authenticated
using (
  (select private.current_role()) in ('admin'::user_role, 'teacher'::user_role)
);

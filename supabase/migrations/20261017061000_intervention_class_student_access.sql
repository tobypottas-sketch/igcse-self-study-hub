drop policy if exists learning_interventions_select on public.learning_interventions;
create policy learning_interventions_select on public.learning_interventions
for select to authenticated
using (
  (select private.current_role()) = 'admin'::public.user_role
  or created_by = (select auth.uid())
  or exists (
    select 1
    from public.learning_intervention_targets lit
    where lit.intervention_id = learning_interventions.id
      and (
        lit.student_id = (select auth.uid())
        or (
          lit.class_id is not null
          and exists (
            select 1
            from public.student_class_memberships scm
            where scm.student_id = (select auth.uid())
              and scm.ended_at is null
              and lit.class_id = scm.class_id
          )
        )
        or (
          (select private.current_role()) = 'teacher'::public.user_role
          and lit.student_id is not null
          and (select private.teacher_can_access_student(lit.student_id))
        )
        or (
          (select private.current_role()) = 'teacher'::public.user_role
          and lit.class_id is not null
          and (select private.teacher_has_class(lit.class_id))
        )
      )
  )
);

drop policy if exists learning_intervention_targets_select on public.learning_intervention_targets;
create policy learning_intervention_targets_select on public.learning_intervention_targets
for select to authenticated
using (
  (select private.current_role()) = 'admin'::public.user_role
  or student_id = (select auth.uid())
  or (
    class_id is not null
    and exists (
      select 1
      from public.student_class_memberships scm
      where scm.student_id = (select auth.uid())
        and scm.ended_at is null
        and learning_intervention_targets.class_id = scm.class_id
    )
  )
  or (
    (select private.current_role()) = 'teacher'::public.user_role
    and student_id is not null
    and (select private.teacher_can_access_student(student_id))
  )
  or (
    (select private.current_role()) = 'teacher'::public.user_role
    and class_id is not null
    and (select private.teacher_has_class(class_id))
  )
);

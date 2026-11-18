-- SECURITY HOTFIX: ordinary teachers may only access classes and students
-- assigned to them. Administrators retain institution-wide access.
-- Existing private.teacher_has_class and private.teacher_can_access_student
-- are SECURITY DEFINER helpers with explicit active-teacher checks.
BEGIN;

DROP POLICY IF EXISTS classes_select ON public.classes;
CREATE POLICY classes_select ON public.classes
FOR SELECT TO authenticated
USING (
  (SELECT private.current_role()) = 'admin'::public.user_role
  OR (
    (SELECT private.current_role()) = 'teacher'::public.user_role
    AND (SELECT private.teacher_has_class(classes.id))
  )
  OR EXISTS (
    SELECT 1 FROM public.student_class_memberships scm
    WHERE scm.student_id = (SELECT auth.uid())
      AND scm.class_id = classes.id
      AND scm.ended_at IS NULL
  )
);

DROP POLICY IF EXISTS teacher_classes_select ON public.teacher_classes;
CREATE POLICY teacher_classes_select ON public.teacher_classes
FOR SELECT TO authenticated
USING (
  (SELECT private.current_role()) = 'admin'::public.user_role
  OR (
    (SELECT private.current_role()) = 'teacher'::public.user_role
    AND teacher_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS memberships_select ON public.student_class_memberships;
CREATE POLICY memberships_select ON public.student_class_memberships
FOR SELECT TO authenticated
USING (
  student_id = (SELECT auth.uid())
  OR (SELECT private.current_role()) = 'admin'::public.user_role
  OR (
    (SELECT private.current_role()) = 'teacher'::public.user_role
    AND (SELECT private.teacher_has_class(student_class_memberships.class_id))
  )
);

DROP POLICY IF EXISTS profiles_select ON public.profiles;
CREATE POLICY profiles_select ON public.profiles
FOR SELECT TO authenticated
USING (
  id = (SELECT auth.uid())
  OR (SELECT private.current_role()) = 'admin'::public.user_role
  OR (
    (SELECT private.current_role()) = 'teacher'::public.user_role
    AND (SELECT private.teacher_can_access_student(profiles.id))
  )
);

COMMIT;
revoke execute on function public.teacher_activity_classes() from public, anon;
revoke execute on function public.teacher_activity_overview(uuid, timestamptz) from public, anon;
revoke execute on function public.teacher_activity_student_summary(uuid, timestamptz) from public, anon;
revoke execute on function public.teacher_activity_student_recent(uuid, timestamptz, integer) from public, anon;
grant execute on function public.teacher_activity_classes() to authenticated;
grant execute on function public.teacher_activity_overview(uuid, timestamptz) to authenticated;
grant execute on function public.teacher_activity_student_summary(uuid, timestamptz) to authenticated;
grant execute on function public.teacher_activity_student_recent(uuid, timestamptz, integer) to authenticated;

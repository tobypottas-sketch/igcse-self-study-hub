alter function public.teacher_activity_classes() set schema private;
alter function public.teacher_activity_overview(uuid, timestamptz) set schema private;
alter function public.teacher_activity_student_summary(uuid, timestamptz) set schema private;
alter function public.teacher_activity_student_recent(uuid, timestamptz, integer) set schema private;

create function public.teacher_activity_classes()
returns table(class_id uuid, class_name text)
language sql
stable
security invoker
set search_path = ''
as $$ select * from private.teacher_activity_classes(); $$;

create function public.teacher_activity_overview(p_class_id uuid, p_since timestamptz default null)
returns table(student_id uuid, display_name text, class_id uuid, class_name text, last_active timestamptz, active_seconds bigint, attempts bigint, correct_score bigint, valid_max_score bigint, apps_used text[], weakest_skill text)
language sql
stable
security invoker
set search_path = ''
as $$ select * from private.teacher_activity_overview(p_class_id, p_since); $$;

create function public.teacher_activity_student_summary(p_student_id uuid, p_since timestamptz default null)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$ select private.teacher_activity_student_summary(p_student_id, p_since); $$;

create function public.teacher_activity_student_recent(p_student_id uuid, p_since timestamptz default null, p_limit integer default 40)
returns table(occurred_at timestamptz, app_key text, event_type text, skill text, score integer, max_score integer, active_seconds integer, outcome text)
language sql
stable
security invoker
set search_path = ''
as $$ select * from private.teacher_activity_student_recent(p_student_id, p_since, p_limit); $$;

revoke execute on function public.teacher_activity_classes() from public, anon;
revoke execute on function public.teacher_activity_overview(uuid, timestamptz) from public, anon;
revoke execute on function public.teacher_activity_student_summary(uuid, timestamptz) from public, anon;
revoke execute on function public.teacher_activity_student_recent(uuid, timestamptz, integer) from public, anon;
grant execute on function public.teacher_activity_classes() to authenticated;
grant execute on function public.teacher_activity_overview(uuid, timestamptz) to authenticated;
grant execute on function public.teacher_activity_student_summary(uuid, timestamptz) to authenticated;
grant execute on function public.teacher_activity_student_recent(uuid, timestamptz, integer) to authenticated;

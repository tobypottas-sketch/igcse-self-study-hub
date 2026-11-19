-- Teacher-visible progress only: no questions, answers, or answer keys leave private schema.
-- Mirrors the same authorised class scope as vocabulary_ngsl_api('teacher-report').
create or replace function public.vocabulary_ngsl_teacher_progress(p_actor uuid)
returns jsonb language plpgsql security definer set search_path='' as $fn$
begin
 if not exists (select 1 from public.profiles
    where id=p_actor and role::text in ('teacher','admin') and active=true)
 then raise exception 'ACCESS_DENIED'; end if;
 return jsonb_build_object('sessions',coalesce((
  select jsonb_agg(jsonb_build_object(
    'studentId',s.student_id,
    'state',s.state,
    'answered',greatest(0,least(50,coalesce(s.next_index,1)-1)),
    'startedAt',s.started_at,
    'completedAt',s.completed_at
  ) order by s.started_at desc)
  from private.ngsl_baseline_sessions s
  where exists(select 1 from public.profiles p
    where p.id=p_actor and p.role::text='admin' and p.active=true)
    or exists(select 1 from public.student_class_memberships m
      join public.teacher_classes tc on tc.class_id=m.class_id
      where m.student_id=s.student_id and m.ended_at is null and tc.teacher_id=p_actor)
 ),'[]'::jsonb));
end $fn$;
revoke all on function public.vocabulary_ngsl_teacher_progress(uuid) from public,anon,authenticated;
grant execute on function public.vocabulary_ngsl_teacher_progress(uuid) to service_role;

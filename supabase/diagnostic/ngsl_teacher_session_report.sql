-- Teacher-only diagnostic session-status report. Contains no questions or answer keys.
-- Edge Function validates the caller JWT; database independently restricts class scope.
create or replace function public.vocabulary_ngsl_session_report(p_actor uuid)
returns jsonb language plpgsql security definer set search_path='' as $fn$
begin
 if p_actor is null or not exists (
  select 1 from public.profiles p where p.id=p_actor and p.active=true
   and p.role::text in ('teacher','admin')
 ) then raise exception 'ACCESS_DENIED'; end if;
 return jsonb_build_object('sessions',coalesce((
  select jsonb_agg(jsonb_build_object(
   'studentId',s.student_id,'state',s.state,'answered',greatest(0,least(50,s.next_index-1)),
   'startedAt',s.started_at,'completedAt',s.completed_at
  ) order by s.started_at desc)
  from private.ngsl_baseline_sessions s
  where exists (
   select 1 from public.profiles staff where staff.id=p_actor and staff.role::text='admin'
  ) or exists (
   select 1 from public.student_class_memberships m
   join public.teacher_classes tc on tc.class_id=m.class_id
   where m.student_id=s.student_id and m.ended_at is null and tc.teacher_id=p_actor
  )
 ),'[]'::jsonb));
end;$fn$;
revoke all on function public.vocabulary_ngsl_session_report(uuid) from public,anon,authenticated;
grant execute on function public.vocabulary_ngsl_session_report(uuid) to service_role;

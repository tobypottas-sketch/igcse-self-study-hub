create or replace function public.admin_transfer_student(
  p_student uuid,
  p_new_class uuid,
  p_changed_by uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role public.user_role;
  v_active boolean;
  v_current_id uuid;
  v_current_class uuid;
  v_new_id uuid;
begin
  select p.role, p.active
    into v_role, v_active
  from public.profiles p
  where p.id = p_student
  for update;

  if not found or v_role <> 'student'::public.user_role or v_active is not true then
    raise exception 'Student account is not active';
  end if;

  if not exists (
    select 1 from public.classes c
    where c.id = p_new_class and c.active = true
  ) then
    raise exception 'Destination class is not active';
  end if;

  select scm.id, scm.class_id
    into v_current_id, v_current_class
  from public.student_class_memberships scm
  where scm.student_id = p_student and scm.ended_at is null
  for update;

  if not found then
    raise exception 'Student has no active class membership';
  end if;

  if v_current_class = p_new_class then
    raise exception 'Student is already in that class';
  end if;

  update public.student_class_memberships
  set ended_at = now()
  where id = v_current_id;

  insert into public.student_class_memberships(student_id, class_id, started_at, changed_by)
  values (p_student, p_new_class, now(), p_changed_by)
  returning id into v_new_id;

  return v_new_id;
end;
$$;

revoke all on function public.admin_transfer_student(uuid, uuid, uuid) from public;
revoke all on function public.admin_transfer_student(uuid, uuid, uuid) from anon;
revoke all on function public.admin_transfer_student(uuid, uuid, uuid) from authenticated;
grant execute on function public.admin_transfer_student(uuid, uuid, uuid) to service_role;

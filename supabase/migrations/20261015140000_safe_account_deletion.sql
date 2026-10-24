alter table public.activity_events
  alter column user_id drop not null;

alter table public.activity_events
  drop constraint activity_events_user_id_fkey,
  add constraint activity_events_user_id_fkey
    foreign key (user_id) references public.profiles(id) on delete set null;

alter table public.student_class_memberships
  alter column student_id drop not null;

alter table public.student_class_memberships
  drop constraint student_class_memberships_student_id_fkey,
  add constraint student_class_memberships_student_id_fkey
    foreign key (student_id) references public.profiles(id) on delete set null;

create or replace function public.admin_retire_class(p_class uuid, p_changed_by uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_active boolean;
begin
  select c.active into v_active
  from public.classes c
  where c.id = p_class
  for update;

  if not found then
    return 'not_found';
  end if;

  if v_active is false then
    return 'already_inactive';
  end if;

  update public.student_class_memberships
  set ended_at = now(), changed_by = p_changed_by
  where class_id = p_class and ended_at is null;

  delete from public.teacher_classes
  where class_id = p_class;

  update public.classes
  set active = false, updated_at = now()
  where id = p_class;

  return 'retired';
end;
$$;

revoke all on function public.admin_retire_class(uuid, uuid) from public;
grant execute on function public.admin_retire_class(uuid, uuid) to service_role;

create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  app_key text not null references public.apps(app_key) on delete restrict,
  event_type text not null check (event_type ~ '^[a-z0-9_]+$' and char_length(event_type) <= 60),
  activity_id text check (activity_id is null or char_length(activity_id) <= 160),
  skill text check (skill is null or char_length(skill) <= 80),
  set_id text check (set_id is null or char_length(set_id) <= 40),
  mode text check (mode is null or mode in ('practice','exam')),
  strong boolean,
  score integer,
  max_score integer,
  active_seconds integer check (active_seconds is null or active_seconds between 1 and 600),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  occurred_at timestamptz not null default now(),
  check (score is null or score >= 0),
  check (max_score is null or max_score > 0),
  check (score is null or max_score is null or score <= max_score)
);

create index activity_events_user_time_idx
on public.activity_events(user_id, occurred_at desc);

create index activity_events_class_time_idx
on public.activity_events(class_id, occurred_at desc)
where class_id is not null;

create index activity_events_app_time_idx
on public.activity_events(app_key, occurred_at desc);

create function private.stamp_activity_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_class uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.active = true
  ) then
    raise exception 'Active Self-Study profile required';
  end if;

  new.user_id := (select auth.uid());

  select scm.class_id
    into current_class
  from public.student_class_memberships scm
  where scm.student_id = (select auth.uid())
    and scm.ended_at is null
  limit 1;

  new.class_id := current_class;
  return new;
end;
$$;

revoke all on function private.stamp_activity_event() from public;

create trigger activity_events_stamp_identity
before insert on public.activity_events
for each row execute function private.stamp_activity_event();

alter table public.activity_events enable row level security;

revoke all on public.activity_events from anon, authenticated;
grant insert, select on public.activity_events to authenticated;

create policy activity_events_insert_own on public.activity_events
for insert to authenticated
with check (
  user_id = (select auth.uid())
  and (select private.current_role()) is not null
);

create policy activity_events_select on public.activity_events
for select to authenticated
using (
  user_id = (select auth.uid())
  or (select private.current_role()) = 'admin'::public.user_role
  or (
    (select private.current_role()) = 'teacher'::public.user_role
    and (select private.teacher_can_access_student(user_id))
  )
);

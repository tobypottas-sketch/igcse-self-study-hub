create type public.user_role as enum ('admin','teacher','student');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null,
  display_name text not null check (char_length(trim(display_name)) between 1 and 120),
  school_email text not null unique,
  active boolean not null default true,
  must_change_password boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  class_name text not null unique check (char_length(trim(class_name)) between 1 and 120),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.teacher_classes (
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  assigned_by uuid references public.profiles(id) on delete set null,
  primary key (teacher_id, class_id)
);

create table public.student_class_memberships (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete restrict,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  changed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  check (ended_at is null or ended_at >= started_at)
);

create unique index one_active_class_per_student
on public.student_class_memberships(student_id)
where ended_at is null;

create index teacher_classes_class_id_idx on public.teacher_classes(class_id);
create index memberships_class_id_idx on public.student_class_memberships(class_id);
create index memberships_student_id_idx on public.student_class_memberships(student_id);

create table public.apps (
  app_key text primary key check (app_key ~ '^[a-z0-9_]+$'),
  display_name text not null,
  launch_url text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create function private.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role from public.profiles p
  where p.id = (select auth.uid()) and p.active = true
$$;

create function private.teacher_has_class(target_class uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.teacher_classes tc
    join public.profiles p on p.id = tc.teacher_id
    where tc.teacher_id = (select auth.uid())
      and tc.class_id = target_class
      and p.active = true
      and p.role = 'teacher'::public.user_role
  )
$$;

create function private.teacher_can_access_student(target_student uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.student_class_memberships scm
    join public.teacher_classes tc on tc.class_id = scm.class_id
    join public.profiles p on p.id = tc.teacher_id
    where scm.student_id = target_student
      and scm.ended_at is null
      and tc.teacher_id = (select auth.uid())
      and p.active = true
      and p.role = 'teacher'::public.user_role
  )
$$;

revoke execute on function private.current_role() from public;
revoke execute on function private.teacher_has_class(uuid) from public;
revoke execute on function private.teacher_can_access_student(uuid) from public;
grant execute on function private.current_role() to authenticated;
grant execute on function private.teacher_has_class(uuid) to authenticated;
grant execute on function private.teacher_can_access_student(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.teacher_classes enable row level security;
alter table public.student_class_memberships enable row level security;
alter table public.apps enable row level security;

revoke all on public.profiles, public.classes, public.teacher_classes, public.student_class_memberships, public.apps from anon, authenticated;
grant select on public.profiles, public.classes, public.teacher_classes, public.student_class_memberships, public.apps to authenticated;
grant update (must_change_password) on public.profiles to authenticated;

create policy profiles_select on public.profiles
for select to authenticated
using (
  id = (select auth.uid())
  or (select private.current_role()) = 'admin'::public.user_role
  or ((select private.current_role()) = 'teacher'::public.user_role and role = 'student'::public.user_role and (select private.teacher_can_access_student(id)))
);

create policy profiles_update_own_password_flag on public.profiles
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy classes_select on public.classes
for select to authenticated
using (
  (select private.current_role()) = 'admin'::public.user_role
  or ((select private.current_role()) = 'teacher'::public.user_role and (select private.teacher_has_class(id)))
  or exists (
    select 1 from public.student_class_memberships scm
    where scm.student_id = (select auth.uid()) and scm.class_id = classes.id and scm.ended_at is null
  )
);

create policy teacher_classes_select on public.teacher_classes
for select to authenticated
using (
  (select private.current_role()) = 'admin'::public.user_role
  or ((select private.current_role()) = 'teacher'::public.user_role and (select private.teacher_has_class(class_id)))
);

create policy memberships_select on public.student_class_memberships
for select to authenticated
using (
  student_id = (select auth.uid())
  or (select private.current_role()) = 'admin'::public.user_role
  or ((select private.current_role()) = 'teacher'::public.user_role and (select private.teacher_has_class(class_id)))
);

create policy apps_select on public.apps
for select to authenticated
using (enabled = true or (select private.current_role()) = 'admin'::public.user_role);

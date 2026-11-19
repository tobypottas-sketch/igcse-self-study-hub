-- Auditable, rate-limited teacher password resets; passwords are never stored.
create table if not exists public.teacher_student_password_reset_events (
 id bigint generated always as identity primary key,
 actor_id uuid not null references auth.users(id),
 student_id uuid not null references auth.users(id),
 succeeded boolean not null default false,
 created_at timestamptz not null default now()
);
create index if not exists teacher_password_resets_actor_recent on public.teacher_student_password_reset_events(actor_id,created_at desc);
create index if not exists teacher_password_resets_student_recent on public.teacher_student_password_reset_events(student_id,created_at desc);
alter table public.teacher_student_password_reset_events enable row level security;
revoke all on public.teacher_student_password_reset_events from public,anon,authenticated;
grant select,insert,update on public.teacher_student_password_reset_events to service_role;
grant usage,select on sequence public.teacher_student_password_reset_events_id_seq to service_role;

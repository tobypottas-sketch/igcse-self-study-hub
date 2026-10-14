create table public.essay_tasks (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete restrict,
  study_mode text not null default 'exam' check (study_mode in ('practice', 'exam')),
  settings jsonb not null check (jsonb_typeof(settings) = 'object'),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create index essay_tasks_created_by_idx on public.essay_tasks(created_by);

alter table public.essay_tasks enable row level security;

revoke all on public.essay_tasks from anon, authenticated;

create table public.vocabulary_unit_activities (
  activity_content_id text primary key check (activity_content_id ~ '^[a-z0-9_:-]+$'),
  unit_number integer not null check (unit_number between 1 and 20),
  content_type text not null check (content_type in ('phrase_set','idea_set','question_text','writing_set')),
  activity_data jsonb not null default '{}'::jsonb check (jsonb_typeof(activity_data) = 'object'),
  status text not null default 'draft' check (status in ('draft','reviewed','approved','live')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index vocabulary_unit_activities_unit_idx
on public.vocabulary_unit_activities(unit_number, content_type, status);

alter table public.vocabulary_unit_activities enable row level security;

revoke all on public.vocabulary_unit_activities from anon, authenticated;
grant select on public.vocabulary_unit_activities to authenticated;

create policy vocabulary_unit_activities_select on public.vocabulary_unit_activities
for select to authenticated
using (
  status = 'live'
  or (select private.current_role()) in ('teacher'::public.user_role, 'admin'::public.user_role)
);

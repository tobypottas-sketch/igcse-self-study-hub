create table if not exists public.vocabulary_unit_pathway_journey (
  student_id uuid not null references auth.users(id) on delete cascade,
  unit_number integer not null,
  pathway_id text not null check (pathway_id in ('meaning','context','word_families','paraphrasing','precision_use','spelling_recall')),
  current_stage text not null default 'recognise' check (current_stage in ('recognise','match','apply','recall','mastery')),
  completed_stages text[] not null default '{}'::text[],
  stage_attempts integer not null default 0 check (stage_attempts >= 0 and stage_attempts <= 10),
  stage_clean_successes integer not null default 0 check (stage_clean_successes >= 0 and stage_clean_successes <= 10),
  updated_at timestamptz not null default now(),
  primary key (student_id, unit_number, pathway_id)
);

alter table public.vocabulary_unit_pathway_journey enable row level security;

create policy "students read own vocabulary pathway journey"
on public.vocabulary_unit_pathway_journey
for select
to authenticated
using (student_id = auth.uid());

grant select on public.vocabulary_unit_pathway_journey to authenticated;
revoke insert, update, delete on public.vocabulary_unit_pathway_journey from anon, authenticated;

create index if not exists vocabulary_unit_pathway_journey_student_unit_idx
on public.vocabulary_unit_pathway_journey(student_id, unit_number);

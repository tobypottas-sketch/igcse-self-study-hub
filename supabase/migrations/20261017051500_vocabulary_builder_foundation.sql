create table public.vocabulary_items (
  vocabulary_id text primary key check (vocabulary_id ~ '^[a-z0-9_:-]+$'),
  term text not null check (char_length(trim(term)) between 1 and 160),
  part_of_speech text not null check (char_length(trim(part_of_speech)) between 1 and 40),
  core_meaning text not null check (char_length(trim(core_meaning)) between 1 and 500),
  senses jsonb not null default '[]'::jsonb check (jsonb_typeof(senses) = 'array'),
  word_family jsonb not null default '[]'::jsonb check (jsonb_typeof(word_family) = 'array'),
  collocations jsonb not null default '[]'::jsonb check (jsonb_typeof(collocations) = 'array'),
  status text not null default 'draft' check (status in ('draft','reviewed','approved','live')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vocabulary_unit_occurrences (
  occurrence_id text primary key check (occurrence_id ~ '^[a-z0-9_:-]+$'),
  vocabulary_id text not null references public.vocabulary_items(vocabulary_id) on delete restrict,
  unit_number integer not null check (unit_number between 1 and 20),
  unit_title text not null check (char_length(trim(unit_title)) between 1 and 160),
  set_number integer not null check (set_number between 1 and 5),
  position_in_unit integer not null check (position_in_unit between 1 and 50),
  sense_id text not null check (char_length(trim(sense_id)) between 1 and 120),
  status text not null default 'draft' check (status in ('draft','reviewed','approved','live')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (unit_number, position_in_unit)
);

create index vocabulary_unit_occurrences_unit_idx
on public.vocabulary_unit_occurrences(unit_number, set_number, position_in_unit);

create index vocabulary_unit_occurrences_vocab_idx
on public.vocabulary_unit_occurrences(vocabulary_id);

create table public.vocabulary_contexts (
  context_id text primary key check (context_id ~ '^[a-z0-9_:-]+$'),
  vocabulary_id text not null references public.vocabulary_items(vocabulary_id) on delete cascade,
  occurrence_id text references public.vocabulary_unit_occurrences(occurrence_id) on delete cascade,
  sense_id text not null check (char_length(trim(sense_id)) between 1 and 120),
  context_type text not null check (context_type in ('meaning_context','paraphrase_context','production_context','reading_bridge','gap_fill','mixed_check')),
  prompt_text text not null check (char_length(trim(prompt_text)) between 1 and 2000),
  target_rewrite text check (target_rewrite is null or char_length(trim(target_rewrite)) between 1 and 1000),
  accepted_answers jsonb not null default '[]'::jsonb check (jsonb_typeof(accepted_answers) = 'array'),
  misconception_category text,
  status text not null default 'draft' check (status in ('draft','reviewed','approved','live')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index vocabulary_contexts_vocab_idx on public.vocabulary_contexts(vocabulary_id);
create index vocabulary_contexts_occurrence_idx on public.vocabulary_contexts(occurrence_id) where occurrence_id is not null;

create table public.vocabulary_global_mastery (
  student_id uuid not null references public.profiles(id) on delete cascade,
  vocabulary_id text not null references public.vocabulary_items(vocabulary_id) on delete cascade,
  status text not null default 'new' check (status in ('new','building','secure','mastered')),
  strand_evidence jsonb not null default '{}'::jsonb check (jsonb_typeof(strand_evidence) = 'object'),
  successful_productions integer not null default 0 check (successful_productions >= 0),
  production_context_ids jsonb not null default '[]'::jsonb check (jsonb_typeof(production_context_ids) = 'array'),
  review_stage integer not null default 0 check (review_stage between 0 and 12),
  review_due_at timestamptz,
  review_failure_count integer not null default 0 check (review_failure_count >= 0),
  recent_error_pattern text,
  last_seen_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (student_id, vocabulary_id)
);

create index vocabulary_global_mastery_student_idx
on public.vocabulary_global_mastery(student_id, updated_at desc);

create table public.vocabulary_unit_mastery (
  student_id uuid not null references public.profiles(id) on delete cascade,
  occurrence_id text not null references public.vocabulary_unit_occurrences(occurrence_id) on delete cascade,
  status text not null default 'new' check (status in ('new','building','secure','mastered')),
  contextual_evidence jsonb not null default '{}'::jsonb check (jsonb_typeof(contextual_evidence) = 'object'),
  recent_error_pattern text,
  last_seen_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (student_id, occurrence_id)
);

create index vocabulary_unit_mastery_student_idx
on public.vocabulary_unit_mastery(student_id, updated_at desc);

create table public.learning_interventions (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete restrict,
  intervention_type text not null check (intervention_type in ('recommendation','assignment','intervention')),
  target_scope text not null check (target_scope in ('student','group','class')),
  learning_area text not null check (learning_area ~ '^[a-z0-9_]+$'),
  skill text check (skill is null or char_length(skill) <= 80),
  context jsonb not null default '{}'::jsonb check (jsonb_typeof(context) = 'object'),
  session jsonb not null default '{}'::jsonb check (jsonb_typeof(session) = 'object'),
  status text not null check (status in ('recommended','assigned','started','completed','overdue','reviewed')),
  reason_code text check (reason_code is null or char_length(reason_code) <= 120),
  external_follow_up text check (external_follow_up is null or external_follow_up in ('teams_quiz')),
  due_at timestamptz,
  completed_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.learning_intervention_targets (
  intervention_id uuid not null references public.learning_interventions(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete cascade,
  class_id uuid references public.classes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (intervention_id, student_id, class_id),
  check (student_id is not null or class_id is not null)
);

create index learning_intervention_targets_student_idx
on public.learning_intervention_targets(student_id) where student_id is not null;
create index learning_intervention_targets_class_idx
on public.learning_intervention_targets(class_id) where class_id is not null;

insert into public.apps (app_key, display_name, launch_url, enabled)
values (
  'vocabulary_paraphrase',
  'Vocabulary & Paraphrase Builder',
  'https://tobypottas-sketch.github.io/igcse-self-study-hub/vocabulary.html',
  false
)
on conflict (app_key) do update
set display_name = excluded.display_name,
    launch_url = excluded.launch_url,
    enabled = false,
    updated_at = now();

alter table public.vocabulary_items enable row level security;
alter table public.vocabulary_unit_occurrences enable row level security;
alter table public.vocabulary_contexts enable row level security;
alter table public.vocabulary_global_mastery enable row level security;
alter table public.vocabulary_unit_mastery enable row level security;
alter table public.learning_interventions enable row level security;
alter table public.learning_intervention_targets enable row level security;

revoke all on public.vocabulary_items, public.vocabulary_unit_occurrences, public.vocabulary_contexts,
  public.vocabulary_global_mastery, public.vocabulary_unit_mastery,
  public.learning_interventions, public.learning_intervention_targets from anon, authenticated;

grant select on public.vocabulary_items, public.vocabulary_unit_occurrences, public.vocabulary_contexts,
  public.vocabulary_global_mastery, public.vocabulary_unit_mastery,
  public.learning_interventions, public.learning_intervention_targets to authenticated;

create policy vocabulary_items_select on public.vocabulary_items
for select to authenticated
using (
  status = 'live'
  or (select private.current_role()) in ('teacher'::public.user_role, 'admin'::public.user_role)
);

create policy vocabulary_unit_occurrences_select on public.vocabulary_unit_occurrences
for select to authenticated
using (
  (status = 'live' and active = true)
  or (select private.current_role()) in ('teacher'::public.user_role, 'admin'::public.user_role)
);

create policy vocabulary_contexts_select on public.vocabulary_contexts
for select to authenticated
using (
  status = 'live'
  or (select private.current_role()) in ('teacher'::public.user_role, 'admin'::public.user_role)
);

create policy vocabulary_global_mastery_select on public.vocabulary_global_mastery
for select to authenticated
using (
  student_id = (select auth.uid())
  or (select private.current_role()) = 'admin'::public.user_role
  or (
    (select private.current_role()) = 'teacher'::public.user_role
    and (select private.teacher_can_access_student(student_id))
  )
);

create policy vocabulary_unit_mastery_select on public.vocabulary_unit_mastery
for select to authenticated
using (
  student_id = (select auth.uid())
  or (select private.current_role()) = 'admin'::public.user_role
  or (
    (select private.current_role()) = 'teacher'::public.user_role
    and (select private.teacher_can_access_student(student_id))
  )
);

create policy learning_interventions_select on public.learning_interventions
for select to authenticated
using (
  (select private.current_role()) = 'admin'::public.user_role
  or created_by = (select auth.uid())
  or exists (
    select 1 from public.learning_intervention_targets lit
    where lit.intervention_id = learning_interventions.id
      and (
        lit.student_id = (select auth.uid())
        or (
          (select private.current_role()) = 'teacher'::public.user_role
          and lit.student_id is not null
          and (select private.teacher_can_access_student(lit.student_id))
        )
        or (
          (select private.current_role()) = 'teacher'::public.user_role
          and lit.class_id is not null
          and (select private.teacher_has_class(lit.class_id))
        )
      )
  )
);

create policy learning_intervention_targets_select on public.learning_intervention_targets
for select to authenticated
using (
  (select private.current_role()) = 'admin'::public.user_role
  or student_id = (select auth.uid())
  or (
    (select private.current_role()) = 'teacher'::public.user_role
    and student_id is not null
    and (select private.teacher_can_access_student(student_id))
  )
  or (
    (select private.current_role()) = 'teacher'::public.user_role
    and class_id is not null
    and (select private.teacher_has_class(class_id))
  )
);

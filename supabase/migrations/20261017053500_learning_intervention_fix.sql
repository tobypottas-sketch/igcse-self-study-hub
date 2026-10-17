alter table public.learning_intervention_targets
  drop constraint learning_intervention_targets_pkey;

alter table public.learning_intervention_targets
  alter column student_id drop not null,
  alter column class_id drop not null,
  add column id uuid not null default gen_random_uuid(),
  add constraint learning_intervention_targets_pkey primary key (id),
  drop constraint if exists learning_intervention_targets_check,
  add constraint learning_intervention_targets_one_target_check check (
    (student_id is not null and class_id is null)
    or (student_id is null and class_id is not null)
  );

create unique index learning_intervention_targets_student_unique
on public.learning_intervention_targets(intervention_id, student_id)
where student_id is not null;

create unique index learning_intervention_targets_class_unique
on public.learning_intervention_targets(intervention_id, class_id)
where class_id is not null;

alter table public.learning_interventions
  add column outcome_status text check (
    outcome_status is null
    or outcome_status in ('improved','partially_improved','no_clear_change','insufficient_follow_up_evidence')
  ),
  add column outcome_summary jsonb not null default '{}'::jsonb check (jsonb_typeof(outcome_summary) = 'object');

-- Audit #9: make the remote analytics privacy contract enforceable in Postgres,
-- and allow controlled Essay task history to survive creator-account deletion.

create or replace function private.activity_metadata_is_safe(value jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select
    jsonb_typeof(value) = 'object'
    and not exists (
      select 1
      from jsonb_object_keys(value) as key
      where key not in (
        'attempt_number', 'word_count', 'overlap_count', 'outcome',
        'question_type', 'section_id', 'support_type', 'result_type'
      )
    )
    and (
      not (value ? 'attempt_number')
      or (jsonb_typeof(value->'attempt_number') = 'number'
          and (value->>'attempt_number') ~ '^[0-9]+$'
          and (value->>'attempt_number')::integer between 1 and 100)
    )
    and (
      not (value ? 'word_count')
      or (jsonb_typeof(value->'word_count') = 'number'
          and (value->>'word_count') ~ '^[0-9]+$'
          and (value->>'word_count')::integer between 0 and 1000)
    )
    and (
      not (value ? 'overlap_count')
      or (jsonb_typeof(value->'overlap_count') = 'number'
          and (value->>'overlap_count') ~ '^[0-9]+$'
          and (value->>'overlap_count')::integer between 0 and 1000)
    )
    and (
      not (value ? 'outcome')
      or (jsonb_typeof(value->'outcome') = 'string'
          and value->>'outcome' in ('correct', 'try_again'))
    )
    and (
      not (value ? 'question_type')
      or (jsonb_typeof(value->'question_type') = 'string'
          and value->>'question_type' in (
            'phrase_match', 'sentence_match', 'synonym_write', 'paraphrase_write',
            'ex1', 'ex2', 'ex3', 'ex4', 'short_answers', 'matching', 'notes', 'mcq',
            'listening_short_extracts', 'listening_dialogues', 'listening_long_talk',
            'listening_speaker_matching', 'listening_interview'
          ))
    )
    and (
      not (value ? 'section_id')
      or (jsonb_typeof(value->'section_id') = 'string'
          and value->>'section_id' in ('ex1', 'ex2', 'ex3', 'ex4', 'ex5'))
    )
    and (
      not (value ? 'support_type')
      or (jsonb_typeof(value->'support_type') = 'string'
          and value->>'support_type' = 'transcript')
    )
    and (
      not (value ? 'result_type')
      or (jsonb_typeof(value->'result_type') = 'string'
          and value->>'result_type' = 'exam_reconciliation')
    );
$$;

alter table public.activity_events
  drop constraint if exists activity_events_metadata_privacy_check;

-- NOT VALID deliberately preserves immutable historical analytics that predate
-- the strict allowlist, while PostgreSQL still enforces the check for every
-- new or subsequently updated row.
alter table public.activity_events
  add constraint activity_events_metadata_privacy_check
  check (private.activity_metadata_is_safe(metadata)) not valid;

alter table public.activity_events
  drop constraint if exists activity_events_event_type_known_check;

alter table public.activity_events
  add constraint activity_events_event_type_known_check
  check (event_type in (
    'app_open', 'active_time', 'question_answered', 'question_attempt',
    'exercise_result', 'section_use', 'support_use'
  ));

-- A deleted teacher must not be retained as personally identifying task metadata.
-- The task row itself can remain as non-content history; account deletion retires it first.
alter table public.essay_tasks
  alter column created_by drop not null;

alter table public.essay_tasks
  drop constraint if exists essay_tasks_created_by_fkey;

alter table public.essay_tasks
  add constraint essay_tasks_created_by_fkey
  foreign key (created_by) references public.profiles(id) on delete set null;

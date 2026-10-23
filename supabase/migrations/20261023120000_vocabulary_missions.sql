-- Vocabulary Builder missions (engagement Phase 1).
--
-- A mission is an untimed ten-activity pathway or Mixed Practice session. The facts about it are rebuilt on the server from
-- that mission's own server-graded attempts, so the student's browser never supplies a score, streak or star count.
--
-- 1. Students can no longer insert vocabulary question attempts directly. The attempt Edge Function writes them with the
--    service role, so nothing legitimate changes; it closes the one way to forge the evidence a mission is built from.
-- 2. Attempt metadata may carry mission_id / mission_size / mission_kind / practice_family (strictly validated).
-- 3. vocabulary_missions stores one factual row per recorded mission (read-only for students).
-- 4. record_vocabulary_mission(p_mission_id) validates and derives the row; it takes only the id.

-- 1 ---------------------------------------------------------------------------------------------------------------------
drop policy if exists activity_events_insert_own on public.activity_events;
create policy activity_events_insert_own on public.activity_events
for insert to authenticated
with check (
  user_id = (select auth.uid())
  and (select private.current_role()) is not null
  and not (app_key = 'vocabulary_paraphrase' and event_type = 'question_attempt')
);

-- 2 ---------------------------------------------------------------------------------------------------------------------
create or replace function private.vocabulary_activity_metadata_is_safe(value jsonb)
returns boolean language sql immutable set search_path = '' as $$
  select case when jsonb_typeof(value) = 'object' then coalesce(
    private.activity_metadata_is_safe(value - array[
      'question_type','unit_number','strand','retry_used','recovery','misconception',
      'skill_family','evidence_strength','support_level','practice_focus','target_id',
      'occurrence_id','pathway_id','pathway_stage','served_pathway_stage',
      'mission_id','mission_size','mission_kind','practice_family'
    ])
    and (not (value ? 'question_type') or
      (jsonb_typeof(value->'question_type') = 'string' and value->>'question_type' in (
'meaning_match','paraphrase_match','context_inference','question_text_bridge','context_gap_fill',
  'replace_phrase','produce_paraphrase','use_target','identify_inaccurate_paraphrase','mini_mixed_check',
  'which_situation_fits','meaning_in_context','correct_usage','collocation_builder','word_family_switch',
  'find_evidence','phrase_match','build_paraphrase','complete_paraphrase','rewrite_phrase','same_idea',
  'spot_meaning_change','build_same_idea','rewrite_idea','improve_vocabulary','explain_another_way',
  'definition_to_word','word_definition_match','drag_word_definition','drag_definition_word',
  'gap_fill_bank','drag_word_sentence','type_missing_word','spell_word','choose_word_sentence','word_family_choice',
  'type_word_from_definition','context_sentence_match','word_family_match','precision_choice','precision_match',
  'spelling_choice','spelling_cue_match','spelling_rebuild','spell_in_context'
      )))
    and not exists (
      select 1 from jsonb_each(value) as field(key, val)
      where case key
        when 'unit_number' then not (jsonb_typeof(val) = 'number' and val::text ~ '^([1-9]|1[0-9]|20)$')
        when 'strand' then not (jsonb_typeof(val) = 'string' and val #>> '{}' in ('meaning','recognition','context','paraphrasing','production'))
        when 'retry_used' then jsonb_typeof(val) <> 'boolean'
        when 'recovery' then jsonb_typeof(val) <> 'boolean'
        when 'misconception' then not (jsonb_typeof(val) = 'string' and val #>> '{}' in ('related_but_inaccurate','wrong_form','meaning_confusion','retrieval_failure','context_mismatch','quantity_change','degree_change','time_change','cause_effect_change','contrast_change','added_information','omitted_information','unnatural_collocation','too_vague','register_mismatch'))
        when 'skill_family' then not (jsonb_typeof(val) = 'string' and val #>> '{}' in ('meaning','context','question_text','phrase_paraphrasing','idea_paraphrasing','writing_vocabulary','communication_repair'))
        when 'evidence_strength' then not (jsonb_typeof(val) = 'string' and val #>> '{}' in ('light','medium','strong','very_strong'))
        when 'support_level' then not (jsonb_typeof(val) = 'string' and val #>> '{}' in ('none','light','major'))
        when 'practice_focus' then not (jsonb_typeof(val) = 'string' and val #>> '{}' in ('learn','context','question_text','phrase_paraphrase','idea_paraphrase','writing','adaptive'))
        when 'target_id' then not (jsonb_typeof(val) = 'string' and val #>> '{}' ~ '^vocab_[a-z0-9_]{1,120}$')
        when 'occurrence_id' then not (jsonb_typeof(val) = 'string' and val #>> '{}' ~ '^u[0-9]{1,2}_[a-z0-9_]{1,120}$')
        when 'pathway_id' then not (jsonb_typeof(val) = 'string' and val #>> '{}' in ('meaning','context','word_families','paraphrasing','precision_use','spelling_recall'))
        when 'pathway_stage' then not (jsonb_typeof(val) = 'string' and val #>> '{}' in ('recognise','match','apply','recall','mastery'))
        when 'served_pathway_stage' then not (jsonb_typeof(val) = 'string' and val #>> '{}' in ('recognise','match','apply','recall','mastery'))
        when 'mission_id' then not (jsonb_typeof(val) = 'string' and val #>> '{}' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$')
        when 'mission_size' then not (jsonb_typeof(val) = 'number' and val::text = '10')
        when 'mission_kind' then not (jsonb_typeof(val) = 'string' and val #>> '{}' in ('pathway','mixed'))
        when 'practice_family' then not (jsonb_typeof(val) = 'string' and val #>> '{}' ~ '^[a-z0-9_:]{1,40}$')
        else false
      end
    ), false) else false end;
$$;

revoke all on function private.vocabulary_activity_metadata_is_safe(jsonb) from public;
grant execute on function private.vocabulary_activity_metadata_is_safe(jsonb) to authenticated, service_role;

-- 3 ---------------------------------------------------------------------------------------------------------------------
create table if not exists public.vocabulary_missions (
  mission_id uuid primary key,
  student_id uuid not null references public.profiles(id) on delete cascade,
  unit_number integer not null check (unit_number between 1 and 20),
  mission_kind text not null check (mission_kind in ('pathway','mixed')),
  pathway_id text check (pathway_id is null or pathway_id in ('meaning','context','word_families','paraphrasing','precision_use','spelling_recall')),
  pathway_stage text check (pathway_stage is null or pathway_stage in ('recognise','match','apply','recall','mastery')),
  practice_family text not null check (practice_family ~ '^[a-z0-9_:]{1,40}$'),
  mission_size integer not null check (mission_size = 10),
  score integer not null check (score between 0 and 10),
  stars integer not null check (stars between 0 and 3),
  best_streak integer not null check (best_streak between 0 and 10),
  completed_at timestamptz not null,
  recorded_at timestamptz not null default now(),
  check ((mission_kind = 'pathway' and pathway_id is not null and pathway_stage is not null)
      or (mission_kind = 'mixed' and pathway_id is null and pathway_stage is null))
);

create index if not exists vocabulary_missions_student_time_idx
on public.vocabulary_missions(student_id, completed_at desc);

alter table public.vocabulary_missions enable row level security;
revoke all on public.vocabulary_missions from anon, authenticated;
grant select on public.vocabulary_missions to authenticated;

create policy vocabulary_missions_select on public.vocabulary_missions
for select to authenticated
using (
  student_id = (select auth.uid())
  or (select private.current_role()) = 'admin'::public.user_role
  or (
    (select private.current_role()) = 'teacher'::public.user_role
    and (select private.teacher_can_access_student(student_id))
  )
);

-- 4 ---------------------------------------------------------------------------------------------------------------------
create or replace function public.record_vocabulary_mission(p_mission_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student uuid := (select auth.uid());
  v_existing public.vocabulary_missions;
  v_row public.vocabulary_missions;
  v_events integer;
  v_units integer;
  v_unit integer;
  v_sets integer;
  v_kinds integer;
  v_kind text;
  v_families integer;
  v_family text;
  v_sizes integer;
  v_pathways integer;
  v_pathway text;
  v_stages integer;
  v_stage text;
  v_targets integer;
  v_completed integer;
  v_score integer;
  v_best integer := 0;
  v_streak integer := 0;
  v_last timestamptz;
  r record;
begin
  if v_student is null then
    raise exception 'Sign in to record a mission';
  end if;
  if p_mission_id is null then
    raise exception 'Mission id is required';
  end if;

  select * into v_existing from public.vocabulary_missions
  where mission_id = p_mission_id and student_id = v_student;
  if found then
    return to_jsonb(v_existing) || jsonb_build_object('duplicate', true);
  end if;
  if exists (select 1 from public.vocabulary_missions where mission_id = p_mission_id) then
    raise exception 'Mission cannot be recorded';
  end if;

  drop table if exists pg_temp.mission_events;
  drop table if exists pg_temp.mission_targets;
  create temporary table pg_temp.mission_events on commit drop as
  select ae.id, ae.occurred_at, ae.set_id,
         (ae.metadata->>'unit_number')::integer as unit_number,
         ae.metadata->>'occurrence_id' as occurrence_id,
         (ae.metadata->>'attempt_number')::integer as attempt_number,
         ae.metadata->>'outcome' as outcome,
         coalesce((ae.metadata->>'recovery')::boolean, false) as recovery,
         ae.metadata->>'mission_kind' as mission_kind,
         ae.metadata->>'practice_family' as practice_family,
         (ae.metadata->>'mission_size')::integer as mission_size,
         ae.metadata->>'pathway_id' as pathway_id,
         ae.metadata->>'pathway_stage' as pathway_stage,
         row_number() over (order by ae.occurred_at, ae.id) as seq
  from public.activity_events ae
  where ae.user_id = v_student
    and ae.app_key = 'vocabulary_paraphrase'
    and ae.event_type = 'question_attempt'
    and ae.metadata->>'mission_id' = p_mission_id::text;

  select count(*), count(distinct unit_number), count(distinct set_id), count(distinct mission_kind),
         count(distinct practice_family), count(distinct mission_size), max(unit_number), max(mission_kind),
         max(practice_family), max(occurred_at), count(distinct occurrence_id)
    into v_events, v_units, v_sets, v_kinds, v_families, v_sizes, v_unit, v_kind, v_family, v_last, v_targets
  from pg_temp.mission_events;

  if v_events = 0 then raise exception 'No attempts were found for this mission'; end if;
  if v_events > 40 then raise exception 'Mission has too many attempts'; end if;
  if v_units <> 1 or v_sets <> 1 or v_kinds <> 1 or v_families <> 1 or v_sizes <> 1 then
    raise exception 'Mission attempts do not describe a single mission';
  end if;
  if exists (select 1 from pg_temp.mission_events where set_id <> 'unit-' || unit_number
                or attempt_number not in (1,2) or outcome not in ('correct','try_again')
                or occurrence_id !~ ('^u' || unit_number || '_')
                or mission_size <> 10) then
    raise exception 'Mission attempts are inconsistent';
  end if;
  if v_last < now() - interval '12 hours' then
    raise exception 'Mission is too old to record';
  end if;

  if v_kind = 'pathway' then
    select count(distinct pathway_id), count(distinct pathway_stage), max(pathway_id), max(pathway_stage)
      into v_pathways, v_stages, v_pathway, v_stage
    from pg_temp.mission_events;
    if v_pathways <> 1 or v_stages <> 1 or v_pathway is null or v_stage is null then
      raise exception 'Pathway mission attempts must share one pathway and stage';
    end if;
  end if;

  -- A question finishes on a correct first attempt or on the second attempt. A target is complete on its first finishing
  -- question that was clean, or on any finishing question that was a recovery re-ask (same rules as the live mission).
  create temporary table pg_temp.mission_targets on commit drop as
  select distinct on (occurrence_id) occurrence_id, outcome
  from pg_temp.mission_events
  where (attempt_number = 1 and outcome = 'correct')
     or (attempt_number = 2 and recovery)
  order by occurrence_id, seq;

  select count(*), count(*) filter (where outcome = 'correct')
    into v_completed, v_score
  from pg_temp.mission_targets;

  if v_targets <> 10 or v_completed <> 10 then
    raise exception 'Mission is not complete: ten finished targets are required';
  end if;

  for r in select attempt_number, outcome from pg_temp.mission_events order by seq loop
    if r.attempt_number = 1 and r.outcome = 'correct' then
      v_streak := v_streak + 1;
      if v_streak > v_best then v_best := v_streak; end if;
    else
      v_streak := 0;
    end if;
  end loop;

  insert into public.vocabulary_missions (
    mission_id, student_id, unit_number, mission_kind, pathway_id, pathway_stage, practice_family,
    mission_size, score, stars, best_streak, completed_at
  ) values (
    p_mission_id, v_student, v_unit, v_kind,
    case when v_kind = 'pathway' then v_pathway end,
    case when v_kind = 'pathway' then v_stage end,
    v_family, 10, v_score,
    case when v_score >= 9 then 3 when v_score >= 7 then 2 when v_score >= 5 then 1 else 0 end,
    v_best, v_last
  )
  on conflict (mission_id) do nothing
  returning * into v_row;

  if v_row.mission_id is null then
    select * into v_row from public.vocabulary_missions where mission_id = p_mission_id and student_id = v_student;
    return to_jsonb(v_row) || jsonb_build_object('duplicate', true);
  end if;
  return to_jsonb(v_row) || jsonb_build_object('duplicate', false);
end;
$$;

revoke all on function public.record_vocabulary_mission(uuid) from public, anon;
grant execute on function public.record_vocabulary_mission(uuid) to authenticated;

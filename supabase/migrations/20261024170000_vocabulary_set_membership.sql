-- Vocabulary Builder: Set progression verifies the mission's targets against the Set's authoritative membership.
--
-- Closes the gap left by 20261024160000: the server controlled student, unit, pathway, Set, stage and outcome, but did not check that the ten targets
-- a mission finished were the ten targets of that Set. Now:
--   1. public.vocabulary_set_members (protected, read-only for students) holds the authoritative members of every Set, in authored order.
--      It is generated from the unit's release content by scripts/generate-set-membership-sql.mjs; a test fails if the two ever differ.
--   2. A Set row cannot exist without its ten members (BEFORE INSERT guard), so there is no Set the server cannot verify.
--   3. The settlement trigger advances a Set only when {targets attempted in the mission} = {targets finished} = {Set members}
--      (ignoring order; distinct ids; no outside or missing target). Consolidate and Recovery follow the same rule: their approved composition
--      is the missed targets first and then the rest of the SAME Set, so it also covers all ten members; repeats of a weak target are
--      extra attempts of a member, never a new target.
--   An invalid mission keeps all its evidence, closes normally, is remembered in applied_mission_ids/history and moves nothing.
-- Apply AFTER 20261024160000. No data is deleted or rewritten.

create table if not exists public.vocabulary_set_members (
  unit_number integer not null check (unit_number between 1 and 20),
  pathway_id text not null check (pathway_id in ('meaning','context','word_families','paraphrasing','precision_use','spelling_recall')),
  set_number integer not null check (set_number between 1 and 12),
  position integer not null check (position between 1 and 10),
  occurrence_id text not null check (occurrence_id ~ '^u[0-9]+_'),
  primary key (unit_number, pathway_id, set_number, occurrence_id),
  unique (unit_number, pathway_id, set_number, position)
);
alter table public.vocabulary_set_members enable row level security;
revoke all on public.vocabulary_set_members from anon, authenticated;
grant select on public.vocabulary_set_members to authenticated;
drop policy if exists vocabulary_set_members_select on public.vocabulary_set_members;
create policy vocabulary_set_members_select on public.vocabulary_set_members for select to authenticated using (true);

-- BEGIN GENERATED MEMBERS (scripts/generate-set-membership-sql.mjs)
insert into public.vocabulary_set_members (unit_number, pathway_id, set_number, position, occurrence_id) values
  (1, 'meaning', 1, 1, 'u1_01_leisure'),
  (1, 'meaning', 1, 2, 'u1_02_preference'),
  (1, 'meaning', 1, 3, 'u1_03_avoid'),
  (1, 'meaning', 1, 4, 'u1_04_afford'),
  (1, 'meaning', 1, 5, 'u1_05_deny'),
  (1, 'meaning', 1, 6, 'u1_06_permit'),
  (1, 'meaning', 1, 7, 'u1_07_arrange'),
  (1, 'meaning', 1, 8, 'u1_08_urge'),
  (1, 'meaning', 1, 9, 'u1_09_recommend'),
  (1, 'meaning', 1, 10, 'u1_10_demand'),
  (1, 'meaning', 2, 1, 'u1_11_threaten'),
  (1, 'meaning', 2, 2, 'u1_12_resent'),
  (1, 'meaning', 2, 3, 'u1_13_regret'),
  (1, 'meaning', 2, 4, 'u1_14_unfamiliar'),
  (1, 'meaning', 2, 5, 'u1_15_racquet'),
  (1, 'meaning', 2, 6, 'u1_16_opponent'),
  (1, 'meaning', 2, 7, 'u1_17_intense'),
  (1, 'meaning', 2, 8, 'u1_18_tournament'),
  (1, 'meaning', 2, 9, 'u1_19_determined'),
  (1, 'meaning', 2, 10, 'u1_20_discipline'),
  (1, 'meaning', 3, 1, 'u1_21_goal_oriented'),
  (1, 'meaning', 3, 2, 'u1_22_achievement'),
  (1, 'meaning', 3, 3, 'u1_23_elite'),
  (1, 'meaning', 3, 4, 'u1_24_overwhelming'),
  (1, 'meaning', 3, 5, 'u1_25_generation'),
  (1, 'meaning', 3, 6, 'u1_26_challenge'),
  (1, 'meaning', 3, 7, 'u1_27_solution'),
  (1, 'meaning', 3, 8, 'u1_28_pastime'),
  (1, 'meaning', 3, 9, 'u1_29_feat'),
  (1, 'meaning', 3, 10, 'u1_31_monetary'),
  (1, 'meaning', 4, 1, 'u1_32_estimated'),
  (1, 'meaning', 4, 2, 'u1_33_struggle'),
  (1, 'meaning', 4, 3, 'u1_34_minimum'),
  (1, 'meaning', 4, 4, 'u1_35_championship'),
  (1, 'meaning', 4, 5, 'u1_36_competitor'),
  (1, 'meaning', 4, 6, 'u1_38_patience'),
  (1, 'meaning', 4, 7, 'u1_39_atmosphere'),
  (1, 'meaning', 4, 8, 'u1_40_incredible'),
  (1, 'meaning', 4, 9, 'u1_41_criteria'),
  (1, 'meaning', 4, 10, 'u1_42_historic'),
  (1, 'context', 1, 1, 'u1_01_leisure'),
  (1, 'context', 1, 2, 'u1_02_preference'),
  (1, 'context', 1, 3, 'u1_03_avoid'),
  (1, 'context', 1, 4, 'u1_04_afford'),
  (1, 'context', 1, 5, 'u1_05_deny'),
  (1, 'context', 1, 6, 'u1_06_permit'),
  (1, 'context', 1, 7, 'u1_07_arrange'),
  (1, 'context', 1, 8, 'u1_08_urge'),
  (1, 'context', 1, 9, 'u1_09_recommend'),
  (1, 'context', 1, 10, 'u1_10_demand'),
  (1, 'context', 2, 1, 'u1_11_threaten'),
  (1, 'context', 2, 2, 'u1_12_resent'),
  (1, 'context', 2, 3, 'u1_13_regret'),
  (1, 'context', 2, 4, 'u1_14_unfamiliar'),
  (1, 'context', 2, 5, 'u1_15_racquet'),
  (1, 'context', 2, 6, 'u1_16_opponent'),
  (1, 'context', 2, 7, 'u1_17_intense'),
  (1, 'context', 2, 8, 'u1_18_tournament'),
  (1, 'context', 2, 9, 'u1_19_determined'),
  (1, 'context', 2, 10, 'u1_20_discipline'),
  (1, 'context', 3, 1, 'u1_21_goal_oriented'),
  (1, 'context', 3, 2, 'u1_22_achievement'),
  (1, 'context', 3, 3, 'u1_23_elite'),
  (1, 'context', 3, 4, 'u1_24_overwhelming'),
  (1, 'context', 3, 5, 'u1_25_generation'),
  (1, 'context', 3, 6, 'u1_26_challenge'),
  (1, 'context', 3, 7, 'u1_27_solution'),
  (1, 'context', 3, 8, 'u1_28_pastime'),
  (1, 'context', 3, 9, 'u1_29_feat'),
  (1, 'context', 3, 10, 'u1_31_monetary'),
  (1, 'context', 4, 1, 'u1_32_estimated'),
  (1, 'context', 4, 2, 'u1_33_struggle'),
  (1, 'context', 4, 3, 'u1_34_minimum'),
  (1, 'context', 4, 4, 'u1_35_championship'),
  (1, 'context', 4, 5, 'u1_36_competitor'),
  (1, 'context', 4, 6, 'u1_38_patience'),
  (1, 'context', 4, 7, 'u1_39_atmosphere'),
  (1, 'context', 4, 8, 'u1_40_incredible'),
  (1, 'context', 4, 9, 'u1_41_criteria'),
  (1, 'context', 4, 10, 'u1_42_historic'),
  (1, 'word_families', 1, 1, 'u1_02_preference'),
  (1, 'word_families', 1, 2, 'u1_03_avoid'),
  (1, 'word_families', 1, 3, 'u1_04_afford'),
  (1, 'word_families', 1, 4, 'u1_05_deny'),
  (1, 'word_families', 1, 5, 'u1_06_permit'),
  (1, 'word_families', 1, 6, 'u1_07_arrange'),
  (1, 'word_families', 1, 7, 'u1_08_urge'),
  (1, 'word_families', 1, 8, 'u1_09_recommend'),
  (1, 'word_families', 1, 9, 'u1_10_demand'),
  (1, 'word_families', 1, 10, 'u1_11_threaten'),
  (1, 'word_families', 2, 1, 'u1_12_resent'),
  (1, 'word_families', 2, 2, 'u1_13_regret'),
  (1, 'word_families', 2, 3, 'u1_14_unfamiliar'),
  (1, 'word_families', 2, 4, 'u1_16_opponent'),
  (1, 'word_families', 2, 5, 'u1_17_intense'),
  (1, 'word_families', 2, 6, 'u1_19_determined'),
  (1, 'word_families', 2, 7, 'u1_20_discipline'),
  (1, 'word_families', 2, 8, 'u1_22_achievement'),
  (1, 'word_families', 2, 9, 'u1_24_overwhelming'),
  (1, 'word_families', 2, 10, 'u1_25_generation'),
  (1, 'word_families', 3, 1, 'u1_26_challenge'),
  (1, 'word_families', 3, 2, 'u1_27_solution'),
  (1, 'word_families', 3, 3, 'u1_32_estimated'),
  (1, 'word_families', 3, 4, 'u1_34_minimum'),
  (1, 'word_families', 3, 5, 'u1_35_championship'),
  (1, 'word_families', 3, 6, 'u1_36_competitor'),
  (1, 'word_families', 3, 7, 'u1_37_relatively'),
  (1, 'word_families', 3, 8, 'u1_38_patience'),
  (1, 'word_families', 3, 9, 'u1_40_incredible'),
  (1, 'word_families', 3, 10, 'u1_42_historic'),
  (1, 'precision_use', 1, 1, 'u1_01_leisure'),
  (1, 'precision_use', 1, 2, 'u1_02_preference'),
  (1, 'precision_use', 1, 3, 'u1_03_avoid'),
  (1, 'precision_use', 1, 4, 'u1_04_afford'),
  (1, 'precision_use', 1, 5, 'u1_05_deny'),
  (1, 'precision_use', 1, 6, 'u1_06_permit'),
  (1, 'precision_use', 1, 7, 'u1_07_arrange'),
  (1, 'precision_use', 1, 8, 'u1_08_urge'),
  (1, 'precision_use', 1, 9, 'u1_09_recommend'),
  (1, 'precision_use', 1, 10, 'u1_10_demand'),
  (1, 'precision_use', 2, 1, 'u1_11_threaten'),
  (1, 'precision_use', 2, 2, 'u1_12_resent'),
  (1, 'precision_use', 2, 3, 'u1_13_regret'),
  (1, 'precision_use', 2, 4, 'u1_14_unfamiliar'),
  (1, 'precision_use', 2, 5, 'u1_15_racquet'),
  (1, 'precision_use', 2, 6, 'u1_16_opponent'),
  (1, 'precision_use', 2, 7, 'u1_17_intense'),
  (1, 'precision_use', 2, 8, 'u1_18_tournament'),
  (1, 'precision_use', 2, 9, 'u1_19_determined'),
  (1, 'precision_use', 2, 10, 'u1_20_discipline'),
  (1, 'precision_use', 3, 1, 'u1_21_goal_oriented'),
  (1, 'precision_use', 3, 2, 'u1_22_achievement'),
  (1, 'precision_use', 3, 3, 'u1_23_elite'),
  (1, 'precision_use', 3, 4, 'u1_24_overwhelming'),
  (1, 'precision_use', 3, 5, 'u1_25_generation'),
  (1, 'precision_use', 3, 6, 'u1_26_challenge'),
  (1, 'precision_use', 3, 7, 'u1_27_solution'),
  (1, 'precision_use', 3, 8, 'u1_28_pastime'),
  (1, 'precision_use', 3, 9, 'u1_29_feat'),
  (1, 'precision_use', 3, 10, 'u1_30_regardless'),
  (1, 'precision_use', 4, 1, 'u1_31_monetary'),
  (1, 'precision_use', 4, 2, 'u1_32_estimated'),
  (1, 'precision_use', 4, 3, 'u1_33_struggle'),
  (1, 'precision_use', 4, 4, 'u1_34_minimum'),
  (1, 'precision_use', 4, 5, 'u1_35_championship'),
  (1, 'precision_use', 4, 6, 'u1_36_competitor'),
  (1, 'precision_use', 4, 7, 'u1_37_relatively'),
  (1, 'precision_use', 4, 8, 'u1_38_patience'),
  (1, 'precision_use', 4, 9, 'u1_39_atmosphere'),
  (1, 'precision_use', 4, 10, 'u1_40_incredible'),
  (1, 'precision_use', 5, 1, 'u1_41_criteria'),
  (1, 'precision_use', 5, 2, 'u1_42_historic'),
  (1, 'precision_use', 5, 3, 'u1_43_selection'),
  (1, 'precision_use', 5, 4, 'u1_44_produce'),
  (1, 'precision_use', 5, 5, 'u1_45_craftspeople'),
  (1, 'precision_use', 5, 6, 'u1_46_significant'),
  (1, 'precision_use', 5, 7, 'u1_47_expansion'),
  (1, 'precision_use', 5, 8, 'u1_48_reputation'),
  (1, 'precision_use', 5, 9, 'u1_49_reasonable'),
  (1, 'precision_use', 5, 10, 'u1_50_antiques'),
  (1, 'spelling_recall', 1, 1, 'u1_01_leisure'),
  (1, 'spelling_recall', 1, 2, 'u1_02_preference'),
  (1, 'spelling_recall', 1, 3, 'u1_03_avoid'),
  (1, 'spelling_recall', 1, 4, 'u1_04_afford'),
  (1, 'spelling_recall', 1, 5, 'u1_05_deny'),
  (1, 'spelling_recall', 1, 6, 'u1_06_permit'),
  (1, 'spelling_recall', 1, 7, 'u1_07_arrange'),
  (1, 'spelling_recall', 1, 8, 'u1_08_urge'),
  (1, 'spelling_recall', 1, 9, 'u1_09_recommend'),
  (1, 'spelling_recall', 1, 10, 'u1_10_demand'),
  (1, 'spelling_recall', 2, 1, 'u1_11_threaten'),
  (1, 'spelling_recall', 2, 2, 'u1_12_resent'),
  (1, 'spelling_recall', 2, 3, 'u1_13_regret'),
  (1, 'spelling_recall', 2, 4, 'u1_14_unfamiliar'),
  (1, 'spelling_recall', 2, 5, 'u1_15_racquet'),
  (1, 'spelling_recall', 2, 6, 'u1_16_opponent'),
  (1, 'spelling_recall', 2, 7, 'u1_17_intense'),
  (1, 'spelling_recall', 2, 8, 'u1_18_tournament'),
  (1, 'spelling_recall', 2, 9, 'u1_19_determined'),
  (1, 'spelling_recall', 2, 10, 'u1_20_discipline'),
  (1, 'spelling_recall', 3, 1, 'u1_21_goal_oriented'),
  (1, 'spelling_recall', 3, 2, 'u1_22_achievement'),
  (1, 'spelling_recall', 3, 3, 'u1_23_elite'),
  (1, 'spelling_recall', 3, 4, 'u1_24_overwhelming'),
  (1, 'spelling_recall', 3, 5, 'u1_25_generation'),
  (1, 'spelling_recall', 3, 6, 'u1_26_challenge'),
  (1, 'spelling_recall', 3, 7, 'u1_27_solution'),
  (1, 'spelling_recall', 3, 8, 'u1_28_pastime'),
  (1, 'spelling_recall', 3, 9, 'u1_29_feat'),
  (1, 'spelling_recall', 3, 10, 'u1_30_regardless'),
  (1, 'spelling_recall', 4, 1, 'u1_31_monetary'),
  (1, 'spelling_recall', 4, 2, 'u1_32_estimated'),
  (1, 'spelling_recall', 4, 3, 'u1_33_struggle'),
  (1, 'spelling_recall', 4, 4, 'u1_34_minimum'),
  (1, 'spelling_recall', 4, 5, 'u1_35_championship'),
  (1, 'spelling_recall', 4, 6, 'u1_36_competitor'),
  (1, 'spelling_recall', 4, 7, 'u1_37_relatively'),
  (1, 'spelling_recall', 4, 8, 'u1_38_patience'),
  (1, 'spelling_recall', 4, 9, 'u1_39_atmosphere'),
  (1, 'spelling_recall', 4, 10, 'u1_40_incredible'),
  (1, 'spelling_recall', 5, 1, 'u1_41_criteria'),
  (1, 'spelling_recall', 5, 2, 'u1_42_historic'),
  (1, 'spelling_recall', 5, 3, 'u1_43_selection'),
  (1, 'spelling_recall', 5, 4, 'u1_44_produce'),
  (1, 'spelling_recall', 5, 5, 'u1_45_craftspeople'),
  (1, 'spelling_recall', 5, 6, 'u1_46_significant'),
  (1, 'spelling_recall', 5, 7, 'u1_47_expansion'),
  (1, 'spelling_recall', 5, 8, 'u1_48_reputation'),
  (1, 'spelling_recall', 5, 9, 'u1_49_reasonable'),
  (1, 'spelling_recall', 5, 10, 'u1_50_antiques')
on conflict do nothing;
-- END GENERATED MEMBERS

create or replace function private.vocabulary_set_require_members()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.vocabulary_set_members m
      where m.unit_number = new.unit_number and m.pathway_id = new.pathway_id and m.set_number = new.set_number) <> 10 then
    raise exception 'No further Set is available';
  end if;
  return new;
end;
$$;
revoke all on function private.vocabulary_set_require_members() from public, anon, authenticated;
drop trigger if exists vocabulary_pathway_sets_require_members on public.vocabulary_pathway_sets;
create trigger vocabulary_pathway_sets_require_members
before insert on public.vocabulary_pathway_sets
for each row execute function private.vocabulary_set_require_members();

create or replace function private.vocabulary_set_apply_mission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_stages constant text[] := array['recognise','match','apply','recall','mastery'];
  v_start public.vocabulary_mission_starts;
  v_set public.vocabulary_pathway_sets;
  v_outcome text;
  v_index integer;
  v_missed text[];
  v_advance boolean := false;
  v_stage text;
  v_phase text;
  v_status text;
  v_weak text[];
  v_completed text[];
  v_support jsonb;
  v_flags jsonb;
  v_members text[];
  v_attempted text[];
  v_finished text[];
begin
  if new.mission_kind <> 'pathway' then
    return null;
  end if;
  -- Only a mission the server issued FOR a Set, and that is still open at this moment, can move that Set. (This trigger is named so that it runs
  -- before vocabulary_missions_close_start, which closes the start row.)
  select * into v_start from public.vocabulary_mission_starts
  where mission_id = new.mission_id and student_id = new.student_id;
  if not found or v_start.set_number is null or v_start.status <> 'open' then
    return null;
  end if;

  select * into v_set from public.vocabulary_pathway_sets
  where student_id = new.student_id and unit_number = v_start.unit_number and pathway_id = v_start.pathway_id and set_number = v_start.set_number
  for update;
  if not found then
    return null;
  end if;

  update public.vocabulary_missions set set_number = v_start.set_number, set_phase = v_start.set_phase where mission_id = new.mission_id;

  if new.mission_id = any(v_set.applied_mission_ids) then
    return null;                                                    -- a mission settles at most once
  end if;
  -- A replay of a finished Set, a stale step, or a mission whose recorded attempts name another stage is remembered but moves nothing.
  if v_set.status = 'maintain'
     or v_start.pathway_stage <> v_set.stage
     or v_start.set_phase <> v_set.phase
     or new.pathway_stage is distinct from v_start.pathway_stage
     or new.pathway_id is distinct from v_start.pathway_id
     or new.unit_number <> v_start.unit_number then
    update public.vocabulary_pathway_sets
    set applied_mission_ids = applied_mission_ids || new.mission_id, updated_at = now()
    where student_id = v_set.student_id and unit_number = v_set.unit_number and pathway_id = v_set.pathway_id and set_number = v_set.set_number;
    return null;
  end if;

  -- MEMBERSHIP (hardening): a Set mission only moves the Set when the targets the student actually worked and FINISHED are exactly the Set's
  -- ten authoritative members. Membership is read from the protected server table, never from the client. Order is irrelevant; duplicates
  -- cannot inflate it (distinct ids); an outside target, a missing member or an extra target means nothing advances. The attempts themselves
  -- stay recorded as ordinary evidence; the mission is remembered as applied so a replay cannot be re-tried later.
  select coalesce(array_agg(m.occurrence_id order by m.occurrence_id), '{}') into v_members
  from public.vocabulary_set_members m
  where m.unit_number = v_start.unit_number and m.pathway_id = v_start.pathway_id and m.set_number = v_start.set_number;

  select coalesce(array_agg(distinct ae.metadata->>'occurrence_id' order by ae.metadata->>'occurrence_id'), '{}') into v_attempted
  from public.activity_events ae
  where ae.user_id = new.student_id and ae.app_key = 'vocabulary_paraphrase' and ae.event_type = 'question_attempt'
    and ae.metadata->>'mission_id' = new.mission_id::text;

  -- Same finishing rule as record_vocabulary_mission: a correct first attempt, or the second attempt of a recovery re-ask.
  select coalesce(array_agg(distinct ae.metadata->>'occurrence_id' order by ae.metadata->>'occurrence_id'), '{}') into v_finished
  from public.activity_events ae
  where ae.user_id = new.student_id and ae.app_key = 'vocabulary_paraphrase' and ae.event_type = 'question_attempt'
    and ae.metadata->>'mission_id' = new.mission_id::text
    and (((ae.metadata->>'attempt_number') = '1' and ae.metadata->>'outcome' = 'correct')
      or ((ae.metadata->>'attempt_number') = '2' and coalesce((ae.metadata->>'recovery')::boolean, false)));

  if array_length(v_members, 1) is distinct from 10
     or v_attempted is distinct from v_members
     or v_finished is distinct from v_members then
    update public.vocabulary_pathway_sets
    set applied_mission_ids = applied_mission_ids || new.mission_id,
        history = history || jsonb_build_array(jsonb_build_object('missionId', new.mission_id, 'stage', v_set.stage, 'kind', v_set.phase, 'rejected', 'targets_not_set_members')),
        updated_at = now()
    where student_id = v_set.student_id and unit_number = v_set.unit_number and pathway_id = v_set.pathway_id and set_number = v_set.set_number;
    return null;
  end if;

  v_outcome := case when new.score >= 8 then 'pass' when new.score >= 6 then 'consolidate' else 'recovery' end;
  v_index := array_position(v_stages, v_set.stage);
  v_stage := v_set.stage; v_phase := v_set.phase; v_status := v_set.status;
  v_weak := v_set.weak_target_ids; v_completed := v_set.completed_stages;
  v_support := v_set.advanced_with_support; v_flags := v_set.support_flags;

  -- The targets the student did not get right first time in THIS mission (only needed when the mission is not a clean pass).
  if v_outcome <> 'pass' then
    select coalesce(array_agg(occ order by occ), '{}') into v_missed from (
      select ae.metadata->>'occurrence_id' as occ
      from public.activity_events ae
      where ae.user_id = new.student_id and ae.app_key = 'vocabulary_paraphrase' and ae.event_type = 'question_attempt'
        and ae.metadata->>'mission_id' = new.mission_id::text
      group by ae.metadata->>'occurrence_id'
      having not bool_or((ae.metadata->>'attempt_number') = '1' and ae.metadata->>'outcome' = 'correct')
    ) missed;
  else
    v_missed := '{}';
  end if;

  if v_set.phase = 'stage' then
    if v_outcome = 'pass' then v_advance := true;
    else v_phase := case when v_outcome = 'consolidate' then 'consolidate' else 'recovery' end; v_weak := v_missed; end if;
  elsif v_set.phase = 'consolidate' then
    if v_outcome = 'pass' then v_advance := true;
    else v_phase := 'recovery'; v_weak := v_missed; end if;
  elsif v_set.phase = 'recovery' then
    v_phase := 'fresh';                                              -- Recovery itself never advances
  else                                                               -- 'fresh': one fresh full stage mission, then the learner moves on
    v_advance := true;
    if v_outcome <> 'pass' then
      v_support := v_support || jsonb_build_array(jsonb_build_object('stage', v_set.stage, 'missionId', new.mission_id));
      v_flags := v_flags || jsonb_build_array(jsonb_build_object(
        'stage', v_set.stage, 'missionId', new.mission_id, 'targetIds', to_jsonb(v_missed),
        'reason', 'recovery_sequence_not_passed', 'blocksProgression', false));
    end if;
  end if;

  if v_advance then
    v_completed := v_completed || v_set.stage;
    v_weak := '{}';
    v_phase := 'stage';
    if v_index = array_length(v_stages, 1) then
      v_status := 'maintain';                                        -- passing Mastery: the Set is Maintain and never falls back
    else
      v_stage := v_stages[v_index + 1];
    end if;
  end if;

  update public.vocabulary_pathway_sets
  set stage = v_stage, phase = v_phase, status = v_status, weak_target_ids = v_weak, completed_stages = v_completed,
      advanced_with_support = v_support, support_flags = v_flags,
      history = history || jsonb_build_array(jsonb_build_object('missionId', new.mission_id, 'stage', v_set.stage, 'kind', v_set.phase, 'outcome', v_outcome, 'score', new.score)),
      applied_mission_ids = applied_mission_ids || new.mission_id,
      updated_at = now(),
      completed_at = case when v_status = 'maintain' then now() else null end
  where student_id = v_set.student_id and unit_number = v_set.unit_number and pathway_id = v_set.pathway_id and set_number = v_set.set_number;
  return null;
end;
$$;
revoke all on function private.vocabulary_set_apply_mission() from public, anon, authenticated;

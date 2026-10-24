-- Vocabulary Builder: Set membership v2 (STAGE_CONTRACT v2, Job 8). ADDITIVE; nothing here is applied automatically.
--
-- Why: the stage ladders changed, so a target that cannot be served at every stage of a pathway must not sit in that pathway's Set.
-- Unit 1 effect (computed from the release by scripts/generate-set-membership-sql.mjs, checked by tests/vocabulary-set-membership.test.js):
--   * meaning Set 4: u1_36_competitor and u1_42_historic are replaced by u1_43_selection and u1_44_produce. Meaning Mastery needs TWO usable
--     authored mastery sentences (per-word Mastery completes on two distinct prompts) whose glosses do not show the word: historic has none
--     (its gloss exposes "history"); competitor has one. All other meaning, context, precision_use and spelling_recall Sets are IDENTICAL to the seed.
--   * word_families: no longer live (no family is authored with per-form metadata, so Mastery cannot be offered). Its three seeded Sets are
--     LEFT IN PLACE (no delete); the app does not offer them. If authoring later makes the pathway live, re-run the generator: a membership
--     that differs from the seed is added here as another guarded replacement.
-- Version strategy: 20261024170000 is immutable. A Set is replaced ONLY while no student has started it. If any student has, the migration
-- RAISES (it never skips silently and never reshuffles): decide a policy (new Set version, or keep the old member) before re-running.
-- Run AFTER 20261024170000 and BEFORE deploying the Edge Function. RLS is unchanged (students can read, never write, vocabulary_set_members).
-- No student data is read or written.

-- BEGIN GENERATED DELTA (scripts/generate-set-membership-sql.mjs)
do $$
begin
  if exists (select 1 from public.vocabulary_pathway_sets where unit_number = 1 and pathway_id = 'meaning' and set_number = 4) then
    raise exception 'Set 1/meaning/4 has already been started by a student; its members must not change silently. Decide a version policy first.';
  end if;
  delete from public.vocabulary_set_members where unit_number = 1 and pathway_id = 'meaning' and set_number = 4;
  insert into public.vocabulary_set_members (unit_number, pathway_id, set_number, position, occurrence_id) values
    (1, 'meaning', 4, 1, 'u1_32_estimated'),
    (1, 'meaning', 4, 2, 'u1_33_struggle'),
    (1, 'meaning', 4, 3, 'u1_34_minimum'),
    (1, 'meaning', 4, 4, 'u1_35_championship'),
    (1, 'meaning', 4, 5, 'u1_38_patience'),
    (1, 'meaning', 4, 6, 'u1_39_atmosphere'),
    (1, 'meaning', 4, 7, 'u1_40_incredible'),
    (1, 'meaning', 4, 8, 'u1_41_criteria'),
    (1, 'meaning', 4, 9, 'u1_43_selection'),
    (1, 'meaning', 4, 10, 'u1_44_produce');
end $$;
-- END GENERATED DELTA

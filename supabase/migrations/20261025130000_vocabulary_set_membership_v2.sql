-- Vocabulary Builder: Set membership v2 (STAGE_CONTRACT v2, Job 8). ADDITIVE; nothing here is applied automatically.
--
-- Why: the stage ladders changed (Job 8) and Unit 1 content was closed (Job 9), so the live Word Families membership differs from the seed.
-- Unit 1 effect (computed from the release by scripts/generate-set-membership-sql.mjs, checked by tests/vocabulary-set-membership.test.js):
--   * word_families Sets 1-2: Word Families is now LIVE for the 29 targets with a reviewed, complete family (content/vocabulary/units/unit-01-word-families.js).
--     The seed listed 37 bare-string targets in three Sets; the targets without an eligible family are removed and the eligible ones are
--     re-packed in authored order, so Sets 1 and 2 are REPLACED. The 9 eligible targets beyond the 20 form no complete Set and are held back
--     (never padded). Word Families was not live between the seed and now, so no student could have started these Sets; the guard below
--     still raises if any has.
--   * word_families Set 3 (seed): REMOVED. The app no longer offers a third Word Families Set, and leftover rows are NOT inert (server Set
--     progression can open the next Set number and the old rows would satisfy the membership guard). The same started-Set guard applies, then
--     the ten rows are deleted with no replacement. Final Unit 1 membership is exactly the release membership (200 rows).
--   * meaning, context, precision_use, spelling_recall: IDENTICAL to the seed (Job 9 authored the missing Meaning Mastery contexts for
--     historic and competitor, so the Job 8 Meaning Set 4 replacement is no longer needed and is not generated).
-- Version strategy: 20261024170000 is immutable. A Set is replaced ONLY while no student has started it. If any student has, the migration
-- RAISES (it never skips silently and never reshuffles): decide a policy (new Set version, or keep the old member) before re-running.
-- Run AFTER 20261024170000 and BEFORE deploying the Edge Function. RLS is unchanged (students can read, never write, vocabulary_set_members).
-- No student data is read or written.

-- BEGIN GENERATED DELTA (scripts/generate-set-membership-sql.mjs)
-- CONTENT LOCK version=unit-01/job9 membership=916d07fc46b44ef0d3ea1746c3642eb701e4121c6429a2fefc83ef2413a4751c
do $$
begin
  if exists (select 1 from public.vocabulary_pathway_sets where unit_number = 1 and pathway_id = 'word_families' and set_number = 1) then
    raise exception 'Set 1/word_families/1 has already been started by a student; its members must not change silently. Decide a version policy first.';
  end if;
  if exists (select 1 from public.vocabulary_pathway_sets where unit_number = 1 and pathway_id = 'word_families' and set_number = 2) then
    raise exception 'Set 1/word_families/2 has already been started by a student; its members must not change silently. Decide a version policy first.';
  end if;
  if exists (select 1 from public.vocabulary_pathway_sets where unit_number = 1 and pathway_id = 'word_families' and set_number = 3) then
    raise exception 'Set 1/word_families/3 has already been started by a student; its members must not change silently. Decide a version policy first.';
  end if;
  delete from public.vocabulary_set_members where unit_number = 1 and pathway_id = 'word_families' and set_number = 1;
  insert into public.vocabulary_set_members (unit_number, pathway_id, set_number, position, occurrence_id) values
    (1, 'word_families', 1, 1, 'u1_02_preference'),
    (1, 'word_families', 1, 2, 'u1_03_avoid'),
    (1, 'word_families', 1, 3, 'u1_04_afford'),
    (1, 'word_families', 1, 4, 'u1_05_deny'),
    (1, 'word_families', 1, 5, 'u1_07_arrange'),
    (1, 'word_families', 1, 6, 'u1_09_recommend'),
    (1, 'word_families', 1, 7, 'u1_11_threaten'),
    (1, 'word_families', 1, 8, 'u1_12_resent'),
    (1, 'word_families', 1, 9, 'u1_13_regret'),
    (1, 'word_families', 1, 10, 'u1_14_unfamiliar');
  delete from public.vocabulary_set_members where unit_number = 1 and pathway_id = 'word_families' and set_number = 2;
  insert into public.vocabulary_set_members (unit_number, pathway_id, set_number, position, occurrence_id) values
    (1, 'word_families', 2, 1, 'u1_16_opponent'),
    (1, 'word_families', 2, 2, 'u1_17_intense'),
    (1, 'word_families', 2, 3, 'u1_19_determined'),
    (1, 'word_families', 2, 4, 'u1_20_discipline'),
    (1, 'word_families', 2, 5, 'u1_22_achievement'),
    (1, 'word_families', 2, 6, 'u1_24_overwhelming'),
    (1, 'word_families', 2, 7, 'u1_26_challenge'),
    (1, 'word_families', 2, 8, 'u1_27_solution'),
    (1, 'word_families', 2, 9, 'u1_32_estimated'),
    (1, 'word_families', 2, 10, 'u1_34_minimum');
  delete from public.vocabulary_set_members where unit_number = 1 and pathway_id = 'word_families' and set_number = 3;
end $$;
-- END GENERATED DELTA

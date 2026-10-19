# Unit 1 Word Family Depth — Implementation Plan

## Scope

Expand genuine Unit 1 lexical families so the Word Families Match rung can serve the full curated Unit 1 word-family cohort without inventing forms or changing progression rules.

## Constraints

- Unit 1 Word Families only.
- Preserve all pathway thresholds, mastery/evidence rules, attempt IDs, idempotency and persistence semantics.
- Keep the existing curated prompt bank and unused-prompt rotation unchanged unless a test proves a defect.
- Add only defensible English word-family forms suitable for Cambridge IGCSE ESL learners.
- Do not pad coverage with obscure or dubious derivatives; fail/withhold rather than invent.

## Task 1 — Lock the content-depth contract

**File:** `tests/vocabulary-unit1-word-family-depth.test.js`

Add a regression that:
- identifies every Unit 1 target with curated `word_family` activity content;
- requires at least three distinct same-family surface forms (target lemma + authored family forms), which is the minimum for meaningful Match discrimination;
- requires at least two curated prompt records per Word Family target so Apply/Recall do not immediately recycle one cue;
- expects the curated Unit 1 Word Families cohort to contain 25 targets.

Run the branch CI and confirm this new test fails against the current 8/25 Match-ready state before changing content.

## Task 2 — Expand genuine lexical families

**File:** `content/vocabulary/units/unit-01.js`

Add one additional high-confidence family form to each currently under-depth Word Family target. Prefer common, transparent forms such as `avoidable`, `permissible`, `solvable`, `selective`, `achievable`, `overwhelmed`, etc. Avoid generic auto-inflection and awkward dictionary-only forms.

Run the full Vocabulary Builder CI. The depth regression and existing pathway/completability tests must pass.

## Task 3 — Verify coverage and merge safety

Confirm the Unit 1 pathway diagnostic now reports Word Families Match/allStages coverage aligned with the full 25-target curated cohort, with no reduction in any other pathway.

Open a PR only after the branch CI is green. Merge only if mergeable and then verify the exact merged `main` SHA with Vocabulary Builder CI, System Audit, Runtime Smoke and Pages deployment.

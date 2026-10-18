# Vocabulary Learning Progression Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Vocabulary Builder around an evidence-backed five-stage learning progression, add first-class foundational vocabulary activities, improve adaptive selection and distractor quality, and make progress visibly understandable without changing historical mastery data.

**Architecture:** Keep persisted mastery as `new / building / secure / mastered`, and add one shared derived stage layer for `Emerging / Building / Developing / Secure / Mastered`. Extend the activity catalogue from a minimum-stage list into family- and stage-aware metadata, then drive adaptive planning, UI progression, recovery, analytics, and new activity builders from that same source of truth. New foundational activities reuse existing vocabulary items and contexts wherever possible; no historical rows are rewritten.

**Tech Stack:** Browser ES modules, Node.js `node:test`, Supabase Edge Functions/Deno, existing vocabulary content tables, vanilla HTML/CSS/JS, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-18-vocabulary-learning-progression-design.md`

## Global Constraints

- Work only in `tobypottas-sketch/igcse-self-study-hub`.
- Preserve persisted mastery states `new`, `building`, `secure`, and `mastered`; do not add a fifth database status.
- Do not rewrite historical mastery, attempt history, or student evidence.
- Never commit raw student answers, essays, notes, teacher notes, prompts, or other private learning data.
- `correct_usage` and the legacy `collocation_builder` remain retired.
- Scaffolded matching, drag/drop, completion, spelling, and tile work must not count as independent lexical production.
- New activity types must have explicit server-side evidence contracts before they are eligible for live mastery updates.
- The same derived learning-stage function must power planner logic, student UI, summaries, analytics, and future Evidence Hub integration.
- Choice distractors must be curated or structurally/semantically plausible; obviously unrelated distractors are not acceptable.
- All motion must respect `prefers-reduced-motion`.
- Keep the existing persistence barriers, idempotent attempt IDs, failed-save blocking, timed-expiry behavior, and privacy guarantees intact.

## Review Focus

- A `building` learner with broad evidence must become **Developing** in every consumer, while narrow evidence remains **Building**.
- New foundational activities must fail closed when the required curated item/context data is unavailable rather than generating weak or misleading questions.
- Matching/drag/drop tasks must not accidentally give one target mastery credit for another target's answer or inflate independent production evidence.
- Recovery after an error must lower demand temporarily without changing the learner's persisted mastery or visible stage.
- Prompt/source rendering must not duplicate the same sentence or phrase in both the heading and a second card, including `sourceText`, `sourceIdea`, and `sourcePhrase` variants.

---

### Task 1: Add the shared five-stage learning-stage kernel

**Files:**
- Create: `src/vocabulary/learning-stage.js`
- Modify: `src/vocabulary/views.js`
- Modify: `src/vocabulary/analytics.js`
- Test: `tests/vocabulary-learning-stage.test.js`
- Test: `tests/vocabulary-view.test.js`

**Interfaces:**
- Produces: `deriveLearningStage(mastery) -> 'emerging' | 'building' | 'developing' | 'secure' | 'mastered'`.
- Produces: `LEARNING_STAGES` metadata with stable ids, labels, order, and student-facing descriptions.
- Consumes: existing mastery shape `{ status, strandEvidence }` and the existing secure threshold value `3`.

- [ ] **Step 1: Write failing learning-stage tests**

Add cases asserting: `new -> emerging`; early `building -> building`; `building` with two strands at `>=3` including `context` or `paraphrasing` -> `developing`; `building` with two non-higher strands only stays `building`; `secure -> secure`; `mastered -> mastered`; malformed/missing evidence fails safely to the persisted-status-compatible stage.

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `node --test tests/vocabulary-learning-stage.test.js`
Expected: FAIL because `deriveLearningStage` does not exist.

- [ ] **Step 3: Implement the shared stage module**

Create `deriveLearningStage(mastery)` and exported immutable stage metadata. Do not duplicate backend `deriveStatus`; this function derives only the student-facing stage from already-persisted mastery evidence.

- [ ] **Step 4: Replace renderer/analytics ad-hoc stage interpretation**

Use `deriveLearningStage` in unit progress aggregation and any vocabulary analytics path that needs the five-stage label. Keep existing teacher skill-strength labels separate where they represent a different concept.

- [ ] **Step 5: Run focused and regression tests**

Run: `node --test tests/vocabulary-learning-stage.test.js tests/vocabulary-view.test.js`
Expected: PASS.

- [ ] **Step 6: Commit**

Commit message: `feat: add shared vocabulary learning stages`

### Task 2: Upgrade the activity catalogue to family-aware progression metadata

**Files:**
- Modify: `src/vocabulary/activity-catalogue.js`
- Modify: `src/vocabulary/session-targets.js`
- Test: `tests/vocabulary-activity-builder.test.js`
- Create: `tests/vocabulary-activity-catalogue-progression.test.js`

**Interfaces:**
- Consumes: `deriveLearningStage(mastery)` from Task 1.
- Produces per activity: `family`, `earliestStage`, `preferredStages`, `supportSuitable`, `reviewSuitable`, existing `responseMode`, `strands`, `evidenceStrength`, `productive`.
- Produces helpers: `activitiesForLearningStage(stageId)` and `activitiesForFamily(familyId)`.

- [ ] **Step 1: Write failing catalogue contract tests**

Assert the five families are exactly `recognition`, `retrieval`, `discrimination`, `manipulation`, `production`; every live activity declares all progression metadata; retired activities remain non-live; production-marked activities are limited to genuinely independent production tasks.

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test tests/vocabulary-activity-catalogue-progression.test.js`
Expected: FAIL on missing metadata/helpers.

- [ ] **Step 3: Refactor catalogue metadata without yet adding new live activities**

Map all existing live activities into the new families/stages. Preserve historical ids and evidence contracts. Keep compatibility aliases such as `minimumStage` only if existing callers still require them during this task; later tasks should migrate off them.

- [ ] **Step 4: Update stage eligibility in `session-targets.js`**

Replace persisted-status-only eligibility with the derived five-stage helper while preserving fail-closed buildability checks.

- [ ] **Step 5: Run focused tests and the existing 280-question matrix**

Run: `node --test tests/vocabulary-activity-catalogue-progression.test.js tests/vocabulary-activity-builder.test.js tests/vocabulary-full-regression-matrix.test.js`
Expected: PASS.

- [ ] **Step 6: Commit**

Commit message: `refactor: make vocabulary activities progression-aware`

### Task 3: Replace hard-coded adaptive ladders with weighted family progression

**Files:**
- Modify: `src/vocabulary/adaptive-planner.js`
- Modify: `src/vocabulary/session-targets.js`
- Test: `tests/vocabulary-adaptive-planner.test.js`
- Modify: `tests/vocabulary-full-regression-matrix.test.js`

**Interfaces:**
- Consumes: `deriveLearningStage`, catalogue family metadata, recent activity history, support state, review state, and available buildable activity ids.
- Produces: `planNextActivity(...)` with `activityType`, `family`, `stage`, `supportDirection`, and existing `avoidContentIds`.

- [ ] **Step 1: Rewrite planner tests around the approved probability bands**

Pin family target mixes for Emerging `70/20/10/0/0`, Building `25/50/20/5/0`, Developing `10/25/45/20/0`, Secure `5/15/25/40/15`, Mastered `5/10/15/25/45`. Do not test random frequency statistically; test deterministic family ranking/selection under seeded or controlled availability.

- [ ] **Step 2: Add movement-rule tests**

Assert: repeated clean success increases demand; one miss does not alter stage; `struggling/recycle` selects a lower-demand support-suitable family; two high-demand recent activities bias toward lower friction; same activity type is avoided consecutively when alternatives exist; no more than three same-family activities are preferred in a normal mixed 10-question history.

- [ ] **Step 3: Run planner tests and verify RED**

Run: `node --test tests/vocabulary-adaptive-planner.test.js`
Expected: FAIL against the current hard-coded ladders.

- [ ] **Step 4: Implement deterministic weighted family selection**

Use stage mix + recent-history deficit to select a family first, then choose the first eligible concrete activity from that family. Preserve focused-mode boundaries and review behavior. Recovery may step down one or more demand bands but must not mutate mastery.

- [ ] **Step 5: Update timed mixed selection to use the same progression model**

Keep timed practice readiness-safe and variable, but do not create a second planner.

- [ ] **Step 6: Run planner + full matrix tests**

Run: `node --test tests/vocabulary-adaptive-planner.test.js tests/vocabulary-full-regression-matrix.test.js`
Expected: PASS across all modes/stages.

- [ ] **Step 7: Commit**

Commit message: `feat: make vocabulary adaptation family weighted`

### Task 4: Add server evidence contracts for foundational recognition/retrieval activities

**Files:**
- Modify: `supabase/functions/vocabulary-attempt-action/validation.js`
- Modify: `supabase/functions/vocabulary-attempt-action/index.ts`
- Modify: `supabase/functions/_shared/vocabulary-engine.js`
- Modify: `src/vocabulary/data.js`
- Test: `tests/vocabulary-attempt-validation.test.js`
- Test: `tests/vocabulary-mastery.test.js`
- Test: `tests/vocabulary-data.test.js`

**Interfaces:**
- Adds bounded question types for the first foundational release: `definition_to_word`, `word_definition_match`, `drag_word_definition`, `drag_definition_word`, `gap_fill_bank`, `drag_word_sentence`, `type_missing_word`, `spell_word`, `choose_word_sentence`, `word_family_choice`.
- Adds `contentSource:'item'` for activities whose authoritative answer is the vocabulary item/sense rather than a context or unit activity.
- Item-backed requests still carry only `occurrenceId`, `questionType`, raw response, and categorical evidence metadata; the server resolves the item/sense authoritatively.

- [ ] **Step 1: Add failing validation tests for the new bounded types and `item` source**

Assert unknown types/sources remain rejected, `item` requires no client-supplied answer bank, activity/context ids cannot be forged into an item-backed request, and raw answer text still never enters stored metadata.

- [ ] **Step 2: Add failing mastery/evidence tests**

Assert recognition activities strengthen meaning/recognition only; gap fill/spelling/retrieval strengthen recognition/meaning and where context-backed also context; none increment independent production counts.

- [ ] **Step 3: Run focused tests and verify RED**

Run: `node --test tests/vocabulary-attempt-validation.test.js tests/vocabulary-mastery.test.js tests/vocabulary-data.test.js`
Expected: FAIL on new contracts.

- [ ] **Step 4: Implement authoritative item/context marking**

For item-backed definition/word/spelling questions, resolve the live occurrence, live item, and selected sense server-side and construct accepted answers from the canonical term/core meaning/sense meaning/accepted paraphrases according to question type. For context-backed gap-fill questions, require an approved context type and accepted answer relationship. Do not trust browser `markingReference`.

- [ ] **Step 5: Add ACTIVITY_EVIDENCE and strand mappings**

Keep recognition/retrieval evidence at `light` or `medium` as approved; `productive:false` for every new foundational activity.

- [ ] **Step 6: Update the browser submission adapter for `contentSource:'item'`**

Do not add student identity or accepted-answer payloads.

- [ ] **Step 7: Run focused tests**

Expected: PASS.

- [ ] **Step 8: Commit**

Commit message: `feat: add evidence contracts for foundational vocabulary tasks`

### Task 5: Build the new foundational question generators with fail-closed content quality

**Files:**
- Modify: `src/vocabulary/activity-catalogue.js`
- Modify: `src/vocabulary/activity-builder.js`
- Modify: `src/vocabulary/session-targets.js`
- Test: `tests/vocabulary-activity-builder.test.js`
- Create: `tests/vocabulary-foundational-activities.test.js`

**Interfaces:**
- Produces first-class activities for MCQ definition/word recognition, word-definition matching, drag/drop matching, word-bank gap fill, drag-into-sentence, typed missing word, spelling, choose-word-for-sentence, and word-family choice.
- Each built activity returns the existing base fields plus mode-specific fields such as `pairs`, `draggables`, `dropTargets`, `wordBank`, or `spellingPattern`.

- [ ] **Step 1: Add failing builder tests for each new activity type**

Each test must assert a meaningful prompt, stable seeded order, correct response mode, authoritative content source, evidence metadata, and no accidental productive flag.

- [ ] **Step 2: Add quality/eligibility failure tests**

Assert builders fail closed when: fewer than enough plausible choices exist; a gap-fill context does not contain the target/rewrite needed to create a valid blank; a word-family task lacks alternatives; matching cannot form a usable set; a spelling task lacks a valid target term.

- [ ] **Step 3: Run tests and verify RED**

Run: `node --test tests/vocabulary-foundational-activities.test.js tests/vocabulary-activity-builder.test.js`
Expected: FAIL on missing builders.

- [ ] **Step 4: Implement recognition builders**

Prefer curated `misleadingDistractors` and same-part-of-speech, structurally comparable unit alternatives. Never fill a four-choice task with unrelated filler just to reach four options.

- [ ] **Step 5: Implement retrieval builders**

Derive word-bank/drag/text/spelling tasks only from authoritative live item/context data. Keep raw answer truth in `markingReference` only for client display/retry support; server remains authoritative.

- [ ] **Step 6: Implement matching/drag task structure**

Use one primary evidence target per generated question. Additional displayed pairs are practice context/distractors, not separate mastery updates, unless a later dedicated multi-target evidence contract is designed. The primary target's correct pairing must be independently identifiable so another pair cannot cause false mastery credit.

- [ ] **Step 7: Add new types to `availableActivityTypesForTarget` only when build prerequisites are present**

Eligibility must remain fail-closed.

- [ ] **Step 8: Run builder + matrix tests**

Expected: PASS.

- [ ] **Step 9: Commit**

Commit message: `feat: add foundational vocabulary learning activities`

### Task 6: Add first-class matching, drag/drop, gap-fill, and spelling UI controls

**Files:**
- Modify: `src/vocabulary/views.js`
- Modify: `src/vocabulary/app.js`
- Modify: `src/vocabulary/scaffolding.js`
- Modify: `vocabulary-refresh.css`
- Create: `tests/vocabulary-foundational-rendering.test.js`
- Modify: `tests/vocabulary-scaffolding.test.js`

**Interfaces:**
- Consumes response modes `matching`, `drag_match`, `drag_gap`, `spelling`, existing `choice`, `text`, `tiles`, `evidence`.
- Produces normalized answer values that `app.js` submits through the existing persistence chain.

- [ ] **Step 1: Add failing renderer tests for all new response modes**

Assert accessible labels/instructions, deterministic data attributes, keyboard-operable non-pointer fallback controls, and no answer truth embedded in a way that makes the task trivial.

- [ ] **Step 2: Add failing scaffolding tests**

First miss should narrow matching/drag options or reveal a bounded clue; second unsuccessful attempt moves on/recycles exactly as existing tasks do; spelling support reveals only a partial clue, not the full word.

- [ ] **Step 3: Run tests and verify RED**

Run: `node --test tests/vocabulary-foundational-rendering.test.js tests/vocabulary-scaffolding.test.js`
Expected: FAIL.

- [ ] **Step 4: Implement semantic form controls and progressive enhancement**

Drag/drop must work with pointer interaction and keyboard/click selection. The submitted answer must be derivable from the form state without bypassing the central submission/persistence path.

- [ ] **Step 5: Wire `app.js` event handling without bypassing persistence barriers**

Keep idempotent attempt creation, retry state, failed-save blocking, and timed expiry unchanged.

- [ ] **Step 6: Add restrained interaction CSS**

Use short transitions for drag target activation, successful placement, feedback entry, and button state. Add explicit `@media (prefers-reduced-motion: reduce)` coverage.

- [ ] **Step 7: Run focused tests**

Expected: PASS.

- [ ] **Step 8: Commit**

Commit message: `feat: render foundational vocabulary interactions`

### Task 7: Fix prompt/source hierarchy and eliminate redundant source cards across all activities

**Files:**
- Modify: `src/vocabulary/views.js`
- Modify: `src/vocabulary/activity-builder.js`
- Modify: `vocabulary-refresh.css`
- Create: `tests/vocabulary-question-hierarchy.test.js`

**Interfaces:**
- Produces one normalized view model for `instruction`, `target`, `source`, and `response` rather than relying on prompt suffix stripping alone.

- [ ] **Step 1: Write regression tests from the reported examples**

Cover `sourceText`, `sourceIdea`, and `sourcePhrase`; assert instruction and source render as distinct regions; assert the same normalized text cannot appear in both the prompt and source card; assert source card is omitted when it would duplicate the question; assert feedback and Continue controls remain spatially separate; assert retry support renders only one support-message layer.

- [ ] **Step 2: Run test and verify RED against the current renderer**

Run: `node --test tests/vocabulary-question-hierarchy.test.js`
Expected: at least the redundant prompt/source cases FAIL.

- [ ] **Step 3: Make builders expose structured prompt/source fields consistently**

Prefer explicit structured fields over embedding source text into `prompt` with a newline. Preserve backwards compatibility for historical/legacy question shapes during the transition.

- [ ] **Step 4: Refactor renderer hierarchy**

Render: target/status cue -> instruction heading -> optional non-duplicate source/example region -> response region -> feedback/continuation. Do not render an “Original phrase/idea” card when it repeats the exact instruction content.

- [ ] **Step 5: Harden layout CSS for long prompts/options**

Prevent giant headings, overflow, squashed feedback/Continue controls, and excessively tall retry stacks.

- [ ] **Step 6: Run hierarchy + view regressions**

Run: `node --test tests/vocabulary-question-hierarchy.test.js tests/vocabulary-view.test.js`
Expected: PASS.

- [ ] **Step 7: Commit**

Commit message: `fix: clarify vocabulary question hierarchy`

### Task 8: Add visible five-stage progress and session movement summaries

**Files:**
- Modify: `src/vocabulary/views.js`
- Modify: `src/vocabulary/session.js`
- Modify: `src/vocabulary/app.js`
- Modify: `vocabulary-refresh.css`
- Modify: `tests/vocabulary-view.test.js`
- Modify: `tests/vocabulary-session.test.js`
- Create: `tests/vocabulary-progress-visuals.test.js`

**Interfaces:**
- Consumes: `deriveLearningStage` and before/after mastery snapshots.
- Produces session summary counts for `movedToBuilding`, `movedToDeveloping`, `movedToSecure`, `movedToMastered`, plus existing completion/recovery signals.

- [ ] **Step 1: Add failing unit-progress tests**

Assert a five-segment Emerging/Building/Developing/Secure/Mastered distribution is calculated from canonical stage derivation, totals equal the unit target count, and normal progression uses no red “weak/failed” wording.

- [ ] **Step 2: Add failing in-question/status and session-summary tests**

Assert the current target can show its stage; a genuine Building -> Developing transition produces a movement message; unchanged stages do not fake progress; summary reports only movements that occurred.

- [ ] **Step 3: Run tests and verify RED**

Run: `node --test tests/vocabulary-progress-visuals.test.js tests/vocabulary-session.test.js tests/vocabulary-view.test.js`
Expected: FAIL.

- [ ] **Step 4: Track before/after derived stage around authoritative save results**

Do not predict mastery movement solely from client-side marking. Use the authoritative mastery returned after persistence where available; preview mode may use the local engine only because it does not mutate student evidence.

- [ ] **Step 5: Render compact stage cues and unit distribution**

Use calm labels and a segmented horizontal bar. Keep the existing non-intimidating unit design; do not reintroduce giant whole-course counts.

- [ ] **Step 6: Add quiet stage/recovery/mastery transitions**

Stage advancement gets a brief fill/pulse; Mastered gets a slightly stronger tick/completion moment; recovery may show `Recovered ✓`. Respect reduced motion.

- [ ] **Step 7: Run focused tests**

Expected: PASS.

- [ ] **Step 8: Commit**

Commit message: `feat: show vocabulary learning progress`

### Task 9: Align teacher analytics and skill profiles with the new activity families

**Files:**
- Modify: `src/vocabulary/skill-profile.js`
- Modify: `src/vocabulary/analytics.js`
- Test: `tests/vocabulary-skill-profile.test.js`
- Test: `tests/vocabulary-analytics.test.js`

**Interfaces:**
- Consumes: new question type ids and `deriveLearningStage`.
- Produces privacy-safe categorical teacher evidence that remains compatible with future Evidence Hub exchange.

- [ ] **Step 1: Add failing skill-profile mappings for every new activity type**

Recognition/retrieval tasks should contribute to appropriate meaning/context/writing-vocabulary skill evidence but never `lexical_production` unless the activity is independently productive.

- [ ] **Step 2: Add stage-distribution analytics tests**

Teacher summaries may expose counts of Emerging/Building/Developing/Secure/Mastered derived from canonical evidence without creating a new persisted status.

- [ ] **Step 3: Run tests and verify RED**

Run: `node --test tests/vocabulary-skill-profile.test.js tests/vocabulary-analytics.test.js`
Expected: FAIL on missing mappings/stage distribution.

- [ ] **Step 4: Implement mappings and stage aggregation**

Do not change historical events; interpret old and new categorical metadata safely.

- [ ] **Step 5: Run focused tests**

Expected: PASS.

- [ ] **Step 6: Commit**

Commit message: `feat: align vocabulary analytics with learning progression`

### Task 10: End-to-end hardening, content-quality audit, and release gate

**Files:**
- Modify as defects require only after a failing regression test exists.
- Test: `tests/vocabulary-full-regression-matrix.test.js`
- Add focused regression tests for any defect discovered.

**Interfaces:**
- Consumes all prior tasks.
- Produces a merge-ready branch with no known progression, evidence, privacy, or rendering regressions.

- [ ] **Step 1: Expand the regression matrix to five visible stages**

Keep persisted status inputs valid while adding distinct early-Building and Developing evidence fixtures. Run all focused modes and Adaptive through Q1 -> Q10 and assert live/buildable/mode-valid activities with family variety.

- [ ] **Step 2: Add a deterministic foundational-activity coverage check**

For Unit 1, prove at least one buildable example exists for every new foundational activity intended to be live. If a type lacks sufficient curated content, leave it unavailable for that target rather than weakening its builder contract.

- [ ] **Step 3: Audit choice distractor quality in generated Unit 1 questions**

Add structural assertions where machine-testable: no duplicate options; no correct answer repeated; comparable option forms; curated misconception distractors preferred; retired activity ids absent. Manually inspect a representative sample of Meaning Match, Definition -> Word, Same Idea, Spot Meaning Change, and question-text choices before merge.

- [ ] **Step 4: Run the full suite**

Run: `npm test`
Expected: all tests PASS.

- [ ] **Step 5: Run vocabulary-specific CI/content validation**

Require the same checks used by Vocabulary Builder CI and existing publish-scope/content validators to pass.

- [ ] **Step 6: Open PR and review the exact diff**

Verify no unrelated repo/app changes, no private data, no schema rewrite, no retired activity resurrection, no accidental production-strength inflation, and no direct browser mastery writes.

- [ ] **Step 7: Merge only after all PR checks pass**

Use the repository's normal merge flow. Record the exact merge SHA.

- [ ] **Step 8: Verify post-merge workflows on the exact merge SHA**

Require Vocabulary Builder CI, System Audit, Runtime Smoke, and GitHub Pages deployment to succeed before declaring the redesign live.

- [ ] **Step 9: Perform live smoke checks**

Verify: unit entry remains immediate; no skill selected by default; Emerging learners receive foundational tasks; drag/drop has a keyboard fallback; prompt/source duplication is gone; recovery works; stage movement is visible; reduced-motion mode suppresses nonessential movement; Back to unit still waits for persistence without unnecessary reloads.

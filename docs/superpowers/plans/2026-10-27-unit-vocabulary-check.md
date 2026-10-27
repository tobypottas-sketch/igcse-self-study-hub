# Unit Vocabulary Check V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Unit 1 Cambridge iGCSE ESL 0511 formal vocabulary check with three unseen forms, three attempts, delayed feedback, persistent passage visibility and separate saved scores.

**Architecture:** Keep the formal check isolated from pathway mastery and the existing vocabulary attempt engine. Store authored forms in a dedicated content module, render/run the check through focused assessment modules, and persist only score metadata in a dedicated Supabase table with student-owned RLS.

**Tech Stack:** Vanilla JavaScript/HTML/CSS, Node test runner, Supabase/Postgres/RLS.

**Spec:** `docs/superpowers/plans/2026-10-27-unit-vocabulary-check-design.md`

## Global Constraints
- Unit 1 pilot only.
- One check, three fixed forms, maximum three attempts.
- 10 questions per form: 6 passage MCQ + 2 paraphrase MCQ + 1 typed word-form + 1 precision/collocation MCQ.
- No per-question feedback before submission.
- Attempts 1–2 never reveal correct answers.
- Attempt 3 unlocks full review.
- Passage stays available while Q1–6 are answered.
- Separate scores only; no changes to mastery/progression/Sets/Stage Contract/missions/XP/existing attempt engine.
- Persist score metadata only; do not persist raw student answers.

## Review Focus
- Refresh/reopen between attempts must select the correct next form and never repeat a completed form.
- A failed save must not consume an attempt or falsely lock the check.
- Typed Q9 marking must normalize harmless whitespace/case but not accept wrong forms.
- Attempts 1–2 feedback must never leak the correct answer through copy or rendered data attributes.
- Responsive layout must keep the passage accessible on narrow screens and sticky beside questions on wider screens.

---

### Task 1: Curated Unit 1 assessment content

**Files:**
- Create: `content/vocabulary/checks/unit-01-check.js`
- Test: `tests/vocabulary-unit-check-content.test.js`

**Interfaces:**
- Produces: `unit1VocabularyCheck` with `unitNumber`, `title`, and `forms` A/B/C; each form exposes `passage` and exactly 10 question records with type, choices where relevant, answer, diagnostic feedback and final explanation.

- [ ] Write failing schema/content tests for three forms, exact 6+4 question mix, unique passages/questions, approved Unit 1 targets, non-leaking diagnostic feedback and complete final explanations.
- [ ] Run the focused content test and confirm failure because the module does not exist.
- [ ] Implement `unit-01-check.js` with the approved Forms A/B/C.
- [ ] Run the focused content test and confirm pass.

### Task 2: Pure assessment engine

**Files:**
- Create: `src/vocabulary/unit-check-model.js`
- Test: `tests/vocabulary-unit-check-model.test.js`

**Interfaces:**
- Consumes: `unit1VocabularyCheck`.
- Produces: pure helpers for next-form selection, answer normalization/marking, score calculation, best/latest score derivation, feedback mode and locked state.

- [ ] Write failing tests for attempt 1→A, 2→B, 3→C, locked after 3, score calculation, Q9 normalization and no form reuse.
- [ ] Run focused tests and confirm failure.
- [ ] Implement minimal pure model helpers.
- [ ] Run focused tests and confirm pass.

### Task 3: Supabase score persistence

**Files:**
- Create: `supabase/migrations/20261027_unit_vocabulary_checks.sql`
- Modify: `src/vocabulary/data.js`
- Test: `tests/vocabulary-unit-check-data.test.js`

**Interfaces:**
- Produces: `loadVocabularyUnitCheckAttempts(client, unitNumber)` and `recordVocabularyUnitCheckAttempt(client, { unitNumber, formId, attemptNumber, score, maxScore })`.

- [ ] Write failing data-contract tests asserting score-only payloads and no raw answers.
- [ ] Add migration for `vocabulary_unit_check_attempts` with unique `(student_id, unit_number, attempt_number)`, form A/B/C constraint, score bounds, timestamps and student-owned RLS.
- [ ] Implement load/record helpers in `data.js`.
- [ ] Run focused tests and confirm pass.

### Task 4: Assessment renderer and persistent passage layout

**Files:**
- Create: `src/vocabulary/unit-check-view.js`
- Create: `styles/vocabulary-unit-check.css`
- Modify: vocabulary HTML/style entry point as required to load the stylesheet.
- Test: `tests/vocabulary-unit-check-view.test.js`

**Interfaces:**
- Produces: renderers for unit card, assessment question screen, submission review and locked state.

- [ ] Write failing renderer tests for unit card placement/status copy, passage + question simultaneous rendering, no inline correctness before submission, attempts 1–2 diagnostic-only review and attempt 3 full answers.
- [ ] Implement semantic assessment markup with sticky two-column desktop/tablet layout and sticky expandable passage panel on small screens.
- [ ] Add accessibility labels, progress (`Question n of 10`) and clear submit action.
- [ ] Run focused view tests and confirm pass.

### Task 5: Wire the formal check into the Unit 1 student flow

**Files:**
- Modify: `src/vocabulary/views.js`
- Modify: `src/vocabulary/app.js`
- Test: `tests/vocabulary-unit-check-flow.test.js`

**Interfaces:**
- Consumes: model, view, data helpers and Unit 1 content.
- Produces: `open-unit-check`, answer navigation, submission/save, review and next-attempt behavior.

- [ ] Write failing flow tests proving the check appears after pathways/before Beyond the pathways, starts the correct form, never sends existing mastery attempts, saves only on final submit, advances forms only after successful save and locks after Form C.
- [ ] Add unit-check state to the app without altering pathway/session state machines.
- [ ] Wire event handlers and load saved attempt summaries when Unit 1 opens.
- [ ] Ensure preview mode does not record attempts.
- [ ] Run focused flow tests and confirm pass.

### Task 6: Regression and full verification

**Files:**
- Test existing Vocabulary suite plus new tests.

- [ ] Run all Unit Check tests.
- [ ] Run `node --test --test-reporter=tap tests/vocabulary*.test.js` and require zero failures.
- [ ] Run `npm test -- --test-reporter=tap` and require zero failures.
- [ ] Run `git diff --check`.
- [ ] Review diff specifically for protected architecture: no Stage Contract, pathway progression, Sets, mastery/evidence, missions, XP, games or sound changes.
- [ ] Open a PR against `main`, leave it unmerged, and document validation plus any migration step required for Supabase.

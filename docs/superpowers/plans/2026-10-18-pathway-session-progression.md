# Pathway Session Progression Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make fixed vocabulary pathways advance through Recognise → Match → Apply → Recall → Mastery from successful 10-question practice sets, without losing granular per-word evidence.

**Architecture:** Add a separate unit-level pathway journey record for each student/unit/pathway. The server-authoritative attempt action updates this journey from marked answers, while existing per-word pathway evidence remains unchanged. The student UI reads journey stage for pathway cards/session headers and shows both stage progress and question-set progress.

**Tech Stack:** Vanilla JS, Supabase Postgres/RLS, Supabase Edge Functions, Node test runner, GitHub Actions.

**Spec:** Current chat-approved design: pathway journey progression is separate from per-word evidence; one untouched word must not hold the entire pathway on Recognise; practice sets are 10 questions; successful performance advances the pathway stage.

## Global Constraints

- Keep all existing word-level pathway evidence and mastery thresholds intact.
- Do not rewrite or delete historical student evidence.
- Keep server-authoritative marking and idempotency protections.
- No private student data in GitHub.
- Do not touch Evidence Hub.

## Review Focus

- Duplicate attempt submissions must not double-count journey attempts or successes.
- Wrong/retry-supported answers must not count as clean journey successes.
- A pathway stage must never move backwards.
- Existing students with no journey row must start at Recognise without losing word-level evidence.
- Preview/staff mode must never persist journey progress.

---

### Task 1: Unit-level pathway journey model

**Files:**
- Create: `supabase/migrations/20261018140000_vocabulary_pathway_journey.sql`
- Create: `src/vocabulary/pathway-journey.js`
- Test: `tests/vocabulary-pathway-journey.test.js`

**Interfaces:**
- Produces `normalizePathwayJourney(row)` and `journeyStageFor(pathwayId, rows)`.
- Database row key: `(student_id, unit_number, pathway_id)`.
- Stage pass rule: 10-question stage window, advance when clean successes >= 8; otherwise remain on same stage and reset the window.

- [ ] Write failing tests for default Recognise, stage advancement, non-regression, and reset after a failed 10-question window.
- [ ] Add migration/table/RLS and pure journey helper.
- [ ] Run focused tests and commit.

### Task 2: Server-authoritative attempt updates

**Files:**
- Modify: `supabase/functions/vocabulary-attempt-action/index.ts`
- Modify: `src/vocabulary/data.js`
- Test: `tests/vocabulary-pathway-server-contract.test.js`

**Interfaces:**
- Attempt response adds `pathwayJourney` when a pathway attempt is saved.
- Journey counts every answered pathway question as an attempt; only correct, first-attempt, no-retry, no-support answers count as clean successes.
- Duplicate `attemptId` returns saved state without incrementing journey counters.

- [ ] Write RED server-contract test.
- [ ] Update edge function to read/update journey after a non-duplicate authoritative attempt commit.
- [ ] Add client loader for unit journey rows.
- [ ] Run focused tests and commit.

### Task 3: Client stage source + visible set progress

**Files:**
- Modify: `src/vocabulary/app.js`
- Modify: `src/vocabulary/pathway-view-model.js`
- Modify: `src/vocabulary/views.js`
- Modify: `vocabulary-pathway-progress.css`
- Test: `tests/vocabulary-pathway-session-progression.test.js`

**Interfaces:**
- `buildUnitPathwayStates` accepts `journeyByPathway` and uses journey stage for the unit card rather than the lowest word stage.
- `renderVocabularyQuestion` receives pathway ID/stage and set counts.
- Session header shows stage progress plus `Question N of 10` progress bar.

- [ ] Write RED tests proving one untouched word cannot hold the unit pathway on Recognise and that question progress renders.
- [ ] Load journey rows when opening a unit and update local journey from attempt responses.
- [ ] Pass pathway identity/stage into question renderer and add 10-question progress UI.
- [ ] Run focused tests, then full Vocabulary Builder CI, commit, review, merge, deploy.

# Vocabulary Ladder — Single Source of Truth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing per-word/per-pathway evidence ladder the only authority for Vocabulary Builder progression so students can actually reach Match, Apply, Recall and Mastery.

**Architecture:** Retire the unit-level 10-question/8-success journey from all live progression decisions. Aggregate unit pathway state directly from persisted word-level pathway evidence, launch sessions against the actionable rung derived from those word states, and preserve all existing evidence thresholds and activity mappings.

**Tech Stack:** Vanilla JavaScript modules, Supabase Edge Functions/Postgres, existing Vocabulary Builder test/CI stack.

**Spec:** `docs/superpowers/specs/2026-10-19-vocabulary-ladder-single-source-design.md`

## Global Constraints

- Do not touch Evidence Hub or unrelated repos/features.
- Do not change per-word mastery/pathway thresholds.
- Do not change retry/support evidence semantics.
- Do not change historical mastery/evidence, vocabulary IDs, occurrence IDs, canonical content, or pathway activity mappings.
- Do not create another progression system or another progression table.
- Existing `vocabulary_unit_pathway_journey` rows may remain for compatibility but must not influence visible progression or session selection.
- Use TDD: failing regression first, minimal fix second.

## Review Focus

- A stale unit journey row must never override newer word-level pathway evidence.
- One untouched/weak word must not regress a word already progressed to a higher rung.
- A pathway session must serve only targets eligible for its displayed/actionable rung.
- Retry/support/recovery attempts must keep their existing evidence semantics and must not earn clean progression incorrectly.
- Refresh/sign-in must reconstruct ladder state from persisted unit mastery evidence without journey-table dependency.

---

### Task 1: Remove Unit Journey Authority from View Model

**Files:**
- Modify: `src/vocabulary/pathway-view-model.js`
- Test: existing/new pathway view-model regression tests under the Vocabulary Builder test suite

**Interfaces:**
- Consumes: `buildWordPathwayStates({ occurrence, unitMastery, globalMastery })`
- Produces: `buildUnitPathwayStates(...)` whose `currentStage` is derived only from serviceable word states/coverage, never `registeredPathwayJourney()`.

- [ ] **Step 1: Write failing tests** proving a stale journey row cannot force Recognise and that a progressed word remains progressed while another word is untouched.
- [ ] **Step 2: Run targeted tests** and verify RED for current journey precedence.
- [ ] **Step 3: Remove journey precedence** from `buildUnitPathwayStates()` and implement the deterministic actionable-rung aggregation from the spec.
- [ ] **Step 4: Run targeted tests** and verify GREEN.
- [ ] **Step 5: Commit** the isolated view-model change.

### Task 2: Launch Sessions from Real Word-Level Rungs

**Files:**
- Modify: `src/vocabulary/app.js`
- Modify if needed: `src/vocabulary/pathway-planner.js`
- Test: pathway session/planner regression tests

**Interfaces:**
- Consumes: unit summary from Task 1 and per-word pathway states.
- Produces: `startPathwaySession(pathwayId)` selecting only words whose real current pathway stage equals the displayed/actionable rung; each question continues to use the authoritative pathway activity map.

- [ ] **Step 1: Write failing tests** showing a word that earned Recognise completion is eligible for Match and receives a Match activity type, while untouched Recognise words do not regress it.
- [ ] **Step 2: Run targeted tests** and verify RED.
- [ ] **Step 3: Rewire fixed-pathway selection** so target eligibility comes from each word's persisted pathway state rather than the retired unit journey.
- [ ] **Step 4: Recalculate the unit ladder after saved evidence** before returning/rendering the unit page.
- [ ] **Step 5: Run targeted tests** and verify GREEN.
- [ ] **Step 6: Commit** the session-planning change.

### Task 3: Remove Client Journey Loading/Mirroring

**Files:**
- Modify: `src/vocabulary/data.js`
- Modify/delete live imports from: `src/vocabulary/pathway-journey-store.js`, `src/vocabulary/pathway-journey.js`
- Tests: data-layer/pathway regressions

**Interfaces:**
- Consumes: existing attempt API and unit mastery persistence.
- Produces: dashboard/unit loading and attempt submission that no longer registers or locally advances `vocabulary_unit_pathway_journey` for live student progression.

- [ ] **Step 1: Write failing tests** proving dashboard/unit progression is independent of journey rows and attempt submission no longer mutates the client journey store.
- [ ] **Step 2: Run targeted tests** and verify RED.
- [ ] **Step 3: Remove journey reads/mirroring** from normal live progression paths while preserving unrelated mastery loading.
- [ ] **Step 4: Run targeted tests** and verify GREEN.
- [ ] **Step 5: Commit** the data-layer retirement.

### Task 4: Disable Server Journey Side Effect Safely

**Files:**
- Create: `supabase/migrations/20261019XXXXXX_retire_vocabulary_pathway_journey_trigger.sql`
- Test: migration/contract regression tests where available

**Interfaces:**
- Consumes: existing `activity_events` and old trigger `trg_record_vocabulary_pathway_journey`.
- Produces: new migration that disables/drops only the old journey trigger/function as an active side effect; leaves historical rows/table intact for compatibility.

- [ ] **Step 1: Write/extend a contract test** proving new attempts do not depend on the journey trigger/table for visible ladder progression.
- [ ] **Step 2: Add the migration** to drop the trigger and retire the trigger function without deleting historical journey rows.
- [ ] **Step 3: Run migration/contract tests** and verify GREEN.
- [ ] **Step 4: Commit** the server-side retirement.

### Task 5: End-to-End Ladder Proof

**Files:**
- Modify/add: Vocabulary Builder browser smoke/e2e tests
- Modify only if required by test evidence: `src/vocabulary/views.js` / progress UI helpers

**Interfaces:**
- Consumes: Tasks 1–4.
- Produces: automated proof that real persisted word evidence changes the question type/rung the student sees.

- [ ] **Step 1: Add an end-to-end failing test** that starts a word on Recognise, records the existing qualifying Recognise evidence, returns to the unit view, relaunches the pathway, and asserts a Match activity is served.
- [ ] **Step 2: Extend the proof** through Apply → Recall → Mastery using existing thresholds where practical at unit-test level; keep browser smoke focused on at least Recognise → Match.
- [ ] **Step 3: Add refresh reconstruction coverage** proving persisted unit mastery restores the higher rung without journey-table state.
- [ ] **Step 4: Run the full Vocabulary Builder suite** and fix only root-cause regressions.
- [ ] **Step 5: Run browser smoke/build/content validation** and require all green.
- [ ] **Step 6: Commit** the end-to-end proof.

### Task 6: Review, PR, Merge, Post-Merge Verification

**Files:**
- No new product scope.

**Interfaces:**
- Consumes: completed implementation branch.
- Produces: reviewed, merged, deployed fix.

- [ ] **Step 1: Review the complete diff** specifically for accidental threshold, evidence, content, or mapping changes.
- [ ] **Step 2: Open PR** summarising the competing-authority root cause and single-source correction.
- [ ] **Step 3: Require branch CI green** before merge.
- [ ] **Step 4: Merge** only after tests/browser smoke/build pass.
- [ ] **Step 5: Verify post-merge main**: Vocabulary Builder CI, Runtime Smoke, Pages build/deploy.
- [ ] **Step 6: Report exact root cause, files changed, tests added, migration status, PR and merge commit.**

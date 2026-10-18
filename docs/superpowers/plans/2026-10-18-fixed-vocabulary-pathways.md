# Fixed Vocabulary Mastery Pathways Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current student-facing adaptive vocabulary launcher with six fixed, visible mastery pathways, each progressing in order through Recognise → Match → Apply → Recall → Mastery while preserving historical evidence integrity and existing persistence safeguards.

**Architecture:** Introduce a pathway/stage model above the existing activity catalogue and evidence engine. Each pathway owns a fixed stage ladder and maps each stage to one or more eligible activity types; the current adaptive planner becomes a within-stage selector rather than the student-facing navigation model. Persist new pathway/stage evidence alongside existing mastery detail without rewriting historical records, then derive overall Emerging → Mastered summaries from the richer pathway evidence.

**Tech Stack:** Vanilla JavaScript ES modules, HTML/CSS, Supabase Edge Functions, Supabase Postgres/RPC persistence, Node test runner, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-18-fixed-vocabulary-pathways-design.md`

## Global Constraints

- Student-facing pathways are exactly: Meaning, Context, Word Families, Paraphrasing, Precision & Use, Spelling & Recall.
- Student-facing stages are exactly: Recognise, Match, Apply, Recall, Mastery.
- New learning progresses upward in order; returning learners may start higher only when persisted evidence defensibly supports placement.
- Completed lower stages are never relocked because of a later mistake.
- Mixed Practice is review-only and may draw only from already-unlocked pathway/stage combinations.
- Historical mastery and attempt history must not be rewritten.
- Easy repeated activity must never manufacture mastery.
- Matching/dragging UI variants do not count as independent mastery diversity merely because the interaction differs.
- Choice-based stages must fail closed when only nonsensical distractors are available.
- No real student answers, notes, teacher notes, teacher prompts, or other private learning data may be committed to GitHub.
- Existing idempotency, concurrency, persistence barriers, stale-browser protection, failed-save blocking, timed-expiry handling, and raw-answer privacy guarantees remain intact.

## Review Focus

- Legacy students with strong old global mastery but no pathway evidence must receive conservative placement rather than being reset to Stage 1 or falsely placed at Mastery.
- A wrong answer after a completed stage must mark current work as needing practice without relocking earlier stages.
- Mixed Practice must never serve a locked stage or write evidence into a separate mixed bucket.
- A pathway must fail closed when the content bank cannot provide enough distinct prompts/contexts for Mastery.
- Multiple UI variants of the same underlying operation must not satisfy diversity requirements for Recall/Mastery.

---

### Task 1: Pathway and stage domain model

**Files:**
- Create: `src/vocabulary/pathway-model.js`
- Test: `tests/vocabulary-pathway-model.test.js`

**Interfaces:**
- Consumes: existing activity IDs from `src/vocabulary/activity-catalogue.js` and overall mastery objects shaped like `deriveLearningStage()` input.
- Produces: `VOCABULARY_PATHWAYS`, `PATHWAY_STAGES`, `pathwayDefinition(pathwayId)`, `activityTypesForPathwayStage(pathwayId, stageId)`, `derivePathwayPlacement({ pathwayId, legacyMastery, pathwayEvidence })`, and `deriveOverallLearningStageFromPathways(pathwayStates)`.

- [ ] **Step 1: Write failing tests for the exact six pathways and five ordered stages**

Assert that the exported IDs are stable, labels match the spec, and every pathway defines all five stages in order.

- [ ] **Step 2: Run the pathway model test and verify RED**

Run: `node --test tests/vocabulary-pathway-model.test.js`
Expected: FAIL because `src/vocabulary/pathway-model.js` does not exist.

- [ ] **Step 3: Implement the pathway model and fixed stage/activity mappings**

Use explicit mappings, not inferred family weights. Map the current live foundational/legacy activity IDs into the approved ladders, leaving unsupported stages empty rather than inventing activities.

- [ ] **Step 4: Add placement tests for legacy evidence and pathway evidence**

Cover: brand-new learner → Recognise; strong recognition only → Match/Apply at most; independent contextual retrieval → Recall; repeated easy recognition alone never → Mastery; old `mastered` overall status without pathway detail gets conservative placement, not automatic pathway Mastery.

- [ ] **Step 5: Add overall-summary derivation tests**

Assert that overall Emerging/Building/Developing/Secure/Mastered is derived from pathway states and that strong Meaning alone cannot produce overall Mastered.

- [ ] **Step 6: Run tests and verify GREEN**

Run: `node --test tests/vocabulary-pathway-model.test.js`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/vocabulary/pathway-model.js tests/vocabulary-pathway-model.test.js
git commit -m "feat: add vocabulary pathway domain model"
```

---

### Task 2: Pathway progress evidence state and unlock rules

**Files:**
- Create: `src/vocabulary/pathway-progress.js`
- Test: `tests/vocabulary-pathway-progress.test.js`
- Modify: `supabase/functions/_shared/vocabulary-engine.js`

**Interfaces:**
- Consumes: pathway/stage IDs from Task 1 and authoritative attempt facts (`correct`, `firstAttempt`, `retryUsed`, `supportLevel`, `contentId`, `activityType`).
- Produces: `freshPathwayProgress()`, `applyPathwayAttempt(progress, attempt)`, `currentPathwayStage(progress)`, `isPathwayStageUnlocked(progress, stageId)`, and `pathwayMasteryNeedsReview(progress)`.

- [ ] **Step 1: Write failing unlock-rule tests**

Pin the approved thresholds: Recognise 2 clean successes, Match 2 clean, Apply 2 clean with distinct context where relevant, Recall 2 clean unassisted, Mastery 3 successes with at least 2 unassisted and at least 2 distinct prompts/contexts.

- [ ] **Step 2: Add recovery-state tests**

Assert: one mistake does not reset progress; repeated difficulty sets `needsPractice`/support state; completed lower stages remain complete; successful recovery returns the learner to the current stage.

- [ ] **Step 3: Add diversity tests**

Assert that repeated attempts against the same content ID do not satisfy distinct-context requirements and that `matching` vs `drag_match` variants of the same pedagogical operation do not create false diversity.

- [ ] **Step 4: Run the progress tests and verify RED**

Run: `node --test tests/vocabulary-pathway-progress.test.js`
Expected: FAIL because the progress module does not exist.

- [ ] **Step 5: Implement pathway progress state as additive detail**

Keep existing global/unit mastery thresholds untouched. Add pathway progress as a separate detail model so existing historical status behavior remains stable during migration.

- [ ] **Step 6: Add shared-engine helpers only where server parity requires them**

If server-side application needs a pure helper, export the same deterministic stage-progress logic from `_shared/vocabulary-engine.js`; do not duplicate different threshold constants on client and server.

- [ ] **Step 7: Run pathway and existing mastery regression tests**

Run: `node --test tests/vocabulary-pathway-progress.test.js tests/vocabulary-mastery-engine.test.js tests/vocabulary-tile-evidence.test.js`
Expected: PASS with all historical mastery assertions unchanged.

- [ ] **Step 8: Commit**

```bash
git add src/vocabulary/pathway-progress.js supabase/functions/_shared/vocabulary-engine.js tests/vocabulary-pathway-progress.test.js
git commit -m "feat: add pathway progression rules"
```

---

### Task 3: Fixed-stage question selection

**Files:**
- Create: `src/vocabulary/pathway-planner.js`
- Modify: `src/vocabulary/session-targets.js`
- Modify: `src/vocabulary/activity-catalogue.js`
- Test: `tests/vocabulary-pathway-planner.test.js`
- Test: `tests/vocabulary-session-targets.test.js`

**Interfaces:**
- Consumes: Task 1 mappings and Task 2 pathway progress.
- Produces: `planPathwayQuestion({ pathwayId, stageId, content, target, progress, recentActivities, usedContentIds, supportState, seed })` returning a single eligible question within that exact pathway/stage; `eligibleTargetsForPathwayStage(...)`.

- [ ] **Step 1: Write failing tests that forbid cross-pathway and cross-stage jumps**

For example, Meaning/Recognise may select definition MCQ but never paraphrase rewrite; Paraphrasing/Apply may select tiles/build tasks but never spelling.

- [ ] **Step 2: Write failing tests for support fallback**

Repeated difficulty may temporarily request a lower-friction equivalent or one-stage-lower support activity, but the learner's current stage does not change and completed stages stay complete.

- [ ] **Step 3: Write failing tests for unavailable content**

Planner must return unavailable/fail closed when no valid activity exists for the requested stage rather than silently jumping to another stage.

- [ ] **Step 4: Run planner tests and verify RED**

Run: `node --test tests/vocabulary-pathway-planner.test.js tests/vocabulary-session-targets.test.js`
Expected: FAIL on missing planner/fixed-stage behavior.

- [ ] **Step 5: Implement fixed-stage planner**

Reuse existing builders and `activity-factory.js`; remove weighted-family selection from the student-facing pathway route. Keep the old adaptive planner available for Mixed Practice/internal review only.

- [ ] **Step 6: Add plausible-distractor eligibility gates**

Choice stages must require curated or defensibly close alternatives (same semantic neighborhood, form, register, intensity, or meaning distortion). If the existing builder cannot produce a plausible set, mark that target unavailable for the stage.

- [ ] **Step 7: Run planner/session-target tests and verify GREEN**

Run: `node --test tests/vocabulary-pathway-planner.test.js tests/vocabulary-session-targets.test.js tests/vocabulary-foundational-activities.test.js`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/vocabulary/pathway-planner.js src/vocabulary/session-targets.js src/vocabulary/activity-catalogue.js tests/vocabulary-pathway-planner.test.js tests/vocabulary-session-targets.test.js
git commit -m "feat: plan fixed vocabulary pathway stages"
```

---

### Task 4: Persist pathway/stage evidence safely

**Files:**
- Modify: `supabase/functions/vocabulary-attempt-action/validation.js`
- Modify: `supabase/functions/vocabulary-attempt-action/index.ts`
- Modify: `supabase/functions/_shared/vocabulary-engine.js`
- Modify: `src/vocabulary/data.js`
- Test: `tests/vocabulary-pathway-evidence-contracts.test.js`
- Test: `tests/vocabulary-attempt-action.test.js`

**Interfaces:**
- Consumes: attempt payload plus `pathwayId` and `pathwayStage` supplied by the client for pathway sessions.
- Produces: authoritative stored pathway/stage metadata and additive pathway progress detail in mastery records/commit payload; no raw answer text persisted.

- [ ] **Step 1: Write failing validation tests for pathway metadata**

Accept only the six pathway IDs and five stage IDs. Reject mismatched activity/pathway/stage combinations server-side.

- [ ] **Step 2: Write failing evidence-integrity tests**

Assert the server derives/validates pathway + stage from the question contract and does not trust a client claiming a higher stage than the activity permits.

- [ ] **Step 3: Write failing privacy and duplicate-submit tests**

Assert raw answers remain absent from stored event/mastery metadata, and idempotent duplicate submissions do not increment pathway progress twice.

- [ ] **Step 4: Run server contract tests and verify RED**

Run: `node --test tests/vocabulary-pathway-evidence-contracts.test.js tests/vocabulary-attempt-action.test.js`
Expected: FAIL on missing pathway metadata handling.

- [ ] **Step 5: Extend the attempt contract and commit payload**

Add pathway/stage metadata as additive fields. Store pathway progress inside existing JSON detail where possible; if a schema change is truly required, stop and add a migration task before modifying production schema.

- [ ] **Step 6: Preserve all existing persistence safeguards**

Keep same-target serialization, optimistic retry, attempt IDs, stale mastery retry, failed-save blocking, preview isolation, and timed-expiry barriers unchanged.

- [ ] **Step 7: Run server + privacy regressions**

Run: `node --test tests/vocabulary-pathway-evidence-contracts.test.js tests/vocabulary-attempt-action.test.js tests/vocabulary-privacy.test.js tests/vocabulary-concurrency.test.js`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add supabase/functions/vocabulary-attempt-action/validation.js supabase/functions/vocabulary-attempt-action/index.ts supabase/functions/_shared/vocabulary-engine.js src/vocabulary/data.js tests/vocabulary-pathway-evidence-contracts.test.js tests/vocabulary-attempt-action.test.js
git commit -m "feat: persist vocabulary pathway evidence"
```

---

### Task 5: Replace Unit page with six pathway cards

**Files:**
- Modify: `src/vocabulary/views.js`
- Modify: `src/vocabulary/app.js`
- Modify: `styles.css` or the repository's vocabulary stylesheet owner identified at implementation time
- Test: `tests/vocabulary-pathway-views.test.js`
- Test: `tests/vocabulary-app-pathways.test.js`

**Interfaces:**
- Consumes: pathway definitions and per-pathway progress.
- Produces: Unit dashboard showing six pathway cards, each with Recognise → Match → Apply → Recall → Mastery; pathway navigation action `open-pathway`.

- [ ] **Step 1: Write failing render tests for exactly six pathway cards**

Assert labels, ordered five-stage ladder, current/completed/locked/needs-practice/mastered states, and no old seven-skill launcher on the student Unit page.

- [ ] **Step 2: Write failing app-navigation tests**

Clicking Meaning opens Meaning only; returning to Unit restores all six pathway summaries; current pathway is stored separately from `practiceFocus`.

- [ ] **Step 3: Run view/app tests and verify RED**

Run: `node --test tests/vocabulary-pathway-views.test.js tests/vocabulary-app-pathways.test.js`
Expected: FAIL on old Unit launcher.

- [ ] **Step 4: Implement six-card Unit dashboard and pathway route**

Do not expose pseudo-percent mastery. Use discrete stage states. Keep Staff Preview banner behavior intact.

- [ ] **Step 5: Add restrained progress motion with reduced-motion support**

Animate only after authoritative persistence succeeds; do not animate optimistic/unpersisted stage advancement.

- [ ] **Step 6: Run view/app tests and verify GREEN**

Run: `node --test tests/vocabulary-pathway-views.test.js tests/vocabulary-app-pathways.test.js tests/vocabulary-response-modes.test.js`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/vocabulary/views.js src/vocabulary/app.js styles.css tests/vocabulary-pathway-views.test.js tests/vocabulary-app-pathways.test.js
git commit -m "feat: add six vocabulary pathway dashboard"
```

---

### Task 6: Pathway session lifecycle and stage advancement

**Files:**
- Modify: `src/vocabulary/app.js`
- Modify: `src/vocabulary/session.js`
- Modify: `src/vocabulary/scaffolding.js`
- Test: `tests/vocabulary-pathway-session.test.js`
- Test: `tests/vocabulary-persistence-barrier.test.js`

**Interfaces:**
- Consumes: `planPathwayQuestion()` and persisted pathway progress returned from the server.
- Produces: sessions bound to one pathway + one current stage; authoritative advancement to the next stage only after save success.

- [ ] **Step 1: Write failing lifecycle tests**

Assert a pathway session stays inside one pathway/stage until pass criteria are met; stage advancement happens only after persisted evidence confirms completion.

- [ ] **Step 2: Write failing retry/recovery tests**

A wrong answer triggers feedback/retry/support without moving the stored current stage backward; repeated struggle can serve a temporary lower-friction item and then return to the current stage.

- [ ] **Step 3: Write failing persistence-barrier tests**

No next-stage navigation, completion animation, summary update, or session finish may occur while authoritative save is pending/failed.

- [ ] **Step 4: Run lifecycle tests and verify RED**

Run: `node --test tests/vocabulary-pathway-session.test.js tests/vocabulary-persistence-barrier.test.js`
Expected: FAIL on missing pathway-bound lifecycle.

- [ ] **Step 5: Implement pathway session state**

Add `pathwayId`, `stageId`, and stage-attempt progress to session state. Preserve timed-session handling separately for Mixed Practice.

- [ ] **Step 6: Run lifecycle/persistence tests and verify GREEN**

Run: `node --test tests/vocabulary-pathway-session.test.js tests/vocabulary-persistence-barrier.test.js tests/vocabulary-session.test.js`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/vocabulary/app.js src/vocabulary/session.js src/vocabulary/scaffolding.js tests/vocabulary-pathway-session.test.js tests/vocabulary-persistence-barrier.test.js
git commit -m "feat: progress vocabulary pathway sessions"
```

---

### Task 7: Make Mixed Practice review-only

**Files:**
- Modify: `src/vocabulary/session-targets.js`
- Modify: `src/vocabulary/adaptive-planner.js`
- Modify: `src/vocabulary/app.js`
- Test: `tests/vocabulary-mixed-review.test.js`

**Interfaces:**
- Consumes: unlocked pathway/stage states.
- Produces: `buildMixedReviewQuestion(...)` selecting only already-unlocked pathway/stage combinations and preserving source pathway/stage metadata on the attempt.

- [ ] **Step 1: Write failing tests forbidding locked-stage selection**

A learner with Meaning/Recognise only must never receive Meaning/Recall or any locked Context stage through Mixed Practice.

- [ ] **Step 2: Write failing evidence-routing test**

A Mixed Practice Context/Recall answer must update Context/Recall evidence, not a `mixed` bucket.

- [ ] **Step 3: Write failing mastered-review test**

Mastered pathways may serve Apply/Recall/occasional Mastery review; weak review sets `Mastery needs review` without visibly relocking completed stages.

- [ ] **Step 4: Run tests and verify RED**

Run: `node --test tests/vocabulary-mixed-review.test.js`
Expected: FAIL because current timed/adaptive mode selects from readiness families rather than explicit unlocked pathway stages.

- [ ] **Step 5: Implement review-only mixed selection**

Reuse the existing adaptive heuristics only inside the eligible unlocked set.

- [ ] **Step 6: Run tests and verify GREEN**

Run: `node --test tests/vocabulary-mixed-review.test.js tests/vocabulary-adaptive-planner.test.js`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/vocabulary/session-targets.js src/vocabulary/adaptive-planner.js src/vocabulary/app.js tests/vocabulary-mixed-review.test.js
git commit -m "feat: make mixed vocabulary practice review only"
```

---

### Task 8: All-words detail and teacher analytics alignment

**Files:**
- Modify: `src/vocabulary/views.js`
- Modify: `src/vocabulary/analytics.js`
- Modify: `src/vocabulary/skill-profile.js`
- Modify: teacher analytics view/controller files identified by existing imports at implementation time
- Test: `tests/vocabulary-pathway-analytics.test.js`
- Test: `tests/vocabulary-pathway-views.test.js`

**Interfaces:**
- Consumes: pathway progress per vocabulary item.
- Produces: word detail showing six pathway states; class analytics supporting student × pathway and word × pathway summaries.

- [ ] **Step 1: Write failing word-detail tests**

Assert each word can display independent states such as Meaning=Mastery, Context=Recall, Families=Apply without collapsing to one overall state.

- [ ] **Step 2: Write failing class-matrix tests**

Assert compact six-column pathway summaries and drill-down data structures for both student × pathway and word × pathway views.

- [ ] **Step 3: Write failing skill-profile mapping tests**

Every pathway activity type must map to the correct pathway/stage analytics category; new interaction variants must not create fake independent skills.

- [ ] **Step 4: Run analytics/view tests and verify RED**

Run: `node --test tests/vocabulary-pathway-analytics.test.js tests/vocabulary-pathway-views.test.js`
Expected: FAIL on missing pathway analytics.

- [ ] **Step 5: Implement pathway analytics and compact matrix output**

Keep overall Emerging → Mastered summary as a derived overview only. Do not expose raw private answer text.

- [ ] **Step 6: Run analytics/view tests and verify GREEN**

Run: `node --test tests/vocabulary-pathway-analytics.test.js tests/vocabulary-pathway-views.test.js tests/vocabulary-analytics.test.js`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/vocabulary/views.js src/vocabulary/analytics.js src/vocabulary/skill-profile.js tests/vocabulary-pathway-analytics.test.js tests/vocabulary-pathway-views.test.js
git commit -m "feat: align vocabulary analytics to pathways"
```

---

### Task 9: Full migration compatibility and release hardening

**Files:**
- Modify: migration/helper files only if tests prove they are needed
- Test: `tests/vocabulary-pathway-migration.test.js`
- Test: existing vocabulary regression suite

**Interfaces:**
- Consumes: historical mastery records with no pathway detail plus new pathway-aware records.
- Produces: deterministic forward interpretation without historical rewrites.

- [ ] **Step 1: Write migration compatibility tests**

Cover legacy `new`, `building`, `secure`, `mastered`; missing contextual evidence; malformed/partial pathway detail; existing mastered review state; and mixed old/new records.

- [ ] **Step 2: Run migration tests and verify RED where compatibility gaps exist**

Run: `node --test tests/vocabulary-pathway-migration.test.js`
Expected: only the newly specified compatibility cases fail.

- [ ] **Step 3: Implement the minimum compatibility adapter**

Interpret old evidence forward conservatively. Do not backfill or mutate historical rows.

- [ ] **Step 4: Run the complete local test matrix**

Run: `npm test`
Expected: all vocabulary and existing repository tests PASS.

- [ ] **Step 5: Run content validation and Unit 1 publish-scope checks**

Run the repository's existing vocabulary content-validation and Unit 1 publish-export verification commands from `package.json`/CI.
Expected: PASS.

- [ ] **Step 6: Review exact branch diff against `main`**

Verify no unrelated repo/app changes, no historical-data rewrites, no privacy leaks, no retired activity reactivation, and no weakened marking/evidence contracts.

- [ ] **Step 7: Commit final hardening fixes if any**

```bash
git add <only reviewed files>
git commit -m "test: harden fixed vocabulary pathways"
```

---

### Task 10: Release in dependency-safe order

**Files:**
- No new product files expected.

**Interfaces:**
- Consumes: fully green implementation branch.
- Produces: merged and deployed release with backend compatibility established before the student client can emit new pathway metadata.

- [ ] **Step 1: Open/refresh the implementation PR and require all branch checks green**

Verify the exact head SHA for Vocabulary Builder CI and all repository-required checks.

- [ ] **Step 2: Deploy the additive/backward-compatible `vocabulary-attempt-action` Edge Function first**

Deploy exact repo source from the verified branch; keep JWT verification enabled; confirm ACTIVE and inspect deployed source/version.

- [ ] **Step 3: Merge the verified PR with expected-head SHA protection**

Record the exact merge SHA.

- [ ] **Step 4: Verify exact merge-SHA workflows**

Require Vocabulary Builder CI, System Audit, Runtime Smoke, and Pages deployment to complete successfully on the exact merge SHA.

- [ ] **Step 5: Perform a real Unit 1 Staff Preview journey**

Exercise all six pathways from Recognise upward where content is available; verify stage locking/unlocking, retries, drag/drop keyboard fallback, spelling, pathway persistence, Mixed Practice review-only behavior, and progress display. Record any content gaps instead of silently substituting another stage.

- [ ] **Step 6: Only then call the release complete**

Do not claim live/complete before exact-SHA checks and Staff Preview journey are verified.

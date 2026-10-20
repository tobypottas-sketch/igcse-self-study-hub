# Vocabulary Builder Session Reward Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn each 10-question Vocabulary Builder set into a clear, motivating finish, escalate genuine stage/pathway completions into stronger milestones, and make the pathway screen explain the student’s next step without changing progression or persistence rules.

**Architecture:** Keep the existing server-authoritative pathway state as the only source of stage completion/mastery. Add a small pure session-summary layer for first-attempt stars and retry recovery, wire it into the existing controller only after the final save/progression result is resolved, and extend the existing `views.js`/`vocabulary-study-app.css` presentation rather than creating a second renderer or style owner. Reuse `continuePractice()` and current pathway state builders so the recent anti-repetition and save-contract fixes remain intact.

**Tech Stack:** Vanilla JavaScript ES modules, Supabase-backed existing persistence flow, Node `node:test`, Playwright runtime smoke tests, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-20-vocabulary-session-reward-loop-design.md`

## Global Constraints

- Keep **Recognise → Match → Apply → Recall → Mastery** unchanged.
- Do not change progression thresholds, mastery thresholds, evidence rules, attempt IDs, idempotency, server-authoritative progression, or persistence semantics.
- Stars are session-only UI feedback; do not persist stars, XP, streaks, badges, or daily goals.
- Star thresholds: `9–10 = 3`, `7–8 = 2`, `5–6 = 1`, `0–4 = 0`.
- Stars use **first-attempt correctness only**; corrected retries may be acknowledged separately but must not increase stars.
- Completion UI must not appear while the final answer is unsaved or persistence is blocked.
- Stage/pathway completion must come from authoritative pathway state, never local accuracy or star count.
- Continue on an uncleared stage must reuse the existing `continuePractice()` path and preserve `recentActivities` / `usedContentIds` exactly as PR #136 established.
- Keep the shared answer-option shuffle / `optionNonce` behavior unchanged.
- Keep current save-contract/language-bank protections unchanged.
- No real student data, answers, notes, or private learning data in GitHub.
- Scope is Vocabulary Builder only; do not touch Reading, Listening, Essay Writing, Evidence Hub, or unrelated repos.

## Review Focus

- **Final save pending/fails on question 10:** no completion celebration until the save settles successfully; failure keeps the existing sync warning/retry path.
- **Retry on a question:** the session records that mistake as corrected, but first-attempt accuracy remains wrong for stars.
- **A single set advances multiple underlying word records:** the completion screen must compare the unit pathway state before/after and show one coherent stage result, not per-word milestone spam.
- **Already-mastered/review sessions:** reviewing mastered content must not replay a false Stage Complete/Pathway Mastered celebration.
- **Pathway with partial coverage/unavailable targets:** pathway card copy must not imply a fake percentage/ETA or “5 of 5” completion unless authoritative state actually says mastered.

---

### Task 1: Pure session reward summary

**Files:**
- Create: `src/vocabulary/session-reward.js`
- Create: `tests/vocabulary-session-reward.test.js`
- Modify: `src/vocabulary/session.js`

**Interfaces:**
- Produces `starCountFor(firstAttemptCorrect, total = 10) -> 0|1|2|3`.
- Produces `buildSessionRewardSummary({ completedAttempts, sessionSummary, totalQuestions, pathwayId, pathwayStage })` returning `{ firstAttemptCorrect, stars, correctedMistakes, practised, strengthened, needsAnotherLook, pathwayId, pathwayStage }`.
- `session.completedAttempts[*].evidence` must retain enough local facts to identify first-attempt correctness and retry correction without changing persisted attempt payload semantics.

- [ ] **Step 1: Write failing star-threshold tests**

Add cases asserting `starCountFor(10)=3`, `9=3`, `8=2`, `7=2`, `6=1`, `5=1`, `4=0`, `0=0`.

- [ ] **Step 2: Write failing retry-accounting tests**

Create a completed-attempt fixture where one target is wrong first, then corrected; assert `firstAttemptCorrect` excludes it, `correctedMistakes` includes it, and stars are based on the lower first-attempt score.

- [ ] **Step 3: Run focused tests and confirm RED**

Run: `node --test tests/vocabulary-session-reward.test.js`
Expected: FAIL because `session-reward.js` and/or required evidence fields do not yet exist.

- [ ] **Step 4: Implement the pure reward helpers**

Keep all scoring logic in `src/vocabulary/session-reward.js`; do not put star thresholds into `views.js` or `app.js`.

- [ ] **Step 5: Preserve local first-attempt/retry facts in completed session attempts**

Extend the existing `completeAttempt()` call data so the session-local attempt evidence can distinguish clean first-attempt success from retry recovery. Do not alter the server payload contract or progression engine.

- [ ] **Step 6: Run focused tests and commit**

Run: `node --test tests/vocabulary-session-reward.test.js tests/vocabulary-continue-history.test.js`
Expected: PASS.

Commit: `feat: add vocabulary session reward summary`

---

### Task 2: Authoritative completion-state decision in the controller

**Files:**
- Modify: `src/vocabulary/app.js`
- Create: `tests/vocabulary-session-completion-controller.test.js`
- Reuse: `src/vocabulary/pathway-view-model.js`
- Reuse: `src/vocabulary/session-reward.js`

**Interfaces:**
- Add a pure controller helper such as `buildCompletionState({ beforePathwayState, afterPathwayState, session, pathwayId, pathwayStage })` returning one of:
  - `{ kind:'session_complete', ... }`
  - `{ kind:'stage_complete', completedStage, nextStage, ... }`
  - `{ kind:'pathway_mastered', ... }`
- The helper consumes authoritative `buildUnitPathwayStates(...)` snapshots from before and after the final saved attempt.
- Existing `continuePractice()` remains the only same-stage Continue implementation.

- [ ] **Step 1: Write failing controller tests for all three outcomes**

Use the same VM-controller style already used by `tests/vocabulary-continue-history.test.js`.

Assert:
- unchanged `match` state after question 10 => `session_complete`;
- authoritative `match -> apply` => `stage_complete` with `completedStage:'match'`, `nextStage:'apply'`;
- authoritative mastery false -> true => `pathway_mastered`.

- [ ] **Step 2: Add the save-failure review-focus test**

Simulate the 10th answer with persistence rejection/block; assert no completion renderer is called and the existing sync warning path wins.

- [ ] **Step 3: Run focused controller tests and confirm RED**

Run: `node --test tests/vocabulary-session-completion-controller.test.js`
Expected: FAIL on missing completion-state behavior.

- [ ] **Step 4: Capture authoritative pathway state before and after the final saved attempt**

In the existing answer/persistence flow, snapshot only the active unit/pathway state needed for comparison. Do not create a parallel progression model.

- [ ] **Step 5: Route completed sets into the new completion state**

Only after the last adaptive target is complete and persistence has resolved, derive the reward summary + authoritative milestone and render the appropriate completion state.

- [ ] **Step 6: Wire actions without duplicating session-start logic**

Required action behavior:
- `finish-session` -> existing unit/pathway view refresh;
- `continue-session` -> `continuePractice()`;
- `start-next-stage` -> start the same pathway using its newly authoritative current stage, preserving Continue history semantics where appropriate;
- pathway mastery actions -> return to unit Vocabulary Builder view, never auto-launch another pathway.

- [ ] **Step 7: Run focused regressions and commit**

Run: `node --test tests/vocabulary-session-completion-controller.test.js tests/vocabulary-continue-history.test.js tests/vocabulary-pathway-session-progression.test.js`
Expected: PASS.

Commit: `feat: add authoritative vocabulary completion states`

---

### Task 3: Dedicated Session / Stage / Pathway completion views

**Files:**
- Modify: `src/vocabulary/views.js`
- Modify: `src/vocabulary/study-ui.js`
- Modify: `tests/vocabulary-study-ui.test.js`
- Create: `tests/vocabulary-completion-views.test.js`

**Interfaces:**
- Add `renderVocabularyCompletion(root, completionState)` as the single renderer for all three completion kinds.
- Reuse `pathwayIdentity()` and `PATHWAY_STAGES`; do not duplicate pathway labels/order.
- Add a small ladder renderer that accepts authoritative completed/current/unlocked stage IDs.

- [ ] **Step 1: Write failing Session Complete view test**

Assert rendered HTML contains:
- `Session complete`;
- exact star count as text/ARIA, not colour alone;
- `9 / 10 correct` style first-attempt score;
- supported learning metrics only;
- contextual `Meaning · Match` copy;
- `Finish for now` and `Continue` actions.

- [ ] **Step 2: Write failing low-score accessibility test**

For 0 stars, assert the view still says `Session complete`, includes supportive non-red failure copy, and has no failure/failed wording.

- [ ] **Step 3: Write failing Stage Complete test**

Assert `MATCH COMPLETE`, `Stage 2 of 5 cleared`, `Next stage unlocked: APPLY`, full five-stage ladder, `Finish for now`, and `Start Apply`.

- [ ] **Step 4: Write failing Pathway Mastered test**

Assert `PATHWAY MASTERED`, `<Pathway> complete`, `5 / 5 stages cleared`, all five stages complete, `Back to Vocabulary Builder`, and `Choose another pathway`/equivalent unit-level pathway-selection action.

- [ ] **Step 5: Implement one completion renderer with small helpers**

Keep copy/state branching inside `views.js`; keep generic identity/icon/ladder presentation helpers in `study-ui.js` only where reusable.

- [ ] **Step 6: Run focused tests and commit**

Run: `node --test tests/vocabulary-completion-views.test.js tests/vocabulary-study-ui.test.js`
Expected: PASS.

Commit: `feat: render vocabulary completion milestones`

---

### Task 4: Clarify the pathway overview and next action

**Files:**
- Modify: `src/vocabulary/views.js`
- Modify: `src/vocabulary/pathway-view-model.js` only if a presentational count is not already exposed
- Modify: `tests/vocabulary-pathway-view-model.test.js`
- Create: `tests/vocabulary-pathway-overview.test.js`

**Interfaces:**
- `renderPathwayCard(...)` must display authoritative completed-stage count (`0..5`), current/next stage, and `Mastered ✓` when mastered.
- No new percentage, sessions-remaining count, or ETA.
- Existing `stageEvidence.progressPercent` may only be surfaced if its meaning is explicitly labelled as progress toward the current stage and does not imply sessions remaining.

- [ ] **Step 1: Write failing overview tests**

Assert an in-progress Meaning pathway renders:
- `2 of 5 stages complete` for completed stages `['recognise','match']`;
- `Next up: Apply` or equivalent current-stage wording;
- `Start 10-question session`/equivalent finite-session CTA;
- the five-rung ladder.

- [ ] **Step 2: Add mastered and unavailable-pathway tests**

Assert mastered shows `Mastered ✓` and unavailable/partial coverage does not fabricate five-stage completion.

- [ ] **Step 3: Remove/clarify competing activity counters**

If the unit/pathway screen currently exposes an ambiguous `0 / 10 activities` counter outside the active session, remove it or relabel it so it cannot be confused with the in-session `Question N of 10` counter.

- [ ] **Step 4: Implement overview copy/hierarchy**

Keep `buildUnitPathwayStates()` as the source of current/completed/mastered status. Only add a derived `completedStageCount` field if that keeps the renderer simpler; do not change progression semantics.

- [ ] **Step 5: Run focused tests and commit**

Run: `node --test tests/vocabulary-pathway-overview.test.js tests/vocabulary-pathway-view-model.test.js tests/vocabulary-pathway-session-progression.test.js`
Expected: PASS.

Commit: `feat: clarify vocabulary pathway end goal`

---

### Task 5: Mature completion styling, motion, and browser flow

**Files:**
- Modify: `vocabulary-study-app.css`
- Modify: `tests/runtime-smoke.spec.mjs`
- Modify: `tests/fixtures-vocabulary-student.mjs` only as needed to model a 10-question finish/stage transition; do not add private data.

**Interfaces:**
- Continue using existing `--study-accent`, `--study-accent-soft`, milestone animation tokens, and `.vocab-shell--session` visual system.
- Completion UI classes should be scoped under a dedicated completion root such as `.vocab-completion`.
- `@media (prefers-reduced-motion: reduce)` must neutralize celebratory transforms/animations.

- [ ] **Step 1: Add browser smoke for a normal 10-question finish**

Drive the real student controller through 10 questions and assert:
- completion screen appears;
- star/score summary appears;
- `Finish for now` returns to pathway overview;
- no page errors.

- [ ] **Step 2: Add browser smoke for retry scoring**

Make one question wrong then correct it; finish the set; assert retry is acknowledged but the star/first-attempt score reflects the miss.

- [ ] **Step 3: Add browser smoke for Stage Complete / next-stage CTA**

Use fixture progression so the 10th saved answer genuinely advances a stage; assert the button names the next stage and launches it.

- [ ] **Step 4: Add browser smoke for save failure on question 10**

Assert the sync warning remains visible and completion celebration does not render until/if the save is resolved.

- [ ] **Step 5: Style the completion hierarchy**

Implement:
- stronger but restrained accent surface;
- large readable star row with textual/ARIA meaning;
- compact learning-stat cards;
- visually stronger Stage Complete and Pathway Mastered variants;
- subtle one-shot burst/star animation;
- obvious keyboard focus;
- responsive layout down to current mobile smoke widths;
- no sound and no looping confetti.

- [ ] **Step 6: Run browser smoke and full unit suite**

Run: `npm test`
Expected: all Node tests PASS.

Run the repo’s Runtime Smoke command/workflow locally if available; otherwise run the same Playwright spec command used by CI against the local static server.
Expected: all runtime smoke tests PASS.

- [ ] **Step 7: Commit**

Commit: `style: add vocabulary session completion experience`

---

### Task 6: Final regression and deployment verification

**Files:**
- No product-code changes unless a failing verification exposes a real defect.
- Update tests only to fix genuine test defects, never to weaken acceptance criteria.

**Interfaces:**
- Final branch must preserve PR #124 save protections, PR #135 answer shuffle, and PR #136 Continue history.

- [ ] **Step 1: Run the targeted reward-loop tests**

Run:
`node --test tests/vocabulary-session-reward.test.js tests/vocabulary-session-completion-controller.test.js tests/vocabulary-completion-views.test.js tests/vocabulary-pathway-overview.test.js tests/vocabulary-study-ui.test.js tests/vocabulary-continue-history.test.js tests/vocabulary-pathway-session-progression.test.js tests/vocabulary-pathway-view-model.test.js`

Expected: PASS.

- [ ] **Step 2: Run full repository tests**

Run: `npm test`
Expected: full suite PASS with no skipped regression introduced by this work.

- [ ] **Step 3: Review diff for forbidden scope**

Confirm no changes to progression thresholds, Supabase schema, attempt IDs, evidence contract, answer shuffling, unrelated apps, or student-private data.

- [ ] **Step 4: Open PR and wait for required branch checks**

Required pre-merge checks:
- Vocabulary Builder CI
- System Audit
- Runtime Smoke

- [ ] **Step 5: Merge only when green**

Record the exact merged `main` SHA.

- [ ] **Step 6: Verify exact-SHA deployment**

Verify the exact merged SHA against:
- Vocabulary Builder CI
- System Audit
- Runtime Smoke
- Pages build/deployment

Only after all four are green on the exact merged SHA may the work be described as deployed/live.

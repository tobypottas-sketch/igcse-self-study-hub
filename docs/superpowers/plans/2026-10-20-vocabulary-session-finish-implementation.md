# Vocabulary Builder Session Finish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current open-ended Vocabulary Builder session summary with a clear 10-question mission finish experience that can render Session Complete, Stage Complete, or Pathway Mastered without changing progression or persistence semantics.

**Architecture:** Add one small pure presentation-model helper for result classification/copy, keep `src/vocabulary/app.js` as the controller, keep `src/vocabulary/views.js` as the renderer, and continue using `buildUnitPathwayStates()` as the authoritative client representation of persisted pathway state. Reuse existing study artwork/motion layers instead of creating a parallel completion system.

**Tech Stack:** ES modules, browser DOM rendering, Node built-in test runner (`node --test`), existing Vocabulary Builder CSS/art runtime, existing Supabase-backed persistence flow.

**Spec:** `docs/superpowers/specs/2026-10-20-vocabulary-session-finish-design.md`

## Global Constraints

- Do not change progression thresholds, mastery thresholds, evidence rules, attempt IDs, idempotency, or persistence semantics.
- Do not infer stage completion from score or stars.
- Stars are presentation-only and apply only to normal 10-target missions: 9-10 = 3, 7-8 = 2, 5-6 = 1, 0-4 = no stars.
- Staff Preview must never claim saved progress or invent hypothetical progression.
- Continue must retain `recentActivities` and `usedContentIds` through the existing `continueHistory=true` path.
- `Finish for now` must return to the current Unit view without creating an extra attempt or persistence event.
- Timed and Mixed Practice semantics must not regress.
- Reuse existing artwork in `assets/vocabulary-study/` and existing `study-art-runtime.js`; do not introduce new image assets for this feature.
- Implementation branch must be created fresh from the latest `main`, not from the docs branch or Claude's Unit 1 content branch.

## Review Focus

- Persistence lag/failure: no stage-clear or mastery claim may render before the save chain resolves successfully.
- Non-10 sessions: render the truthful denominator and do not apply the 10-question star rubric.
- Stage transition edge: only a later authoritative `currentStage` counts as stage completion; same-stage results remain ordinary session completion.
- Preview mode: session-level celebration is allowed, saved/unlocked/mastered claims are not.
- Shared summary regression: timed and Mixed Practice must still render and Continue correctly even though the pathway finish experience becomes richer.

---

## File Structure

**Create**
- `src/vocabulary/session-finish-model.js` — pure presentation-only derivation for score, stars, variant, labels, copy and CTA metadata.
- `tests/vocabulary-session-finish-model.test.js` — result-model unit tests.
- `tests/vocabulary-session-finish-controller.test.js` — controller/persistence ordering and pathway before/after transition tests.
- `tests/vocabulary-session-finish-view.test.js` — rendered markup/copy/accessibility tests.

**Modify**
- `src/vocabulary/app.js` — capture starting pathway stage, wait for persistence, rebuild authoritative pathway state, build finish model, pass it to renderer, focus result heading, preserve existing Continue/Finish handlers.
- `src/vocabulary/views.js` — render the adaptive Mission Result Card from the finish model while retaining fallback behavior for timed/Mixed Practice.
- `src/vocabulary/study-art-runtime.js` — select completion/stage/mastery artwork from result variant rather than always using the generic completion trophy.
- `vocabulary-study-app.css` — result-card hierarchy, stars, evidence tiles, stage ladder, CTA layout, responsive and focus behavior.
- `vocabulary-study-art.css` — variant-specific artwork/motion treatment; reduce current generic ~2s completion sequence to the approved restrained envelopes.
- `tests/vocabulary-summary-continue.test.js` — update copy/action assertions while preserving the same controller route.
- `tests/vocabulary-staff-preview.test.js` — pin non-persistent finish wording.
- `tests/vocabulary-study-app-css.test.js` — result-card responsive/accessibility structure.
- `tests/vocabulary-motion-polish.test.js` — update motion expectations for standard/stage/mastery finish states.
- `tests/vocabulary-continue-history.test.js` — keep anti-repeat coverage and add stage-clear Continue assertion if needed.

---

### Task 1: Pure finish-result model

**Files:**
- Create: `src/vocabulary/session-finish-model.js`
- Create: `tests/vocabulary-session-finish-model.test.js`

**Interfaces:**
- Consumes: `PATHWAY_STAGES`, pathway identity/labels, session summary, session mode/target count, preview flag, starting stage, authoritative post-save pathway state.
- Produces: `buildSessionFinishModel(input) -> { variant, score, denominator, stars, pathwayLabel, stageLabel, stageNumber, nextStageLabel, heading, kicker, supportCopy, primaryAction, showProgressSaved, completedStages, accessibleSummary }`.

- [ ] **Step 1: Write failing star and denominator tests**

Add tests asserting:
- `{strengthened:10, practised:10}` => `stars === 3`
- `9/10 => 3`, `8/10 => 2`, `6/10 => 1`, `4/10 => 0`
- `4/8` keeps denominator `8` and returns `stars === null` (10-question rubric not applicable)
- numerator comes from `summary.strengthened`; denominator comes from `summary.practised`.

- [ ] **Step 2: Run the focused test**

Run: `node --test tests/vocabulary-session-finish-model.test.js`
Expected: FAIL because the module/function does not yet exist.

- [ ] **Step 3: Implement `buildSessionFinishModel(input)`**

Signature:

```js
export function buildSessionFinishModel({
  summary = {},
  pathwayId = null,
  startStage = null,
  postPathwayState = null,
  preview = false,
  fixedMissionSize = 10
} = {})
```

Rules:
- `variant = 'session'` by default.
- If not preview and `postPathwayState.mastered === true`, `variant = 'mastered'`.
- Else if not preview and both stages are valid and post-stage index is greater than start-stage index, `variant = 'stage-complete'`.
- Never use score to classify stage completion.
- Preview always remains session-level unless an existing authoritative non-persisting progression result is explicitly passed in later; do not create one here.
- `stars` is `3/2/1/0` only when `practised === fixedMissionSize`; otherwise `null`.
- Low-score 10-target result returns `stars:0` but renderer will omit empty-star UI.
- Copy must match the approved spec.

- [ ] **Step 4: Add failing classification/copy tests, then make them pass**

Tests must cover:
- same start/post stage => `session`
- Match -> Apply => `stage-complete`, heading `MATCH COMPLETE`, CTA `Start Apply`
- Mastery flag => `mastered`, no Continue CTA
- preview with post state advanced/mastered => still session-level and `showProgressSaved === false`
- high/middle/low support copy is fixed, not random.

Run: `node --test tests/vocabulary-session-finish-model.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/vocabulary/session-finish-model.js tests/vocabulary-session-finish-model.test.js
git commit -m "feat: add vocabulary session finish model"
```

---

### Task 2: Controller integration after authoritative persistence

**Files:**
- Modify: `src/vocabulary/app.js`
- Create: `tests/vocabulary-session-finish-controller.test.js`
- Modify: `tests/vocabulary-continue-history.test.js`

**Interfaces:**
- Consumes: `buildSessionFinishModel()` from Task 1 and existing `buildUnitPathwayStates()`.
- Produces: transient `state.pathwayStage` start snapshot remains the source of the pre-session stage; `finishSession()` passes a complete `finishModel` to `renderSessionSummary()`.

- [ ] **Step 1: Write failing persistence-order tests**

Create a VM/controller harness following the existing `vocabulary-continue-history.test.js` pattern and assert:
- `finishSessionWhenSaved()` does not render a saved stage result until `state.persistenceChain` resolves.
- when `persistenceBlocked === true`, it does not render `stage-complete` or `mastered`.
- after persistence updates `state.unitMastery`, `buildUnitPathwayStates()` is called from current state and Match -> Apply produces a stage-complete finish model.
- same-stage authoritative state produces an ordinary session model.
- mastered authoritative state produces mastery.

- [ ] **Step 2: Run the controller test**

Run: `node --test tests/vocabulary-session-finish-controller.test.js`
Expected: FAIL on missing finish-model integration.

- [ ] **Step 3: Integrate the finish model into `src/vocabulary/app.js`**

Implementation requirements:
- import `buildSessionFinishModel`.
- do not add another persisted journey/session-result object.
- `startPathwaySession()` already sets `state.pathwayStage`; treat that as the immutable session-start stage until the session ends.
- after `await state.persistenceChain`, rebuild `postPathwayState` from `buildUnitPathwayStates({ occurrences:state.content.occurrences, unitMastery:state.unitMastery, globalMastery:state.globalMastery })[state.pathwayId]`.
- call `buildSessionFinishModel({ summary:state.session.summary, pathwayId:state.pathwayId, startStage:state.pathwayStage, postPathwayState, preview:state.preview, fixedMissionSize:10 })`.
- pass `pathwayId`, `finishModel`, `summary`, `practiceMode`, `durationMinutes` into `renderSessionSummary()`.
- after render/decorate, focus the result heading via a stable selector such as `[data-session-finish-heading]` with `tabindex="-1"`.
- for non-pathway/timed/Mixed Practice, pass `finishModel:null` and preserve existing functional behavior.

- [ ] **Step 4: Verify Continue still delegates to existing mechanics**

Extend tests to assert:
- same-stage CTA action still reaches `continuePractice()` -> `startPathwaySession(pathwayId,true)`.
- stage-clear CTA also reaches the same `continuePractice()` route, allowing `startPathwaySession()` to re-derive the now-authoritative next stage rather than accepting a UI-provided override.
- recent-question history remains intact across both cases.

Run:
`node --test tests/vocabulary-session-finish-controller.test.js tests/vocabulary-continue-history.test.js tests/vocabulary-summary-continue.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/vocabulary/app.js tests/vocabulary-session-finish-controller.test.js tests/vocabulary-continue-history.test.js tests/vocabulary-summary-continue.test.js
git commit -m "feat: classify vocabulary finishes after persistence"
```

---

### Task 3: Mission Result Card renderer and action semantics

**Files:**
- Modify: `src/vocabulary/views.js`
- Create: `tests/vocabulary-session-finish-view.test.js`
- Modify: `tests/vocabulary-staff-preview.test.js`

**Interfaces:**
- Consumes: `finishModel` from Task 1/2.
- Produces: one adaptive result-card DOM structure with variant data attributes and existing `continue-practice` / `back-unit` action hooks.

- [ ] **Step 1: Write failing renderer tests for the four visible states**

Render `renderSessionSummary()` with representative models and assert:
- standard: `SESSION COMPLETE`, score, earned stars, evidence tiles, current pathway/stage, `Continue studying`, `Finish for now`.
- low score: no star glyph row / no empty-star UI; supportive copy present; no red/fail wording.
- stage complete: `MATCH COMPLETE`, `Stage 2 cleared`, `APPLY UNLOCKED`, `Start Apply`, five-stage ladder with text/ticks.
- mastery: `MEANING MASTERED`, all stages complete, only a finish/back action and no forced next-stage CTA.

- [ ] **Step 2: Add accessibility assertions**

Assert:
- heading has `data-session-finish-heading` and `tabindex="-1"`.
- star UI has a text equivalent such as `aria-label="3 out of 3 stars earned"`.
- stage states contain text/ticks and are not colour-only.
- accessible summary includes score/evidence/stage result.

- [ ] **Step 3: Add Preview assertions**

For `preview:true` finish model:
- contains `Preview only — no progress has been saved.`
- does not contain `Your progress is saved.`
- does not contain `unlocked`, `mastered` or `complete` as a saved pathway claim merely because mock post-state is advanced.
- existing STAFF PREVIEW banner contract remains unchanged.

Run: `node --test tests/vocabulary-session-finish-view.test.js tests/vocabulary-staff-preview.test.js`
Expected: FAIL before renderer changes.

- [ ] **Step 4: Rewrite the pathway finish branch of `renderSessionSummary()`**

Keep a compatibility/fallback branch for timed and Mixed Practice. For pathway `finishModel`:
- one `article.vocab-summary-card[data-study-completion][data-finish-variant="..."]`.
- fixed content hierarchy from the spec.
- `data-action="continue-practice"` for ordinary/stage-complete primary CTA.
- `data-action="back-unit"` labelled `Finish for now` for all pathway variants.
- mastery does not render a Continue CTA.
- do not render `summary.advanced`; it is not part of the canonical session summary model.

- [ ] **Step 5: Run view/preview tests**

Run: `node --test tests/vocabulary-session-finish-view.test.js tests/vocabulary-staff-preview.test.js tests/vocabulary-session-ux.test.js`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/vocabulary/views.js tests/vocabulary-session-finish-view.test.js tests/vocabulary-staff-preview.test.js
git commit -m "feat: render vocabulary mission result states"
```

---

### Task 4: Artwork selection and polished responsive styling

**Files:**
- Modify: `src/vocabulary/study-art-runtime.js`
- Modify: `vocabulary-study-app.css`
- Modify: `vocabulary-study-art.css`
- Modify: `tests/vocabulary-study-app-css.test.js`
- Modify: `tests/vocabulary-motion-polish.test.js`

**Interfaces:**
- Consumes: `data-finish-variant="session|stage-complete|mastered"` from Task 3.
- Produces: correct existing achievement artwork and restrained motion for each variant.

- [ ] **Step 1: Write failing CSS/art tests**

Assert:
- standard, stage-complete and mastered selectors exist.
- evidence tiles and star row have explicit layout classes.
- actions are side-by-side on desktop and stacked at `max-width:620px`.
- result ladder cannot force horizontal overflow.
- reduced-motion rules cover result card, stars, artwork and stage transition.
- standard completion animation is approximately 500-700 ms; stage approximately 700-900 ms; mastery may be stronger but restrained.
- remove/update the old test expectation that every completion uses a ~2000 ms generic trophy animation.

- [ ] **Step 2: Update artwork decorator**

In `decorateCompletion(scope)`:
- read `card.dataset.finishVariant`.
- map `session -> achievementArtwork('completion')`, `stage-complete -> achievementArtwork('stage_advanced')`, `mastered -> achievementArtwork('mastered')`.
- keep artwork decorative where the visible text already communicates the result.
- preserve idempotent decoration.

- [ ] **Step 3: Add result-card layout styles in `vocabulary-study-app.css`**

Add focused classes for:
- finish identity/header
- stars
- score
- two evidence tiles
- pathway context and five-stage result ladder
- stage unlock callout
- action row
- mobile stacking and overflow prevention.

Do not alter question-card geometry or the frozen Unit/pathway card geometry.

- [ ] **Step 4: Adjust motion/art styles in `vocabulary-study-art.css`**

Use variant selectors rather than one universal long trophy sequence. Reuse current keyframe language where practical; do not add full-window confetti.

- [ ] **Step 5: Run CSS/motion tests**

Run: `node --test tests/vocabulary-study-app-css.test.js tests/vocabulary-motion-polish.test.js`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/vocabulary/study-art-runtime.js vocabulary-study-app.css vocabulary-study-art.css tests/vocabulary-study-app-css.test.js tests/vocabulary-motion-polish.test.js
git commit -m "feat: style vocabulary mission finish states"
```

---

### Task 5: Regression protection for score semantics, preview, timed and Mixed Practice

**Files:**
- Modify if needed: `tests/vocabulary-session-summary-score.test.js`
- Modify if needed: `tests/vocabulary-summary-continue.test.js`
- Modify if needed: `tests/vocabulary-staff-preview.test.js`
- Modify if needed: `tests/vocabulary-session-ux.test.js`
- No production change unless a regression is found.

**Interfaces:**
- Consumes all prior tasks.
- Produces a regression gate proving the finish redesign did not change session/persistence behavior.

- [ ] **Step 1: Pin score semantics**

Keep/add assertions that:
- supported retry + later recovery cannot make `strengthened > practised`.
- incomplete supported retry does not count toward the displayed numerator or denominator.
- completed unsuccessful target increments `practised` and `needsAnotherLook`, not `strengthened`.

- [ ] **Step 2: Pin timed/Mixed fallback behavior**

Add/retain assertions that:
- timed Continue still calls `startSession('timed',duration,true)`.
- Mixed Practice Continue still calls `startMixedReview(true)`.
- shared `renderSessionSummary()` remains callable without `finishModel`.
- no pathway unlock/mastery copy is produced for timed or Mixed Practice fallback summaries.

- [ ] **Step 3: Run the Vocabulary-focused suite**

Run:

```bash
node --test \
  tests/vocabulary-session-finish-model.test.js \
  tests/vocabulary-session-finish-controller.test.js \
  tests/vocabulary-session-finish-view.test.js \
  tests/vocabulary-session-summary-score.test.js \
  tests/vocabulary-summary-continue.test.js \
  tests/vocabulary-continue-history.test.js \
  tests/vocabulary-pathway-session-progression.test.js \
  tests/vocabulary-staff-preview.test.js \
  tests/vocabulary-session-ux.test.js \
  tests/vocabulary-study-app-css.test.js \
  tests/vocabulary-motion-polish.test.js
```

Expected: all PASS.

- [ ] **Step 4: Run the full repository suite**

Run: `npm test`
Expected: PASS with no unrelated regressions.

- [ ] **Step 5: Commit any test-only hardening**

```bash
git add tests
git commit -m "test: harden vocabulary session finish regressions"
```

Skip this commit if no files changed.

---

### Task 6: Branch review, PR, exact-SHA CI and deployment verification

**Files:**
- No new product files expected.

**Interfaces:**
- Consumes completed implementation branch.
- Produces reviewed, merge-ready PR and exact-SHA verification.

- [ ] **Step 1: Rebase/refresh check against latest `main` before PR**

Compare branch base with current `main`. If `main` moved, inspect conflicts carefully and preserve the three known fixes:
- save contract repair
- answer-option shuffle
- Continue-history anti-repeat behavior.

Do not merge/overwrite Claude Unit 1 language-bank work blindly.

- [ ] **Step 2: Review branch diff**

Confirm changed production files are limited to the planned Vocabulary Builder owners. No Reading/Listening/Essay Writing/Evidence Hub files and no private student data.

- [ ] **Step 3: Open PR**

PR body must summarize:
- Session Complete / Stage Complete / Pathway Mastered result architecture
- no persistence/progression threshold changes
- preview safeguards
- Continue-history preservation
- focused and full test results.

- [ ] **Step 4: Verify PR CI on the exact head SHA**

Required checks should include the repo's Vocabulary Builder CI/System Audit/runtime smoke where configured. Do not claim success from an older SHA.

- [ ] **Step 5: Merge only after checks pass, then verify deployment on the merge SHA**

Confirm GitHub Pages/deployment run is associated with the exact merged commit SHA and succeeds.

- [ ] **Step 6: Final live sanity check**

Verify at minimum:
- ordinary 10-question result
- low-score result
- stage-clear result
- mastery result
- Continue starts the correct stage without immediate repeats
- Finish for now returns to Unit with saved progress visible
- Staff Preview says nothing was saved
- mobile result layout has no horizontal overflow.

---

## Self-Review Result

- Spec coverage: all approved sections are mapped to Tasks 1-6.
- No task changes progression thresholds or persistence contracts.
- Stage transition classification depends only on post-save `buildUnitPathwayStates()` output.
- Preview deliberately avoids hypothetical unlock logic.
- Continue uses the existing controller route, preserving recent-question history.
- Timed and Mixed Practice are explicitly regression-gated.
- Existing artwork/CSS ownership is preserved rather than replaced.
- No implementation branch is created by this plan; execution must start from the then-latest `main`.

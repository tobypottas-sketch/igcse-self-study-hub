# Vocabulary & Paraphrasing Builder — Modern Study App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the student-facing Vocabulary & Paraphrasing Builder into the approved modern study-app experience while preserving all existing vocabulary progression, evidence, mastery, persistence, and privacy semantics.

**Architecture:** Keep the existing renderer/orchestrator split (`src/vocabulary/views.js` + `src/vocabulary/app.js`) and add a small presentation-only identity/icon helper plus one shared visual/motion CSS layer. Behavioural hooks for transitions and milestone rendering consume existing pathway/session/mastery state only; they never decide progression.

**Tech Stack:** Vanilla ES modules, HTML, CSS, inline SVG, existing Node test suite, existing GitHub Actions Vocabulary Builder CI/runtime smoke/system audit.

**Spec:** `docs/superpowers/specs/2026-10-19-vocabulary-modern-study-app-design.md`

## Global Constraints

- Scope is Vocabulary & Paraphrasing Builder only; do not touch Reading, Listening, standalone Paraphrasing, Essay Writing, Evidence Hub, or unrelated repos.
- Preserve `Recognise → Match → Apply → Recall → Mastery` semantics exactly.
- Do not change evidence thresholds, mastery rules, historical evidence, student history, attempt IDs, idempotency, persistence protections, or server-authoritative progression.
- Do not alter canonical vocabulary wording/content as part of this visual redesign.
- Stage 2 Match remains card-based; do not reintroduce fixed matching dropdowns.
- Use one coherent inline-SVG icon family; do not add a large third-party icon runtime.
- Motion must respect `prefers-reduced-motion` and must not block answering/continuation.
- Keep mobile one-column where required and introduce no horizontal scrolling.
- Colour must not be the only state signal; keyboard focus must remain visible.

## Review Focus

1. **Existing Stage 2 Match questions** — visual refresh must preserve card selection and hidden answer wiring, with no dropdown regression. Covered in Task 4 contract tests.
2. **Reduced-motion users** — all new transitions/celebrations must collapse to immediate or near-immediate state changes. Covered in Task 2 CSS contract tests.
3. **Unavailable pathway content** — cards must remain explicitly unavailable, not merely styled as locked progress. Covered in Task 3 rendering tests.
4. **Real versus cosmetic advancement** — stage/mastery celebration must render only when before/after authoritative state proves a transition. Covered in Task 7 tests.
5. **Small mobile viewports / long text** — question cards, retry states, and dictionary rows must wrap without horizontal overflow. Covered in Task 8 CSS/runtime smoke checks.

---

## File Structure

**Create**
- `src/vocabulary/study-ui.js` — pathway identity metadata, shared inline SVG icon renderer, presentation-only milestone helpers.
- `vocabulary-study-app.css` — shared design tokens, pathway accents, motion primitives, common cards, feedback, completion, milestone, responsive/reduced-motion rules.
- `tests/vocabulary-study-ui.test.js` — unit tests for pathway identities/icons/milestone derivation.
- `tests/vocabulary-study-app-rendering.test.js` — DOM/string rendering contracts for the refreshed UI.
- `tests/vocabulary-study-app-css.test.js` — CSS token/reduced-motion/responsive contract checks.

**Modify**
- `vocabulary.html` — load the shared study-app CSS layer.
- `src/vocabulary/views.js` — render pathway identity hooks, question header, retry/correct states, completion/milestone markup, dictionary polish hooks.
- `src/vocabulary/app.js` — pass real session/pathway transition data into views and expose before/after state needed for milestone display.
- `src/vocabulary/foundational-interactions.js` — add presentation-only state hooks for answer selection/feedback where required; keep answer semantics unchanged.
- Existing focused vocabulary CSS files only where component ownership requires it, avoiding duplicate style ownership.
- Existing vocabulary tests as needed to pin no-regression behaviour.

---

### Task 1: Shared Pathway Identity and Icon Layer

**Files:**
- Create: `src/vocabulary/study-ui.js`
- Create: `tests/vocabulary-study-ui.test.js`

**Interfaces:**
- Produces: `pathwayIdentity(pathwayId) -> { id, label, purpose, accent, icon }`
- Produces: `renderStudyIcon(iconId, { className = '', label = null } = {}) -> string`
- Consumes: existing six pathway IDs from `VOCABULARY_PATHWAYS`.

- [ ] **Step 1: Write failing tests** asserting all six pathways return a stable identity, known pathway icons render inline SVG, unknown IDs fail safely to a neutral identity, decorative icons are `aria-hidden`, and labelled icons expose accessible text.
- [ ] **Step 2: Run** `node --test tests/vocabulary-study-ui.test.js` and verify failure because the module does not yet exist.
- [ ] **Step 3: Implement** `src/vocabulary/study-ui.js` as a presentation-only lookup/helper with no progression imports or state mutation.
- [ ] **Step 4: Re-run** `node --test tests/vocabulary-study-ui.test.js` and verify PASS.
- [ ] **Step 5: Commit** `test/feat: add vocabulary study UI identity layer`.

### Task 2: Shared Study-App CSS Tokens and Motion Primitives

**Files:**
- Create: `vocabulary-study-app.css`
- Create: `tests/vocabulary-study-app-css.test.js`
- Modify: `vocabulary.html`

**Interfaces:**
- Produces CSS custom properties for shared surfaces, radii, shadow, pathway accents, and motion durations.
- Produces reusable classes for `study-icon`, `study-progress`, `study-enter`, `study-success`, `study-error`, `study-milestone`, and pathway accent hooks.

- [ ] **Step 1: Write failing CSS contract tests** for the stylesheet link, timing tokens within the approved ranges, `prefers-reduced-motion`, focus-visible styling, mobile breakpoint, and overflow safeguards (`min-width:0`, wrapping where required).
- [ ] **Step 2: Run** `node --test tests/vocabulary-study-app-css.test.js` and verify FAIL.
- [ ] **Step 3: Implement** the shared CSS layer and add it to `vocabulary.html` after the current component styles so it can intentionally refine presentation without replacing component ownership.
- [ ] **Step 4: Re-run** the CSS contract test and verify PASS.
- [ ] **Step 5: Commit** `feat: add vocabulary study app visual tokens and motion`.

### Task 3: Unit Selection and Pathway Cards

**Files:**
- Modify: `src/vocabulary/views.js`
- Modify: `vocabulary-study-app.css`
- Create/Modify: `tests/vocabulary-study-app-rendering.test.js`

**Interfaces:**
- Consumes: `pathwayIdentity()` and `renderStudyIcon()` from Task 1.
- Produces refreshed `renderVocabularyHome()` and `renderVocabularyUnit()` markup while preserving existing `data-action`, `data-unit`, `data-pathway`, `disabled`, and `aria-disabled` hooks.

- [ ] **Step 1: Write failing rendering tests** asserting unit cards expose visual progress hooks, pathway cards include icon + one-line purpose + status + existing five-rung rail + CTA, mastered/needs-practice/unavailable states remain distinguishable in text and data attributes, and unavailable pathways remain disabled.
- [ ] **Step 2: Run** the focused rendering test and verify FAIL against current markup.
- [ ] **Step 3: Update** `views.js` markup only; do not alter `normalizedPathwayState()` or `stageVisualState()` progression logic.
- [ ] **Step 4: Add** restrained card elevation, pathway edge accents, icon tiles, and progress styling in `vocabulary-study-app.css`.
- [ ] **Step 5: Run** focused rendering tests plus existing pathway view-model/progression tests and verify PASS.
- [ ] **Step 6: Commit** `feat: refresh vocabulary unit and pathway cards`.

### Task 4: Question Header, Stable Canvas, and Answer Micro-Interactions

**Files:**
- Modify: `src/vocabulary/views.js`
- Modify: `src/vocabulary/foundational-interactions.js`
- Modify: `vocabulary-study-app.css`
- Modify: `tests/vocabulary-stage2-match-card-rendering.test.js`
- Modify: `tests/vocabulary-stage2-match-card-contract.test.js`
- Modify/Create: `tests/vocabulary-study-app-rendering.test.js`

**Interfaces:**
- `renderVocabularyQuestion()` gains presentation inputs for pathway identity/stage and session position while preserving question/answer contract.
- Existing `[data-match-card]`, hidden `input[name=answer]`, `is-selected`, and `aria-pressed` behaviour remains authoritative.

- [ ] **Step 1: Write failing tests** for a stable question header containing pathway icon/label, rung, `N / 10`, progress hook, and unchanged Match Card answer wiring.
- [ ] **Step 2: Run** focused question/Stage 2 tests and verify FAIL only on new presentation expectations.
- [ ] **Step 3: Update** `renderVocabularyQuestion()` to separate instruction, cue/source, and answer area; add `data-study-question` and entrance-state hooks without changing answer values or form names.
- [ ] **Step 4: Add** selection press/hover/focus, correct pulse, incorrect nudge, and 160–220 ms question-entry CSS; ensure no persistent transform affects layout.
- [ ] **Step 5: If needed, update** `foundational-interactions.js` only to toggle presentation classes after existing selection events; do not change marking/submission behaviour.
- [ ] **Step 6: Run** focused tests, all Stage 2 Match tests, and existing question renderer tests; verify PASS and no dropdown regression.
- [ ] **Step 7: Commit** `feat: modernize vocabulary question experience`.

### Task 5: Retry and Correct-Answer Feedback States

**Files:**
- Modify: `src/vocabulary/views.js`
- Modify: `src/vocabulary/app.js` only if the renderer needs an explicit existing feedback-state flag
- Modify: `vocabulary-study-app.css`
- Modify/Create: `tests/vocabulary-study-app-rendering.test.js`

**Interfaces:**
- Consumes existing `supportiveFeedback()` / support objects and `support.kind` values.
- Produces `data-study-feedback="correct|retry"` presentation states and shared guidance panels.

- [ ] **Step 1: Write failing tests** asserting retry renders calm support text, narrow-match retry remains card-based with two choices, correct answers render a compact success panel, and ordinary correct answers do not render milestone/mastery celebration markup.
- [ ] **Step 2: Run** focused tests and verify FAIL.
- [ ] **Step 3: Refactor presentation markup** so retry choices reorganise within the same answer-card system and correct feedback has a consistent icon/message/CTA hierarchy.
- [ ] **Step 4: Add** withdraw/collapse/reflow transitions that degrade immediately under reduced motion.
- [ ] **Step 5: Run** retry/scaffolding tests, Stage 2 tests, and focused rendering tests; verify PASS.
- [ ] **Step 6: Commit** `feat: improve vocabulary retry and answer feedback`.

### Task 6: End-of-10 Completion Experience

**Files:**
- Modify: `src/vocabulary/views.js`
- Modify: `src/vocabulary/app.js`
- Modify: `vocabulary-study-app.css`
- Modify/Create: `tests/vocabulary-study-app-rendering.test.js`
- Modify existing session-summary tests if needed.

**Interfaces:**
- `renderSessionSummary()` consumes only existing session result data plus derived, evidence-backed counts supplied by `app.js`.
- No new motivational metric may be invented; absent values are omitted rather than guessed.

- [ ] **Step 1: Write failing tests** asserting completion markup includes completed count, existing correct/clean count, only real strengthened/advanced counts when supplied, pathway identity when relevant, and both continue/back-to-unit actions.
- [ ] **Step 2: Add a regression assertion** that summary success counts never exceed completed targets, preserving the existing recovery-safe scoring fix.
- [ ] **Step 3: Run** focused summary tests and verify FAIL on new presentation only.
- [ ] **Step 4: Update** `app.js` to pass existing session/progression facts needed by the summary; do not infer mastery in the view.
- [ ] **Step 5: Update** `renderSessionSummary()` and CSS with completion ring, short geometric burst, count-up-ready hooks, and no forced delay.
- [ ] **Step 6: Run** session summary, session, persistence, and focused rendering tests; verify PASS.
- [ ] **Step 7: Commit** `feat: add vocabulary session completion experience`.

### Task 7: Real Stage Advancement and Mastery Moments

**Files:**
- Modify: `src/vocabulary/app.js`
- Modify: `src/vocabulary/views.js`
- Modify: `src/vocabulary/study-ui.js`
- Modify: `vocabulary-study-app.css`
- Modify: `tests/vocabulary-study-ui.test.js`
- Modify/Create: `tests/vocabulary-study-app-rendering.test.js`

**Interfaces:**
- Produces: `deriveStudyMilestone({ beforePathwayState, afterPathwayState, term, pathwayId }) -> null | { kind:'stage_advanced'|'mastered', ... }`.
- `app.js` captures before/after states around the already-authoritative attempt persistence/update path and passes the derived presentation event to the renderer.

- [ ] **Step 1: Write failing unit tests** proving no milestone for unchanged state, one stage-advance event for a genuine rung change, mastery event only when mastery changes false→true, and no event for review of already-mastered content.
- [ ] **Step 2: Run** `node --test tests/vocabulary-study-ui.test.js` and verify FAIL.
- [ ] **Step 3: Implement** pure milestone derivation in `study-ui.js`; it must compare state only and never write evidence.
- [ ] **Step 4: Wire** before/after authoritative pathway state snapshots in `app.js` after the existing attempt result updates local state.
- [ ] **Step 5: Render** compact stage advancement and stronger mastery overlays/panels in `views.js`; no sound, no forced wait, normal CTA remains available.
- [ ] **Step 6: Add** 350–650 ms rung animation and 500–900 ms mastery animation plus reduced-motion overrides.
- [ ] **Step 7: Run** milestone tests plus progression/evidence/mastery regression suites; verify PASS with no semantic diffs.
- [ ] **Step 8: Commit** `feat: celebrate real vocabulary progression milestones`.

### Task 8: Dictionary, Loading/Empty/Error, Responsive and Accessibility Polish

**Files:**
- Modify: `src/vocabulary/views.js`
- Modify: `vocabulary-study-app.css`
- Modify focused existing dictionary CSS only where ownership is already established
- Modify/Create: `tests/vocabulary-study-app-rendering.test.js`
- Modify: `tests/vocabulary-study-app-css.test.js`

**Interfaces:**
- Consumes current dictionary/context/pathway data only.
- Produces refined dictionary cards and lightweight state illustrations/icons without adding language-bank content.

- [ ] **Step 1: Write failing tests** for dictionary pathway identity hooks, Mastery text+icon treatment, mature loading/empty/error icon hooks, long-text wrapping, mobile single-column behaviour, focus-visible, and absence of horizontal overflow rules.
- [ ] **Step 2: Run** focused rendering/CSS tests and verify FAIL.
- [ ] **Step 3: Update** dictionary/list markup and empty/loading/error presentation using the shared icon system; preserve the current prominent `In context` area and all current copy/content.
- [ ] **Step 4: Complete** responsive CSS for phone/tablet/desktop and accessible contrast/focus/reduced-motion states.
- [ ] **Step 5: Run** focused tests and existing word-list/dictionary tests; verify PASS.
- [ ] **Step 6: Commit** `feat: finish vocabulary study app polish`.

### Task 9: Whole-Feature Verification and PR

**Files:**
- No product changes unless verification exposes a real regression.

**Interfaces:**
- Consumes all previous tasks.
- Produces one reviewable feature branch/PR with verified behaviour.

- [ ] **Step 1: Run** `npm test` and require PASS.
- [ ] **Step 2: Run** `node scripts/validate-vocabulary-content.mjs` and require PASS; visual work must not modify canonical vocabulary content.
- [ ] **Step 3: Run** the repository's existing Vocabulary Builder CI workflow on the feature branch and require PASS.
- [ ] **Step 4: Run** Runtime Smoke and require PASS, checking desktop and mobile question flow, Match Cards, retries, completion, and no horizontal scroll.
- [ ] **Step 5: Run** System Audit and require PASS.
- [ ] **Step 6: Compare** feature branch to `main`; explicitly confirm no changes to Supabase migrations/functions governing evidence/mastery, pathway thresholds, session persistence, attempt IDs, or vocabulary content banks.
- [ ] **Step 7: Perform visual review** against the approved concept: mature rather than childish, restrained pathway colour, no excessive animation, no accidental pink dominance, and genuine milestones visibly stronger than ordinary correct answers.
- [ ] **Step 8: Open PR** with screenshots/summary, test evidence, accessibility/reduced-motion notes, and explicit statement that progression semantics are unchanged.
- [ ] **Step 9: Do not merge** until required checks are green and review is complete.

---

## Self-Review Result

- Spec coverage: all eight rollout phases are mapped to Tasks 1–8; Task 9 covers required verification/rollout.
- Boundary check: new code is limited to a presentation helper and shared CSS layer; existing progression/controller ownership is preserved.
- Review-focus coverage: Stage 2 no-dropdown regression, reduced motion, unavailable pathways, genuine milestones, and mobile overflow each have an owning test task.
- Scope check: this is large but cohesive — all work shares one visual system and one renderer/orchestrator boundary, so one implementation plan is appropriate.

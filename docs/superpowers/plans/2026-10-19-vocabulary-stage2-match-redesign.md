# Vocabulary Builder Stage 2 Match Redesign — Implementation Plan

> **Execution:** Implement this plan natively in this session after user approval. Use TDD task-by-task: RED first, then the smallest production change that makes the test GREEN.

**Goal:** Replace the generic dropdown-based Stage 2 matching experience with a shared Match Card interaction and pathway-specific, pedagogically valid Match tasks across Meaning, Context, Word Families, Paraphrasing, Precision & Use, and Spelling & Recall.

**Architecture:** Keep the existing five-rung, per-word/per-pathway evidence ladder and existing activity type IDs. Stage 2 questions will carry a normalized Match Card payload (`matchCue`, `matchOptions`, `matchPresentation`) while preserving existing marking references, attempt persistence, evidence semantics, and server-authoritative progression. The renderer becomes interaction-focused; builders remain responsible for pedagogically valid content.

**Tech stack:** Vanilla JavaScript modules, existing Vocabulary Builder rendering/session architecture, Node `node:test`, current GitHub Actions Vocabulary Builder CI.

**Spec:** `docs/superpowers/specs/2026-10-19-vocabulary-stage2-match-redesign.md`

## Global constraints

- Vocabulary Builder only. Do not touch Evidence Hub or unrelated repos/features.
- Do not change Recognise → Match → Apply → Recall → Mastery.
- Do not change pathway mastery/evidence thresholds, retry evidence semantics, historical evidence, student history, vocabulary IDs, occurrence IDs, attempt IDs, idempotency, or server-authoritative progression.
- Do not reintroduce `vocabulary_unit_pathway_journey` or the retired 10/8 journey as authority.
- Do not alter Supabase schema/content unless a failing test proves application-only repair is impossible. No migration is expected.
- Do not create a second content source. Use existing canonical items, contexts, phrase/idea sets, and writing sets.
- Builders must fail closed rather than invent unrelated distractors.
- Stage 2 fixed-pathway matching must never use a visible browser `<select>`.
- Keep later-stage drag interactions independent; do not remove drag/drop fallbacks merely because Stage 2 no longer uses dropdowns.
- No horizontal scrolling at supported desktop/tablet/mobile widths.
- Privacy rule remains absolute: no real student/private learning data in GitHub.

## Review focus

- Match Card UI must be a presentation/input change, not a new progression system.
- Correct answer values passed into the existing answer pipeline must remain exactly the values expected by current `markingReference.acceptedAnswers` and server marking.
- Context/Precision cues appear once, not duplicated in prompt/source/target areas.
- Word Family distractors must come from the same target lexical family and be genuinely contrastive.
- Meaning session variation must alternate direction when both directions are buildable without borrowing Apply activities.
- Paraphrasing Match stays grounded in curated phrase/idea data.
- Spelling variants must be visible simultaneously.
- Existing choice, text, spelling input, tiles, evidence, drag-match, and drag-gap modes must remain stable.

---

### Task 1: Define and prove the Stage 2 Match Card question contract

**Files:**
- Create: `tests/vocabulary-stage2-match-card-contract.test.js`
- Modify: `src/vocabulary/foundational-activity-builder.js`
- Modify: `src/vocabulary/pathway-activity-builder.js`
- Modify if needed: `src/vocabulary/activity-builder.js`
- Modify if needed: `src/vocabulary/activity-factory.js`

**Interface:**
A fixed-pathway Stage 2 Match question should expose:

```js
{
  pathwayStage: 'match',
  matchCue: 'one visible cue',
  matchOptions: ['option A','option B','option C','option D'],
  matchPresentation: 'meaning_word_to_definition', // stable descriptive id
  markingReference: { acceptedAnswers:[...] }
}
```

The underlying `type`, `contentId`, `contentSource`, `primaryEvidenceTargetId`, evidence metadata and accepted answers remain authoritative and unchanged.

- [ ] **Step 1: Write RED contract tests** for Meaning, Context, Word Family, Precision and Spelling Match builders asserting `matchCue`, `matchOptions`, `matchPresentation`, four unique options where valid, and accepted answer inclusion.
- [ ] **Step 2: Add a RED paraphrasing Stage 2 test** proving a fixed-pathway `phrase_match` question can be normalized for Match Cards without changing the ordinary legacy/adaptive `phrase_match` contract outside Stage 2.
- [ ] **Step 3: Run only the new contract test** with `node --test tests/vocabulary-stage2-match-card-contract.test.js` and confirm RED.
- [ ] **Step 4: Add the minimal normalized Match Card fields** in the responsible builders. Do not change activity IDs or evidence metadata.
- [ ] **Step 5: Re-run targeted test and confirm GREEN.**
- [ ] **Step 6: Run `tests/vocabulary-marking-parity-matrix.test.js`** to prove accepted-answer/server parity was not disturbed.
- [ ] **Step 7: Commit** the question-contract/builder foundation.

### Task 2: Repair pathway-specific Stage 2 pedagogy

**Files:**
- Modify: `src/vocabulary/foundational-activity-builder.js`
- Modify: `src/vocabulary/pathway-activity-builder.js`
- Modify: `src/vocabulary/activity-builder.js`
- Modify: `src/vocabulary/session-targets.js`
- Modify: `tests/vocabulary-word-family-prompt-diversity.test.js`
- Modify/add: `tests/vocabulary-stage2-match-card-contract.test.js`
- Modify/add: `tests/vocabulary-source-card-deduplication.test.js`

**Interfaces by pathway:**

- Meaning:
  - `meaning_word_to_definition`: cue is target word, options are four plausible definitions.
  - `meaning_definition_to_word`: cue is target definition, options are four same-POS words.
- Context:
  - cue is the single gapped sentence; options are candidate words.
- Word Families:
  - cue is curated grammatical prompt/sentence; options are forms from `item.wordFamily` only (plus accepted form if not already present).
- Paraphrasing:
  - cue is curated source phrase/idea; options are curated equivalent/distractor candidates already present in the activity data.
- Precision:
  - cue is weak/source wording once; options are curated plausible replacements.
- Spelling:
  - cue is meaning once; options are correct spelling + generated plausible variants.

- [ ] **Step 1: Write RED tests for Context deduplication** asserting the gapped sentence occurs exactly once in rendered/normalized question data.
- [ ] **Step 2: Write RED Word Family tests** asserting every `matchOptions` value belongs to the target lexical family and that targets with insufficient same-family forms fail closed.
- [ ] **Step 3: Write RED Spelling tests** asserting four spelling variants are simultaneously present in `matchOptions` and correct spelling is one of them.
- [ ] **Step 4: Write RED Precision tests** asserting the weak/source wording is represented once and options remain the curated replacement pool.
- [ ] **Step 5: Write RED Paraphrasing tests** asserting fixed Stage 2 uses curated phrase/idea material and no invented fallback pool.
- [ ] **Step 6: Implement minimal builder repairs** for each failing pathway. Remove all cross-unit-family fallback logic from `wordFamilyMatch`; update Word Family availability checks in `session-targets.js` so serviceability matches the new same-family rule.
- [ ] **Step 7: Run targeted tests** (`vocabulary-stage2-match-card-contract`, `vocabulary-word-family-prompt-diversity`, `vocabulary-source-card-deduplication`, `vocabulary-pedagogical-quality`) and confirm GREEN.
- [ ] **Step 8: Run `tests/vocabulary-unit1-live-pathway-completability.test.js`.** If stricter Word Family validity legitimately reduces serviceable coverage, update coverage expectations only to reflect real fail-closed serviceability; never weaken the new pedagogical rule to preserve an inflated count.
- [ ] **Step 9: Commit** pathway-specific pedagogical repairs.

### Task 3: Add Meaning Match direction variation without changing the rung

**Files:**
- Modify: `src/vocabulary/pathway-planner.js`
- Modify: `src/vocabulary/foundational-activity-builder.js`
- Modify: `src/vocabulary/activity-factory.js` only if argument forwarding requires it
- Modify: `src/vocabulary/app.js`
- Modify/add: `tests/vocabulary-pathway-planner.test.js`
- Modify/add: `tests/vocabulary-stage2-match-card-contract.test.js`

**Interface:**
Extend fixed-pathway planning with presentation history independent of activity-type history:

```js
planPathwayQuestion({
  ...,
  recentPresentations: ['meaning_word_to_definition']
})
```

and pass a requested/selected presentation variant into the Meaning Match builder. This presentation history is session-local only and does not affect evidence or persistence.

- [ ] **Step 1: Write RED planner tests** proving two consecutive Meaning/Match builds use opposite presentations when both are valid.
- [ ] **Step 2: Write RED fallback test** proving one presentation may repeat only when the alternative is not buildable.
- [ ] **Step 3: Run targeted planner tests and confirm RED.**
- [ ] **Step 4: Add `recentPresentations` handling** to fixed-pathway planning and pass the chosen Meaning presentation into the builder.
- [ ] **Step 5: Add session-local presentation history** to `app.js`; reset it with the rest of session state and record the presentation after a question is successfully built. Do not persist it to Supabase.
- [ ] **Step 6: Re-run planner/contract tests and confirm GREEN.**
- [ ] **Step 7: Run `tests/vocabulary-pathway-session-progression.test.js`** unchanged to prove the rung/evidence ladder remains authoritative.
- [ ] **Step 8: Commit** presentation-variation work.

### Task 4: Replace fixed Stage 2 dropdowns with Match Cards

**Files:**
- Modify: `src/vocabulary/views.js`
- Modify: `src/vocabulary/foundational-interactions.js`
- Modify: `src/vocabulary/scaffolding.js` only if Match Card option extraction requires it
- Modify: `tests/vocabulary-foundational-rendering.test.js`
- Create: `tests/vocabulary-stage2-match-card-rendering.test.js`

**Renderer behavior:**

For a fixed-pathway Stage 2 Match Card question:

```html
<fieldset class="vocab-match-card-fieldset">
  <legend>Choose the match</legend>
  <div class="vocab-match-card-grid" role="radiogroup">...</div>
  <input type="hidden" name="answer" value="">
  <button type="submit">Check answer</button>
</fieldset>
```

Use `<button type="button">` answer cards with `aria-pressed` (or equally robust radio semantics), one selected at a time. The hidden `name="answer"` preserves the existing form submission pipeline.

- [ ] **Step 1: Change the old rendering test to RED**: fixed Stage 2 matching must contain Match Card buttons and a hidden answer input, and must **not** contain `<select data-match-select>`.
- [ ] **Step 2: Add RED retry test**: `narrow_match` must render exactly two Match Cards and no dropdown.
- [ ] **Step 3: Add RED regression test** proving `drag_match` still renders its drag UI/fallback and is not accidentally converted into Stage 2 cards.
- [ ] **Step 4: Implement `renderMatchCards()`** in `views.js`, selected before the generic response-mode branches whenever `question.pathwayStage === 'match'` and normalized Match Card fields exist.
- [ ] **Step 5: Update interaction delegation** in `foundational-interactions.js`: selecting a card updates the hidden answer, toggles selected/`aria-pressed` state, and leaves native Enter/Space behavior intact through real buttons.
- [ ] **Step 6: Ensure support extraction** in `scaffolding.js` narrows from `matchOptions` for Match Card questions rather than relying on `pairs`; preserve existing `pairs` handling for drag-match/legacy matching.
- [ ] **Step 7: Run rendering/interactions/support tests and confirm GREEN.**
- [ ] **Step 8: Commit** Match Card rendering and interaction.

### Task 5: Style Match Cards for stable desktop/tablet/mobile use

**Files:**
- Create: `vocabulary-match-cards.css`
- Modify: `vocabulary.html`
- Create: `tests/vocabulary-stage2-match-card-responsive-style.test.js`
- Modify if needed: `tests/vocabulary-quiz-ui-refresh.test.js`

**Layout contract:**

- Desktop/laptop: two-column grid where option length allows; cards share stable minimum heights and the question remains within the existing session canvas.
- Tablet: two columns when viable, otherwise one column without horizontal overflow.
- Mobile: one column, natural vertical growth, no forced horizontal scroll.
- Long definitions/phrases use `overflow-wrap:anywhere` / `min-width:0` rather than expanding the page.
- Spelling cards should use a comparison-friendly font treatment without shrinking into tiny text.
- Selected/focus states are visible; no red except true error/risk states.
- Respect `prefers-reduced-motion`.

- [ ] **Step 1: Write RED CSS contract tests** for grid, `minmax(0,1fr)`, card wrapping, mobile breakpoint, selected/focus state, and `overflow-x` safety.
- [ ] **Step 2: Add stylesheet** with focused selectors only; do not broaden global quiz styles.
- [ ] **Step 3: Load the stylesheet in `vocabulary.html`.**
- [ ] **Step 4: Run responsive/style tests and existing quiz-theme tests.**
- [ ] **Step 5: Perform browser checks** at 1280, 1024, 768, 641, 390 and 320px on Meaning, Context, Word Family and Spelling Match examples; verify no horizontal scrolling and no clipped answers.
- [ ] **Step 6: Commit** Match Card styling.

### Task 6: Prove marking, evidence, progression, and non-Match modes are unchanged

**Files:**
- Modify/add tests only unless a real regression is discovered:
  - `tests/vocabulary-marking-parity-matrix.test.js`
  - `tests/vocabulary-pathway-session-progression.test.js`
  - `tests/vocabulary-attempt-commit-integrity.test.js`
  - `tests/vocabulary-response-modes.test.js`
  - `tests/vocabulary-full-regression-matrix.test.js`
  - `tests/vocabulary-pathway-activity-coverage.test.js`
  - `tests/vocabulary-unit1-live-pathway-completability.test.js`

- [ ] **Step 1: Extend candidate-answer extraction** in marking parity tests to include `matchOptions` so every Stage 2 card answer is compared browser/server-side.
- [ ] **Step 2: Add regression assertion** that Match Card UI still submits the raw selected option through the ordinary `name="answer"` form path; no new client-side correctness data is embedded.
- [ ] **Step 3: Run pathway progression tests** and confirm existing two-clean-success Match threshold still advances the word to Apply with no threshold edits.
- [ ] **Step 4: Run attempt integrity tests** and confirm attempt IDs/atomic commit contract unchanged.
- [ ] **Step 5: Run response-mode tests** and ensure choice/text/drag/tiles/spelling/evidence modes behave as before.
- [ ] **Step 6: Run full regression matrix** and Unit 1 pathway completability gate.
- [ ] **Step 7: Run `npm test` and `node scripts/validate-vocabulary-content.mjs`.** Fix only root-cause regressions.
- [ ] **Step 8: Commit** final regression coverage.

### Task 7: Review, PR, merge, and live verification

**Files:**
- No new product scope.

- [ ] **Step 1: Review the complete branch diff** for accidental changes to thresholds, progression, Supabase, canonical content, privacy boundaries, or later-stage drag interactions.
- [ ] **Step 2: Create PR** summarising the systemic root cause: generic Stage 2 `matching` response mode + invalid pathway-specific distractor/cue logic.
- [ ] **Step 3: Require branch Vocabulary Builder CI green** (`npm test`, content validation, Unit 1 export scope).
- [ ] **Step 4: Merge only when green.**
- [ ] **Step 5: Verify post-merge `main`**: System Audit, Vocabulary Builder CI, Runtime Smoke, Pages build/deployment.
- [ ] **Step 6: Verify the live student/staff-preview flow manually** across Meaning, Context, Word Families and Spelling Stage 2: no dropdowns, no duplicated cue, no unrelated Word Family distractors, no horizontal scrolling, and Meaning direction variation visible across the set.
- [ ] **Step 7: Report PR, merge commit, tests/checks, and any intentionally reduced fail-closed content coverage.**

## Expected production file map

Likely modified:
- `src/vocabulary/foundational-activity-builder.js`
- `src/vocabulary/pathway-activity-builder.js`
- `src/vocabulary/activity-builder.js`
- `src/vocabulary/activity-factory.js` (argument forwarding only if required)
- `src/vocabulary/pathway-planner.js`
- `src/vocabulary/session-targets.js`
- `src/vocabulary/app.js`
- `src/vocabulary/views.js`
- `src/vocabulary/foundational-interactions.js`
- `src/vocabulary/scaffolding.js`
- `vocabulary.html`

New focused stylesheet:
- `vocabulary-match-cards.css`

No expected changes:
- Supabase migrations/schema
- pathway progress thresholds
- attempt edge function/RPC
- canonical Unit vocabulary data (unless tests prove a content defect requiring separate explicit approval)
- Evidence Hub

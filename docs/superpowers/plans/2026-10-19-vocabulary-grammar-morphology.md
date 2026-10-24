# Vocabulary Grammar & Morphology Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Vocabulary retrieval questions use grammatically correct surface forms and varied verb tenses/forms, beginning with all Unit 1 verbs, without changing progression or persistence semantics.

**Architecture:** Keep vocabulary identity at lemma level, but store verb morphology inside the existing `senses` JSON and add curated `gap_fill` contexts carrying the exact answer form. The foundational retrieval builder will choose exact contextual answers and generate distractors in the same grammatical form, so `denied` competes with `recommended/demanded/...`, not bare infinitives. Existing IDs, mastery, attempt, pathway and evidence logic remain untouched.

**Tech Stack:** JavaScript ES modules, Node test runner, existing vocabulary content pipeline, Supabase vocabulary tables.

**Spec:** User-approved direction from 2026-10-19 plus Claude Unit 1 audit supplied in chat.

## Global Constraints

- Repo: `tobypottas-sketch/igcse-self-study-hub` only.
- Do not touch Evidence Hub or unrelated apps.
- Do not expose private student data in GitHub.
- Preserve progression thresholds, mastery rules, evidence rules, attempt IDs and persistence semantics.
- Prefer curated linguistic data over blind machine-generated English.
- Unit 1 live retrieval questions must remain compatible with the existing publication tables.

## Review Focus

- Past/third-person/-ing forms must not fall back to the lemma in answer choices.
- Present-perfect/passive-style frames with a past participle must remain grammatical.
- Non-verb vocabulary retrieval must keep working exactly as before.
- Distractors must use the same grammatical form as the target answer.
- Context rotation must not repeat one sentence when multiple curated retrieval contexts are available.

---

### Task 1: Surface-form-safe retrieval builder

**Files:**
- Modify: `src/vocabulary/foundational-activity-builder.js`
- Test: `tests/vocabulary-grammar-morphology.test.js`

**Interfaces:**
- Consumes: existing item `senses`, contexts, same-POS unit items.
- Produces: retrieval questions whose accepted answer is the exact contextual surface form and whose distractors are form-matched.

- [ ] Write failing tests for `deny -> denied`, `recommend -> recommends`, `arrange -> arranged`, and non-verb fallback.
- [ ] Run the focused test and verify failure.
- [ ] Implement morphology lookup from `sense.grammarForms`, contextual answer selection, and same-form distractor resolution.
- [ ] Include `meaning_context` and `gap_fill` as safe retrieval sources when an exact surface form is available.
- [ ] Run focused tests and full `npm test`.

### Task 2: Content-pipeline support for curated retrieval contexts

**Files:**
- Modify: `content/vocabulary/build-unit.js`
- Modify: `content/vocabulary/schema.js`
- Test: `tests/vocabulary-grammar-morphology.test.js`

**Interfaces:**
- Consumes: entry extras `grammarForms`, `grammarPatterns`, `retrievalContexts`.
- Produces: morphology inside sense JSON plus extra `gap_fill` contexts with exact accepted answers.

- [ ] Write failing tests proving extras survive `buildCuratedUnit()` and validate.
- [ ] Run focused test and verify failure.
- [ ] Add optional additive fields only; do not change existing IDs or required contexts.
- [ ] Validate retrieval contexts contain sentence, target surface form and accepted answer.
- [ ] Run focused tests and vocabulary content validation.

### Task 3: Unit 1 verb tense/form bank

**Files:**
- Modify: `content/vocabulary/units/unit-01.js`
- Test: `tests/vocabulary-unit1-grammar-depth.test.js`

**Interfaces:**
- Consumes: Task 2 entry extras.
- Produces: all Unit 1 verbs with curated morphology and multiple natural retrieval contexts spanning base/present, third-person, past/past-participle and -ing where natural.

- [ ] Write failing depth/grammar tests for every Unit 1 verb.
- [ ] Add curated forms and at least four retrieval contexts per verb, with tense/form variety and natural English.
- [ ] Explicitly cover the live failures `denied`, `arranged`, `recommends/recommended`.
- [ ] Run unit tests and `node scripts/validate-vocabulary-content.mjs`.

### Task 4: Publication/export compatibility

**Files:**
- Modify only if required: `scripts/publish-vocabulary-content.mjs`, `scripts/export-vocabulary-sql.mjs`
- Test: existing publish/export tests plus new morphology test.

**Interfaces:**
- Consumes: sense JSON and gap-fill contexts from Tasks 2–3.
- Produces: deployable rows using existing Supabase columns.

- [ ] Verify morphology remains inside `senses` JSON and retrieval contexts map to existing context columns.
- [ ] Verify no schema migration is required.
- [ ] Run export scope guard and full CI.

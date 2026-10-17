# Cambridge iGCSE ESL 0511 Vocabulary Activity Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Vocabulary & Paraphrase Builder activity layer around Cambridge iGCSE ESL 0511 meaning, context, question↔text, phrase paraphrasing, idea paraphrasing, writing vocabulary, and adaptive production skills, using Unit 1 as the gold-standard pilot.

**Architecture:** Preserve the existing authenticated Hub, Supabase content/mastery tables, privacy boundary, staff preview, local-first feedback, serialized persistence, and New → Building → Secure → Mastered model. Add a canonical 18-activity catalogue, a curated unit-level activity bank, deterministic activity assembly/marking, graded support/evidence strength, stricter mastery evidence, a progressive adaptive planner, and derived 0511 skill profiles. Unit-level phrase/idea/reading/writing content is stored separately from per-target contexts so whole-idea work is not forced into a single-word schema.

**Tech Stack:** Vanilla ES modules, HTML/CSS, Supabase JS 2.117.3, PostgreSQL/RLS, Supabase Edge Functions, Node built-in test runner (`node --test`), existing GitHub Pages deployment.

**Spec:** `docs/superpowers/specs/2026-10-17-0511-vocabulary-activity-redesign-design.md`

## Global Constraints

- Repository scope is `tobypottas-sketch/igcse-self-study-hub` only.
- Supabase project is `iGCSE Self-Study` (`grjshlamooglytsajoun`).
- Never persist raw student answers, typed paraphrases, prompts authored by teachers, or other private learning content in GitHub or durable analytics fields.
- Raw answer text may exist transiently in the browser/request for deterministic marking, but must never be written to `activity_events`, mastery tables, logs, or Evidence Hub summaries.
- Staff preview must remain non-persistent and must never contaminate student mastery, class analytics, activity events, interventions, or Evidence Hub summaries.
- Runtime content is curated/deterministic. No live AI may invent synonyms, accepted answers, distractors, whole-sentence paraphrases, passages, or mastery-critical correctness.
- Unit 1 remains the only gold-standard implementation target until it passes content QA and student-flow QA; do not bulk-scale the new schema to other units in this plan.
- Student choice controls the practice area, not the definition of mastery.
- Multiple-choice recognition alone must never create `Mastered`.
- A supported retry is a teaching event; repeated guessing must not be treated as independent mastery evidence.
- Timed practice remains exactly 5/10/15/20 minutes and uses the same evidence rules as untimed practice.
- Keep the mature teen visual style. No cartoon mascots, lives, public leaderboards, noisy XP economy, or childish generic games.
- Use TDD for every implementation task: establish RED, implement the smallest correct change, establish GREEN, then commit.
- Before merge, run the full suite, strict vocabulary validator, privacy checks, staff-preview regressions, and production deployment gates.

## Review Focus

- `avoid`-style exact-target guessing cannot be offered to a New learner as if blind retrieval were the best first activity.
- Phrase and idea paraphrasing must test preservation of meaning, not synonym replacement alone.
- Meaning invariants such as `some` vs `all`, degree, time, certainty, cause/effect, and viewpoint must be represented explicitly in curated content and feedback.
- Unit-level reading/idea tasks may contribute broad 0511 skill evidence, but must not falsely credit every vocabulary word appearing in a passage. Target mastery is updated only when a curated record declares a primary evidence target.
- Server marking remains authoritative for persisted student evidence even when the browser renders immediate local feedback.
- Context-specific accepted answers remain context-specific.
- `Mastered` requires Context + Paraphrasing + independent productive evidence, including diversity across context or activity type and at least one unscaffolded production.
- Existing review cadence and demotion behavior must remain deterministic.
- New analytics metadata must remain categorical/ID-based and privacy-safe.

---

### Task 1: Establish the canonical 0511 activity catalogue and practice-mode contract

**Files:**
- Create: `src/vocabulary/activity-catalogue.js`
- Create: `tests/vocabulary-activity-catalogue.test.js`
- Modify: `src/tracking/core.js`
- Modify: `tests/vocabulary-tracking.test.js`

**Interfaces:**
- Export `ACTIVITY_TYPES`, `PRACTICE_MODES`, `activityDefinition(id)`, `activitiesForMode(modeId)`, and `activitiesForStage(stage)`.
- Each activity definition declares: `id`, `label`, `practiceModes`, `responseMode`, `minimumStage`, `strands`, `evidenceStrength`, `productive`, and `skillFamily`.
- Response modes are exactly `choice`, `tiles`, `evidence`, `text`.
- Practice modes are exactly `learn`, `context`, `question_text`, `phrase_paraphrase`, `idea_paraphrase`, `writing`, `adaptive`.

- [ ] Write failing catalogue tests covering all 18 approved exercise IDs, seven practice modes, four response modes, stage eligibility, strands, evidence strength, and productive flags.
- [ ] Extend tracking tests so all 18 activity IDs and privacy-safe metadata fields (`skill_family`, `evidence_strength`, `support_level`, `practice_focus`) survive sanitization while answer text is stripped.
- [ ] Run: `node --test tests/vocabulary-activity-catalogue.test.js tests/vocabulary-tracking.test.js`
- [ ] Confirm RED because the catalogue/new tracking metadata do not yet exist.
- [ ] Implement the catalogue as the single source of truth; remove hard-coded duplicate activity sets from later modules as they migrate.
- [ ] Re-run the focused tests and establish GREEN.
- [ ] Commit: `git commit -m "feat: define 0511 vocabulary activity catalogue"`

### Task 2: Extend curated content schema for phrase, idea, reading, and writing activity banks

**Files:**
- Modify: `content/vocabulary/schema.js`
- Modify: `content/vocabulary/build-unit.js`
- Modify: `content/vocabulary/promote-unit.js`
- Modify: `scripts/validate-vocabulary-content.mjs`
- Modify: `scripts/publish-vocabulary-content.mjs`
- Modify: `scripts/export-vocabulary-sql.mjs`
- Create: `supabase/migrations/<generated>_vocabulary_unit_activities.sql`
- Modify/Create tests: `tests/vocabulary-content.test.js`, `tests/vocabulary-approved-content.test.js`, `tests/vocabulary-authoring.test.js`, `tests/vocabulary-content-publish.test.js`, `tests/vocabulary-schema-contract.test.mjs`

**Interfaces:**
- Unit objects gain `activities: []` containing records with `activityContentId`, `unitNumber`, `contentType`, `activityData`, and `status`.
- `contentType` is one of `phrase_set`, `idea_set`, `question_text`, `writing_set`.
- `activityData` is validated by content type and may include `linkedVocabularyIds` plus at most one `primaryEvidenceTargetId`.
- New table: `public.vocabulary_unit_activities(activity_content_id, unit_number, content_type, activity_data jsonb, status, created_at, updated_at)`.

- [ ] Write failing validator tests for required phrase fields, idea meaning invariants/distractors, question↔text evidence spans/questions, writing-task accepted material, valid linked vocabulary IDs, and deterministic accepted answers.
- [ ] Write failing publisher/export tests proving the fourth content table is included and no mastery/student table is touched.
- [ ] Write failing schema/RLS tests proving the new table has RLS and only live content is student-readable; teacher/admin content preview remains allowed consistently with existing content tables.
- [ ] Run: `node --test tests/vocabulary-content.test.js tests/vocabulary-approved-content.test.js tests/vocabulary-authoring.test.js tests/vocabulary-content-publish.test.js tests/vocabulary-schema-contract.test.mjs`
- [ ] Confirm RED.
- [ ] Create the migration and implement schema/build/promote/publish/export support.
- [ ] Preserve compatibility with existing units that have no `activities` while authoring; require the richer bank only when Unit 1 is promoted as a gold-standard 0511 unit.
- [ ] Re-run focused tests and `node scripts/validate-vocabulary-content.mjs`; establish GREEN for structural validation.
- [ ] Commit: `git commit -m "feat: add curated 0511 unit activity content"`

### Task 3: Author and QA the Unit 1 gold-standard content bank

**Files:**
- Modify: `content/vocabulary/units/unit-01.js`
- Modify: `content/vocabulary/releases/unit-01.js` only after QA passes
- Create: `tests/vocabulary-unit-01-0511-content.test.js`
- Create: `docs/vocabulary/unit-01-linguistic-qa.md`

**Content target:**
- 50 existing vocabulary targets retained in the approved source order.
- Each target: 3–5 distinct contexts where appropriate, safe paraphrases, plausible distractors, collocations/word families when linguistically useful, and 1–3 phrase transformations where useful.
- At least 12 strong unit-level phrase sets.
- 12 idea-paraphrase sets.
- About 10 Question↔Text mini-reading sets, each with 2–3 questions and exact curated evidence spans.
- 8–10 writing-vocabulary sets.

- [ ] Write failing Unit 1 completeness/quality-contract tests for counts, distinct IDs, required accepted material, non-identical paraphrase pairs, distractor separation, and meaning-invariant metadata.
- [ ] Run: `node --test tests/vocabulary-unit-01-0511-content.test.js tests/vocabulary-authoring.test.js`
- [ ] Confirm RED on missing richer content.
- [ ] Audit the existing 50 records rather than replacing good material wholesale; enrich weak/artificial contexts and add the new phrase/idea/reading/writing banks.
- [ ] Perform linguistic QA record-by-record for natural English, B2 appropriacy, accurate meaning preservation, plausible/fair distractors, quantity/degree/time/cause preservation, and natural collocation.
- [ ] Record QA decisions/checklist in `docs/vocabulary/unit-01-linguistic-qa.md`; this document contains curated content notes only, never student data.
- [ ] Run focused tests plus `node scripts/validate-vocabulary-content.mjs`.
- [ ] Do not promote/publish Unit 1 until both structural tests and linguistic QA are complete.
- [ ] Commit: `git commit -m "content: build Unit 1 0511 activity bank"`

### Task 4: Build the deterministic 18-operation activity assembler

**Files:**
- Create: `src/vocabulary/activity-builder.js`
- Modify: `src/vocabulary/questions.js` as a compatibility adapter or remove its legacy logic once callers migrate
- Create: `tests/vocabulary-activity-builder.test.js`
- Update: `tests/vocabulary-questions.test.js`
- Update: `tests/vocabulary-response-modes.test.js`

**Interfaces:**
- Export `buildActivity({ activityType, occurrence, item, contexts, unitActivities, mastery, usedContentIds, seed })`.
- Returned activity includes `activityId`, `type`, `responseMode`, `skillFamily`, `strands`, `evidenceStrength`, source IDs, prompt/presentation data, and deterministic marking reference; it does not contain an unapproved invented answer.
- Tiles use curated chunks; evidence-selection uses curated source spans; choice distractors come only from curated records; text activities use curated accepted-answer sets.

- [ ] Write failing tests that construct all 18 approved operations from representative Unit 1 fixtures.
- [ ] Add tests proving New learners are not given blind exact-word retrieval when supported alternatives exist.
- [ ] Add tests proving phrase/idea activities compare whole meaning and do not collapse to target-word synonym lookup.
- [ ] Add tests for deterministic option/tile order from a stable seed and for avoiding recently used content where alternatives exist.
- [ ] Run: `node --test tests/vocabulary-activity-builder.test.js tests/vocabulary-questions.test.js tests/vocabulary-response-modes.test.js`
- [ ] Confirm RED.
- [ ] Implement the smallest deterministic builder that satisfies the catalogue/content contract.
- [ ] Re-run focused tests; establish GREEN.
- [ ] Commit: `git commit -m "feat: build 18 deterministic 0511 activities"`

### Task 5: Add semantic marking, support ladder, and misconception classification

**Files:**
- Modify: `supabase/functions/_shared/vocabulary-engine.js`
- Create: `src/vocabulary/scaffolding.js`
- Modify: `supabase/functions/vocabulary-attempt-action/validation.js`
- Create/Update tests: `tests/vocabulary-context-marking.test.js`, `tests/vocabulary-mastery.test.js`, `tests/vocabulary-attempt-validation.test.js`, `tests/vocabulary-scaffolding.test.js`

**Interfaces:**
- Evidence accepts `strands[]`, `evidenceStrength`, `supportLevel: none|light|major`, `productive`, `activityType`, and `contextId/activityContentId`.
- Misconceptions include at least: `quantity_change`, `degree_change`, `time_change`, `cause_effect_change`, `contrast_change`, `added_information`, `omitted_information`, `wrong_form`, `unnatural_collocation`, `too_vague`, `register_mismatch`, `meaning_confusion`, `retrieval_failure`, `context_mismatch`.
- `buildSupportStep(activity, attemptResult)` returns one curated support step, never an invented explanation/answer.

- [ ] Write failing tests for full/partial/weak/no positive evidence: first-attempt correct, light-supported recovery, major-supported recovery, repeated guessing.
- [ ] Write failing semantic misconception tests using curated idea invariants and known distractor categories.
- [ ] Write failing support tests proving first miss → targeted hint/support; second unsuccessful attempt → move-on/recycle signal rather than unlimited guessing.
- [ ] Run focused tests and confirm RED.
- [ ] Extend the shared engine and validation contract while preserving deterministic review scheduling and context-scoped answer acceptance.
- [ ] Implement scaffolding only from curated hint/chunk/evidence material.
- [ ] Re-run focused tests; establish GREEN.
- [ ] Commit: `git commit -m "feat: add 0511 semantic feedback and scaffolding"`

### Task 6: Strengthen mastery persistence for activity diversity and independent production

**Files:**
- Create: `supabase/migrations/<generated>_vocabulary_mastery_evidence_strength.sql`
- Modify: `supabase/migrations/20261017055000_atomic_vocabulary_mastery.sql` only if repository migration policy permits editing historical migrations; otherwise create an additive replacement function migration
- Modify: `supabase/functions/_shared/vocabulary-engine.js`
- Modify: `supabase/functions/vocabulary-attempt-action/index.ts`
- Modify: `supabase/functions/vocabulary-attempt-action/validation.js`
- Modify: `src/vocabulary/data.js`
- Update tests: `tests/vocabulary-mastery.test.js`, `tests/vocabulary-review.test.js`, `tests/vocabulary-hardening.test.mjs`, `tests/vocabulary-attempt-validation.test.js`, `tests/vocabulary-data.test.js`

**Interfaces:**
- Global mastery adds `production_activity_types jsonb` and `unscaffolded_productions integer` (or equivalent normalized fields) so diversity/independence requirements are durable.
- Unit contextual evidence mirrors the fields inside existing JSONB rather than creating redundant columns unless required.
- Attempt payload may identify `contentSource: context|unit_activity`, `activityContentId`, `supportLevel`, and a curated `primaryEvidenceTargetId` relationship validated on the server.

- [ ] Write failing mastery tests for: Secure requires ≥3 strands including Context/Paraphrasing; Mastered requires Secure + Context + Paraphrasing + two productive demonstrations across distinct contexts or activity types + ≥1 unscaffolded production + no contradictory recent error.
- [ ] Write failing server tests/contracts proving unit-level activities only update a target when the curated record explicitly names a primary evidence target.
- [ ] Write failing hardening tests proving no raw answer field is added to persistence/RPC/activity metadata.
- [ ] Confirm RED.
- [ ] Add the migration, update the atomic RPC, server attempt flow, and browser payload.
- [ ] Keep staff preview returning marked results before any persistence write.
- [ ] Re-run focused tests; establish GREEN.
- [ ] Commit: `git commit -m "feat: strengthen vocabulary mastery evidence"`

### Task 7: Replace random question choice with a progressive adaptive planner

**Files:**
- Create: `src/vocabulary/adaptive-planner.js`
- Modify: `src/vocabulary/selector.js`
- Modify: `src/vocabulary/session.js`
- Create/Update tests: `tests/vocabulary-adaptive-planner.test.js`, `tests/vocabulary-selector.test.js`, `tests/vocabulary-session.test.js`, `tests/vocabulary-adaptive-progression.test.js`

**Interfaces:**
- Export `planNextActivity({ practiceMode, target, mastery, recentActivities, supportState, reviewDue, availableContent })`.
- Adaptive readiness sequence follows the approved shape: supported recognition → applied meaning/context → phrase/question↔text transfer → build/precision → supported production → idea transformation → independent production.
- Focused practice constrains the skill family but still adapts support/difficulty within that family.

- [ ] Write failing progression tests showing success raises semantic/production demand and struggle temporarily moves to a more scaffolded operation.
- [ ] Add recovery tests proving a failed concept returns later through a different activity type and different context/content ID when available.
- [ ] Add focused-mode tests for all seven modes and timed-session continuity.
- [ ] Run focused tests; confirm RED.
- [ ] Implement planner and integrate with selector/session without changing target-priority principles unnecessarily.
- [ ] Re-run focused tests; establish GREEN.
- [ ] Commit: `git commit -m "feat: add progressive 0511 adaptive planner"`

### Task 8: Rebuild the student session UI around the seven modes and four interactions

**Files:**
- Modify: `src/vocabulary/app.js`
- Modify: `src/vocabulary/views.js`
- Modify: `vocabulary.css`
- Update/Create tests: `tests/vocabulary-view.test.js`, `tests/vocabulary-session-ux.test.js`, `tests/vocabulary-staff-preview.test.js`, `tests/vocabulary-preview-deployment.test.js`

**Interfaces / UI:**
- Unit picker exposes: Learn the Vocabulary, Understand in Context, Question ↔ Text, Phrase Paraphrasing, Idea Paraphrasing, Writing Vocabulary, Adaptive 0511 Mix.
- Question renderer supports choice buttons, reorder/selectable tiles, source-text evidence selection, and short text input.
- Session header shows quiet progress/time plus the current skill label.
- Feedback is immediate/local and semantic; persistence remains serialized in the background for students.
- End summary emphasizes activity/skill movement and suggests a next best practice area.

- [ ] Write failing rendering/interaction tests for all seven mode labels and all four response modes.
- [ ] Add regression tests preventing unlimited same-prompt guessing and ensuring supported retry controls replace the original task appropriately.
- [ ] Add staff-preview tests proving all new interaction types work while no persistence/tracking occurs.
- [ ] Run focused tests; confirm RED.
- [ ] Integrate builder/planner/scaffolding into `app.js`; retain local/server mark comparison and sync-warning behavior.
- [ ] Extend mature responsive CSS for 7-mode cards, tiles, source/evidence selection, support states, and reduced-motion behavior.
- [ ] Re-run focused tests; establish GREEN.
- [ ] Commit: `git commit -m "feat: rebuild 0511 vocabulary student sessions"`

### Task 9: Derive 0511 skill profiles and teacher-facing misconception insights

**Files:**
- Create: `src/vocabulary/skill-profile.js`
- Modify: `src/vocabulary/analytics.js`
- Modify: `src/vocabulary/teacher-data.js`
- Modify: `src/vocabulary/teacher-views.js`
- Modify: `src/evidence/vocabulary-summary.js`
- Modify: `src/tracking/core.js` if final sanitizer fields require adjustment
- Update/Create tests: `tests/vocabulary-skill-profile.test.js`, `tests/vocabulary-analytics.test.js`, `tests/vocabulary-teacher-data.test.js`, `tests/vocabulary-teacher-view.test.js`, `tests/vocabulary-evidence-summary.test.js`

**Architecture:**
- Do not add a persisted broad-skill mastery table in this phase.
- Derive broad 0511 skill profiles from privacy-safe `activity_events` metadata plus target mastery.
- Skill families should include at minimum: meaning/context, question↔text, phrase paraphrasing, idea paraphrasing, writing vocabulary, lexical production.

- [ ] Write failing aggregation tests for broad skill status from activity type/evidence strength/support level rather than raw percentage walls.
- [ ] Add teacher tests for meaningful patterns such as quantity-change errors, degree changes, wrong form, unnatural collocation, and weak idea paraphrasing.
- [ ] Add Evidence Hub summary tests proving raw answers/prompts remain absent while interpreted 0511 strengths/development areas are present when evidence exists.
- [ ] Run focused tests; confirm RED.
- [ ] Implement skill-profile derivation and teacher/EH interpretation.
- [ ] Preserve `what → why → who → next action` presentation and student privacy.
- [ ] Re-run focused tests; establish GREEN.
- [ ] Commit: `git commit -m "feat: add 0511 vocabulary skill insights"`

### Task 10: Publish Unit 1 safely and run full end-to-end verification

**Files:**
- Modify as needed: `content/vocabulary/releases/unit-01.js`
- Temporarily modify then restore: `.github/workflows/vocabulary-builder-ci.yml` if branch CI otherwise will not run
- Add final regression test(s) only for any defect found during end-to-end verification

- [ ] Verify Unit 1 linguistic QA checklist has no unresolved blockers.
- [ ] Run the full suite: `npm test`.
- [ ] Run strict content validation: `node scripts/validate-vocabulary-content.mjs`.
- [ ] Run export/publish dry-run or equivalent test path and inspect that only curated content tables are affected.
- [ ] Verify privacy contract by searching persisted metadata/RPC/schema for forbidden raw-answer fields.
- [ ] Verify Staff Preview for all seven practice modes and four interaction primitives; confirm no student mastery/activity writes.
- [ ] Verify student attempt serialization so rapid answers cannot race mastery updates.
- [ ] Verify timed expiry during question, feedback, and supported retry.
- [ ] Verify GitHub Pages `_shared` module publishing regression still passes.
- [ ] Publish the additive Supabase migration(s), Unit 1 curated content, and any required Edge Function version only after all tests are green.
- [ ] Open PR from the implementation branch, review exact changed-file scope, and merge only after required checks pass.
- [ ] On the exact merge commit, require successful System Audit, Runtime Smoke, and GitHub Pages deployment before claiming the redesign is live.
- [ ] Hard-refresh Staff Preview and manually pilot Unit 1 in each mode; record any pedagogical defects as new follow-up issues rather than silently weakening the acceptance criteria.
- [ ] Commit any final verified regression-only fixes separately.

## Completion Criteria

The redesign is complete for Unit 1 only when:

- all 18 operations have deterministic curated inputs and appropriate interaction modes;
- all seven practice modes work untimed and timed;
- New learners receive supported meaning/context work rather than blind exact-target guessing;
- Phrase Paraphrasing and Idea Paraphrasing genuinely preserve whole meaning;
- Question ↔ Text uses curated mini-readings and evidence spans;
- wrong answers receive semantic support and cannot be brute-forced into mastery;
- adaptive progression demonstrably changes support/difficulty based on evidence;
- Mastered cannot be reached through recognition-only work;
- broad 0511 skill patterns are visible without exposing raw student answers;
- Staff Preview remains fully non-persistent;
- Unit 1 passes structural validation plus documented linguistic QA;
- full tests and exact-merge production deployment gates pass.

Only after this Unit 1 acceptance gate should the richer authoring template be rolled out to Units 2, 4, 7, 8, 9, 11, 12, 13, 18, 19 and 20.
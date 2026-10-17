# Vocabulary & Paraphrase Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the fifth iGCSE Self-Study Hub learning area: a curated, adaptive Cambridge 0511 Vocabulary & Paraphrase Builder with timed/untimed mastery sessions, teacher analytics, interventions, and extensible Evidence Hub-facing evidence summaries.

**Architecture:** Keep the feature native to `igcse-self-study-hub` and reuse the existing authenticated Supabase session, `apps` registry, `activity_events`, class/teacher RLS model, vanilla ES modules, and Node test runner. Separate curated vocabulary content, deterministic session/mastery logic, student UI, teacher analytics, and the shared evidence/intervention contract so future Hub learning areas can plug into the same architecture without redesigning Evidence Hub.

**Tech Stack:** Vanilla ES modules, HTML/CSS, Supabase JS `2.117.3`, PostgreSQL/RLS, Supabase Edge Functions where privileged teacher mutations are needed, Node built-in test runner (`node --test`), existing Hub styles.

**Spec:** `docs/superpowers/specs/2026-10-17-vocabulary-paraphrase-builder-design.md`

## Global Constraints

- Repository: `tobypottas-sketch/igcse-self-study-hub` only.
- Supabase project: `iGCSE Self-Study` (`grjshlamooglytsajoun`).
- Do not touch Evidence Hub Personal App or unrelated repositories.
- Treat Reading, Listening, Paraphrasing, Essay Writing, Vocabulary & Paraphrase Builder, and future additions as one extensible evidence ecosystem.
- Never remotely persist student free-text answers, essays, notes, teacher notes, teacher prompts, or other prohibited learning content.
- Curated non-student vocabulary content may live in repository content files and/or controlled content tables.
- Student mastery and activity evidence belongs in Supabase behind RLS.
- Students choose the unit; the engine chooses priority words within that unit.
- All 20 units remain available; no progression locking.
- Each live unit must contain exactly 50 distinct targets organised as five sets of ten.
- Core sessions are mixed; production is required for `Mastered`.
- `Mastered` requires at least two successful productive demonstrations in different contexts/prompts where practical.
- Timed practice supports exactly 5, 10, 15, and 20 minute choices and uses the same evidence/mastery logic as untimed practice.
- Core marking is curated/deterministic. Do not use live AI to invent accepted answers or decide mastery-critical correctness.
- Student UI uses `New`, `Building`, `Secure`, `Mastered`; do not expose intimidating whole-course totals or raw strand percentages by default.
- Teacher analytics follow `what needs attention -> why -> who -> what should I do next?`.
- Use TDD; run focused tests after each task and full `npm test` before completion.
- For Supabase schema work, create migration files with `supabase migration new <name>` rather than inventing timestamps manually; then edit the generated path.
- Enable RLS on every new exposed table; verify ownership/teacher-class policies and run Supabase advisors before release.

## Review Focus

- A production answer that is semantically valid only in one context must not be accepted globally in a different context.
- A student can miss a mastered review once without losing `Mastered`; repeated failures must eventually return the item to `Secure` according to deterministic rules.
- A repeated word across units must share global mastery without automatically granting unit-specific contextual mastery.
- No tracking/mastery write may include the student's typed free-text answer; only categorical/numeric outcome evidence and curated IDs may persist.
- Timed-session expiry during feedback/retry must stop cleanly without losing already-earned evidence or recording an unfinished prompt as a failure.

---

### Task 1: Shared evidence contract, tracking extension, and database foundation

**Files:**
- Create: `src/evidence/contracts.js`
- Create: `tests/evidence-contracts.test.js`
- Modify: `src/tracking/core.js`
- Modify: `tests/tracking-core.test.js`
- Create via CLI: `supabase/migrations/<generated>_vocabulary_builder_foundation.sql`
- Test: `tests/vocabulary-schema-contract.test.mjs`

**Interfaces:**
- Produces `LEARNING_AREAS`, `EVIDENCE_STATUSES`, `TRENDS`, `SIGNAL_STRENGTHS`, `INTERVENTION_STATUSES`, `buildEvidenceSummary(input)`, `buildInterventionOutcome(input)`.
- Extends tracking `APP_KEYS` with `vocabulary_paraphrase` and vocabulary question types while preserving the existing sanitizer boundary.
- Creates content/mastery/intervention tables used by later tasks.

- [ ] **Step 1: Write failing evidence-contract tests**
  - Assert `buildEvidenceSummary()` requires `learningArea`, `studentId`, `status`, `evidenceWindowStart`, `evidenceWindowEnd`, and provenance identifiers.
  - Assert vocabulary can declare strands `meaning`, `recognition`, `context`, `paraphrasing`, `production` without hard-coding those strands into all future learning areas.
  - Assert invalid trend/status/signal values are rejected.

- [ ] **Step 2: Extend tracking tests before implementation**
  - Assert `buildTrackingEvent({ app_key:'vocabulary_paraphrase', ... })` is accepted.
  - Assert vocabulary metadata may retain only whitelisted categorical/numeric fields such as `unit_number`, `strand`, `question_type`, `attempt_number`, `outcome`, `retry_used`, `recovery`, `misconception`, `target_id`.
  - Assert `answer_text`, `prompt`, `typed_answer`, and arbitrary metadata are stripped.

- [ ] **Step 3: Run focused tests**
  - Run: `node --test tests/evidence-contracts.test.js tests/tracking-core.test.js`
  - Expected: FAIL because the shared contract and vocabulary tracking values do not yet exist.

- [ ] **Step 4: Implement shared contracts and tracking sanitizer**
  - Add only generic cross-app concepts to `src/evidence/contracts.js`; keep app-specific mastery calculations out of this file.
  - Update `src/tracking/core.js` so existing four apps remain byte-for-byte compatible in accepted behavior while vocabulary adds only approved categorical metadata.

- [ ] **Step 5: Create the database migration using the Supabase CLI**
  - Run: `supabase migration new vocabulary_builder_foundation`
  - In the generated migration create: `vocabulary_items`, `vocabulary_unit_occurrences`, `vocabulary_contexts`, `vocabulary_global_mastery`, `vocabulary_unit_mastery`, `learning_interventions`, `learning_intervention_targets`.
  - Store curated text/content in content tables; mastery tables store only IDs, statuses, confidence/evidence counters, dates, and categorical error patterns.
  - Add `vocabulary_paraphrase` to `public.apps` with launch URL pointing to `vocabulary.html` and enabled state appropriate for staged rollout.
  - RLS: students read live content and only their own mastery/interventions; teachers read mastery/interventions for students they can access via existing `private.teacher_can_access_student`; admins read all; students may update only their own mastery through authenticated policies or narrowly-scoped RPCs.

- [ ] **Step 6: Add schema-contract tests**
  - Assert migration contains RLS enablement for every new public table.
  - Assert no mastery/intervention table has columns intended for free-text student answers.
  - Assert teacher policies depend on existing teacher/student authorization helpers rather than `TO authenticated` alone.

- [ ] **Step 7: Run focused tests and Supabase checks**
  - Run: `node --test tests/evidence-contracts.test.js tests/tracking-core.test.js tests/vocabulary-schema-contract.test.mjs`
  - Run relevant Supabase local schema/advisor checks per installed CLI version.
  - Expected: PASS; no critical security advisor findings.

- [ ] **Step 8: Commit**
  - Commit message: `feat: add vocabulary evidence and data foundation`

### Task 2: Curated content schema, validator, and ingestion pipeline

**Files:**
- Create: `content/vocabulary/schema.js`
- Create: `content/vocabulary/units/unit-01.json`
- Create: `scripts/validate-vocabulary-content.mjs`
- Create: `tests/vocabulary-content.test.js`
- Create: `tests/vocabulary-content-fixtures.js`

**Interfaces:**
- Produces `validateVocabularyItem(item)`, `validateUnit(unit)`, and canonical JSON shapes for global items, unit occurrences, senses, contexts, paraphrase banks, distractors, and accepted production answers.
- Unit files are curated source-of-truth artifacts; live ingestion occurs only after `status: 'live'` and full unit validation.

- [ ] **Step 1: Write failing content validation tests**
  - Assert a live unit requires exactly 50 distinct occurrence IDs and exactly five sets of ten.
  - Assert every target has a student-friendly meaning, part of speech, at least three approved contexts, and at least one deterministic accepted-answer path for production-capable prompts.
  - Assert multi-word expressions remain one target.
  - Assert duplicate occurrences within a unit fail validation while repeated global vocabulary IDs across different units are allowed.
  - Assert context-dependent paraphrases are scoped to the relevant sense/context rather than merged into global accepted answers.

- [ ] **Step 2: Run focused tests**
  - Run: `node --test tests/vocabulary-content.test.js`
  - Expected: FAIL because schema/validator do not yet exist.

- [ ] **Step 3: Implement the canonical content schema and validator**
  - Global item fields: `vocabularyId`, `term`, `partOfSpeech`, `coreMeaning`, `senses`, `wordFamily`, `collocations`, `status`.
  - Sense fields: `senseId`, `meaning`, `acceptedParaphrases`, `contextDependentParaphrases`, `misleadingDistractors`, optional `teacherNote`.
  - Context fields: `contextId`, `type`, `text`, optional curated `targetRewrite`, `acceptedAnswers`, `misconceptionCategory`.
  - Unit occurrence fields: `occurrenceId`, `vocabularyId`, `unitNumber`, `unitTitle`, `setNumber`, `positionInUnit`, `senseId`, `contextIds`, `status`.

- [ ] **Step 4: Seed Unit 1 as a pipeline fixture, not as an assumption that all source content is complete**
  - Convert the supplied Unit 1 list into canonical records and enrich enough representative targets to exercise every activity family.
  - Keep the unit `draft` until all 50 items meet the approved content standard.
  - Do not manufacture missing Unit 3/5/10 entries; the validation report should explicitly block those units until corrected source targets are approved.

- [ ] **Step 5: Add CLI validation output**
  - `node scripts/validate-vocabulary-content.mjs` returns non-zero for duplicate, short, ambiguous, or incomplete live units and prints actionable unit/item errors.

- [ ] **Step 6: Run tests and validator**
  - Expected: PASS for fixtures; incomplete supplied units reported as blocked rather than silently repaired.

- [ ] **Step 7: Commit**
  - Commit message: `feat: add curated vocabulary content pipeline`

### Task 3: Mastery engine and review scheduling

**Files:**
- Create: `src/vocabulary/mastery.js`
- Create: `src/vocabulary/review.js`
- Create: `tests/vocabulary-mastery.test.js`
- Create: `tests/vocabulary-review.test.js`

**Interfaces:**
- Produces `applyEvidence(mastery, evidence, now) -> mastery`, `deriveStatus(mastery) -> 'new'|'building'|'secure'|'mastered'`, `isReviewDue(mastery, now)`, `nextReviewAt(mastery, now)`.
- Evidence input uses `{ strand, correct, firstAttempt, retryUsed, recoveredLater, contextId, questionType }` and never includes the typed response.

- [ ] **Step 1: Write failing asymmetric-evidence tests**
  - Production success strengthens production plus lower evidence strands; recognition success cannot strengthen production.
  - `Secure` requires multi-strand evidence including Context or Paraphrasing.
  - `Mastered` requires `Secure` plus two successful productions in different contexts/prompts.
  - Supported retry earns less confidence than first-attempt success but remains positive evidence.
  - Error followed by later recovery records positive recovery evidence without erasing the original error signal.

- [ ] **Step 2: Write failing review tests**
  - First mastered review due in the 3–5 day band; subsequent successful reviews extend to 1–2 weeks then 3–4 weeks.
  - One failed review preserves visible `Mastered` and schedules earlier review.
  - Repeated review failure deterministically returns status to `Secure`.

- [ ] **Step 3: Run focused tests**
  - Run: `node --test tests/vocabulary-mastery.test.js tests/vocabulary-review.test.js`
  - Expected: FAIL on missing engine.

- [ ] **Step 4: Implement deterministic mastery/review logic**
  - Keep constants centralized and named; do not scatter magic thresholds through UI/data code.
  - Return immutable/plain-object state so logic remains testable without Supabase or DOM.

- [ ] **Step 5: Re-run focused tests**
  - Expected: PASS.

- [ ] **Step 6: Commit**
  - Commit message: `feat: add vocabulary mastery engine`

### Task 4: Adaptive target selection, question assembly, deterministic marking, and session state

**Files:**
- Create: `src/vocabulary/selector.js`
- Create: `src/vocabulary/questions.js`
- Create: `src/vocabulary/marking.js`
- Create: `src/vocabulary/session.js`
- Create: `tests/vocabulary-selector.test.js`
- Create: `tests/vocabulary-questions.test.js`
- Create: `tests/vocabulary-marking.test.js`
- Create: `tests/vocabulary-session.test.js`

**Interfaces:**
- Produces `selectPriorityTargets({ occurrences, masteryByVocabularyId, unitMastery, now, limit })`.
- Produces `buildQuestion({ occurrence, item, mastery, usedContextIds, previousQuestionType })`.
- Produces `markAnswer({ question, rawAnswer }) -> { correct, normalizedAnswer, misconceptionCategory }`; `normalizedAnswer` is transient and must not be returned to persistence adapters.
- Produces `createSession({ unitNumber, mode:'adaptive'|'timed', durationMinutes?, now })` and session transition helpers.

- [ ] **Step 1: Write failing selection tests**
  - Priority order favors recently wrong, missing production, weak paraphrase/context, new, review-due, then recently secure/mastered.
  - Repeated globally mastered vocabulary still receives unit-context checks when the unit occurrence is not secure.
  - Default adaptive selection returns ten target words where available.

- [ ] **Step 2: Write failing question/marking tests**
  - Support the ten approved activity families.
  - Do not reuse the same context for a target twice in one session when alternatives exist.
  - Recycled mistakes use a different context and preferably different question type.
  - Only curated accepted answers/variants pass production marking; punctuation/case normalization is allowed only where explicitly safe.
  - A context-dependent synonym accepted in Context A is rejected in Context B.

- [ ] **Step 3: Write failing session/timer tests**
  - Adaptive session ends after its selected target work is complete.
  - Timed mode accepts only 5/10/15/20 minutes and continues selecting priority work until expiry.
  - Timer expiry during feedback/retry preserves completed evidence and does not mark the unfinished question wrong.

- [ ] **Step 4: Run focused tests**
  - Run: `node --test tests/vocabulary-selector.test.js tests/vocabulary-questions.test.js tests/vocabulary-marking.test.js tests/vocabulary-session.test.js`
  - Expected: FAIL on missing modules.

- [ ] **Step 5: Implement minimal pure logic modules**
  - Question assembly uses curated IDs/text only; no live AI or network generation.
  - Keep browser timer/display concerns outside `session.js`.

- [ ] **Step 6: Re-run focused tests**
  - Expected: PASS.

- [ ] **Step 7: Commit**
  - Commit message: `feat: add adaptive vocabulary session engine`

### Task 5: Student persistence adapter and privacy-safe event writes

**Files:**
- Create: `src/vocabulary/data.js`
- Create: `src/vocabulary/tracking.js`
- Create: `tests/vocabulary-data.test.js`
- Create: `tests/vocabulary-tracking.test.js`

**Interfaces:**
- Produces `loadVocabularyUnit(client, unitNumber)`, `loadStudentMastery(client, unitNumber)`, `saveMasteryEvidence(client, result)`, `trackVocabularyEvent(client, payload)`.
- Consumes mastery/session outputs from Tasks 3–4.

- [ ] **Step 1: Write failing data/privacy tests**
  - Student reads live content and their own global/unit mastery.
  - Persistence payload updates only IDs, counters/confidence/statuses, dates, review state, and categorical misconception/recovery fields.
  - Assert typed/raw answer is never included in Supabase writes or tracking payloads.
  - Assert repeated global word uses one `vocabulary_id` plus separate `unit_occurrence_id` state.

- [ ] **Step 2: Run focused tests**
  - Run: `node --test tests/vocabulary-data.test.js tests/vocabulary-tracking.test.js`
  - Expected: FAIL.

- [ ] **Step 3: Implement data and tracking adapters**
  - Use authenticated browser client; do not expose service-role keys.
  - Write `activity_events` with `app_key:'vocabulary_paraphrase'` and sanitized metadata.
  - Update mastery through RLS-safe tables/RPCs chosen in Task 1.

- [ ] **Step 4: Re-run focused tests**
  - Expected: PASS.

- [ ] **Step 5: Commit**
  - Commit message: `feat: persist vocabulary mastery safely`

### Task 6: Student Vocabulary & Paraphrase Builder UI

**Files:**
- Create: `vocabulary.html`
- Create: `vocabulary.css`
- Create: `src/vocabulary/app.js`
- Create: `src/vocabulary/views.js`
- Modify: `src/views/home.js`
- Modify: `tests/home-access.test.js`
- Create: `tests/vocabulary-view.test.js`
- Create: `tests/vocabulary-app-flow.test.js`

**Interfaces:**
- Consumes Tasks 2–5.
- Produces student screens: unit chooser, unit detail, adaptive/timed session, feedback/retry, session summary, all-words/word-detail.

- [ ] **Step 1: Update home-card tests first**
  - Add fifth enabled app fixture `vocabulary_paraphrase` and assert the home model renders it without breaking role/admin behavior.
  - Give it a distinct `V` visual in `appVisual()` while preserving existing four visuals.

- [ ] **Step 2: Write failing view tests**
  - Landing page does not show `x / 1000` or hundreds-left whole-course totals.
  - Unit card shows manageable unit progress and supports all 20 units when content is available.
  - Unit screen exposes both `Start Adaptive Session` and timed choices `5`, `10`, `15`, `20`.
  - Student strand detail uses qualitative labels, not raw percentages.
  - Wrong-answer feedback is supportive and provides supported retry; no punitive `FAILED`/large red failure language.

- [ ] **Step 3: Write failing flow tests**
  - Authenticated active user can enter; invalid/inactive/no-session user returns to Hub/login path.
  - Adaptive session renders one question at a time and progresses through engine state.
  - Timed mode stops at expiry and shows progress summary.
  - Session summary reports strengthened/secure/mastered/needs-another-look counts rather than a giant score.

- [ ] **Step 4: Run focused tests**
  - Run: `node --test tests/home-access.test.js tests/vocabulary-view.test.js tests/vocabulary-app-flow.test.js`
  - Expected: FAIL.

- [ ] **Step 5: Implement student entry point and UI**
  - Reuse Hub color variables/visual language; keep layout mature, calm, responsive, and accessible.
  - Keep session rendering/state in focused modules rather than expanding `src/app.js`.

- [ ] **Step 6: Re-run focused tests**
  - Expected: PASS.

- [ ] **Step 7: Commit**
  - Commit message: `feat: add student vocabulary builder experience`

### Task 7: Teacher analytics read model and insight-first UI

**Files:**
- Create: `src/vocabulary/analytics.js`
- Create: `src/vocabulary/teacher-data.js`
- Create: `src/views/vocabulary-teacher.js`
- Create: `vocabulary-teacher.css`
- Create: `tests/vocabulary-analytics.test.js`
- Create: `tests/vocabulary-teacher-data.test.js`
- Create: `tests/vocabulary-teacher-view.test.js`
- Modify: `src/app.js`
- Modify: `src/views/home.js`

**Interfaces:**
- Produces `buildClassVocabularyInsights(input)`, `buildStudentVocabularyProfile(input)`, `loadVocabularyTeacherData(client, classId)`, `renderVocabularyTeacher(root, model)`.
- Teachers/admins access only authorized classes/students through existing RLS.

- [ ] **Step 1: Write failing analytics tests**
  - Surface students needing attention, main weak strand, most difficult targets, recent engagement, and improvement trend.
  - Distinguish content problems (specific terms) from skill problems (e.g. production weak across many terms).
  - Do not classify a student as struggling merely because they have insufficient/no practice; return `insufficient evidence`/engagement signal separately.

- [ ] **Step 2: Write failing teacher data/RLS-facing tests**
  - Teacher requests only assigned class data; admin may view all.
  - Student names/profile data are joined only for authorized students.
  - Raw answer text is absent because it is never stored.

- [ ] **Step 3: Write failing teacher view tests**
  - Class overview leads with interpreted insight cards, not a raw attempt table.
  - Problem drill-down supports grouping by word, student, failure type, and strand.
  - Student detail shows unit progress, persistent targets, qualitative strands, trend, and last practice.

- [ ] **Step 4: Run focused tests**
  - Run: `node --test tests/vocabulary-analytics.test.js tests/vocabulary-teacher-data.test.js tests/vocabulary-teacher-view.test.js`
  - Expected: FAIL.

- [ ] **Step 5: Implement analytics/read model/UI**
  - Keep interpretation functions pure and separate from DOM/Supabase.
  - Add teacher/admin entry control without turning the existing Admin account-management area into the analytics owner.

- [ ] **Step 6: Re-run focused tests**
  - Expected: PASS.

- [ ] **Step 7: Commit**
  - Commit message: `feat: add vocabulary teacher insights`

### Task 8: Recommendations, assignments, intervention outcomes, Teams target export, and EH-facing summaries

**Files:**
- Create: `src/interventions/model.js`
- Create: `src/interventions/data.js`
- Create: `src/evidence/vocabulary-summary.js`
- Create: `src/vocabulary/teams-targets.js`
- Create: `supabase/functions/learning-intervention-action/index.ts`
- Create: `supabase/functions/learning-intervention-action/validation.js`
- Create: `tests/interventions.test.js`
- Create: `tests/intervention-validation.test.js`
- Create: `tests/vocabulary-evidence-summary.test.js`
- Create: `tests/vocabulary-teams-targets.test.js`
- Modify: `src/views/vocabulary-teacher.js`

**Interfaces:**
- Produces generic intervention shape `{ type, targetScope, learningArea, skill, context, session, status, reason, createdBy, dueAt? }` usable by future Hub learning areas.
- Produces outcome statuses `improved`, `partially_improved`, `no_clear_change`, `insufficient_follow_up_evidence`.
- Produces privacy-safe EH-facing summary objects through the shared Task 1 contract; this task does not modify Evidence Hub itself.
- Produces `buildTeamsTargetList(insight)` as a teacher-use export containing target terms, weakness type, and affected student identifiers/names already authorized to the teacher; no student answer text.

- [ ] **Step 1: Write failing intervention model/validation tests**
  - Support `recommendation`, `assignment`, `intervention`; individual/group/class targets; adaptive or timed 5/10/15/20 sessions; optional strand/unit/target filters.
  - Teacher/admin can create for authorized students/classes; student cannot create teacher-directed interventions.
  - Status lifecycle supports recommended/assigned → started → completed → reviewed; overdue only when a due date applies.

- [ ] **Step 2: Write failing outcome/evidence tests**
  - Compare pre/post evidence windows and return the four approved outcome states.
  - Summary includes provenance, evidence window, trend, signal strength, status, primary strength/development area, persistent target count, engagement—not raw clicks or free-text answers.
  - Structure is learning-area generic enough that a future Reading/Listening summary can use the same top-level contract.

- [ ] **Step 3: Write failing Teams target tests**
  - Export class/group target terms plus weakness category/strand and affected students.
  - Never include typed student responses or inferred “correct answers” not in curated content.

- [ ] **Step 4: Run focused tests**
  - Run: `node --test tests/interventions.test.js tests/intervention-validation.test.js tests/vocabulary-evidence-summary.test.js tests/vocabulary-teams-targets.test.js`
  - Expected: FAIL.

- [ ] **Step 5: Implement generic intervention backend/client and vocabulary adapters**
  - Follow existing Edge Function auth pattern with publishable caller client + secret server client; pin Supabase JS to existing `2.117.3`.
  - Server verifies active teacher/admin and class/student authorization independently of UI.
  - Vocabulary session entry can consume an assigned intervention and mark started/completed without changing mastery logic.

- [ ] **Step 6: Re-run focused tests**
  - Expected: PASS.

- [ ] **Step 7: Commit**
  - Commit message: `feat: connect vocabulary insights to interventions`

### Task 9: Content rollout, security verification, full regression, and release gate

**Files:**
- Add/complete: `content/vocabulary/units/unit-01.json` through `unit-20.json` as source documents become available and are approved.
- Create: `docs/vocabulary-content-status.md`
- Create: `tests/vocabulary-privacy-regression.test.js`
- Create: `tests/vocabulary-deployment-contract.test.mjs`
- Modify product files only when verification exposes a defect.

**Interfaces:**
- Consumes all previous tasks.
- Produces a release candidate only when code + content + database + privacy checks all pass.

- [ ] **Step 1: Complete content in reviewable 10-word batches**
  - For every target, draft/enrich/validate meaning, sense, paraphrase bank, distractors, word family/collocations where useful, three+ curated contexts, and deterministic production answers.
  - Correct source-list shortages/duplicates only from teacher-approved coursebook targets; never silently invent replacement vocabulary.
  - Run `node scripts/validate-vocabulary-content.mjs` after each set and each unit.

- [ ] **Step 2: Add privacy/security regression tests**
  - Assert no schema field, tracking sanitizer, mastery adapter, intervention adapter, analytics export, or EH summary persists free-text student answers.
  - Assert students cannot read another student's mastery/interventions.
  - Assert teachers cannot read students outside assigned classes.
  - Assert curated content HTML/text is escaped in student/teacher rendering.

- [ ] **Step 3: Add deployment contract tests**
  - Assert `vocabulary.html`, `vocabulary.css`, all referenced ES modules, and `vocabulary_paraphrase` app registry migration are present.
  - Assert no external framework/CDN dependency beyond the existing pinned Supabase browser import is introduced.

- [ ] **Step 4: Run full verification**
  - Run: `npm test`
  - Run: `node scripts/validate-vocabulary-content.mjs`
  - Run Supabase migration status/advisors and targeted RLS queries against the development environment.
  - Expected: all tests pass; no critical advisor/security findings; only fully approved 50-target units are marked live.

- [ ] **Step 5: Manual smoke test**
  - Student: choose arbitrary unit, complete adaptive session, complete 5-minute timed session, receive retry/recovery, see mastery update, reopen and retain state.
  - Teacher: view class insights, drill into problem area/student, create recommendation/assignment, generate Teams target list.
  - Verify activity/mastery rows contain only approved structured metadata.

- [ ] **Step 6: Whole-branch review and release**
  - Compare implementation against the approved design spec section-by-section.
  - Open PR from `design/vocabulary-paraphrase-builder` (or execution branch/worktree derived from it) to `main` only after verification.
  - Do not claim production-ready until GitHub Pages deployment and required Supabase migration/function deployment are successful for the exact merged commit.

- [ ] **Step 7: Commit final content/verification artifacts**
  - Commit message: `test: verify vocabulary builder release candidate`

# Vocabulary & Paraphrase Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the fifth iGCSE Self-Study Hub learning area: a curated, adaptive Cambridge 0511 Vocabulary & Paraphrase Builder with timed/untimed mastery sessions, teacher analytics, interventions, and extensible Evidence Hub-facing evidence summaries.

**Architecture:** Keep the feature native to `igcse-self-study-hub` and reuse the existing authenticated Supabase session, `apps` registry, `activity_events`, class/teacher RLS model, vanilla ES modules, and Node test runner. Curated content is validated in-repo and published to controlled Supabase content tables. The browser selects/prioritises practice and renders questions, but mastery-critical marking and state transitions are verified by a Supabase Edge Function against curated content; raw typed answers are used transiently for marking and are never persisted or logged. Teacher analytics and interventions consume structured mastery/evidence rather than raw student work.

**Tech Stack:** Vanilla ES modules, HTML/CSS, Supabase JS `2.117.3`, PostgreSQL/RLS, Supabase Edge Functions (Deno/TypeScript/JS), Node built-in test runner (`node --test`), existing Hub styles.

**Spec:** `docs/superpowers/specs/2026-10-17-vocabulary-paraphrase-builder-design.md`

## Global Constraints

- Repository: `tobypottas-sketch/igcse-self-study-hub` only.
- Supabase project: `iGCSE Self-Study` (`grjshlamooglytsajoun`).
- Do not touch Evidence Hub Personal App or unrelated repositories.
- Treat Reading, Listening, Paraphrasing, Essay Writing, Vocabulary & Paraphrase Builder, and future additions as one extensible evidence ecosystem.
- Never remotely persist student free-text answers, essays, notes, teacher notes, teacher prompts, or other prohibited learning content. Transient answer transmission for deterministic server-side marking is allowed only if it is never stored or logged.
- Curated non-student vocabulary content may live in repository content files and controlled content tables.
- Student mastery and activity evidence belongs in Supabase behind RLS.
- Students choose the unit; the engine chooses priority words within that unit.
- All 20 units remain available; no progression locking.
- Each live unit must contain exactly 50 distinct targets organised as five sets of ten.
- Core sessions are mixed; production is required for `Mastered`.
- `Mastered` requires at least two successful productive demonstrations in different contexts/prompts where practical.
- Timed practice supports exactly 5, 10, 15, and 20 minute choices and uses the same evidence/mastery logic as untimed practice.
- Core marking is curated/deterministic. Do not use live AI to invent accepted answers or decide mastery-critical correctness.
- Student UI uses `New`, `Building`, `Secure`, `Mastered`; do not expose intimidating whole-course totals or raw strand percentages by default.
- Motivation is subtle: unit progress, meaningful milestones, and a light study streak are allowed; no public leaderboards, lives, noisy XP, or punitive loss mechanics.
- Teacher analytics follow `what needs attention -> why -> who -> what should I do next?`.
- Use TDD; run focused tests after each task and full `npm test` before completion.
- For Supabase schema work, create migration files with `supabase migration new <name>` rather than inventing timestamps manually; then edit the generated path.
- Enable RLS on every new exposed table; verify ownership/teacher-class policies and run Supabase advisors before release.

## Review Focus

- A production answer that is semantically valid only in one context must not be accepted globally in a different context.
- A student can miss a mastered review once without losing `Mastered`; repeated failures must eventually return the item to `Secure` according to deterministic rules.
- A repeated word across units must share global mastery without automatically granting unit-specific contextual mastery.
- No tracking/mastery/intervention write may include the student's typed free-text answer; only categorical/numeric outcome evidence and curated IDs may persist.
- Timed-session expiry during feedback/retry must stop cleanly without losing already-earned evidence or recording an unfinished prompt as a failure.

---

### Task 1: Shared evidence contract, tracking extension, and database foundation

**Files:**
- Create: `src/evidence/contracts.js`
- Create: `tests/evidence-contracts.test.js`
- Modify: `src/tracking/core.js`
- Modify: `tests/tracking-core.test.js`
- Create via CLI: `supabase/migrations/<generated>_vocabulary_builder_foundation.sql`
- Create: `tests/vocabulary-schema-contract.test.mjs`

**Interfaces:**
- Produces `LEARNING_AREAS`, `EVIDENCE_STATUSES`, `TRENDS`, `SIGNAL_STRENGTHS`, `INTERVENTION_STATUSES`, `buildEvidenceSummary(input)`, `buildInterventionOutcome(input)`.
- Extends tracking with app key `vocabulary_paraphrase` and vocabulary question/event metadata while preserving the existing sanitizer boundary.
- Creates content/mastery/intervention tables used by later tasks.

- [ ] **Step 1: Write failing evidence-contract tests**
  - `buildEvidenceSummary()` requires `learningArea`, `studentId`, `status`, evidence-window dates, and provenance.
  - Vocabulary may declare `meaning`, `recognition`, `context`, `paraphrasing`, `production` without hard-coding those strands into future learning areas.
  - Invalid status/trend/signal values are rejected.

- [ ] **Step 2: Extend tracking tests before implementation**
  - `buildTrackingEvent({ app_key:'vocabulary_paraphrase', ... })` is accepted.
  - Whitelist only categorical/numeric vocabulary metadata: `unit_number`, `strand`, `question_type`, `attempt_number`, `outcome`, `retry_used`, `recovery`, `misconception`, `target_id`, `occurrence_id`.
  - `answer_text`, `prompt`, `typed_answer`, and arbitrary metadata are stripped.

- [ ] **Step 3: Run focused tests**
  - Run: `node --test tests/evidence-contracts.test.js tests/tracking-core.test.js`
  - Expected: FAIL.

- [ ] **Step 4: Implement shared contracts and tracking sanitizer**
  - Keep `src/evidence/contracts.js` generic; no vocabulary-specific mastery algorithm lives there.
  - Preserve accepted behavior for the existing four apps.

- [ ] **Step 5: Create the database migration**
  - Run: `supabase migration new vocabulary_builder_foundation`.
  - Create `vocabulary_items`, `vocabulary_unit_occurrences`, `vocabulary_contexts`, `vocabulary_global_mastery`, `vocabulary_unit_mastery`, `learning_interventions`, `learning_intervention_targets`.
  - Content tables hold curated text. Mastery/intervention tables hold only IDs, states, confidence/evidence counters, dates, provenance, and categorical patterns—never student answer text.
  - Add app registry row `vocabulary_paraphrase` with launch URL `https://tobypottas-sketch.github.io/igcse-self-study-hub/vocabulary.html`; keep disabled until release gate if staged rollout is required.
  - RLS: students read live content and only their own mastery/interventions; teachers read authorized students via existing `private.teacher_can_access_student`; admins read all. Do **not** grant browser users direct mastery-update privileges; Task 5 owns authoritative writes through the Edge Function.

- [ ] **Step 6: Add schema-contract tests**
  - Every new public table has RLS enabled.
  - No mastery/intervention table exposes free-text answer columns.
  - Teacher read policies require real class authorization, not `TO authenticated` alone.
  - Mastery tables have no direct student update policy.

- [ ] **Step 7: Run focused tests and Supabase checks**
  - Run: `node --test tests/evidence-contracts.test.js tests/tracking-core.test.js tests/vocabulary-schema-contract.test.mjs`.
  - Run relevant local schema/advisor checks for the installed CLI.
  - Expected: PASS; no critical security advisor findings.

- [ ] **Step 8: Commit**
  - `git commit -m "feat: add vocabulary evidence and data foundation"`

### Task 2: Curated content schema, validation, and controlled publication

**Files:**
- Create: `content/vocabulary/schema.js`
- Create: `content/vocabulary/units/unit-01.json`
- Create: `scripts/validate-vocabulary-content.mjs`
- Create: `scripts/publish-vocabulary-content.mjs`
- Create: `tests/vocabulary-content.test.js`
- Create: `tests/vocabulary-content-publish.test.js`

**Interfaces:**
- Produces `validateVocabularyItem(item)`, `validateUnit(unit)` and canonical global-item/unit-occurrence/context shapes.
- Publisher reads only validated `live` units and upserts curated content using a server-side/local secret supplied through environment configuration; it is never invoked in the browser.

- [ ] **Step 1: Write failing content validation tests**
  - A live unit requires exactly 50 distinct occurrences and five sets of ten.
  - Every target has student-friendly meaning, part of speech, at least three curated contexts, and deterministic accepted-answer material for production-capable prompts.
  - Multi-word expressions remain one target.
  - Duplicate within-unit occurrences fail; the same global vocabulary ID may appear in multiple units.
  - Context-dependent paraphrases remain scoped to their sense/context.

- [ ] **Step 2: Run focused tests**
  - Run: `node --test tests/vocabulary-content.test.js`.
  - Expected: FAIL.

- [ ] **Step 3: Implement canonical schema and validator**
  - Global item: `vocabularyId`, `term`, `partOfSpeech`, `coreMeaning`, `senses`, `wordFamily`, `collocations`, `status`.
  - Sense: `senseId`, `meaning`, `acceptedParaphrases`, `contextDependentParaphrases`, `misleadingDistractors`, optional `teacherNote`.
  - Context: `contextId`, `type`, `text`, optional `targetRewrite`, `acceptedAnswers`, `misconceptionCategory`.
  - Occurrence: `occurrenceId`, `vocabularyId`, `unitNumber`, `unitTitle`, `setNumber`, `positionInUnit`, `senseId`, `contextIds`, `status`.

- [ ] **Step 4: Seed Unit 1 as a pipeline fixture**
  - Convert all supplied Unit 1 targets to canonical occurrences; enrich a representative subset enough to exercise every activity family.
  - Keep Unit 1 `draft` until all 50 meet the approved standard.
  - Do not manufacture missing Unit 3/5/10 replacements; validation must block incomplete units until teacher-approved targets are supplied.

- [ ] **Step 5: Write publisher tests**
  - Publisher refuses `draft`/`reviewed` units and any unit failing validation.
  - Upserts global items once and unit occurrences separately so repeated words share global identity.
  - No student/mastery tables are touched by the content publisher.

- [ ] **Step 6: Implement validate/publish scripts**
  - `node scripts/validate-vocabulary-content.mjs` exits non-zero on live-content defects.
  - `node scripts/publish-vocabulary-content.mjs` requires server-side credentials from environment, validates first, then upserts only curated content tables.

- [ ] **Step 7: Run focused tests and validator**
  - Expected: PASS; incomplete supplied units are reported as blocked, not silently repaired.

- [ ] **Step 8: Commit**
  - `git commit -m "feat: add curated vocabulary content pipeline"`

### Task 3: Deterministic mastery engine and review scheduling

**Files:**
- Create: `supabase/functions/_shared/vocabulary-engine.js`
- Create: `tests/vocabulary-mastery.test.js`
- Create: `tests/vocabulary-review.test.js`

**Interfaces:**
- Produces `applyEvidence(mastery, evidence, now)`, `deriveStatus(mastery)`, `isReviewDue(mastery, now)`, `nextReviewAt(mastery, now)`, and `markCuratedAnswer({ item, sense, context, questionType, rawAnswer })`.
- The module is pure: no database, DOM, network, logging, or persistence.

- [ ] **Step 1: Write failing asymmetric-evidence tests**
  - Production success may strengthen **Production, Paraphrasing, Recognition, and Meaning**; it does not automatically prove Context.
  - Paraphrasing may strengthen Paraphrasing, Recognition, Meaning.
  - Context strengthens Context and Meaning; Recognition strengthens Recognition and Meaning.
  - Recognition/meaning cannot strengthen Production.
  - `Secure` requires multi-strand evidence including Context or Paraphrasing.
  - `Mastered` requires Secure plus two successful productions in different curated contexts/prompts.
  - Supported retry earns less evidence than first-attempt success; later recovery is positive evidence without erasing the original miss.

- [ ] **Step 2: Write failing review tests**
  - First mastered review falls in 3–5 days; later successful reviews extend through 1–2 weeks and 3–4 weeks bands.
  - One failed review keeps visible `Mastered` and accelerates review.
  - Repeated failures deterministically return the target to `Secure`.

- [ ] **Step 3: Write deterministic marking tests**
  - Case/harmless punctuation normalization is allowed where safe.
  - Only curated answers/variants pass.
  - A context-dependent synonym accepted in Context A is rejected in Context B.
  - Raw answer is returned only transiently to the caller if needed for UI normalization and never placed in the evidence object.

- [ ] **Step 4: Run focused tests**
  - Run: `node --test tests/vocabulary-mastery.test.js tests/vocabulary-review.test.js`.
  - Expected: FAIL.

- [ ] **Step 5: Implement the pure engine**
  - Centralize named thresholds/constants.
  - Return plain immutable-style objects so server action behavior is fully testable.

- [ ] **Step 6: Re-run focused tests**
  - Expected: PASS.

- [ ] **Step 7: Commit**
  - `git commit -m "feat: add vocabulary mastery engine"`

### Task 4: Adaptive selection, curated question assembly, and session state

**Files:**
- Create: `src/vocabulary/selector.js`
- Create: `src/vocabulary/questions.js`
- Create: `src/vocabulary/session.js`
- Create: `tests/vocabulary-selector.test.js`
- Create: `tests/vocabulary-questions.test.js`
- Create: `tests/vocabulary-session.test.js`

**Interfaces:**
- Produces `selectPriorityTargets({ occurrences, globalMastery, unitMastery, now, limit })`.
- Produces `buildQuestion({ occurrence, item, contexts, mastery, usedContextIds, previousQuestionType })`.
- Produces `createSession({ unitNumber, mode:'adaptive'|'timed', durationMinutes?, now })` plus transition helpers.
- Question objects expose curated IDs and presentation material; correctness remains authoritative in Task 5.

- [ ] **Step 1: Write failing selection tests**
  - Priority: recently wrong → missing production → weak paraphrase/context → new → review due → recently secure/mastered.
  - A globally mastered repeated word still receives unit-context checks when its unit occurrence is not secure.
  - Default adaptive selection targets ten words where available.

- [ ] **Step 2: Write failing question tests**
  - Cover all ten approved 0511 activity families.
  - Do not reuse the same context for a target in one session when alternatives exist.
  - Recycled mistakes use a different context and preferably a different question type.
  - New/Building favors recognition/meaning; Secure/review-due favors context/paraphrase/production.

- [ ] **Step 3: Write failing session/timer tests**
  - Adaptive mode is an untimed ten-target mixed session.
  - Timed mode accepts only 5/10/15/20 minutes and continues serving priority work until expiry.
  - Expiry during feedback/retry keeps completed evidence and does not count the unfinished prompt as wrong.

- [ ] **Step 4: Run focused tests**
  - Run: `node --test tests/vocabulary-selector.test.js tests/vocabulary-questions.test.js tests/vocabulary-session.test.js`.
  - Expected: FAIL.

- [ ] **Step 5: Implement pure browser-side selection/question/session logic**
  - No live AI/network generation.
  - No correctness/mastery mutation in these modules.

- [ ] **Step 6: Re-run focused tests**
  - Expected: PASS.

- [ ] **Step 7: Commit**
  - `git commit -m "feat: add adaptive vocabulary session engine"`

### Task 5: Authoritative attempt marking, mastery writes, and privacy-safe tracking

**Files:**
- Create: `supabase/functions/vocabulary-attempt-action/index.ts`
- Create: `supabase/functions/vocabulary-attempt-action/validation.js`
- Create: `src/vocabulary/data.js`
- Create: `src/vocabulary/tracking.js`
- Create: `tests/vocabulary-attempt-validation.test.js`
- Create: `tests/vocabulary-data.test.js`
- Create: `tests/vocabulary-tracking.test.js`

**Interfaces:**
- Client produces `loadVocabularyUnit(client, unitNumber)`, `loadStudentMastery(client, unitNumber)`, `submitVocabularyAttempt(client, attempt)`, `trackVocabularySessionEvent(client, payload)`.
- Attempt input: `{ occurrenceId, contextId, questionType, rawAnswer, attemptNumber, retryUsed, priorMissInSession }`.
- Server returns `{ correct, feedbackCode, misconceptionCategory, recovery, globalMastery, unitMastery }`; it never returns/stores the raw answer after marking.

- [ ] **Step 1: Write failing validation/privacy tests**
  - Reject invalid occurrence/context/question IDs and oversized answers.
  - Require authenticated active student for mastery mutation; staff preview may mark without mutating student mastery.
  - Assert raw answer is absent from database insert/update payloads, `activity_events.metadata`, response logs, and returned persisted shapes.

- [ ] **Step 2: Write failing data tests**
  - Student loads live content plus own global/unit mastery.
  - Repeated vocabulary shares `vocabulary_id` but keeps separate `unit_occurrence_id` state.
  - Browser has no direct mastery-upsert helper; all mutation goes through `vocabulary-attempt-action`.

- [ ] **Step 3: Run focused tests**
  - Run: `node --test tests/vocabulary-attempt-validation.test.js tests/vocabulary-data.test.js tests/vocabulary-tracking.test.js`.
  - Expected: FAIL.

- [ ] **Step 4: Implement Edge Function**
  - Follow existing pinned Supabase `2.117.3` caller/secret-client auth pattern.
  - Fetch the authoritative live occurrence/sense/context; mark with Task 3 engine; fetch current mastery; apply evidence; upsert global + unit mastery; insert sanitized activity event.
  - Treat raw answer as request-local only: no console logging, no database field, no analytics metadata.
  - Database identity comes from authenticated caller, never request-supplied student ID.

- [ ] **Step 5: Implement client data/tracking adapters**
  - `submitVocabularyAttempt()` invokes the Edge Function and returns only the structured result needed by UI/session state.
  - Session-level `app_open`/`active_time`/completion events use existing sanitizer and contain no answer text.

- [ ] **Step 6: Re-run focused tests**
  - Expected: PASS.

- [ ] **Step 7: Commit**
  - `git commit -m "feat: verify and persist vocabulary attempts"`

### Task 6: Student Vocabulary & Paraphrase Builder UI and motivation layer

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
- Produces unit chooser, unit detail, adaptive/timed session, supportive feedback/retry, session summary, all-words/word-detail, unit milestone/streak presentation.

- [ ] **Step 1: Update home-card tests first**
  - Add fifth enabled app fixture `vocabulary_paraphrase`; existing role/admin behavior remains unchanged.
  - Give the new card a distinct `V` visual.

- [ ] **Step 2: Write failing view tests**
  - Landing does not show `x / 1000`, hundreds-left totals, or raw strand percentages.
  - Unit cards show manageable unit progress; all 20 units may be chosen once content is live.
  - Unit screen shows **both** `Start Adaptive Session` and timed choices 5/10/15/20.
  - Wrong-answer UI is supportive, offers a supported retry, and avoids punitive failure language.
  - Motivation is subtle: unit progress, meaningful milestone text, and optional study streak; no XP/lives/leaderboard.

- [ ] **Step 3: Write failing flow tests**
  - Active authenticated student can enter; unauthenticated/inactive account returns to Hub/login.
  - One question renders at a time; server result drives feedback and mastery display.
  - Timed mode stops cleanly at expiry.
  - Summary reports words practised/strengthened/secure/mastered/needs-another-look, not a giant score.

- [ ] **Step 4: Run focused tests**
  - Run: `node --test tests/home-access.test.js tests/vocabulary-view.test.js tests/vocabulary-app-flow.test.js`.
  - Expected: FAIL.

- [ ] **Step 5: Implement UI**
  - Reuse Hub visual language; mature, calm, responsive, keyboard-accessible.
  - Keep feature state inside `src/vocabulary/*`; do not bloat `src/app.js`.

- [ ] **Step 6: Re-run focused tests**
  - Expected: PASS.

- [ ] **Step 7: Commit**
  - `git commit -m "feat: add student vocabulary builder experience"`

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

- [ ] **Step 1: Write failing analytics tests**
  - Surface students needing attention, main weak strand, most difficult targets, engagement, and improvement trend.
  - Distinguish content problems from cross-word skill problems.
  - No-practice/insufficient evidence is not mislabeled as low attainment.

- [ ] **Step 2: Write failing authorization/read tests**
  - Teacher reads only assigned-class students; admin may view all.
  - Raw answers cannot appear because they are never persisted.

- [ ] **Step 3: Write failing teacher-view tests**
  - Overview leads with interpreted insights, then drill-down.
  - Drill-down groups by word, student, failure category, and strand.
  - Student view shows unit progress, persistent gaps, qualitative strand profile, trend, last practice.

- [ ] **Step 4: Run focused tests**
  - Run: `node --test tests/vocabulary-analytics.test.js tests/vocabulary-teacher-data.test.js tests/vocabulary-teacher-view.test.js`.
  - Expected: FAIL.

- [ ] **Step 5: Implement analytics/read model/UI**
  - Pure interpretation functions stay separate from Supabase and DOM.
  - Add teacher/admin entry point without making the account-management Admin area the analytics owner.

- [ ] **Step 6: Re-run focused tests**
  - Expected: PASS.

- [ ] **Step 7: Commit**
  - `git commit -m "feat: add vocabulary teacher insights"`

### Task 8: Recommendations, assignments, Teams follow-up, intervention outcomes, and EH-facing summaries

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
- Generic intervention shape: `{ type, targetScope, learningArea, skill, context, session, status, reason, createdBy, dueAt?, externalFollowUp? }`.
- `externalFollowUp` supports `teams_quiz` without pretending Teams work was completed inside the Hub.
- Outcome statuses: `improved`, `partially_improved`, `no_clear_change`, `insufficient_follow_up_evidence`.
- EH-facing summaries use Task 1's generic contract; this task does **not** modify Evidence Hub itself.

- [ ] **Step 1: Write failing intervention tests**
  - Support `recommendation`, `assignment`, `intervention`; individual/group/class targets; adaptive or timed 5/10/15/20 sessions; optional unit/strand/target filters.
  - Teacher/admin can create for authorized students/classes; students cannot create teacher-directed interventions.
  - Lifecycle: recommended/assigned → started → completed → reviewed; overdue only if a due date exists.
  - `teams_quiz` can be recorded as external follow-up.

- [ ] **Step 2: Write failing outcome/EH-summary tests**
  - Compare pre/post evidence windows and return the four approved outcome states.
  - Summary contains provenance, evidence window, status, trend, signal strength, primary strength/development area, persistent-target count, engagement—not raw clicks or answer text.
  - Top-level structure is reusable for future Reading/Listening/etc. summaries.

- [ ] **Step 3: Write failing Teams target tests**
  - Export authorized affected students, target terms, weak strand/failure category, and curated teaching targets.
  - Never include typed responses.

- [ ] **Step 4: Run focused tests**
  - Run: `node --test tests/interventions.test.js tests/intervention-validation.test.js tests/vocabulary-evidence-summary.test.js tests/vocabulary-teams-targets.test.js`.
  - Expected: FAIL.

- [ ] **Step 5: Implement generic intervention backend/client and vocabulary adapters**
  - Follow existing Edge Function authorization pattern; independently verify active teacher/admin plus class/student access.
  - Vocabulary session can consume an assigned/recommended intervention and mark started/completed without changing core mastery rules.

- [ ] **Step 6: Re-run focused tests**
  - Expected: PASS.

- [ ] **Step 7: Commit**
  - `git commit -m "feat: connect vocabulary insights to interventions"`

### Task 9: Full content rollout, privacy/security verification, regression, and release gate

**Files:**
- Complete: `content/vocabulary/units/unit-01.json` through `unit-20.json` as approved source documents become available.
- Create: `docs/vocabulary-content-status.md`
- Create: `tests/vocabulary-privacy-regression.test.js`
- Create: `tests/vocabulary-deployment-contract.test.mjs`
- Modify product files only if verification exposes a defect.

**Interfaces:**
- Consumes all previous tasks.
- Produces a release candidate only when code, content, database, privacy, and authorization checks pass.

- [ ] **Step 1: Complete content in reviewable ten-word batches**
  - For each target: meaning, relevant sense, paraphrase bank, distractors, useful family/collocations, 3+ curated contexts, deterministic production answers.
  - Correct shortages/duplicates only from teacher-approved coursebook targets; never silently invent replacement vocabulary.
  - Validate after every set and unit.

- [ ] **Step 2: Add privacy/security regression tests**
  - No schema, tracker, Edge Function, mastery record, intervention, analytics export, Teams list, or EH summary persists student answer text.
  - Students cannot read others' mastery/interventions; teachers cannot read outside assigned classes.
  - Student/teacher rendering escapes curated or profile text safely.

- [ ] **Step 3: Add deployment contract tests**
  - `vocabulary.html`, CSS, ES modules, Edge Functions, and app-registry migration exist.
  - No new frontend framework or unpinned runtime dependency is introduced.

- [ ] **Step 4: Run full verification**
  - Run: `npm test`.
  - Run: `node scripts/validate-vocabulary-content.mjs`.
  - Run Supabase migration status/advisors and targeted RLS queries in development.
  - Expected: all tests pass; no critical security findings; only fully approved 50-target units are `live`.

- [ ] **Step 5: Manual smoke test**
  - Student: choose arbitrary unit; finish adaptive session; finish 5-minute timed session; experience retry/recovery; see mastery update; reopen and retain state.
  - Teacher: see class insights; drill into word/student; recommend/assign practice; generate Teams target list.
  - Inspect stored rows to confirm structured evidence only.

- [ ] **Step 6: Whole-branch review and release**
  - Compare implementation against the approved spec section-by-section.
  - Open PR to `main` only after verification.
  - Do not claim production-ready until required Supabase migration/functions and GitHub Pages deployment succeed for the exact merged commit.

- [ ] **Step 7: Commit final verification artifacts**
  - `git commit -m "test: verify vocabulary builder release candidate"`

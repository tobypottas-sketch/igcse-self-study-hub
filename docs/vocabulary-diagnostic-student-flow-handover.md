# Student Diagnostic Player and Mandatory Practice Gate — Implementation

**Date:** 14 November 2026  
**Status:** student UI and baseline-status API implemented; backend status contract applied; **mandatory practice lock disabled**. No students have been assigned a diagnostic or blocked from Vocabulary Builder.

## Student assessment experience

- Implemented `src/vocabulary/diagnostic-student.js`: a responsive, accessible, one-question-at-a-time student interface, four answer choices and an explicit “I'm not sure” option.
- Displays a question number and neutral progress language, with no right/wrong or level feedback while taking the assessment. Test length is currently server-controlled.
- Starts or resumes a staff-assigned assessment, saves answers through the authenticated `vocabulary-diagnostic` function, pauses without discarding prior responses, and shows a completion confirmation with **no unvalidated CEFR level**.
- The student player whitelists question fields and rejects any payload accidentally containing keyed answer or grading metadata. Answer attempts use a stable `crypto.randomUUID()` request ID for idempotent network retries.
- After completion, reloads the Vocabulary entry route and relies on a fresh **server-confirmed** baseline-status check for unlocking. A duplicate completion acknowledgement can recover the stored summary from the student's own history.
- Implemented `vocabulary-diagnostic-student.css` and added its stylesheet to `vocabulary.html`; student module loads **only** when an explicit diagnostic route is requested or the future mandatory gate is enabled.

## Live backend update

The `supabase/diagnostic/pilot_api.sql` source was updated and the matching function replacement **successfully applied** via managed Supabase migration `vocabulary_diagnostic_baseline_status_contract`.

The student `status` API now includes:

- `baselineCompleted`: computed from a persisted **completed baseline session + result**; never from a student-submitted flag, unit mastery, class assignment or follow-up diagnostic.
- `baselineAssignmentId`: the student's available initial diagnostic invitation or their existing in-progress/paused session's assignment.
- `baselineSessionId` and `baselineSessionState`: scoped to the **baseline**, not a later retake/reassessment.
- Existing response fields remain for backwards compatibility; no sensitive keyed content added.

**Verification completed:** A rollback-scoped SQL integration test exercised the full lifecycle: initially incomplete → staff-assigned draft temporarily enabled in transaction → session started → in-progress status → one response marked on server → completed result → `baselineCompleted=true`. The transaction rolled back, so no draft was promoted, no assignment persisted and no student's record changed.

## Mandatory schoolwide practice enforcement — PREPARED ONLY

`supabase/diagnostic/mandatory_practice_gate_NOT_APPLIED.sql` is a proposed database-level protection layer covering student Vocabulary writes to:

- `vocabulary_missions` and `vocabulary_mission_starts`;
- `vocabulary_global_mastery` and `vocabulary_unit_mastery`;
- `vocabulary_pathway_sets`, `vocabulary_unit_pathway_journey`, `vocabulary_unit_check_attempts`;
- Vocabulary-scoped `activity_events` (not other iGCSE apps).

The private singleton setting defaults to `enabled=false`. If enabled after approval, the trigger checks the actual student's completed baseline and rejects practice writes missing one. Teacher/admin nonstudent records are unaffected, and unrelated app activity events are ignored. This is a necessary defense against bypassing the client router via direct vocabulary RPCs or direct write APIs.

**NOT INSTALLED IN PRODUCTION:** This trigger migration has only been compiled and tested inside rolled-back transactions. One test temporarily set the gate to `true` inside that transaction and confirmed that an existing active student with no baseline could not update Vocabulary mastery; then `ROLLBACK` removed both the triggers and the temporary setting. Before deployment, verify all student-written Vocabulary surfaces and role flows to avoid interfering with existing school operations.

The browser entry feature flag remains **`DIAGNOSTIC_BASELINE_GATE_ENABLED=false`**. There is also an explicit `?diagnostic=1` route for supervised testing with an actual staff assignment; without an assignment it shows that the diagnostic is unavailable. No public entry to unreviewed questions has been created.

## Additional test results

- Student player JavaScript parsed successfully.
- 10/10 focused safe-question, active/dormant gating, route and retry checks passed in an isolated JavaScript evaluation.
- `tests/vocabulary-diagnostic-student-flow.test.js` and `tests/vocabulary-diagnostic-practice-gate.test.js` added for repeatable CI.
- New database triggers compiled successfully inside a rollback transaction.
- The schoolwide master switch has **not** been created in the persistent database and is not active.

## Pre-launch gates (still required)

1. Approved and independently reviewed question bank: the 80 candidates remain **draft/unverified**. No live form or student assignments exist.
2. Real user-session browser E2E: new/existing students; desktop/mobile; offline/retry; pause/resume; wrong-session/expired token; cross-account negative tests.
3. Full trigger review and transactional integration of **all practice write paths**, including current RPCs/Edge Functions, teacher overrides and actual saved mastery. Only then deploy the proposed gate trigger migration.
4. Authorised **schoolwide idempotent baseline assignment** once a reviewed form is available, allowing for approved accommodations and emergency teacher overrides.
5. Independent psychometric calibration and interpretation review before offering any actual A1–C1 CEFR estimate. Pilot results remain `uncalibrated` and `levelEstimate=null`.
6. Explicit user release approval and coordinated activation of both the **server enforcement switch** and **client router feature flag**.

**Do not activate one without the other.** Existing Vocabulary usage, mastery, merits and historical records must remain untouched.

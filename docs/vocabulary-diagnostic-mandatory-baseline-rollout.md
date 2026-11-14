# Mandatory first Vocabulary Diagnostic — rollout plan

**Status: implemented as a DORMANT student-entry gate; NOT enabled.** No students are blocked and no diagnostic is assigned automatically.

## Requirement

Every student must complete one **server-confirmed first diagnostic** before entering Vocabulary Builder practice, including:

- New accounts: first diagnostic before practising.
- Existing accounts that already have Vocabulary activity: first diagnostic at their next Vocabulary Builder entry. Preserve historical practice, XP, merits, stage progress and word mastery.
- Students with a completed first baseline: practice unlocks; later reassessments follow their separate schedule.
- Teachers/admins and their student preview: unaffected.

For students with prior activity, label the assessment **first diagnostic after training**, not an authentic before-training baseline. Record the first diagnostic date, prior exposure flag and existing practice history so teacher reports do not overstate improvement.

**Scope:** lock Vocabulary Builder practice, NOT the entire iGCSE Self-Study Hub, Reading, Listening, writing apps or teacher analytics.

## Source already added

- `src/vocabulary/diagnostic-entry-gate.js`: pure gate decision and server-confirmed completion checks.
- `src/vocabulary/diagnostic-gate-view.js`: accessible holding state for missing/incomplete diagnostic.
- `src/vocabulary/router.js`: student-only check happens **before** loading Vocabulary practice modules; fail-closed if enabled but status unavailable; admin/teacher preview bypass.
- `tests/vocabulary-diagnostic-baseline-gate.test.js`: new, existing, completed, partial, missing, backend-error and teacher cases.

Feature flag: **`DIAGNOSTIC_BASELINE_GATE_ENABLED=false`**. This is intentional and must not be flipped merely because code exists.

## Prerequisites for activation

1. **Approved questions, forms and item calibrations:** current 80 items remain unverified drafts; no approved pilot forms. No login should be blocked until a functioning assessment is available.
2. **Real student assessment UI:** students must be able to start, resume, submit and complete an initial diagnostic; a holding screen alone is insufficient.
3. **Backend status contract:** enhance the protected `vocabulary-diagnostic` status action to return `baselineCompleted` (boolean, server-computed from the specific first diagnostic), `baselineSessionState` and `baselineAssignmentId`. The current status response does **not** supply these three fields.
4. **Safe assignment rollout:** a one-time school-wide baseline assignment mechanism for active students, including existing accounts, with idempotency, opt-out/accommodations and a teacher/admin emergency release option. No duplicate baselines or lost attempt histories.
5. **Server-side practice enforcement:** current router check is UX routing only. A student might call the existing practice API directly or load alternative app modules; backend submission paths **must reject Vocabulary training when mandatory baseline is outstanding**, otherwise the lock is bypassable. Do not enable until all practice write paths are guarded and tested.
6. **Real authenticated end-to-end checks:** new and existing students, staff preview, already completed, paused/resumed and failed status requests, across mobile/desktop.
7. **Explicit release approval:** only after the above passes, switch feature flag on in an approved merge/deployment and activate server-side controls at the same time.

**Failure behaviour after activation:** backend status failure → no Vocabulary practice; show a clear message with Hub navigation, teacher/admin escalation and a robust retry. Never assume ‘no assignment’ means the learner is A1; a missing assignment is an administrative state.

**Reassessment rule:** first baseline is mandatory; future diagnostics initially at ~56-day intervals. Whether follow-up reassessments themselves interrupt training should be a separate school policy decision. Default proposal: reminders rather than sudden lockouts, so teachers retain flexibility.

## Why not force the lock now?

The diagnostic currently has 80 privately stored *drafts*, no independently verified CEFR levels and no deployed student assessment interface. Blocking 269+ active students before the diagnostic is usable would prevent legitimate learning. This PR **prepares** the gate only; it neither changes database settings nor enables it on the live platform.

# Secure Diagnostic Delivery and Data Model — Implementation Contract v0.1

**Status:** review proposal with executable pure validation helpers, **not a deployed API or database migration**. Builds on Phase 0 blueprint and Phase 1 authoring bank. No production keys, students' responses, diagnostic item bank, scoring or client routes have been created.

## What we verified (14 November 2026)

In the current Supabase project, the `private` schema exists. No tables with `diagnostic` in their name currently exist. Student authentication is backed by `profiles`; teachers are linked to classes through `teacher_classes`, and students to classes through `student_class_memberships`.

Existing evidence tables (`activity_events` and `vocabulary_global_mastery`) use ownership/admin/teacher-class checks through `private.teacher_can_access_student`. **However, `profiles` and `student_class_memberships` grant teacher-wide SELECT**, which would be too broad for confidential diagnostic evidence. We will not use those broad policies to authorise diagnostic reports. Use a dedicated, verified “teacher assigned to this student's current class” check, plus admin and self-only rules. Test membership changes and historical results.

Official Supabase documentation (current as of this blueprint):
- Securing Edge Functions: https://supabase.com/docs/guides/functions/auth
- Authorization headers: https://supabase.com/docs/guides/functions/auth-headers
- Data API grants and schema security: https://supabase.com/docs/guides/api/securing-your-api
- Postgres RLS: https://supabase.com/docs/guides/database/postgres/row-level-security

## Threat model / non-negotiables

- GitHub Pages is public static hosting. A keyed bank, answer rationale, CEFR item tag and calibration parameters must **never** be imported into or embedded within browser-delivered JS/HTML/JSON, local storage, page source, devtools-visible requests or client-side response objects.
- Anyone can inspect their own received question and option texts while answering. This is unavoidable; minimise exposure through single-question delivery, no bulk form downloads, server-owned sequencing and sensible attempt windows.
- Authentication is not authorisation: an authenticated student cannot start arbitrary sessions, call a classmate's `sessionId`, choose the next item's ID, submit a fabricated correct flag, or request another student's results. Teachers cannot access unrelated classes.
- Service-role/admin clients bypass RLS: backend must validate the *real authenticated user* and exact session ownership before any privileged reads/writes. Never trust a role, student ID, class ID, “isTeacher” flag or correct-answer status supplied by a browser.
- For a duplicate request, the server should return the original safe acknowledgement. It must never re-score an answer or allocate a second next question.
- Limit test access/exposure and attempt rate, but do not use recording of typing speed, location or invasive surveillance. Accessible extended time should be available without changing proficiency scoring.
- Support cancellation, interruption and abandoned sessions. Completed sessions/results are immutable; a teacher-approved retake creates a new session with an audit link, not overwrite.
- Safeguard young users: minimise personal data, avoid public rankings and do not expose diagnostic item records in staff exports.

## Explicit private-schema access decision (must be resolved before deployment)

Supabase's Data API exposes **configured schemas**, not every Postgres schema. Placing keyed items in `private` does not automatically make them queryable through `ctx.supabaseAdmin.schema('private')`; a schema that is not exposed to PostgREST will not magically become available because a service key is used. We must choose and test one of these narrow server-only database access approaches:

1. **Preferred to evaluate:** a trusted, connection-pooled server-side Postgres connection with least-privilege credentials from Edge Functions, using secrets stored server-side, not a browser environment variable. Confirm Supabase Edge runtime/connection limits, token/SSL and pooling guidance before implementation.
2. **Alternative requiring a security review:** restricted server-only RPC with explicit revocation of `EXECUTE` from `PUBLIC`, `anon` and `authenticated`. Do not create an exposed public `SECURITY DEFINER` function as a shortcut; verify ownership, fixed `search_path`, grants, user validation and all callable paths.
3. **Do not broadly expose the existing `private` schema** to the Data API merely to retrieve keyed diagnostic questions: it contains other private application objects. Any schema exposure change requires a complete privilege audit.

Whichever access method is chosen, the authenticated user identity must first be verified, and privileged SQL must be restricted to the exact authorised session. **Current PR does not choose, implement or deploy any of these database connections.**

## Server-owned API (proposed contract)

All requests require a valid student JWT, except authorised staff assignment/review actions. Recommended: a Supabase Edge Function using **authenticated user context** (see current Supabase `withSupabase({ auth:'user' })` guidance). Never rely on a browser-supplied user ID; authorise every call by the validated identity. A privileged client is allowed *inside* the trusted function only after an explicit ownership/assignment check.

| Operation | Student input | Server duties | Browser output |
|---|---|---|---|
| `GET /diagnostic/status` | None | Confirm own identity, active session/assignment, next due date | `invited`, `in_progress`, `completed`, `not_due`, `unavailable`, etc. |
| `POST /diagnostic/start` | Assignment token/ID (opaque) | Check active student, invitation, pilot allow-list, intervals, no conflicting open attempt; atomically create/resume session | Session ID, progress and the **next single safe question** |
| `POST /diagnostic/respond` | Session ID, question ID+version, position, answer option ID or `unknown`, idempotency token | Check ownership, in-progress state, correct next question, item version, one submission; score inside backend; atomically persist response and advance | Safe acknowledgement and next single question; **no correctness feedback or key** |
| `POST /diagnostic/pause` | Session ID | Validate owner, record interruption/expiry policy | New session state |
| `POST /diagnostic/complete` | Session ID | Verify response completeness/minimum evidence, finalize exactly once, aggregate scored outcomes, version result | Pilot score/coverage and result ID; **no fake CEFR estimate** |
| `GET /diagnostic/history` | None | Read only own completed/safe historical summaries | Dates, status, coverage, pilot indices/validated estimates when approved |
| `POST /diagnostic/staff/assign` | Authorized roster selection and release window | Verify real staff role and assigned classes, enforce quotas and audit who assigned | Counts, assignment IDs (not answer-bearing content) |
| `GET /diagnostic/staff/report` | Class filter/pagination | Verify role and each student's accessible class, return **summaries only** | Completion/coverage/progress; no bank keys or raw response answer sets |

Suggested transport: one authenticated **Edge Function** implementing explicit action dispatch, or several smaller functions. Avoid a globally accessible `SECURITY DEFINER` public function or a public view that exposes private keys. Prefer a narrow, versioned server contract, and check the deployed function's JWT verification configuration rather than changing it to `false` to work around 401 errors.

### Response and question payload invariants

An example safe question object (the strings are dummy fixtures, **not** diagnostic content):

```json
{
  "sessionId":"opaque-session-id",
  "questionId":"diag-example-001",
  "questionVersion":2,
  "position":1,
  "stem":"An example vocabulary question stem",
  "options":[
    {"id":"C","text":"Option text C"},
    {"id":"A","text":"Option text A"},
    {"id":"D","text":"Option text D"},
    {"id":"B","text":"Option text B"}
  ],
  "allowUnknown":true
}
```

The **only** server-to-student fields are whitelisted by `tools/diagnostic/assessment-contract.js`. It deliberately omits `correctOptionId`, `rationale`, `levelHypothesis`, `calibration`, private item review/provenance and future item IDs.

`unknown` is an additional skip/uncertainty response, not one of the four options. Server-side scoring counts it separately, with a zero correct score. Hide right/wrong feedback until the assessment ends, and do not distribute the key afterward.

## Suggested private data model (not applied)

**Every table with real keyed content and responses belongs in the existing `private` schema, not in publicly exposed `public`.** The schema should have no `USAGE`, `SELECT`, `INSERT`, `UPDATE`, `DELETE` grants to `anon` or `authenticated` for diagnostic private objects. Enable RLS anyway for defence in depth, and verify actual deployment grants and Data API exposed schemas before release.

- `private.vocabulary_diagnostic_items`: immutable `(item_id,version)` identity, `form_family`, authoring level and **sense**, question text, exact keyed choices, key, provenance, review statuses and calibration. Version changes append a row; never mutate old scored records.
- `private.vocabulary_diagnostic_forms`: linked form version, planned item roster/constraints, anchor and exposure policy, readiness and active window. Item/form versions must be pinned per session.
- `private.vocabulary_diagnostic_assignments`: student ID and authorising staff ID, assignment type, release/expiry window, authorised retake reason, audit trail and active status.
- `private.vocabulary_diagnostic_sessions`: student owner ID, assignment, immutable chosen form/version, type `baseline|follow_up|teacher_retake`, `assigned|in_progress|interrupted|completed|expired|void`, start/end timestamps, server-selected next position, idempotency state and score-model version.
- `private.vocabulary_diagnostic_responses`: `sessionId + position` unique, `sessionId + itemId + itemVersion` unique, original option ordering, chosen answer (including `unknown`), adjudication outcome, server receive time and request ID unique for retries.
- `private.vocabulary_diagnostic_results`: one immutable completed session result, full item/form/model/cut-score versions, counts, uncertainty/coverage and (after validation only) an approved CEFR-referenced estimate.

The *actual* migration should be generated via the project's Supabase migration workflow once reviewed. Add separate read-model endpoints returning only student-safe results, not a view over keyed items. All changes require per-role negative tests and a live audit of Postgres grants, RLS, RPC exposure, edge secrets, indexes and function logs.

## Assessment state machine and invariants

```text
assigned → in_progress ⇄ interrupted
              ↓
           completed   [terminal]
assigned/in_progress/interrupted → expired or void [terminal]
```

- Only a **completed** baseline makes a future follow-up eligible.
- Initial proposal: follow-up after **56 days** from the most recent completed diagnostic, contingent on an explicit invitation/assignment and no open session. No background job has been installed.
- A partial, expired or interrupted attempt does not produce an “A1” result or reset the baseline.
- Sessions cannot return from `completed` to `in_progress`; an approved retake creates a **new** session.
- For the uncalibrated pilot, report counts and band-sampling coverage with `levelEstimate:null`. This must remain enforced server-side even if the student tampers with the browser.
- Do not interpret response percentages as B1/B2; level estimates only after a documented model, equating evidence and teacher approval.

Reference pure functions and tests:
- `tools/diagnostic/assessment-contract.js`
- `tests/vocabulary-diagnostic-assessment-contract.test.js`

These tests verify the **design contract**, not deployed RLS, HTTP authentication, real database atomicity, concurrent requests, stable form equating or psychometric validity.

## Security test plan before any schema rollout

| Scenario | Required result |
|---|---|
| Anonymous or revoked JWT calls /status or /respond | 401; no queries/side effects |
| Student tries to SELECT private items/key using Data API | Denied, even when guessing exact IDs |
| Student submits a classmate's session ID | 403/404, no existence leak |
| Teacher queries student outside assigned classes | Denied; does not inherit broad `profiles` privilege |
| Student submits arbitrary correct flag, different question ID/version or future position | Denied; backend ignores untrusted scoring fields |
| Duplicate response request from unstable network | Same safe acknowledgment; exactly one stored response/scoring advancement |
| Two simultaneous answers for same question | Exactly one commits, second conflicts/idempotently resolves |
| Student reopens completed/expired session | No answer write or reopening without new authorised retake |
| Error/stack trace or logs include keyed item content | Redacted; verify logs and error handlers |
| Partial attempt has too few high-level anchors | Insufficient evidence, not a manufactured A1–C1 band |
| Teacher's class assignment is removed | Class report access revoked without deleting historic attempts |
| Private diagnostic bank accidentally included in GitHub Pages build | CI/build fails before deployment |

### Explicit non-goals for this change

- No attempt to deploy an edge function, manipulate Supabase grants or create tables in this branch.
- No CEFR level assignment, secure random adaptive scoring implementation or full bank of approved items yet.
- No visible first-login diagnostic, login restriction, scheduled 8-week reminder or teacher control panel in production.
- No new RLS policies until the design has been validated against existing auth/RLS and security tests.

**Next buildable milestone:** implement the locked-down private database schema and authenticated edge endpoint in a separate reviewable PR, initially with synthetic questions and test-only accounts. Verify actual authorisation/atomicity and show student-safe payloads; only then import approved private items, pilot and calibrate.

# Vocabulary Diagnostic — secure backend pilot (deployed, not student enabled)

> **Question-bank boundary:** operational items, options and keys never enter this public repository. See `docs/vocabulary-diagnostic-secure-bank-boundary.md`; the item lifecycle RPC is in `item_lifecycle_NOT_APPLIED.sql` (not applied).

## Current state — 14 November 2026

**Supabase project:** existing Hub project. **Deployed Edge Function:** `vocabulary-diagnostic` version **2**, `verify_jwt=true`. **Database:** three successful managed migrations (private tables, initial API, pause/resume API replacement).

No diagnostic items, approved forms, invitations, assignments, responses or student results have been inserted. Existing Vocabulary practice, grades, merits, login flows and student navigation have not been modified. The endpoint **is not linked from the site**. The system is not ready to collect student CEFR evidence yet.

### Source files

- `pilot_tables.sql`: seven isolated backend-only tables under existing `private` schema, RLS enabled, all direct `anon` and `authenticated` privileges revoked. This schema is NOT added to the Data API exposed schemas.
- `pilot_api.sql`: `public.vocabulary_diagnostic_api(uuid,text,jsonb)` restricted to `service_role` EXECUTE only, with `SECURITY DEFINER SET search_path=''`. Only the authenticated Edge Function may pass a validated actor UUID.
- `../functions/vocabulary-diagnostic/index.ts`: authenticated Edge Function; separately validates the Supabase user JWT using `auth.getUser`, then invokes the restricted RPC via a secret service-role client. No service-role key is sent to a browser.
- `../../tests/vocabulary-diagnostic-secure-backend.test.js`: deterministic structural/security tests.

**Important:** The migrations were applied directly to the project's managed database through the Supabase migration facility. These SQL scripts are the tracked source snapshot; do not blindly reapply them to a different environment without a migration plan and security review.

## Supported pilot actions

Send a POST JSON body to the new Edge Function; an authenticated Supabase user JWT must be present in the `Authorization: Bearer <access_token>` header. Browser Supabase Functions invocation can supply the token, but there is currently no student UI client.

| `action` | `payload` | Permissions and effect |
|---|---|---|
| `status` | `{}` | Student, own latest session and available assignment; never an answer key |
| `start` | `{ "assignmentId": "<uuid>" }` | Student, own active staff assignment, no existing open attempt; creates/resumes a session, returns the next one question |
| `pause` | `{ "sessionId": "<uuid>" }` | Student, own in-progress session; resumes on `start` |
| `respond` | `{ "sessionId": "<uuid>", "requestId": "<uuid>", "questionId": "...", "questionVersion": 1, "position": 1, "answerId": "A" }` | Student, current question only; idempotent retry, single transaction, private grading, next safe question or completed result |
| `history` | `{}` | Student, only own latest 20 pilot results |
| `assign` | `{ "studentId": "<uuid>", "formId": "<uuid>", "kind": "baseline" }` | Admin or teacher assigned to the student's **current** class; optional `availableAt` and `expiresAt` |
| `report` | `{}` | Admin school scope, teachers only their **currently assigned** students; no individual answer keys |

To avoid leaking the scoring key, every returned question contains only the whitelisted fields: `sessionId`, `questionId`, `questionVersion`, `position`, `stem`, `options: [{id,text}]` and `allowUnknown`. No correct answers, rubrics, item difficulty metadata or level tags are returned.

**No CEFR score exists yet.** All completed pilot results have `scoreStatus='uncalibrated'` and `levelEstimate=null`. Diagnostic history and progress are separate from existing Vocabulary mastery, unit checks and merits.

### Required gating before assigning any real students

1. Author and independently review an original, licensed/author-owned **private** diagnostic question bank; secure item contents and keys against browser direct access.
2. Prepare two alternate forms and review every A1–C1 level *hypothesis* against permitted references. No validated CEFR interpretation yet.
3. Verify server auth with test student **and** teacher JWTs, particularly denial of cross-class access, revoked sessions, concurrent responses, unknown-answer treatment, and test interruptions.
4. Check Supabase Edge Function environments contain their usual server-only credentials (never store keys in GitHub); verify live invocation and errors without logging prompts/answers.
5. Run accessibility and student UI pilot before switching on any onboarding or eight-week schedule.

## Verification performed

- Both database schemas and RPC creation succeeded through managed migrations.
- JWT-verified Edge Function version 2 is active.
- Seven private diagnostic tables have RLS enabled and no `anon`/`authenticated` SELECT privileges.
- `public.vocabulary_diagnostic_api` has **no** `anon` or `authenticated` EXECUTE rights; only `service_role` can call it.
- A transaction-scoped synthetic smoke test successfully completed start → safe question → answer → result → duplicate retry → history, then **rolled back**.
- After the rollback, counts of items, forms, assignments, sessions, responses and results were all **zero**.
- Six static backend security regression checks passed.
- Security advisor has only intentional INFO notices about the new policy-free private tables, not new publicly executable diagnostic RPC warnings.

**Limitations of validation:** No genuine live student JWT invocation or concurrency/load test has yet been completed; server-side SQL integration tested through the managed SQL connection. No scoring calibration has been performed.

## Security notes

- The project security advisor also reported existing unrelated warnings for other public functions and leaked-password-protection settings. They were not modified in this feature branch.
- The private tables have RLS but **no authenticated policies intentionally**: browser access is denied by privileges and RLS. The trusted RPC executes as its owner, after explicit actor-role/class checks, and is itself service-role-only.
- Neither the Edge Function nor the public repo can be used to download the keyed bank; the private schema must not be exposed through Data API.
- Real response scoring is atomic with session-row locking; retries with the same request ID cannot double-score. Nevertheless, simultaneous HTTP requests and auth-session revocation need dedicated end-to-end tests before inviting students.

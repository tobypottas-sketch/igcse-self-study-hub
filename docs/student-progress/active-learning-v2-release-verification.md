# Active Learning Time V2 pilot and release verification

This checkpoint supersedes the browser and SQL design checkpoints. The two SQL candidates are historical design notes. Apply only the versioned migration to a disposable database until production approval is explicit. The browser and server gates remain off.

## Eligibility and clock

The pilot measures estimated foreground, focused practice for Vocabulary questions whose target occurrence belongs to a published Set in that same unit and pathway. Mixed Practice is covered when its question resolves to a published pathway and target. Free Practice without a resolved eligible pathway, remainder words, browser-only language-bank fallback IDs without a persisted activity, Bonus Games, Unit Checks, previews and other modules are outside this pilot. The application reads the server-held Set membership already used by Vocabulary. A failed or unavailable membership read leaves timing off without blocking practice. A publication change during a session can invalidate an already queued batch.

Elapsed time comes from a monotonic clock. Wall time locates the measured interval for reporting. A displayed eligible question allows up to 120 seconds of reading and thinking before trusted input is needed. Blur, backgrounding and page hide clear that allowance. Gaps over 30 seconds and wall-clock jumps are discarded. Question feedback can retain the original allowance. An explicit stop blocks stale question DOM. Timing measures recent browser interaction and cannot establish attention, attainment or identity beyond the authenticated account.

The user-scoped browser outbox strips response content, stores chunks of at most 120 intervals, and keeps the same batch ID on retry. Corrupt or expired batches and definitive rejections naming the batch are removed. A batch containing an expired interval is dropped as a whole to preserve its immutable identity. Other failures preserve the batch. Local storage quota, shutdown or browser eviction can still lose unpersisted intervals. The server validates the oldest interval against a 24-hour window and accepts a maximum two-second future skew. No response text, names or credentials are written to the ledger.

## Reporting and permissions

Use `active_learning_v2_segments(from, to, student)` for credited intervals. Raw ledger intervals may overlap and must never be summed. This security-invoker RPC clips half-open date bounds and subtracts earlier intervals per student before class or pathway filters. Earliest raw start wins overlapping time, with stable evidence identifiers breaking ties. Apply China-time daily or Monday-week boundaries using Asia/Shanghai, convert to UTC instants, then split segments at local day boundaries for daily reports. The RPC accepts windows up to 93 days.

Total and breakdown duration use the same disjoint segments. Class participation uses the server-assigned class and the intended enrolment scope. A range with missing membership, ambiguous overlap, or a transfer boundary retains individual credit without class attribution. Current access follows the existing teacher-to-current-student rule. A former teacher loses individual access when no longer authorised. A receiving teacher can see the current student's lifetime segments, including past attribution. This RPC is not an immutable historical class roster report. Disabled callers are excluded. Administrators retain access through the existing role helper. An intentional profile deletion cascades only the new V2 records. Existing event and merit records are untouched.

Report class averages with explicit denominators, either the authorised enrolled roster or students with credited V2 time in the selected period. Keep rounding at display time. Use an explicit coverage state for periods before activation, modules outside the pilot and failed reads. A successful empty covered period is no recorded V2 time. Legacy `activity_events.active_seconds` is separate estimated telemetry. No dashboard, mastery, XP or merit logic uses V2 time.

## Reproducing the isolated checks

- Native tests on Node 22: `node --test tests/*active-learning*.test.mjs tests/durable-timing-outbox.test.mjs tests/timing-ingestion-contract.test.mjs`.
- Native Edge type check with `@supabase/supabase-js@2.117.3` installed locally: `deno check supabase/functions/active-learning-ingest/index.ts`.
- Install `pg`, `playwright-core` and the pinned Supabase JS package in an isolated checkout. Start a **fresh disposable** loopback PostgreSQL cluster on port 55432. Set `ACTIVE_TIME_QA_PGUSER`, `ACTIVE_TIME_QA_DENO` and `ACTIVE_TIME_QA_CHROME` and run `node supabase/tests/active-learning-v2.integration.mjs`. The fixture starts Deno on port 8000 and uses synthetic users only. It executes the real persistence and reporting SQL under roles, the actual Edge entry point and SDK, and native Chromium at 1280, 820 and 390 pixels. Auth and PostgREST are represented by a local HTTP fixture. The test does not certify hosted auth or the real Vocabulary screen flow.

## Controlled pilot and coverage

The versioned migration creates an empty student UUID allowlist with explicit coverage windows. There is no automatic class enrollment. A class pilot can be configured as a reviewed roster snapshot of individual eligible UUIDs. The browser build gate remains false by default and the Edge environment gate accepts traffic only when `ACTIVE_LEARNING_V2_ENABLED=true`. When the browser build gate is on, Vocabulary checks the current authenticated student's enrollment via `active_learning_v2_pilot_enabled`. A missing or failed configuration read leaves collection off. The check runs independently of initial lesson rendering. Ingestion checks the same enrollment again before resolving catalogue content. Persistence locks the current window and requires the submitted interval to lie within it. The endpoint denies staff, inactive accounts and accounts awaiting a password change.

Closing a window denies new requests at the server. A browser already on a question stops its collector when it receives an explicit disabled or revoked response. An offline or cached page may retain queued data until it reconnects, expires the queue, or reloads. Scope the cutoff to the authoritative database clock and close the windows even if the emergency environment gate was disabled first. Keep earlier windows for reports. Add a fresh, non-overlapping window for a reactivated student. A batch that crosses a coverage boundary is rejected atomically, so reporting may undercount near a cutoff. Browser storage remains scoped to the original account and the 24-hour retention limit.

Reports read `active_learning_v2_pilot_windows` under the same student/teacher/admin scope as the ledger, then use the existing China-time period helpers and `activeLearningV2Coverage` to distinguish recorded time, full coverage with no records, no enrollment, partial coverage, before activation, outside module scope, and query failure. Clip current periods to the observation instant. Aggregate the already allocated segments for class, unit and pathway totals. A closed window represents pilot authorization history rather than guaranteed data delivery. An unplanned outage can still produce gaps and should be disclosed when interpreting reports.

## Native-stack verification

`node supabase/tests/active-learning-v2-native-stack.mjs` uses the disposable loopback PostgreSQL cluster described above. Also set `ACTIVE_TIME_QA_AUTH` to the Supabase Auth v2.199.0 executable with its bundled `migrations` folder beside it, and `ACTIVE_TIME_QA_POSTGREST` to PostgREST v14.1. Use separate fresh clusters for each test invocation. Native Auth migrations, repository foundation and Vocabulary migrations, published Set table DDL, and the V2 migration run in real PostgreSQL. The harness seeds Unit 2 from the public curriculum export and computes its published Set membership. No real student data is involved.

The harness verifies real password authentication, a signed expired token, pilot enrollment and revocation, and denial for uncovered, inactive, reset-required, teacher and administrator accounts. It exercises all six real Vocabulary Recognise flows at representative Chromium widths, including choice selection, feedback, exit, native ingestion and reporting attribution. Auth, catalogue, Set membership, Edge code, PostgREST and the ledger are genuine. The loopback HTTP router is test infrastructure. Legacy mission issuance, attempt writes, NGSL completion and rewards are fixture responses. This does not verify managed Supabase gateway configuration or Microsoft OAuth. The independent timing fixture still covers exact five-second assertions, offline recovery and SQL concurrency.

Classroom batches of 20, 50 and 100 distinct synthetic authenticated students succeeded on the loopback stack. Each submitted one interval. This exercises end-to-end burst concurrency and account overhead. It leaves large batches, prolonged classroom traffic and managed capacity unmeasured. Monitor counts by response class, ingest p95, accepted intervals, request volume per pilot, and repeated catalogue/persistence failures. Exclude bearer headers, payloads, responses, raw student IDs and identity data from monitoring. A managed JWT configuration check and tested request-rate limits remain prerequisites. The endpoint's 128 KiB and 120-interval bounds limit individual requests. They do not establish a safe request rate.

For an empty staging project, use the [isolated staging workflow](isolated-staging.md), including its fresh-database prerequisite and separate frontend build.

## Release and rollback checklist

Execute these stages only after explicit production approval.

1. Fetch current main and the approved feature SHA, reconcile any concurrent changes, rerun the native tests and compare existing regressions against main. Confirm both activation gates are off.
2. On staging, verify PostgreSQL compatibility, actual schema and RLS, managed gateway JWT mode, function grants, and existing password and Microsoft access. With an approved test account, sign in through Microsoft on staging and confirm its authentic Supabase session works against the Edge Function and credits only that account. Preserve production Entra settings.
3. Apply `20261128090000_active_learning_time_v2.sql` once. Verify no enrollment rows exist, service-only writes, scoped reads and no change to existing data.
4. Deploy `active-learning-ingest` with `ACTIVE_LEARNING_V2_ENABLED` unset or false. Verify a signed synthetic staging request returns `tracking_disabled` and writes nothing.
5. Publish the Hub with `VOCABULARY_ACTIVE_TIME_V2_ENABLED=false`. Verify ordinary student and teacher access, Vocabulary practice and existing records.
6. Prepare the explicitly approved UUID list in staging and verify approved and unapproved accounts, final all-pathway activity/lifecycle tests and operational request limits. On production, insert approved student coverage windows at the planned start instant. Verify the roster and coverage bounds before activating either gate.
7. Enable the Edge environment gate, verify a recently authorized account can submit and a known uncovered test account is denied, and publish a separately approved browser build with its gate true. Monitor the first session against known start and stop times. Pause expansion on unexpected authorization, duplicate or timing results.
8. For emergency disable, switch off Edge ingestion first, then close all affected open windows at the cutoff and verify no new accepted batches. Restore the browser build with its gate off. Preserve legacy history, pilot windows, manifests and interval rows. Roll back code without dropping database objects or deleting evidence.

## Broader regression comparison

The same 410-test selection at main `602a6c2d1b3aa3dcfe41c87b4b1b6a610078d9b8` and this PR returned 391 passed, 16 failed, two cancelled and one skipped on each checkout. The complete set of unsuccessful case names matched.

| Area | Reproduced on both branches | Pilot impact |
| --- | --- | --- |
| Merit import | `vocabulary-merits.test.js` imports the missing `countPassedStages` export. | Stale test coverage. The active merit alert and class-threshold tests ran separately in the regression selection. |
| Pathway presentation | Status-chip desktop and tablet cases time out waiting for a unit card. The file also reports a timeout. The final-polish file and card-content ownership assertion fail. | The existing fixtures and presentation checks leave gaps in broad browser coverage. The native-stack exercise opens and credits the real Unit 2 cards. |
| Pathway readiness | The half-built unit lock and teacher readiness visibility assertions fail. | Existing readiness expectations remain unresolved. Pilot collection still requires published Set membership. |
| Shop presentation | Afterlight and Blockverse fail at desktop and mobile. Avatar shop fails at desktop and tablet and reports an additional file timeout. Compact identity fails at all three widths. | Existing cosmetics test failures. The pilot leaves reward and equipment logic unchanged. |

## Final local results

- Node 22.23.5: 55 V2 tests and 83 focused existing regression tests passed. Deno checked the Edge entry point successfully.
- Chromium on the native stack: Unit 2 Recognise passed for Meaning and Paraphrasing at 1280 px, Context and Precision & Use at 820 px, and Word Families and Spelling & Recall at 390 px. Context matching at 1280 px and typed Spelling & Recall at 820 px also passed. All eight runs verified authenticated reporting attribution and used real Chrome input. Drag and drop, recovery stages, and completion through the real mission/attempt APIs remain unverified.
- An additional older browser subset produced seven failures and three cancellations on the feature checkout, including waits for the unit card. That subset was separate from the completed 410-case branch comparison.
- Final native loopback burst results: 20/20, 50/50 and 100/100 successful. Wall times were 158 ms, 406 ms and 857 ms, with per-request p95 of 155 ms, 401 ms and 839 ms. The test measured end-to-end response latency, with no separate production or large-history query benchmark.
- Remaining release verification includes managed gateway behavior, a genuine Microsoft OAuth session for an approved staging account, extended browser lifecycle and activity coverage, and operational throttling/monitoring. Use an actual non-production Microsoft session for that test and verify the signed account UUID, an allowed timing request, and its credited segment. Never supply a real student's credentials.

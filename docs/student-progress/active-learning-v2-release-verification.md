# Active Learning Time V2 pilot and release verification

This checkpoint supersedes the browser and SQL design checkpoints. The two SQL candidates are historical design notes. Apply only the versioned migration to a disposable database until production approval is explicit. The browser and server gates remain off.

## Eligibility and clock

The pilot measures estimated foreground, focused practice for Vocabulary questions whose target occurrence belongs to a published Set in that same unit and pathway. Mixed Practice is covered when its question resolves to a published pathway and target. Free Practice without a resolved eligible pathway, remainder words, Bonus Games, Unit Checks, previews and other modules are outside this pilot. The application reads the server-held Set membership already used by Vocabulary. A failed or unavailable membership read leaves timing off without blocking practice. A publication change during a session can invalidate an already queued batch.

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

## Release and rollback

Before release, run the migration on the target PostgreSQL major version and verify the actual Supabase Auth, gateway and PostgREST stack with disposable credentials. Exercise all six pathways and their supported content types in the actual Vocabulary app. Include real tab focus and back/forward cache, account switch, expired login, concurrent sessions and device sleep. Verify operational request limits, gateway JWT compatibility, retention and monitoring before enabling ingestion. Those checks remain activation prerequisites.

With approval, deploy in order: provision the versioned migration, deploy Edge with ingestion off, publish the browser with timing off, and verify existing flows. Enable server and browser only for an approved pilot. For rollback, disable server ingestion first and restore a browser build with its gate off. Leave the ledger and collected evidence intact for review. An emergency disable requires no deletion or database rollback.

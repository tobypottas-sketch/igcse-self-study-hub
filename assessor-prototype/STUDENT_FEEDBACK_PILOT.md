# Student writing feedback: controlled pilot runbook

Status: built and tested on branch `claude/student-writing-feedback`. NOT merged, NOT deployed, migration NOT executed, no live AI run.

## What it is
- Worker route `POST /feedback` (separate from the teacher route `/assess`, which is unchanged). Active students only.
- Returns only verified strengths, verified corrections, one writing target and a neutral length note. Marks, reasons and teacher-only data are removed on the server.
- Quota in Supabase (counts and timestamps only): 3 per student per UTC day, 60 s between requests, 1 at a time, 20 per day for all students. Teachers are not counted. Only the Worker can reserve, finish or refund (shared secret checked inside the database functions; no service-role key; direct calls from a student browser are refused).
- Shared front end: `src/assessor/student-feedback.js` (+ `progress.js`, `student-client.js`). Apps need a small adapter (`writing-app-adapters.js`, `email-feedback.js`, `review-feedback.js`).

## Minimum steps for a controlled pilot (each needs separate approval)
1. School approves the privacy notice wording (`src/assessor/student-privacy-notice.js`) and student use of Cloudflare Workers AI.
2. Review and run `supabase/migrations/20261107150000_student_feedback_quota.sql` (feature is OFF by default: `mode = 'off'`, and every call is refused until a Worker secret hash is installed).
   Then install the Worker secret (runbook at the end of the migration): generate a random secret on your computer, store only its SHA-256 hash in `private.feedback_worker_secret`, and add the secret as the encrypted Cloudflare Worker secret `FEEDBACK_QUOTA_SECRET` (a Cloudflare change that needs its own approval, done with the Worker version in step 4). Without it the Worker answers `quota_unavailable` and makes no AI call. Rotate by repeating with a new secret.
3. Merge the branch (Hub pages go live; students see nothing useful while mode is off, and the Worker route does not exist yet).
4. Build the Worker bundle (`npx esbuild@0.28.2 assessor-prototype/worker.js --bundle --format=esm`), save it as a new undeployed version of `igcse-writing-assessor`, verify SHA-256/bindings/logging, promote.
5. Staging evaluation first (staging Worker + staging Supabase or a test student): a handful of live calls, check feedback quality and the message for each limit.
6. Pilot: `update private.feedback_settings set mode = 'pilot';` then add a few students to `private.feedback_pilot_students`.
7. Widen: `mode = 'on'`. Switch off instantly: `mode = 'off'`.

## Capacity warning
Cloudflare Workers Free allows 10,000 neurons per day for the whole account, shared with the teacher assessor. One assessment is roughly 300 to 450 neurons (estimate), so 20 student requests can use most of the allowance. Watch real usage in the first days and lower `global_daily_limit` if teachers are being starved.

## Release order (each step needs approval)
migration in mode off → merge → Worker saved as undeployed version and verified → promote → staging test with pilot accounts → pilot → widen.

## Rollback
`update private.feedback_settings set mode = 'off';` stops all student use at once. To remove the Worker route, promote the previous Worker version.

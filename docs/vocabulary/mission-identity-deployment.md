# Vocabulary mission identity: safe deployment order

Applies to branch `feat/wire-mission-identity`. Migrations are run by hand (SQL editor); nothing here runs automatically.

## Why the order matters (proved on a throwaway local Postgres 16 and by reading the code)
- The currently-live client **never sent mission fields** (`submitVocabularyAttempt` on `main` has no `missionId`), so it never creates or records missions. It is therefore unaffected by both migrations.
- Migration `20261024120000` is **additive** (new table, new RPC, new nullable column, two triggers). It does not require a start row: a mission recorded with a client-minted id still records and gets a server-derived outcome (checked).
- The new app calls `start_vocabulary_mission` (created by `20261024120000`). **App before the migration = students cannot start a pathway or Mixed mission.** This is the one order that breaks live practice.
- Migration `20261024140000` makes recording require a server-issued open start row. Applied before the new app exists it is harmless to old clients (they record no missions) but it protects nothing until the new app is live; applied after, it is the intended lock.
- The new Edge Function only queries `vocabulary_mission_starts` when an attempt names a mission, which only the new app does.

## SAFE DEPLOYMENT ORDER
| # | Step | Why it is safe | Verify before moving on | Stop / rollback |
|---|------|----------------|--------------------------|-----------------|
| 0 | Confirm `20261023120000_vocabulary_missions.sql` is already applied (it is a prerequisite and `record_vocabulary_mission` must exist). | Read-only. | `select to_regprocedure('public.record_vocabulary_mission(uuid)');` returns a value. | If null: stop and apply it first. |
| 1 | Run `20261024120000_vocabulary_mission_identity.sql`. | Additive and idempotent; old client unaffected; an old-style mission still records. | Run `tests/db/verify-mission-deployment.sql`: checks 1-4 true, `missions_without_outcome` 0. Live practice still works for a test student. | Nothing to undo for clients. Optional full rollback: `drop trigger vocabulary_missions_derive_outcome/close_start`, `drop function public.start_vocabulary_mission`, drop table `vocabulary_mission_starts` (no data depends on it yet). |
| 2 | Deploy the Edge Function `vocabulary-attempt-action`. | Old client sends no mission id, so the new check is skipped for it. Needs step 1 only for attempts that name a mission. | Old-style attempt (no mission) still saves. | Redeploy the previous function version. |
| 3 | Merge `feat/wire-mission-identity` (GitHub Pages deploys the app). | Needs steps 1 and 2. A mission start that fails shows a retry message and creates nothing. | Smoke checks A below. | Revert the merge commit; the old app works with migrations 1200 and with the new Edge Function. |
| 4 | Run `20261024140000_vocabulary_mission_enforcement.sql`. | Every mission the live app now records has a start row, so nothing legitimate is refused. Idempotent. | Smoke checks B below; `verify-mission-deployment.sql` ALL true. | Re-create the previous `private.vocabulary_mission_derive_outcome()` body (the version in 1200, section 3) and the previous `start_vocabulary_mission` (1200, section 2). The Edge Function check stays in force independently. |

## Hazards
- **Never re-run `20261024120000` after `20261024140000`.** It redefines the same two functions and silently removes enforcement and the stale-mission rule. If it happens, re-run `20261024140000`; `verify-mission-deployment.sql` shows `enforcement_installed = false`.
- Rows existing at step 1: `outcome` is back-filled from `score`; the new table starts empty. No constraint can reject existing rows (all new constraints are on the new table or are nullable).
- Two tabs of one student share the open mission (same id and seed). Both could answer the same questions; the server counts one finishing event per target, so the score is not inflated, but an inflated attempt count (more than 40 events) makes that mission unrecordable (no credit, no corruption). The student is then never trapped: a finished-but-unsettled mission is settled once and replaced on the next start.

## Post-deploy smoke checks
A (after step 3, before step 4), with a test student:
1. Start a pathway mission: network shows `start_vocabulary_mission` returning a `mission_id` and `mission_seed`.
2. Answer 2 questions, refresh: the same mission and the next question resume.
3. Finish all 10: results screen; a `vocabulary_missions` row exists, its `outcome` is derived (>=8 pass, 6-7 consolidate, else recovery), and the start row is `completed`.
4. Press Continue: a new `mission_id` and `mission_seed`; the question set differs from the previous mission.
5. Timed practice and short sessions still work and send no mission id.

B (after step 4):
1. Repeat A3 and A4 (still records).
2. In the SQL editor, `select public.record_vocabulary_mission(gen_random_uuid());` as a student fails with "No attempts were found" or "Mission was not issued by the server".
3. Start a mission, then in the SQL editor set its `vocabulary_mission_starts.status` to `'abandoned'`. Answer the next question: it is saved as ordinary practice (no error shown, no mission credit) and the next Start issues a new mission.

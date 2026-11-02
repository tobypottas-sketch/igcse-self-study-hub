# eh-summary deployment runbook

`eh-summary` is a server-to-server Edge Function. The Evidence Hub (EH) backend sends Vocabulary Hub profile ids (already linked by `eh-match`) and receives a **narrow, aggregate** Vocabulary evidence summary per active student: completed unit/pathway pairs, Unit Check attempts (unit, attempt number, score, max, date), merit count and latest award date, and compact engagement dates. It never returns emails, display names, answers, per-word data, form ids, `awarded_by`, event payloads or Set counts.

Merging the code does **not** deploy it. Nothing in this repo deploys Supabase functions automatically. **This runbook is not executed by the H4 change; deployment is a separate, explicit step.**

## 0. Before the first deployment

- **Runtime check (done in H4, repeat after any change to `_shared/eh-service-auth.js`).** `tests/eh-summary-loader.test.js` runs the shared auth and the handler under a real Deno runtime when `deno` is on the PATH (or `DENO_BIN` points at it): `DENO_BIN=$(which deno) node --test tests/eh-summary-loader.test.js`. `deno check supabase/functions/eh-summary/index.ts` (add `--node-modules-dir=none` in this repo) must also pass.
- Smoke-check `_shared` bundling on the first deploy: the function imports `../_shared/vocabulary-pathway-contract.js`, `../_shared/vocabulary-pathway-sets.js` and `../_shared/eh-service-auth.js`. If the deploy reports a missing import, stop and report it; do not copy files around.

## 1. Secret

Reuse the secret already set for `eh-match`: `EH_SERVICE_KEY` (Supabase Function secrets, project `grjshlamooglytsajoun`) and `HUB_SERVICE_KEY` (EH server). Both functions share one trust boundary (the EH server). The function refuses a secret shorter than 32 characters (503). Keep the value out of chat, commits and PR text.

## 2. Deploy with gateway JWT verification OFF

```
supabase functions deploy eh-summary --no-verify-jwt --project-ref grjshlamooglytsajoun
```

Authentication is the shared secret, not a user JWT. If the function is redeployed without the flag the gateway rejects EH's calls: the failure is closed, not open.

## 3. Smoke checks (send no real student data)

Replace `<FUNCTION_URL>` with the function URL from the dashboard. Use a made-up id, never a real student id.

```
curl -s -o /dev/null -w "%{http_code}\n" -X POST "<FUNCTION_URL>" -H "content-type: application/json" -d '{"action":"summary","schemaVersion":1,"students":["00000000-0000-4000-8000-000000000000"]}'
# expect 401  (no key)
curl -s -o /dev/null -w "%{http_code}\n" -X POST "<FUNCTION_URL>" -H "x-eh-service-key: not-the-key" -H "content-type: application/json" -d '{"action":"summary","schemaVersion":1,"students":["00000000-0000-4000-8000-000000000000"]}'
# expect 401  (wrong key)
```

With the real key (from your shell environment, never pasted into chat) the made-up id must answer `200` with `results:[{"hubStudentId":"00000000-0000-4000-8000-000000000000","status":"not_found"}]`. A 503 means the secret is missing or short, or the database read failed.

## 4. What the function reads (service role, read only)

`profiles(id, role, active)`; `vocabulary_pathway_sets(student_id, unit_number, pathway_id, set_number, stage, phase, status, updated_at)`; `vocabulary_unit_check_attempts(student_id, unit_number, attempt_number, score, max_score, completed_at)`; `vocabulary_merit_awards(student_id, awarded_at)`; `activity_events(id, user_id, event_type, occurred_at, metadata->>pathway_id)` where `app_key='vocabulary_paraphrase'`, `event_type='exercise_result'`, pathway id present, and `occurred_at >= since`; `vocabulary_set_members(unit_number, pathway_id, set_number, position, occurrence_id)` and `vocabulary_unit_occurrences(occurrence_id, unit_number, position_in_unit, status, active)` restricted to `status='live'` and `active=true`, only for the units the requested active students have Set rows in. No migration is needed.

EH must send `since` at least 56 days before today (an Asia/Shanghai date) to receive the 8-week engagement counts; without it those counts are omitted.

## 5. Rotation and rollback

- **Rotate:** set a new secret in both places (this also rotates `eh-match`), restart EH.
- **Cut access immediately:** delete `EH_SERVICE_KEY` (the function answers 503) or undeploy `eh-summary`.
- **Disable in EH:** leave the EH summary URL unset (added in H5); EH then shows no Vocabulary evidence.

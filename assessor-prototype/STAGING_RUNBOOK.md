# Staging runbook — teacher assessor Worker (nothing here deploys by itself)

Worker `igcse-writing-assessor`. **Production version `d99b6b8e-1b7a-4eed-8499-8f596c3ebcb9`** must stay 100 % live and untouched until a *separately approved* promotion. **Never inherit from the staged version `c04dfeac-9c33-4019-9534-a261f4db591d`** (temporary testing key).

Run these yourself in your own terminal. Never paste tokens or keys into chat, screenshots, files or command arguments; use `read -rs` as shown. Steps A–F create/read only; Step G (promotion) needs explicit approval.

```sh
export CF_ACCOUNT_ID=<your Cloudflare account id>           # not secret
read -rs CF_API_TOKEN && export CF_API_TOKEN                # Workers Scripts: Edit (A: Read is enough)
W=igcse-writing-assessor; PROD=d99b6b8e-1b7a-4eed-8499-8f596c3ebcb9
API=https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID
UA='IGCSE-Assessor-TeacherTest/1.0'   # avoids Cloudflare error 1010
```

## Known uncertainty (read first)
Cloudflare's documentation for the **beta** version-upload endpoint does not describe `inherit` bindings with an explicit `version_id`. An open Cloudflare issue (cloudflare/api-schemas #50, Oct 2026) reports HTTP 400 / code 10057 for that pattern on the sibling script-versions endpoint. So **Step C may be rejected**. If it is: **stop** — do not retry with `latest`, do not re-enter or replace secrets, do not promote. Use a fallback only after approval (end of this file). Step E tests the *outcome* (which key the staged version accepts), so correctness does not rely on the API doing what we expect.

## A. Read-only snapshot — confirm production is exactly d99b6b8e at 100 %
```sh
curl -sS -H "Authorization: Bearer $CF_API_TOKEN" $API/workers/scripts/$W/deployments | jq '.result.deployments[0]' > dep.json
curl -sS -H "Authorization: Bearer $CF_API_TOKEN" $API/workers/scripts/$W/versions/$PROD | jq '.result' > ver.json
jq '.versions' dep.json        # EXPECT: one entry, version_id = d99b6b8e…, percentage 100. Anything else → STOP.
jq '[.resources.bindings[]|[.name,.type]]' ver.json   # EXPECT exactly AI/ai and ASSESSMENT_TEST_KEY/secret_text. Secret VALUES are never returned.
```

## B. Build the request offline (sends nothing)
`snapshot.json` = `{accountId, workerName, activeDeployment, expectedActiveVersion, activeVersion, configuration}`:
```sh
jq -n --arg a "$CF_ACCOUNT_ID" --arg w "$W" --arg p "$PROD" --slurpfile d dep.json --slurpfile v ver.json '{
  accountId:$a, workerName:$w, expectedActiveVersion:$p, activeDeployment:$d[0], activeVersion:$v[0],
  configuration:{ hubOrigin:"https://tobypottas-sketch.github.io",
                  supabaseUrl:"https://grjshlamooglytsajoun.supabase.co",
                  publishableKey:"<copy SUPABASE_PUBLISHABLE_KEY from src/config.js — public, never an sb_secret_ key>" } }' > snapshot.json
node assessor-prototype/deployment-plan.mjs snapshot.json > plan.json     # refuses on any mismatch (fail closed)
jq '.body.bindings' plan.json
```
Review `bindings`: `AI` (ai); `ASSESSMENT_TEST_KEY` = `inherit` with `version_id` **d99b6b8e…** (not `latest`, not c04dfeac…); `HUB_ORIGIN`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` as plain text. `HUB_ORIGIN` must be the bare origin (no path, no trailing slash). If the planner throws because the API response shapes differ from what it expects, fix the snapshot — do not bypass the checks.

## C. Upload the version (does not change traffic — verified in D)
```sh
jq '.body' plan.json > body.json
curl -sS -X POST -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" --data @body.json "$(jq -r .url plan.json)" | jq '{success, errors, id:.result.id}'
```
Record the new version id as `NEW`. Any error (especially 400/10057) → STOP (see "Known uncertainty").

## D. Traffic must not have moved
```sh
curl -sS -H "Authorization: Bearer $CF_API_TOKEN" $API/workers/scripts/$W/deployments | jq '.result.deployments[0].versions'
```
EXPECT unchanged: `d99b6b8e…` at 100 %. Otherwise STOP and report.

## E. Prove which secret the new version holds (the decisive check)
Preview URL of the new version: dashboard → Workers & Pages → `igcse-writing-assessor` → Versions → `NEW` → Preview URL (normally `https://<first 8 chars of NEW>-igcse-writing-assessor.<subdomain>.workers.dev`). Also use this to settle blocker 1 (the real `<subdomain>`).
```sh
PREVIEW=https://<preview host>
curl -sS -A "$UA" $PREVIEW/        # EXPECT {"service":"0511 teacher assessment prototype","aiConnected":true,"studentsEnabled":false}
read -rs PROD_KEY;  curl -sS -A "$UA" -X POST -H "X-Assessment-Test-Key: $PROD_KEY" -o /dev/null -w 'production key -> %{http_code}\n' $PREVIEW/diagnose
read -rs TEMP_KEY;  curl -sS -A "$UA" -X POST -H "X-Assessment-Test-Key: $TEMP_KEY" -o /dev/null -w 'temporary key  -> %{http_code}\n' $PREVIEW/diagnose
unset PROD_KEY TEMP_KEY
```
EXPECT: production key → **not 401** (200, or 503 with a model category — either proves the key was accepted); temporary key → **401**. Any other result → the wrong secret was inherited: STOP, do not promote.
(`/diagnose` sends one fixed 20-token synthetic prompt; no writing.)

## F. Check `/assess` on the preview URL (synthetic text only; Origin must be sent explicitly outside a browser)
```sh
O=https://tobypottas-sketch.github.io
curl -sS -A "$UA" -i -X OPTIONS -H "Origin: $O" -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: authorization,content-type' $PREVIEW/assess | head -12   # 204, Allow-Origin = $O
curl -sS -A "$UA" -o /dev/null -w 'no token        -> %{http_code} (EXPECT 401)\n' -X POST -H "Origin: $O" -H 'Content-Type: application/json' --data '{}' $PREVIEW/assess
curl -sS -A "$UA" -o /dev/null -w 'wrong origin    -> %{http_code} (EXPECT 403)\n' -X POST -H 'Origin: https://evil.example' $PREVIEW/assess
```
Real sessions (tokens never leave your browser): while signed in to the Hub as (1) an active **teacher** and (2) a **student**, run in the DevTools console, changing `PREVIEW`:
```js
const {getSupabaseClient}=await import('/igcse-self-study-hub/src/supabase.js');
const {data}=await (await getSupabaseClient()).auth.getSession();
const r=await fetch('https://<preview host>/assess',{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json',Authorization:'Bearer '+data.session.access_token},
 body:JSON.stringify({taskType:'review',task:'Write a review of a fictional science museum for your school magazine. Describe it and recommend a visit.',response:'The museum was fascinating because the interactive exhibits made science easy to understand. I recommend visiting with friends.',privacyConfirmed:true})});
console.log(r.status,(await r.json()).error??'ok');
```
EXPECT teacher → `200 ok` (two AI calls, ~15 s); student → `403 active_staff_required`. A teacher 403/503 `staff_verification_unavailable` means the profile read failed — report before anything else. Use only synthetic text; delete the console history afterwards.

## Logging checks (do before Step F's real-session call; **do not change settings without approval**)
Workers Logs are **on by default for newly created Workers**. In the dashboard open Worker → Observability / Settings and record: Workers Logs (on/off, invocation logs, sampling), Traces, Logpush destinations, Tail Workers. Also AI → AI Gateway: list any gateway and its Logs setting. The Worker's code makes no `console` calls, passes no AI Gateway option, and handles every error itself, so it never writes submission text or model output to any log; what remains is Cloudflare's own metadata (URL path, method, status, timing, IP/country) when Workers Logs/Logpush are on. If Workers Logs or Logpush are on, decide (and tell me) whether to turn them off before real use — that is your change to approve.

## G. Promotion — separate explicit approval required
Only after A–F pass **and** the logging and calibration decisions are made. Promotion = a deployment sending 100 % to `NEW`. **Rollback** = redeploy `d99b6b8e-1b7a-4eed-8499-8f596c3ebcb9` at 100 %. Merge the Hub PR only **after** the Worker is live, otherwise teachers see a button for a route that does not exist yet.

## Fallbacks if Step C is rejected or Step E shows the wrong key (each needs approval)
1. **Drop the legacy secret from the staged version.** `/assess` never uses `ASSESSMENT_TEST_KEY`; without it `/teacher-test` and `/diagnose` fail closed (401). Nothing is copied or replaced; `d99b6b8e` keeps the production key for rollback.
2. **Fresh key.** Create the new key yourself and set it on the staged version only (`wrangler versions secret put ASSESSMENT_TEST_KEY`, typing the value at the prompt). The earlier key was exposed in chat/screenshots, so rotation is already recommended.

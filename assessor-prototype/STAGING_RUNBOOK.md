# Staging runbook — teacher assessor Worker (nothing here deploys by itself)

Worker `igcse-writing-assessor`. **Production version `d99b6b8e-1b7a-4eed-8499-8f596c3ebcb9`** stays 100 % live and untouched until a *separately approved* promotion. **Never inherit from the staged version `c04dfeac-9c33-4019-9534-a261f4db591d`** (temporary testing key).

Run these in your own terminal. Never paste tokens or keys into chat, screenshots, files or command arguments; use `read -rs` as shown. Steps A–F only read, or create an **undeployed** version. Step G (promotion) needs explicit approval.

## Findings recorded (confirmed by Toby in the Cloudflare dashboard, 6 Nov 2026)
- Production hostname: `igcse-writing-assessor.toby-pottas.workers.dev` (matches `src/assessor/client.js`).
- Workers Logs: production **OFF**, preview **OFF**. Traces and Issues **OFF**. No export (Logpush) destinations. No Tail Workers. Cache disabled.
- Not yet checked: AI → AI Gateway (list of gateways and their Logs setting). The Worker passes no gateway option, so none should be in the path.
- Profile read by an authenticated teacher: supported by the committed RLS policy (`profiles_select`: own row, or admin/teacher) and by the Hub's own login read; confirmed live in Step F.

## Recommended path: stage with NO secret (`--legacy-key=omit`)
`/assess` never uses `ASSESSMENT_TEST_KEY` (it authenticates with the caller's Supabase session). The only routes that use it are the legacy fictional-sample `/teacher-test` and `/diagnose`. Staging with no secret binding means **nothing is inherited, copied or replaced**: no dependence on Cloudflare's undocumented behaviour for `inherit` + `version_id` (an open Cloudflare issue, cloudflare/api-schemas #50, reports HTTP 400 / code 10057 for that pattern on a sibling endpoint), no chance of picking up the temporary key, and `d99b6b8e…` keeps the production secret for rollback. Cost: on the new version the legacy routes answer 401. If you later want them back, add a key as a separate approved step.

```sh
export CF_ACCOUNT_ID=<your Cloudflare account id>           # not secret
read -rs CF_API_TOKEN && export CF_API_TOKEN                # short-lived token: Workers Scripts: Edit; revoke it after Step D/F
W=igcse-writing-assessor; PROD=d99b6b8e-1b7a-4eed-8499-8f596c3ebcb9
API=https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID
UA='IGCSE-Assessor-TeacherTest/1.0'   # avoids Cloudflare error 1010
```

### A. Read-only snapshot — production is exactly d99b6b8e at 100 %
```sh
curl -sS -H "Authorization: Bearer $CF_API_TOKEN" $API/workers/scripts/$W/deployments | jq '.result.deployments[0]' > dep.json
curl -sS -H "Authorization: Bearer $CF_API_TOKEN" $API/workers/scripts/$W/versions/$PROD | jq '.result' > ver.json
jq '.versions' dep.json                                # EXPECT one entry: d99b6b8e…, percentage 100. Anything else → STOP.
jq '[.resources.bindings[]|[.name,.type]]' ver.json    # EXPECT AI/ai and ASSESSMENT_TEST_KEY/secret_text. Secret VALUES are never returned.
```

### B. Build the request offline (sends nothing)
```sh
jq -n --arg a "$CF_ACCOUNT_ID" --arg w "$W" --arg p "$PROD" --slurpfile d dep.json --slurpfile v ver.json '{
  accountId:$a, workerName:$w, expectedActiveVersion:$p, activeDeployment:$d[0], activeVersion:$v[0],
  configuration:{ hubOrigin:"https://tobypottas-sketch.github.io",
                  supabaseUrl:"https://grjshlamooglytsajoun.supabase.co",
                  publishableKey:"<copy SUPABASE_PUBLISHABLE_KEY from src/config.js — public; never an sb_secret_ key>" } }' > snapshot.json
node assessor-prototype/deployment-plan.mjs snapshot.json --legacy-key=omit > plan.json   # refuses on any mismatch (fail closed)
jq '.body.bindings' plan.json
```
EXPECT exactly four bindings and nothing else: `AI` (ai), and plain-text `HUB_ORIGIN`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`. No `inherit`, no `version_id`, no `secret_text`, no `latest`. `HUB_ORIGIN` is the bare origin (no path, no trailing slash). If the planner throws because the API responses differ from what it expects, fix the snapshot — never bypass its checks.

### C. Upload the version (does not change traffic — verified in D)
```sh
jq '.body' plan.json > body.json
curl -sS -X POST -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" --data @body.json "$(jq -r .url plan.json)" | jq '{success, errors, id:.result.id}'
```
Record the new version id as `NEW`. Any error → STOP and report it; do not retry with different options.

### D. Traffic and logging must not have moved
```sh
curl -sS -H "Authorization: Bearer $CF_API_TOKEN" $API/workers/scripts/$W/deployments | jq '.result.deployments[0].versions'
```
EXPECT unchanged: `d99b6b8e…` at 100 %. Then re-open the dashboard Observability page and confirm Production and Preview Logs, Traces and Issues are **still OFF** (an upload must not have re-enabled them). Any change → STOP.

### E. Preview URL checks — no keys needed
Preview URL of `NEW`: `https://<first 8 chars of NEW>-igcse-writing-assessor.toby-pottas.workers.dev` (also shown in the dashboard under Versions).
```sh
PREVIEW=https://<preview host>
curl -sS -A "$UA" $PREVIEW/        # EXPECT {"service":"0511 teacher assessment prototype","aiConnected":true,"studentsEnabled":false}
curl -sS -A "$UA" -o /dev/null -w 'legacy route, any key -> %{http_code} (EXPECT 401: no secret exists on this version)\n' -X POST -H 'X-Assessment-Test-Key: not-a-real-key' $PREVIEW/diagnose
```

### F. `/assess` checks (synthetic text only; outside a browser the Origin header must be sent explicitly)
```sh
O=https://tobypottas-sketch.github.io
curl -sS -A "$UA" -i -X OPTIONS -H "Origin: $O" -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: authorization,content-type' $PREVIEW/assess | head -12   # 204, Allow-Origin = $O
curl -sS -A "$UA" -o /dev/null -w 'no token     -> %{http_code} (EXPECT 401)\n' -X POST -H "Origin: $O" -H 'Content-Type: application/json' --data '{}' $PREVIEW/assess
curl -sS -A "$UA" -o /dev/null -w 'wrong origin -> %{http_code} (EXPECT 403)\n' -X POST -H 'Origin: https://evil.example' $PREVIEW/assess
```
Real sessions (tokens never leave your browser). On the live Hub page, signed in as (1) an active **teacher**, then (2) a **student**, run in the DevTools console after replacing the host:
```js
const {getSupabaseClient}=await import('/igcse-self-study-hub/src/supabase.js');
const {data}=await (await getSupabaseClient()).auth.getSession();
const r=await fetch('https://<preview host>/assess',{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json',Authorization:'Bearer '+data.session.access_token},
 body:JSON.stringify({taskType:'review',task:'Write a review of a fictional science museum for your school magazine. Describe it and recommend a visit.',response:'The museum was fascinating because the interactive exhibits made science easy to understand. I recommend visiting with friends.',privacyConfirmed:true})});
console.log(r.status,(await r.json()).error??'ok');
```
EXPECT teacher → `200 ok` (two AI calls, ~15 s); student → `403 active_staff_required`. Teacher 403 or 503 `staff_verification_unavailable` means the profile read failed — report before anything else. Use only the synthetic text above; clear the console afterwards.

### G. Promotion — separate explicit approval required
Only after A–F pass and you have decided about AI Gateway (above) and calibration. Promotion sends 100 % of traffic to `NEW`; it also closes the legacy `/teacher-test` and `/diagnose` routes in production. **Rollback** = redeploy `d99b6b8e-1b7a-4eed-8499-8f596c3ebcb9` at 100 %. Merge the Hub PR only **after** the Worker is live, otherwise teachers see a button for a route that does not exist yet.

## Alternative: keep the legacy routes working (`inherit` mode — optional, riskier)
Use `node assessor-prototype/deployment-plan.mjs snapshot.json > plan.json` (default mode: `ASSESSMENT_TEST_KEY` is an explicit `inherit` of `version_id` d99b6b8e…). Cloudflare does not document this for the endpoint used, so Step C may be rejected — then stop. Replace Step E with an outcome test (`read -rs` each key, never echo): `POST $PREVIEW/diagnose` with the production key must **not** be 401, with the temporary key it must be **401**; anything else means the wrong secret was inherited — do not promote.

## If a fresh key is wanted later (approval required)
The earlier test key was exposed in chat/screenshots, so rotating it is recommended anyway. Create the new key yourself and set it on the staged version only (`wrangler versions secret put ASSESSMENT_TEST_KEY`, typing the value at the prompt). Avoid `wrangler versions upload` for this release: I could not verify which version it takes existing secrets from, and the *latest* version here is the staged `c04dfeac…` with the temporary key.

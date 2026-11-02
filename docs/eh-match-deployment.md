# eh-match deployment runbook

`eh-match` is a server-to-server Edge Function. The Evidence Hub (EH) backend sends canonical student numbers and receives candidate `{profileId, displayName}` pairs for **active student** profiles only. It never returns emails, roles or learning data and logs nothing.

Merging the code does **not** deploy it. Nothing in this repo deploys Supabase functions automatically.

## 1. Create the shared secret

Generate a value of at least 32 characters (the function refuses anything shorter):

```
openssl rand -hex 32
```

Keep it out of chat, commits and PR text. It is stored in exactly two places:

| place | name |
|---|---|
| Supabase Function secrets (project `grjshlamooglytsajoun`) | `EH_SERVICE_KEY` |
| EH server environment | `HUB_SERVICE_KEY` (same value) |

Set the Supabase side with the CLI (`supabase secrets set EH_SERVICE_KEY=<value> --project-ref grjshlamooglytsajoun`) or in the dashboard under Edge Functions → Secrets. Confirm the exact command against current Supabase docs when you run it.

## 2. Deploy with gateway JWT verification OFF

The function authenticates with the shared secret, not a user JWT, so the Supabase gateway must not require one:

```
supabase functions deploy eh-match --no-verify-jwt --project-ref grjshlamooglytsajoun
```

(Dashboard alternative: open the function's settings and turn **Verify JWT** off.) If the function is ever redeployed without this flag the gateway rejects EH's calls: the failure is closed, not open.

## 3. Smoke checks (send no real data)

Replace `<FUNCTION_URL>` with the function URL from the dashboard.

```
curl -s -o /dev/null -w "%{http_code}\n" -X POST "<FUNCTION_URL>" -H "content-type: application/json" -d '{"action":"match","numbers":["123456"]}'
# expect 401  (no key)
curl -s -o /dev/null -w "%{http_code}\n" -X POST "<FUNCTION_URL>" -H "x-eh-service-key: not-the-key" -H "content-type: application/json" -d '{"action":"match","numbers":["123456"]}'
# expect 401  (wrong key)
```

A 503 means the secret is missing or shorter than 32 characters.

## 4. Connect EH

In the EH server environment set `HUB_MATCH_URL=<FUNCTION_URL>` and `HUB_SERVICE_KEY=<same secret>`, then restart EH. With either blank the Vocabulary Hub links panel stays hidden.

## 5. Rotation and rollback

- **Rotate:** set a new secret in both places, restart EH.
- **Cut access immediately:** delete `EH_SERVICE_KEY` (function answers 503) or undeploy the function.
- **Disable the feature in EH:** blank `HUB_MATCH_URL` or `HUB_SERVICE_KEY`; stored links stay in place and are inert.

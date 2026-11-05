# Teacher writing assessor

Approved approach: direct Worker connection; proceed without further design questions.

The Hub staff area opens an in-memory assessment form. Teachers/admins choose an
informal email, article, report, essay or review task (original practice examples,
or their own task), paste anonymised writing, acknowledge the privacy instruction
and request an experimental Content /6 and Language /9 estimate.

The browser uses its existing Supabase access token, never a Cloudflare key. The
Worker verifies the token through Supabase Auth and reads only that caller's
current `profiles.role,active,must_change_password` using the caller's RLS-scoped
token. Active, fully configured teachers/admins only. Verification fails closed.
No service-role key, new database, migration or Supabase Edge Function is needed.

One bounded request -> two sequential Llama 3.3 70B JSON-schema calls -> local
schema/range/exact-quote validation -> escaped feedback. Stage 1 extracts evidence
relative to the submitted task (no restaurant-specific assumptions). Stage 2 uses
the 0511 writing criteria: task fulfilment/development and language
range/accuracy/organisation. No automatic word-count deduction. Unsupported
claims are not evidence of missing requirements. No automatic retries.

Writing/task limits bound Free-plan consumption. Inputs/results live only in
memory/DOM; clear on leaving, logout, pagehide and reset. No analytics, storage,
request/body logging, personal fields or identifiers in assessment/AI payloads.
Teachers must remove names and identifiers; automatic anonymisation is not claimed.
Provider operational metadata/legal exceptions cannot be eliminated in app code.

Approaches considered: a Supabase proxy fits existing admin functions but adds a
hop and documented invocation body logging; the direct Worker verifies the same
staff authority without sending writing through Supabase. Browser-held shared
keys are prohibited. The direct Worker approach was selected by the user.

Existing key-protected fictional diagnostic routes stay compatible. A new
`POST /assess` accepts only staff JWTs, approved origins and validated task/text.
All content responses are no-store. Errors contain only fixed categories.

Prepare deployment metadata using the Workers API's version-specific binding
inheritance from the active production ID, never `latest`, plus AI and public
Supabase/origin configuration. Keep observability/body capture disabled before
real use; do not silently inherit staging credentials. No uploads, deployment,
secret/configuration changes, live assessments or merge in this task.

Verification: synthetic Worker auth/privacy/validation tests; real Hub routing
and browser tests; focused staff tests; full suite compared with base if needed;
local Worker build. Real staff JWT/RLS/CORS/provider inference remains a later
authorised live check. Scores require teacher calibration.

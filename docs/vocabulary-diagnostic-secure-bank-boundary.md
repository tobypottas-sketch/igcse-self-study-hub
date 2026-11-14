# Vocabulary Diagnostic — secure question-bank boundary

**Status:** design + guard rails. `supabase/diagnostic/item_lifecycle_NOT_APPLIED.sql` is **not applied** to production. Diagnostic enforcement stays **off** (`DIAGNOSTIC_BASELINE_GATE_ENABLED=false`, no gate table or triggers in production per the 14 Nov 2026 audit).

## 1. The boundary

| Zone | What may live there | What must never live there |
|---|---|---|
| **Public** — every tracked file, all Git history, GitHub Pages (serves the repo root) | Code, schema SQL, the authoring schema and validators, synthetic fixtures, aggregate reports, item IDs | Operational or candidate stems, options, answer keys, rationales tied to a key, level tags per item, literal seed SQL |
| **Private authoring workstation** — git-ignored `diagnostic-private/`, `*.diag-private.json`, `private-bank*.json`, or any folder outside the repo | Draft items as JSON matching `tools/diagnostic/item-authoring.schema.json` | Nothing is committed from here |
| **Private database** — `private.vocabulary_diagnostic_*` (RLS on, no `anon`/`authenticated` grants, `private` not exposed via the Data API) | The only copy of operational items, keys, review audit and lifecycle audit | — |
| **Delivery** — `vocabulary-diagnostic` Edge Function (JWT verified, service-role inside) | Students: one whitelisted question at a time (`private.vocabulary_diagnostic_safe_question`), never a key or result correctness. Staff: `review-detail` returns one keyed item to an authenticated active teacher/admin | Bulk export of keyed items; keys in student responses; payloads in logs |

Anything that has ever been in the public zone is **compromised** and may not be used operationally.

## 2. Roles

| Role | Can do | Mechanism |
|---|---|---|
| Item author (admin) | Import new items or new versions | `vocabulary_diagnostic_bank_admin('import')` from the Supabase SQL Editor (project-private) |
| Language reviewer (teacher/admin) | Approve/flag/reject language | Existing `review_api` (`review-decision`, stage `language`) |
| Assessment reviewer (different person) | Approve assessment quality | Existing `review_api`, independence already enforced |
| CEFR verifier | Record level-reference evidence | Existing `review_api`, stage `cefr` |
| Publisher (admin, not the language or assessment approver) | Promote to `pilot`, later `approved`; retire items and forms | `vocabulary_diagnostic_bank_admin('promote' / 'retire' / 'retire-form')` |
| Student | Answer the current question only | Existing pilot API (`start`/`respond`), form must be `pilot`, items `pilot`/`approved` |

The bank RPC is `security definer`, `search_path=''`, EXECUTE for `service_role` only and checks that the actor is an active **admin**. It is deliberately **not** wired into the public Edge Function.

## 3. Lifecycle

```text
import ──► draft ──► language_reviewed ──► assessment_reviewed ──► pilot ──► approved
             │               (existing review_api)                (bank_admin promote)
             └───────────── any state ──► retired (terminal; bank_admin retire)
```

- **Versioning:** `(item_id, version)` rows are immutable once written (stem, options, key, lemma, sense, level, family). A revision is a new import → next version, starting again at `draft`, so prior approvals never carry over. Rows are never deleted, so historical sessions and responses stay interpretable.
- **Status only moves forward;** `retired` is terminal.
- **No reuse:** import rejects a stem identical to any existing version, including retired/compromised ones.
- **Forms:** membership can change only while a form is `draft`; retired items cannot be added; a form can move to `pilot`/`approved` only if every item is `pilot`/`approved`; retired forms are terminal and cannot be deleted.
- **Retirement:** blocked while the item is in a `pilot`/`approved` form (retire the form first; blocked while sessions are open). Idempotent.
- **Audit:** every import, promotion and retirement writes an append-only row in `private.vocabulary_diagnostic_item_events` with actor and reason.

## 4. Authoring workflow (no item text ever touches Git)

1. Author items in `diagnostic-private/<batch>.diag-private.json` (git-ignored) using the authoring schema.
2. Run `node tools/diagnostic/audit-bank.mjs diagnostic-private/<batch>.diag-private.json` — it refuses Git-tracked files and prints only IDs and error codes.
3. Paste the JSON into the SQL Editor as the argument to `select public.vocabulary_diagnostic_bank_admin('<admin-profile-uuid>','import', jsonb_build_object('reason','…','items', '<json>'::jsonb));`. The result lists only IDs and versions.
4. Reviewers work in the existing staff review page (authenticated `review-detail`).
5. Publisher promotes; forms are assembled privately from releasable items.
6. Editorial discussion in Git refers to items **by ID and issue code only** (e.g. "diag-r2-a1-014 — KEY_LONGEST"), never with stems or options.

## 5. Guard rails added in this change

| Guard | Where |
|---|---|
| Repository scan of every tracked file for keyed JSON, literal key assignments, literal seed SQL, keyed/complete Markdown items, private paths, browser fetches of bank/editorial files and unsafe diagnostic logging | `tools/diagnostic/public-exposure.js`, CLI `tools/diagnostic/check-public-exposure.mjs` |
| Exact-path, synthetic-only allowlist that fails when stale | `tools/diagnostic/public-exposure-allowlist.json` |
| CI on **every** PR and push to `main` | `.github/workflows/diagnostic-exposure-guard.yml` |
| Private authoring paths ignored | `.gitignore` |
| Offline audit refuses tracked files | `tools/diagnostic/audit-bank.mjs` |
| Lifecycle contract tests + PG17 behavioural scenario | `tests/vocabulary-diagnostic-bank-lifecycle.test.js`, `tests/db/run-diagnostic-lifecycle-scenario.sh` |

Existing protections reused, not rebuilt: student whitelist (`safe_question`), service-role-only RPCs, JWT-validated actor, append-only reviews with independence and quality attestations, Edge Function error logging limited to `error.code`.

## 6. Compromised material

Removed from the current tree (still in public history, therefore retired):
`editorial/reconstruction-batch-01-review-ledger.json`, `reconstruction-batch-01.md`, `reconstruction-batch-01-lexical-v2.md`, `a1-rewrite-proposals-001.md`, and the keyed rewrite sections of the A1, A2 and B1 triage files. The triage tables also discuss every current item 001–120 by lemma and key. **The entire current 120-item bank and both draft forms are treated as compromised.** Replacements need new IDs (recommended prefix `diag-r2-`) and new content.

## 7. Production migration path (each step needs explicit approval; none done here)

1. Re-verify live schema and function definitions against this repo (audit noted `vocabulary_diagnostic_api` already contains #451's `baselineCompleted`, and #452's form-readiness RPC and draft forms are live).
2. Apply `item_lifecycle_NOT_APPLIED.sql` as a managed migration. It is additive: one table, guard triggers, one RPC. Existing 120 draft items and two draft forms are unaffected.
3. Retire compromised material: `retire-form` both `DIAG-BASELINE-*-DRAFT` forms, then `retire` all 120 `diag-candidate-*` v1 items, with reason "publicly exposed via GitHub". No student data exists to preserve (0 assignments/sessions/responses/results).
4. Author the replacement bank privately (§4).
5. Only later: forms with anchors, scoring, auto-assignment, then enforcement — each separately approved.

## 8. Remaining risks

- The scanner is pattern-based; novel formats (images, PDFs, prose descriptions of options) can evade it. Human review still required.
- Git history remains public; nothing in this change can un-publish it.
- Staff can see one keyed item at a time via `review-detail`; a malicious staff account could copy items. Mitigation is organisational (limited reviewer list, audit).
- Students see the questions they answer; exposure grows with each administration. Plan item rotation and exposure monitoring.
- `authenticated` has USAGE on schema `private` in production (audit). Table/function grants appear closed, but this should be reviewed separately.
- PR #458's preview loads the ledger JSON this change removes; it should be reworked to use authenticated `review-detail` instead of a public file.

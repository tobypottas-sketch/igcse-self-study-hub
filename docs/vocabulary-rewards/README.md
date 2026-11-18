# Vocabulary Rewards Shop — implementation handover

## Isolated sandbox test student — 18 November 2026
- Reuse the existing **TEST STUDENT (Feedback pilot)** in **TEST CLASS**; do not change its authentication credentials, feedback setup or class membership.
- Sandbox ledger and purchases are isolated in `public.vocabulary_reward_sandbox_wallets` and `public.vocabulary_reward_sandbox_owned`; they DO NOT fund or update `vocabulary_reward_wallets`, `vocabulary_reward_owned`, `vocabulary_reward_purchases`, missions or mastery.
- **100,000 sandbox XP**, zero spent initially, enabled for that pre-existing account only. These are testing credits, not earned XP and never change Vocabulary Builder levels.
- `vocabulary-reward-sandbox` is a separate authenticated service; only accounts explicitly enabled in the sandbox table may access it.
- The live student app shows a test-shop entry only if the server confirms sandbox access. Sandbox purchases and equipping persist for that test account.
- Production non-sandbox rewards remain disabled. `PURCHASES_RELEASED = false` remains unchanged in the real Rewards Shop.
- The existing temporary login credential was provided by the user; **do not commit or log it**. Rotate the password when the pilot ends.

## Production rollout checkpoint — 18 November 2026
The disabled Rewards Shop foundation was applied to production Supabase project
`grjshlamooglytsajoun` under migration
`vocabulary_reward_shop_disabled_foundation`.
Lookup indexes were applied under `vocabulary_reward_lookup_indexes`.

Verified after deployment:
- All four `public.vocabulary_reward_*` tables have RLS enabled.
- Catalogue contains **12** records, **zero enabled**.
- **Zero wallets, ownership records, purchases or XP funding**.
- `authenticated` can SELECT wallets but cannot INSERT or UPDATE them.
- `anon` and `authenticated` cannot execute the redemption RPC;
  `service_role` has EXECUTE permission.
- Purchase/equip RPCs are `SECURITY INVOKER`, not `SECURITY DEFINER`.
- `vocabulary-reward-shop` Edge Function deployed with JWT verification.
- Source-level `PURCHASES_RELEASED = false` is enforced independently of
  any environment flag, until a separate reviewed release.

There has been **no authenticated live student XP parity comparison** and no
purchasing test under student credentials. Do not fund wallets or enable rewards
until both are complete.

## Status (Phase 2)
- PR #494: staff preview with 12 cosmetics and disabled purchasing.
- `phase-2-wallet-schema.sql` was **applied** to production on 18 November 2026, with purchasing disabled and no wallet credits.
- All reward catalog rows default to `enabled=false`. No student has a spendable balance.
- Existing mission rows, XP calculation, achievements, level, mastery and merits remain unchanged.

## New implementation in this PR
- `supabase/functions/vocabulary-reward-xp-audit/index.ts`: authenticated, read-only student XP audit. It fetches database-owned missions, mastery, occurrences and published pathway memberships; runs the existing `computeXp()`/`progressSnapshot()` code and returns a breakdown. **Deployed as an isolated JWT-protected function on 18 November 2026 (version 1). Does not write a wallet.**
- `supabase/functions/vocabulary-reward-shop/index.ts`: authenticated shop API. Status requests use student RLS; purchase/equip requests are blocked unless the server-only `VOCAB_REWARDS_ENABLE_PURCHASES=true` flag is set. The flag must stay unset in production while parity is unverified. **Deployed; purchasing is hard-disabled.**
- Proposed purchase/equip functions in `phase-2-wallet-schema.sql` now run as `SECURITY INVOKER` and grant EXECUTE to `service_role` only. The shop Edge function authenticates a student JWT and passes the authenticated ID to those privileged functions; browser-supplied IDs and prices are never accepted.
- New Node tests cover the XP rules, catalogue consistency and the intended API/security contract. Their actual execution, staging and live authenticated verification are still required.

## Read-only student comparison hook
An opt-in student diagnostic exists at `vocabulary.html?xp-audit=1`.
It runs only for an authenticated student after loading the normal home view.
It compares the student's **existing on-screen XP calculation** with the audit
Edge Function and shows mismatches by all seven XP components. It never
authorizes spending or changes any student record. It is inactive on ordinary
`vocabulary.html` visits and unavailable in staff preview.

**Audit deployed but not yet student-verified:** Supabase confirms `vocabulary-reward-xp-audit` is ACTIVE (version 1) with `verify_jwt=true`, and all twelve imported files were present when its body was retrieved. No authenticated student end-to-end audit has yet been performed. Once the UI is merged, open an appropriate controlled student's `vocabulary.html?xp-audit=1` and compare their XP. The database foundation and shop API are deployed, but no purchases or XP credits are enabled.
Any partial, unauthorized, or missing audit response is reported as unavailable,
not as matching. Do not interpret a match on one student as full cohort parity.

## Critical limitation
The XP audit now accepts the browser timezone for read-only comparison and mirrors the browser's lazy pathway-coverage registration. These changes are covered by focused tests but **authenticated live parity has not been demonstrated**. **Do not use audited totals for real credits until a parity investigation resolves these differences and verifies existing students' lifetime XP.** This is why reward funding and purchases remain off.

## Read-only production baseline (18 November 2026)
- **270** active student profiles in the project (not all belong to this teacher).
- **58** recorded Vocabulary Builder missions across **28** distinct students.
- **399** unit-mastery rows across **40** students; same row count for global mastery.
- **9** students have three or more recorded missions; the maximum is six.
- **0** existing missions (across all 58) change calendar date when comparing UTC against Asia/Shanghai.

These are anonymous aggregate SELECT results, not parity assertions. They rule out
one potential *historical* timezone mismatch, but do not verify displayed XP,
mastery availability, rewards balance, or different timezones on student devices.

## Timezone reconciliation changes in this PR
`computeXp()`, `weeklyGoal()` and `achievements()` now accept an **optional**
IANA timezone. Calls that omit it preserve their original local-calendar behavior
(including existing student XP and levels). The audit returns separate UTC and
Asia/Shanghai results and always reports `readyForWalletFunding:false`. Do not
interpret matching UTC/Shanghai totals alone as full client/server parity.

Next: perform an authenticated side-by-side comparison using each student's
actual browser computation and the read-only audit on a controlled test account,
then repeat across a representative sample including mastery progress.
After agreement, adopt a stable timezone policy for future purchases and credit
existing balances with an auditable, idempotent operation.

## Why XP must be reconciled first
Current `computeXp()` in `src/vocabulary/engagement-model.js` is a derived client calculation, not an account balance.

The total contains these components:
- per-mission score tiers (10 / 15 / 20 XP) with a taper after the third same-day mission in a bucket and an 80-XP-per-day mission cap;
- 5 XP per personal best in the same mission bucket;
- 15 XP per qualifying week;
- 25 XP per unlocked achievement;
- 40 XP per passed pathway stage;
- 100 XP per mastered pathway;
- 200 XP per fully mastered unit.

The current client calculation uses JavaScript **local calendar days** for the daily cap and weekly Monday boundary. A database server using UTC for these would disagree for some students. Its `progressSnapshot()` also consults the live pathway readiness cache. Do not claim server parity based on missions alone.

## Target guarantees
1. `verified_earned_xp` is server-computed using the canonical, reviewed XP algorithm and student-authenticated mission and mastery data. Never accept it from the browser.
2. `spent_xp` is increased only by `redeem_vocabulary_reward` inside the row-locked purchase transaction.
3. `available XP = greatest(0, verified_earned_xp - spent_xp)`; lifetime XP and level **never decrease**.
4. Duplicate purchases are idempotent; concurrent purchases are serialised per student by `FOR UPDATE`.
5. Students may read only their wallet, owned rewards, purchases; no direct writes via PostgREST.
6. Equipping is a separate, no-cost operation, and only one item per category may be equipped.
7. Real purchase buttons and student shop navigation remain disabled until all tests pass.

## Required tests before database deployment
- Authenticated student cannot INSERT/UPDATE/DELETE wallet, catalog, ownership or purchases.
- Student A cannot read or equip Student B's items, even with forged reward IDs.
- Anon and unauthenticated RPC calls fail.
- Price supplied by a malicious browser is ignored entirely (RPC has reward ID only).
- Insufficient XP fails without recording purchases or ownership.
- Two concurrent purchases for the same reward charge once.
- Two concurrent purchases for different rewards cannot overspend.
- Equipped reward must be owned; a purchase persists after refresh and across devices.
- Independent parity tests across local-midnight, week boundaries, achievement unlocks, unit release changes, repeated missions and 80-point cap.
- Staff preview must not accidentally create a wallet or spend XP.
- Run Supabase security advisors and browser tests on desktop and mobile.

## Deployment order
1. Finish and independently test trusted XP calculation and cross-device timezone policy.
2. Test the SQL in a nonproduction database, including realistic authenticated roles and concurrency.
3. Apply the schema under a separately reviewed migration with the catalogue still disabled.
4. Backfill verified lifetime XP for every student and compare with existing displayed totals.
5. Enable reward purchasing for controlled test users; verify audit records and balances.
6. Launch student-facing shop only when the above gates pass.

The Phase 1 UI and its catalogue can continue to be polished before enabling purchases. No secret keys belong in browser code.

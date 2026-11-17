# Vocabulary Rewards Shop — implementation handover

## Status (Phase 2)
- PR #494: staff preview with 12 cosmetics and disabled purchasing.
- `phase-2-wallet-schema.sql` is **reviewed source only**: **NOT APPLIED** to Supabase.
- All reward catalog rows default to `enabled=false`. No student has a spendable balance.
- Existing mission rows, XP calculation, achievements, level, mastery and merits remain unchanged.

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

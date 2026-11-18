# Vocabulary Rewards Shop — Student Release Gate

Status: **NOT LIVE FOR STUDENTS** (18 November 2026).

## Already in place
- The approved shop layout, premium PNG artwork, test purchases and equip UI.
- Class Practice XP leaderboard (not a real spendable XP balance).
- Separate sandbox tables and purchase RPCs.
- Existing production reward catalogue, wallet, purchases, owned tables and transactional purchase/equip RPCs.
- A read-only canonical XP audit using `computeXp` plus mastery progress.
- Read-only production status Edge Function (this phase).

## Mandatory release sequence

1. Reconcile canonical XP for representative students and both UTC/Asia-Shanghai day boundaries. Compare student home, server XP audit and all seven XP components. **Do not credit based on browser totals or the leaderboard's practice-only XP.**
2. Agree and implement a server-authoritative lifetime XP funding/update process. It must be idempotent, safe under concurrent requests, validated against the existing XP engine, and must never reduce verified XP below XP already spent. Preserve progress and previous purchases.
3. Fund production wallets only after (1) and (2) pass. Sandbox grants must never be transferred.
4. Turn on production catalog availability explicitly and test an atomic purchase with insufficient funds, duplicate requests, concurrent purchases, equip one-per-category, and a failed request. Confirm RLS permissions and no direct browser writes.
5. Integrate the approved shop UI with the authenticated real-shop endpoint, preserving a separate opt-in sandbox for testing. Real students must not be able to access sandbox balances.
6. Apply purchased cosmetics in the student-facing dashboard/profile without affecting question content, answers, grading or mastery. Verify appearance and persistence across reload/device.
7. Test authenticated students from multiple classes, old and new accounts, incomplete diagnostics, zero XP, small screens and failed network requests.
8. Only then enable the student entry point, review GitHub Pages deployment and inspect the live application.

## Current safety invariant

The production status endpoint accepts only `action=status`, returns an explicit `purchasesEnabled:false` and `readOnly:true`, and never funds or mutates student wallets. It should not itself display a purchase button.

**Do not claim student release complete until the checklist is verified.**

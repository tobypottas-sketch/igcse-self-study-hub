# Self-Study Foundation Verification

Date: 2026-10-13

## Verified

- Dedicated Supabase project: `iGCSE Self-Study` (`grjshlamooglytsajoun`), Singapore region.
- Evidence Hub database/project was not used by the Hub configuration.
- Foundation schema exists for profiles, classes, teacher assignments, student class membership history, and app registry.
- Row Level Security is enabled on every exposed foundation table.
- Anonymous profile reads are not granted.
- Student transfers are atomic and preserve membership history.
- Privileged account/class operations run through JWT-protected Edge Functions; browser code contains only a publishable key.
- Four app records are registered with canonical GitHub Pages URLs.
- First-login routing forces password change before the app launcher.
- Unapproved authenticated users without an active Self-Study profile are rejected.
- Student-facing dynamic HTML is escaped and non-HTTPS app launch URLs are rejected.
- First admin Auth user and matching active admin profile exist for `samuel.pottas@nkcswx.cn`.
- First admin is flagged to change password on first Hub login.
- Public Auth sign-up is disabled at project level; email/password login remains enabled.
- Remote repository `tobypottas-sketch/igcse-self-study-hub` exists and the foundation is uploaded on `feat/self-study-foundation`.
- Local automated test suite passes.
- Supabase security advisor reports no security findings.

## Outstanding Before Pilot

1. Merge the reviewed foundation branch to `main`.
2. Enable GitHub Pages for the Hub and run a real browser login journey against the hosted URL.
3. Confirm the first-admin temporary-password -> forced-password-change -> Hub-home journey end to end.

## Isolation Boundary

No Evidence Hub code, Evidence Hub database schema, or any of the four existing student app production branches is part of this foundation implementation. App instrumentation begins only in the later tracking plan.

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
- Local automated test suite passes.
- Supabase security advisor reports no security findings.

## Intentionally Outstanding Before Pilot

1. Bootstrap the first admin account. This is security-sensitive and requires the owner's explicit choice of admin email and temporary password flow.
2. Disable public Auth sign-up at the hosted Supabase project configuration level. The Hub exposes no sign-up UI and users without approved profiles cannot enter, but project-level signup must still be disabled before a real student pilot.
3. Create and push the remote `tobypottas-sketch/igcse-self-study-hub` GitHub repository. Current implementation is isolated in the local feature branch only.
4. Run a real browser journey against the hosted Hub after the remote repo/deployment and first admin exist.

## Isolation Boundary

No Evidence Hub code, Evidence Hub database schema, or any of the four existing student app production branches is part of this foundation implementation. App instrumentation begins only in the later tracking plan.

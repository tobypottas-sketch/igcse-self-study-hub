# Teacher Writing Assessor Implementation Plan

> For agentic workers: use superpowers:executing-plans inline. User approved the
> direct Worker approach and requested no further design questions.

**Goal:** An integrated, private teacher-only writing assessment screen, prepared
but not deployed.
**Architecture:** Hub staff session -> Worker validates Supabase user/current
profile -> bounded two-stage inference -> ephemeral evidence-based feedback.
**Tech Stack:** Existing vanilla JS, Web APIs, Cloudflare AI binding, Supabase Auth.
**Spec:** ../specs/2026-11-05-teacher-writing-assessor-design.md

## Global constraints
- No merge/deploy/live writing, real fixtures, schema, student-app or secret changes.
- No writing/results/identifiers stored or logged; no browser-held shared secrets.
- Two AI calls maximum, no retries; Content 0–6, Language 0–9; teacher/admin only.

## Review focus
- Forged/student/inactive/password-incomplete sessions never reach AI.
- Hostile prose/output stays data; evidence must quote the submitted answer.
- Empty/oversized/PII-shaped/unknown-field submissions fail before inference.
- Double submits and late responses after navigation/logout do not leak drafts.
- Production inheritance must name active version, never the latest staged upload.

### 1. Worker staff API and assessment contract
Files: assessor-prototype/staff-assessment.js, worker.js, staff-assessment.test.mjs.
- [ ] Write auth, validation, generalized evidence, two-call, privacy and error tests.
- [ ] Observe failures; implement pure helpers plus Worker staff route.
- [ ] Preserve all 38 legacy tests; verify new tests pass. Commit.

### 2. Hub staff interface
Files: src/assessor/{client,view,controller}.js, src/views/home.js, src/app.js,
assessor.css, index.html, tests/teacher-writing-assessor.test.mjs.
- [ ] Write denied-role, escaped-output, request-contract, lifecycle and busy tests.
- [ ] Observe failures; implement separate memory-only controller/view and staff
  navigation without changing student application code or loading account lists.
- [ ] Verify focused tests; add real-router desktop/mobile browser check. Commit.

### 3. Deployment preparation and complete verification
Files: assessor-prototype/{deployment-plan.mjs,deployment-plan.test.mjs,README.md},
.github/workflows/assessor-prototype-tests.yml.
- [ ] Test explicit active-version secret inheritance before implementing builder.
- [ ] Document deployment/auth/origin/logging/privacy gates; do not execute upload.
- [ ] Run prototype/staff tests, browser checks, local build and full npm test.
  Compare exact full-suite failures with base before attributing regressions.
- [ ] Fresh whole-branch review, test-first corrections, privacy/scope diff audit.
  Report local verification and all pending live/privacy/deployment checks.

## Execution ledger
- Architecture/auth/RLS/logging inspection complete; direct Worker approved.
- Base: 73857ce2558836a3b4d83b05df2744874e46a483, clean isolated worktree.

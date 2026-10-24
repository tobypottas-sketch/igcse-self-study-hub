# iGCSE Self-Study Hub Admin Launch v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready, admin-only Accounts + Classes + Bulk Import area so whole classes can be onboarded quickly without manual Supabase administration.

**Architecture:** Add one in-app Admin route/view with focused Accounts, Classes, and Bulk Import sections. Reuse the existing RLS-backed read model and existing `admin-provision-user` / `admin-class-action` Edge Function pattern, extending privileged server actions only where the approved spec requires it. Keep CSV parsing/preview local, keep password generation server-side, and preserve all historical membership/analytics rows.

**Tech Stack:** Vanilla ES modules, Supabase JS 2.x, Supabase Edge Functions (Deno/TypeScript), PostgreSQL/RLS, Node built-in test runner (`node --test`), existing Hub CSS.

**Spec:** `docs/superpowers/specs/2026-10-15-admin-launch-v1-design.md`

## Global Constraints

- Repository: `tobypottas-sketch/igcse-self-study-hub` only.
- Supabase project: `iGCSE Self-Study` (`grjshlamooglytsajoun`).
- Do not touch Reading, Listening, Paraphrasing, Essay Writing repos, Evidence Hub Personal App, or unrelated repos.
- Never remotely store student essays, answers, notes, teacher notes, teacher prompts, free-text student work, or other prohibited learning content.
- Do not delete historical analytics rows or historical class-membership rows.
- All privileged mutations must verify an authenticated, active `admin` server-side.
- Temporary passwords are generated server-side, returned once, and never stored in plaintext.
- Preserve the current Hub landing-page styling, auth, tracking, app links, and wrapper behavior except for the new Admin route/controls.
- Preserve XSS escaping and the existing security test behavior for injected HTML / `<img>` payloads.
- Use TDD and run the full `npm test` suite before merge.
- Do not claim production is live until the exact production commit has successful System Audit and GitHub Pages deployment, and required Supabase functions are deployed successfully.

## Review Focus

- CSV containing quoted names, commas, CRLF line endings, blank trailing rows, or UTF-8 BOM should parse without corrupting valid rows.
- A bulk batch containing one existing email must not create that account and must not erase successfully created neighboring rows.
- Double-clicking / resubmitting provisioning, reset-password, or deactivate actions must not create duplicate effects.
- An inactive admin, teacher, or student calling privileged Edge Function actions directly must receive an authorization failure.
- One-time temporary passwords must disappear when the result view is left/reloaded and must not be recoverable from profile/class data.

---

### Task 1: Admin route, state model, and safe dashboard shell

**Files:**
- Create: `src/views/admin.js`
- Modify: `src/app.js`
- Modify: `src/views/home.js`
- Modify: `styles.css`
- Test: `tests/admin-view.test.js`
- Test: `tests/app-state.test.js`
- Test: `tests/home-access.test.js`

**Interfaces:**
- Consumes: existing `renderHome(root, profile, apps)`, `loadAppState(client)`, delegated `[data-action]` click handling.
- Produces: `renderAdmin(root, model)`, admin view state `{ view: 'admin', profile, section }`, actions `admin`, `admin-back`, and section actions `admin-section-accounts|classes|import`.

- [ ] **Step 1: Write failing navigation/authorization tests**
  - Assert admin home includes the existing admin entry control and non-admin home does not.
  - Assert clicking/routing to Admin is only honored when `currentState.profile.role === 'admin'`.
  - Assert Admin shell renders three section controls: `Accounts`, `Classes`, `Bulk Import` and `Back to Hub`.
  - Assert unsafe display names/class text passed to the renderer are escaped rather than interpreted as HTML.

- [ ] **Step 2: Run focused tests and verify failure**
  - Run: `node --test tests/admin-view.test.js tests/app-state.test.js tests/home-access.test.js`
  - Expected: FAIL because Admin route/view does not yet exist.

- [ ] **Step 3: Implement the minimal Admin shell and routing**
  - Add `renderAdmin(root, { profile, section = 'accounts', ... })` in `src/views/admin.js`.
  - Wire `data-action="admin"` to enter Admin only for active admin state; wire `admin-back` to restore Home; wire section actions without re-authenticating or losing the current profile.
  - Preserve current landing-page markup/styling except for making the existing admin control functional.
  - Add compact Hub-consistent Admin layout styles to `styles.css`.

- [ ] **Step 4: Re-run focused tests**
  - Expected: PASS.

- [ ] **Step 5: Commit**
  - `git commit -am "feat: add admin dashboard route"`

### Task 2: Admin read model for profiles, classes, memberships, and teacher assignments

**Files:**
- Modify: `src/admin/accounts.js`
- Modify: `src/admin/classes.js`
- Modify: `src/views/admin.js`
- Test: `tests/admin-accounts.test.js`
- Test: `tests/class-actions.test.js`
- Create: `tests/admin-read-model.test.js`

**Interfaces:**
- Produces: `loadAdminAccounts(client)`, `loadAdminClasses(client)`, normalized account rows with `id, displayName, email, role, active, currentClass`, and class rows with `id, className, active, students, teachers`.
- Consumes: existing admin-readable RLS tables `profiles`, `classes`, `student_class_memberships`, `teacher_classes`.

- [ ] **Step 1: Write failing read-model tests**
  - Assert only active membership (`ended_at is null`) becomes a student's current class.
  - Assert one teacher can appear in multiple classes and one class can contain multiple teachers.
  - Assert inactive accounts remain visible to admins with `active: false`.
  - Assert empty classes and unassigned teachers normalize cleanly.

- [ ] **Step 2: Run focused tests**
  - Run: `node --test tests/admin-accounts.test.js tests/class-actions.test.js tests/admin-read-model.test.js`
  - Expected: FAIL on missing read helpers.

- [ ] **Step 3: Implement RLS-backed read helpers and dashboard rendering**
  - Keep reads in the authenticated browser client; do not introduce service-role reads in the browser.
  - Render searchable/filterable account rows and class cards/table using escaped text only.

- [ ] **Step 4: Re-run focused tests**
  - Expected: PASS.

- [ ] **Step 5: Commit**
  - `git commit -am "feat: add admin account and class read model"`

### Task 3: Privileged account actions — generated-password provisioning, reset, activate/deactivate

**Files:**
- Modify: `supabase/functions/admin-provision-user/index.ts`
- Modify: `supabase/functions/admin-provision-user/validation.js`
- Modify: `src/admin/accounts.js`
- Modify: `src/views/admin.js`
- Modify/Test: `tests/admin-accounts.test.js`
- Create: `tests/admin-provision-validation.test.js`

**Interfaces:**
- Produces client helpers `createStudentAccount(client, input)`, `createTeacherAccount(client, input)`, `resetAccountPassword(client, userId)`, `setAccountActive(client, userId, active)`.
- Server actions return one-time `temporaryPassword` only for successful create/reset responses.
- Existing callers of single-user provisioning must remain compatible or be deliberately migrated in the same task.

- [ ] **Step 1: Write failing validation/client tests**
  - Assert manual create no longer requires the browser to invent a password; server response supplies it.
  - Assert reset requires a target user ID and returns a generated temporary password.
  - Assert reset sets `must_change_password = true`.
  - Assert deactivate/reactivate accepts only boolean active state and never deletes rows.
  - Pin Review Focus: repeated client submission is disabled while an action is pending.

- [ ] **Step 2: Run focused tests**
  - Run: `node --test tests/admin-accounts.test.js tests/admin-provision-validation.test.js`
  - Expected: FAIL on new actions/validation.

- [ ] **Step 3: Implement server-side password generator and account actions**
  - Generate temporary passwords using server-side cryptographic randomness and an Auth-compatible format; do not persist plaintext.
  - Keep the existing authorization pattern: bearer session → profile lookup → require active admin.
  - For deactivate/reactivate, update only `profiles.active` for the target; preserve Auth user, memberships, and analytics.
  - For reset, update Supabase Auth password and set profile `must_change_password = true`.

- [ ] **Step 4: Add UI forms/confirmation/result handling**
  - Manual Student: name, email, class.
  - Manual Teacher: name, email.
  - Reset/deactivate require confirmation; display generated password once after success.

- [ ] **Step 5: Re-run focused tests**
  - Expected: PASS.

- [ ] **Step 6: Commit**
  - `git commit -am "feat: add admin account lifecycle actions"`

### Task 4: Class administration — create, assign/unassign teachers, transfer students

**Files:**
- Modify: `supabase/functions/admin-class-action/index.ts`
- Modify: `supabase/functions/admin-class-action/validation.js`
- Modify: `src/admin/classes.js`
- Modify: `src/views/admin.js`
- Modify: `tests/class-action-validation.test.js`
- Modify: `tests/class-actions.test.js`

**Interfaces:**
- Produces: existing `createClass`, `assignTeacherToClass`, `transferStudent` plus `unassignTeacherFromClass(client, teacherId, classId)`.
- Consumes: existing `admin_transfer_student` RPC for atomic historical transfer.

- [ ] **Step 1: Write failing tests for teacher unassignment and class UI actions**
  - Assert unassign requires both IDs and removes only that teacher/class relationship.
  - Assert transfer calls the existing atomic transfer action and does not directly delete membership rows.
  - Assert many-to-many assignments remain supported.

- [ ] **Step 2: Run focused tests**
  - Run: `node --test tests/class-action-validation.test.js tests/class-actions.test.js`
  - Expected: FAIL on missing unassign action/UI behavior.

- [ ] **Step 3: Implement minimal backend/client/UI changes**
  - Extend `admin-class-action` with `unassign_teacher` under the same active-admin authorization guard.
  - Add class creation, teacher assignment/removal, and student transfer controls to the Classes section.
  - Refresh the Admin read model after successful mutations without leaving the current section.

- [ ] **Step 4: Re-run focused tests**
  - Expected: PASS.

- [ ] **Step 5: Commit**
  - `git commit -am "feat: complete admin class management"`

### Task 5: Local CSV parser, preview, and preflight validation

**Files:**
- Create: `src/admin/import.js`
- Modify: `src/views/admin.js`
- Create: `tests/admin-import.test.js`

**Interfaces:**
- Produces: `parseStudentCsv(text) -> rows`, `validateStudentImport(rows, existingEmails) -> { validRows, errors }`, and `bulkProvisionStudents(client, classId, rows)` request helper.
- CSV row shape: `{ displayName, email, sourceRow }`.

- [ ] **Step 1: Write failing parser/validator tests**
  - Valid headers: `Student name`, `School email` (trimmed/case-tolerant).
  - Reject missing names/emails, malformed emails, duplicate rows, duplicate emails in-file, and emails already present in profiles.
  - Pin Review Focus: quoted comma names, CRLF, UTF-8 BOM, and blank trailing rows parse correctly.
  - Assert no uploaded file contents are written to Supabase/storage by this module.

- [ ] **Step 2: Run focused tests**
  - Run: `node --test tests/admin-import.test.js`
  - Expected: FAIL because import module does not exist.

- [ ] **Step 3: Implement dependency-free CSV parsing and preview validation**
  - Keep `.csv` as the only launch upload format.
  - Parse locally; do not add XLSX dependency in v1.
  - Render target-class picker, file picker, preview, and explicit row errors before enabling provisioning.

- [ ] **Step 4: Re-run focused tests**
  - Expected: PASS.

- [ ] **Step 5: Commit**
  - `git add src/admin/import.js src/views/admin.js tests/admin-import.test.js && git commit -m "feat: add admin CSV import preflight"`

### Task 6: Server-side bulk provisioning and one-time credential results

**Files:**
- Modify: `supabase/functions/admin-provision-user/index.ts`
- Modify: `supabase/functions/admin-provision-user/validation.js`
- Modify: `src/admin/import.js`
- Modify: `src/views/admin.js`
- Modify: `tests/admin-provision-validation.test.js`
- Modify: `tests/admin-import.test.js`

**Interfaces:**
- Produces server action `bulk_provision_students` with input `{ classId, rows: [{ displayName, email }] }` and output `{ created: [{ userId, displayName, email, temporaryPassword }], failed: [{ displayName, email, reason }] }`.
- Consumes: Task 5 validated rows, but repeats authoritative validation server-side.

- [ ] **Step 1: Write failing bulk-validation/result tests**
  - Assert missing/inactive class rejects the batch before account creation.
  - Assert existing emails are explicit failures, never silently skipped.
  - Assert duplicate emails in submitted batch are rejected.
  - Assert per-row success/failure output is preserved.
  - Pin Review Focus: one failed row does not roll back previously successful rows.
  - Pin Review Focus: if Auth creation succeeds but profile/membership insert fails, that newly created Auth user is deleted.
  - Pin Review Focus: inactive admin / teacher / student direct calls are rejected.

- [ ] **Step 2: Run focused tests**
  - Run: `node --test tests/admin-provision-validation.test.js tests/admin-import.test.js`
  - Expected: FAIL on missing bulk action.

- [ ] **Step 3: Implement purpose-built bulk server action**
  - Validate entire batch, class, role, duplicates, and existing profiles before row creation.
  - For each valid row: generate password → create Auth user → insert profile → insert membership; clean orphan Auth user on row setup failure.
  - Never delete prior successes because a later row fails.

- [ ] **Step 4: Implement results/credential sheet UX**
  - Show created and failed sections separately with reasons.
  - Provide `Copy all` and print-friendly credentials.
  - Warn credentials are one-time and not retrievable later.
  - Clear credential state when leaving/reloading Admin; never include passwords in persistent app state/localStorage/sessionStorage/URL.

- [ ] **Step 5: Re-run focused tests**
  - Expected: PASS.

- [ ] **Step 6: Commit**
  - `git commit -am "feat: add secure bulk student provisioning"`

### Task 7: Security, regression, and interaction hardening

**Files:**
- Modify: relevant existing security/XSS tests under `tests/`
- Create or modify: `tests/admin-security.test.js`
- Modify: `src/views/admin.js` only if tests expose escaping/submission bugs

**Interfaces:**
- Consumes all Admin interfaces from Tasks 1–6.
- Produces no new public feature interface; this task locks behavior.

- [ ] **Step 1: Add security/regression tests**
  - Inject `<img onerror=...>` and other unsafe strings into names, emails, class names, and returned error text; assert rendered output is escaped.
  - Assert existing local brand logo exception remains allowed without weakening the injected-image ban.
  - Assert teachers/students cannot cause Admin rendering/action routing by crafted actions.
  - Pin Review Focus: duplicate submits are blocked for provision/reset/deactivate.
  - Pin Review Focus: credential passwords do not survive leaving/reloading the result view.

- [ ] **Step 2: Run security-focused tests**
  - Run: `node --test tests/admin-security.test.js tests/*security* tests/*hardening*`
  - Expected: PASS after any minimal fixes.

- [ ] **Step 3: Run the full Hub suite**
  - Run: `npm test`
  - Expected: all tests PASS, including existing Audit #8 and wrapper/tracking safeguards.

- [ ] **Step 4: Commit hardening/tests**
  - `git commit -am "test: harden admin launch security and regressions"`

### Task 8: Deploy, PR, exact-commit verification, and production smoke test

**Files:**
- No product-code changes unless verification exposes a defect.
- Update docs only if deployment commands/operational notes need to be recorded.

**Interfaces:**
- Consumes completed branch from Tasks 1–7.
- Produces merged production commit plus verified Supabase function deployment and Pages/System Audit status.

- [ ] **Step 1: Rebase/refresh against latest `main` and run `npm test` again**
  - Resolve only real conflicts; do not overwrite newer landing-page/logo work.
  - Expected: full suite PASS.

- [ ] **Step 2: Deploy the changed Supabase Edge Functions to project `grjshlamooglytsajoun`**
  - Deploy only the functions changed by this plan (`admin-provision-user`, `admin-class-action`).
  - Verify deployment succeeds before merging frontend changes.

- [ ] **Step 3: Open PR and review exact diff against `main`**
  - Confirm no changes outside Hub/admin scope and no prohibited student-content storage paths.

- [ ] **Step 4: Merge only when CI/System Audit is green**
  - Record exact merge commit SHA.

- [ ] **Step 5: Verify GitHub Pages deployment and System Audit for that exact merge commit**
  - Do not infer production status from PR merge alone.

- [ ] **Step 6: Smoke-test production with an admin account**
  - Create a disposable test class/student or use a controlled test fixture.
  - Verify Admin navigation, manual create, CSV preview/bulk create, class assignment, reset, deactivate/reactivate, transfer, credential copy/print, and Back to Hub.

- [ ] **Step 7: Smoke-test authorization with a non-admin account**
  - Confirm no Admin control and direct privileged calls are rejected.

- [ ] **Step 8: Report launch status only with evidence**
  - Include exact production commit, test result, function deployment result, Pages result, System Audit result, and smoke-test outcome.

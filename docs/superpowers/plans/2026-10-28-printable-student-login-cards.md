# Printable Student Login Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an IXL-style onboarding flow that gives each student a readable permanent password and lets an admin print one A4 master sheet of cut-out login cards.

**Architecture:** Extend the existing `admin-provision-user` and Bulk Import flow rather than creating a separate credential store. Credentials remain one-time response data in memory only; the browser renders the printable card sheet and the teacher saves/prints it locally.

**Tech Stack:** Vanilla JavaScript ES modules, Supabase Auth/Edge Functions, HTML/CSS print media, Node `--test`.

**Spec:** `docs/superpowers/specs/2026-10-28-printable-student-login-cards-design.md`

## Global Constraints
- No plaintext student passwords in Supabase tables, GitHub, logs, analytics, localStorage, or app caches.
- No real student credentials in tests.
- Password format: two short common words plus two digits, no punctuation or visually confusing characters.
- Newly provisioned students must not be forced through `must_change_password`.
- Browser print / Save as PDF only; no server-side PDF storage.
- Do not change Vocabulary, Reading, Listening, Essay Writing, Student Activity, mastery, merits, scoring, or progression.
- Class-wide credential regeneration requires explicit admin confirmation.

## Review Focus
- Duplicate or existing student emails must still fail safely without corrupting the credential sheet.
- Partial bulk-import success must print only successfully created students and still surface failed rows.
- Password generation must produce readable, symbol-free, unique-in-batch values.
- Print layout must not expose unrelated admin UI and must paginate cleanly at roughly 8 cards per A4 page.
- Existing accounts/class memberships must not be deleted when generating a fresh credential pack for an active class.

---

### Task 1: Permanent friendly student credentials

**Files:**
- Modify: `supabase/functions/admin-provision-user/index.ts`
- Modify: `supabase/functions/admin-provision-user/validation.js`
- Modify: `src/admin/accounts.js`
- Test: `tests/admin-provision-validation.test.js`
- Create: `tests/admin-friendly-passwords.test.js`

**Interfaces:**
- Consumes: existing `admin-provision-user` actions.
- Produces: readable password generation for student provisioning and a class-wide `issue_class_credentials` admin action returning `{ created:[{userId,displayName,email,temporaryPassword}], failed:[] }` without persisting plaintext.

- [ ] **Step 1: Write failing tests** for symbol-free `WordWord##` passwords, `must_change_password:false` for student provisioning, validation of `issue_class_credentials`, and client invocation shape.
- [ ] **Step 2: Run targeted tests** with `node --test tests/admin-provision-validation.test.js tests/admin-friendly-passwords.test.js`; expect failures before implementation.
- [ ] **Step 3: Implement minimal backend/client support**: friendly student password generator, preserve existing teacher/reset behavior where appropriate, set new student profiles to `must_change_password:false`, and add class-wide issuance that updates Auth passwords plus profile flags for active students in an active class.
- [ ] **Step 4: Re-run targeted tests**; expect PASS.
- [ ] **Step 5: Commit** with `feat(auth): add printable student credentials`.

### Task 2: Printable class login cards

**Files:**
- Modify: `src/views/admin.js`
- Modify: `src/app.js`
- Modify: `admin.css`
- Modify: `tests/admin-import-view.test.js`
- Modify: `tests/admin-view.test.js`

**Interfaces:**
- Consumes: bulk/class credential result rows from Task 1.
- Produces: `Print class login cards` UI and an A4 portrait 2-column card grid rendered from one-time credential data only.

- [ ] **Step 1: Write failing view tests** asserting cut-out cards contain name/email/password/hub URL, print action exists, unrelated admin UI is outside the printable sheet, and failed rows are excluded from cards.
- [ ] **Step 2: Run targeted tests** with `node --test tests/admin-import-view.test.js tests/admin-view.test.js`; expect failures before implementation.
- [ ] **Step 3: Implement card rendering and print action** in the admin import/result surface, reusing current one-time credential state and `window.print()`.
- [ ] **Step 4: Add print CSS** for A4 portrait, 2 columns, dashed cut borders, high-contrast black/white output, approximately 8 cards per page, and hidden navigation/buttons/notices.
- [ ] **Step 5: Re-run targeted tests**; expect PASS.
- [ ] **Step 6: Commit** with `feat(admin): print class login cards`.

### Task 3: Remove the normal student password-change/reset path

**Files:**
- Modify: `src/views/login.js`
- Modify: `src/app.js` only if routing needs a compatibility guard.
- Add/modify auth/login tests in `tests/` following existing static-view test style.

**Interfaces:**
- Consumes: student profiles created with `must_change_password:false`.
- Produces: normal sign-in with the issued permanent password and teacher-directed recovery copy for students.

- [ ] **Step 1: Write failing tests** asserting the normal sign-in screen does not encourage self-service password reset and newly provisioned students route directly to Home.
- [ ] **Step 2: Run targeted tests**; expect failures before implementation.
- [ ] **Step 3: Replace student-facing recovery encouragement** with concise `Lost your login details? Ask your teacher.` copy while retaining existing admin-controlled password actions.
- [ ] **Step 4: Re-run targeted tests**; expect PASS.
- [ ] **Step 5: Commit** with `feat(auth): keep student login credentials stable`.

### Task 4: Full verification and PR

**Files:**
- No product changes unless verification exposes a regression.

- [ ] **Step 1: Run full suite**: `npm test`.
- [ ] **Step 2: Verify branch diff** contains no real credentials, no database plaintext storage, and no unrelated app changes.
- [ ] **Step 3: Confirm exact branch head and CI/status** if available.
- [ ] **Step 4: Open PR** to `main`, leave it unmerged for user approval.

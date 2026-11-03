# Student Password Change Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let active students change their own password from the Hub while preserving teacher/admin reset capability.

**Architecture:** Reuse the existing home-screen action and password-change view. Centralize self-service eligibility in one small helper shared by the home view, password view, and app event guards so role rules cannot drift.

**Tech Stack:** Vanilla JavaScript ES modules, Node `node:test`.

**Spec:** `docs/superpowers/specs/2026-11-03-student-change-password.md`

## Global Constraints

- Active students may self-change passwords.
- Inactive accounts may not.
- Forced first-sign-in/reset password changes remain mandatory and non-cancellable.
- Teacher/admin reset capability remains untouched.
- No Supabase schema or password storage changes.

## Review Focus

- Active student voluntary change is allowed.
- Inactive student change is denied.
- Student voluntary screen has Cancel; forced screen does not.
- Teachers/admins retain current behaviour.
- Admin reset code remains unchanged.

---

### Task 1: Pin the desired password-access behaviour

**Files:**
- Create: `tests/student-password-change.test.js`

- [ ] Write a failing regression test proving a normal student home screen exposes Change password, the voluntary student password screen is cancellable, and app guards admit active students.
- [ ] Run `node --test tests/student-password-change.test.js` and confirm it fails for the missing student behaviour.

### Task 2: Implement shared self-service eligibility

**Files:**
- Create: `src/password-access.js`
- Modify: `src/views/home.js`
- Modify: `src/views/change-password.js`
- Modify: `src/app.js`

**Interfaces:**
- Produces: `canSelfChangePassword(profile) -> boolean`

- [ ] Add the shared eligibility helper for active `student`, `teacher`, and `admin` roles.
- [ ] Show the Change password home control when eligible.
- [ ] Make voluntary student password changes render as account settings with Cancel.
- [ ] Use the helper in click, submit, and cancel guards.
- [ ] Keep forced password change and admin reset paths unchanged.
- [ ] Run the focused test and full `npm test` suite.

### Task 3: Review and PR

- [ ] Inspect the diff for unrelated changes and privacy regressions.
- [ ] Open a PR against `main` and do not merge without explicit approval.

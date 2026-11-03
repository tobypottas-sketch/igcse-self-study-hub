# Student Password Change Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let active students change their own password from the Hub while preserving teacher/admin reset capability.

**Architecture:** Reuse the existing password-change view and existing `changePassword` auth function. Add a student-only controller that intercepts only voluntary student password actions, rechecks the current active student profile, and leaves the existing teacher/admin and forced-reset controller paths untouched.

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

- [x] Write a failing regression test proving a normal student home screen exposes Change password.
- [x] Confirm the focused regression test fails before the student feature is implemented.

### Task 2: Implement student self-service without disturbing existing staff/reset paths

**Files:**
- Create: `src/student-password-controller.js`
- Modify: `src/views/home.js`
- Modify: `src/views/change-password.js`
- Modify: `index.html`

- [x] Show Change password to active students on the Hub home screen.
- [x] Mark only voluntary student password UI for the student controller.
- [x] Recheck the current profile is an active student before opening or submitting voluntary password settings.
- [x] Reuse the existing `changePassword` auth function.
- [x] Keep forced password changes non-cancellable.
- [x] Keep teacher/admin self-service and admin reset paths unchanged.
- [x] Keep the existing `buildHomeModel` return contract unchanged.

### Task 3: Verify and review

- [x] Add active/inactive student, voluntary/forced flow, controller, and admin-reset regression coverage.
- [x] Run the focused test: 5 tests pass, 0 fail.
- [x] Inspect the PR diff for unrelated production changes and privacy regressions.
- [ ] Full repository suite was not run in this environment; the repo's Actions workflows do not target this feature branch.
- [x] Open a PR against `main` and do not merge without explicit approval.

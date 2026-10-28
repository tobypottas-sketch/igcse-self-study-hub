# Teacher/Admin Account Separation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separate student and staff account management while making active teachers admin-capable with readable credentials and optional staff password changes.

**Architecture:** Keep `teacher` as a distinct role. Centralise staff capability checks around `teacher|admin`, update UI routing and account rendering, update privileged Edge Functions, and broaden the four read policies used by the admin data loader so teachers see the same administration data as admins.

**Tech Stack:** Vanilla JS, Node test runner, Supabase Auth/Postgres/Edge Functions.

**Spec:** `docs/superpowers/specs/2026-10-28-teacher-admin-separation-design.md`

## Global Constraints
- Preserve `student`, `teacher`, `admin` roles.
- No student password-change UI.
- No changes to Vocabulary scoring/progression.
- No real student data in tests or GitHub.

## Review Focus
- Teacher can open every admin section, not just Activity.
- Admin remains assignable as a teacher without duplicate directory rows.
- Staff password reset stays readable and optional-change.
- Students remain excluded from staff controls.
- Teacher direct reads of profiles/classes/memberships/teacher_classes match admin visibility.

---

### Task 1: Lock staff capability and directory UX
**Files:** `tests/teacher-admin-account-model.test.mjs`, `src/views/home.js`, `src/views/admin.js`, `src/app.js`, `src/admin/data.js`
- [ ] Add failing tests for staff Manage accounts/Change password controls, teacher admin routing, and separate Students / Teachers & Admins lists.
- [ ] Run the focused test and confirm RED.
- [ ] Implement the minimal UI/routing/data changes.
- [ ] Re-run focused test and confirm GREEN.

### Task 2: Make staff credentials readable and privileges real
**Files:** `tests/teacher-admin-account-model.test.mjs`, `supabase/functions/admin-provision-user/index.ts`, `supabase/functions/admin-class-action/index.ts`, `supabase/functions/admin-merit-settings/index.ts`
- [ ] Add failing tests for readable staff password generation and teacher-or-admin authorization.
- [ ] Run focused test and confirm RED.
- [ ] Implement minimal Edge Function changes.
- [ ] Re-run focused test and confirm GREEN.

### Task 3: Broaden staff administration read policies
**Files:** `tests/teacher-admin-account-model.test.mjs`, `supabase/migrations/20261028205000_teacher_admin_read_access.sql`
- [ ] Add failing static policy assertions.
- [ ] Run focused test and confirm RED.
- [ ] Add migration replacing the four SELECT policies so active role resolution treats teacher/admin equally for administration reads while student self-access remains intact.
- [ ] Re-run focused test and confirm GREEN.

### Task 4: Verify, deploy, merge
- [ ] Run focused test and full `npm test`; compare any full-suite failure with main.
- [ ] Open PR and verify changed-file scope.
- [ ] Apply the migration, deploy the three changed Edge Functions with JWT verification on, and verify live state.
- [ ] Merge the approved PR and verify `main` at the merge SHA.

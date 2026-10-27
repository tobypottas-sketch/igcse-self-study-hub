# Teacher Activity Dashboard V1 — Implementation Plan

**Goal:** Add a lean teacher-facing Activity area that shows usage, Vocabulary progression/current stage, Unit Check results, merit alerts, needs-attention flags, and recent activity without charts or visual analytics.

**Architecture:** Reuse the existing Vocabulary teacher analytics and merit logic rather than creating a second analytics system. Add a secure Supabase read boundary for teacher/admin access, then build a compact Activity model and Activity UI inside the Hub shell. Teachers see only their currently assigned classes; admins see all classes. Existing student progression/scoring logic remains untouched.

**Tech stack:** Vanilla ES modules, HTML/CSS, Supabase/Postgres RLS/RPC or policies, Node `node:test`.

**Spec:** `docs/superpowers/specs/2026-10-27-teacher-activity-dashboard-design.md`

**Global constraints:**
- No graphs, charts, heatmaps, rankings, leaderboards, or predictive analytics.
- No raw student answers, essays, notes, prompts, or private learning text.
- Reuse authoritative Vocabulary progression from existing models/tables.
- Reuse existing merit rule: one merit for every 10 passed pathway stages.
- A “new merit” alert means earned but not yet marked awarded; marking it awarded clears the alert.
- Do not change Stage Contract, pathway progression, Sets, mastery rules, missions, XP, games, sounds, scoring, or attempts.
- Do not change Reading, Listening, Essay Writing, Evidence Hub Personal App, or unrelated features.
- Any new Supabase migration is committed for review only; do not apply it without explicit approval.
- No merge to `main` without explicit approval.

**Review focus:** Access-control correctness, privacy boundaries, reuse of existing progression/merit logic, no regressions to current admin controls, and a simple teacher workflow.

---

## Task 1 — Secure teacher/admin Activity read boundary

**Files:**
- Create: `supabase/migrations/20261027190000_teacher_activity_dashboard.sql`
- Create: `tests/teacher-activity-security.test.mjs`

### Step 1: Write failing security-contract tests

Test the migration text/contracts for:
- admin can read all teacher-activity rows;
- teacher access is limited to currently assigned classes through `teacher_classes` + active `student_class_memberships`;
- students cannot use the teacher Activity read boundary;
- Unit Check attempts become teacher/admin-readable only through the approved scope;
- raw answer/private-text columns are not part of the read contract.

Run:
`node --test tests/teacher-activity-security.test.mjs`

Expected: FAIL because the migration/read boundary does not exist yet.

### Step 2: Implement the read boundary

Add an additive migration that exposes only teacher-safe fields needed by Activity. Prefer a security-definer RPC/read function with explicit role checks over broad table grants. It should return scoped records for:
- current class/student membership;
- safe `activity_events` metadata only;
- Vocabulary global/unit mastery needed to derive six pathway stages;
- `vocabulary_unit_check_attempts` score metadata;
- `vocabulary_merit_awards` metadata.

The function must use the authenticated user identity and role internally; client-provided teacher IDs are not trusted.

### Step 3: Verify focused security tests

Run:
`node --test tests/teacher-activity-security.test.mjs`

Expected: PASS.

### Step 4: Commit

Commit message:
`feat(activity): add scoped teacher analytics read boundary`

---

## Task 2 — Build the lean Activity model from existing authoritative logic

**Files:**
- Create: `src/admin/activity-model.js`
- Create: `tests/admin-activity-model.test.js`
- Reuse: `src/vocabulary/analytics.js`
- Reuse: `src/vocabulary/merits.js`
- Reuse: `src/vocabulary/pathway-model.js`

### Step 1: Write failing model tests

Cover:
- last active;
- activity count this week;
- recent attempts/sessions count;
- most recently used pathway/app metadata;
- all six pathway labels/current stages using existing `buildPathwayAnalytics` output, not new stage rules;
- Unit Check latest score, best score, attempts used/remaining;
- pending merits count from existing `buildMeritStatus` semantics;
- simple attention flags:
  - inactive 7+ days;
  - repeated weak Unit Check result (two completed attempts below 5/10);
  - meaningful recent Vocabulary activity but no pathway progress beyond Recognise/initial state;
- safe chronological activity feed labels;
- no raw answer/prompt material survives normalization.

Run:
`node --test tests/admin-activity-model.test.js`

Expected: FAIL.

### Step 2: Implement pure model helpers

Create small deterministic functions that receive already-scoped rows and return:
- student summary rows;
- per-student detail model;
- class filter options;
- alert counts.

Do not duplicate pathway progression rules. Import/reuse existing Vocabulary analytics/model helpers.

### Step 3: Verify focused model tests

Run:
`node --test tests/admin-activity-model.test.js`

Expected: PASS.

### Step 4: Commit

Commit message:
`feat(activity): add teacher activity summary model`

---

## Task 3 — Load scoped Activity data

**Files:**
- Create: `src/admin/activity-data.js`
- Create: `tests/admin-activity-data.test.js`

### Step 1: Write failing loader tests

Use a fake Supabase client to verify:
- the loader calls only the scoped teacher Activity RPC/read function;
- returned rows are normalized into students/classes/activity/mastery/Unit Checks/merits;
- missing optional Unit Check/merit data degrades safely;
- no broad unscoped `profiles`, `activity_events`, or mastery table reads are added to the new Activity path.

### Step 2: Implement loader

Keep the loader thin: call the secure read boundary, normalize safe fields, pass them to the model layer.

### Step 3: Run focused loader tests

Run:
`node --test tests/admin-activity-data.test.js`

Expected: PASS.

### Step 4: Commit

Commit message:
`feat(activity): load scoped teacher activity data`

---

## Task 4 — Add text-only Activity UI and student drill-down

**Files:**
- Modify: `src/views/admin.js`
- Modify: `admin.css`
- Create: `tests/admin-activity-view.test.js`

### Step 1: Write failing view tests

Verify Activity renders:
- class filter;
- student search;
- state filter: All / Needs attention / New merits;
- compact student rows with student, class, last active, six-pathway progression summary, Unit Check summary, new merit count, attention state;
- clickable student row/action;
- student detail sections: Usage, Vocabulary progression, Unit Checks, Merits, Needs attention, Recent activity;
- zero chart/canvas/SVG analytics markup.

### Step 2: Implement Activity renderer

Use existing admin styles and restrained status pills/text. Do not redesign Accounts, Classes, or Import.

### Step 3: Implement student detail renderer

The detail view stays within the same Activity shell and has a clear Back to Activity action.

### Step 4: Run focused view tests

Run:
`node --test tests/admin-activity-view.test.js`

Expected: PASS.

### Step 5: Commit

Commit message:
`feat(activity): add teacher activity and student detail views`

---

## Task 5 — Wire teacher/admin routing without exposing admin controls

**Files:**
- Modify: `src/app.js`
- Modify: `src/views/home.js`
- Modify: `src/views/admin.js`
- Create: `tests/teacher-activity-access.test.js`
- Modify if needed: `tests/app-state.test.js`, `tests/admin-view.test.js`

### Step 1: Write failing access/navigation tests

Verify:
- admin home exposes Activity and existing account management;
- teacher home exposes Student activity but not Manage accounts;
- student home exposes neither;
- teacher can open Activity;
- teacher cannot open Accounts, Classes, or Bulk Import by action manipulation;
- admin can switch among Activity/Accounts/Classes/Import normally;
- Back to Hub works for both teacher and admin.

### Step 2: Implement routing

Generalize the Activity route so `admin` and `teacher` roles can enter it, while preserving strict admin-only guards for account/class/import actions.

### Step 3: Run focused routing tests

Run:
`node --test tests/teacher-activity-access.test.js tests/app-state.test.js tests/admin-view.test.js`

Expected: PASS.

### Step 4: Commit

Commit message:
`feat(activity): expose scoped student activity to teachers`

---

## Task 6 — Wire merit alerts and acknowledgement

**Files:**
- Modify: `src/admin/activity-model.js`
- Modify: `src/admin/activity-data.js`
- Modify: `src/app.js`
- Modify: `src/views/admin.js`
- Reuse: `src/vocabulary/merits.js`
- Extend: `tests/admin-activity-model.test.js`
- Extend: `tests/admin-activity-view.test.js`

### Step 1: Write failing alert tests

Verify:
- total new-merit badge equals earned-but-unawarded merits across visible students;
- teacher only sees merit alerts for assigned classes;
- admin sees all scoped pending merits;
- student detail explains merit number/reason as pathway-stage milestone;
- `Mark awarded` writes to existing `vocabulary_merit_awards` with authenticated teacher/admin as `awarded_by`;
- after successful acknowledgement, pending count drops immediately in UI state.

### Step 2: Implement alert count and acknowledgement

Reuse the existing `vocabulary_merit_awards` table/semantics. Do not add a second notification table unless the existing award store proves insufficient during tests.

### Step 3: Run focused merit tests

Run:
`node --test tests/admin-activity-model.test.js tests/admin-activity-view.test.js tests/vocabulary-merits.test.js`

Expected: PASS.

### Step 4: Commit

Commit message:
`feat(activity): surface pending merit alerts`

---

## Task 7 — Final privacy, regression, and scope verification

**Files:**
- Test-only changes if required by legitimate new contracts.

### Step 1: Run focused Activity suite

Run:
`node --test tests/teacher-activity-security.test.mjs tests/admin-activity-model.test.js tests/admin-activity-data.test.js tests/admin-activity-view.test.js tests/teacher-activity-access.test.js tests/vocabulary-merits.test.js tests/vocabulary-teacher-data.test.js`

Expected: PASS.

### Step 2: Run admin regression tests

Run:
`node --test tests/admin-*.test.js tests/admin-*.test.mjs`

Expected: PASS, except any independently verified pre-existing baseline failure must be documented rather than silently changed.

### Step 3: Run full suite

Run:
`npm test`

Expected: no new failures. The previously known Runtime Smoke baseline may still report the established 13 pre-existing failures outside this feature; do not broaden this PR to repair them.

### Step 4: Inspect changed-file scope

Compare feature branch to `main`. Confirm only teacher Activity, its secure read migration, tests, and necessary Hub routing/styling changed.

### Step 5: Commit any verification-only test corrections

Only if required, with a narrow message such as:
`test(activity): tighten teacher dashboard contracts`

---

## Task 8 — PR and preview handoff

### Step 1: Open PR against `main`

PR must state:
- Activity dashboard scope;
- teacher/admin access rule;
- merit alert semantics;
- privacy guarantee;
- no graphs/charts;
- migration included but NOT applied;
- test results and any known baseline failures.

### Step 2: Do not merge

Leave PR open for user review.

### Step 3: Preview

After exact-head CI is green, update only the designated Render preview branch to the exact green SHA if needed. Do not touch production deployment or the unrelated Evidence Hub Render workspace.

### Step 4: User visual review

User verifies the teacher Activity screen and student drill-down in preview.

### Step 5: Production sequencing remains explicit

Only after user approval:
1. review/apply required Supabase migrations with explicit approval;
2. merge PR with explicit approval;
3. verify production deployment and teacher Activity access.

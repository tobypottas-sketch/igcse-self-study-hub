# Teacher Activity Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a permission-safe teacher Activity area in the standalone iGCSE Self-Study Hub, with class overview and student drill-down for real Paraphrasing and Reading activity.

**Architecture:** Add dedicated Postgres analytics RPCs that return only authorised, pre-aggregated teacher data, then add a small client API and two in-app views (class overview and student detail). Routing stays inside the existing single-page Hub, and all role visibility is enforced both in the UI and at the database boundary.

**Tech Stack:** Static GitHub Pages app, vanilla ES modules, Supabase JS v2, Postgres/RLS/RPC, Node built-in test runner.

**Spec:** `docs/superpowers/specs/2026-10-13-teacher-activity-dashboard-design.md`

## Global Constraints

- Evidence Hub remains completely untouched.
- Original Paraphrasing and Reading production apps remain untouched.
- Listening and Essay Writing are not part of this work.
- No raw student-written answers, prompts or passage text may be returned or rendered.
- Student accounts must never receive teacher analytics data.
- Teachers may only see authorised class/student data; transfer history rules from the spec must be preserved.
- Accuracy must use valid question-attempt score/max-score only; no forced cross-app combined score.
- Weakest skill requires at least 2 valid attempts; otherwise show `Not enough data`.
- Empty/no-data states must not be presented as poor attainment.

## Review Focus

- **Transferred student:** old teacher can see only activity from the former membership window; new current-class teacher can see the student’s full history.
- **No valid accuracy denominator:** UI shows `—`, never `0%`.
- **Reading note-completion grouped score:** shown as an exercise result, never mixed into ordinary question accuracy.
- **Unauthorised direct request:** teacher/student RPC calls for inaccessible classes/students return no protected data.
- **Hostile labels/metadata:** student/class names are HTML-escaped, and raw metadata/answer text never reaches the rendered UI.

---

### Task 1: Authorised Analytics Backend

**Files:**
- Create: `supabase/migrations/20261013_teacher_activity_analytics.sql`
- Test: `tests/teacher-activity-sql.test.js`

**Interfaces:**
- Consumes: existing `profiles`, `classes`, `teacher_classes`, `student_class_memberships`, `activity_events`, existing role/class RLS model.
- Produces RPCs:
  - `teacher_activity_classes()`
  - `teacher_activity_overview(p_class_id uuid, p_since timestamptz)`
  - `teacher_activity_student_summary(p_student_id uuid, p_since timestamptz)`
  - `teacher_activity_student_recent(p_student_id uuid, p_since timestamptz, p_limit integer default 40)`

- [ ] **Step 1: Write failing SQL contract tests**

Add tests that assert the migration text defines the four RPC names, checks caller role, references current/dated class membership, excludes raw answer/prompt fields, and computes accuracy only from `event_type = 'question_attempt'` rows with valid `score/max_score`.

- [ ] **Step 2: Run the targeted tests and verify RED**

Run: `node --test tests/teacher-activity-sql.test.js`

Expected: FAIL because the analytics migration/RPCs do not yet exist.

- [ ] **Step 3: Implement the analytics migration**

Create the four RPCs with these exact responsibilities:

- `teacher_activity_classes()` returns only classes the caller may analyse (all for admin, assigned classes for teacher, none for student).
- `teacher_activity_overview(...)` returns one row per authorised student with: `student_id`, `display_name`, `class_id`, `class_name`, `last_active`, `active_seconds`, `attempts`, `correct_score`, `valid_max_score`, `apps_used text[]`, `weakest_skill`.
- `teacher_activity_student_summary(...)` returns JSON containing summary totals plus `apps` and `skills` aggregates.
- `teacher_activity_student_recent(...)` returns privacy-safe timeline fields only: `occurred_at`, `app_key`, `event_type`, `skill`, `score`, `max_score`, `active_seconds`, `outcome`.

Transfer rule: derive teacher visibility from membership time windows. Former-class teachers may see rows whose `occurred_at` fell within that membership window; current/new-class teachers may see the student’s full history while currently authorised.

- [ ] **Step 4: Run targeted tests and verify GREEN**

Run: `node --test tests/teacher-activity-sql.test.js`

Expected: PASS.

- [ ] **Step 5: Apply migration to the iGCSE Self-Study Supabase project and verify permissions**

Verify with authenticated test contexts that admin succeeds, assigned teacher succeeds only for authorised classes/students, student gets no analytics data, and former teacher cannot see post-transfer rows.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20261013_teacher_activity_analytics.sql tests/teacher-activity-sql.test.js
git commit -m "feat: add teacher activity analytics backend"
```

---

### Task 2: Activity API Client

**Files:**
- Modify: `src/api.js`
- Test: `tests/activity-api.test.js`

**Interfaces:**
- Consumes RPCs from Task 1.
- Produces:
  - `loadActivityClasses(client)`
  - `loadClassActivity(client, classId, since)`
  - `loadStudentActivitySummary(client, studentId, since)`
  - `loadStudentRecentActivity(client, studentId, since, limit = 40)`

- [ ] **Step 1: Write failing API tests**

Assert exact RPC names/arguments, normalised empty arrays, and friendly thrown errors instead of raw Supabase messages.

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test tests/activity-api.test.js`

Expected: FAIL because the new API helpers are missing.

- [ ] **Step 3: Implement the four API helpers in `src/api.js`**

Keep each helper thin: one RPC call, normalise `data ?? []` where appropriate, and throw a stable teacher-facing error string on failure.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `node --test tests/activity-api.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/api.js tests/activity-api.test.js
git commit -m "feat: add activity analytics API client"
```

---

### Task 3: Activity View Models and Formatting

**Files:**
- Create: `src/views/activity-model.js`
- Test: `tests/activity-model.test.js`

**Interfaces:**
- Consumes raw RPC rows/JSON.
- Produces:
  - `periodToSince(period, now = new Date())`
  - `formatActiveTime(seconds)`
  - `formatAccuracy(correctScore, validMaxScore)`
  - `formatAppLabels(appKeys)`
  - `buildClassActivityModel(rows, options)`
  - `buildStudentActivityModel(summary, recent, options)`

- [ ] **Step 1: Write failing formatting/model tests**

Cover: 7-day/30-day/all-time period conversion, `—` for zero denominator, teacher-friendly duration formatting, app label mapping, `Not enough data`, and Reading grouped note results staying out of question-level accuracy.

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test tests/activity-model.test.js`

Expected: FAIL because model helpers do not exist.

- [ ] **Step 3: Implement the model helpers**

Use app labels `paraphrasing -> Paraphrasing`, `reading -> Reading`; unknown keys fall back to the key safely. Keep all accuracy decisions numeric and separate from presentation.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `node --test tests/activity-model.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/views/activity-model.js tests/activity-model.test.js
git commit -m "feat: add activity analytics view models"
```

---

### Task 4: Class Activity Overview UI

**Files:**
- Create: `src/views/activity.js`
- Modify: `src/views/home.js`
- Modify: `styles.css`
- Test: `tests/activity-view.test.js`
- Modify: `tests/views.test.js`

**Interfaces:**
- Consumes `buildClassActivityModel(...)` from Task 3.
- Produces:
  - `renderActivityOverview(root, profile, classes, model, state)`
  - Home action visibility for `data-action="activity"` on admin/teacher only.

- [ ] **Step 1: Write failing UI tests**

Assert:
- admin home shows `Activity` and `Manage accounts`
- teacher home shows `Activity` only
- student home shows neither
- overview renders class selector, period selector, required columns and escaped labels
- empty state text is exactly `No Self-Study activity recorded for this period.`
- zero denominator renders `—`

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test tests/activity-view.test.js tests/views.test.js`

Expected: FAIL because Activity rendering/navigation controls are missing.

- [ ] **Step 3: Implement home action visibility and overview renderer**

Use existing Hub visual language: compact white card/table, no charts. Student names must be row actions carrying only student IDs in data attributes.

- [ ] **Step 4: Add minimal responsive styles in `styles.css`**

Add only Activity-specific table/filter/summary styles needed for laptop/tablet use; do not restyle existing Hub components globally.

- [ ] **Step 5: Run tests and verify GREEN**

Run: `node --test tests/activity-view.test.js tests/views.test.js`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/views/activity.js src/views/home.js styles.css tests/activity-view.test.js tests/views.test.js
git commit -m "feat: add class activity overview UI"
```

---

### Task 5: Student Activity Drill-Down UI

**Files:**
- Modify: `src/views/activity.js`
- Test: `tests/activity-student-view.test.js`

**Interfaces:**
- Consumes `buildStudentActivityModel(...)` from Task 3.
- Produces: `renderStudentActivity(root, profile, studentModel, state)`.

- [ ] **Step 1: Write failing drill-down tests**

Assert header, current class, selected period, summary cards, app breakdown, skill table, privacy-safe timeline entries, back action, and escaping. Explicitly assert that keys such as `answer_text`, `prompt`, raw metadata and UUIDs are never rendered.

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test tests/activity-student-view.test.js`

Expected: FAIL because student detail renderer is missing.

- [ ] **Step 3: Implement `renderStudentActivity(...)`**

Timeline rules:
- question attempt: app + readable skill + `Correct` / `Try again`
- exercise result: app + readable skill + `score/max_score` when present
- active time: app + `Active study` + formatted duration

Do not render raw JSON or internal identifiers.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `node --test tests/activity-student-view.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/views/activity.js tests/activity-student-view.test.js
git commit -m "feat: add student activity drill down"
```

---

### Task 6: In-App Routing and Filter State

**Files:**
- Modify: `src/app.js`
- Test: `tests/activity-routing.test.js`
- Modify: `tests/app-state.test.js`

**Interfaces:**
- Consumes Activity API helpers from Task 2 and renderers from Tasks 4–5.
- Produces in-app states: `home`, `activity-overview`, `activity-student`.

- [ ] **Step 1: Write failing routing tests**

Cover:
- admin/teacher `Activity` click loads authorised classes then overview
- student Activity action/direct state is rejected back to home/error without analytics data
- period filter reloads overview using the correct `since`
- class filter reloads selected class
- student row opens drill-down
- back returns to the same class/period overview state
- analytics load failure shows Retry without breaking logout/home flow

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test tests/activity-routing.test.js tests/app-state.test.js`

Expected: FAIL because Activity states and handlers are missing.

- [ ] **Step 3: Implement Activity state transitions in `src/app.js`**

Keep analytics state local to the existing app boot lifecycle; do not introduce a separate router dependency.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `node --test tests/activity-routing.test.js tests/app-state.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app.js tests/activity-routing.test.js tests/app-state.test.js
git commit -m "feat: wire activity dashboard routing"
```

---

### Task 7: End-to-End Permission and Metric Verification

**Files:**
- Modify: `docs/foundation-verification.md`
- Test: existing + all new test files

**Interfaces:**
- Consumes all prior tasks.
- Produces verified deployable teacher Activity module.

- [ ] **Step 1: Run full automated suite**

Run: `npm test`

Expected: all tests PASS.

- [ ] **Step 2: Run syntax checks on changed browser modules**

Run Node syntax checks for `src/app.js`, `src/api.js`, `src/views/activity.js`, `src/views/activity-model.js`.

Expected: no syntax errors.

- [ ] **Step 3: Perform authenticated Supabase permission checks**

Verify:
- admin sees all authorised classes/students
- assigned teacher sees assigned classes only
- teacher cannot request another class/student
- student receives no analytics rows
- former teacher cannot see post-transfer activity
- new teacher can see full history for currently authorised student

- [ ] **Step 4: Verify real pilot data**

Using the admin account, confirm the Activity UI shows the existing Paraphrasing and Reading events, including the recent Reading test run, with no raw answer text.

- [ ] **Step 5: Verify UI semantics manually**

Confirm no-data vs poor-attainment states, `—` accuracy, responsive table behavior, drill-down/back state preservation, and that existing app-launch cards still behave exactly as before.

- [ ] **Step 6: Update verification note**

Document the Activity dashboard checks in `docs/foundation-verification.md`, including the existing expected Free-plan leaked-password-protection warning as unrelated to this feature.

- [ ] **Step 7: Commit**

```bash
git add docs/foundation-verification.md
git commit -m "docs: verify teacher activity dashboard"
```

- [ ] **Step 8: Open PR and review branch diff**

Confirm the PR changes only the Self-Study Hub repo and Self-Study Supabase migration; Evidence Hub and all four original app repos remain untouched.

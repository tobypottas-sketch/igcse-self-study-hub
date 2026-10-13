# Teacher Activity Dashboard — Design Spec

Date: 2026-10-13
Project: iGCSE Self-Study Hub
Repo: `tobypottas-sketch/igcse-self-study-hub`

## Purpose

Add a small teacher-facing analytics area to the standalone Self-Study Hub so authorised staff can see useful student engagement and performance evidence from the tracked practice apps before any Evidence Hub integration is attempted.

This is the first teacher analytics surface for the Self-Study system. It exists to prove that the central activity pipeline is useful, readable and permission-safe using real Paraphrasing and Reading activity.

## Hard boundaries

- Evidence Hub remains completely untouched.
- No changes to the Evidence Hub repo, database, auth, navigation or student profile pages.
- Original Paraphrasing and Reading production apps remain untouched.
- Listening and Essay Writing are not instrumented as part of this work.
- No raw student-written answers, prompts or passage text are displayed or stored by this dashboard.
- The dashboard uses the existing Self-Study `activity_events` data together with existing profile/class/membership data; it does not create a second analytics datastore.
- Student accounts must never receive access to teacher analytics.

## Roles and access

### Admin

Can access Activity and view all classes and all students in the Self-Study project.

### Teacher

Can access Activity for classes assigned to that teacher through `teacher_classes`.

For students currently enrolled in one of those classes, the teacher may see the student’s full historical Self-Study activity, consistent with the previously approved class-history model.

For a student who has transferred out of an assigned class, the old class teacher may retain access only to activity associated with the period when that student belonged to the old class. The old class teacher must not see new activity created after transfer unless another current authorisation permits it.

### Student

Cannot access Activity and must not receive teacher analytics data from the backend.

Access control must be enforced by database RLS/query permissions, not just hidden buttons in the browser.

## Entry point

The authenticated Hub home will gain an `Activity` action for admin and teacher roles.

- Admin: `Activity` + existing `Manage accounts`
- Teacher: `Activity` only
- Student: neither control

The Activity action opens a dedicated in-app teacher analytics view rather than navigating to Evidence Hub or another service.

## Primary workflow

The dashboard uses a two-level workflow:

1. Class overview
2. Student drill-down

The class overview is the default teacher landing view because it answers the most useful teacher question first: who is engaging, how much, how successfully, and where are the main skill weaknesses?

## Class overview

### Filters

- Class selector
- Period selector: `Last 7 days`, `Last 30 days`, `All time`

Admin may choose any active class or an `All classes` view.

Teacher may choose only assigned classes. No `All classes` option is needed for teachers in v1 unless the teacher is assigned to multiple classes; if included, it must aggregate only those authorised classes.

The standard class overview lists current students in the selected class. Historical transferred students do not need to appear in the default current-class table in v1.

### Student table

One row per current student in the selected class.

Columns:

- Student
- Last active
- Active time
- Attempts
- Accuracy
- Apps used
- Main weakness

### Metric definitions

#### Last active

Timestamp of the student’s most recent authorised `activity_events` row within the selected period. If no activity exists, show `No activity`.

#### Active time

Sum of `active_seconds` from authorised `active_time` events within the selected period.

Display as a teacher-friendly duration such as `18 min` or `1 h 12 min`.

This is an estimate of engaged app time, not surveillance-grade elapsed time. The UI must not imply exact study duration.

#### Attempts

Count of authorised `question_attempt` events within the selected period.

Exercise-level score events are not counted as question attempts.

#### Accuracy

Calculated only from authorised events with a valid numeric correct/incorrect interpretation, primarily `question_attempt` rows with `score` and `max_score`.

For v1:

`accuracy = total correct question-attempt score / total question-attempt max score`

Do not combine incompatible exercise-level scores into a single accuracy percentage.

If there is no valid denominator, display `—` rather than `0%`.

#### Apps used

Distinct app keys used in the selected period, presented as readable labels such as `Reading` and `Paraphrasing`.

#### Main weakness

The identifiable skill with the weakest valid question-attempt accuracy for that student during the selected period.

Guardrails:

- Require at least 2 valid attempts in a skill before naming it a weakness.
- Do not infer weakness from active time alone.
- Do not rank skills that only have non-comparable exercise-level score data.
- If there is insufficient evidence, show `Not enough data`.

Examples of readable skill names:

- Phrase matching
- Sentence matching
- Synonym writing
- Paraphrase writing
- Short answers
- Multiple matching
- Note completion
- Multiple choice

## Student drill-down

Clicking a current student row opens that student’s Activity detail view.

Header:

- Student name
- Current class
- Selected period
- Back to class overview

### Summary cards

- Last active
- Active time
- Attempts
- Valid accuracy
- Apps used

### App breakdown

One compact section per app with authorised data in the period.

For each app:

- Active time
- Attempts
- Valid accuracy where meaningful
- Skills practised

No single cross-app score is required.

### Skill breakdown

Compact table:

- Skill
- Attempts
- Correct
- Accuracy

Only rows with valid comparable question-level attempts should show an accuracy value.

Reading Exercise 3 grouped note results may be shown separately as exercise results, but they must not be forced into the question-level accuracy table if doing so would misrepresent the any-order scoring model.

### Recent activity timeline

Newest first, limited to a practical number of authorised events in v1 (for example 30–50).

Human-readable entries such as:

- `Reading · Multiple choice · Correct`
- `Paraphrasing · Paraphrase writing · Try again`
- `Reading · Note completion · 5/7`
- `Paraphrasing · Active study · 1 min`

Do not display:

- typed answer text
- question prompt text
- passage text
- raw JSON metadata
- internal UUIDs

## Data access approach

The browser should not perform unrestricted raw-table aggregation logic across all activity rows.

Preferred design: create dedicated database read functions/views for teacher analytics that return only the fields required by the dashboard and enforce the existing role/class/membership permission model.

The implementation may use security-invoker views or carefully designed Postgres functions, but must preserve RLS expectations and avoid bypassing class permissions.

The client should request already-authorised, already-shaped analytics data rather than downloading all `activity_events` and calculating everything in JavaScript.

## Suggested backend surfaces

Exact names may change during implementation, but the intended responsibilities are:

### Class overview query

Input:

- optional class id
- period start timestamp or period key

Output per current student:

- student id
- display name
- class id/name
- last active timestamp
- active seconds
- question attempts
- correct score total
- valid max-score total
- distinct apps used
- derived weakest eligible skill

### Student activity summary query

Input:

- student id
- period start timestamp or period key

Output:

- summary totals
- app-level aggregates
- skill-level aggregates

For current students, authorised current-class teachers may receive full history. If support for former students is exposed later, returned history must be clipped to periods/events that the requesting teacher is authorised to view.

### Student recent activity query

Input:

- student id
- period start timestamp or period key
- sensible result limit

Output only privacy-safe event fields required for readable timeline rendering and only for events the caller is authorised to view.

## Permissions and transfer behaviour

The backend must enforce:

- admin can read all student analytics
- teacher can read current students in assigned classes
- current-class teacher may read full historical activity for those current students
- former/old class teacher must not read post-transfer activity solely because the student used to belong to that class
- if historical former-student access is provided, it is limited to events associated with the old authorised membership/class period
- student cannot call teacher analytics successfully
- teacher cannot read an unrelated class/student

The event’s class snapshot plus student membership history must be used where necessary to enforce the transfer boundary safely.

## UI style

Keep the existing Self-Study Hub visual language:

- clean white cards
- compact professional table
- restrained typography
- no dashboard clutter
- no decorative charts in v1
- readable empty states
- responsive layout for laptop/tablet

This is a utility view for teachers, not a showcase dashboard.

## Empty and low-data states

Examples:

- Class has students but no tracked activity: `No Self-Study activity recorded for this period.`
- Student has activity but no comparable question attempts: show time/apps while Accuracy remains `—`.
- Weakest skill lacks enough evidence: `Not enough data`.

The UI must distinguish `no data` from poor attainment.

## Error handling

- If analytics data cannot load, show a clear in-app error and a Retry action.
- Do not expose raw Supabase/database errors to the user.
- Losing analytics access must not break the student app launcher/home experience.

## Testing requirements

### Permission tests

Verify:

- admin receives all authorised class/student analytics
- teacher receives only assigned-class analytics
- current-class teacher can see full permitted history of a current student
- old class teacher cannot see post-transfer activity after the student leaves
- historical former-student access, if implemented, is limited to pre-transfer/old-class authorised events
- teacher cannot request another class/student
- student receives no teacher analytics

### Aggregation tests

Verify:

- active time sums `active_time` only
- attempts count `question_attempt` only
- accuracy excludes non-comparable events
- zero valid attempts gives `—`, not `0%`
- weakest skill requires minimum evidence
- app labels aggregate correctly
- Reading note-completion grouped scoring is not misrepresented as ordinary per-question accuracy

### UI tests

Verify:

- Activity button visibility by role
- class and period filters
- class table rendering
- student drill-down/back navigation
- empty states
- HTML escaping for student/class labels
- no raw answers or metadata are rendered

## Out of scope for v1

- Evidence Hub integration
- charts and visual trend graphs
- intervention flags
- automated teacher recommendations
- comparisons between classes
- exporting reports
- CSV download
- parent-facing analytics
- targets/grades
- a dedicated former-students/history browser
- Listening analytics before Listening is instrumented
- Essay Writing analytics before Essay Writing is instrumented
- storing essay or free-response content

## Success criteria

The feature is complete when:

1. An admin can open Activity from the Hub and see real Paraphrasing/Reading evidence.
2. A teacher can do the same only within the approved class/history permission boundaries.
3. A student cannot access teacher analytics.
4. Class overview metrics are meaningful and avoid misleading combined scores.
5. Student drill-down clearly shows app, skill and recent activity evidence.
6. No student answer text is exposed or newly stored.
7. Existing student Hub/app-launch behaviour remains unchanged.
8. Evidence Hub remains untouched.

## Future integration direction

Once Paraphrasing, Reading, Listening and Essay Writing tracking are stable and the standalone analytics prove useful, this teacher analytics module may be transplanted into Evidence Hub as an isolated Self-Study module.

That future transplant is explicitly not part of this specification.
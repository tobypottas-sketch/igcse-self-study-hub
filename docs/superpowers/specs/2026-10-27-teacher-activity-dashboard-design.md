# Teacher Activity Dashboard — Design

## Intent
Create a lean teacher-facing activity area inside the existing admin experience so teachers can see what students are actually doing without adding graphs, charts, rankings, or decorative analytics.

The dashboard should answer six practical questions quickly: who is using the hub, what level/stage they are at, how Unit Checks are going, what merits they have earned, who needs attention, and what happened recently.

## Goals
- Add a new Admin → Activity section.
- Show teacher-safe student activity using existing tracking and authoritative Vocabulary/Unit Check data.
- Allow class and student filtering.
- Allow student drill-down from the directory/activity list.
- Surface merits with a clear unread/new alert for teachers.
- Keep the interface compact, text/table/card based, and operational rather than visual.

## Access rules
- Admin accounts can see all students/classes.
- Teacher accounts can see only students in classes currently assigned to them.
- Student accounts never gain access to teacher analytics.
- RLS / server-side read rules must enforce this; the browser must not be trusted to filter sensitive rows by itself.

## In scope
### Usage
- last active
- activity this week
- recent sessions/attempts
- most recently used app/pathway

### Vocabulary progression
- current stage for each of the six Vocabulary pathways
- recent stage changes where authoritative history exists
- simple stalled indicator when a student has meaningful activity but no recent progression

### Unit Checks
- latest score
- best score
- attempts used / remaining

### Merits
- merit/achievement name
- reason
- earned date/time
- unread/new state for the teacher
- clear teacher alert count

### Needs attention
Simple rule-based flags only, such as:
- inactive for a defined period
- repeated weak Unit Check results
- meaningful activity with no recent progression

No predictive modelling.

### Recent activity
Chronological text feed combining useful teacher events such as:
- app/pathway use
- stage progression
- Unit Check completion
- merit earned

Do not expose raw student answers, essays, notes, or private learning text.

## UI
Add an `Activity` section alongside the existing admin sections.

Top controls:
- class filter
- student search/filter
- optional state filter: All / Needs attention / New merits

Main list/table should prioritise:
- student
- class
- last active
- current Vocabulary progression summary
- Unit Check summary
- new merits count
- attention state

Selecting a student opens a compact student detail view with text-only sections:
1. Usage
2. Vocabulary progression
3. Unit Checks
4. Merits
5. Needs attention
6. Recent activity

No graphs, charts, heatmaps, rankings, or visual analytics.

## Data approach
Use one teacher analytics read layer in Supabase rather than querying raw tables independently from the browser.

The read layer should combine, without changing existing student logic:
- `activity_events` for usage/recent activity
- authoritative Vocabulary progression state/history
- `vocabulary_unit_check_attempts` for Unit Check summaries
- a dedicated merits/teacher-alert structure where necessary

The dashboard is read-only except for marking merit alerts as read/seen.

## Merit alerts
Merits should generate a teacher-facing alert record tied to the student/class context at the time of earning.

The teacher should see an unread count in the Activity section and be able to mark alerts seen/read by opening or acknowledging them.

Do not use email as the default notification channel.

## Privacy
Never surface or persist through this feature:
- raw student answers
- essays
- student notes
- teacher notes/prompts
- private learning text beyond existing safe metadata

Analytics should use score/progression/activity metadata only.

## Non-goals
- class rankings
- leaderboards
- graphs/charts
- predictive analytics
- intervention planning system
- redesigning student apps
- changing Vocabulary mastery, progression, Stage Contract, Sets, XP, missions, games, sounds, scoring, or attempts
- changing Reading, Listening, Essay Writing, or unrelated app behaviour

## Approaches considered
### 1. Browser queries raw tables directly
Fastest initially, but creates brittle client-side joins and weaker security boundaries. Rejected.

### 2. Supabase teacher analytics read layer + Admin Activity UI
Chosen. Keeps access control authoritative, gives the UI clean records, and scales cleanly as more units/apps generate activity.

### 3. Infer everything from `activity_events`
Would avoid extra read models but makes progression/merits inferred instead of authoritative. Rejected.

## Implementation constraints
- Reuse the current admin shell and existing styling patterns.
- Keep existing Accounts / Classes / Import behaviour intact.
- Additive changes only where possible.
- Any Supabase migration must be reviewed separately before being applied to production.
- Development and preview first; production migration/deploy only after explicit approval.

## Success criteria
A teacher can open Activity and, without interpreting charts, answer within seconds:
- Which students have been active?
- Where is each student currently in Vocabulary progression?
- How are their Unit Checks going?
- Has anyone earned a new merit?
- Who needs attention?
- What has each student done recently?

The admin can do the same across all classes, while ordinary teachers are restricted to assigned classes only.

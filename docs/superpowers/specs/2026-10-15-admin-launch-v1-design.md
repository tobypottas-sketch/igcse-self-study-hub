# iGCSE Self-Study Hub — Admin Launch v1 Design

Date: 2026-10-15
Repository: `tobypottas-sketch/igcse-self-study-hub`
Supabase project: `iGCSE Self-Study` (`grjshlamooglytsajoun`)

## 1. Goal

Build a production-ready, admin-only management area so classes can begin using the iGCSE Self-Study Hub soon without manual Supabase administration.

The launch version must let an administrator:

- manage student and teacher accounts;
- manage classes;
- assign multiple teachers to multiple classes;
- move students between classes while preserving membership history;
- bulk-create an entire class from a simple CSV;
- automatically generate temporary passwords;
- reset passwords later;
- deactivate and reactivate accounts without deleting historical analytics.

The existing Hub home page, authentication flow, analytics tracking, app wrappers, and all four study apps must otherwise remain unchanged.

## 2. Non-negotiable privacy boundary

The existing privacy rule remains absolute.

Remote storage may contain only account/class information and analytics metadata already permitted by the project, such as app, mode, section, skill, score, max score, attempt, word count, support usage, and active seconds.

The admin feature must never introduce remote storage of:

- student essays;
- student answers;
- student notes;
- teacher notes;
- teacher prompts;
- free-text student work;
- any other learning content covered by the existing privacy rule.

Bulk-import files are only used to provision identity records. Their contents are not stored as uploaded files in Supabase.

## 3. Existing foundations to reuse

The current schema already provides:

- `profiles` with `role`, `display_name`, `school_email`, `active`, and `must_change_password`;
- `classes` with `active` status;
- `teacher_classes` for many-to-many teacher/class assignment;
- `student_class_memberships` with historical `started_at` / `ended_at` membership;
- one active class membership per student;
- RLS that allows admins to read profiles, classes, teacher assignments, and memberships.

The current Edge Functions already provide admin-gated actions for:

- creating a class;
- assigning a teacher to a class;
- transferring a student;
- provisioning one student or teacher account.

These should be extended rather than replaced wholesale.

## 4. Navigation model

The existing admin-only `Manage accounts` button on the Hub home page becomes the entry point to the admin area.

Recommended visible label: `Manage accounts` for launch continuity.

Clicking it opens an in-app Admin dashboard. The dashboard must include a clear `Back to Hub` control.

The Admin dashboard uses three focused sections or tabs:

1. `Accounts`
2. `Classes`
3. `Bulk Import`

This keeps the experience compact while avoiding one oversized page.

The admin UI must use the same Evidence Hub-inspired visual language already applied to the Hub landing page: deep navy typography, teal-to-blue accents, pale/white surfaces, rounded cards, and restrained professional spacing.

## 5. Authorization model

All sensitive actions are admin-only.

Only active users whose `profiles.role = 'admin'` may:

- create students;
- create teachers;
- create classes;
- assign or unassign teachers;
- move students;
- reset passwords;
- deactivate/reactivate accounts;
- run bulk import.

The UI hiding controls from non-admins is only convenience. Every privileged operation must independently verify admin authorization server-side using the same pattern already used by existing Edge Functions.

Teachers and students must not gain any extra admin read/write capability.

## 6. Accounts section

### 6.1 Account list

Show students and teachers in a searchable/filterable table or compact list.

Display fields:

- display name;
- school email;
- role;
- active/inactive status;
- current class for students;
- assigned classes for teachers where practical.

Provide role and status filters.

### 6.2 Manual account creation

Support creating one student or one teacher manually.

Student fields:

- display name;
- school email;
- class;
- temporary password generated automatically by the system.

Teacher fields:

- display name;
- school email;
- temporary password generated automatically by the system.

Teachers may be assigned to classes immediately or afterward in the Classes section.

Every newly created account must set:

- `active = true`;
- `must_change_password = true`.

### 6.3 Password reset

Admins can reset a student or teacher password.

Reset behavior:

- server generates a new temporary password;
- Supabase Auth password is updated;
- `must_change_password` is set to `true`;
- the new temporary password is returned once to the admin;
- the password is never written to a plaintext database table;
- the user must change it at next login.

### 6.4 Activate/deactivate

Admins can deactivate and reactivate users.

Deactivation must:

- set `profiles.active = false`;
- prevent normal use of the Hub through the existing active-profile checks / authorization model;
- preserve all profile, class-membership, and analytics history;
- never delete historical analytics rows.

Reactivation sets `profiles.active = true`.

No destructive user deletion is included in v1.

## 7. Classes section

### 7.1 Class list

Show active classes with:

- class name;
- student count;
- assigned teachers.

### 7.2 Create class

Allow an admin to create a class name using the existing backend pattern.

Class names remain unique.

### 7.3 Teacher assignment

Support many-to-many teacher/class relationships.

Admins can:

- assign one or more teachers to a class;
- assign one teacher to multiple classes;
- remove a teacher from a class without deleting the teacher account.

Teacher unassignment requires a new admin backend action because the existing function only supports assignment.

### 7.4 Student movement

Admins can move a student from one class to another.

The existing atomic transfer mechanism should be reused so that:

- the previous active membership receives an `ended_at` timestamp;
- the new membership receives a new `started_at` timestamp;
- historical class membership is retained;
- a student still has only one active class at a time.

No historical membership row is deleted.

### 7.5 Class deletion / archival

Destructive class deletion is out of scope for v1.

If needed later, class archival/deactivation can be added as a separate controlled feature.

## 8. Bulk Import section

### 8.1 Workflow

The admin must choose the destination class before selecting the import file.

The upload file contains only:

- `Student name`
- `School email`

The class name does not need to be repeated on each row.

### 8.2 Accepted file format

Launch support should prioritize CSV because it is simple, browser-friendly, and easy to export from Excel/Numbers/Google Sheets.

If direct `.xlsx` support is inexpensive and can be added without introducing fragile dependencies, it may be added later, but CSV is sufficient for v1 launch.

### 8.3 Validation before provisioning

The client parses the CSV locally and presents a preview.

Before account creation, validate:

- missing student name;
- missing email;
- malformed email;
- duplicate emails within the uploaded file;
- email that already exists in `profiles`;
- missing or inactive target class;
- duplicate rows.

The admin must see validation errors before starting provisioning.

Invalid rows must not be silently skipped.

### 8.4 Password generation

Temporary passwords are generated server-side, not in the browser.

Passwords must be:

- random enough for temporary credential use;
- compatible with Supabase Auth password requirements;
- unique per created account for the import run;
- shown to the admin only in the provisioning result.

Passwords must never be stored in plaintext after provisioning.

### 8.5 Bulk provisioning behavior

Use a purpose-built server-side bulk provisioning action rather than sending 20–30 unrelated browser requests to the current single-user provisioning endpoint.

The backend must:

1. verify active admin authorization;
2. validate the selected class;
3. validate the entire submitted batch again server-side;
4. detect existing emails;
5. generate temporary passwords;
6. create each Supabase Auth user;
7. create the corresponding profile;
8. create active student-class membership;
9. return a per-row result.

The operation must not silently claim full success if some rows fail.

### 8.6 Failure handling

For a row that fails after an Auth user is created but before profile/membership setup completes, clean up that newly created Auth user so no orphan account is retained.

A failure in one row should not erase successfully created accounts from earlier rows in the batch.

The result screen must clearly separate:

- created students;
- failed rows;
- reason for each failure.

A retry should be possible using only failed rows after the admin fixes the cause.

### 8.7 Credential sheet

After successful provisioning, show a credential result containing:

- student name;
- school email;
- temporary password.

Provide:

- `Copy all`;
- browser-print-friendly formatting.

The UI must clearly warn the admin to save/print the credentials before leaving the result because passwords are not retrievable later in plaintext.

The credential sheet is generated from the one-time response and is not stored remotely.

## 9. Backend changes

Prefer extending the current admin Edge Function pattern rather than creating many unrelated functions.

Required privileged backend capabilities:

- list/read remains handled by existing RLS-backed Supabase queries from the authenticated admin client;
- bulk provision students;
- reset password;
- activate/deactivate account;
- unassign teacher from class;
- retain current create class, assign teacher, and transfer student actions.

Implementation may either:

- extend `admin-provision-user` with clearly separated actions for single provision, bulk provision, reset password, and active-state changes; and extend `admin-class-action` for teacher unassignment;

or

- create one additional focused admin account-action function if that produces cleaner validation and testing boundaries.

Do not merge unrelated admin responsibilities into a single unmaintainable function.

## 10. Frontend structure

Recommended structure:

- `src/views/admin.js` — top-level admin dashboard renderer;
- `src/admin/accounts.js` — account reads/actions client helpers;
- `src/admin/classes.js` — class reads/actions client helpers;
- `src/admin/import.js` — CSV parsing, local validation, and bulk-provision request helpers;
- `src/app.js` — route/state wiring for entering and leaving Admin;
- `styles.css` — admin visual styling using existing Hub design tokens/patterns.

If the admin view grows beyond a reasonable size, split into focused render helpers rather than making `admin.js` monolithic.

## 11. Error handling and UX rules

- Never fail silently.
- Show concise human-readable messages.
- Keep forms disabled while a destructive or provisioning action is running.
- Prevent accidental duplicate submissions.
- Ask for confirmation before deactivation or password reset.
- Do not require confirmation for low-risk navigation/filtering.
- Preserve the admin’s current section after recoverable errors.
- Never expose raw Supabase secret/service-role information to the browser.

## 12. Security requirements

- Preserve current XSS escaping patterns.
- Any user-supplied display names, emails, class names, and error text rendered into HTML must be escaped.
- Do not weaken the existing security test that rejects injected `<img>` HTML.
- The known local Evidence Hub Schools logo asset remains the only intended brand image exception where relevant.
- Edge Functions must reject unauthenticated callers.
- Edge Functions must reject inactive users.
- Edge Functions must reject teachers/students for admin actions.
- Never trust client-supplied role values or active-state assertions without server verification.

## 13. Testing requirements

Add or extend tests for:

### Frontend

- admin button routes to Admin for admins;
- non-admin users never receive the admin controls;
- Back to Hub works;
- Accounts / Classes / Bulk Import sections render correctly;
- forms escape unsafe text;
- CSV parser accepts valid rows;
- CSV validation catches malformed/missing/duplicate rows;
- duplicate submissions are prevented;
- credential result renders only returned one-time passwords.

### Backend validation

- only admins can invoke privileged account actions;
- only admins can invoke privileged class actions;
- single account creation still works;
- bulk provision rejects malformed batches;
- bulk provision rejects inactive/missing class;
- duplicate existing emails are reported;
- partial failures return explicit per-row results;
- orphan Auth users are cleaned up on profile/membership failure;
- reset password sets `must_change_password = true`;
- activate/deactivate changes only intended account state;
- teacher unassignment removes only the selected relationship;
- student transfer preserves history.

### Regression

Run the full Hub test suite and the existing security/XSS suite.

No changes should be required in Reading, Listening, Paraphrasing, or Essay Writing repos for this feature.

## 14. Deployment and verification

Implementation must not be called complete merely because a PR merges.

Before claiming the feature is live:

1. full Hub test suite passes;
2. security/XSS tests pass;
3. Supabase migrations/functions required by the feature are successfully deployed;
4. exact production commit is identified;
5. GitHub Pages deployment for that exact commit succeeds;
6. System Audit for that exact commit succeeds where applicable;
7. production admin flow is smoke-tested with an admin account;
8. a non-admin account is confirmed unable to access admin actions.

## 15. Explicitly out of scope for v1

To keep launch focused, the following are not part of this version:

- deleting users;
- deleting historical analytics;
- deleting historical class memberships;
- destructive class deletion;
- teacher-facing analytics dashboards;
- student work/content storage;
- sending passwords by email;
- automated parent accounts;
- complex SIS integration;
- broad school-rollout multi-tenant administration beyond the current project architecture.

## 16. Launch success criteria

The feature is ready for class rollout when an administrator can, without opening Supabase manually:

1. create a class;
2. upload a CSV containing student names and school emails;
3. create the whole class with generated temporary passwords;
4. print/copy the resulting credentials;
5. create teacher accounts;
6. assign teachers to one or more classes;
7. manually create an individual student when needed;
8. move a student to another class while retaining history;
9. reset a forgotten password;
10. deactivate/reactivate an account;
11. return to the Hub safely;
12. complete all of the above without exposing or remotely storing prohibited student learning content.

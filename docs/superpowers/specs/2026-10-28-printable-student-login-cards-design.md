# Printable Student Login Cards — Design

## Intent
Create an IXL-style class login-card workflow for the iGCSE Self-Study Hub. A teacher imports/provisions students, the system creates simple readable student passwords, and the teacher prints one master A4 credential sheet containing cut-out cards to hand to students.

## Goals
- One master printable class sheet, designed for browser Print / Save as PDF.
- Individual cut-out cards, approximately 8 students per A4 page.
- Each card shows student name, school email, password, Self-Study Hub URL, and a short sign-in instruction.
- Passwords are simple, readable and permanent for normal use; no forced first-login password change.
- Teacher keeps the master PDF so the same password can be re-issued if a student loses their card.
- Existing security boundary remains: Supabase Auth stores passwords as hashes; plaintext passwords are never written to database tables or GitHub.
- Any active class can deliberately receive a fresh permanent credential set without deleting/recreating its student accounts or memberships.

## Non-goals
- No server-side PDF storage.
- No database column containing plaintext passwords.
- No automatic recurring password rotation.
- No change to Vocabulary, Reading, Listening, Essay Writing, Student Activity, mastery, merits, scoring, or progression.
- No automatic recovery/reconstruction of a retired class; class membership remains a separate admin concern.

## Password design
Use a student-friendly generated password with no punctuation or visually confusing characters. Format: two short common words plus two digits, e.g. `TigerRiver42` or `MangoCloud27`.

The password is intended to remain the student's normal password. The system must not set `must_change_password=true` for newly provisioned students using this workflow.

The teacher's saved master PDF is the recovery source for the same password. The application cannot recover the password later from Supabase because Auth stores only a secure hash.

## Student password-change behaviour
To keep the printed teacher master sheet authoritative, students should not be encouraged or routed into a first-login password-change flow. The login experience should direct a student who has lost their credentials to their teacher rather than encouraging an independent password reset that would make the printed card stale.

Teacher/admin-controlled recovery tooling can remain available; student credential changes should be deliberate teacher/admin actions, not part of normal student sign-in.

## Teacher workflow
### Future bulk imports
1. Admin opens Bulk Import and selects destination class.
2. CSV is validated as today.
3. Admin creates the student accounts.
4. Backend generates one permanent friendly password per student.
5. Successful one-time response contains the generated credentials.
6. Admin sees a `Print class login cards` action.
7. Browser opens the print layout; teacher prints or saves one master PDF.
8. Teacher cuts the cards and distributes them.

### Existing active classes
Provide a class credential action that deliberately assigns a new friendly permanent password to every active student currently in the selected active class and immediately renders the printable master sheet. It does not delete/recreate accounts or memberships.

The action must clearly warn that it changes the affected students' current passwords before execution.

### Retired classes
The previously used `9 ESL 2` class was retired by the admin during this work. Its student accounts are not automatically deleted by class retirement, but rebuilding/reassigning that class is separate from the credential-card feature. Once students belong to an active class, the same class credential action can issue their printable credentials.

## Printable layout
- A4 portrait.
- Approximately 8 cards per page in a 2-column grid.
- Clear dashed/cut borders.
- High-contrast black/white friendly print styling; no reliance on background colour.
- Each card contains:
  - `iGCSE Self-Study Hub`
  - student display name
  - school email
  - password in large monospace type
  - hub URL
  - `Sign in with the details above. Keep this card safe.`
- No teacher-only notes printed on individual cards.
- Print-only CSS hides admin navigation, buttons, notices and other screen UI.

## Existing implementation to reuse
- `admin-provision-user` already creates Supabase Auth users and already returns generated plaintext credentials once in the response.
- Bulk Import already renders a one-time credential table with `Copy all` and `Print` controls.
- The new workflow extends these surfaces rather than introducing a separate credential store.

## Security / privacy
- Plaintext passwords exist only in memory in the one-time provisioning/issuance response and in the teacher's locally printed/saved PDF.
- Do not persist plaintext passwords in Supabase tables, logs, source control, analytics, browser localStorage, or app caches.
- Do not include real student credentials in tests; use synthetic fixtures only.
- Any class-wide credential regeneration must require an explicit admin action and confirmation.

## Approaches considered
### 1. Browser print / Save as PDF — selected
Render a dedicated print view and invoke the browser print dialog. Lowest complexity, no server-side credential files, easiest to keep private, and matches the teacher's desired IXL-style workflow.

### 2. Server-generated downloadable PDF
Rejected. It adds PDF-generation/storage complexity and creates unnecessary risk around temporary files containing student credentials.

## Acceptance criteria
- A newly imported student can sign in directly with the generated password and is not forced to change it.
- The teacher can print/save a master class credential sheet immediately after provisioning.
- Cards are cleanly printable and cuttable on A4.
- Passwords contain no symbols and are easy to transcribe.
- An active class can receive a fresh credential pack without deleting its class/accounts/memberships.
- No plaintext credential is persisted in Supabase or GitHub.
- Students who lose a card are instructed to ask their teacher.
- Existing non-auth app behaviour remains unchanged.

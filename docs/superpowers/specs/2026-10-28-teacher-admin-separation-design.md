# Teacher/Admin Account Separation Design

## Intent
Teachers must not appear mixed into the student account directory. Every teacher created in the Hub must retain the `teacher` role for class assignment while receiving the same administration capability as an admin. Teacher credentials must be short/readable, and teachers/admins must be able to change their own password later. Students must not be offered password-change controls.

## Goals
- Keep `student`, `teacher`, and `admin` roles distinct.
- Treat active `teacher` and `admin` profiles as admin-capable in the Hub UI, Edge Functions, and required read policies.
- Give newly provisioned/reset staff readable word-word-number passwords.
- Do not force staff to change that password immediately; expose an optional Change password control to staff only.
- Render separate Students and Teachers / Admins directories.
- Preserve teacher↔class assignments and existing admin assignment support.

## Non-goals
- Do not change Vocabulary progression, scoring, merits, or student activity semantics.
- Do not redesign student credential cards.
- Do not convert teachers to `role=admin`.

## Approach
Chosen approach: retain `teacher` as the role and broaden admin capability checks to `['teacher','admin']`. This preserves existing teacher assignment behavior while giving teachers the same operational controls. The Accounts screen consumes the existing `accounts` (student/teacher) plus `teachingAdmins` data and renders two lists.

## Password behavior
- Student UI: no Change password control.
- Teacher/admin UI: Change password control available from Home.
- New teacher password: same readable word-word-number generator used for student credentials.
- Staff provisioning/reset does not set `must_change_password=true`; password change remains optional.

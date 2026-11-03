# Student Self-Service Password Change

## Goal
Allow active student accounts to change their own password after normal sign-in, while preserving the existing teacher/admin password-reset capability for forgotten passwords.

## Behaviour
- Active students see a small **Change password** button on the Hub home screen.
- The button opens the existing password-change screen.
- For a voluntary password change, the screen is cancellable and returns the user to the Hub home screen.
- Existing first-sign-in / forced-reset behaviour remains mandatory and non-cancellable.
- Active teachers/admins retain their existing self-service password change behaviour.
- Teacher/admin account management retains the existing `resetAccountPassword` path; no changes to provisioning, Supabase schema, or password-reset backend are required.
- Inactive accounts must not gain self-service password-change access.

## Security / privacy
- No passwords are logged, stored in app state, or exposed in UI beyond the existing password form.
- Reuse the existing `changePassword` auth function and existing reset backend.
- No student data model or Supabase schema changes.

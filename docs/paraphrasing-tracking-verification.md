# Paraphrasing Tracking Verification

Date: 2026-10-13

## Implemented

- Append-only `activity_events` table in the dedicated iGCSE Self-Study Supabase project.
- Database trigger stamps authenticated user identity and current class; browser payloads cannot choose another user/class.
- Student self-read, admin all-read, and current-teacher full-student-history RLS policy.
- No authenticated update/delete permissions on activity events.
- Privacy-safe event builder that strips unapproved metadata/free text.
- Same-origin Paraphrasing wrapper inside the Hub; original Paraphrasing repository and public direct link remain unchanged.
- Tracking for app open, active study time, starter/set attempts, Exercise 3 numeric score, and Exercise 4 useful-points/word-count data.
- No student-written synonym, paraphrase, notes, or summary text is sent to Supabase.
- Race-safe wrapper attachment if the iframe loads before or after authentication resolves.

## Verification evidence

- New tracking-core tests: 5/5 passing.
- Simulated authenticated RLS insert succeeded and the database stamped the expected admin user ID.
- RLS/grants verified: SELECT+INSERT only for authenticated clients; UPDATE+DELETE denied.
- Supabase security advisor: no new schema/RLS findings. The only warning is `auth_leaked_password_protection`, which current Supabase documentation states is Pro-only and was already accepted for this Free-plan project.
- Performance advisor: unused-index information only, expected before real activity data exists.

## Deliberately not live yet

The Paraphrasing app registry still points to the original direct app until this branch is merged and GitHub Pages publishes `paraphrasing.html`. After deployment, apply the included `paraphrasing_tracked_launch` migration and run the first real browser event test.

## Isolation boundary

Evidence Hub, Reading, Essay Writing, Listening, and the Paraphrasing production repository remain untouched by this tracking release.

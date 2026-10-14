# Self-Study Foundation Verification

Date: 2026-10-13

## Foundation verified

- Dedicated Supabase project: `iGCSE Self-Study` (`grjshlamooglytsajoun`), Singapore region.
- Evidence Hub database/project is not used by the Hub configuration.
- Foundation schema exists for profiles, classes, teacher assignments, student class membership history, app registry and activity events.
- Row Level Security is enabled on exposed foundation tables.
- Anonymous profile/activity reads are not granted.
- Student transfers are atomic and preserve membership history.
- Privileged account/class operations run through JWT-protected Edge Functions; browser code contains only a publishable key.
- Four app records are registered and the hosted Hub login/forced-password-change/app-launch journey has been proven.
- Student-facing dynamic HTML is escaped and non-HTTPS launch URLs are rejected.
- Public Auth sign-up remains disabled at project level; email/password login remains enabled.

## Tracking verified

- Paraphrasing and Reading are launched through transparent Hub wrappers; the original app repos/direct links remain untouched.
- Stored events contain app/activity identifiers, numeric outcomes and active-time estimates; student answer text is not stored remotely.
- Current pilot event totals confirm both pipelines are writing centrally:
  - Paraphrasing: 16 question attempts and 90 seconds of active-time events.
  - Reading: 15 question attempts and 150 seconds of active-time events.
- Reading grouped note-completion scoring remains separate from ordinary question-attempt accuracy.

## Teacher Activity dashboard verification

- Four teacher analytics RPCs exist for authorised classes, class overview, student summary and privacy-safe recent activity.
- Public RPCs are `SECURITY INVOKER` wrappers; privileged aggregation implementations live in the non-exposed `private` schema.
- `anon` has no execute privilege on the public teacher analytics RPCs; `authenticated` does.
- Admin/teacher/student role checks are enforced in the backend implementation as well as the browser UI.
- Transfer-history logic limits former-class teacher visibility to events that fell inside the former membership window; a currently authorised teacher may see the student's earlier history.
- Accuracy uses valid `question_attempt` score/max-score data only; no valid denominator renders `—` rather than `0%`.
- Weakest skill requires at least two valid attempts.
- Activity UI escapes student/class labels and never renders answer text, prompt text, raw metadata or internal IDs.
- Activity load failures have Retry/Home/Logout recovery without affecting the student app launcher.
- Local feature + regression verification passes 39/39 tests, plus syntax checks for the changed browser modules.

## Current pilot limitation

The Self-Study project currently has 0 classes, 0 student profiles and 0 teacher profiles; the existing tracked activity belongs to the admin test account. Therefore the event store and analytics permission surface can be verified now, but a real class table/student drill-down cannot display a student row until the first class and student account are created. No synthetic Auth users were inserted merely to make the dashboard look populated.

## Security advisor

After the teacher analytics hardening, the only Supabase security warning is `Leaked Password Protection Disabled`. Supabase documents leaked-password protection as a paid-plan feature; this expected Free-plan warning is unrelated to the Activity dashboard, RLS or RPC permissions.

## Isolation boundary

No Evidence Hub code, Evidence Hub database schema, or original Paraphrasing/Reading/Listening/Essay Writing production repo was modified by the teacher Activity dashboard work.

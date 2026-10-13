# Paraphrasing Activity Tracking Plan

Date: 2026-10-13

## Goal

Add the first live Self-Study activity stream using the existing Paraphrasing app, while keeping the app usable for anyone who opens the old direct link without a Hub session.

## Hard boundaries

- Do not touch Evidence Hub.
- Do not touch Reading, Essay Writing, or Listening yet.
- Do not force direct-link users to authenticate in this first pilot.
- Do not store student-written answers, summary text, or other free-text responses remotely.
- Existing localStorage progress remains unchanged and continues to drive the student-facing Results/Review screens.

## Backend

Create append-only `activity_events` in the dedicated iGCSE Self-Study Supabase project.

Fields:
- authenticated user
- class at time of event
- app key
- event type
- skill
- set/activity identifiers
- mode
- strong/correct flag
- numeric score/max score where meaningful
- active seconds where meaningful
- small JSON metadata containing only non-sensitive numeric/categorical data
- timestamp

Security:
- RLS enabled.
- Browser inserts only as the signed-in user.
- User/class identity is stamped by the database, not trusted from browser payloads.
- Students can read only their own events.
- Admin can read all events.
- Teachers can read events for students currently in classes assigned to them, including the student's earlier event history.
- No browser update/delete policy: events are append-only.

## Paraphrasing integration

Add a small isolated tracking module rather than rewriting the existing dashboard.

Behaviour:
1. Reuse the Hub's existing Supabase browser session on the shared `tobypottas-sketch.github.io` origin.
2. If a valid Self-Study account exists, emit `app_open`.
3. Track active study time in coarse chunks only while the page is visible and the student has interacted recently.
4. Emit attempt events from the existing checking functions.
5. Exercise 3 records numeric notes score/max score.
6. Exercise 4 records useful-points score/max score plus word-count/overlap numbers only; never the written summary.
7. Existing local `recordResult()` logic remains authoritative for the student UI.
8. If no valid Hub session exists, tracking silently becomes a no-op and the app behaves exactly as it does today.

## First-pilot event types

- `app_open`
- `active_time`
- `question_attempt`
- `exercise_result`

## Verification

- Direct anonymous Paraphrasing link still works.
- Hub-authenticated Paraphrasing visit creates an `app_open` event for the correct account.
- Attempts create rows with correct app/skill/mode/result values.
- Exercise 3 and 4 store numeric scores but no answer text.
- Active-time rows accumulate only during visible/recently-active use.
- RLS blocks another student from reading another student's events.
- Supabase security advisor checked after migration.
- Existing Paraphrasing behaviour/results remain unchanged.

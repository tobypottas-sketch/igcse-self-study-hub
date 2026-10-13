# Listening Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add privacy-safe Listening tracking through the Self-Study Hub wrapper so genuine listening engagement, question outcomes, section use, and transcript-support use appear correctly in the existing teacher Activity dashboard.

**Architecture:** Follow the established same-origin iframe wrapper pattern used by Paraphrasing and Reading. Keep Listening-specific event semantics in a focused `listening-core.js`, keep browser instrumentation in `listening-wrapper.js`, extend the shared tracker only for whitelisted categorical Listening metadata, and leave the original Listening repo untouched.

**Tech Stack:** Vanilla HTML/JS, existing Supabase JS client and `activity_events` table, Node built-in test runner, GitHub Pages/Render preview.

**Spec:** `docs/superpowers/specs/2026-10-13-listening-tracking-design.md`

## Global Constraints

- Do not modify `tobypottas-sketch/igcse-listening`.
- Do not touch Evidence Hub.
- No answer choice, prompt, explanation, hint, transcript text, speaker text, or audio content may be stored remotely.
- Tracking failures must never block the Listening app.
- Audio playback counts as active engagement only while the page is visible and audio is actually playing.
- Paused, ended, or hidden audio must not count.
- Practice and Exam Mode semantics must remain intact.
- Transcript support is one lightweight support signal, not chunk-level surveillance.
- Playback control clicks are timing inputs, not teacher-facing events.

## Review Focus

- Exam Mode must not expose correctness before submission, and later reconciliation must not double-count attempts.
- Long uninterrupted playback must continue counting active time beyond the normal 120-second pointer/keyboard idle threshold.
- Hidden-tab audio must not accumulate active time even if the media element reports playing.
- Transcript support must not generate repeated noise when the drawer is opened/minimised/reopened repeatedly in one session.
- Repeated section navigation must not flood analytics with duplicate section-use events.

---

### Task 1: Listening event model and privacy whitelist

**Files:**
- Create: `src/tracking/listening-core.js`
- Modify: `src/tracking/core.js`
- Create: `tests/listening-tracking-core.test.js`

**Interfaces:**
- Produces: `buildListeningAttempt(...)`, `buildListeningExamResult(...)`, `buildListeningSupportEvent(...)`, `buildListeningSectionEvent(...)`.
- Uses: existing `buildTrackingEvent(input)` privacy boundary.

- [ ] **Step 1: Write failing tests**

Cover:
- `app_key='listening'`
- practice correct and incorrect attempts
- exam pre-submit attempt without correctness/score
- post-submit final result payload with correctness and numeric score
- categorical section/support metadata only
- answer choice, prompt, explanation, hint, transcript text, and arbitrary free-text metadata stripped
- no duplicate attempt semantics encoded into reconciliation payloads

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test tests/listening-tracking-core.test.js`

Expected: FAIL because Listening-specific builders/metadata are not yet implemented.

- [ ] **Step 3: Implement minimal event builders and whitelist changes**

`src/tracking/listening-core.js` should derive only stable categorical identifiers such as section id, question number, question type/skill, mode, attempt number, and support subtype.

`src/tracking/core.js` should whitelist only the exact new Listening metadata keys/values required by the spec; do not broaden free-text handling.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `node --test tests/listening-tracking-core.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `feat: add listening tracking event model`

---

### Task 2: Audio engagement state machine

**Files:**
- Create: `src/tracking/listening-engagement.js`
- Create: `tests/listening-engagement.test.js`

**Interfaces:**
- Produces: `shouldCountListeningTime({ visible, audioPlaying, recentlyInteractive })` and a small state helper for flush/tick decisions.
- Consumed by: Listening wrapper in Task 4.

- [ ] **Step 1: Write failing tests**

Cover:
- visible + playing counts even after more than 120 seconds without input
- paused does not count
- ended does not count
- hidden does not count
- visible + not playing may still use normal recent-interaction logic
- flush buckets remain capped to existing `active_seconds <= 600`

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test tests/listening-engagement.test.js`

Expected: FAIL because helper does not exist.

- [ ] **Step 3: Implement minimal engagement helper**

Keep policy pure and deterministic so browser timing code only asks whether the current 30-second tick counts.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `node --test tests/listening-engagement.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `feat: add listening audio engagement rules`

---

### Task 3: Listening wrapper shell

**Files:**
- Create: `listening.html`
- Create: `tests/listening-wrapper-shell.test.js`

**Interfaces:**
- Loads: `https://tobypottas-sketch.github.io/igcse-listening/` in `#practiceFrame`.
- Loads module: `src/tracking/listening-wrapper.js`.

- [ ] **Step 1: Write failing shell test**

Assert iframe URL, wrapper status element, and Listening tracking module path.

- [ ] **Step 2: Run test and verify RED**

Run: `node --test tests/listening-wrapper-shell.test.js`

Expected: FAIL because `listening.html` does not exist.

- [ ] **Step 3: Add wrapper HTML matching established Reading/Paraphrasing structure**

No product redesign; only the wrapper shell.

- [ ] **Step 4: Run test and verify GREEN**

- [ ] **Step 5: Commit**

Commit message: `feat: add listening wrapper shell`

---

### Task 4: Browser instrumentation

**Files:**
- Create: `src/tracking/listening-wrapper.js`
- Create: `tests/listening-instrumentation.test.js`

**Interfaces:**
- Consumes: Task 1 builders and Task 2 engagement helper.
- Instruments existing Listening globals: `answerQuestion`, `openSection`, `openTranscriptDrawer`, `finishExam` and `#mainAudio` events.
- Writes through existing Supabase `activity_events` client.

- [ ] **Step 1: Write failing instrumentation tests**

Cover:
- wrapper authenticates against current Self-Study session/profile before enabling tracking
- one `app_open`
- practice answer events use current app state after `answerQuestion`
- exam answers before submit do not expose correctness
- `finishExam` reconciles final correctness without creating a second question attempt
- section-use event de-duplicates repeated opens in the same session
- transcript-support event emits once per section/session or equivalent bounded policy
- audio `play/pause/ended/visibilitychange/pagehide` feed engagement timing correctly
- tracking exceptions are caught and original app functions still return/work

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test tests/listening-instrumentation.test.js`

Expected: FAIL because wrapper does not exist.

- [ ] **Step 3: Implement minimal wrapper**

Use the same iframe-load race protection and fail-soft `send/track/wrapAfter` style already used by Reading. Do not pass option letters, prompts, explanations, transcript text, or free-text payloads to builders.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `node --test tests/listening-instrumentation.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `feat: instrument listening activity`

---

### Task 5: Dashboard compatibility and recent-activity labels

**Files:**
- Modify only if required: `src/views/activity-model.js`
- Modify only if required: `src/views/activity.js`
- Create: `tests/listening-dashboard.test.js`

**Interfaces:**
- Consumes existing analytics RPC output; no new dashboard backend unless tests prove necessary.

- [ ] **Step 1: Write failing/characterisation tests**

Assert:
- Listening appears as an app label
- valid scored Listening attempts contribute to accuracy
- exam pre-submit/support/section events do not count as incorrect attempts
- Listening skills appear in skill breakdown
- support/section events render as secondary recent activity if shown

- [ ] **Step 2: Run test**

If existing dashboard already passes, treat as characterisation and make no production change. If not, verify the precise failure before editing.

- [ ] **Step 3: Make only the minimal dashboard adjustment required**

Do not redesign the Activity UI.

- [ ] **Step 4: Run test and verify GREEN**

- [ ] **Step 5: Commit only if production code changed**

Commit message: `feat: surface listening activity in dashboard`

---

### Task 6: Launch registry migration

**Files:**
- Create: `supabase/migrations/20261013XXXXXX_listening_tracked_launch.sql`
- Modify: `supabase/seed.sql`
- Create/modify: registry migration test if an existing pattern exists.

**Interfaces:**
- Sets `apps.listening.launch_url` to `https://tobypottas-sketch.github.io/igcse-self-study-hub/listening.html` when rollout is approved.

- [ ] **Step 1: Write migration/registry test first**

Pin the exact Listening wrapper URL and ensure other app URLs are unchanged.

- [ ] **Step 2: Run and verify RED**

- [ ] **Step 3: Add migration and seed update**

Do not alter the original direct Listening URL or Bitly link.

- [ ] **Step 4: Verify migration SQL and test GREEN**

- [ ] **Step 5: Commit**

Commit message: `feat: route listening through tracked wrapper`

---

### Task 7: Full verification and preview rollout

**Files:**
- Update: `docs/foundation-verification.md` or add a focused Listening verification note if needed.

**Interfaces:**
- Uses existing Render preview service for `feat/teacher-activity-dashboard`.

- [ ] **Step 1: Run focused Listening suite**

Run all new Listening tests together.

Expected: 0 failures.

- [ ] **Step 2: Run full Hub suite**

Run: `npm test`

Expected: 0 failures.

- [ ] **Step 3: Syntax-check browser modules**

Run `node --check` on new/modified JS modules.

- [ ] **Step 4: Deploy/allow auto-deploy to existing Render preview**

Do not merge to `main` yet.

- [ ] **Step 5: Manual preview test**

Test through the Hub preview:
- open Listening
- play audio continuously for >2 minutes without interaction
- pause and confirm no further active time accrues
- answer a mix of practice questions
- open transcript support
- visit multiple sections
- complete a small Exam Mode run and submit

- [ ] **Step 6: Inspect stored events**

Verify:
- one app-open event
- active-time events reflect visible playback and stop on pause/hidden state
- no option letters/prompts/transcript text stored
- practice outcomes correct
- exam pre-submit rows do not leak correctness
- final exam reconciliation exposes results without double-counting attempts
- section/transcript support events are bounded, not noisy

- [ ] **Step 7: Inspect teacher dashboard**

Confirm Listening appears as third app with sensible active time, accuracy, skills, and compact recent activity.

- [ ] **Step 8: Final branch review**

Confirm original Listening repo and Evidence Hub have zero changes.

- [ ] **Step 9: Commit verification note**

Commit message: `test: verify listening tracking end to end`

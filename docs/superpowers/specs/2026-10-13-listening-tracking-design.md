# Listening Tracking Design

## Goal

Add meaningful, privacy-safe activity tracking for the existing iGCSE Listening app through the Self-Study Hub, without modifying the original `igcse-listening` repository and without touching Evidence Hub.

## Scope

Listening will launch through a same-origin Self-Study wrapper, following the established Paraphrasing and Reading pattern. The wrapper observes the existing Listening app in an iframe and sends approved events to the existing `activity_events` backend.

Out of scope:
- changes to the original Listening app
- Evidence Hub integration
- storing student answer text, answer choices, prompts, transcript text, or audio content
- detailed surveillance-style logging of every playback control interaction

## Tracking Model

### App open

Record one `app_open` event when the authenticated student launches Listening through the Hub wrapper.

### Active listening time

Listening requires different engagement logic from Reading and Paraphrasing.

Active time counts when:
- the wrapper/page is visible, and
- the Listening audio element is actively playing.

Active time stops when:
- audio is paused,
- audio ends,
- the page/tab becomes hidden,
- the student leaves or changes context in a way that stops playback.

Pointer/keyboard interaction may still count as engagement when audio is not playing, using the existing wrapper pattern, but active audio playback must override the normal idle timeout so a student can listen for several minutes without touching the screen and still accumulate legitimate study time.

Time is still reported as engaged study time, not precise surveillance time.

### Question attempts

Wrap the existing `answerQuestion(n, choice)` flow.

Record a `question_attempt` event with:
- `app_key = listening`
- question/section identity
- current mode (`practice` or `exam`)
- skill/category derived from the Listening exercise/question type
- attempt number within the current wrapper session
- correctness when it is legitimately knowable
- numeric `score=1/max_score=1` for a correct attempt and `score=0/max_score=1` for an incorrect attempt when correctness is available

Never send:
- selected option letter
- answer text
- question prompt
- explanation or hint text

### Exam Mode

The tracker must preserve existing Exam Mode semantics.

Before exam submission:
- record that a question was answered if useful for attempt/completion evidence
- do not expose correctness remotely before the app itself reveals correctness

After submission:
- emit or reconcile result events so final correctness becomes available to analytics without storing the selected answer itself

The implementation must avoid double-counting attempts when exam results become known.

### Section use

Track meaningful section engagement, not every navigation click.

A section may be considered used when the student opens it and/or meaningfully plays its audio. The stored identity should be the existing section id/title category, not free text.

This evidence is intended to answer questions such as whether a student practises only one Listening exercise type.

### Transcript support

Record a lightweight transcript-support event when the student deliberately opens transcript support in Practice Mode.

Do not record:
- every transcript chunk highlight
- transcript scrolling
- every seek
- transcript text
- speaker text

The teacher-facing meaning is simply that transcript support was used.

### Playback controls

Play, pause, resume, restart, and seek interactions are implementation signals for engagement timing. They are not separate teacher-facing activity events unless later evidence shows a clear pedagogical need.

## Event Metadata

Use the existing privacy whitelist in the shared tracking core. Add only categorical Listening metadata required for analytics, such as:
- question type / skill key
- section id
- mode
- event subtype for section/transcript support if required

No raw free text may pass through the tracking payload builder.

## Wrapper Architecture

Create `listening.html` in the Self-Study Hub.

The wrapper will:
1. verify the current Self-Study Supabase session and active profile
2. load the original Listening app from `https://tobypottas-sketch.github.io/igcse-listening/` in a same-origin iframe
3. wait for the iframe app to be ready
4. instrument existing Listening functions and the `mainAudio` element without changing the original repo
5. write tracking events through the existing tracking API/core
6. fail soft: tracking errors must never prevent the Listening app from working

## Dashboard Compatibility

Listening events must naturally flow into the existing Activity dashboard.

Expected teacher-facing outcomes:
- Listening appears as a third app in app usage
- Listening active time contributes to total active time
- valid Listening question attempts contribute to accuracy
- Listening skills appear in the skill breakdown
- transcript/section support events may appear only in Recent activity if useful, and should be visually secondary to question outcomes

No combined metric should treat non-scored support events as incorrect attempts.

## Launch Registry

After wrapper verification, update the Self-Study `apps` registry so Hub launches for Listening point to:

`https://tobypottas-sketch.github.io/igcse-self-study-hub/listening.html`

The direct original Listening URL and any Bitly link remain unchanged.

## Testing

Use TDD.

Tests must cover:
- `app_key=listening`
- allowed Listening categorical metadata
- rejection/stripping of answer choice, prompt, explanation, transcript text, and other free text
- practice-mode correct/incorrect attempts
- exam-mode pre-submit behaviour
- exam-mode final result reconciliation without duplicate attempts
- audio-playing engagement counting beyond the normal idle threshold
- paused/ended/hidden audio not counting
- transcript support produces one lightweight support event rather than chunk-level noise
- section-use tracking does not create excessive duplicate events
- tracking failures do not break the Listening practice app

## Security and Privacy

- existing Self-Study authentication only
- existing `activity_events` RLS and server-side identity/class stamping remain authoritative
- no service-role credentials in the browser
- no raw answers or transcript content stored remotely
- school-aged student data remains minimal

## Rollout

1. implement on the current Self-Study feature branch
2. run focused Listening tests red/green
3. run full Hub suite
4. deploy through the existing Render preview
5. manually test Listening through the preview
6. inspect stored events and teacher dashboard output
7. only after verification, update the live Hub launch registry path when the wider feature branch is ready for merge

## Hard Boundary

Evidence Hub remains untouched throughout this phase.

# Vocabulary Builder Session Finish UX Design

Date: 2026-10-20

Status: Approved design, awaiting final written-spec approval before implementation planning

Baseline main SHA: `2a8bd1675bbed7b80bf7f6b87427bd00e45b84b4`

## 1. Scope

This specification defines the session-finish and stage-completion UX for the iGCSE Self-Study Hub Vocabulary Builder.

In scope:

- the end state after each 10-question pathway session
- visible stars and score treatment
- low-score supportive completion
- stage-clear celebration
- pathway-mastery celebration
- Continue behaviour
- Finish-for-now behaviour
- Staff Preview behaviour
- responsive behaviour
- accessibility and motion
- derivation of student-facing evidence from existing session/progression state

Out of scope:

- changes to progression thresholds
- changes to mastery thresholds
- changes to evidence rules
- changes to attempt IDs or idempotency
- changes to server-authoritative progression
- changes to persistence semantics
- new XP, streak, currency, badge-economy or reward persistence
- redesign of Reading, Listening or Essay Writing
- Claude Unit 1 language-bank content work

## 2. Product problem

The current student journey feels open-ended: question -> question -> stage -> more questions -> more stages. Students do not receive a strong enough sense that they have completed something meaningful after a 10-question set.

The revised experience must distinguish two goals:

- short-term goal: complete one 10-question study mission
- long-term goal: progress through Recognise -> Match -> Apply -> Recall -> Mastery over time

A student must be able to stop after one 10-question set and feel that the study session is complete.

## 3. Locked product decisions

### 3.1 No streak in v1

There is no persistent daily streak in this release.

The v1 reward system is limited to:

- session stars
- session score
- learning-evidence summary
- stage completion
- next-stage unlocking
- pathway mastery
- visible saved progress

### 3.2 One adaptive result screen

Use one result-card architecture with three celebration intensities:

1. Session complete
2. Stage complete
3. Pathway mastered

Do not introduce a separate second unlock workflow.

### 3.3 Session closure is real

Every completed 10-question adaptive pathway set is a valid stopping point.

Continue is an optional next challenge, not a requirement for finishing the current session.

## 4. Star model

Stars are a display-only reward layer.

For the standard 10-target pathway mission:

- 9-10 correct: 3 stars
- 7-8 correct: 2 stars
- 5-6 correct: 1 star
- 0-4 correct: no stars displayed

For scores below 5, do not render hollow or grey empty stars. Replace the star row with supportive copy.

If an unexpected coverage edge case produces a completed pathway session with fewer than 10 practised targets, the UI must show the truthful actual denominator and must not apply the 10-question star rubric. That edge case should not silently render `X / 10`.

Stars must never:

- be persisted
- affect progression
- affect mastery
- affect evidence strength
- affect teacher analytics
- unlock stages
- create XP or a second progression system

## 5. Score and learning-evidence derivation

The student-facing score is based on completed session targets, not raw answer submissions.

For an adaptive pathway session:

- denominator = `summary.practised`
- correct numerator = `summary.strengthened`

This preserves existing retry semantics: supported retries that have not yet completed a target do not inflate the score.

For the normal 10-target mission, student-facing wording is:

- `X / 10 correct`
- `X words strengthened`
- `Y need another look`

If `summary.practised` is not 10, render `X / {summary.practised} correct` instead.

`summary.needsAnotherLook` is used for the needs-another-look count.

No new database field is required for stars, score presentation or the result-card evidence summary.

## 6. State classification

The finish UX must classify the result after persistence has completed and the latest authoritative pathway state is available.

The client must not infer stage completion from session score.

The session needs transient before/after pathway context:

- pathway ID
- stage at session start
- pathway state after saved attempts are reflected in the existing pathway view model
- whether the current stage changed
- whether the pathway became mastered

This transient comparison is presentation/controller state only. It must not create a new persisted progression model.

### 6.1 Session complete

Use when:

- the pathway mission completed
- the pathway did not advance to a later stage
- the pathway did not become mastered

### 6.2 Stage complete

Use when:

- the mission completed
- the authoritative post-save pathway stage is later than the stage at session start
- the pathway is not fully mastered

### 6.3 Pathway mastered

Use when:

- the mission completed
- the authoritative post-save pathway state reports the pathway as mastered

## 7. Standard session-complete state

Hierarchy:

1. completion heading
2. stars, when applicable
3. score
4. learning-evidence summary
5. pathway/stage context
6. supportive message
7. actions

Recommended copy:

- kicker: `SESSION COMPLETE`
- heading: `Session complete`
- score: `9 / 10 correct`
- evidence: `8 words strengthened`
- evidence: `1 needs another look`
- stage context: `Meaning · Recognise`
- stage subcopy: `Stage 1 of 5`
- supportive copy for high result: `Strong session. Your progress is saved.`
- supportive copy for mid result: `Good work — keep building. Your progress is saved.`

Actions:

- primary: `Continue studying`
- secondary: `Finish for now`

If the stage has not cleared, Continue starts another fresh 10-question set in the same authoritative stage.

## 8. Low-score supportive state

For 0-4 correct in a normal 10-target mission:

- keep `SESSION COMPLETE`
- show the score
- show learning evidence
- show current pathway/stage context
- do not show stars
- do not use red failure treatment
- do not use `failed`, `fail`, `unsuccessful session`, or equivalent wording

Recommended copy:

- `Good practice — a few words need another go.`
- stage subcopy: `Keep building this stage.`

Actions remain:

- primary: `Continue studying`
- secondary: `Finish for now`

## 9. Stage-complete state

The standard card escalates in place rather than opening another workflow.

Example for Match -> Apply:

- kicker/heading: `MATCH COMPLETE`
- optional sparkle accent
- stars according to the 10-target session score
- score: `9 / 10 correct`
- evidence: `8 words strengthened`
- evidence: `1 needs another look`
- achievement: `Stage 2 cleared`
- next-stage callout: `APPLY UNLOCKED`
- pathway copy: `You cleared Stage 2 of the Meaning pathway.`

Stage ladder should show:

- completed stages with a tick
- newly unlocked stage as the next active destination
- future stages as inactive/locked

Actions:

- primary: `Start Apply`
- secondary: `Finish for now`

The actual next-stage label is derived from the authoritative post-save pathway state.

## 10. Pathway-mastery state

This is the strongest celebration state.

Recommended example:

- heading: `MEANING MASTERED`
- trophy/mastery artwork
- stars according to the 10-target session score
- score
- learning evidence
- full completed ladder:
  - Recognise
  - Match
  - Apply
  - Recall
  - Mastery
- copy: `You completed all five stages of the Meaning pathway.`

The pathway achievement should visually dominate the score.

Primary action:

- `Finish for now`

Do not automatically push the student into another pathway after mastery.

## 11. Continue behaviour

### 11.1 Stage unchanged

`Continue studying` starts another fresh 10-question set in the same pathway and same current authoritative stage.

The Continue path must preserve the existing recent-question/content history so the new set does not immediately repeat the previous set.

Do not reset `recentActivities` or `usedContentIds` on Continue.

### 11.2 Stage cleared

The primary action label becomes `Start {NextStage}`.

The action starts a fresh 10-question set in the newly unlocked authoritative stage.

It must use the existing server-authoritative/current view-model stage; it must not accept a UI-computed stage override.

### 11.3 Pathway mastered

Do not offer a primary Continue CTA into another stage.

The student has a genuine terminal achievement for that pathway and should be allowed to finish cleanly.

## 12. Finish-for-now behaviour

`Finish for now` returns to the current Unit pathway screen.

Requirements:

- existing saved progress is visible on return
- no progress is discarded
- no extra attempt is created
- no new persistence event is required merely because the student chose to finish
- the action must not reset mastery or pathway state
- the action must not be styled or worded as cancel/quit/failure

## 13. Staff Preview behaviour

Staff Preview uses the same visual result component, but it must remain explicitly non-persistent.

The existing preview banner remains:

`Results are not recorded and will not affect student analytics.`

Additional finish-screen rules:

- never say `Your progress is saved.`
- instead say `Preview only — no progress has been saved.`
- show session score, stars and learning-evidence counts as attempt feedback only
- show the current pathway/stage context
- do not claim a hypothetical stage unlock or pathway mastery unless an existing authoritative non-persisting progression result is available
- do not add duplicate client-side progression logic merely to produce `would unlock` language
- absent such an authoritative preview result, keep the preview outcome at session level only

The visual session celebration may still be shown because teachers need to preview the student experience.

## 14. Copy system

Avoid random praise generators.

Use a small fixed set of mature, concise messages.

Recommended:

High score:

`Strong session.`

Middle score:

`Good work — keep building.`

Low score:

`Good practice — a few words need another go.`

Stage clear:

`You cleared this stage.`

Mastery:

`You completed all five stages.`

Tone requirements:

- mature enough for Grades 9-11
- positive without being childish
- no shame language
- no fake urgency
- no pressure to continue

## 15. Visual design

Use the existing Modern Study App visual system.

Reuse:

- pathway accent colours
- study milestone card language
- existing trophy/mastery artwork where appropriate
- existing study motion tokens
- existing focus treatment

Do not introduce a separate design language.

### 15.1 Standard session

- central result card
- subtle pathway accent
- stars prominent but not oversized
- score immediately legible
- two compact evidence tiles where space allows
- current stage shown below evidence

### 15.2 Stage clear

Add:

- brief accent glow on the completed stage
- one forward connector/arrow transition
- newly unlocked stage illumination
- restrained sparkle treatment

### 15.3 Mastery

Add:

- trophy/mastery icon
- completed five-stage ladder
- restrained burst/sparkle treatment

Do not use full-window confetti or childish game effects.

## 16. Motion

Target animation envelope:

- ordinary completion: roughly 500-700 ms total
- stage clear: roughly 700-900 ms total
- mastery: strongest but still restrained

Use existing motion primitives where possible.

Respect `prefers-reduced-motion`.

No information may depend solely on animation.

## 17. Responsive behaviour

### Desktop

- central card using the existing comfortable vocabulary-session width
- stars and score centred
- evidence tiles side by side
- Continue and Finish actions side by side

### Tablet

- preserve side-by-side evidence where space permits
- controls remain comfortably tappable

### Mobile

Single-column order:

1. heading
2. stars or supportive low-score copy
3. score
4. evidence tile(s)
5. stage/pathway context
6. supportive copy
7. primary action
8. Finish for now

Buttons become full width.

The five-stage ladder must not cause horizontal page scrolling.

## 18. Accessibility

Requirements:

- move focus to the result heading when the result state replaces the final question
- provide textual equivalents for star count
- do not rely on colour alone for stage state
- use ticks/labels/text for completed stages
- maintain visible keyboard focus
- preserve reduced-motion support
- result text must expose score, star count, evidence summary and stage outcome to assistive technology

Example accessible summary:

`Session complete. 9 out of 10 correct. Three stars. Eight words strengthened. One needs another look. Match stage complete. Apply unlocked.`

## 19. Persistence and progression constraints

This UX must sit on top of existing semantics.

Do not:

- change pathway thresholds
- change mastery thresholds
- duplicate stage-completion logic in the client
- infer stage completion from stars or score
- add a new session-result persistence table
- add stars to attempt metadata
- change attempt IDs
- change idempotency rules
- alter server-authoritative progression
- bypass the persistence chain before showing a real saved stage-clear state

The finish state must wait for the existing persistence chain before classifying a saved stage transition.

## 20. Existing architecture seams to preserve

Relevant current owners include:

- `src/vocabulary/views.js`
  - `renderSessionSummary`
  - question/session result rendering
- `src/vocabulary/app.js`
  - `finishSession`
  - `finishSessionWhenSaved`
  - `continuePractice`
  - `startPathwaySession`
  - `returnToCurrentUnit`
- `src/vocabulary/session.js`
  - session summary counts
- `src/vocabulary/pathway-view-model.js`
  - existing representation of persisted pathway state
- `vocabulary-study-app.css`
  - study-app completion/milestone styling and motion

Implementation should be surgical and preserve existing owners rather than creating competing controllers/renderers.

## 21. Required implementation behaviour for pathway snapshots

At pathway-session start, capture transient presentation context sufficient to identify the starting pathway stage.

At completion:

1. wait for `state.persistenceChain`
2. abort normal finish progression if persistence is blocked
3. rebuild/read the latest pathway state from existing `unitMastery` / `globalMastery`
4. compare starting stage with latest authoritative post-save stage representation
5. classify result as standard, stage-clear, or mastered
6. pass a presentation model into the result renderer

The snapshot must never override the latest pathway state.

## 22. Continue-history protection

The current Continue path deliberately retains recent selection history by passing the existing continue-history flag into session start functions.

This protection is non-negotiable.

The redesigned result CTA must route through the same existing Continue mechanics, or an equivalent path that preserves:

- `recentActivities`
- `usedContentIds`
- recent-question anti-repeat behaviour

An explicit fresh start from the Unit screen may continue to reset history according to current behaviour.

## 23. Timed and mixed-practice boundary

This specification primarily targets the fixed 10-question pathway experience.

Do not accidentally change timed-session or Mixed Practice persistence/progression semantics while implementing the pathway finish card.

If the shared `renderSessionSummary` component continues to serve timed or Mixed Practice modes, their existing behaviour must remain functionally intact unless separately specified.

Any shared visual improvement must be regression-tested across those modes.

## 24. Tests required in the implementation plan

At minimum, future implementation tests must cover:

- 9-10 of 10 -> 3 stars
- 7-8 of 10 -> 2 stars
- 5-6 of 10 -> 1 star
- 0-4 of 10 -> no stars and supportive completion
- non-10 denominator renders truthfully and does not use the 10-question star rubric
- score uses completed/strengthened targets rather than raw retry submissions
- stage unchanged -> Continue stays in same stage
- stage clear -> next-stage CTA uses authoritative next stage
- pathway mastery -> mastery finish state, no forced next pathway
- Finish for now returns to Unit view without creating new persistence
- Staff Preview never claims saved progress or invents hypothetical progression
- result classification occurs only after persistence completes
- persistence failure prevents a false saved stage-clear/mastery claim
- Continue preserves recent-question history
- explicit fresh starts retain existing reset behaviour
- mobile result layout does not overflow horizontally
- reduced-motion behaviour remains intact
- timed and Mixed Practice existing summary flows do not regress

## 25. Acceptance criteria

The design is successful when a student can complete one 10-question set and immediately understand:

- the session is finished
- how well they did
- what learning improved
- what still needs attention
- where they are in the pathway
- whether they cleared a stage
- what the next optional challenge is
- that stopping now is a valid successful choice

The five-stage pathway should feel like long-term progression, not one endless session.

## 26. Implementation gate

Do not implement this design until:

1. this written specification has been self-reviewed
2. contradictions or unclear transitions have been corrected
3. the user explicitly approves the written specification
4. only then is an implementation plan created
5. implementation happens on a fresh branch from the latest `main`
6. regression tests and exact-SHA CI/deployment verification pass before any claim that the change is live

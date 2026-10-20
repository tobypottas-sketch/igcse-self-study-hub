# Vocabulary Builder Session Reward Loop — Design

Date: 2026-10-20
Status: Design approved in chat; awaiting written-spec review
Project: iGCSE Self-Study Hub — Vocabulary Builder
Repository: `tobypottas-sketch/igcse-self-study-hub`
Base main SHA at design time: `2a8bd1675bbed7b80bf7f6b87427bd00e45b84b4`

## 1. Problem

The Vocabulary Builder now has a clear five-stage pathway:

**Recognise → Match → Apply → Recall → Mastery**

However, the student experience currently feels open-ended. A learner can complete a 10-question set, press Continue, enter another set, move through stages, and still have little sense of a meaningful finish. The interface communicates progress mechanically but does not clearly answer:

- What have I completed just now?
- Am I allowed to stop?
- What did I achieve?
- What happens next?
- What is the actual end of this pathway?

The redesign must create a strong motivation loop without changing the locked progression, mastery, evidence, attempt, persistence, or server-authoritative semantics.

## 2. Design Goal

Create a three-level completion hierarchy:

1. **10-question session complete** — frequent, satisfying mini-finish.
2. **Stage complete** — stronger achievement when an existing progression rule clears a stage.
3. **Pathway mastered** — major completion state when all five stages are cleared.

The governing principle is:

> Every 10 questions must feel finished. Every cleared stage must feel achieved. Continuing must always feel like a choice.

The long-term pathway remains unchanged.

## 3. Non-goals

This work must not introduce or change:

- progression thresholds
- mastery thresholds
- evidence rules
- attempt IDs
- idempotency
- server-authoritative progression
- persistence semantics
- pathway ordering
- question-selection rules except where already required by existing Continue behavior
- XP
- permanent star totals
- streaks
- leaderboards
- badges
- daily goals
- new persistent gamification tables or backend state

Stars are presentational session feedback only.

## 4. Experience Model

### 4.1 Session unit

A standard student study session is one set of 10 questions.

After question 10, the learner must enter a dedicated completion state rather than being treated as though the activity is simply continuing.

### 4.2 Two possible outcomes after a set

After each 10-question set:

- If the current pathway stage is **not cleared**, show **Session Complete**.
- If the current pathway stage **is cleared**, show the stronger **Stage Complete** state.

The underlying server result remains authoritative. The frontend must not infer a cleared stage from stars or local accuracy alone.

### 4.3 Continue behavior

From a normal Session Complete state:

- **Finish for now** returns to the pathway screen.
- **Continue** starts another fresh 10-question set in the same stage.

From a Stage Complete state:

- **Finish for now** returns to the pathway screen with the newly cleared stage reflected by existing authoritative progression data.
- The second action is stage-specific, e.g. **Start Apply**, not generic Continue.
- That action begins a 10-question set in the next unlocked stage.

Continue must remain optional visually and behaviorally.

## 5. Session Complete State

### 5.1 Purpose

Give every 10-question set a genuine ending and a concise, motivating summary.

### 5.2 Required content

Primary heading:

**Session complete**

Reward display:

- `★★★` for 9–10 first-attempt correct
- `★★` for 7–8 first-attempt correct
- `★` for 5–6 first-attempt correct
- no stars for 0–4, but the session is still complete

The stars must not be saved as a cumulative resource.

Learning summary should be concise and based only on data the app can support accurately. Preferred presentation:

- `9 / 10 correct`
- `6 words strengthened`
- `1 mistake corrected`

If an exact concept such as “words strengthened” cannot be derived reliably from existing session/evidence data, the implementation must use a supported substitute rather than inventing a metric. Examples include:

- `8 words practised`
- `3 mistakes corrected`
- `2 words to revisit`

The spec intentionally requires semantic honesty over a specific label.

Context line:

**You’re building confidence in Context · Match**

Use the actual pathway and current stage.

### 5.3 Low-score treatment

A score below 5 must not create a red failure state.

Suggested tone:

**Good practice — a few words need another go.**

The session still counts as completed.

### 5.4 Actions

Primary/secondary hierarchy should communicate that stopping is valid.

Required actions:

- **Finish for now**
- **Continue**

The exact visual prominence may be refined during implementation, but Continue must not feel mandatory.

### 5.5 Motion

Use restrained, mature celebration only:

- stars animate in
- optional short score count-up
- light burst/confetti accent
- animation settles quickly

No full-screen arcade effect, looping celebration, sound, or childish visual treatment.

Respect reduced-motion preferences where the existing frontend architecture supports them.

## 6. Star Scoring

Stars use **first-attempt accuracy only**.

A question answered incorrectly and then corrected on retry must remain incorrect for star calculation.

Retries still contribute positively to the learning summary, for example:

**3 mistakes corrected**

This separates honest performance feedback from recovery and learning.

### 6.1 Star thresholds

| First-attempt correct | Stars |
|---|---|
| 9–10 | ★★★ |
| 7–8 | ★★ |
| 5–6 | ★ |
| 0–4 | none |

Stars are session-only UI feedback and are not persisted as a permanent total.

## 7. Stage Complete State

### 7.1 Trigger

Render only when existing authoritative progression confirms that the just-completed set cleared the current stage.

### 7.2 Required content

Example:

**MATCH COMPLETE**

**Stage 2 of 5 cleared**

Then show the session reward/summary block using the same first-attempt star logic.

Progression block:

**Next stage unlocked: APPLY**

Visual ladder:

**Recognise ✓ → Match ✓ → Apply 🔓 → Recall → Mastery**

The current cleared and newly unlocked stages should be visually distinct without introducing new progression semantics.

### 7.3 Closing message

Explicitly permit stopping:

**You’ve secured the Match stage. Come back later to keep building.**

### 7.4 Actions

- **Finish for now**
- **Start Apply**

Use the actual next-stage name instead of the generic Continue label.

If there is no next stage because Mastery has completed the pathway, transition to Pathway Mastered instead.

## 8. Pathway Screen

### 8.1 Purpose

Make the long-term destination understandable at a glance and distinguish it from the current 10-question session.

### 8.2 Required hierarchy

Example:

**Meaning Pathway**

**Build secure understanding of key vocabulary**

**2 of 5 stages complete**

Then the ladder:

**Recognise ✓ → Match ✓ → Apply → Recall → Mastery**

The current stage receives the strongest visual treatment. Completed stages are clearly checked. Future stages remain visible but quieter.

### 8.3 Current-stage card

Example:

**Apply**

**Current stage**

**Complete short 10-question study sessions to build this skill.**

If the app already exposes a valid progress signal toward stage completion, it may be shown as:

**Progress toward clearing this stage**

Do not invent a number of sessions remaining, percentage, or ETA unless the existing progression model actually provides it.

### 8.4 Returning student action

The pathway screen should make the next action obvious:

**Next up: Apply**

Primary action:

**Start 10-question session**

### 8.5 Competing progress counters

Avoid duplicate or ambiguous counters such as a global `0 / 10 activities` indicator if it competes with the in-session question counter.

The student should normally need to understand only:

1. where they are in the current 10-question set
2. where they are in the five-stage pathway

If an existing top-level counter has another required meaning, its label must make that meaning explicit.

## 9. Pathway Mastered State

### 9.1 Trigger

Render only when existing authoritative progression confirms all five stages are complete.

### 9.2 Required content

Primary heading:

**PATHWAY MASTERED**

Subheading:

**Meaning complete**

Summary:

- `5 / 5 stages cleared`
- concise supported evidence statement
- `You’ve completed the Meaning pathway.`

Visual ladder:

**Recognise ✓ → Match ✓ → Apply ✓ → Recall ✓ → Mastery ✓**

Avoid turning this into a dense statistics screen.

### 9.3 Actions

- **Back to Vocabulary Builder**
- **Choose another pathway**

Do not automatically start another pathway.

## 10. Main Vocabulary Builder Overview

A mastered pathway should have a visible completed state, for example:

**Meaning**

**Mastered ✓**

This is a status display, not a new badge system.

The visual treatment should remain consistent with the existing Modern Study App direction: polished, motivating, mature, lightly gamified, not childish.

## 11. State and Data Rules

### 11.1 Server authority

The frontend must consume existing server-authoritative progression results for stage clear and pathway mastery decisions.

It must not decide stage completion from:

- star count
- local accuracy
- retries
- number of sessions completed
- animation state

### 11.2 Session summary data

The UI may derive presentational values from the just-completed local session where they are deterministic and honest, including:

- first-attempt correct count
- corrected-after-retry count
- number of unique words practised in the set
- session question count

Any metric whose meaning depends on persisted mastery/evidence must come from the authoritative progression/evidence data already returned by the app.

### 11.3 Persistence

No new persistence is required for:

- stars
- celebration state
- temporary summary labels

Existing evidence and progress persistence remain unchanged.

## 12. Interaction State Model

High-level flow:

```text
Question 1
  ↓
...
  ↓
Question 10 submitted successfully
  ↓
Authoritative result/progression resolved
  ↓
┌──────────────────────────────┐
│ Stage cleared?               │
└──────────────────────────────┘
       │ no                 │ yes
       ↓                    ↓
Session Complete        Stage Complete
       │                    │
       │                    ├─ next stage exists → Start <Next Stage>
       │                    │
       │                    └─ no next stage → Pathway Mastered
       │
       ├─ Finish for now → Pathway screen
       └─ Continue → Same stage, new 10-question set
```

A completion screen must only appear after the final answer/save state is resolved successfully enough for the app to know the session outcome. Existing save-error handling must remain intact.

## 13. Visual Direction

Continue the established Vocabulary Builder theme rather than redesigning the entire hub.

Desired qualities:

- Modern Study App
- clear hierarchy
- more rewarding than the current sterile summary
- stronger colour accents at completion moments
- mature enough for Grades 9–11
- accessible contrast
- restrained motion
- no cartoon badges or juvenile game metaphors

Completion states may use stronger accent treatment than ordinary questions so that finishing feels meaningfully different.

## 14. Compatibility with Recent Fixes

Implementation must preserve all behavior introduced by recent Vocabulary Builder hardening, especially:

### Persistence repair

Preserve the current save-contract protections and metadata behavior. Do not allow generated language-bank content to bypass authoritative published-activity requirements.

### Answer-option shuffle

Preserve the shared answer-option shuffle and per-session `optionNonce`. Do not reintroduce local deterministic option shuffles.

### Continue-history fix

Preserve the current cross-set history behavior:

- `recentActivities` / `usedContentIds` retained across Continue only
- explicit starts reset history as currently designed
- operation-specific variant identities remain in effect
- fresh material is preferred until exhausted

The new Continue button must call the existing safe Continue pathway rather than creating a parallel session-start mechanism.

## 15. Accessibility and Resilience

- Completion states must remain keyboard usable.
- Buttons must retain visible focus states.
- Star meaning must not rely only on colour.
- Stage/pathway completion must be expressed in text, not animation alone.
- Low-score messaging must remain readable without motion.
- Existing save/retry/error states must take precedence over celebration.
- If a summary metric cannot be calculated, omit or replace it safely rather than rendering misleading `0` values.

## 16. Testing Requirements

Implementation should add regression coverage before or alongside product changes.

Minimum coverage:

1. 10th successfully completed question enters Session Complete when stage remains uncleared.
2. 10th successfully completed question enters Stage Complete when authoritative result clears stage.
3. Mastery-stage completion enters Pathway Mastered.
4. Star calculation uses first-attempt correctness only.
5. Retry success does not increase star count.
6. Retry success can increase corrected-mistake summary.
7. Finish for now returns to pathway view.
8. Continue on uncleared stage uses existing Continue behavior and preserves cross-set history.
9. Stage-complete action starts the next authoritative unlocked stage.
10. Explicit fresh starts retain their existing history-reset semantics.
11. Save failure on question 10 does not falsely show completion celebration.
12. No new persistent star/XP/streak state is written.
13. Pathway screen clearly reports current and completed stages from authoritative data.
14. Mastered pathway renders completed state on overview.
15. Runtime smoke covers at least one complete 10-question flow through summary.

Existing Vocabulary Builder CI, System Audit, Runtime Smoke, and Pages deployment gates remain required before any deployed claim.

## 17. Acceptance Criteria

The work is complete when a student can:

- enter a pathway and clearly see which stage they are working on
- understand that one study set contains 10 questions
- complete 10 questions and reach an unmistakable finish state
- receive 0–3 stars based on first-attempt accuracy
- see retries recognised separately from star scoring
- choose to stop without the interface implying they should continue
- continue safely into fresh material in the same stage when not yet cleared
- see a stronger celebration when a stage is genuinely cleared
- see the next stage explicitly unlock
- reach a distinct Pathway Mastered state after authoritative completion of Mastery
- return later and immediately understand the next recommended action

And the implementation must do all of this without changing the locked progression/mastery/evidence/persistence model.

## 18. Out of Scope for This Version

Explicitly deferred:

- streaks
- XP
- permanent star collections
- leaderboards
- achievements/badges
- social comparison
- daily missions
- push reminders
- reward shops
- changes to progression thresholds
- changes to mastery rules

These can be considered later only if real student use shows the clean completion loop is insufficient.

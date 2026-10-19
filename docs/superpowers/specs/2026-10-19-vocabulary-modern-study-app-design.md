# Vocabulary & Paraphrasing Builder — Modern Study App Design

## Purpose

Refresh the student-facing Vocabulary & Paraphrasing Builder so it feels like a polished modern study product for iGCSE ESL learners aged roughly 14–17.

The redesign should make the interface more engaging, visually coherent and rewarding without becoming childish, noisy or game-like.

This work is presentation and interaction-layer work only. It must not change progression semantics, evidence rules, mastery thresholds, student history, persistence, attempt IDs, idempotency or server-authoritative progression.

## Scope

Included:
- Vocabulary Builder home/unit selection
- Unit overview
- Six pathway cards
- Question screens
- Stage 2 Match card interactions
- Retry/support states
- Correct-answer feedback
- Question-to-question transitions
- Session progress
- End-of-10 completion screen
- Stage advancement moments
- Word mastery moments
- Vocabulary dictionary/list view
- Loading/empty/error presentation where appropriate
- Shared iconography and motion language

Excluded for now:
- Reading app
- Listening app
- standalone Paraphrasing app outside this Vocabulary & Paraphrasing Builder
- Essay Writing app
- Evidence Hub
- progression architecture changes
- content-bank audit/rewrite work

## Design Direction

Chosen direction: **Modern Study App**.

Target qualities:
- clean
- energetic
- mature
- rewarding
- visually clear
- quick to understand
- calm enough for serious revision

Avoid:
- cartoon mascots
- XP/coins
- fake streak pressure
- constant confetti
- bouncing controls
- loud gradients everywhere
- animations that delay answering
- decorative clutter

## Visual Identity

The app keeps its existing navy/white/neutral foundation but introduces stronger pathway identities.

Each pathway receives a stable icon and accent treatment used consistently across pathway cards, question headers, progress states and completion moments.

Recommended identities:

- Meaning — book/definition icon
- Context — speech/quote icon
- Word Families — branching/tree icon
- Paraphrasing — swap/arrows icon
- Precision & Use — target icon
- Spelling & Recall — keyboard/letters icon

The pathway colour system should be restrained. The page should not become a six-colour rainbow. Accent colours should mainly appear in icons, edge treatments, progress indicators and state highlights.

## Unit Selection

Unit cards should feel more inviting and more like a student study dashboard.

Each card should include:
- unit number
- unit title
- lightweight progress indicator
- concise mastery/progress count
- clear open affordance
- optional restrained decorative illustration where assets are available

Illustrations must be lightweight assets and must never be required for comprehension.

Cards should use subtle hover/focus elevation and a small directional movement rather than dramatic animation.

## Unit Overview

The unit page should establish a strong hierarchy:

1. Unit title and progress summary
2. pathway selection
3. mixed review
4. all-words/dictionary access

The existing progression statement remains authoritative:
**Recognise → Match → Apply → Recall → Mastery**.

Progress summaries should become more visual but must not invent new progression metrics.

## Pathway Cards

Each pathway card should include:
- pathway icon
- pathway name
- one-line purpose
- current stage/status
- compact five-rung progression rail
- clear CTA

Cards should share one component structure while keeping pathway-specific identity.

States:
- available/in progress
- needs practice
- mastered
- unavailable for this unit

Unavailable states must remain clear and honest, not visually disguised as merely locked future content.

The five-rung rail may animate when progress changes, but its data source remains the existing authoritative pathway state.

## Question Header

Each question screen should gain a consistent header containing:
- pathway icon and label
- current rung/stage
- question count, e.g. 3 / 10
- compact animated progress bar

This header remains stable while the question body changes, reducing visual jumping.

## Question Canvas

The existing fixed/stable canvas work should be preserved.

Questions should use a clear three-part hierarchy:
1. instruction
2. cue/source/context
3. answer area

Question content should enter using a short fade/slide transition of approximately 150–200 ms.

Transitions must never create horizontal overflow or layout jumping.

## Answer Interactions

Answer cards should feel clearly interactive before selection.

Shared behaviour:
- hover: very small elevation/outline shift
- active press: tiny compression
- selected: strong but restrained border/fill state
- keyboard focus: obvious accessible focus ring
- correct: quick success pulse/check
- incorrect: small horizontal nudge or state change, not a violent shake

The current Stage 2 Match card architecture remains in place; this redesign improves presentation and feedback rather than reintroducing dropdowns.

## Retry / Support State

Retry should feel like guided support rather than punishment.

Instead of an abrupt replacement:
- original feedback settles in
- irrelevant options visually withdraw or collapse
- remaining retry choices reorganise smoothly
- support text appears as a calm guidance panel

For narrow-match support, the two remaining cards should retain the same shared answer-card design.

Retry must not alter scoring/progression semantics.

## Correct Answer Feedback

Correct responses should receive a compact positive state:
- check icon
- short success message
- optional concise explanation/context where already available
- next-question CTA

No full-screen celebration for ordinary correct answers.

## Session Progress

Question progress should animate between states rather than snap.

Examples:
- progress bar width transition
- count update
- subtle stage rail pulse when relevant

Progress animation must reflect existing session state only.

## End-of-10 Completion Screen

After a standard 10-question session, replace a plain summary with a polished completion moment.

Recommended layout:
- pathway icon / completion ring
- "Great work" style heading
- completed question count
- concise evidence-based summary cards such as:
  - correct/clean attempts
  - words strengthened
  - words that genuinely advanced stage
- primary continue/review CTA
- back-to-unit CTA

Numbers must come from real session/progression data. Do not invent motivational metrics.

Animation:
- short icon/ring completion
- small restrained particle burst or geometric accent
- summary numbers may count in quickly

Duration should remain short and skippable by simply continuing.

## Stage Advancement

When a word genuinely advances from one rung to the next, show a compact milestone state.

Example:
- five-rung rail appears
- earned rung fills
- connector animates
- next rung highlights
- text such as "Apply unlocked"

This should be more noticeable than a normal correct-answer state but less dramatic than mastery.

Only show this when authoritative evidence indicates a real advancement.

## Mastery Celebration

Word mastery is the strongest celebration level.

Recommended treatment:
- completed five-rung rail
- pathway accent sweep
- mastery badge/icon
- restrained burst/rays
- word displayed prominently

No confetti loop, sound effects or forced delay.

## Dictionary / All-Words View

Preserve the current editorial dictionary-card direction.

Enhancements:
- pathway icons on pathway progress cells where useful
- subtle progress-state animation only when values change
- clearer visual treatment for Mastery
- refined hover/focus states
- context area remains prominent

Future phrase/chunk content created by the separate content audit may later be surfaced here, but this UX redesign must not invent language-bank content.

## Loading, Empty and Error States

Replace sterile text-only states where appropriate with small mature visual cues:
- simple line/shape icon
- concise message
- no cartoon characters

These states should remain lightweight and accessible.

## Motion System

Motion should have shared timing and easing tokens rather than per-component ad hoc values.

Recommended durations:
- press/hover: 90–140 ms
- selection/state change: 140–180 ms
- question transition: 160–220 ms
- stage advancement: 350–650 ms
- mastery/completion: 500–900 ms

Principles:
- motion communicates cause/effect
- no animation should block input longer than necessary
- no continuous decorative animation
- no parallax
- no forced delay between questions

Respect `prefers-reduced-motion` throughout. Reduced-motion mode should preserve state clarity with immediate or near-immediate transitions.

## Icon / Graphic Strategy

Use one coherent icon family across the app.

Preferred implementation:
- lightweight inline SVG icons controlled by CSS
- shared icon component/helper where practical
- decorative SVG/PNG/WebP illustrations only where they materially improve unit/empty/completion screens

Do not depend on emoji as the primary icon system.

Do not load a large third-party icon runtime if a small curated SVG set is sufficient.

## Architecture

Preserve the existing separation already visible in the Vocabulary Builder:
- view rendering in `src/vocabulary/views.js`
- app/session orchestration in `src/vocabulary/app.js`
- existing interaction modules such as `foundational-interactions.js`
- layered Vocabulary CSS files

Add the new study-app design as a coherent shared presentation layer rather than scattering unrelated one-off styles.

Likely implementation shape:
- one shared study-app visual CSS layer for tokens/components/motion
- focused additions to existing vocabulary CSS files where component ownership already exists
- one small reusable icon module/helper if needed
- minimal JS for transition state hooks and real milestone detection

Avoid introducing a second renderer, second progression model or duplicate state controller.

## Data Flow

UI effects consume existing state only.

Examples:
- pathway colour/icon from pathway ID
- stage rail from existing pathway state
- session progress from current session attempt count
- stage advancement from before/after authoritative progression state
- mastery celebration from a genuine mastery transition

Presentation code must never determine whether mastery was earned.

## Accessibility

Requirements:
- keyboard interactions remain fully supported
- focus states remain visible
- colour is never the only state indicator
- icons with meaning receive accessible labels or adjacent text
- decorative icons are hidden from assistive technology
- contrast remains appropriate
- reduced motion is supported
- mobile remains one-column where needed
- no horizontal scrolling introduced

## Mobile / Tablet

The design must remain usable on phones and tablets.

Desktop/tablet may use multi-column cards where space permits.
Mobile should:
- collapse grids naturally
- keep tap targets generous
- avoid oversized decorative art
- keep question CTA reachable
- avoid sticky elements that reduce usable viewport height excessively

## Testing

Use TDD for behavioural additions.

Protect with tests for:
- pathway icon/identity hooks
- question progress state
- retry state classes/markup
- completion summary markup
- stage-advance rendering only on real advancement
- mastery rendering only on real mastery
- reduced-motion CSS presence
- no regression to Stage 2 dropdowns
- no changes to progression/evidence semantics

Run existing Vocabulary Builder CI, content validation, runtime smoke and system audit before merge.

## Rollout

Implement in deliberate phases on one product branch/PR series if needed:

1. shared tokens, icons and pathway identity
2. unit/pathway cards
3. question header/canvas/answer micro-interactions
4. retry and correct-answer feedback
5. completion screen
6. stage advancement and mastery moments
7. dictionary/empty/loading polish
8. final responsive/accessibility pass

The phases should share the same design system from the beginning so the app never becomes a mixture of old and new visual languages.

## Non-negotiables

Do not change:
- Recognise → Match → Apply → Recall → Mastery semantics
- evidence thresholds
- mastery rules
- historical evidence
- student history
- persistence protections
- attempt IDs
- idempotency
- server-authoritative progression
- content audit findings or canonical vocabulary wording as part of this visual redesign

## Success Criteria

The finished Vocabulary & Paraphrasing Builder should:
- look recognisably like the visual direction approved in the concept mockup
- feel more engaging immediately without looking childish
- make pathway identity obvious at a glance
- make answer selection and retry feel responsive and supportive
- make genuine advancement feel rewarding
- make mastery feel special
- preserve fast student workflow
- preserve all existing learning/progression architecture
- work cleanly on desktop, tablet and mobile
- remain accessible with reduced motion

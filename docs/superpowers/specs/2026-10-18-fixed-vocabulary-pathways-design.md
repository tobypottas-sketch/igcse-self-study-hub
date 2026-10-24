# Fixed Vocabulary Mastery Pathways — Design Spec

Date: 2026-10-18
Project: iGCSE Self-Study Hub — Vocabulary Builder
Repo: `tobypottas-sketch/igcse-self-study-hub`

## Purpose

Rebuild the student vocabulary experience around **six fixed, visible learning pathways**. Each pathway has a five-stage ladder that students move through in order from easier recognition tasks to independent mastery.

The current adaptive-pool model remains useful internally, but it must no longer define the student-facing learning structure. Students should see exactly where they are, what comes next, and what they need to do to reach mastery.

## Core product model

Each unit exposes six pathway cards:

1. Meaning
2. Context
3. Word Families
4. Paraphrasing
5. Precision & Use
6. Spelling & Recall

Every pathway uses the same five student-facing stages:

1. Recognise
2. Match
3. Apply
4. Recall
5. Mastery

The pathway ladder is authoritative for navigation and progression.

Adaptive logic is subordinate to the ladder. It may choose the next word, vary question content, supply support, repeat a stage, or select a suitable item within the current stage. It must not randomly jump the learner between unrelated pathways or stages.

## Student placement

### New learning

New learning starts at the bottom of each pathway and progresses upward in order.

### Returning students

Previously persisted evidence may place a returning student above Stage 1 when that placement is defensible.

Examples:

- strong recognition but weak retrieval -> Match or Apply
- strong contextual retrieval -> Recall
- genuine independent varied production/retrieval -> potentially Mastery stage

Repeated easy MCQ success alone must never place a student at Recall or Mastery.

Historical records are not rewritten. Existing evidence is interpreted forward only where its meaning is clear.

## Pathway definitions

### 1. Meaning

Goal: understand what the target vocabulary means.

- Recognise — choose the correct definition from MCQ
- Match — match words to definitions
- Apply — drag the correct word to the correct meaning or situation
- Recall — type the word from its definition
- Mastery — discriminate accurately among close meanings and plausible distractors

### 2. Context

Goal: understand and use the target vocabulary correctly in sentences.

- Recognise — choose the correct word for a sentence
- Match — match words to suitable contexts or sentences
- Apply — drag the correct word into a sentence
- Recall — complete a gap-fill without a word bank
- Mastery — type or use the correct word independently in a fresh context

### 3. Word Families

Goal: recognise and manipulate related grammatical forms.

- Recognise — identify noun, verb, adjective, or adverb forms
- Match — match related forms from the same family
- Apply — choose the correct form for a sentence
- Recall — transform one form into another by typing it
- Mastery — use the correct form independently in a new sentence

### 4. Paraphrasing

Goal: recognise and produce equivalent meaning.

- Recognise — choose the phrase with the same meaning
- Match — match original phrases to paraphrases
- Apply — build a paraphrase using drag/drop or tiles
- Recall — complete or type the missing paraphrase independently
- Mastery — rewrite the phrase or idea fully in the learner's own words

### 5. Precision & Use

Goal: choose the most accurate vocabulary and use it appropriately.

- Recognise — choose the best vocabulary option from close alternatives
- Match — match words to register, tone, strength, or intended meaning
- Apply — replace weak vocabulary in a sentence
- Recall — choose or type a more precise alternative without support
- Mastery — independently improve a sentence or produce one using the target precisely

### 6. Spelling & Recall

Goal: retrieve and spell vocabulary accurately.

- Recognise — choose the correctly spelled word
- Match — match the word to its definition or cue
- Apply — rebuild the word from letters, chunks, or syllables
- Recall — type the word from a definition or sentence cue
- Mastery — spell and retrieve the word correctly in a new context without support

## Unlock and progression rules

### Stage 1 — Recognise

- available immediately for new learning
- pass after 2 clean successes on different questions for that word/pathway
- one mistake does not reset progress

### Stage 2 — Match

- unlocks after Recognise is passed
- pass after 2 clean successes
- after repeated difficulty, offer one supported lower-friction attempt before returning to Match

### Stage 3 — Apply

- unlocks after Match is passed
- pass after 2 clean successes
- where relevant, successes should use different contexts

### Stage 4 — Recall

- unlocks after Apply is passed
- pass after 2 clean, unassisted successes
- typed retrieval is preferred evidence here
- successful retries may recover learning but do not count as strongly as first-attempt recall

### Stage 5 — Mastery

- unlocks only after earlier stages are sufficiently secure
- requires 3 successful mastery checks
- at least 2 must be unassisted
- at least 2 must use different prompts or contexts
- if valid variation cannot be generated, fail closed rather than award mastery from weak repetition

## Mistakes and recovery

Wrong answers do not erase completed lower stages.

Recovery model:

- first mistake -> feedback + retry
- repeated mistake -> temporary support one stage lower or lower-friction equivalent
- successful recovery -> return to current stage
- repeated ongoing difficulty -> current stage remains unlocked but is marked Needs practice

Completed lower stages are not relocked.

The student-facing message should indicate additional practice is needed, not imply punishment or loss of previously earned progress.

## Review after mastery

Mastered vocabulary remains reviewable.

Review can draw from Recall, Apply, and occasional Mastery checks.

Weak review performance may mark the pathway as Mastery needs review. It should not visibly throw the learner back to Recognise unless the evidence genuinely supports that conclusion.

## Unit page

The Unit page becomes a six-pathway dashboard rather than a random practice launcher.

Each pathway card shows:

- pathway title
- five-stage ladder
- completed stages
- current stage
- locked stages
- optional Needs practice state
- Mastered state when appropriate

Example:

`Meaning: Recognise ✓ -> Match ✓ -> Apply ● -> Recall ○ -> Mastery ○`

Legend:

- ✓ = passed
- ● = current
- ○ = locked/not yet reached

Do not use pseudo-percentage mastery unless a mathematically defensible definition is explicitly added later.

## Inside a pathway

Clicking a pathway opens that pathway only.

The pathway screen shows:

- pathway name
- five-stage ladder across the top
- current stage highlighted
- short description of the current skill
- one activity at a time
- progress through the current stage
- return-to-unit control

Completing a stage marks it complete, unlocks the next stage, and uses restrained motion. Respect reduced-motion preferences.

## Mixed Practice

Mixed Practice remains, but becomes a **review mode**, not the core learning structure.

Rules:

- only draws from already unlocked pathway stages
- uses the same readiness and evidence rules as the source pathway/stage
- writes evidence back to the correct pathway and stage
- never creates a separate mixed-practice mastery bucket

Core hierarchy:

**Learn through pathways first. Mixed Practice reviews what has already been learned.**

## Evidence model

Each vocabulary item stores or derives evidence separately by pathway and stage.

A word may therefore be strong in one pathway and weak in another.

Example:

- Meaning — Mastered
- Context — Recall
- Word Families — Apply
- Paraphrasing — Match
- Precision & Use — Apply
- Spelling & Recall — Mastered

This pathway detail is authoritative for learning progression.

An overall word status may still be derived for dashboards and Evidence Hub, but it is a summary only and must not replace pathway-level evidence.

## Evidence strength by stage

Evidence should only prove what the activity genuinely demonstrates.

- Recognise — low-strength recognition evidence
- Match — recognition/discrimination evidence, still supported
- Apply — contextual/manipulation evidence, medium strength
- Recall — independent retrieval evidence, strong
- Mastery — repeated, varied, independent evidence, strongest

Easy repeated activity must never manufacture mastery.

Interaction variants do not automatically create evidence diversity. For example, matching and drag-matching of the same semantic operation are not two independent mastery strands merely because the UI differs.

## Overall vocabulary status

The existing overall learning states can remain as a summary layer:

- Emerging
- Building
- Developing
- Secure
- Mastered

They should be derived from the richer pathway evidence.

Suggested interpretation:

- Emerging — little meaningful evidence
- Building — early progress across one or more pathways
- Developing — multiple pathways have reached Apply/Recall
- Secure — core pathways are strong, especially Meaning, Context, and independent Recall
- Mastered — strong independent evidence across the important pathways with sufficient variation

Exact derivation should be defined in implementation tests and should preserve existing historical mastery integrity.

## Teacher analytics

Teacher analytics must support both perspectives:

1. student x pathway
2. word x pathway

Teachers should be able to answer:

- Which students are weak in Context?
- Which words are causing problems in Spelling & Recall?
- Which learners recognise meanings but cannot retrieve independently?
- Which students are ready for harder paraphrasing?
- Which word families need a targeted TEAMS quiz?

A compact class matrix is preferred:

| Student | Meaning | Context | Families | Paraphrasing | Precision | Spelling |
| --- | --- | --- | --- | --- | --- | --- |
| Student A | Mastery | Recall | Apply | Match | Apply | Mastery |
| Student B | Apply | Match | Recall | Recognise | Match | Recall |

Clicking a cell should drill down into words and evidence without unnecessary navigation.

## Assignment targeting

The model should eventually support assignments at pathway/stage level, for example:

- Unit 4 -> Context -> Apply
- Unit 4 -> Spelling & Recall -> Recall
- Unit 4 -> Paraphrasing -> Match

This is an intended capability of the model. It does not require assignment tooling to be built in the first implementation unless already supported by existing infrastructure.

## Evidence Hub alignment

The vocabulary model should follow the same product philosophy as Evidence Hub:

- low-friction teacher workflow
- clear signal over data clutter
- no duplicate manual entry
- evidence attached to meaningful learning constructs
- drill-down when needed
- summary views remain compact

Future Evidence Hub integration should consume pathway/stage evidence rather than reverse-engineering it from UI activity names.

## Data migration and history

No historical mastery or attempt history is rewritten.

Migration policy:

- map old evidence forward only when the semantic meaning is clear
- ambiguous legacy evidence remains legacy/general evidence
- new pathway/stage evidence becomes authoritative from the new release onward
- privacy rules remain unchanged

No real student answers, notes, teacher notes, or private learning data may be committed to GitHub.

## Distractor and content quality

All choice-based stages must use plausible distractors where possible:

- related concept
- partial meaning
- wrong register
- wrong intensity
- wrong word form
- close semantic neighbour
- one-detail meaning distortion

Do not fabricate nonsense options merely to fill a multiple-choice set. If high-quality options are unavailable, fail closed or select another eligible item.

## Accessibility

Drag/drop activities must have a keyboard/tap-accessible equivalent.

The authoritative answer path must not depend on pointer drag alone.

Reduced-motion preferences must be respected.

## Reliability and persistence

Stage completion and visible progression may only update after authoritative persistence succeeds.

No optimistic fake promotion.

Existing protections remain non-negotiable:

- idempotent attempts
- atomic evidence persistence
- same-target serialization/concurrency protection
- stale mastery retry
- failed-save blocking
- timed-expiry persistence barrier
- no raw answer text stored in evidence/history

## Out of scope for the first implementation

Unless already available in existing infrastructure:

- full teacher assignment-authoring UI
- Evidence Hub connector implementation
- wholesale historical-data conversion
- arbitrary new vocabulary content generation
- pronunciation/audio pathway

## Success criteria

The redesign is successful when:

1. every Unit exposes six clear vocabulary pathways;
2. every pathway visibly uses Recognise -> Match -> Apply -> Recall -> Mastery;
3. new learners progress upward in fixed order;
4. returning learners can be placed higher only from defensible evidence;
5. each stage uses the intended interaction family, including MCQ, matching, drag/drop, gap-fill, typed recall, and production where appropriate;
6. students are never randomly bounced between pathways by the adaptive planner;
7. mastery requires varied, independent evidence rather than repeated easy success;
8. pathway progress persists reliably and is visible after save;
9. Mixed Practice acts only as review and writes back to the source pathway/stage;
10. teacher analytics can distinguish Meaning, Context, Word Families, Paraphrasing, Precision & Use, and Spelling & Recall;
11. old student history is preserved rather than rewritten;
12. the existing privacy and evidence-integrity guarantees remain intact.

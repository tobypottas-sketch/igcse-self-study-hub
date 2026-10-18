# Vocabulary Learning Progression — Design Spec

Date: 2026-10-18
Project: iGCSE Self-Study Hub
Repo: `tobypottas-sketch/igcse-self-study-hub`
Scope: Vocabulary Builder only

## 1. Purpose

Restore the Vocabulary Builder as a genuine learning progression rather than a mostly assessment-oriented sequence. The system must teach vocabulary through increasingly demanding activity families, adapt support when students struggle, make improvement visible, and keep all student-facing progression grounded in the same mastery evidence used by the adaptive engine and future Evidence Hub analytics.

This design must preserve the current persisted mastery model and historical evidence. It must not rewrite existing mastery rows or change past student evidence.

## 2. Existing mastery model remains canonical

Persisted backend mastery remains:

- `new`
- `building`
- `secure`
- `mastered`

No fifth persisted database state is introduced.

A new shared pure function, conceptually `deriveLearningStage(mastery)`, produces the student-facing five-stage progression:

- `new` -> **Emerging**
- early `building` -> **Building**
- broader `building` -> **Developing**
- `secure` -> **Secure**
- `mastered` -> **Mastered**

### Building -> Developing rule

A learner is **Developing** when:

- backend status is `building`;
- at least two evidence strands are at the existing secure threshold of 3 or above; and
- at least one of those strands is `context` or `paraphrasing`.

This creates a meaningful intermediate stage without altering persistence.

The same derived-stage function must be used by:

- adaptive planning;
- activity eligibility;
- student progress UI;
- session summaries;
- teacher analytics and future Evidence Hub integration.

No renderer or feature may independently recalculate student stage.

## 3. Pedagogical progression

The authoritative learning ladder is:

### Emerging — recognise

Goal: connect a target word with its meaning.

Core activities:

- Meaning MCQ: word -> definition
- Definition -> word MCQ
- Word <-> definition matching
- Drag word to definition
- Drag definition to word
- Simple synonym recognition
- Which Situation Fits?

These tasks should be quick, low-friction and confidence-building.

### Building — retrieve

Goal: retrieve the target rather than only recognise it.

Core activities:

- Gap fill with word bank
- Drag word into sentence
- Type the missing word
- Spell the word
- Rebuild the word from letters or segments
- Choose the correct word for a sentence
- Simple word-family choice
- Simple contextual meaning choice

Typing and spelling provide stronger retrieval evidence than recognition but do not count as independent lexical production.

### Developing — discriminate and understand in context

Goal: distinguish plausible meanings, paraphrases and contextual uses.

Core activities:

- Meaning in Context
- harder gap fills without an obvious word bank
- close-synonym discrimination
- Phrase Match
- Same Idea
- Spot Meaning Change
- Question <-> Text Bridge
- Find the Evidence
- Word-family transformation
- more difficult spelling/retrieval where useful

Distractors must be plausible and misconception-driven, not arbitrary unrelated options.

### Secure — manipulate

Goal: manipulate language accurately while preserving meaning.

Core activities:

- Build the Paraphrase
- Complete the Paraphrase
- Build the Same Idea
- controlled phrase rewriting
- controlled sentence rewriting
- Improve Vocabulary
- Word Family Switch
- manipulative drag/drop phrase construction

These tasks may provide strong evidence, but scaffolded assembly/completion must not falsely count as independent production.

### Mastered — produce independently

Goal: flexible, minimally scaffolded vocabulary use and paraphrasing.

Core activities:

- Rewrite the Phrase
- Rewrite the Idea
- Explain It Another Way
- independent vocabulary replacement
- Use the Target in a Sentence
- independent paraphrase

Only genuinely open, minimally scaffolded tasks can satisfy independent production requirements.

## 4. Activity families and demand bands

The planner should reason first in activity families, then choose an eligible concrete activity.

Authoritative families:

1. `recognition`
2. `retrieval`
3. `discrimination`
4. `manipulation`
5. `production`

The catalogue must no longer rely only on `minimumStage`. Every live activity should declare:

- `family`
- `earliestStage`
- `preferredStages`
- `responseMode`
- `evidenceStrength`
- evidence strands
- whether it is independently productive
- whether it is suitable for support/recovery
- whether it is suitable for spaced review

An easier activity may remain available to a stronger learner for recovery or review, but should not dominate their normal adaptive mix.

## 5. First-class activity catalogue

### Recognition family

| Activity | Response mode | Earliest stage | Evidence strength |
| --- | --- | --- | --- |
| Meaning Match | choice | Emerging | light |
| Definition -> Word | choice | Emerging | light |
| Word <-> Definition Match | matching | Emerging | light |
| Drag Word to Definition | drag_match | Emerging | light |
| Drag Definition to Word | drag_match | Emerging | light |
| Simple Synonym Match | choice/matching | Emerging | light |
| Which Situation Fits? | choice | Emerging | medium |

### Retrieval family

| Activity | Response mode | Earliest stage | Evidence strength |
| --- | --- | --- | --- |
| Gap Fill — Word Bank | choice/drag_gap | Building | medium |
| Drag Word into Sentence | drag_gap | Building | medium |
| Type the Missing Word | text | Building | medium |
| Spell the Word | spelling | Building | medium |
| Rebuild the Word | tiles/spelling | Building | medium |
| Choose Word for Sentence | choice | Building | medium |
| Word Family Choice | choice | Building | medium |

### Discrimination/context family

| Activity | Response mode | Earliest stage | Evidence strength |
| --- | --- | --- | --- |
| Meaning in Context | choice | Developing | medium |
| Close Meaning Choice | choice | Developing | medium |
| Context Gap Fill | text/choice | Developing | medium |
| Phrase Match | choice | Developing | light/medium |
| Same Idea | choice | Developing | medium |
| Spot Meaning Change | choice | Developing | medium |
| Question <-> Text Bridge | choice | Developing | medium |
| Find the Evidence | evidence | Developing | medium |

### Manipulation family

| Activity | Response mode | Earliest stage | Evidence strength |
| --- | --- | --- | --- |
| Build the Paraphrase | tiles/drag | Secure | medium |
| Complete the Paraphrase | text | Secure | medium |
| Build the Same Idea | tiles/drag | Secure | medium |
| Word Family Switch | text/manipulation | Secure | medium |
| Improve Vocabulary | controlled text | Secure | medium |
| Controlled Rewrite | text | Secure | strong |

### Production family

| Activity | Response mode | Earliest stage | Evidence strength |
| --- | --- | --- | --- |
| Rewrite the Phrase | text | Secure | very strong |
| Rewrite the Idea | text | Secure | very strong |
| Explain It Another Way | text | Mastered | very strong |
| Use the Target in a Sentence | text | Mastered | very strong |
| Independent Paraphrase | text | Mastered | very strong |

## 6. Supported response modes

The renderer should formally support these response modes as first-class modes:

- `choice`
- `matching`
- `drag_match`
- `drag_gap`
- `text`
- `spelling`
- `tiles`
- `evidence`

Matching and drag/drop must not be disguised as choice questions.

## 7. Weighted adaptive mix

The learner stage sets a target probability mix by activity family.

| Stage | Recognition | Retrieval | Discrimination/context | Manipulation | Independent production |
| --- | ---: | ---: | ---: | ---: | ---: |
| Emerging | 70% | 20% | 10% | 0% | 0% |
| Building | 25% | 50% | 20% | 5% | 0% |
| Developing | 10% | 25% | 45% | 20% | 0% |
| Secure | 5% | 15% | 25% | 40% | 15% |
| Mastered | 5% | 10% | 15% | 25% | 45% |

These are target proportions, not rigid quotas. Eligibility, available curated content, review state, recent activity history and support state may alter the concrete sequence.

## 8. Within-session movement

### Clean success

A first-attempt correct answer with no major support should generally hold or slightly raise demand.

Repeated clean success in the same family should increase the probability of selecting the next demand band.

Example:

`matching -> supported gap fill -> context choice -> paraphrase recognition`

### Single error

One error must not demote persisted mastery or visible stage.

Instead, the next encounter with that target should become more supported.

Example:

`independent gap fill fails -> word-bank gap fill/context choice -> recovery success -> later return to independent gap fill`

### Repeated difficulty

Repeated difficulty should temporarily lower the question demand/support level for that target or skill family only.

A Secure learner can receive an Emerging or Building recovery task for one difficult word without becoming globally Emerging or Building.

### Recovery

Recovery success remains useful evidence but should be weighted below clean first-attempt success according to the existing support/evidence rules.

## 9. Variety rules

For a normal 10-question adaptive session:

- avoid the same activity type twice in a row when alternatives exist;
- avoid more than 3 activities from the same family unless the student explicitly selected that skill;
- do not repeat the same exact content variant in one set;
- after two high-demand questions, strongly prefer a lower-friction activity next;
- after several easy clean successes, strongly prefer increasing demand;
- timed mixed practice should preserve these variety principles while remaining readiness-safe.

## 10. Spaced review

Review should use the same progression philosophy.

- mastered words should not routinely return as trivial recognition MCQs;
- early review may use retrieval/context;
- repeated successful reviews should increasingly use manipulation or production;
- failed review may temporarily step down to recognition/retrieval support;
- successful recovery restores the harder path without rewriting historical evidence.

## 11. Distractor quality contract

Choice-based vocabulary and paraphrase tasks must use credible distractors.

Approved misconception sources include:

- close but inaccurate meaning;
- wrong intensity;
- wrong register;
- related concept;
- wrong grammatical form;
- partial paraphrase;
- meaning changed by one detail.

Unrelated or nonsensical distractors are not acceptable when a plausible alternative can be curated.

Question builders should prefer curated misconception distractors. Fallback generation must preserve semantic plausibility and structural comparability.

## 12. Question/source visual hierarchy

Task instruction, source/example text, target word/phrase and response area must be separate semantic UI regions.

Rules:

- do not duplicate source text in a second card when the question already contains the same information;
- source/example cards only render when they add information not already visible in the prompt;
- question text and example/source text must be visibly separated;
- feedback and Continue controls must have dedicated spacing and must not collapse together;
- retry scaffolding must not stack duplicate support messages.

These rules apply across all existing and new activity types.

## 13. Student-facing progress UI

Every vocabulary target may expose one derived visible stage:

**Emerging -> Building -> Developing -> Secure -> Mastered**

The UI should show this calmly in:

- practice near the current target;
- unit word lists;
- unit-level progress summaries;
- end-of-session summaries when meaningful movement occurs.

No red weak/failing label should be used for normal learning progression.

### Unit-level visualisation

Prefer a compact segmented horizontal progression bar showing the distribution of words across the five stages rather than intimidating cumulative counts.

### Session summary

Where applicable, report meaningful change, for example:

- words strengthened;
- words moved to Developing;
- words reached Secure;
- words reached Mastered.

Only report movement that actually occurred.

## 14. Quiet animation system

Animations should make the app feel responsive and alive without becoming game-like.

Use restrained motion for:

- unit card hover/press;
- entering a unit;
- selecting a practice skill;
- answer feedback appearing;
- stage advancement;
- recovery success;
- mastery achievement;
- session summary appearance.

Stage progression may use a brief progress fill, soft pulse/glow or small scale transition. Mastery can receive a slightly stronger tick/completion moment, still under roughly one second.

All motion must respect `prefers-reduced-motion`.

## 15. Collocation work

The retired legacy `collocation_builder` remains retired.

A future collocation activity family may be reintroduced only as curated tasks such as:

- match word to collocation;
- drag a collocation partner;
- choose the plausible collocation;
- complete a collocation in context.

Do not revive the old tile implementation that used every tile as part of the answer without meaningful distractors.

## 16. Data and privacy constraints

- No historical mastery or attempt rewriting.
- No raw student answer text added to GitHub.
- Existing evidence persistence and attempt integrity protections remain intact.
- New activity types must have explicit evidence mappings before they can influence mastery.
- Scaffolded tasks must not count as unscaffolded production.
- Future Evidence Hub communication must use the same derived stage and underlying evidence model.

## 17. Implementation boundaries

The implementation should centralise progression logic rather than duplicate it.

Expected areas of change include:

- shared learning-stage derivation;
- activity catalogue metadata;
- adaptive planner family weighting and support logic;
- activity builders for new first-class tasks;
- renderer support for matching/drag/drop/spelling modes;
- visual progress components and restrained animations;
- evidence mapping for new activity types;
- tests covering stage derivation, activity eligibility, adaptive mix, recovery, evidence integrity, question/source hierarchy and reduced-motion behaviour.

No production implementation begins until this design is approved and a separate implementation plan has been written and approved.

## 18. Success criteria

The redesign is successful when:

1. A new/weak learner reliably receives foundational recognition and retrieval activities rather than being pushed immediately into paraphrasing.
2. Matching, drag/drop, gap-fill and spelling are first-class live activities.
3. The adaptive mix becomes harder as evidence strengthens and temporarily more supportive after difficulty.
4. The five visible stages are derived from canonical evidence and never drift from planner/analytics logic.
5. Choice distractors are plausibly wrong rather than obviously irrelevant.
6. Prompt/source/example text is visually unambiguous and redundant duplicate cards are removed.
7. Students can see meaningful progress during and after practice.
8. Animations are subtle, useful and accessible.
9. Existing historical mastery, privacy and persistence guarantees remain intact.
10. Automated tests cover both pedagogy-critical progression rules and technical regressions.

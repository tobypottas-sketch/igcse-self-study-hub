# iGCSE Self-Study Hub — Vocabulary & Paraphrase Builder Design

Date: 2026-10-17
Repository: `tobypottas-sketch/igcse-self-study-hub`
Supabase project: `iGCSE Self-Study` (`grjshlamooglytsajoun`)

## 1. Goal

Add a fifth student learning area to the iGCSE Self-Study Hub: **Vocabulary & Paraphrase Builder**.

The feature must help Cambridge iGCSE English as a Second Language 0511 students build durable control of coursebook vocabulary through adaptive mixed practice, contextual understanding, paraphrase recognition and production.

The system must not be a generic flashcard or quiz app. It must be designed around 0511-relevant language demands: understanding vocabulary in context, recognising paraphrased wording, preserving meaning when rewording, and producing accurate equivalents independently.

The current source content comprises 20 coursebook units intended to contain 50 key vocabulary targets per unit. Multi-word expressions such as `current affairs`, `higher education`, `quality of life`, and `safety regulations` count as single mastery targets.

The feature must also generate high-quality learning evidence for teachers and for future Evidence Hub integration.

## 2. Ecosystem position

Vocabulary & Paraphrase Builder is not an isolated app. It is the fifth current learning area in an extensible Hub evidence ecosystem alongside:

- Reading
- Listening
- Paraphrasing
- Essay Writing
- Vocabulary & Paraphrase Builder

Future learning areas must be able to join the same evidence and intervention architecture without redesigning Evidence Hub.

The architectural principle is:

**Student learning app -> structured evidence -> Hub interpretation/aggregation -> Evidence Hub analysis -> teacher action -> targeted learning -> new evidence**

All current and future learning areas must share the same philosophy:

- teacher-first rather than database-first;
- exception-first rather than report-first;
- automatic interpretation rather than manual analysis;
- progressive disclosure from insight to evidence detail;
- actionable signals rather than decorative metrics;
- longitudinal evidence rather than isolated scores;
- transparent conclusions with traceable provenance;
- minimal teacher clicks and duplicated workflow.

## 3. Student learning philosophy

The app must encourage students rather than overwhelm them.

Student-facing language should use supportive states:

- `New`
- `Building`
- `Secure`
- `Mastered`

Avoid punitive labels such as `Weak`, `Failed`, or prominent red failure states.

The app must not repeatedly display intimidating whole-course totals such as `327 / 1000 mastered` or hundreds of remaining items. Students should primarily see progress in manageable unit-level chunks.

The system may calculate global mastery internally and expose it to teachers/Evidence Hub, but the student experience should focus on achievable next steps.

Gamification must remain subtle and mature. Allowed examples include progress indicators, meaningful milestones, unit achievements, study streaks, and positive recovery moments. Avoid public leaderboards, lives, noisy XP systems, or excessive celebratory effects.

## 4. Unit autonomy and structure

All 20 units are always available. No unit is locked behind another.

Students choose **what unit to study**. The system decides **which words deserve attention within that unit**.

Each unit is organised into five sets of ten vocabulary targets for coursebook alignment and manageable revision:

- Set 1: positions 1-10
- Set 2: positions 11-20
- Set 3: positions 21-30
- Set 4: positions 31-40
- Set 5: positions 41-50

Sets are not progression gates. Students may enter any set or practise across the whole unit.

The adaptive mastery engine may mix targets across sets when that better serves the student.

## 5. Session modes

Each unit offers two primary routes.

### 5.1 Adaptive Session

Default untimed route.

- 10 target words
- mixed activity types
- targets selected by the adaptive engine
- ends when the session target set is complete

Suggested student copy: `We’ll choose the words that will help you most.`

### 5.2 Timed Practice

Student chooses:

- 5 minutes
- 10 minutes
- 15 minutes
- 20 minutes

Timed sessions use the same adaptive engine, evidence rules, and mastery logic as untimed sessions. Only the stopping condition differs.

Timed practice is not a speed test. The timer should be visible but understated. Progress gained in timed sessions counts identically toward mastery.

## 6. Student unit screen

A unit screen should prioritise clarity rather than analytics density.

Example:

`Unit 7 — Interviews`

- `34 / 50 mastered`
- `8 need another look`
- `5 ready for review`

Primary actions:

1. `Start Adaptive Session` — 10 priority words
2. `Timed Practice` — 5 / 10 / 15 / 20 minutes

Secondary actions:

- view all 50 words;
- open one of the five coursebook sets;
- later, specialist practice modes if required.

Do not show students a wall of percentages for individual skill strands.

## 7. Mastery strands

Each vocabulary target gathers evidence across four core strands:

1. **Meaning / Recognition** — student understands or identifies the target meaning.
2. **Context** — student understands the word or phrase in natural 0511-style context.
3. **Paraphrasing** — student recognises or produces an equivalent expression while preserving meaning.
4. **Production** — student retrieves or uses the target/equivalent independently.

Production is required for full mastery.

Multiple-choice success alone can never create `Mastered` status.

## 8. Asymmetric evidence model

Evidence is asymmetric.

Harder evidence may strengthen easier strands, but easier evidence cannot automatically strengthen harder strands.

Examples:

- successful production may strengthen Production, Paraphrase, Recognition, and Meaning;
- successful paraphrasing may strengthen Paraphrase, Recognition, and Meaning;
- contextual understanding may strengthen Context and Meaning;
- recognition does not strengthen Production.

This prevents students from repeatedly proving easier skills after they have already demonstrated harder ones.

## 9. Mastery states and thresholds

Student-visible states are:

### New
Little or no evidence.

### Building
Emerging understanding but not yet consistently secure.

### Secure
Student shows reliable understanding across multiple strands, including at least one successful Context or Paraphrase demonstration.

### Mastered
Requires:

- Secure requirements met;
- at least **two successful productive demonstrations**;
- those productive demonstrations must occur in different contexts/prompts where practical;
- no unresolved strong recent error pattern.

A single lucky typed answer is insufficient.

The engine may maintain hidden numeric confidence values by strand, but student-facing progression is state-based rather than XP-based.

## 10. Review and retention

`Mastered` is not a permanent exemption from practice.

The engine maintains a hidden `review due` state.

Recommended review cadence:

- first review after approximately 3-5 days;
- next after approximately 1-2 weeks;
- next after approximately 3-4 weeks;
- then progressively less often if retention remains strong.

Review items should prefer context, paraphrase, or production over easy definition matching.

One missed review must not immediately remove `Mastered` status. Repeated review failures may gradually return a target to `Secure` when the evidence pattern supports that conclusion.

## 11. Adaptive target selection

Within the student-selected unit, target priority is roughly:

1. recently wrong;
2. missing production evidence;
3. weak paraphrase/context evidence;
4. new words;
5. review due;
6. recently secure/mastered words.

The exact ranking may combine recency, confidence, strand gaps, prior recovery, and review due status.

A student may always choose a specific set or view all terms, but the default mastery session should prioritise the words with highest current learning value.

## 12. Activity catalogue

Core activity types are intentionally limited to high-value 0511-aligned tasks:

1. meaning match;
2. paraphrase match;
3. context meaning/inference;
4. question-to-text bridge;
5. contextual gap fill;
6. replace the phrase;
7. produce a paraphrase;
8. use/complete the target naturally;
9. identify the inaccurate paraphrase;
10. mini mixed check using short 0511-style text.

Avoid low-value game formats such as word searches, hangman, spelling gimmicks, or mechanics unrelated to 0511 language control.

## 13. 0511 question-to-text bridge

A particularly important activity family is the bridge between question wording and text wording.

Examples:

- `Which word or phrase in the text means “very important”?`
- `The question says “became less popular”. Which phrase in the text expresses this idea?`

This activity should deliberately train students to connect paraphrased question wording with source-text wording, because that mental transfer is central to successful reading comprehension.

## 14. Feedback and failure handling

Wrong answers are treated as teaching moments, not failure events.

Flow:

**wrong -> brief explanation -> supported retry -> later recycle in a different context**

Feedback should explain the semantic distinction where helpful.

Example:

`Big can describe size. Here significant means important or notable.`

After a supported retry, the same target should later reappear using a different context and preferably a different activity type.

The engine records `error -> feedback -> later successful recovery` as meaningful learning evidence.

Repeated wrong answers lower confidence and raise future practice priority.

## 15. Mixed-session rules

Main mastery sessions are always mixed.

Students do not choose to farm one easy question type during the core mastery path.

The engine selects the activity type based on which strand evidence is still needed.

Optional specialist practice modes may exist outside the core route, for example paraphrasing-only or production-only practice, but they do not replace the mixed mastery journey.

## 16. Content model

The content model separates:

1. global vocabulary concept;
2. coursebook unit occurrence;
3. student global mastery;
4. student unit-specific contextual mastery.

This separation allows repeated vocabulary across units to share global knowledge while still requiring contextual proof in each unit.

### 16.1 Global vocabulary item

Recommended fields:

- `vocabulary_id`
- `term`
- `part_of_speech`
- `core_meaning`
- one or more `senses` where genuinely required
- `accepted_paraphrases`
- `context_dependent_paraphrases`
- `misleading_distractors`
- `word_family`
- `collocations`
- `production_answers`
- valid spelling variants where applicable
- optional teacher/content note
- content lifecycle status

### 16.2 Unit occurrence

Recommended fields:

- `unit_occurrence_id`
- `vocabulary_id`
- `unit_number`
- `unit_title`
- `set_number`
- `position_in_unit`
- relevant sense identifier where required
- unit-specific contexts/prompts
- active flag

### 16.3 Student global mastery

Recommended fields include:

- student ID
- vocabulary ID
- global status
- confidence/evidence by strand
- successful production count
- last successful production context
- review due state/date
- recent error pattern
- last seen timestamp

### 16.4 Student unit mastery

Recommended fields include:

- student ID
- unit occurrence ID
- unit-specific status
- contextual evidence
- latest unit interaction
- recent error pattern

## 17. Multi-sense handling

Some terms require more than one sense, but only where the coursebook requires them.

The system must not become a general dictionary.

If a term such as `issue`, `register`, or `feature` has multiple relevant senses, each sense receives its own meaning, paraphrase bank, contexts, and accepted production answers. A unit occurrence identifies which sense is being practised.

## 18. Curated content standard

The core mastery system is curated and deterministic rather than dependent on live AI generation.

Live practice must not invent new synonyms or accepted answers at runtime.

Each vocabulary target should have at least **three curated reusable contexts**, typically including:

1. meaning/context sentence;
2. paraphrase/transfer context;
3. production/application context.

Important or difficult targets may have more.

Some contexts should be short multi-sentence reading extracts so the app can support question-to-text paraphrase work.

## 19. Question variation rules

The engine may vary presentation, but it may not invent semantic content.

Rules:

- avoid showing the same context twice in one session;
- avoid repeating the same activity type for the same target back-to-back;
- recycle errors using a different context/activity;
- use easier recognition tasks mainly for New/Building targets;
- prefer context/paraphrase/production for Secure and review-due targets;
- rotate distractors and answer positions;
- never mark an answer correct unless it matches curated accepted-answer logic;
- avoid ambiguous prompts.

## 20. Content quality lifecycle

Each content record has lifecycle status:

- `draft`
- `reviewed`
- `approved`
- `live`

A unit may not become live until all 50 distinct targets are approved.

Quality checks include:

- exactly 50 distinct targets per unit;
- no accidental within-unit duplicates;
- each target has a safe student-friendly meaning;
- each production activity has valid accepted answers;
- distractors are plausible but genuinely incorrect;
- paraphrases preserve meaning;
- phrase targets remain intact;
- no ambiguous marking dependency;
- balanced activity/context variation.

The currently supplied source files already demonstrate why this validation is necessary: some units are short and some contain within-unit duplicates. These issues must be corrected before affected units become live.

## 21. Content authoring workflow

Production proceeds unit-by-unit and set-by-set.

Recommended pipeline:

1. clean source unit list;
2. confirm 50 distinct targets;
3. structure records in batches of 10;
4. AI-assisted first draft of enrichment data;
5. rigorous validation of meaning, paraphrases, distractors, contexts and marking;
6. full-unit audit for duplication and variation;
7. approve content;
8. ingest into the live content store.

Accuracy is more important than maximizing synonym count. Some terms may have only one or two safe equivalents.

## 22. Session completion experience

Session completion should emphasize progress rather than marks.

Example untimed summary:

- 10 words practised
- 3 strengthened
- 2 moved to Secure
- 1 mastered
- 2 need another look

Example timed summary:

- 10-minute session complete
- 17 words practised
- 6 strengthened
- 2 mastered

Avoid giant score screens as the primary completion experience.

## 23. Student word detail

The `View all words` experience may show each target and its state.

On drill-down, show qualitative strand information:

- Meaning — secure
- Recognition — secure
- Context — secure
- Paraphrasing — secure
- Production — keep practising

Do not expose raw confidence percentages by default.

## 24. Teacher analytics philosophy

Teacher analytics are essential and must align with Evidence Hub philosophy.

The teacher should not manually inspect hundreds of attempts.

The default workflow is:

**What needs attention -> why -> who -> what should I do next?**

Analytics must surface interpretation before detail.

## 25. Teacher class overview

Recommended top-level insights:

- students needing attention;
- main class weakness;
- most difficult words/phrases;
- engagement/recent practice;
- recent improvement trend.

Example interpreted insight:

`7 students understand the meanings but cannot produce accurate paraphrases.`

The dashboard should distinguish:

- content problems — specific terms are difficult;
- skill problems — e.g. production/paraphrasing is weak across many terms.

## 26. Problem-area drill-down

A drill-down should answer:

1. what is going wrong?
2. which students are affected?
3. what action is appropriate?

Useful groupings include:

- by target word;
- by student;
- by failure type;
- by mastery strand.

Failure-type examples:

- knows meaning but cannot paraphrase;
- chooses a related but inaccurate synonym;
- understands in context but cannot retrieve;
- produces the wrong grammatical form.

Raw attempts sit behind a `View evidence` action rather than dominating the page.

## 27. Individual student view

Teacher view should show a concise learning profile, not another gradebook.

Recommended elements:

- current unit focus;
- strongest strand;
- main development area;
- recent trend;
- last practice;
- unit-by-unit progress;
- persistent vocabulary gaps;
- qualitative strand profile;
- teacher actions.

This view becomes especially valuable when Evidence Hub later combines it with Reading, Listening, Paraphrasing and Writing evidence.

## 28. Teacher actions

Teachers may act from both the Hub and Evidence Hub.

Supported actions should include:

- recommend adaptive untimed practice;
- recommend timed 5/10/15/20-minute practice;
- assign formal practice;
- target whole class, selected group, or individual;
- target whole unit, skill strand, or selected words;
- create a clean target list for Microsoft Teams quiz construction;
- mark a need for intervention/review.

If analytics have already identified the target, the action should prefill that context to reduce teacher workload.

## 29. Recommendation vs assignment vs intervention

The shared lifecycle distinguishes:

### Recommendation
Light-touch suggestion that preserves student autonomy.

### Assignment
Teacher-directed task with completion expectation and optional due date.

### Intervention
Structured response to an identified learning need, intended to be evaluated for impact.

Target may be:

- one student;
- selected group;
- whole class.

Session may be:

- adaptive untimed;
- timed 5/10/15/20 minutes.

Status may include:

- recommended/assigned;
- started;
- completed;
- overdue where relevant;
- reviewed.

Outcome may include:

- improved;
- partially improved;
- no clear change yet;
- insufficient follow-up evidence.

The learning area should calculate improvement using pre/post evidence rather than requiring the teacher to guess manually.

## 30. Microsoft Teams use

Vocabulary analytics should explicitly support targeted Teams follow-up.

A teacher-facing `Teams Target List` may contain:

- target words/phrases;
- affected students;
- weak mastery strand;
- common incorrect answers or misconception type;
- suggested focus.

Teams is an external follow-up surface, not the primary evidence store.

If Teams result integration is added later, it may join the same intervention/evidence trail.

## 31. Shared Hub evidence architecture

The current Supabase foundation already includes a generic `apps` registry and shared `activity_events` stream. The vocabulary feature should extend this architecture rather than create an isolated analytics silo.

The evidence architecture has three layers.

### 31.1 Raw learning activity — learning area owns detail

Each app records detailed activity required for adaptation and mastery.

Examples may include:

- activity type;
- target/skill;
- unit/set/context;
- correct/incorrect;
- supported retry;
- recovery;
- score/max where meaningful;
- active time;
- specialist metadata.

### 31.2 Learning interpretation — each app owns expertise

Each learning area decides how its own evidence becomes educational conclusions.

Vocabulary understands vocabulary mastery.
Reading understands inference/detail/attitude evidence.
Writing understands its own rubric/skill model.
Future apps do the same for their domains.

Evidence Hub should not need to understand every internal scoring algorithm.

### 31.3 Meaningful summaries — Evidence Hub consumes interpretation

A standardized summary contract should include concepts such as:

- student ID;
- learning area;
- skill strand;
- context/unit/task;
- interpreted status;
- trend;
- signal strength/confidence;
- engagement context;
- evidence window;
- persistent targets/problem count;
- provenance/source app.

Evidence Hub consumes interpreted evidence rather than blindly averaging incompatible percentages.

## 32. No universal percentage assumption

A percentage from one learning area does not necessarily mean the same thing as a percentage from another.

Evidence Hub must not simply average Vocabulary, Listening, Reading and Writing percentages.

Cross-area analysis should use interpreted statuses, trend, signal strength, domain-specific skill meaning, and provenance.

## 33. Evidence Hub closed loop

The desired long-term flow is bidirectional:

**Hub learning evidence -> Evidence Hub insight -> teacher intervention/recommendation -> Hub learning activity -> new evidence -> Evidence Hub outcome analysis**

This model applies to all current and future learning areas, not only Vocabulary.

## 34. Extensibility contract

A future learning area should be able to join the ecosystem by declaring:

- app/learning-area identity;
- skill strands;
- activity evidence events;
- interpreted statuses;
- trend and signal-strength logic;
- supported intervention targets/session types;
- outcome evaluation logic.

No Evidence Hub redesign should be required simply because a new learning area is added.

## 35. Privacy and data boundaries

Privacy is a hard architectural requirement.

### 35.1 GitHub

GitHub may contain:

- source code;
- migrations;
- configuration excluding secrets;
- curated non-student course content;
- vocabulary definitions/paraphrase banks/contexts;
- test fixtures that contain no real student work.

GitHub must never contain real student essays, answers, notes, teacher notes, teacher prompts, or identifiable learning evidence.

### 35.2 Supabase / learning storage

Private student performance and learning evidence belong in the authenticated data layer under strict authorization and RLS.

Students may access only their own evidence.
Teachers may access only authorized students/classes.
Admins follow the existing admin authorization model.

Stable IDs, not display names, are the integration keys across systems.

### 35.3 Evidence Hub

Evidence Hub should normally receive interpreted evidence summaries and intervention outcomes rather than unnecessary raw student answer payloads.

Conclusions must retain provenance so they can be traced to the source learning area and evidence window.

## 36. Core implementation principle

The feature should reuse existing Hub authentication, profile/class membership, app registry, and event-tracking foundations wherever appropriate.

Do not create a second independent identity system, second class model, or parallel teacher analytics silo.

The vocabulary content/mastery subsystem may require specialist tables because its domain model is richer than generic `activity_events`, but those tables must integrate with the shared user/class/app architecture.

## 37. Out of scope for initial implementation

Unless separately approved, initial implementation does not include:

- public leaderboards;
- live AI-generated marking as a mastery gate;
- unrestricted open-ended sentence grading;
- direct Microsoft Teams API integration;
- full Evidence Hub synchronization implementation if the integration contract is not yet ready;
- content for units that have not yet been cleaned/approved;
- unrelated changes to the existing Reading, Listening, Paraphrasing or Essay Writing apps.

## 38. Success criteria

The design is successful when:

- students can select any unit and complete adaptive untimed or 5/10/15/20-minute timed mixed practice;
- the system prioritizes high-value target words based on evidence;
- students receive supportive feedback and later recovery opportunities;
- full mastery requires genuine productive evidence;
- global vocabulary mastery and unit-specific contextual mastery coexist;
- teachers immediately see actionable class/student problem areas;
- teachers can recommend or assign targeted Hub practice and generate Teams target lists;
- evidence produced by Vocabulary fits the same scalable Hub -> Evidence Hub architecture as every other learning area;
- future learning areas can join without redesigning the evidence ecosystem;
- private student evidence remains outside GitHub and properly access-controlled;
- curated content remains deterministic, reviewable and quality-controlled.

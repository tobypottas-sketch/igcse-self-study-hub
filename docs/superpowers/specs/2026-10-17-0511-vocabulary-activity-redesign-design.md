# Cambridge iGCSE ESL 0511 Vocabulary & Paraphrase Builder — Activity Redesign

**Date:** 2026-10-17  
**Status:** Design approved in conversation; written specification awaiting review  
**Scope:** `igcse-self-study-hub` Vocabulary & Paraphrase Builder only  
**Preserve:** existing authentication, privacy boundaries, staff preview semantics, Supabase evidence architecture, teacher analytics foundation, and New → Building → Secure → Mastered concept unless explicitly changed below.

## 1. Purpose

Redesign the Vocabulary & Paraphrase Builder so it trains the vocabulary and paraphrasing operations Cambridge iGCSE English as a Second Language 0511 actually demands, rather than behaving primarily like a synonym/definition quiz.

The product should help Grade 9–11 ESL learners:

- understand words and phrases in context;
- infer meaning from contextual clues;
- recognise equivalent wording between a question and a source text;
- use collocations, word families, set phrases and appropriate lexical forms;
- paraphrase short phrases accurately;
- paraphrase whole ideas without changing quantity, degree, cause/effect, time, certainty, viewpoint or other meaning-bearing details;
- improve lexical range and avoid unnecessary repetition in writing;
- explain an idea another way when exact vocabulary is unavailable;
- progress from supported recognition to independent production;
- choose the vocabulary skill area they want to practise while preserving a rigorous definition of mastery.

The app must not reward brute-force guessing, repeated retries on the same prompt, or endless low-level multiple-choice recognition as if these prove mastery.

## 2. Research basis

The design is grounded in Cambridge 0511 requirements and established vocabulary-learning product patterns.

### Cambridge 0511

Cambridge frames 0511 as practical communication across reading, writing, listening and speaking. The 2024–2026 syllabus requires learners to understand and use language in context and to handle vocabulary, phrases, relationships between ideas and appropriate language choices. Cambridge guidance also makes clear that candidates do **not** need to paraphrase every reading answer unless the task specifically requires own words; paraphrasing should therefore be trained as a broader transfer/communication skill, not as a false universal exam rule.

Primary sources:

- https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-igcse-english-second-language-count-in-oral-0511/
- https://www.cambridgeinternational.org/Images/637163-2024-2026-syllabus.pdf
- https://help.cambridgeinternational.org/hc/en-gb/articles/28848745537170-To-what-extent-the-students-should-paraphrase-their-answers-even-if-not-instructed-Answer-in-your-own-words

### Effective vocabulary-training patterns

The redesign adopts learning patterns rather than copying any platform UI:

- **Vocabulary.com:** varied question types including definition, sentence meaning, sentence synonym, fill-in-the-blank and “Apply the Meaning”; missed words return through follow-up questions and later review.
- **Quizlet:** guidance fading from supported recognition toward written recall; recognition is useful early but can be solved by elimination and therefore is weaker mastery evidence.
- **Duolingo:** adaptive difficulty, mistakes-focused practice, and more advanced tasks when learners are ready.

Sources:

- https://www.vocabulary.com/help/the-basics/question-types-and-modes/
- https://www.vocabulary.com/articles/announcements/100000-questions-and-counting/
- https://quizlet.com/features/how-quizlet-works
- https://blog.duolingo.com/keeping-you-at-the-frontier-of-learning-with-adaptive-lessons/

## 3. Core learning model

The activity layer should move learners through:

**Understand meaning → recognise equivalent meaning → understand in context → transform meaning → produce meaning independently**

The fundamental object is no longer simply “target word → exact answer”. The product trains semantic control across words, phrases, sentences and short reading contexts.

### Core rule

> Recognition teaches. Context confirms understanding. Paraphrasing proves transfer. Production proves independent control.

### Mastery rule

> Mastery requires transfer and production; repeated recognition alone can never create Mastered status.

## 4. Student-facing practice modes

Replace the current internal-feeling modes with 0511-specific choices:

1. **Learn the Vocabulary**  
   Core meaning, applied meaning, correct usage, collocation and word-family work.

2. **Understand in Context**  
   Infer meaning, distinguish precise usage, interpret vocabulary in realistic sentences and short texts.

3. **Question ↔ Text**  
   Recognise when a question and source text express the same information using different wording; identify the evidence that answers the question.

4. **Phrase Paraphrasing**  
   Match, build, complete and independently rewrite short phrases and language chunks while preserving meaning.

5. **Idea Paraphrasing**  
   Recognise and produce whole-clause/sentence paraphrases while preserving all important meaning.

6. **Writing Vocabulary**  
   Avoid repetition, improve lexical precision, select natural collocations/forms and use language appropriate to purpose/register.

7. **Adaptive 0511 Mix**  
   The system selects the strongest useful next activity based on missing evidence, recent errors, readiness and review needs.

Every mode may be used as an untimed short session or with the existing **5 / 10 / 15 / 20 minute** timed options.

Student choice controls what is practised, but does not redefine what counts as mastery.

## 5. Exercise catalogue

The redesigned engine should support these 18 distinct language operations.

| # | Exercise | Student operation | Primary 0511 purpose | Typical stage |
|---|---|---|---|---|
| 1 | Meaning Match | Match target to a clear meaning | Core lexical meaning | New |
| 2 | Which Situation Fits? | Choose a situation demonstrating the concept | Applied meaning | New → Building |
| 3 | Meaning in Context | Infer meaning from a sentence/short passage | Contextual inference | Building |
| 4 | Correct Usage | Choose natural/accurate target usage | Lexical precision | Building |
| 5 | Collocation Builder | Select/build natural combinations | Collocation control | Building → Secure |
| 6 | Word Family Switch | Transform word form appropriately | Lexical/grammatical control | Building → Secure |
| 7 | Question ↔ Text Bridge | Match question wording to equivalent source wording | Reading paraphrase recognition | Building → Secure |
| 8 | Find the Evidence | Select exact source evidence for a paraphrased question | Reading retrieval | Building → Secure |
| 9 | Phrase Match | Match a short phrase to an equivalent expression | Phrase paraphrase recognition | New → Building |
| 10 | Build the Paraphrase | Arrange chunks into an equivalent phrase | Controlled transformation | Building |
| 11 | Complete the Paraphrase | Fill a missing element in a rewrite | Paraphrase control | Building → Secure |
| 12 | Rewrite the Phrase | Produce an equivalent short phrase | Productive paraphrasing | Secure → Mastered |
| 13 | Same Idea | Choose a sentence preserving the whole meaning | Idea paraphrase recognition | Building |
| 14 | Spot the Meaning Change | Identify a rewrite that distorts meaning | Precision / comprehension | Building → Secure |
| 15 | Build the Same Idea | Assemble chunks into a meaning-equivalent sentence | Idea transformation | Secure |
| 16 | Rewrite the Idea | Paraphrase a clause/sentence independently | Productive paraphrasing | Secure → Mastered |
| 17 | Improve the Vocabulary | Replace repetition/weak wording with a better lexical choice | Writing lexical range | Secure → Mastered |
| 18 | Explain It Another Way | Express the concept without relying on the exact target word | Communication repair | Mastered / review |

Generic word-search, hangman, spelling-race and childish picture-game mechanics are out of scope unless a later evidence-based need appears.

## 6. Interaction model

Use four reusable interaction primitives rather than bespoke UI for every exercise:

- **Tap / choose** — fast recognition and precision decisions.
- **Tap-to-build tiles** — phrase and sentence construction.
- **Highlight / select evidence** — Question ↔ Text and reading evidence tasks.
- **Short typing** — genuine production when the learner is ready.

The visual tone should remain mature: clean typography, compact cards, subtle motion, tactile tiles, quick transitions, no cartoon mascot, no lives economy, no public leaderboard and no casino-style reward effects.

A lightweight within-session streak may be used as subtle encouragement, but must not distort learning decisions.

## 7. Session design

### Adaptive session shape

A typical 10-question Adaptive 0511 Mix should feel progressively demanding rather than randomly mixed. A representative sequence is:

1. supported recognition;
2. applied meaning;
3. context inference;
4. phrase equivalence;
5. Question ↔ Text;
6. build task;
7. meaning-precision task;
8. supported production;
9. idea-level transformation;
10. independent production.

Exact sequences may vary according to evidence and readiness.

### Dynamic scaffolding

If a learner succeeds easily, the system should reduce support and raise the semantic/production demand.

Example:

**Meaning Match → Context → Build the Paraphrase → Rewrite the Phrase**

If a learner struggles, support should increase temporarily:

**Rewrite the Idea → Build the Same Idea → Same Idea**

Adaptive means changing the level of support and operation, not merely choosing another random question.

## 8. Feedback and wrong-answer behaviour

### Correct feedback

Feedback must be immediate and semantic, for example:

- `Correct — “reluctant” means unwilling or hesitant here.`
- `Exactly — “due to high costs” and “because it was expensive” express the same reason.`
- `Yes — this paraphrase keeps “some”; it does not change the quantity.`

Do not expose internal mastery jargon such as “word is getting stronger”.

### Wrong feedback

A wrong answer should explain the semantic problem where possible:

- quantity changed;
- degree/strength changed;
- cause/effect relationship changed;
- time changed;
- grammatical form is wrong;
- collocation is unnatural;
- information was added or omitted;
- register is inappropriate;
- wording is too vague;
- meaning is opposite/inaccurate.

### Support ladder

1. First incorrect response: brief targeted hint/explanation.
2. Supported retry: narrower choices, partial phrase, highlighted clue or chunk support.
3. Move on rather than allow endless guessing.
4. Recycle the concept later using a **different activity type and different context**.

### Evidence treatment

- first-attempt correct = full evidence;
- correct after light support = partial evidence;
- correct after major support = weak learning evidence, not mastery proof;
- repeated guessing = no positive mastery evidence.

A sequence such as `wrong → wrong → wrong → correct` must never be interpreted as independent success.

## 9. Evidence strands

Retain the existing five strands:

- Meaning
- Recognition
- Context
- Paraphrasing
- Production

Map exercises as follows:

| Exercise | Primary evidence |
|---|---|
| Meaning Match | Meaning |
| Which Situation Fits? | Meaning + Context |
| Meaning in Context | Context |
| Correct Usage | Context + Recognition |
| Collocation Builder | Recognition + Production |
| Word Family Switch | Production |
| Question ↔ Text Bridge | Context + Paraphrasing |
| Find the Evidence | Context |
| Phrase Match | Paraphrasing |
| Build the Paraphrase | Paraphrasing |
| Complete the Paraphrase | Paraphrasing + Production |
| Rewrite the Phrase | Paraphrasing + Production |
| Same Idea | Paraphrasing |
| Spot the Meaning Change | Paraphrasing + Context |
| Build the Same Idea | Paraphrasing + Production |
| Rewrite the Idea | Paraphrasing + Production |
| Improve the Vocabulary | Production |
| Explain It Another Way | Paraphrasing + Production |

Internally, evidence may carry strength levels:

- **Light:** supported recognition;
- **Medium:** contextual understanding;
- **Strong:** meaning transformation;
- **Very strong:** independent production.

## 10. Mastery progression

### New

Purpose: encounter and recognise meaning.

Favoured activities: Meaning Match, Which Situation Fits?, Phrase Match, simple Correct Usage.

Recognition success may move a target to Building but cannot create Secure or Mastered on its own.

### Building

Purpose: understand the concept when wording and context change.

Favoured activities: Meaning in Context, Correct Usage, Collocation Builder, Question ↔ Text, Find the Evidence, Complete the Paraphrase, Same Idea, Spot the Meaning Change.

To become Secure, require evidence across at least three strands, including Context or Paraphrasing, and at least one task where the answer is not simply exposed as a definition.

### Secure

Purpose: manipulate the language accurately with decreasing support.

Favoured activities: Collocation Builder, Word Family Switch, Question ↔ Text, Build the Paraphrase, Complete/Rewrite the Phrase, Spot the Meaning Change, Build the Same Idea, Improve the Vocabulary.

Low-level recognition should become uncommon unless diagnostic evidence justifies it.

### Mastered

Mastered means the learner can independently understand, transform and produce the language accurately in more than one context.

Requirements:

- target is already Secure;
- positive Context evidence exists;
- positive Paraphrasing evidence exists;
- at least two successful productive demonstrations exist;
- productive demonstrations come from different contexts or activity types;
- at least one productive success is unscaffolded enough to represent genuine retrieval/control;
- no unresolved recent error pattern that contradicts mastery.

Multiple-choice recognition alone can never produce Mastered status.

## 11. Two levels of mastery data

Track both:

### Vocabulary-item mastery

Examples:

- `significant — Mastered`
- `reluctant — Secure`

### Broader 0511 skill profile

Examples:

- Meaning in context — Secure
- Phrase paraphrasing — Secure
- Idea paraphrasing — Building
- Question ↔ Text — Building
- Lexical production — Secure

This enables student guidance and teacher analytics that identify meaningful skill patterns rather than only word counts.

Example teacher insight:

> Student knows most Unit 1 vocabulary but often changes quantities or degree when paraphrasing whole ideas.

## 12. Content architecture

The system must remain curated/deterministic. Author reusable language ingredients rather than 18 bespoke questions for every target.

### 12.1 Per-target lexical record

Each target should contain, where linguistically appropriate:

- term;
- part of speech;
- student-friendly core meaning;
- relevant unit/coursebook sense(s), not every dictionary sense;
- safe paraphrases;
- context-dependent paraphrases;
- plausible misleading near-synonyms/distractors;
- word-family forms;
- natural collocations;
- 3–5 distinct contexts;
- 1–3 phrase-level transformations;
- optional register, grammar and common-error notes.

Do not force fields where they are linguistically meaningless.

### 12.2 Phrase paraphrase records

A phrase record contains:

- original phrase;
- equivalent phrase;
- accepted variants;
- buildable chunks;
- grammar/word-class transformation notes;
- common meaning distortions;
- linked target vocabulary where relevant.

A single curated phrase pair may safely power Phrase Match, Build the Paraphrase, Complete the Paraphrase, Rewrite the Phrase and selected meaning-change tasks.

### 12.3 Unit-level idea paraphrase records

Do not require one whole-sentence paraphrase record per target. Author high-quality unit-level ideas that naturally combine several targets.

Each idea record contains:

- original idea;
- one or more accurate paraphrases;
- deliberate meaning-change distractors;
- key transformation links;
- meaning invariants that must be preserved, such as quantity, degree, cause, time, certainty or viewpoint;
- optional buildable chunks.

Target: approximately **10–15 strong idea-paraphrase sets per unit**.

### 12.4 Question ↔ Text mini-reading records

Each unit should contain short 0511-style reading snippets with differently worded questions.

Each record contains:

- short source text;
- 2–3 questions;
- exact evidence span(s);
- paraphrase links between question and source wording;
- naturally embedded unit vocabulary;
- optional contextual inference items.

Target: approximately **10–12 mini-reading sets per unit**.

### 12.5 Writing-vocabulary records

Each unit should include a small bank of tasks covering:

- avoiding repetition;
- improving lexical precision;
- natural collocation;
- word-family/form selection;
- register/purpose where relevant.

For the Unit 1 gold-standard pilot, target **8–10 writing-vocabulary sets**.

### 12.6 Misconception records

Record known/fair failure types where useful:

- quantity change;
- degree/strength change;
- tense/time change;
- cause/effect reversal;
- contrast/concession error;
- added information;
- omitted information;
- wrong word form;
- unnatural collocation;
- overly vague substitute;
- register mismatch.

These should power targeted feedback and teacher analytics.

## 13. Safe generation boundary

The runtime may:

- shuffle approved option order;
- choose among approved contexts;
- hide approved words/phrases to create gaps;
- arrange approved chunks into build tiles;
- select approved distractors;
- pair an approved question with its approved source text/evidence;
- rotate approved paraphrase pairs;
- vary which approved equivalent is displayed.

The runtime may **not**:

- invent synonyms;
- invent accepted answers;
- generate whole-sentence paraphrases at runtime;
- invent distractors;
- improvise grammatical transformations;
- generate new Cambridge-style passages live;
- use live AI to decide that an uncurated answer is “close enough”.

Student answers, notes, teacher notes/prompts and other private learning data must never be committed to GitHub.

## 14. Unit 1 as the gold-standard pilot

Do not scale the redesigned system across all source-ready units until Unit 1 proves the learning model and UX.

### Unit 1 lexical enrichment

Audit and enrich all existing 50 targets with:

- accurate student-friendly meanings;
- relevant senses;
- safe paraphrases;
- plausible distractors;
- natural collocations where useful;
- word families where useful;
- 3–5 varied contexts;
- 1–3 phrase paraphrase pairs where useful;
- optional misconception notes.

Reuse good existing material; do not rewrite merely for novelty.

### Unit 1 unit-level content targets

Create approximately:

- **12 strong phrase-paraphrase sets** beyond simple target-level pairs;
- **12 idea-paraphrase sets**;
- **10 Question ↔ Text mini-reading sets**;
- **8–10 writing-vocabulary sets**.

The exact count may vary if quality would be reduced by filling a quota.

## 15. Quality assurance

### Automated structural validation

Extend the strict validator to check, as appropriate:

- required fields and IDs;
- duplicate IDs;
- accepted answers do not appear among distractors;
- phrase sides are not identical;
- linked contexts/items exist;
- activity mappings are valid;
- required minimum context coverage;
- answer arrays are non-empty where required;
- activity types reference supported interactions;
- unit-level paraphrase/reading records are structurally complete;
- no accidental answer leakage into prompts where retrieval is intended.

### Linguistic QA

A separate linguistic review must inspect:

- natural English;
- semantic accuracy;
- paraphrase meaning preservation;
- distractor fairness/plausibility;
- context support for the accepted answer;
- 0511 relevance;
- difficulty appropriate to Grade 9–11 ESL learners;
- collocation naturalness;
- preservation of quantity, degree, cause/effect, time, certainty and viewpoint in idea paraphrases.

Structural validation cannot substitute for linguistic QA.

## 16. Unit 1 authoring order

1. Audit the existing 50 lexical records.
2. Enrich the lexical layer.
3. Add target-level and unit-level phrase-paraphrase records.
4. Add 12 idea-paraphrase sets.
5. Add 10 Question ↔ Text mini-reading sets.
6. Add 8–10 writing-vocabulary sets.
7. Run strict structural validation.
8. Run linguistic QA.
9. Only then rebuild the exercise engine around the approved content.
10. Pilot Unit 1 hard in Staff Preview before scaling other units.

## 17. Staff Preview and privacy

Staff Preview must continue to use the real student activity flow while displaying:

> **STAFF PREVIEW — Results are not recorded**

Preview activity must not write:

- student mastery;
- engagement evidence;
- Evidence Hub summaries;
- class analytics;
- teacher interventions triggered by learner evidence.

The redesigned interactions and adaptive progression must be testable through Staff Preview before student rollout.

## 18. Student session summary

Keep progress reporting quiet and useful during practice (`4 of 10`, small skill label).

At session end, summarise learning rather than raw game points. Example:

- 10 activities completed;
- 4 vocabulary items strengthened;
- 2 phrase-paraphrasing skills improved;
- 1 idea still needs another look;
- recommended next practice: Idea Paraphrasing.

Exact copy may be refined during implementation, but must not expose awkward internal mastery language.

## 19. Teacher analytics implications

The redesigned evidence should eventually allow insights such as:

- understands word meaning but struggles in context;
- recognises paraphrases but cannot produce them;
- changes quantities when paraphrasing;
- loses cause/effect relationships;
- selects unnatural collocations;
- needs support with Question ↔ Text equivalence;
- lacks lexical variety in writing.

This design does not require a complete teacher-dashboard redesign in the first implementation slice. It requires the evidence model to preserve enough structured information for those analytics to be built reliably.

## 20. Out of scope for the first implementation slice

- scaling all 20 units;
- live generative-AI marking;
- public leaderboards;
- lives/energy economy;
- elaborate XP/reward marketplace;
- audio pronunciation/speech recognition unless separately designed later;
- generic word games without a direct 0511 skill rationale;
- unrelated Hub applications or Evidence Hub Personal App changes.

## 21. Success criteria for the Unit 1 pilot

The redesign is ready to scale beyond Unit 1 only when:

1. students can deliberately choose all seven 0511 practice modes;
2. Adaptive 0511 Mix visibly progresses from support toward transformation/production;
3. sessions contain genuine activity variety and do not collapse into repeated MC templates;
4. an unfamiliar word is not routinely tested first through blind exact-word retrieval;
5. wrong answers trigger semantic feedback and bounded support rather than unlimited guessing;
6. assisted retries do not masquerade as mastery evidence;
7. phrase paraphrasing and idea paraphrasing are materially different activities;
8. Question ↔ Text practice genuinely trains differently worded questions/evidence;
9. mastery still requires context, paraphrasing and production evidence;
10. Unit 1 content passes structural validation and linguistic QA;
11. Staff Preview remains non-persistent;
12. response interactions feel immediate rather than waiting on network persistence;
13. teacher/student private learning data remain outside GitHub;
14. production deployment passes the Hub’s normal tests, Runtime Smoke, System Audit and GitHub Pages checks.

## 22. Implementation principle

The implementation should preserve the useful foundations already built and replace the weak activity layer deliberately. It should not become a rewrite of authentication, persistence or unrelated Hub architecture.

The first implementation phase should focus on making **Unit 1 an excellent, representative 0511 training experience**. Only after that experience is validated should the richer content schema and activity engine be rolled across additional units.

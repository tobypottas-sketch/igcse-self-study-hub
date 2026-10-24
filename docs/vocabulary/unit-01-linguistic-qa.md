# Unit 1 — Sports and Free Time — Linguistic QA

**Date:** 2026-10-17  
**Scope:** Cambridge iGCSE ESL 0511 Vocabulary & Paraphrase Builder, Unit 1 gold-standard pilot  
**Source alignment:** `0511_UNIT_1.docx` target list and approved Unit 1 authoring records  
**Student data:** none

## QA purpose

This review records the linguistic decisions used to prepare Unit 1 as the first gold-standard 0511 activity bank. It checks the authored vocabulary, phrase transformations, idea paraphrases, Question ↔ Text mini-readings and writing-vocabulary tasks before publication.

The bank remains deterministic: all target wording, accepted answers, distractors, meaning invariants, source passages, evidence spans and paraphrase links are curated in repository content. Runtime AI is not used to decide correctness or invent alternatives.

## Coverage

- 50 vocabulary targets retained in the approved source order.
- 12 phrase-paraphrase sets.
- 12 idea-paraphrase sets.
- 10 Question ↔ Text mini-reading sets, each with two questions and exact evidence spans.
- 8 writing-vocabulary sets.
- Existing per-target meaning, paraphrase and production contexts retained unless a specific QA issue required correction.

## Linguistic checks applied

Each authored record was reviewed against these criteria:

- natural, age-appropriate English for Grade 9–11 ESL learners;
- meaning remains stable when wording changes;
- quantity, degree, time, cause/effect, polarity, comparison and addition are preserved where they carry meaning;
- distractors are plausible enough to diagnose understanding but are not defensibly correct alternatives;
- collocations and word-family forms are natural in the supplied sentence;
- paraphrases do not reduce a whole-idea task to simple one-word synonym matching;
- Question ↔ Text evidence spans occur verbatim in the curated source text;
- primary vocabulary evidence is assigned only where the activity genuinely tests that target;
- no student answer text or other private learning data is stored in the content bank.

## Important lexical decisions

### afford

Use the ability-to-pay sense. `pay for` / `have enough money for` are appropriate contextual paraphrases. Do not treat `buy` as a general equivalent because buying does not itself express financial ability.

### deny

Use the `say that something is not true` sense in this unit. The activity bank distinguishes this from `admit` and does not broaden the accepted meaning to unrelated refusal senses.

### discipline

Use the self-control / consistent-training sense, not punishment or a school subject. Related tasks preserve the idea that ability alone is not enough when the source says both discipline and ability are required.

### minimum

Structural paraphrases such as `at least` and `no fewer than` are preferred where natural. The idea must not drift to `at most` or to an exact-only quantity.

### historic

Means important in history or likely to be remembered, not merely old. Distractors must not encourage the common `historic = old` confusion.

### significant

Use important/notable or large enough to have an effect. `Big` is not accepted automatically; it is only useful when the context genuinely preserves the intended meaning and degree.

### estimated

Preserve approximation and uncertainty. A paraphrase that changes an estimated figure into a definite/exact figure is a meaning change.

### relatively

Preserve the comparison frame and limited degree. `Relatively small` is not equivalent to `extremely small`.

### regardless

Preserve concession: the event continues despite the stated condition. `Because of` changes the relationship and is not equivalent.

### goal-oriented

A one-tile `goal-oriented` build task was rejected during QA because it would not test construction. For buildable phrase practice, the authored pair is presented in the direction that requires assembling the multi-part equivalent (`focused on achieving clear aims`) rather than tapping a single ready-made token.

## Idea-paraphrase meaning invariants

The Unit 1 idea bank deliberately includes examples where a superficially similar rewrite is wrong because it changes meaning. Covered categories include:

- preference/comparison direction;
- positive vs negative/polarity;
- degree or strength;
- quantity;
- addition/omission;
- cause and effect;
- time/order;
- certainty/approximation;
- relative comparison.

These categories are intended to support semantic feedback and later teacher analytics. They are not treated as raw student-answer records.

## Question ↔ Text QA

Each mini-reading contains at least two differently worded questions. For every question:

- the stored evidence span appears exactly in the source passage;
- the paraphrase link records the relationship between question wording and source wording;
- the question can be answered from the supplied text alone;
- vocabulary is embedded naturally rather than inserted simply to expose a target word.

## Writing-vocabulary QA

The writing bank currently covers:

- replacing vague/repeated wording with a more precise Unit 1 item;
- natural collocation;
- appropriate word-family form;
- concise lexical replacement.

Accepted answers are deliberately bounded. A response is only mastery evidence when it matches the curated task rather than merely being a generally plausible synonym.

## Release gate

Unit 1 should only be treated as release-ready when all of the following are green on the same branch head:

1. `tests/vocabulary-unit-01-0511-content.test.js`;
2. the full `npm test` suite;
3. `node scripts/validate-vocabulary-content.mjs`;
4. privacy/hardening tests covering vocabulary tracking and persistence.

Passing this QA means the curated bank is suitable to move into the next implementation stage. It does not imply the new 18-operation student activity engine is complete; that is implemented and tested separately.

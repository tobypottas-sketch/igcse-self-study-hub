# Authoring a Vocabulary Builder unit

Start from `content/vocabulary/units/unit-template.js` (copy it to `units/unit-NN.js`). It shows every authored structure with a worked
example. Check your work whenever you like, no database needed:

```
node scripts/check-unit-authoring.mjs content/vocabulary/units/unit-NN.js
node scripts/check-unit-authoring.mjs content/vocabulary/units/unit-NN.js --require-live meaning,context   # fail if these would not go live
```

The check asks the same readiness evaluator the students' app uses, so it reports what a student would actually get: which pathways would
be live and, for each that would not, **how many more words need content and what each one lacks**. It never uses a fixed quota. If the
generator already covers most words' spellings, it asks for the few that remain; if it covers all of them, it asks for none.

## What each pathway needs

| Pathway | Authored content that counts |
|---|---|
| Meaning | meaning, paraphrases, ≥3 authored wrong meanings (`distractors`), meaning/paraphrase/production sentences, ≥1 mastery context (with the meaning it shows), ≥3 `situationDistractors` |
| Context | gap-fill sentences (`retrievalContexts`) with a reviewed `gapDistractors` row (exactly the 3 wrong options that can not also fit) for each sentence meant to count; language bank optional |
| Word Families | `wordFamily` forms + `word_family` writing activities |
| Precision & Use | `improve_vocabulary` writing activities |
| Paraphrasing | `phrase_set` and `idea_set` activities (both kinds) |
| Spelling & Recall | nothing required; reviewed misspellings only for words the generator cannot cover (lexical list, `lexical-spelling-errors.js`, shared by every unit) |

Thresholds live in `content/vocabulary/pathway-readiness-rules.js`. Judgement-call questions (Which Situation Fits, Meaning in Context,
Context choose / match / gap-fill) count a word only when its wrong options are reviewed and well formed; generated options never count.
A malformed reviewed record (answer mismatch, repeated or empty options, answer among the wrong options, an id that is not this word's
sentence) fails that word rather than being trusted.

## Publishing
1. `node scripts/check-unit-authoring.mjs ...` clean (structure valid, intended pathways live).
2. `node scripts/validate-vocabulary-content.mjs` and the full test suite.
3. Publish as for Unit 1; reviewed content travels inside each word's `senses` data, so there is no engine change and no schema change.

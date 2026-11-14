# Vocabulary diagnostic — item-writing and validation blueprint v1

**Status:** Editorial standard proposed for review, not a validated CEFR scale, approved item bank or implementation of the student lock. Applies to all 120 existing candidates and their replacements. The five provisional level bands A1/A2/B1/B2/C1 do not by themselves establish measurement accuracy.

## 1. What the diagnostic measures

**Primary construct:** receptive knowledge of English word and phrase meanings, common collocations and sense distinctions **in a short context**.

**Not the primary construct:** ability to solve general logic puzzles, guess sensible behaviour, read lengthy passages, recognise the longest answer, apply grammar rules alone, or use specialist subject knowledge.

The diagnostic is **not a Cambridge-endorsed CEFR placement test**. Do not claim exact CEFR certification, 0511 grade prediction, or reliable growth estimates without independent calibration and evidence.

## 2. Item families (blueprint targets, not quotas yet)

| Family | What students do | What it can establish | Typical risk |
|---|---|---|---|
| Contextual lexical selection | Choose the word/phrase completing a natural sentence | Recognition of contextual meaning and usage | Grammar or collocation alone gives key |
| Meaning discrimination | Select the best paraphrase of a target word in context | Sense comprehension | Key is longest or direct definition; implausible distractors |
| Polysemy in context | Select an example of a specified sense among different uses | Distinguish common senses | Unfamiliar topic/grammar dominates |
| Collocation choice | Choose the conventional phrase in a short situation | Lexical combinatorial knowledge | Becomes pure grammar |
| Contextual inference | Infer meaning of a target in a brief realistic scenario | Vocabulary supported by context | Answer solvable without knowing the word |

**Initial editorial distribution goal for each provisional level (24 items):** 8 contextual selection, 7 meaning discrimination, 4 polysemy/collocation (depending on level suitability), 5 contextual inference. **This is a design target, not an empirically validated optimum.** For A1, avoid artificial polysemy merely to fill a quota. Vary context and word classes; do not force every target into a cloze.

## 3. Four-option item rules (hard gate)

1. Exactly one **defensible** key. A second option that can be true in the stated context is a failure even if it is less precise.
2. Every distractor must be grammatically compatible with the stem and plausible enough that an appropriately lower-proficiency learner might choose it. No random unrelated objects or silly behaviour.
3. Parallel format: comparable option length, register, grammatical class, specificity, tense and punctuation.
4. No direct target-word repetition in only the key, unique synonym or answer in the stem, obvious absolute terms, or a uniquely detailed correct option.
5. No external facts needed to establish the key. Names, money, numbers and cultural references must not carry the construct.
6. Use natural English, not contorted sentences engineered to make distractors fail.
7. Each item must have a **key rationale** and **three individual distractor rationales** explaining the semantic distinction. Generic placeholders fail review.
8. A question may be an easy anchor; label it as such. Do not assume it discriminates well because it is valid.
9. Avoid lexical dependence between items (e.g., one question explaining the answer to another) and repeated contexts that reward memorising a pattern.
10. Do not expose draft items to students or assign a level from a writer's intuition alone.

## 4. Explicit reviewer checklist

For each candidate, record:
- Item ID, revision, target lemma/sense, provisional level, word class and item family.
- Key and all options with item-specific rationales.
- **Blind key review:** reviewer chooses the answer without seeing the author's key.
- **Distractor challenge:** reviewer argues the strongest possible case for each wrong option; any defensible alternative blocks approval.
- **Construct check:** can a student who does *not* know the target still answer from general common sense, option tone or grammar? If yes, rewrite or label as weak.
- **Clue check:** unique longest answer, unusual formatting, absolute language, key-only paraphrase, answer-position patterns.
- **CEFR review:** independent reference to an explicitly named framework, lexical sense and proficiency demand. Mark level uncertain when evidence is insufficient.
- **Language/accessibility check:** short, culturally neutral contexts; no unnecessarily complex surrounding vocabulary.
- Reviewer identity/date, disposition **approve / revise / reject**, and reason. Approval cannot be inferred from a completed checklist alone.

## 5. Evidence needed before launch

- **Expert review:** at least two independent reviews per item, with disagreements resolved and logged.
- **Pilot:** real student response distributions across ability bands, including response times and option selection; protect privacy and avoid unnecessary identifiable exports.
- **Item analysis:** facility (proportion correct), item-total association/discrimination, distractor selection rates, missingness, and possible local dependence.
- **Level calibration:** compare item performance against an independently anchored proficiency measure. CEFR level hypotheses must be revised where data disagree.
- **Adaptive/short-form decisions:** only after checking classification accuracy and measurement precision near cut scores. Do not infer a valid level from a raw score alone.
- **Retesting:** use equated or overlapping item forms, account for practice effects, and require evidence of detectable change before reporting vocabulary growth.
- **Fairness:** examine unexpectedly different performance by relevant groups where data and permissions allow; avoid collecting sensitive data unnecessarily.

**No invented statistical thresholds:** choose minimum sample sizes, discrimination cutoffs and level boundaries with a measurement specialist after inspecting pilot feasibility and intended stakes. Until then, report descriptive pilot evidence and uncertainty, not certified proficiency.

## 6. Release gates

**Gate A — editorial:** all items have independent single-key, clue and construct reviews; unresolved ambiguities block publication.

**Gate B — measurement:** pilot evidence supports intended difficulty, discrimination and level coverage; a documented classification rule exists.

**Gate C — operations:** diagnostic feature, access control, existing-user lock, recovery/resume, accessibility, teacher oversight, and audit trail have been tested with pilot accounts. No user should lose access due to a broken or unavailable diagnostic.

**Gate D — rollout:** explicit owner approval to enable the feature flag and mandatory diagnostic lock for both new and existing students, with an emergency rollback plan.

The diagnostic must stay **OFF** until these gates are met.

## 7. Immediate next implementation work

1. Use this blueprint to redesign high-priority items, starting with the eight examples in reconstruction batch 01.
2. Replace ambiguous or obviously cued distractors before proposing any database update.
3. Build a review ledger containing revision history and reviewer decisions; do not silently overwrite the 120 draft originals.
4. Only then prepare a versioned import/migration proposal for approved candidate revisions, separate from the student-facing release.

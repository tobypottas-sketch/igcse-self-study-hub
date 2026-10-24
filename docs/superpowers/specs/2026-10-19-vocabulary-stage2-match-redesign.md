# Vocabulary Builder Stage 2 Match Redesign

Date: 2026-10-19
Repo: tobypottas-sketch/igcse-self-study-hub
Scope: Vocabulary Builder only

## Problem

Stage 2 (Match) currently behaves as a generic response-mode exercise rather than a pathway-appropriate learning experience. The same browser `<select>` matching control is reused across multiple pathways, producing weak and sometimes pedagogically invalid interactions.

Observed failures include:

- Meaning Match repeatedly serves the same `word_definition_match` mechanic because the pathway contract exposes only one Stage 2 activity type.
- Context Match duplicates the same gapped sentence in both the visible source/context area and the generic match target.
- Word Family Match constructs distractors from unrelated word-family material across the unit, allowing answers by category rather than morphology.
- Spelling Match reduces visual spelling discrimination to a dropdown, which is a poor fit for the skill.
- The generic matching renderer introduces sterile UI, inconsistent learning value, and excessive repetition across a 10-question session.

The underlying progression ladder is not the problem. Stage 2 should remain the Match rung in the existing single-source pathway architecture.

## Intent

Redesign Stage 2 so that all six vocabulary pathways test matching/discrimination appropriately while sharing a consistent, polished student interaction.

The student experience should feel consistent without flattening every pathway into the same question. Repetition of the cognitive operation is acceptable; repetition of the exact same interaction and bad distractor logic is not.

## Non-negotiable constraints

- Preserve the five-rung ladder: Recognise → Match → Apply → Recall → Mastery.
- Preserve existing mastery thresholds, evidence thresholds, student history, pathway evidence and progression logic.
- Do not reintroduce the retired unit-level 10/8 journey as authority.
- No student data reset or migration that destroys historical evidence.
- Do not change Supabase data unless a future implementation step proves a schema/content requirement. This redesign should be achievable in application code and shared pathway contracts.
- No TinyFish.
- Do not touch Evidence Hub or unrelated repositories.
- Privacy rule remains absolute: no real student answers, essays, notes, teacher notes or private learning data in GitHub.

## Design decision

Stage 2 will use a shared **Match Card interaction shell** rather than the current generic dropdown-based `matching` UI.

A Match Card question presents one clear cue and a set of large selectable answer cards. The student selects one card and then submits with **Check answer**. On retry, the card set may narrow to two options where existing support logic allows.

This shell is shared visually and behaviorally, but each pathway owns the content logic that generates its cue and plausible answer set.

True drag-and-drop remains available for later stages where manipulation itself has learning value. Stage 2 should default to click/tap selection because it is faster, clearer, keyboard-friendly, touch-friendly and better suited to school laptops and iPads.

## Shared Match Card UX

### Core interaction

- One cue area per question.
- Four answer cards by default where four valid options exist.
- Click/tap selects exactly one card.
- Selected state is visually obvious but restrained.
- Student presses **Check answer** after selection.
- Keyboard navigation must be supported.
- Touch targets must be suitable for iPad/tablet use.
- No browser dropdowns for Stage 2 pathway matching.
- No horizontal scrolling.
- Long option text wraps inside its card.
- The stable quiz canvas should not jump dramatically between questions.
- Mobile collapses naturally to fewer columns / one column as required.

### Retry behavior

- Existing support/retry architecture remains authoritative.
- Where support produces narrowed options, render two Match Cards rather than a dropdown.
- No new progression side effects are introduced by presentation changes.

### Session variation

A 10-question Stage 2 session must avoid needless consecutive repetition of the same presentation direction when another valid form exists for the pathway.

This does not mean mixing in Apply/Recall activities. Variation must remain within the cognitive meaning of Match.

## Pathway-specific Stage 2 design

### 1. Meaning

Goal: connect words and definitions accurately.

Supported presentations:

- **Word → Definition**: show one target word; answer cards are four plausible definitions.
- **Definition → Word**: show one definition; answer cards are four plausible same-part-of-speech words.

Rules:

- Alternate presentation direction across the session where both are buildable.
- Distractors should remain plausible and unit-grounded.
- Do not show the same word/definition pair twice in the same question.
- No dropdown.

### 2. Context

Goal: identify the word that correctly completes a contextual sentence.

Presentation:

- Show the gapped sentence once in the context panel.
- Answer cards contain four plausible words.

Rules:

- Remove the duplicated gapped sentence from the match target area.
- The cue is the visible sentence; there should not be a second generic “Make the match” duplicate.
- Distractors should be same-part-of-speech and plausible in the sentence where possible.
- No dropdown.

### 3. Word Families

Goal: select the correct morphological form for a grammatical context.

Presentation:

- Show a sentence or grammatical cue that clearly requires one form.
- Answer cards should use members/derived forms of the **same lexical family** whenever the curated family provides them, e.g. `prefer / preference / preferable / preferably`.

Rules:

- Do not build distractors from unrelated words elsewhere in the unit merely because they occur in other families.
- If a target family does not contain enough valid competing forms for a meaningful Stage 2 question, fail closed for that target rather than serve a fake match.
- The question should test morphology/word class, not category spotting.
- No dropdown.

### 4. Paraphrasing

Goal: identify an equivalent phrase or idea without changing meaning.

Presentation:

- Show one source phrase/idea.
- Answer cards contain candidate paraphrases.

Rules:

- Reuse existing curated paraphrase material rather than inventing a second content source.
- Distractors should preserve topic vocabulary while changing meaning in believable ways where curated data allows.
- No dropdown.

### 5. Precision & Use

Goal: match weak/general wording to the most precise vocabulary choice.

Presentation:

- Show the weak wording or sentence once.
- Answer cards contain plausible replacements.

Rules:

- Preserve existing curated `improve_vocabulary` material as the source of truth.
- Distractors must be plausible alternatives, not obviously unrelated unit words.
- No duplicate cue.
- No dropdown.

### 6. Spelling & Recall

Goal: visually discriminate the correct spelling from plausible misspellings.

Presentation:

- Show the meaning cue once.
- Show four spelling variants as directly comparable answer cards.

Rules:

- Correct spelling and misspellings should be visible simultaneously.
- No dropdown.
- Variants should remain plausible rather than nonsense strings.
- Card layout should make character-level comparison easy.

## Architecture

### Pathway contract

The Stage 2 pathway mapping may need to expose more than one valid internal activity/presentation variant for pathways such as Meaning. This must remain a pathway contract decision, not ad-hoc renderer behavior.

The contract continues to define which cognitive activities are allowed for each pathway/rung. Stage 2 must not borrow Apply activities merely to manufacture variety.

### Activity builders

Each pathway builder is responsible for producing a semantically valid cue and answer set for its Stage 2 task.

Builders must fail closed when the content cannot support a meaningful question. They should never fill missing distractors with unrelated material just to reach four options.

### Renderer

Introduce a shared Match Card rendering path. The renderer should receive a normalized cue/options shape from the question object and should not need pathway-specific pedagogical logic.

The old generic Stage 2 `<select>` path should no longer be used for fixed pathway Match activities.

Accessibility fallback must not reintroduce a visible browser dropdown as the default student UI. Keyboard-operable cards are the primary accessible interaction.

### Interaction handler

Add/select a card interaction that:

- updates the underlying answer value;
- supports click, keyboard and touch;
- preserves the existing form submission / answer checking flow;
- does not change persistence, attempt IDs, idempotency or server-authoritative progression.

### Planner/session variety

The planner should track recent Stage 2 presentation variants and avoid immediate repetition where another valid variant exists.

Variation is presentation/content-direction level only. The learner remains on the Match rung until the authoritative evidence model advances the word.

## Evidence and progression

No change.

Existing pathway evidence, mastery thresholds and per-word progression remain authoritative. Stage 2 redesign changes only how valid Match evidence is elicited from the student.

Answer submission must continue through the existing attempt pipeline. No client-only progression shortcuts are permitted.

## Testing strategy

Implementation must use TDD.

Required coverage includes:

1. Stage 2 fixed pathway questions never render a visible `<select>` matching control.
2. Meaning Match can render both Word → Definition and Definition → Word forms and does not repeat the same presentation back-to-back when both are valid.
3. Context Match renders the gapped sentence once only.
4. Word Family Match distractors come from the same lexical family / curated valid forms and fail closed when insufficient.
5. Spelling Match renders all spelling variants simultaneously as answer cards.
6. Precision Match renders the weak wording/cue once and plausible replacement cards.
7. Paraphrasing Match uses curated paraphrase content and card selection.
8. Retry/narrowed support renders cards, not dropdowns.
9. Keyboard selection and submission work.
10. Mobile/tablet/desktop layouts avoid horizontal overflow.
11. Existing evidence thresholds, attempt persistence, attempt IDs and pathway progression remain unchanged.
12. Regression coverage confirms other response modes (choice, text, drag, tiles, spelling input) are not unintentionally altered.

## Success criteria

The redesign is successful when a student can complete a Stage 2 session in any pathway without encountering the generic dropdown experience, duplicate cues, unrelated distractors, or pointless repeated presentation.

The visual interaction should feel coherent across the hub while the underlying pedagogical task remains specific to each pathway.

Most importantly, Stage 2 should finally feel like a purposeful **Match** rung rather than ten variations of the same form field.

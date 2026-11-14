# Phase 1 — Diagnostic Item Bank Authoring & Review

**Status:** design/authoring infrastructure and *candidate briefs*, not a calibrated CEFR bank. Companion to [the assessment blueprint](./vocabulary-diagnostic-blueprint.md).

## Security boundary

This GitHub Pages repository is not an appropriate location for real scored diagnostic answer keys. **Never commit production item JSON, answer keys, live test forms, or real students' diagnostic responses here**, including in `docs/`, `tests/`, `src/`, GitHub issues, PR descriptions, or published assets. The validator and test fixtures are intentionally safe to disclose. The real keyed item bank needs protected backend storage with key/answer access restricted from student roles. Production import is a later, separately authorised stage after permissions and RLS are designed and tested.

## Authoring contract

- Schema: `tools/diagnostic/item-authoring.schema.json`
- Quality evaluator: `tools/diagnostic/item-quality.js`
- Local-only JSON bank audit: `node tools/diagnostic/audit-bank.mjs /path/to/your/private-bank.json --pilot`
- Automated tests: `node --test tests/vocabulary-diagnostic-item-quality.test.js`

The JSON items use a stable `itemId` and integer `version`, `formFamily` to prevent reused variant stems, `levelHypothesis` (A1–C1, **not** calibrated) with a mandatory **`levelReference`** record (CEFR framework, evidence basis, sense-specific justification, verification state, independent checker and timestamp), `construct`, domain, lemma, part of speech and *specific sense*, an original contextual `stem`, A–D options, one correct option ID, a written rationale for *every* option, source/rights records, review status and distinct reviewer identities. The **correct key is private** and must never be shipped to clients. Options are ordered A–D in the authoring record; server delivery may randomise presentation, but must preserve the server-side answer mapping.

### Who signs off?

1. **Author:** independently drafts the sense-specific context and four reasonable options, documents the source of the level hypothesis, rights, intended distinction and semantic confusions.
2. **Language reviewer:** verifies one unambiguously correct response in context, fluency, part-of-speech and grammatical parallelism. Tests each distractor as if *trying to make it correct*.
3. **Assessment reviewer:** checks reading burden, bias, distractor plausibility, construct purity, cueing, CEFR hypothesis and suitability for the intended age group. Must be a separate person from author and language reviewer for pilot approval.
4. **Pilot analyst:** only after secured deployment, checks response data and item psychometrics, retires weak items and keeps original versions immutable.

There is no auto-approval by the validator. A passing structural audit does **not** establish semantic validity or an externally justified CEFR level.

### Mandatory human check for each item

- Does the item test the intended *vocabulary sense* rather than inferential reading ability, common-sense facts or grammar?
- Could any distractor also fit, given the exact wording, register or common metaphorical senses?
- Can the learner identify the correct choice because it is the only grammatical, longer, shorter, technical or copied-from-stem option?
- Are wrong options authentic near-misses and equally natural in the sentence? No unrelated nonsense answers.
- Is the context short enough that less fluent readers are not punished for reading complexity unrelated to the target vocabulary?
- Does this word/sense have a verifiable level association from a permitted reference, and is its published usage/permission documented?
- Does the item unfairly reward previous exposure to a Vocabulary Hub unit? If yes, replace it.
- Does it reveal answers to another diagnostic item or repeated `formFamily` variant?
- Can the item be used without publishing copyrighted wording or answer keys?

**Four options is a design choice**, not an automatic validity guarantee. “I don't know” should be an additional opt-out response mechanism, *not* one of the keyed A–D distractors.

## Starter sampling briefs — 25 candidate targets, NOT approved assessment items

These are **original editorial proposals** to build the *first* 25 independently reviewed records, spread across vocabulary levels and life domains. The A1–C1 labels below are **sampling hypotheses**, *not externally confirmed level assignments*. Their precise **senses**, CEFR associations, and words in the deployed diagnostic must be checked against a permitted source before pilot approval. Do not publish a scored test using this list.

| Hypothesised level | Target and intended sense | Domain | Construct to explore | Distractor design challenge |
|---|---|---|---|---|
| A1 | arrive — reach a destination | travel | meaning in context | distinguish leaving / returning / reaching |
| A1 | quiet — making little noise | school | precise meaning | don't cue by adjective inflection |
| A1 | hungry — needing food | daily life | meaning in context | avoid emotion words that are obviously unrelated |
| A1 | choose — decide between options | daily life | meaning in context | distinguish selecting / comparing / refusing |
| A1 | price — amount paid for an item | daily life | precise meaning | distinguish cost / weight / discount without synonyms |
| A2 | borrow — take temporarily with permission | school | meaning in context | distinguish borrow / lend / keep |
| A2 | repair — restore something damaged | daily life | precise meaning | distinguish repair / replace / maintain |
| A2 | delay — make something happen later | travel | meaning in context | distinguish postponement / cancellation / acceleration |
| A2 | crowded — containing many people | society | meaning in context | keep answer phrasing parallel |
| A2 | improve — make better | school | collocation sense | avoid universally plausible verb-object combinations |
| B1 | reliable — consistently dependable | work | meaning in context | distinguish reliable / available / popular |
| B1 | consequence — result of an action | society | precise meaning | avoid *effect*, a potentially correct synonym |
| B1 | maintain — keep in a good state | daily life | meaning in context | distinguish maintaining / installing / replacing |
| B1 | approach — method for handling a problem | school | meaning in context | separate sense from physical movement |
| B1 | underestimate — judge as less than actual | academic | precise meaning | distinguish overestimate / underestimate / estimate |
| B2 | substantial — large in amount or importance | academic | meaning in context | avoid just “big” vs obviously irrelevant words |
| B2 | sustainable — able to continue without excessive harm | society | meaning in context | don't confuse sustainability with “natural” as a blanket synonym |
| B2 | deteriorate — become worse | daily life | precise meaning | distinguish deterioration / fluctuation / stagnation |
| B2 | feasible — realistically possible | work | meaning in context | distinguish feasible / desirable / necessary |
| B2 | ambiguous — open to more than one interpretation | academic | precise meaning | distinguish vague / ambiguous / incorrect, with context |
| C1 | mitigate — reduce severity or negative effect | society | meaning in context | distinguish prevent / mitigate / conceal |
| C1 | scrutinise — examine very carefully | work | meaning in context | distinguish review superficially / investigate / reject |
| C1 | undermine — gradually weaken support or credibility | society | meaning in context | distinguish challenge / undermine / contradict |
| C1 | nuanced — containing fine distinctions | academic | precise meaning | don't make correct option uniquely detailed |
| C1 | prevalent — widespread in a particular group | society | meaning in context | distinguish prevalent / prominent / inevitable |

**Sampling caveat:** this list intentionally includes different grammatical classes and topics, but five candidate briefs per level are insufficient for even one meaningful assessment form. It is a controlled *first batch* for teacher review, not a promised 25-item approved question bank. Real test items must introduce distinct original contexts and counterbalanced option positions. The target terms here must not be automatically scored or disclosed to students before pilot.

## Bank-level acceptance gates

| Stage | Minimum evidence |
|---|---|
| Draft creation | Schema + required fields + individual structural audit pass |
| Language reviewed | Independent reviewer checks each option and precise sense, resolves wording/ambiguity |
| Assessment reviewed | Independent assessor reviews level-reference notes, construct/age fit, exposure and cueing |
| Pilot eligible | Verified reuse rights, documented and checked CEFR-reference hypothesis, two distinct reviewers/timestamps, no unresolved warnings, protected server storage |
| Calibrated / approved | Item performance analysis with appropriate sample, stable scoring model and approved level reporting |

### Review and administration rules

- Preserve the original authored record and every previous version. A wording or key change creates a new version and invalidates prior pilot calibration for that version.
- Never export answer-bearing bank records to the public website or test bundles used by students.
- Record the tested *sense* separately from the lemma; a word may have several sense levels.
- `formFamily` spans variants that convey the same clue or context. Baseline/follow-up forms should avoid repeating an item or obvious variant; a small, explicitly governed anchor group may be needed for test equating.
- Mix keyed option positions across a whole test form. Item-level authored A–D order alone is not a reliable form-level randomisation.
- Record empirical choice distributions after the pilot, especially distractors almost nobody selects or options that are also defensible.
- Review any diagnostic-specific evidence of differential performance across groups with sufficient privacy protections before drawing conclusions.
- An item that is difficult for students is not necessarily high-level vocabulary. Reading complexity and weak distractors can generate artificial difficulty.
- In the pilot, report **performance and coverage**; do not assign A1–C1 outcomes from arbitrary percentage thresholds.

## Immediate next development deliverables

1. Independently verify the first target-word/sense level hypotheses and licensing.
2. Author the first **private**, keyed and reviewed A1–C1 item batch; no copying from the existing 350-word practice bank.
3. Run the new offline auditor and have a second reviewer check every stem and answer; record unresolved flags.
4. Plan secure Supabase `private` item storage and server-authorised delivery/scoring, with tests proving student roles cannot read answer keys.
5. Only then build a small teacher-only diagnostic preview and conduct a limited, voluntary trial.

**This PR provides authoring infrastructure, tests and candidate briefs only. It contains no real scored diagnostic item records or keys and makes no changes to student-facing application code or the production database.**

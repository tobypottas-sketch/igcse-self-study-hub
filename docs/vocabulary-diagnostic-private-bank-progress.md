# Vocabulary Diagnostic — First Private Item-Bank Batch

**Date:** 14 November 2026  
**Status:** 80 original **draft** diagnostic items stored in the existing Supabase project under `private.vocabulary_diagnostic_items`. **Not approved for pilot or student delivery.**

## Delivered

The first 80 independently worded *candidate* items have been inserted directly into the existing protected diagnostic item table. **The repository deliberately contains no question texts, option sets or answer keys.** All items have stable `diag-candidate-001` through `diag-candidate-080` identifiers, version 1, original contextual prompts, a specific tested lexical sense, four alternatives with one keyed answer, authoring metadata and a preliminary CEFR-level hypothesis.

The content was authored from scratch; it was **not copied from Oxford or Cambridge definitions or example sentences**. Oxford's CEFR-aligned vocabulary resources serve only as a broad editorial reference at this stage. Every lexical level hypothesis remains explicitly `unverified` and must be checked for the particular sense/phrase before any pilot.

| Hypothesised CEFR band | Draft items |
|---|---:|
| A1 | 16 |
| A2 | 16 |
| B1 | 16 |
| B2 | 16 |
| C1 | 16 |
| **Total** | **80** |

| Construct | Draft items |
|---|---:|
| Meaning in context | 50 |
| Precise meaning | 20 |
| Common phrase / collocation meaning | 10 |
| **Total** | **80** |

| Domain | Draft items |
|---|---:|
| Daily life | 13 |
| School | 19 |
| Work | 10 |
| Travel | 12 |
| Society | 19 |
| Academic | 7 |

## Tests and checks performed

- **80/80 passed** the existing `tools/diagnostic/item-quality.js` structural audit with **zero errors and zero remaining automated warnings** after revising four flagged options/stems.
- Every item has four structurally distinct options, a keyed response and no detected high-risk length or stem-key cue.
- Correct-answer positions are counterbalanced: **20 A, 20 B, 20 C, 20 D**.
- 80 unique lemmas/phrases, 80 unique stems, 80 distinct content families.
- **Zero headword overlaps** with the existing 350 live Vocabulary practice items, checked directly in Supabase. This reduces—but does not eliminate—prior-exposure and curriculum-familiarity effects.
- All 80 are `review_status='draft'` with `levelReference.status='unverified'`. **80/80 are blocked by the pilot approval gate**, which requires verified level provenance and two real independent reviews.
- No diagnostic forms, invitations, student sessions, responses or results have been created. Existing student progress, mastery, merits and logins are untouched.
- All answer-bearing content remains in **private Supabase storage**, not in GitHub Pages, the repository, a public JSON file or the student browser.

## Assessment quality limits — no unsupported claims

A clean automated structural audit does **not** show that distractors are sufficiently challenging, that the lexical CEFR labels are correct, that vocabulary skill levels are reliably distinguishable, or that item difficulty has been calibrated. Several context sentences may still provide semantic cues. The first batch must undergo genuine **human item-by-item review**, including attempting to defend every wrong option as a possible answer, checking lexical level hypotheses against permitted sources at sense level, and revising weak options.

No items are currently eligible for pilot. The item bank contains **80 drafts, not 80 validated questions**. The Phase 0 blueprint suggests approximately **200–300 independently reviewed original items** as an eventual planning target to support forms, replacements, anchor selection, future reassessments and exposure management. Eighty is an initial tranche, not the complete planned bank.

**This tranche also currently favours contextual meaning tasks (62.5%), followed by precise meaning (25%) and phrase/collocation (12.5%).** The precise balance should be reviewed during test design and calibration, not treated as a fixed validated optimum.

## Human review workflow — next operational step

1. Build a **staff-only review queue** backed by the protected diagnostic API. Never export keys to a public Pages bundle or an unprotected teacher analytics endpoint.
2. Present small batches (10–20 at a time) to authorised educators with the context, option wording and provisional meaning/CEFR references. Only authorised reviewers may receive keyed review details, from a new narrowly scoped and audited server endpoint.
3. Record real language reviewer and assessment reviewer identities and decisions. Do **not** substitute automated validation for independent human decisions.
4. Resolve exact word/sense level mapping against permitted references and document source/version and licensing basis. Oxford/EVP alignment is not automatically conclusive for every sense.
5. Revise problematic drafts with tracked version changes before promotion to `pilot`. Re-audit after every content change.
6. Expand the bank beyond 80, including alternate-form and equating considerations, then complete live authenticated teacher/student tests, concurrent-submission tests and a small supervised pilot.
7. Do not report official CEFR proficiency or calculate a level from raw percentage. Pilot results remain `uncalibrated` and `levelEstimate=null`.

## Links and implementation references

- Diagnostic specification: `docs/vocabulary-diagnostic-blueprint.md`.
- Authoring rules and rights: `docs/vocabulary-diagnostic-item-authoring.md`.
- Protected backend: `supabase/diagnostic/README.md` (source tracked in PR #447, not necessarily merged yet).
- Authoring structural gate: `tools/diagnostic/item-quality.js`.
- Level reference (editorial, subject to verification): https://www.oxfordlearnersdictionaries.com/about/wordlists/oxford3000-5000

**No keyed item content was committed as part of this report. The actual question bank exists only in the private database.**

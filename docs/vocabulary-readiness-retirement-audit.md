# Vocabulary pathway gating — teacher-readiness retirement audit (13 November 2026)

## Scope of this change
The *Unit Readiness* authoring view is removed from Vocabulary teacher class selection and overview actions. The evaluator, class analytics coverage registration, student eligibility and database Set membership are deliberately unchanged. This is a navigation/UI retirement, **not** an unlock of any previously unavailable pathway.

## Verified dependencies in repository
1. **Eligibility:** `src/vocabulary/pathway-readiness.js` invokes the actual question builder for every word × stage; an eligible word must produce a valid question. `content/vocabulary/pathway-readiness-rules.js` adds per-stage minimums (including the 10-question mission floor), full-path word counts and Paraphrasing's phrase/idea diversity requirements. The unit registry may additionally impose an editorial hold.
2. **Full progression:** A candidate word is serviceable for a pathway only if it can run all five stages. `src/vocabulary/pathway-coverage.js` converts the evaluator result into the live word set used by student planning and teacher pathway status.
3. **Sets of 10:** `src/vocabulary/pathway-sets.js` and shared server logic partition eligible words in authored order into complete groups of exactly 10, never padding or repeating words. Leftovers are withheld.
4. **Database authority:** `public.vocabulary_set_members` controls which ten words may count toward Set advancement. `src/vocabulary/pathway-sets.js` explicitly checks for client/server membership mismatch; the database settlement trigger checks actual attempted and finished membership. Altering thresholds or eligibility changes the set composition and may strand progress without a corresponding guarded migration.
5. **Display and reporting:** Teacher analytics calls `ensureReadiness()` when opening a class to register coverage so locked pathways are represented accurately; the student app also uses the evaluator. `tests/vocabulary-readiness-gating.test.js` covers exclusion from Mixed Practice, unavailable tiles and achievement rules.

## Findings and recommendation
- The minimums are **publishing policy**, not a measure of teaching quality or a requirement that the teacher should add arbitrary vocabulary.
- Changing or removing these thresholds by itself is **unsafe**: it can expose incomplete pathways, change Sets, or break recorded progression. In particular, a set of fewer than 10 eligible words is not a playable Set under the current contract.
- Retain the internal readiness evaluator for eligibility and protect existing Set membership. Revisit the gating policy as a **separate, migration-aware engineering task**, with release tests for every unit, student continuation, no duplicate questions, Set counts/membership and settled progress. Do not auto-unlock on this UI change.
- Surface only meaningful student-learning information in the teacher interface. Internal content diagnostics can remain accessible through test and developer workflows rather than teacher navigation.

No Supabase schema, content records, Set rows or student progress were modified by this change.

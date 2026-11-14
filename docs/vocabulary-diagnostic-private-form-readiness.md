# Vocabulary diagnostic: private draft forms A and B

**Status (14 November 2026):** Two complete **draft** 40-question forms stored in existing protected Supabase tables. **Both forms are blocked from student assignment.** They are templates for professional review and supervised future calibration, not approved or equivalent CEFR tests.

## Actual database results

| Metric | Draft A | Draft B |
|---|---:|---:|
| Questions | 40 | 40 |
| A1 hypotheses | 8 | 8 |
| A2 hypotheses | 8 | 8 |
| B1 hypotheses | 8 | 8 |
| B2 hypotheses | 8 | 8 |
| C1 hypotheses | 8 | 8 |
| Meaning in context | 25 | 25 |
| Precise meaning | 10 | 10 |
| Phrase / collocation | 5 | 5 |
| Correct answer positions 1/2/3/4 | 10/10/10/10 | 10/10/10/10 |
| Language-approved items | 0 | 0 |
| Assessment-approved items | 0 | 0 |
| CEFR-sense verified items | 0 | 0 |

**Forms A and B share zero items.** All 80 existing candidates are used once across the two forms; no reserve questions or linking/anchor items remain. We must build a larger private bank with reviewed anchors before using A/B results in longitudinal comparisons or claiming equivalent test scores.

## Changes implemented

- `supabase/diagnostic/assemble_draft_forms.sql` was applied using a managed Supabase migration. It selects private item IDs without reading or exporting keyed content into the public repository, verifies exact bank coverage and creates only `draft` forms.
- `supabase/diagnostic/randomise_draft_form_options.sql` was applied separately after an audit found unequal correct-slot counts. It reshuffles answer positions using private random draws and enforces exactly 10 correct answers per displayed slot per form; the actual mappings exist **only in private tables**.
- `supabase/diagnostic/form_readiness_api.sql` was applied using a managed migration. New `public.vocabulary_diagnostic_form_readiness(p_actor uuid)` checks the server-authenticated actor is an active teacher/admin, returns **aggregate review progress only**, and is callable **only by `service_role`**. Neither anonymous nor authenticated client roles have EXECUTE access. No questions, options, answer keys or student details are returned.
- `supabase/functions/vocabulary-diagnostic/index.ts`: new authenticated `review-forms` action routed to the protected function; supports current Supabase publishable/secret key environment fallback. **Edge Function version 4 is deployed** with JWT verification.
- `src/vocabulary/diagnostic-review.js`, `vocabulary-diagnostic-review.css`, `vocabulary-diagnostic-review.html`: teacher review queue will include restrained summary cards showing form sizes, band counts and actual review completion. GitHub Pages UI **not deployed until this PR is merged**.
- `tests/vocabulary-diagnostic-draft-forms.test.js`: 6 new focused static regression checks.

## Verification

- Rolled-back dry-run of form assembly gave 40 items per form, each with A1–C1 coverage 8 per band and construct mix 25/10/5.
- Post-migration DB audit: two **draft** 40-item forms, 40 distinct positions and items each, 0 invalid option orders, 0 overlap.
- Rolled-back shuffle trial and persistent post-migration audit: **10 correct answers in each of the four visible option positions per form**.
- Privilege check: `anon_exec=false`, `authenticated_exec=false`, `service_role_exec=true` for form readiness.
- Student role rejected by protected form-readiness RPC.
- Staff-readiness RPC returned only metadata: two draft forms, **0/40 approvals in every stage**, 0 flags.
- **6/6 focused static checks passed**; teacher UI JavaScript parsed.
- Crucial release-safety integration test: even an admin attempting to assign draft A gets `FORM_UNAVAILABLE`; test rolled back.
- Global diagnostic assignments, student sessions, results and promoted items remained at **zero**.

## Educational validity and remaining work

These are **not adaptive forms**; each has a fixed 40-question order. The proposed A1–C1 tags are unverified item-authoring hypotheses, not validated CEFR difficulty. We have not measured item facility, discrimination, reliability, or comparability. Balanced structure and correct-answer positions are not substitutes for psychometric validation.

For a meaningful first diagnostic and later 8-week reassessment, we still need:
1. A real independent language reviewer and second independent assessment reviewer, with source-specific, permitted CEFR-reference verification for every tested *sense* and phrase.
2. Additional reviewed original items, private linking/anchor material, replacements for rejected candidates, and deliberate form-equating design. Current two disjoint forms cannot be equated by assumption.
3. Supervised pilot with appropriate student privacy, browser testing, item-quality analysis, estimate uncertainty, and a defensible decision on report interpretation.
4. Complete student UI integration (PR #451 is a separate draft), end-to-end access tests and mandatory backend enforcement before switching on the baseline gate.
5. Explicit user approval before merging the static UI or releasing any student form.

**Nothing here activates a schoolwide diagnostic lock or changes existing Vocabulary practice.** The current 80 candidate questions remain draft.

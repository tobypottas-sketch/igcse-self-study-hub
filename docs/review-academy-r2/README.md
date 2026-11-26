# Review Writing Academy R2 tracker

Baseline main: `b61eea18189587cd899711405ce5463ee1ee1642` (PR #711). PR #710 split source text from question stems in preview. PR #708 replaced the Structure Discover and Explore length gates with answer checks. Microsoft SSO PR #709 was open on its own branch when inspected.

## R2.0 status

The staff-preview activity inventory is reproducible from this branch. Run `node docs/review-academy-r2/build-baseline.mjs` at the baseline curriculum revision to produce `docs/review-academy-r2/baseline.json`. The version-controlled generator and findings define the register. A null review field means the decision is pending or there is no explicit source value. A generated row records a runtime input and never counts as a completed teacher review.

| Pathway | Discover | Explore | Bronze | Silver | Gold | Apply / exam practice | Master checkpoint | Master writing / mock | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Structure & Organisation | 3 | 30 | 8 | 8 | 2 | 3 | 1 | 1 | 56 |
| Vocabulary & Expression | 3 | 30 | 8 | 8 | 2 | 3 | 1 | 1 | 56 |
| Idea Development | 3 | 30 | 8 | 8 | 2 | 3 | 1 | 1 | 56 |
| Grammar & Cohesion | 5 | 30 | 8 | 8 | 2 | 3 | 1 | 1 | 58 |
| Editing & Improvement | 5 | 30 | 8 | 8 | 2 | 3 | 1 | 1 | 58 |
| Exam Mastery | 5 | 30 | 8 | 8 | 2 | 3 | 3 | 4 | 63 |
| **Total** | **24** | **180** | **48** | **48** | **12** | **18** | **8** | **9** | **347** |

Explore counts one decision or response per paragraph lens. There are eight shared source reviews with 30 paragraphs, each viewed through six pathway lenses. Models, answer alternatives and checklist items are nested evidence rather than separate activity totals. Gold exam plans are counted under Gold. The Writing Studio launcher and stage controls are navigation.

### Runtime and progress

Both deployed preview entry pages referenced `review-preview-20261125.js?v=10` when fetched. Its account gate requires an active teacher or administrator with no pending password change. Both routes reach the same pathway renderer. Structure preview uses `structureR1`, `structureDiscover` and `structureExplore`. Vocabulary and Idea Development take Discover, Practise, Gold, Apply and Master from `review-pedagogy.js`, and model lenses from the Expression and Development v1 modules. Grammar, Editing and Exam use their respective dedicated modules. Exam uses `examMocks` after the checkpoint. Historical course arrays and legacy model-question option sets that never reach the active renderer are excluded.

Staff preview uses account-specific browser progress via `preview-progress.js`. Structure's checked recognition restores by item version. Practise and checkpoint use deterministic index scoring. Preserve option semantics as well as IDs when reconciling old attempts. Exam Apply and Master are currently excluded from saved preview completion. The enrolled Structure pilot uses a separate entry page and omits the preview progress object, selecting the previous Structure contract. Live account, Supabase and browser workflows still need verification.

### Findings and next review

The register has thirteen individually documented findings plus two recurring assessment-contract findings. See the [individual review checkpoint](reviews/README.md) and generated disposition counts for reviewed activities. The critical robotics checkpoint requires an end time for each activity and a walking time to the bus stop before its expected advice can be justified. The Structure Master theatre question signals the groups in its own wording and needs a more demanding decision. Item-specific findings and candidate corrections are in `findings.json`.

Complete the separate clarity and answer-validity passes. Work through each choice without reading its key, then compare every distractor and explanation against the facts. Check model responses, word guidance and checklist criteria against every writing brief. Record a decision for retained items too. Finish capturing rendered prompt splits, live sentence annotations, stage rules, and shared exam review instructions in the register. Then complete browser verification of the baseline and finish R2.0 before changing curriculum.

Cambridge 0511 Exercise 6 includes a formal or semi-formal review as a possible response and specifies 120–160 words, with up to six marks for content and nine for language. The Academy’s timer and submission confirmation are practice controls. [2024–2026 syllabus](https://www.cambridgeinternational.org/Images/637163-2024-2026-syllabus.pdf) · [2027–2029 syllabus](https://www.cambridgeinternational.org/Images/721343-2027-2029-syllabus.pdf)

## Phase status

| Phase | Status | Evidence |
| --- | --- | --- |
| R2.0 Baseline audit | In progress | `docs/review-academy-r2-baseline`. 347 inventoried. 73 individually reviewed, 274 awaiting individual review. Of the 73, 26 approved without changes, 46 need revision and one needs replacement. Zero curriculum activities modified, retained by final decision, or replaced. 61 Academy tests passed on baseline. HTTP entry-page check completed. Browser, deployment equivalence and complete pedagogical verification pending. |
| R2.1 Standards | Pending | Complete R2.0 first. |
| R2.2 Shared interactions | Pending | Review scoring and progress compatibility before implementation. |
| R2.3 Structure & Organisation | Pending | Prioritise Master grouping and missing destinations. |
| R2.4 Vocabulary & Expression | Pending | Review precision, natural word combinations, tone and meaning. |
| R2.5 Idea Development | Pending | Prioritise the robotics checkpoint. |
| R2.6 Grammar & Cohesion | Pending | Check meaning, grammar alternatives and model lengths. |
| R2.7 Editing & Improvement | Pending | Check revision priorities, factual fidelity and the full Master brief. |
| R2.8 Exam Mastery | Pending | Check independent planning, timed practice and self-review. |
| R2.9 Integration and readiness | Pending | Browser evidence, pilot isolation, supervised learner-trial plan, readiness recommendation. |

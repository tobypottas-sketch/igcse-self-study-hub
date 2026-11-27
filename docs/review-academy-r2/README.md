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

Staff preview uses account-specific browser progress via `preview-progress.js`. Structure's checked recognition restores by item version. Practise and checkpoint use deterministic index scoring. Preserve option semantics as well as IDs when reconciling old attempts. Exam Apply and Master are currently excluded from saved preview completion. The enrolled Structure pilot uses a separate entry page and omits the preview progress object, selecting the previous Structure contract. Live account and Supabase workflows remain outside the simulated browser verification.

### Findings and implementation backlog

All 347 activities have an individual disposition. The [final audit report](reviews/final-report.md) consolidates findings, progression, interaction priorities and teacher decisions. The review files retain the exact IDs and recorded answer challenges. The browser evidence uses a simulated account. Live school-account and learner testing remain later release checks.

Cambridge 0511 Exercise 6 includes a formal or semi-formal review as a possible response and specifies 120–160 words, with up to six marks for content and nine for language. The Academy’s timer and submission confirmation are practice controls. [2024–2026 syllabus](https://www.cambridgeinternational.org/Images/637163-2024-2026-syllabus.pdf) · [2027–2029 syllabus](https://www.cambridgeinternational.org/Images/721343-2027-2029-syllabus.pdf)

## Phase status

| Phase | Status | Evidence |
| --- | --- | --- |
| R2.0 Baseline audit | Complete | 347 individually reviewed. 73 approved, 271 need revision, three need replacement. 74 relevant automated checks passed, including private diagnostic exposure checks. Simulated staff browser suite passed at four widths. |
| R2.1 Standards and critical fixes | Implemented for staff preview | [Question standards](question-standards.md) and [five resolution records](reviews/r2-1-resolutions.md). Verify on the R2.1 PR and keep learner trials pending. |
| R2.2 Shared assessment and interactions | Implemented for staff preview | [Component contracts, examples and R2.3–R2.8 mapping](shared-assessment.md). See the R2.2 PR for verification. |
| R2.3 Structure & Organisation | Pending | Prioritise Master grouping and missing destinations. |
| R2.4 Vocabulary & Expression | Pending | Review precision, natural word combinations, tone and meaning. |
| R2.5 Idea Development | Pending | Prioritise the robotics checkpoint. |
| R2.6 Grammar & Cohesion | Pending | Check meaning, grammar alternatives and model lengths. |
| R2.7 Editing & Improvement | Pending | Check revision priorities, factual fidelity and the full Master brief. |
| R2.8 Exam Mastery | Pending | Check independent planning, timed practice and self-review. |
| R2.9 Integration and readiness | Pending | Browser evidence, pilot isolation, supervised learner-trial plan, readiness recommendation. |

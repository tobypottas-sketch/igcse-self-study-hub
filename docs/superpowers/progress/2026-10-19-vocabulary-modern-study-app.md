# SDD ledger — plan: docs/superpowers/plans/2026-10-19-vocabulary-modern-study-app.md

Execution method: Native inline execution.
Branch: design/vocabulary-modern-study-app

Pre-flight interfaces:
- Task 1 → Tasks 3/4/7/8: pathwayIdentity/renderStudyIcon provide presentation-only identity/icon helpers; consumers must not import or mutate progression state.
- Task 2 → Tasks 3–8: shared CSS tokens/motion classes are presentation-only and must preserve reduced-motion/mobile/no-overflow requirements.
- Task 4 → Task 5: question/answer hooks must preserve existing data-match-card and hidden answer wiring before retry presentation builds on them.
- Task 6 → Task 7: completion summary consumes evidence-backed counts only; milestone derivation remains separate and compares authoritative before/after state.
- Task 7 → Task 8: milestone/icon hooks may be reused for dictionary mastery presentation but must not create progression logic in views.

Ruling: Repository execution is through GitHub connector rather than a local worktree because this environment cannot resolve github.com from the container. RED/GREEN evidence will therefore be taken from branch CI runs triggered by the draft PR; implementation remains isolated on the feature branch.

Task 1: in progress

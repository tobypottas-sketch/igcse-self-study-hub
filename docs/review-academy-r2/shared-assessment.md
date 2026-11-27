# R2.2 shared assessment and interactions

**Easy to understand. Challenging to complete.** Use the [question standards](question-standards.md) for each new activity and keep its status in the [programme tracker](README.md).

## Assessment and persistence contract

- `activities.js` owns scoring and writing completion. `recognition.js` owns objective evidence and checking. `recognition-question.js` presents all checked approaches: not attempted, incorrect first attempt, correct independently, correct after feedback, completed with support. The first miss gets option-specific feedback without the answer. A second miss reveals the answer and explanation.
- `structure-20261125.js` owns the practice session and stage completion. New checked examples use the same recognition renderer as Structure Discover and Explore. Existing one-check activities retain their contracts during the pathway rollout. Sequencing uses one explicit check and, on a miss, displays the example separately from the submitted order. This represents supported completion.
- `response-workshop.js` owns Write → Compare → Revise → Reflect. Staff display states distinguish no attempt, draft, comparison, revision or justified retention, and self-review. Open Discover and Explore reveal an example after an attempt. Their completion remains participation in self-review. The examination workshop also uses self-review. Teacher-assessed status requires the separate teacher workflow.
- `preview-progress.js` owns the staff checkpoint inside the existing version-1 workspace envelope. Checked options, pre-check selection, shuffled presentation and retry history are stored by ID. Sequences use the existing ordered array. Separate editor notes use a task-keyed reflection outside the review draft. Legacy combined drafts remain editable verbatim. The prior stored answer is invalidated only when a material change gives an affected question new option IDs. Changed items reopen without discarding completed neighbours or writing.
- The enrolled Structure pilot uses its existing renderer configuration and Supabase persistence adapter. The staff preview opts in to these components. This phase requires no database or authentication change.

## Curriculum contract and representative activities

| Interaction | Authoring pattern | Representative IDs |
| --- | --- | --- |
| Checked choice | `recognitionQuestion` with stable IDs, version, key and one explanation per option. Use `context` for the source. | `pedagogy-q-015` |
| Structured plans | `plans` aligned to option IDs. Each plan is an array of paragraphs, each an array of details. Plan letters show presentation order. | `pedagogy-q-005` |
| Sentence sequence | Existing `order` activity type, shuffled available bank and an ordered response array. Learners add, move, remove and undo before checking. | `pedagogy-q-003`, `pedagogy-q-004`, `pedagogy-extra-q-3`, `pedagogy-extra-q-4` |
| Source selection | `sentenceSelection` displays the authored options as the source in reading order. Use short, coherent extracts with every sentence available by keyboard. | `pedagogy-q-006` |
| Revision comparison | `original` plus separate revised alternatives. Keep meaning-related details in the original and avoid styling that hints at the key. | `pedagogy-extra-q-15`, `cohesion-q-004` |
| Vocabulary gap | `gap` contains the text before and after the blank. Use comparably plausible forms and feedback on the intended distinction. | `pedagogy-q-010` |
| Two-step edits | A diagnosis can include a second checked `correction` item with its own key, version and feedback. Advance after both steps reach a terminal outcome. Use an open workshop when multiple corrections are defensible and learners need to explain one. | `editing-q-003`, `editing-q-003-correction` |
| Writing self-review | Keep alternatives open. Use `modelNote` for any separate editorial note. Preserve a good draft with an explicit reason and use a checklist tied to the brief. | `cohesion-task-006`, `editing-task-002`, `editing-task-005`, `editing-task-006` |

The seven changed assessment items use version 2 and new option IDs. The ordering items keep the original order keys and scoring. Version and re-key a later change when it changes what a response means. Keep reading order for source selection and a stable shuffled order for independent alternatives. A two-step edit records each outcome separately. The existing session score counts the primary decision; the checked-step summary reports both outcomes.

Check selectors and focus with keyboard and touch, and make selection visible through both appearance and button state. Verify retry feedback, supported answers, sequence restoration, content-version invalidation, writing retention, pilot isolation and all four preview widths. Long options and source paragraphs need to wrap without horizontal scrolling.

## Candidate mapping for pathway refinement

These IDs are candidates from the audit. Recheck the actual task before selecting a component. Defects remain tracked in the historical individual review files.

| Phase | Candidate activities and interaction |
| --- | --- |
| R2.3 Structure | Plans `pedagogy-extra-q-5`, `pedagogy-q-007`. Source selection or a two-step move `pedagogy-extra-q-8`. Compare endings `pedagogy-extra-q-10`. |
| R2.4 Vocabulary | Gap `pedagogy-q-011`, `pedagogy-extra-q-13`, `pedagogy-extra-q-14`. Revision comparisons `pedagogy-q-012`, `pedagogy-extra-q-16`, `pedagogy-q-014`. |
| R2.5 Idea Development | Checked evidence `pedagogy-extra-q-22`, `pedagogy-extra-q-25`, `pedagogy-extra-q-26`. Checked comparison `pedagogy-q-018`, `pedagogy-extra-q-32`. Preserve genuine open recommendations in workshops. |
| R2.6 Grammar | Sentence and revision comparison `cohesion-q-006`, `cohesion-q-009`, `cohesion-q-015`. Cause-and-effect comparison `cohesion-q-011`, `cohesion-q-016`. |
| R2.7 Editing | Two-step diagnosis and edit `editing-q-002`, `editing-q-011`, `editing-q-015`. Revision comparison `editing-q-006`, `editing-q-014`. |
| R2.8 Exam | Plan comparison `exam-q-009`, `exam-q-010`, `exam-q-012`. Editing priorities `exam-q-014`, `exam-q-016`, `exam-q-019`. Keep full reviews as independently written work with self-review. |

# R2.0 pedagogical audit

All 347 active staff-preview activities have an individual disposition in the existing register. The generator joins the pathway TSV files with the active source, stable option IDs, official keys, feedback and existing shared findings. It emits pathway and stage disposition counts, unresolved IDs and the source/question separation applied in staff preview. These are editorial reviews of the current preview. Learner validation and live school-account checks are separate.

| Pathway | Total | Approved | Revise | Replace |
| --- | ---: | ---: | ---: | ---: |
| Structure & Organisation | 56 | 22 | 33 | 1 |
| Vocabulary & Expression | 56 | 8 | 46 | 2 |
| Idea Development | 56 | 6 | 50 | 0 |
| Grammar & Cohesion | 58 | 12 | 46 | 0 |
| Editing & Improvement | 58 | 14 | 44 | 0 |
| Exam Mastery | 63 | 11 | 52 | 0 |
| **Total** | **347** | **73** | **271** | **3** |

There are 274 affected rows with a primary severity: 5 critical, 64 high, 196 medium and 9 low. A note can name several defects, and the register retains two shared contract findings. These counts are per affected activity rather than a sum of every observation. No activity is pending individual review. References to an optional activity in the notes are workload recommendations for implementation.

## Defects that affect the evidence students can use

| ID | Defect | First correction |
| --- | --- | --- |
| `pedagogy-q-019` | Robotics timing cannot be established from start times. | Give end times and the walk to the bus stop. |
| `pedagogy-extra-q-31` | Both film recommendations are defensible for different readers. | Establish what this film club wants, then rebuild distractors around those priorities. |
| `pedagogy-extra-q-27` | Five-minute service does not establish a complete twenty-minute lunch trip. | Give round-trip travel time or limit the claim to time left for travelling and eating. |
| `pedagogy-extra-q-30` | The shared bench does not establish reduced practice time, and two options balance the supplied observations. | Specify the one-at-a-time constraint and name the beginner's priority. |
| `pedagogy-observation-006` | The vocabulary observation asks students to retrieve a location the examples never supply. | Check time and certainty separately, or supply a location if it is the intended focus. |

Use the TSV notes as the detailed defect register. The recorded blind answers distinguish a unique selection, a selection conditional on missing context, and an ambiguous answer. Other examples needing attention include the assumed destination paragraphs in `pedagogy-q-006` and `pedagogy-extra-q-8`, the competing seating answers in `pedagogy-extra-q-18`, and the changed meaning of “cannot use the discount” in `cohesion-q-009`. The last item has a best available choice that still falls short of preserving the source.

## Progression and curriculum efficiency

- **Structure.** The focused Discover examples introduce purpose, grouping and reader advice effectively. Keep the sound ordering items but display the developing sequence. Move straightforward detail matching earlier or make it optional. Replace the Master theatre checkpoint with an unfamiliar brief requiring a decision about competing evidence, followed by independent writing.
- **Vocabulary.** Precision and scope comparisons offer useful progression when competing phrases are normal English. Prefer a small number of different meaning and register decisions over a generic paraphrase on each paragraph. Replace the compulsory opening-scene and festival-performers rewrites with optional notes or more useful practice. Retain focused Gold revision and the independent Master extract.
- **Idea Development.** Go from linking a detail to an opinion to weighing different needs under real constraints. Repair all four critical objective items first. Use independent writing for genuinely open choices. Consolidate repeated model-reading checks about advice and explicitly display the earlier evidence on which advice depends.
- **Grammar.** Preserve accurate contrasts in tense, cause, concession and reference. Replace generic length gates with checked selections for identifiable answers and self-review for legitimate rewrites. Select a few optional transformations to avoid repeating the same “however” or “this” decision across models. Make the Master task visibly distinct from recognition and keep the editor’s note outside the review word target.
- **Editing.** Good Bronze items locate a specific defect, and the strongest Silver items require a priority decision against a brief. Where comparison depends on unseen recall, show both paragraphs. Ask students to justify keeping effective material when there are multiple reasonable edits. Keep the full Master rewrite and make its checklist specific to the brief.
- **Exam.** Bronze decodes briefs and matches evidence, while Silver should compare realistic plans within an explicit word budget. Condense repeated opening and recommendation lenses. Upgrade the art-course checkpoint from another recognition run to a brief, supported plan or recommendation. Retain original full-length practice and clearly separate exam target, internal submission behaviour and self-review.

## Implementation backlog

1. **Question standards and critical defects.** Fix incomplete evidence and ambiguous keys before changing visual presentation. Require a stated reader need when it governs the answer. Use direct wording and plausible alternatives that test the targeted skill. Keep a second validity pass before release.
2. **Shared assessment contract.** A length threshold may permit revealing a model. Track that state as attempted or self-reviewed. Use independent, retry and supported outcomes for objective tasks, and distinguish these from teacher-assessed work. Record a new assessment version where a revised question changes what an existing answer means. Preserve unaffected drafts and keep student pilot contracts isolated.
3. **Shared interactions.** Introduce structured paragraph plans and keyboard-accessible sequencing, then use source-based selection, vocabulary gaps and before/after comparisons where they clarify the task. Test feedback placement, focus order, undo and narrow-screen wrapping. A generic multiple-choice renderer remains suitable for many Bronze decisions.
4. **Pathway content batches.** Apply the individual notes to each pathway. Consolidate low-yield repetition, preserve strong writing tasks and separate notes from any word limit that applies to the finished review. Give self-review checks tied to observable content.
5. **Integration and school verification.** Recheck curriculum diffs against the draft persistence contract. Run activity, browser and pilot tests before releasing changes. Follow with teacher-supervised learner trials and a real school-account access check.

The teacher decisions concern the amount of compulsory Explore work, how optional examples are assigned, and how independent writing is sampled for teacher feedback. The existing three-model proposal is provisional. Learner trials should measure time, independent completion, and which instructions still require a teacher to explain them.

## Cambridge and browser verification

Paper 1 Exercise 6 allows a formal or semi-formal review as one possible response. The syllabuses specify 120–160 words, purpose and audience in the task, up to six marks for content and nine for language. The provided guidance assesses content and language. The Hub’s twenty-minute timer, draft locks, word-count confirmation and self-review are practice controls. The specimen gives about 120–160 words; it does not establish a fixed Exercise 6 timer or a standalone title mark. Teach titles and planning as choices that can serve a particular brief. Four review moves may help with planning without prescribing four paragraphs. Label Academy tasks and models as original practice. [2024–2026 syllabus](https://www.cambridgeinternational.org/Images/637163-2024-2026-syllabus.pdf) · [2027–2029 syllabus](https://www.cambridgeinternational.org/Images/721343-2027-2029-syllabus.pdf) · [Specimen paper](https://www.cambridgeinternational.org/Images/637285-2024-specimen-paper-1.pdf) · [Specimen mark scheme](https://www.cambridgeinternational.org/Images/637289-2024-specimen-paper-1-mark-scheme.pdf)

The [browser evidence](README.md#browser-evidence) covers the preview and recovery workflow on a local simulated teacher account at 1440, 1024, 768 and 390 px. It shows the ordering, retry, annotation, writing and reflection states. A school-account run and evaluation with real learners remain release-stage work. The audit changed documentation only.

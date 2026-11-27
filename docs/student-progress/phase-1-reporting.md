# Student Progress Phase 1 · Reporting foundations

Baseline: `8e57f89ad48b03a20e24b2166bdebfb295d28394`, including the live merit notification changes in PR #725. Scope is the existing Activity and Writing Activity screens, shared Vocabulary merit reporting, and reusable read models.

## Reporting contract

The school timezone is Asia/Shanghai. Today starts at school midnight. The calendar week starts on Monday at school midnight. Last 7 and Last 30 are trailing 168 and 720 hours respectively. An inclusive school date range ends at the next school midnight, exclusive. A future timestamp is not evidence. Timestamp strings require a timezone offset. China has had no DST since 1991. The date-to-midnight conversion covers the Hub's modern reporting dates. Use the same as-of instant for all reads in a report.

| Signal | Qualifying evidence |
| --- | --- |
| Application access | App open in an instrumented module. An interaction also includes a recorded section visit, support use, or time update. |
| Recorded practice | A qualifying answer, assessed result, native completion, or explicit writing submission. Active days count distinct Shanghai dates with this evidence. Multiple modules on the same day add one to the class engagement day count per learner. |
| Answer attempt | Practice `question_attempt` or `question_answered` from an instrumented practice module. Exam answers have a separate counter. Wrapper exam reconciliation is an item result and is not a second answer. |
| Learning activity completion | Completed Vocabulary mission by mission ID. Wrapper `exercise_result` in practice is an exercise-level result where emitted. Vocabulary's exercise result telemetry is excluded from mission completion counting. |
| Assessment evidence | Exam answers and assessed item/exercise results are separate from completed assessments. A native saved Vocabulary Unit Check is a completed assessment. Whole-paper session counts and wrapper exam attempt IDs are unavailable. |
| Writing submission | Timestamped record explicitly submitted to a teacher. The count is submitted versions. It does not establish that homework was assigned, that the learner completed an entire pathway, or that draft-only/offline work did not occur. |
| Estimated learning time | Positive active-time telemetry. Device/wrapper capture and timing heuristics vary. Navigation and time updates never independently add a completion or a meaningful practice day. |

`lastInteraction` and `lastPractice` are latest eligible timestamps in the supplied evidence. Active Activity uses a 30-day query lookback for events, missions and submissions, and available historical Unit Checks. The weekly filter and active-days count use the calendar week separately from the lookback. A recent submission can count as evidence for a writer whose general engagement is otherwise uninstrumented. IDs distinguish duplicate rows from legitimate retries. Native sources take precedence over redundant completion telemetry. Historical wrapper events with distinct database IDs and no stable attempt ID cannot be reliably deduplicated across separate uploads.

## Enrolment and availability

The staff RPC provides an active scoped roster. Canonical UUIDs join records to the student. Current participation excludes evidence before the open membership began and mismatched non-null event class IDs. A membership that disappears or changes between reads produces insufficient evidence instead of assigning old events to a new class. Independent Writing Activity queries include active students in current classes and exclude submitted work from before current enrolment. Unit Check history, Vocabulary evidence and merit ledger records remain attached to the student. The current staff RPC still exposes native learning history for students in the authorised current roster. It does not give former teachers access to transferred students' current statistics.

Possible future historical access models are (1) keep existing policy for student-specific longitudinal evidence and use enrolment-scoped current participation, (2) restrict all teacher-visible evidence to the current enrolment, or (3) allow historical reporting to teachers authorised for the event-time class through a separate explicit rule. Keep (1) for Phase 1. Any expansion or restriction of historical visibility requires a decision and tested data-layer changes.

`evidenceState` distinguishes recorded, no records, tracking unavailable, limited coverage, pilot-only, insufficient evidence, retrieval failure, and permission-restricted. Permission and retrieval outcomes precede interpretation of coverage. Activity reports failed evidence loads as unavailable, and distinguishes a valid empty observation from missing membership evidence. Existing read policies can return no rows for a forbidden scope. Only assert permission restriction when permission information is available, and never infer unauthorised records exist. For a live report showing zero practice days, the denominator is recorded evidence within the covered dates. There is no homework or struggle inference.

## Module capability registry

`src/reporting/capabilities.js` is keyed by the same application keys as the launch catalogue. Missing capabilities are unsupported. The registry is static reporting metadata and does not create a new data store.

| Module | Included evidence | Coverage and detail |
| --- | --- | --- |
| Vocabulary & Paraphrase Builder | Recorded attempts, missions, completed Unit Checks, per-unit word evidence and official merit ledger | Live. Vocabulary class, student and NGSL drilldowns remain. NGSL baseline retains its own report. |
| Informal Email | Explicit Hub submission | Live writer. Local drafting/analytics and feedback pilot are outside general engagement. Writing Activity detail. |
| Essay | Recorded access/stage/time, explicit Practice-mode submission | Live wrapper and writer. No shared mastery or exam-completion rate. Writing Activity detail. |
| Review Writing | Explicit legacy Studio submission | Live legacy writer, separate enrolled Structure pilot and separate staff Academy preview. Neither pilot nor preview counts as released Academy attainment. Writing Activity detail. |
| Reading | Wrapper engagement, question attempts and some exercise results | Live when launched via Hub, partial assessment evidence. Activity detail. |
| Listening | Wrapper engagement, question attempts and assessed item outcomes | Live when launched via Hub, partial assessment evidence. Activity detail. |
| Standalone Paraphrasing | Wrapper engagement, question attempts and exercise outcomes | Live when launched via Hub, partial assessment evidence. Separate key from Vocabulary. Activity detail. |

No reporting read uses staff-preview browser state. The pre-existing Render fixture is explicitly flagged and returned only in that preview context. Reporting accepts no private writing draft data. New modules can register source capabilities without changing student identity or creating a new event ledger.

## Vocabulary assessment, progress and recognition

- Unit Checks are grouped by student and unit. The newest validated saved record for each attempt number is represented. Three attempts apply within each unit. Latest, best, form, attempt number and completion date are independently visible. Student scoring and save paths are unchanged.
- Unit pathway reporting shows live units with contextual evidence. It uses the native `buildUnitPathwayStates`, published occurrence set and shared readiness evaluator. A global word record alone does not establish unit participation. An unserved pathway is unavailable. No programme-level lowest-stage rollup is displayed. The own-read `vocabulary_unit_pathway_journey` relation is not exposed through this staff feature. Its separate resume data is not used to overwrite demonstrated word-level progression. Server set membership parity and broader journey visibility need controlled testing.
- Home, Activity and Vocabulary staff use the same merit calculator and explicit readiness coverage. The Vocabulary staff loader now passes the active class threshold. The actual award count, eligible under the current rule, and outstanding pending numbers are separate. The existing highest-award rule continues to withhold back-filling missing lower award numbers. Historical awards are preserved, even when the recomputed threshold would imply fewer merits. Unawarded entitlements have no persisted snapshot. Freeze policy for transfers, threshold changes and historical gaps remains for approval.
- Both award actions use an insert-on-conflict-ignore write to the original unique ledger. This keeps the first recorded award when two authorised staff requests race. The existing insert policy checks actor and student scope. Persisting entitlement or changing database enforcement would require a separate policy decision. No student learning criteria or award records were changed.
- The shared readiness read caches only published catalogue coverage for two minutes per client, keyed by the live occurrence set. Staff notices retain the existing 30-second poll and session guards. A readiness read error does not silently switch to an unfiltered entitlement.

## Data access and performance

`teacher_activity_rows()` retains roster, check and merit scope. Phase 1 filters its result by record type and uses deterministic output ordering and counted paging. No raw activity rows are transferred by this call. Internally it is still a broad mixed-result function. Paging in separate requests is not a transaction snapshot. This should be measured with real role sessions before a server-side replacement is proposed.

`loadClassEvidence` uses RLS-filtered direct reads with scoped student batches, date bounds, stable ordering and minimal fields. The CMS/API reading of writing submissions selects identity, app and date only. The existing Writing Activity drilldown still reads responses under its existing RLS. The new reporting code never reads `writing_drafts`.

Live catalog inspection found `activity_events_select`, `memberships_select`, `vocabulary_missions_select`, `writing_scoped_read`, `vocabulary_merit_awards_select` and `writing_draft_read`. The scoped staff helper derives role and assigned class from auth. The existing staff RPC has authenticated execute and no anonymous execute. Students and inactive staff are rejected by the RPC's internal role gate. These are policy and source checks. Assigned, unassigned, disabled, transfer and student cases still need controlled authenticated end-to-end tests.

A read-only EXPLAIN of the projected single-account 30-day event read with a synthetic UUID used `activity_events_user_time_idx` and incremental sorting for `occurred_at,id`. Query latency, batch plans under RLS, catalogue cold-start cost and rollover concurrency remain unmeasured. No indexes, migration, policy or schema changes are required by the branch. Last-recorded interaction and recent feeds are derived from the bounded records already loaded. An on-demand API for deep historical detail is deferred.

SSO uses `auth.users.id` → `profiles.id` and does not participate in name or school-number lookup. The live aggregate found three existing linked Azure student identities, zero missing profiles, and zero mismatched profile emails among Azure identities. No Entra setting or authentication path was changed. End-to-end password-to-Microsoft continuity needs an approved controlled account and an authenticated test session.

## Audit disposition

| Audit finding | Status | Evidence or residual work |
| --- | --- | --- |
| Raw event counts presented as learning | Resolved | Explicit taxonomy, active-day counts and Shanghai periods in `src/reporting`. |
| Misleading Needs Attention | Resolved | Removed classifier, filter and flags. Existing intervention records and Vocabulary follow-up remain. |
| Mixed Unit Checks | Resolved | Student–unit histories and unit-level attempt allowances. |
| Untouched units affect apparent stage | Partially resolved | Reports contextual units with explicit coverage. Full native curriculum/coverage and stored journey parity remains to verify. |
| Divergent merit coverage and threshold | Partially resolved | Shared computation, current class threshold and ledger write. Concurrent DB role test and numerical parity on real eligible test records outstanding. |
| Award gaps, transfer and threshold entitlement freeze | Requires approval | Preserve existing highest-number behavior and historic awards. Define prospective entitlement policy before changing it. |
| Ambiguous writing homework labels | Resolved | `Writing Activity` uses recorded submission language and current-enrolment attribution. |
| Unknown and unsupported coverage | Partially resolved | Registry and explicit availability model. More granular source-specific status display is a future UI decision. |
| Opening a class view or Home poll loads all event history | Partially resolved | Bounded event/contact read and record-category filtered merit polling. Existing broad RPC can still do internal work. Benchmark before proposing a separate SQL read model. |
| School timezone drift | Resolved for Phase 1 Activity and Writing Activity | Reusable today, rolling 7/30, calendar week and custom date rules. Specialist Vocabulary weekly views remain module-specific. |
| Class transfer and authorised historical access | Partially resolved | Current participation is enrolment-scoped. No expansion of historical access. Controlled role/transfer browser checks outstanding. |
| Cross-module writing persistence and assignment management | Deferred | No new writer instrumentation, draft migration, external assignment integration or overdue claims. |
| Live role/browser and SSO continuity scenarios | Unable to verify | Catalog checks and synthetic tests completed. Controlled roles, authentic browser sessions and production sign-in comparison unavailable. |
| Main-menu separation and intervention design | Deferred | Outside this phase. Existing Activity route stays in place. |

## Phase 2 readiness

The read model and corrected screen are suitable for review. Before release, run scoped authenticated tests with assigned and unassigned teachers, a student, an administrator, a disabled account and a transferred learner. Verify continued Microsoft and password sign-in to the same approved test account, plus merit parity for a test learner with recorded awards and a class threshold change. Benchmark class-sized reads and choose a historical visibility policy before expanding reporting. This branch remains unmerged and undeployed.

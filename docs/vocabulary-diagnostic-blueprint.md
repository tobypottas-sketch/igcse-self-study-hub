# Vocabulary Diagnostic — Assessment Blueprint v0.1

**Status:** proposal, not authorised for student launch. **Project:** iGCSE Self-Study Hub / Vocabulary & Paraphrase Builder. **Date:** 14 November 2026.

## 1. Purpose and scope

Build a short, repeatable diagnostic estimating **English receptive vocabulary knowledge**, referenced to **CEFR vocabulary levels A1–C1**. The diagnostic establishes a baseline for first-time students and provides comparable follow-up snapshots, initially proposed at 8-week intervals. It is not an official Cambridge, Oxford, or CEFR examination, and it **does not determine the student's overall CEFR proficiency or iGCSE 0511 grade**.

It must measure general English vocabulary **independently** of the words in the existing Vocabulary Builder units, normal pathway stage achievements, XP, question attempts, merits, or time spent on the app. These can be compared as separate data series, not blended into the diagnostic score.

**Primary constructs**
- Breadth of receptive vocabulary knowledge over a representative set of words/senses and CEFR-referenced difficulty levels.
- Ability to distinguish an appropriate **meaning in a short context**, including polysemy, rather than recognise a word shape or familiar definition.
- Secondary reporting of recognition of common collocations and lexical precision, if sufficient calibrated items are available.

**Out of scope for the initial diagnostic:** productive vocabulary certification, spelling accuracy as a proxy for vocabulary breadth, general reading proficiency, listening, grammar, iGCSE grades, officially certified CEFR scores, student ranking, automatic reallocation of classes.

## 2. External reference and licensing boundaries

- **Council of Europe CEFR Companion Volume**: use its *Vocabulary range* constructs/descriptors to interpret breadth and limitations; CEFR is a language proficiency framework, not a rigid word-count table.
  Source: https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-companion-volume-and-its-language-versions
- **Cambridge English Vocabulary Profile (EVP)**: research/reference tool for particular word **senses** and phrases at A1–C2; important not to treat all meanings of one surface word as one fixed CEFR level.
  Source: https://englishprofile.org/?menu=english-vocabulary-profile
  **Rights restriction:** EVP explicitly restricts commercial use and promotion as “English Profile informed”; do not bulk copy/import EVP data into this application without permission/legal confirmation.
- **Oxford 3000/5000**: supplementary CEFR-aligned lexical sampling reference (Oxford 3000 A1–B2; extra 2000 B2–C1). Word-list alignment is not evidence that a particular student has achieved a certified CEFR level.
  Source: https://www.oxfordlearnersdictionaries.com/about/wordlists/oxford3000-5000
  **Rights restriction:** independently verify permissions before copying Oxford entries, level labels, definitions or an entire list into a stored assessment bank.
- All *delivered* stems, definitions, contexts and distractors must be newly authored or clearly licensed, with source provenance. No unreviewed mass import of third-party wordlists, definitions or example sentences.

**Terminology in UI:** “CEFR-referenced receptive vocabulary estimate”, or until validated “Vocabulary diagnostic performance (pilot)”. Do not use “Official CEFR score”, “Cambridge-certified level”, “Oxford score”, or an unqualified “Your English level”.

## 3. Test design (pilot proposal; counts are not validated)

| Property | Proposed first pilot |
|---|---|
| Level coverage | A1, A2, B1, B2, C1 |
| Student target time | Roughly 15–20 minutes; evaluate actual median time in pilot |
| Question budget | Approximately 35–45 scored items; adapt after timing/discrimination pilot |
| Item types | ~70% meaning-in-context, ~20% precise meaning/near-synonym discrimination, ~10% collocation or phrase sense |
| Format | Single best answer with four plausible, grammatical options; optional “I don't know” to reduce random guessing |
| Presentation | No per-item correctness feedback, hints, retry, badges, mastery stars or unit tags during diagnostic |
| Administration | One first-time baseline; subsequent reassessment after a configurable interval (initially 8 weeks) |
| Forms | Distinct assessment forms with linked anchors where permitted and studied; no exact item repeats in consecutive sittings |
| Delivery | Server-owned item selection, timer/attempt state and scoring; recover safely after interruption |
| Accommodation | Untimed or extended-time setting; time not used as a proficiency component |

**Recommended adaptive pattern:** a short mixed-level routing block, then target items near the estimated ability while retaining *anchors* above and below the likely level. Avoid routing solely from three easy initial questions. Minimum coverage across adjacent bands and stop rules are determined by evidence sufficiency, not just length. Do not make a statement like “80% correct = B2”.

**Difficulty is an empirical property.** An item's initial lexical CEFR tag is an *authoring hypothesis*, not a calibrated difficulty parameter. After collecting responses, review discrimination, empirical difficulty, distractor selection, omissions, answer-position bias and differential performance by group where data and safeguarding permit.

## 4. Item bank and quality gates

Maintain a **separate diagnostic bank**. Do not sample the existing 350-unit practice items as the scored baseline test: prior exposure would bias comparisons.

**Item definition (conceptual)**
- Stable item ID and **version**; level-tag A1–C1; vocabulary lemma, part of speech, **tested sense**.
- Original context/stem; four options with exactly one defensible answer; unique option IDs and authored rationale for every choice.
- Intended construct, topic/domain, estimated difficulty band, known ambiguity flags, source/provenance and rights status.
- Item review status: draft → language-reviewed → assessment-reviewed → pilot → approved / retired.
- Form eligibility, usage/exposure tracking and optional calibrated parameters with model/version identifiers.
- Linked variants and common-content group to prevent accidentally delivering equivalent items within a sitting.

**Hard rejection:** duplicate or near-synonymous correct answers; answer disclosed by stem, punctuation, length or grammar; three obviously irrelevant distractors; correct answer the only single word or the only -ed form; ambiguous polysemy; distractors acceptable in the given context; factual/bias problems; excessive reading burden; copyright uncertainty. The recent Meaning Recognise improvements are a starting point, **not a sufficient psychometric review**.

**Sampling blueprint:** balanced lexical domains (daily life, school, work, travel, society, abstract/general academic vocabulary), parts of speech and senses; no overrepresentation of one existing curriculum unit or topic. Ensure A1–C1 breadth, including easier A1 items that do not insult older learners.

**Bank size gate:** before a two-form pilot, create and independently review enough items to produce two distinct ~40-item forms with appropriate level coverage **and replacements**. A target of at least ~200–300 original items is a *planning estimate*, not a claim that all have been created. Expand after pilot to reduce overexposure and support future intervals.

## 5. Scoring and reporting: calibration gates

**Pilot stage (before validation):**
- Report number of questions administered, correct/incorrect/“don't know” and **band-specific evidence coverage**.
- Display “Pilot diagnostic — level estimate not yet available” until cut scores and item performance have been validated.
- No CEFR level label inferred from an arbitrary percentage, item count or unit-completion status.

**Validated stage (requires review/approval):**
- Pre-specify the scoring model (e.g. a simple anchored, empirical scale followed by IRT if response volume, fit and expertise justify it).
- Set empirically justified level decision regions using representative reference groups and independent measures; document uncertainty/confidence, borderline bands and insufficient-evidence rules.
- A student can improve within B1 without a label change. Report continuous scale location **only if comparable across forms and administrations**.
- Explicitly track test version, item-bank version, score-model version and cut-score version. Historical snapshots are never silently rescored; recalculation would be separately recorded.
- No high-stakes class placement based only on this test.

**Student report (post-validation):** “Estimated receptive vocabulary: B1 (provisional)” + meaningful uncertainty/band message + progress since baseline on comparable internal scale + next review date. Avoid fabricated numerical CEFR sub-levels.

**Teacher report:** assessment completion, latest and baseline *estimated* band, confidence/insufficient evidence, comparable growth or no measured change, participation and date. By assigned class only; admins may aggregate across school. No leaderboard or class ranking by default.

## 6. Scheduling and lifecycle

- **First-time student:** a dedicated welcome/diagnostic entry point; baseline test should be clearly distinguished from current unit practice.
- **Pilot rollout:** initially teacher-invited / teacher-assigned, **not forced on every live login**. Mandatory-on-first-login behaviour requires calibration, accessibility testing, opt-out/deferral rules and explicit approval.
- **Follow-ups:** propose 56 days after *completed* baseline, adjustable centrally; avoid additional tests when student missed baseline, is mid-test, or recently completed one.
- **Non-completion:** resumable sitting where feasible, protected against duplicate submissions; do not report “A1” from a partial run. Record abandoned/interrupted rather than silently marking wrong.
- **Alternate forms:** control overlap, anchor content, exposure, version and difficulty; a previous sitting must not become a revision sheet for the next.
- **Reminders:** visible in the Hub and teacher dashboards, not a persistent blocking modal; avoid notifications without institutional consent.
- **Auditability:** immutable completed attempts, attempt lineage and scoring version; an administrative retake/reset is recorded, not erased.

## 7. Architecture fit, based on current Hub

Observed existing schema and code:
- Supabase `profiles`, `classes`, `student_class_memberships`, `teacher_classes` provide identity/authorised class scope.
- Existing Vocabulary items/occurrences, `vocabulary_global_mastery`, `vocabulary_pathway_sets`, `vocabulary_unit_check_attempts`, and `activity_events` serve practice, progress and unit checks.
- `src/vocabulary/app.js` owns student Vocabulary experience, `src/vocabulary/router.js` routes students/staff, `src/vocabulary/teacher-data.js` scopes class data and `src/vocabulary/student-progress.js` builds student dashboards.
- **No diagnostic-grade item bank, multi-sitting diagnostic history or empirically defined score bands has yet been identified**. Do not add columns to mastery or re-purpose Unit Check as the external diagnostic.

**Proposed new schema (design only; no SQL executed):**
1. `vocabulary_diagnostic_items`: versioned stem, options, answer, CEFR authoring tag, tested sense, construct, provenance, rights/review/exposure status, calibrated properties.
2. `vocabulary_diagnostic_forms`: approved item selection plan/version, constraints, anchor policy and active dates.
3. `vocabulary_diagnostic_sessions`: student ID, assignment type (baseline/follow-up), form and model versions, started/submitted timestamps, state, interruption data and next eligible date.
4. `vocabulary_diagnostic_responses`: immutable session+item+version, presented order, response, outcome, duration (optional), no-key client submission and server submission timestamps.
5. `vocabulary_diagnostic_results`: immutable versioned totals, coverage, estimate and uncertainty or “insufficient evidence”, scale metadata and teacher review.
6. Optional `vocabulary_diagnostic_assignments`: teacher/admin invitation, availability window, extension/accommodation and retake authorisation.

**Security and correctness requirements**
- RLS on every exposed table; student reads only own sessions/results; teacher reads only assigned classes, admin sees school-wide data.
- Raw correct keys and entire future item banks **must not be exposed by client SELECT**. Separate secure delivery/scoring endpoints or controlled RPC with rate limits and item exposure checks; never bundle answer keys into static GitHub Pages assets.
- Keep server-owned marking; client sends only selected option identifiers. Integrity checks for item/version/form, one-time answer submission, idempotency and concurrency; no browser-based score authority.
- Consider RLS and privileges for diagnostic response/answer writes, report exports and admin adjustments; avoid conflating broad `profiles` SELECT with student evidence authorisation.
- Record minimum student data and follow school retention/privacy policy; protect underage users and restrict exports.

## 8. Phased delivery and release gates

**Phase 0 — blueprint (this PR):** agree construct, CEFR reference and rights, adaptive/form design, report language, scoring validity and security boundaries. No student-visible changes.

**Phase 1 — original item bank:** create authoring schema and review workflow, draft an initial controlled set per band with source/rights notes; educator and second reviewer check each item; test content issues and generation quality. Use real sampled items in review, not only synthetic regex gates.

**Phase 2 — engine and backend:** secure assessment delivery, server grading, versioned snapshot, interruptions, RLS, quotas, accessibility and deterministic tests. No public CEFR labels.

**Phase 3 — pilot:** small set of student volunteers/classes, representative range, collect item statistics, timing, retest/form equivalence and external reference evidence. Analyse weak items, discrimination, distractor behaviour and cut-score uncertainty.

**Phase 4 — validated launch:** only after explicit teacher approval of scoring/report rules, add baseline onboarding and 8-week follow-up scheduler, student journey and staff class reports. Announce the scale as *estimated receptive vocabulary*, not certified CEFR.

**Acceptance before pilot:**
- Every item has one defensible answer, comparable plausible alternatives and reviewed rights status.
- Answer keys remain unavailable to students through page assets or standard Data API requests.
- Two distinct forms and an exposure/anchor strategy exist.
- Baseline, missed test, completed test, re-entry and next-due behaviours have defined UX.
- No changes to practice mastery/merits or assessment history from test runs.
- Per-role access tests and full item-bank validation pass.

**Acceptance before CEFR-labelled reporting:**
- Demonstrated empirical relation to independent proficiency evidence, with documented decision rules and uncertainty.
- Cross-form comparability and follow-up sensitivity demonstrated.
- Teacher receives a clear limitations statement and approves what parents/students see.

## 9. Open decisions for owner/teacher

1. Age/grade scope: default Grades 9–11 or all student accounts? The first pilot should be small and opt-in.
2. Initial baseline prompt: invite first-time users, or require after pilot calibration? Recommendation: **invitation during pilot**, required only after approval.
3. Reassessment cadence: proposed every 8 weeks, with teacher override.
4. Outcome reporting: level estimate + within-band progress *after calibration*; before that, show profile only.
5. Is the school willing to independently author/review ~200–300 new diagnostic items and support a validity pilot? Without this, do not claim CEFR estimation.

## Research / official reference links

- Council of Europe CEFR Companion Volume: https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-companion-volume-and-its-language-versions
- English Vocabulary Profile overview and terms: https://englishprofile.org/?menu=english-vocabulary-profile
- Oxford 3000 and Oxford 5000 wordlists: https://www.oxfordlearnersdictionaries.com/about/wordlists/oxford3000-5000
- Oxford explanation of CEFR: https://www.oxfordlearnersdictionaries.com/about/wordlists/cefr

**No migrations, production data edits, login flow changes or new student-facing features are included in this blueprint.**

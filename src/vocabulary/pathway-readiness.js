// The one evaluator that decides which pathways are live for a unit. The student app, the teacher pathway table, the teacher
// readiness report and the release test all call this; there is no second interpretation of "live".
//
// It never judges content by counting rows. A word counts for a stage only when the real question builder produces a question
// for it, so a stage can never be "ready" on records the engine could not actually use.
import { VOCABULARY_PATHWAYS, PATHWAY_STAGES, activityTypesForPathwayStage } from './pathway-model.js';
import { evaluateTargetForPathwayStage } from './pathway-planner.js';
import { grammaticalBlankCandidates } from './foundational-activity-builder.js';
import { gapDistractorIndex, situationDistractorRecord } from './reviewed-content.js';
import { linkedActivitiesForTarget, withContentMemo } from './session-targets.js';
import { pathwayLivePolicy } from './pathway-live-policy.js';
import { READINESS_RULES, stageMinimum } from '../../content/vocabulary/pathway-readiness-rules.js';
import { unitConfig } from '../../content/vocabulary/unit-registry.js';
import { computePathwaySets } from './pathway-sets.js';
import { evaluateFamilyEligibility, FAMILY_STATUS } from './word-family-eligibility.js';

function array(value) { return Array.isArray(value) ? value : []; }
function idOf(row) { return String(row.occurrenceId ?? row.occurrence_id); }
function contextsFor(content, occurrence) {
  return content?.contextsByOccurrence?.[occurrence?.occurrenceId] ?? array(content?.contexts).filter(row => row?.occurrenceId === occurrence?.occurrenceId);
}
// How much of the unit's judgement-call content (gap-fill options, wrong situations) is reviewed and well formed. Teacher-facing only.
function authoringSummary(content) {
  const summary = { gapSentences:0, gapSentencesReviewed:0, gapMalformed:0, situationWordsReviewed:0, situationWordsMalformed:0, words:0,
    // Word Families Mastery needs an authored, complete family per word (Job 8). `unknown` = a family exists only as bare strings (per-form metadata
    // missing, so it is BLOCKED until authored); `noFamily` = the word has no family at all (nothing to author, not blocked).
    wordFamilyEligible:0, wordFamilyIneligible:0, wordFamilyUnknown:0, wordFamilyNoFamily:0, wordFamilyBlockedTerms:[] };
  for (const occurrence of array(content?.occurrences)) {
    const item = content?.itemsById?.[occurrence.vocabularyId] ?? array(content?.items).find(row => row?.vocabularyId === occurrence.vocabularyId);
    if (!item) continue;
    summary.words += 1;
    const contexts = contextsFor(content, occurrence);
    const candidates = grammaticalBlankCandidates({ item, occurrence, contexts });
    const index = gapDistractorIndex({ item, occurrence, contexts, candidates });
    summary.gapSentences += candidates.length;
    summary.gapSentencesReviewed += candidates.filter(candidate => index.byContextId.has(String(candidate.context.contextId))).length;
    summary.gapMalformed += index.problems.length;
    const familyVerdict = evaluateFamilyEligibility(item, array(item.senses).find(row => row?.senseId === occurrence.senseId) ?? array(item.senses)[0] ?? {});
    if (familyVerdict.status === FAMILY_STATUS.ELIGIBLE) summary.wordFamilyEligible += 1;
    else if (familyVerdict.status === FAMILY_STATUS.UNKNOWN && !array(item.wordFamily).length && !array(array(item.senses)[0]?.wordFamilyForms).length) summary.wordFamilyNoFamily += 1;
    else { if (familyVerdict.status === FAMILY_STATUS.INELIGIBLE) summary.wordFamilyIneligible += 1; else summary.wordFamilyUnknown += 1; summary.wordFamilyBlockedTerms.push(item.term); }
    const situation = situationDistractorRecord({ item, occurrence });
    if (situation.status === 'valid') summary.situationWordsReviewed += 1;
    if (situation.status === 'malformed') summary.situationWordsMalformed += 1;
  }
  return summary;
}
function unitNumberFor(content = {}) {
  const first = array(content?.occurrences)[0] ?? {};
  return first.unitNumber ?? first.unit_number ?? null;
}
const STAGE_LABEL = Object.freeze(Object.fromEntries(PATHWAY_STAGES.map(stage => [stage.id, stage.label])));

export function evaluateUnitReadiness(args = {}) { return withContentMemo(args.content, () => evaluateUnitReadinessUncached(args)); }
function evaluateUnitReadinessUncached({ content, masteryByVocabularyId = {}, expectedWords = null, policy = pathwayLivePolicy } = {}) {
  const occurrences = array(content?.occurrences);
  const unitNumber = unitNumberFor(content);
  const expected = Number(expectedWords ?? unitConfig(unitNumber)?.expectedWords ?? occurrences.length);
  const pathways = {};
  const authoring = authoringSummary(content);

  for (const pathway of VOCABULARY_PATHWAYS) {
    const stageCounts = {}; const stageMinimums = {}; const stageReview = {}; const stageFailures = {}; const withheldStages = []; const missing = [];
    let served = new Set(occurrences.map(idOf));

    for (const stage of PATHWAY_STAGES) {
      const withheld = activityTypesForPathwayStage(pathway.id, stage.id).length === 0;
      if (withheld) withheldStages.push(stage.id);
      const eligible = []; const review = { reviewed:0, generatedSafe:0, generatedSemantic:0, other:0, unreviewed:0 };
      const failures = [];
      if (!withheld) {
        for (const occurrence of occurrences) {
          const outcome = evaluateTargetForPathwayStage({
            pathwayId:pathway.id, stageId:stage.id, content, target:occurrence,
            mastery:masteryByVocabularyId[occurrence?.vocabularyId] ?? {}, seed:`coverage:${pathway.id}:${stage.id}:${occurrence?.occurrenceId ?? ''}`
          });
          if (outcome.eligible) {
            eligible.push(occurrence);
            if (outcome.source === 'reviewed') review.reviewed += 1;
            else if (outcome.source === 'generated_safe') review.generatedSafe += 1;
            else if (outcome.source === 'generated_semantic') review.generatedSemantic += 1;
            else review.other += 1;
          } else {
            if (outcome.buildable) review.unreviewed += 1;
            failures.push({ occurrenceId:idOf(occurrence), vocabularyId:occurrence.vocabularyId, buildable:outcome.buildable, kind:outcome.strictFailures[0]?.kind ?? null, reason:outcome.strictFailures[0]?.detail ?? outcome.reason ?? 'No question could be built.' });
          }
        }
      }
      stageReview[stage.id] = review;
      stageFailures[stage.id] = failures;
      const ids = new Set(eligible.map(idOf));
      stageCounts[stage.id] = ids.size;
      stageMinimums[stage.id] = stageMinimum(pathway.id, stage.id, expected);
      // A word is served by the pathway only if it can run every rung. A word that can start but not continue would be stranded
      // part-way, and a pathway counts as mastered only when every served word is.
      served = withheld ? new Set() : new Set([...served].filter(id => ids.has(id)));
      if (ids.size < stageMinimums[stage.id]) {
        missing.push({ kind:'stage', stage:stage.id, label:`${STAGE_LABEL[stage.id]} stage`, have:ids.size, need:stageMinimums[stage.id], unreviewed:review.unreviewed });
      }
    }

    const servedIds = [...served];
    const servedTargets = occurrences.filter(row => served.has(idOf(row)));
    const servedNeed = Math.min(...Object.values(stageMinimums));
    if (servedIds.length < servedNeed) {
      missing.push({ kind:'full_path', label:'words that can run every stage', have:servedIds.length, need:servedNeed });
    }
    for (const rule of READINESS_RULES[pathway.id]?.diversity ?? []) {
      const have = servedTargets.filter(target => linkedActivitiesForTarget(content, target).some(row => row.contentType === rule.contentType)).length;
      if (have < rule.minimum) missing.push({ kind:'diversity', id:rule.id, label:rule.label, have, need:rule.minimum });
    }

    const hold = policy(unitNumber, pathway.id);
    const held = hold?.available === false;
    let reason = null;
    if (held) reason = hold.reason ?? 'editorial_hold';
    else if (withheldStages.length) reason = 'required_rung_withheld';
    else if (missing.some(row => row.kind === 'stage')) reason = 'stage_below_minimum';
    else if (missing.some(row => row.kind === 'full_path')) reason = 'too_few_full_path_words';
    else if (missing.some(row => row.kind === 'diversity')) reason = 'diversity_below_minimum';
    const live = !reason;
    // Sets of 10 over the words that can run every stage (authored order). Held-back words stay visible here and are never padded in.
    const sets = computePathwaySets(servedIds, { pathwayId:pathway.id });

    pathways[pathway.id] = {
      pathwayId:pathway.id,
      live,
      reason,
      held,
      stageCounts,
      stageMinimums,
      stageReview,
      stageFailures,
      supportedStages:PATHWAY_STAGES.map(stage => stage.id).filter(id => stageCounts[id] >= stageMinimums[id]),
      servedOccurrenceIds:live ? servedIds : [],
      servedCount:servedIds.length,
      setCount:sets.setCount,
      playableSetCount:live ? sets.setCount : 0,
      setMembers:sets.sets,
      heldBackOccurrenceIds:sets.heldBack,
      heldBackCount:sets.heldBackCount,
      setReadiness:sets.reason,
      totalOccurrences:occurrences.length,
      withheldStages,
      missing
    };
  }

  return { unitNumber, expectedWords:expected, pathways, authoring };
}

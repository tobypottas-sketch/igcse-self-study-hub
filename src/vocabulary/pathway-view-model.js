import { VOCABULARY_PATHWAYS, PATHWAY_STAGES, derivePathwayPlacement } from './pathway-model.js';
import { pathwayMasteryNeedsReview } from './pathway-progress.js';
import { registeredPathwayCoverage } from './pathway-coverage-store.js';

const STAGE_IDS = PATHWAY_STAGES.map(stage => stage.id);
const STAGE_INDEX = Object.freeze(Object.fromEntries(STAGE_IDS.map((id,index) => [id,index])));
let latestUnitPathwayStates = {};

function unitRowFor(unitMastery, occurrenceId) { return unitMastery?.[occurrenceId] ?? {}; }
function globalRowFor(globalMastery, vocabularyId) { return globalMastery?.[vocabularyId] ?? {}; }
function contextualEvidence(row = {}) { return row?.contextualEvidence ?? row?.contextual_evidence ?? {}; }
function persistedPathway(row = {}, pathwayId) { return contextualEvidence(row)?.pathwayProgress?.[pathwayId] ?? contextualEvidence(row)?.pathway_progress?.[pathwayId] ?? null; }
function rawCompletedStages(progress = {}) {
  if (Array.isArray(progress?.completedStages)) return new Set(progress.completedStages.filter(id => STAGE_INDEX[id] != null));
  if (Array.isArray(progress?.completed_stages)) return new Set(progress.completed_stages.filter(id => STAGE_INDEX[id] != null));
  const stages = progress?.stages ?? {};
  return new Set(STAGE_IDS.filter(id => stages?.[id]?.completed === true));
}
function contiguousCompletedStages(progress = {}) {
  const completed = rawCompletedStages(progress);
  const contiguous = [];
  for (const stageId of STAGE_IDS) {
    if (!completed.has(stageId)) break;
    contiguous.push(stageId);
  }
  return contiguous;
}
function stageFromPersisted(progress = {}, completedStages = []) {
  if (completedStages.length) {
    if (completedStages.length >= STAGE_IDS.length) return 'mastery';
    return STAGE_IDS[completedStages.length] ?? 'recognise';
  }
  const hasStageEvidence = Object.keys(progress?.stages ?? {}).length > 0 || Array.isArray(progress?.completedStages) || Array.isArray(progress?.completed_stages);
  if (hasStageEvidence) return 'recognise';
  const explicit = progress?.currentStage ?? progress?.current_stage;
  return STAGE_INDEX[explicit] != null ? explicit : 'recognise';
}
function needsPracticeFromPersisted(progress = {}) {
  if (progress?.needsPractice === true || progress?.supportRequested === true || pathwayMasteryNeedsReview(progress)) return true;
  return Object.values(progress?.stages ?? {}).some(stage => stage?.needsPractice === true);
}
function legacyMastery(unitRow = {}, globalRow = {}) {
  const detail = contextualEvidence(unitRow);
  const unitStrands = detail?.strandEvidence ?? detail?.strand_evidence ?? {};
  const globalStrands = globalRow?.strandEvidence ?? globalRow?.strand_evidence ?? {};
  return {
    ...globalRow,
    status:unitRow?.status ?? globalRow?.status ?? 'new',
    strandEvidence:Object.keys(unitStrands).length ? unitStrands : globalStrands,
    unscaffoldedProductions:detail?.unscaffoldedProductions ?? detail?.unscaffolded_productions ?? globalRow?.unscaffoldedProductions ?? globalRow?.unscaffolded_productions ?? 0
  };
}
function stagesBefore(stageId) {
  const index = STAGE_INDEX[stageId] ?? 0;
  return STAGE_IDS.slice(0,index);
}
function occurrenceId(occurrence = {}) { return occurrence.occurrenceId ?? occurrence.occurrence_id; }
function occurrenceUnitNumber(occurrence = {}) { return occurrence.unitNumber ?? occurrence.unit_number ?? null; }
function number(value) { return Math.max(0,Number(value) || 0); }
function listCount(value, fallback = 0) { return Array.isArray(value) ? new Set(value.map(String)).size : number(fallback); }
function stageRecord(progress = {}, stageId) { return progress?.stages?.[stageId] ?? {}; }
function wordEvidenceScore(stageId, stage = {}) {
  const successes = number(stage.successes);
  const clean = number(stage.cleanSuccesses ?? stage.clean_successes);
  const cleanUnassisted = number(stage.cleanUnassistedSuccesses ?? stage.clean_unassisted_successes);
  const prompts = listCount(stage.promptKeys ?? stage.prompt_keys, stage.distinctPromptCount ?? stage.distinct_prompt_count);
  const content = listCount(stage.contentIds ?? stage.content_ids);
  if (stage?.completed === true) return 1;
  if (stageId === 'recognise') return Math.min(1,clean / 2,content / 2);
  if (stageId === 'match') return Math.min(1,clean / 2);
  if (stageId === 'apply') return Math.min(1,clean / 2);
  if (stageId === 'recall') return Math.min(1,cleanUnassisted / 2);
  if (stageId === 'mastery') return Math.min(1,successes / 3,cleanUnassisted / 2,prompts / 2);
  return 0;
}
function aggregateStageEvidence(entries, pathwayId, stageId, unitMastery) {
  const active = entries.filter(entry => entry.states?.[pathwayId]?.currentStage === stageId || (stageId === 'mastery' && entry.states?.[pathwayId]?.mastered === true));
  const evidence = {
    stageId,
    activeWords:active.length,
    attempts:0,
    successes:0,
    cleanSuccesses:0,
    cleanUnassistedSuccesses:0,
    failures:0,
    distinctPrompts:0,
    distinctContexts:0,
    distinctContent:0,
    progressPercent:0
  };
  let score = 0;
  for (const entry of active) {
    const progress = persistedPathway(unitRowFor(unitMastery,occurrenceId(entry.occurrence)),pathwayId);
    const stage = stageRecord(progress,stageId);
    const successes = number(stage.successes);
    const failures = number(stage.failures);
    evidence.attempts += successes + failures;
    evidence.successes += successes;
    evidence.cleanSuccesses += number(stage.cleanSuccesses ?? stage.clean_successes);
    evidence.cleanUnassistedSuccesses += number(stage.cleanUnassistedSuccesses ?? stage.clean_unassisted_successes);
    evidence.failures += failures;
    evidence.distinctPrompts += listCount(stage.promptKeys ?? stage.prompt_keys,stage.distinctPromptCount ?? stage.distinct_prompt_count);
    evidence.distinctContexts += listCount(stage.contextIds ?? stage.context_ids);
    evidence.distinctContent += listCount(stage.contentIds ?? stage.content_ids);
    score += wordEvidenceScore(stageId,stage);
  }
  evidence.progressPercent = evidence.activeWords ? Math.round((score / evidence.activeWords) * 100) : 0;
  return evidence;
}
function wordPathwayState({ pathwayId, occurrence, unitMastery, globalMastery }) {
  const unit = unitRowFor(unitMastery, occurrenceId(occurrence));
  const global = globalRowFor(globalMastery, occurrence.vocabularyId ?? occurrence.vocabulary_id);
  const persisted = persistedPathway(unit,pathwayId);
  if (persisted) {
    const completedStages = contiguousCompletedStages(persisted);
    const currentStage = stageFromPersisted(persisted,completedStages);
    const mastered = completedStages.length === STAGE_IDS.length;
    return {
      currentStage,
      completedStages,
      mastered,
      needsPractice:needsPracticeFromPersisted(persisted)
    };
  }
  const currentStage = derivePathwayPlacement({ pathwayId, legacyMastery:legacyMastery(unit,global) });
  return { currentStage, completedStages:stagesBefore(currentStage), mastered:false, needsPractice:false };
}

export function buildWordPathwayStates({ occurrence, unitMastery = {}, globalMastery = {} } = {}) {
  if (!occurrence) return Object.fromEntries(VOCABULARY_PATHWAYS.map(pathway => [pathway.id,{ currentStage:'recognise', completedStages:[], needsPractice:false, mastered:false }]));
  return Object.fromEntries(VOCABULARY_PATHWAYS.map(pathway => [pathway.id,wordPathwayState({ pathwayId:pathway.id, occurrence, unitMastery, globalMastery })]));
}

export function targetsForPathwayStage({ pathwayId, stageId, occurrences = [], unitMastery = {}, globalMastery = {} } = {}) {
  if (!pathwayId || !STAGE_INDEX.hasOwnProperty(stageId)) return [];
  return occurrences.filter(occurrence => {
    const state = buildWordPathwayStates({ occurrence, unitMastery, globalMastery })?.[pathwayId];
    return state?.currentStage === stageId && state?.mastered !== true;
  });
}

export function getLatestUnitPathwayStates() { return latestUnitPathwayStates; }

export function buildUnitPathwayStates({ occurrences = [], unitMastery = {}, globalMastery = {}, coverageByPathway = null } = {}) {
  const unitNumber = occurrences.length ? occurrenceUnitNumber(occurrences[0]) : null;
  const registeredCoverage = unitNumber != null ? registeredPathwayCoverage(unitNumber) : null;
  const effectiveCoverage = coverageByPathway ?? registeredCoverage ?? {};
  const perOccurrence = occurrences.map(occurrence => ({ occurrence, states:buildWordPathwayStates({ occurrence, unitMastery, globalMastery }) }));
  const result = {};

  for (const pathway of VOCABULARY_PATHWAYS) {
    const coverage = effectiveCoverage?.[pathway.id] ?? null;
    const totalCount = Number.isFinite(Number(coverage?.totalOccurrences)) ? Number(coverage.totalOccurrences) : occurrences.length;
    const available = coverage?.available !== false;
    const allowedIds = coverage && Array.isArray(coverage.occurrenceIds) ? new Set(coverage.occurrenceIds.map(String)) : null;
    const serviceable = allowedIds
      ? perOccurrence.filter(entry => allowedIds.has(String(occurrenceId(entry.occurrence))))
      : perOccurrence;
    const words = serviceable.map(entry => entry.states[pathway.id]);
    const coverageCount = words.length;

    if (!available || !words.length) {
      const stageEvidence = aggregateStageEvidence(serviceable,pathway.id,'recognise',unitMastery);
      result[pathway.id] = {
        currentStage:'recognise', completedStages:[], needsPractice:false, mastered:false,
        available:false, coverageCount, totalCount,
        unavailableReason:coverage?.reason ?? (words.length ? null : 'no_serviceable_targets'),
        stageAttempts:stageEvidence.attempts, stageCleanSuccesses:stageEvidence.cleanSuccesses, stageEvidence
      };
      continue;
    }

    const mastered = words.every(word => word.mastered);
    const actionableWords = words.filter(word => !word.mastered);
    const highestIndex = mastered
      ? STAGE_INDEX.mastery
      : Math.max(...actionableWords.map(word => STAGE_INDEX[word.currentStage] ?? 0));
    const currentStage = STAGE_IDS[highestIndex] ?? 'recognise';
    const completedStages = mastered ? [...STAGE_IDS] : stagesBefore(currentStage);
    const stageEvidence = aggregateStageEvidence(serviceable,pathway.id,currentStage,unitMastery);

    result[pathway.id] = {
      currentStage,
      completedStages,
      needsPractice:words.some(word => word.needsPractice),
      mastered,
      available:true,
      coverageCount,
      totalCount,
      unavailableReason:null,
      stageAttempts:stageEvidence.attempts,
      stageCleanSuccesses:stageEvidence.cleanSuccesses,
      stageEvidence
    };
  }

  latestUnitPathwayStates = result;
  return result;
}

import { VOCABULARY_PATHWAYS, PATHWAY_STAGES, derivePathwayPlacement } from './pathway-model.js';
import { pathwayMasteryNeedsReview } from './pathway-progress.js';
import { registeredPathwayCoverage } from './pathway-coverage-store.js';
import { registeredPathwayJourney } from './pathway-journey-store.js';

const STAGE_IDS = PATHWAY_STAGES.map(stage => stage.id);
const STAGE_INDEX = Object.freeze(Object.fromEntries(STAGE_IDS.map((id,index) => [id,index])));

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
function journeyState(row = null) {
  if (!row) return null;
  const completedStages = contiguousCompletedStages(row);
  const explicit = row.currentStage ?? row.current_stage;
  const currentStage = STAGE_INDEX[explicit] != null ? explicit : (STAGE_IDS[completedStages.length] ?? 'mastery');
  return {
    currentStage,
    completedStages,
    mastered:completedStages.includes('mastery'),
    stageAttempts:Number(row.stageAttempts ?? row.stage_attempts ?? 0) || 0,
    stageCleanSuccesses:Number(row.stageCleanSuccesses ?? row.stage_clean_successes ?? 0) || 0
  };
}

export function buildWordPathwayStates({ occurrence, unitMastery = {}, globalMastery = {} } = {}) {
  if (!occurrence) return Object.fromEntries(VOCABULARY_PATHWAYS.map(pathway => [pathway.id,{ currentStage:'recognise', completedStages:[], needsPractice:false, mastered:false }]));
  return Object.fromEntries(VOCABULARY_PATHWAYS.map(pathway => [pathway.id,wordPathwayState({ pathwayId:pathway.id, occurrence, unitMastery, globalMastery })]));
}

export function buildUnitPathwayStates({ occurrences = [], unitMastery = {}, globalMastery = {}, coverageByPathway = null, journeyByPathway = null } = {}) {
  const unitNumber = occurrences.length ? occurrenceUnitNumber(occurrences[0]) : null;
  const registeredCoverage = unitNumber != null ? registeredPathwayCoverage(unitNumber) : null;
  const effectiveCoverage = coverageByPathway ?? registeredCoverage ?? {};
  const registeredJourney = unitNumber != null ? registeredPathwayJourney(unitNumber) : null;
  const effectiveJourney = journeyByPathway ?? registeredJourney ?? {};
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
      result[pathway.id] = {
        currentStage:'recognise', completedStages:[], needsPractice:false, mastered:false,
        available:false, coverageCount, totalCount,
        unavailableReason:coverage?.reason ?? (words.length ? null : 'no_serviceable_targets'),
        stageAttempts:0, stageCleanSuccesses:0
      };
      continue;
    }

    const journey = journeyState(effectiveJourney?.[pathway.id] ?? null);
    if (journey) {
      result[pathway.id] = {
        currentStage:journey.currentStage,
        completedStages:journey.completedStages,
        needsPractice:words.some(word => word.needsPractice),
        mastered:journey.mastered,
        available:true,
        coverageCount,
        totalCount,
        unavailableReason:null,
        stageAttempts:journey.stageAttempts,
        stageCleanSuccesses:journey.stageCleanSuccesses
      };
      continue;
    }

    const mastered = words.every(word => word.mastered);
    const lowestIndex = mastered ? STAGE_INDEX.mastery : Math.min(...words.map(word => STAGE_INDEX[word.currentStage] ?? 0));
    const currentStage = STAGE_IDS[lowestIndex] ?? 'recognise';
    const completedStages = mastered ? [...STAGE_IDS] : STAGE_IDS.filter((stageId,index) => index < lowestIndex && words.every(word => word.completedStages.includes(stageId)));
    result[pathway.id] = {
      currentStage,
      completedStages,
      needsPractice:words.some(word => word.needsPractice),
      mastered,
      available:true,
      coverageCount,
      totalCount,
      unavailableReason:null,
      stageAttempts:0,
      stageCleanSuccesses:0
    };
  }

  return result;
}

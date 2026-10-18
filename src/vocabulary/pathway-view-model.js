import { VOCABULARY_PATHWAYS, PATHWAY_STAGES, derivePathwayPlacement } from './pathway-model.js';
import { pathwayMasteryNeedsReview } from './pathway-progress.js';

const STAGE_IDS = PATHWAY_STAGES.map(stage => stage.id);
const STAGE_INDEX = Object.freeze(Object.fromEntries(STAGE_IDS.map((id,index) => [id,index])));

function unitRowFor(unitMastery, occurrenceId) { return unitMastery?.[occurrenceId] ?? {}; }
function globalRowFor(globalMastery, vocabularyId) { return globalMastery?.[vocabularyId] ?? {}; }
function contextualEvidence(row = {}) { return row?.contextualEvidence ?? row?.contextual_evidence ?? {}; }
function persistedPathway(row = {}, pathwayId) { return contextualEvidence(row)?.pathwayProgress?.[pathwayId] ?? contextualEvidence(row)?.pathway_progress?.[pathwayId] ?? null; }
function rawCompletedStages(progress = {}) {
  if (Array.isArray(progress?.completedStages)) return new Set(progress.completedStages.filter(id => STAGE_INDEX[id] != null));
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
  const hasStageEvidence = Object.keys(progress?.stages ?? {}).length > 0 || Array.isArray(progress?.completedStages);
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
function wordPathwayState({ pathwayId, occurrence, unitMastery, globalMastery }) {
  const unit = unitRowFor(unitMastery, occurrence.occurrenceId ?? occurrence.occurrence_id);
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

export function buildUnitPathwayStates({ occurrences = [], unitMastery = {}, globalMastery = {} } = {}) {
  const perWord = occurrences.map(occurrence => buildWordPathwayStates({ occurrence, unitMastery, globalMastery }));
  const result = {};
  for (const pathway of VOCABULARY_PATHWAYS) {
    const words = perWord.map(states => states[pathway.id]);
    if (!words.length) {
      result[pathway.id] = { currentStage:'recognise', completedStages:[], needsPractice:false, mastered:false };
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
      mastered
    };
  }
  return result;
}

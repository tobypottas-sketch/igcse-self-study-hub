import { PATHWAY_STAGE_IDS } from './vocabulary-pathway-contract.js';

const WINDOW_SIZE = 10;
const PASS_CLEAN_SUCCESSES = 8;

function normalizedCompletedStages(values = []) {
  const requested = new Set(Array.isArray(values) ? values.filter(stage => PATHWAY_STAGE_IDS.includes(stage)) : []);
  const completed = [];
  for (const stageId of PATHWAY_STAGE_IDS) {
    if (!requested.has(stageId)) break;
    completed.push(stageId);
  }
  return completed;
}

export function freshPathwayJourney({ currentStage = 'recognise', completedStages = [], stageAttempts = 0, stageCleanSuccesses = 0 } = {}) {
  const completed = normalizedCompletedStages(completedStages);
  const fallbackStage = completed.length >= PATHWAY_STAGE_IDS.length ? 'mastery' : (PATHWAY_STAGE_IDS[completed.length] ?? 'recognise');
  const safeStage = PATHWAY_STAGE_IDS.includes(currentStage) ? currentStage : fallbackStage;
  return {
    currentStage:safeStage,
    completedStages:completed,
    stageAttempts:Math.max(0, Number(stageAttempts) || 0),
    stageCleanSuccesses:Math.max(0, Number(stageCleanSuccesses) || 0)
  };
}

function isCountableAttempt(journey, attempt = {}) {
  const stageId = String(attempt.stageId ?? '');
  const servedStageId = String(attempt.servedStageId ?? stageId);
  return attempt.firstAttempt === true
    && stageId === journey.currentStage
    && servedStageId === stageId;
}

function isCleanSuccess(attempt = {}) {
  return attempt.correct === true
    && attempt.retryUsed !== true
    && String(attempt.supportLevel ?? 'none') === 'none';
}

function advanceStage(journey) {
  const index = PATHWAY_STAGE_IDS.indexOf(journey.currentStage);
  const completedStages = normalizedCompletedStages([...journey.completedStages, journey.currentStage]);
  const currentStage = index >= PATHWAY_STAGE_IDS.length - 1 ? 'mastery' : PATHWAY_STAGE_IDS[index + 1];
  return { currentStage, completedStages, stageAttempts:0, stageCleanSuccesses:0 };
}

export function applyPathwayJourneyAttempt(inputJourney = freshPathwayJourney(), attempt = {}) {
  const journey = freshPathwayJourney(inputJourney);
  if (!isCountableAttempt(journey, attempt)) return journey;

  const stageAttempts = journey.stageAttempts + 1;
  const stageCleanSuccesses = journey.stageCleanSuccesses + (isCleanSuccess(attempt) ? 1 : 0);
  if (stageAttempts < WINDOW_SIZE) return { ...journey, stageAttempts, stageCleanSuccesses };

  if (stageCleanSuccesses >= PASS_CLEAN_SUCCESSES) return advanceStage({ ...journey, stageAttempts, stageCleanSuccesses });
  return { ...journey, stageAttempts:0, stageCleanSuccesses:0 };
}

export function pathwayJourneyMastered(journey = {}) {
  return normalizedCompletedStages(journey.completedStages).includes('mastery');
}

export const PATHWAY_JOURNEY_WINDOW_SIZE = WINDOW_SIZE;
export const PATHWAY_JOURNEY_PASS_CLEAN_SUCCESSES = PASS_CLEAN_SUCCESSES;

import { PATHWAY_STAGES } from './pathway-model.js';

const STAGE_IDS = Object.freeze(PATHWAY_STAGES.map(stage => stage.id));

function stageState(completed = false, needsPractice = false) {
  return {
    completed,
    needsPractice,
    successes:0,
    cleanSuccesses:0,
    cleanUnassistedSuccesses:0,
    failures:0,
    contentIds:[],
    contextIds:[],
    promptKeys:[],
    operationIds:[],
    distinctPromptCount:0,
    distinctOperationCount:0
  };
}

function uniquePush(values, value) {
  if (value == null || value === '') return values;
  const text = String(value);
  return values.includes(text) ? values : [...values, text];
}

function normalizeCompletedStages(completedStages = []) {
  const requested = new Set(completedStages.filter(stage => STAGE_IDS.includes(stage)));
  const completed = [];
  for (const stageId of STAGE_IDS) {
    if (!requested.has(stageId)) break;
    completed.push(stageId);
  }
  return completed;
}

export function freshPathwayProgress({ completedStages = [], needsPracticeStage = null, reviewFailures = 0 } = {}) {
  const completed = new Set(normalizeCompletedStages(completedStages));
  const stages = Object.fromEntries(STAGE_IDS.map(stageId => [stageId, stageState(completed.has(stageId), stageId === needsPracticeStage)]));
  return {
    stages,
    supportRequested:Boolean(needsPracticeStage),
    reviewFailures:Math.max(0, Number(reviewFailures) || 0)
  };
}

export function currentPathwayStage(progress = {}) {
  const stages = progress?.stages ?? {};
  for (const stageId of STAGE_IDS) {
    if (!stages?.[stageId]?.completed) return stageId;
  }
  return 'mastery';
}

export function isPathwayStageUnlocked(progress = {}, stageId) {
  const index = STAGE_IDS.indexOf(stageId);
  if (index < 0) return false;
  if (index === 0) return true;
  return STAGE_IDS.slice(0,index).every(id => progress?.stages?.[id]?.completed === true);
}

function isClean(attempt = {}) {
  return attempt.correct === true && attempt.firstAttempt === true && attempt.retryUsed !== true;
}

function isUnassisted(attempt = {}) {
  return isClean(attempt) && String(attempt.supportLevel ?? 'none') === 'none';
}

function promptIdentity(attempt = {}) {
  return attempt.promptKey ?? attempt.contextId ?? attempt.contentId ?? null;
}

function recomputeDerived(stage) {
  return {
    ...stage,
    distinctPromptCount:stage.promptKeys.length,
    distinctOperationCount:stage.operationIds.length
  };
}

function canComplete(stageId, stage, attempt = {}) {
  if (stage.completed) return true;
  if (stageId === 'recognise' || stageId === 'match') return stage.cleanSuccesses >= 2 && stage.contentIds.length >= 2;
  if (stageId === 'apply') {
    if (stage.cleanSuccesses < 2) return false;
    return attempt.contextSensitive === true ? stage.contextIds.length >= 2 : stage.contentIds.length >= 2;
  }
  if (stageId === 'recall') return stage.cleanUnassistedSuccesses >= 2 && stage.contentIds.length >= 2;
  if (stageId === 'mastery') return stage.successes >= 3 && stage.cleanUnassistedSuccesses >= 2 && stage.promptKeys.length >= 2;
  return false;
}

export function applyPathwayAttempt(progress = freshPathwayProgress(), attempt = {}) {
  const stageId = String(attempt.stageId ?? '');
  if (!STAGE_IDS.includes(stageId) || !isPathwayStageUnlocked(progress, stageId)) return progress;

  const current = progress?.stages?.[stageId] ?? stageState();
  let nextStage = { ...current };
  let supportRequested = Boolean(progress.supportRequested);

  if (attempt.correct === true) {
    nextStage.successes += 1;
    nextStage.contentIds = uniquePush(nextStage.contentIds, attempt.contentId);
    nextStage.contextIds = uniquePush(nextStage.contextIds, attempt.contextId);
    nextStage.promptKeys = uniquePush(nextStage.promptKeys, promptIdentity(attempt));
    nextStage.operationIds = uniquePush(nextStage.operationIds, attempt.operation ?? attempt.activityType);
    if (isClean(attempt)) nextStage.cleanSuccesses += 1;
    if (isUnassisted(attempt)) nextStage.cleanUnassistedSuccesses += 1;
    if (nextStage.needsPractice) {
      nextStage.needsPractice = false;
      supportRequested = false;
    }
  } else {
    nextStage.failures += 1;
    if (nextStage.failures >= 2) {
      nextStage.needsPractice = true;
      supportRequested = true;
    }
  }

  nextStage = recomputeDerived(nextStage);
  if (canComplete(stageId, nextStage, attempt)) {
    nextStage.completed = true;
    nextStage.needsPractice = false;
    supportRequested = false;
  }

  return {
    ...progress,
    stages:{ ...progress.stages, [stageId]:nextStage },
    supportRequested
  };
}

export function pathwayMasteryNeedsReview(progress = {}) {
  return progress?.stages?.mastery?.completed === true && Number(progress?.reviewFailures ?? 0) > 0;
}

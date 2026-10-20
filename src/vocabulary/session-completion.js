const STAGE_IDS = Object.freeze(['recognise','match','apply','recall','mastery']);

function completedStages(state) {
  return new Set(Array.isArray(state?.completedStages) ? state.completedStages : []);
}

function safeNextStage(afterPathwayState, servedStageId) {
  const candidate = afterPathwayState?.currentStage;
  return STAGE_IDS.includes(candidate) ? candidate : (STAGE_IDS.includes(servedStageId) ? servedStageId : null);
}

export function deriveSessionCompletion({
  pathwayId = null,
  servedStageId = null,
  beforePathwayState = null,
  afterPathwayState = null
} = {}) {
  const fallback = {
    kind:'session_complete',
    pathwayId:pathwayId ?? null,
    clearedStageId:null,
    nextStageId:safeNextStage(afterPathwayState,servedStageId)
  };

  if (!pathwayId || !STAGE_IDS.includes(servedStageId) || !beforePathwayState || !afterPathwayState) return fallback;

  const beforeMastered = beforePathwayState.mastered === true;
  const afterMastered = afterPathwayState.mastered === true;
  const afterCompleted = completedStages(afterPathwayState);

  if (!beforeMastered && afterMastered && servedStageId === 'mastery' && afterCompleted.has('mastery')) {
    return { kind:'pathway_mastered', pathwayId, clearedStageId:'mastery', nextStageId:null };
  }

  const beforeCompleted = completedStages(beforePathwayState);
  if (!beforeCompleted.has(servedStageId) && afterCompleted.has(servedStageId)) {
    const nextStageId = safeNextStage(afterPathwayState,servedStageId);
    if (nextStageId !== servedStageId) return { kind:'stage_complete', pathwayId, clearedStageId:servedStageId, nextStageId };
  }

  return fallback;
}

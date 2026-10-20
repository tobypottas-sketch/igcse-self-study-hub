import { PATHWAY_STAGES, VOCABULARY_PATHWAYS } from './pathway-model.js';

const STAGE_INDEX = Object.freeze(Object.fromEntries(PATHWAY_STAGES.map((stage,index) => [stage.id,index])));
const PATHWAY_LABEL = Object.freeze(Object.fromEntries(VOCABULARY_PATHWAYS.map(pathway => [pathway.id,pathway.label])));

function stageLabel(stageId) {
  return PATHWAY_STAGES.find(stage => stage.id === stageId)?.label ?? null;
}

function starsFor(score, denominator, fixedMissionSize) {
  if (denominator !== fixedMissionSize) return null;
  if (score >= 9) return 3;
  if (score >= 7) return 2;
  if (score >= 5) return 1;
  return 0;
}

function supportCopyFor({ score, denominator, preview }) {
  if (preview) return 'Preview only — no progress has been saved.';
  const ratio = denominator > 0 ? score / denominator : 0;
  if (ratio >= .9) return 'Strong session. Your progress is saved.';
  if (ratio >= .5) return 'Good work — keep building. Your progress is saved.';
  return 'Good practice — a few words need another go.';
}

export function buildSessionFinishModel({
  summary = {},
  pathwayId = null,
  startStage = null,
  postPathwayState = null,
  preview = false,
  fixedMissionSize = 10
} = {}) {
  const score = Math.max(0,Number(summary?.strengthened) || 0);
  const denominator = Math.max(0,Number(summary?.practised) || 0);
  const needsAnotherLook = Math.max(0,Number(summary?.needsAnotherLook) || 0);
  const pathwayLabel = PATHWAY_LABEL[pathwayId] ?? null;
  const postStage = postPathwayState?.currentStage ?? startStage ?? null;
  const startIndex = STAGE_INDEX[startStage];
  const postIndex = STAGE_INDEX[postStage];

  let variant = 'session';
  if (!preview && postPathwayState?.mastered === true) variant = 'mastered';
  else if (!preview && startIndex != null && postIndex != null && postIndex > startIndex) variant = 'stage-complete';

  const startingStageLabel = stageLabel(startStage);
  const currentStageLabel = stageLabel(postStage);
  const stageNumber = postIndex == null ? null : postIndex + 1;
  const nextStageLabel = variant === 'stage-complete' ? currentStageLabel : null;

  let heading = 'Session complete';
  let kicker = 'SESSION COMPLETE';
  let primaryAction = { action:'continue-practice', label:'Continue studying' };

  if (variant === 'stage-complete') {
    heading = `${String(startingStageLabel ?? 'Stage').toUpperCase()} COMPLETE`;
    kicker = heading;
    primaryAction = { action:'continue-practice', label:`Start ${nextStageLabel}` };
  } else if (variant === 'mastered') {
    heading = `${String(pathwayLabel ?? 'Pathway').toUpperCase()} MASTERED`;
    kicker = 'PATHWAY MASTERED';
    primaryAction = null;
  }

  const stars = starsFor(score,denominator,fixedMissionSize);
  const supportCopy = supportCopyFor({ score, denominator, preview });
  const completedStages = Array.isArray(postPathwayState?.completedStages) ? [...postPathwayState.completedStages] : [];
  const starText = stars == null ? '' : stars === 0 ? ' No stars earned this time.' : ` ${stars} out of 3 stars earned.`;
  const stageText = variant === 'stage-complete'
    ? ` ${startingStageLabel} stage complete. ${nextStageLabel} unlocked.`
    : variant === 'mastered'
      ? ` ${pathwayLabel} pathway mastered.`
      : currentStageLabel
        ? ` Current stage: ${currentStageLabel}.`
        : '';

  return {
    variant,
    score,
    denominator,
    stars,
    needsAnotherLook,
    pathwayId,
    pathwayLabel,
    stageId:postStage,
    stageLabel:currentStageLabel,
    stageNumber,
    nextStageLabel,
    heading,
    kicker,
    supportCopy,
    primaryAction,
    showProgressSaved:!preview,
    completedStages,
    accessibleSummary:`${heading}. ${score} out of ${denominator} correct.${starText} ${score} words strengthened. ${needsAnotherLook} need another look.${stageText}`.replace(/\s+/g,' ').trim()
  };
}

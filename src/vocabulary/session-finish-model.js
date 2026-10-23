import { PATHWAY_STAGES, VOCABULARY_PATHWAYS } from './pathway-model.js';

const STAGE_INDEX = Object.freeze(Object.fromEntries(PATHWAY_STAGES.map((stage,index) => [stage.id,index])));
const PATHWAY_LABEL = Object.freeze(Object.fromEntries(VOCABULARY_PATHWAYS.map(pathway => [pathway.id,pathway.label])));

function safeCount(value) {
  return Math.max(0,Number(value) || 0);
}

function stageLabel(stageId) {
  return PATHWAY_STAGES.find(stage => stage.id === stageId)?.label ?? '';
}

function starsFor(score, denominator, fixedMissionSize) {
  if (denominator !== fixedMissionSize) return null;
  if (score >= 9) return 3;
  if (score >= 7) return 2;
  if (score >= 5) return 1;
  return 0;
}

function supportCopyFor({ score, denominator, preview, variant }) {
  if (preview) return 'Preview only — no progress has been saved.';
  if (variant === 'mastered') return 'You completed all five stages. Mixed Practice tests this pathway against everything else.';
  if (variant === 'stage-complete') return 'You cleared this stage.';

  const ratio = denominator > 0 ? score / denominator : 0;
  if (ratio >= 0.9) return 'Strong session. Your progress is saved.';
  if (ratio >= 0.5) return 'Good work — keep building. Your progress is saved.';
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
  const score = safeCount(summary.strengthened);
  const denominator = safeCount(summary.practised);
  const needsAnotherLook = safeCount(summary.needsAnotherLook);
  const pathwayLabel = PATHWAY_LABEL[pathwayId] ?? '';
  const startStageIndex = STAGE_INDEX[startStage];
  const postStage = postPathwayState?.currentStage ?? null;
  const postStageIndex = STAGE_INDEX[postStage];

  let variant = 'session';
  if (!preview && postPathwayState?.mastered === true) {
    variant = 'mastered';
  } else if (
    !preview &&
    startStageIndex != null &&
    postStageIndex != null &&
    postStageIndex > startStageIndex
  ) {
    variant = 'stage-complete';
  }

  const currentStageLabel = stageLabel(startStage);
  const nextStageLabel = variant === 'stage-complete' ? stageLabel(postStage) : null;
  const stars = starsFor(score,denominator,safeCount(fixedMissionSize));
  const completedStages = Array.isArray(postPathwayState?.completedStages)
    ? [...postPathwayState.completedStages]
    : [];

  let heading = 'Session complete';
  let kicker = 'SESSION COMPLETE';
  let primaryAction = { id:'continue-practice', label:'Continue studying' };

  if (variant === 'stage-complete') {
    heading = `${currentStageLabel.toUpperCase()} COMPLETE`;
    kicker = `Stage ${(startStageIndex ?? 0) + 1} cleared`;
    primaryAction = { id:'continue-practice', label:`Start ${nextStageLabel}` };
  } else if (variant === 'mastered') {
    heading = `${pathwayLabel.toUpperCase()} MASTERED`;
    kicker = 'PATHWAY COMPLETE';
    primaryAction = null;
  }
  // Mastery stays a valid stopping point (no forced Continue), but it now points at a real next step.
  const nextStep = variant === 'mastered' ? { id:'start-mixed-review', label:'Try Mixed Practice' } : null;

  const showProgressSaved = !preview;
  const supportCopy = supportCopyFor({ score, denominator, preview, variant });
  const stageNumber = startStageIndex == null ? null : startStageIndex + 1;
  const scoreText = `${score} out of ${denominator} correct`;
  const starText = stars == null ? '' : stars === 0 ? 'No stars earned' : `${stars} out of 3 stars earned`;
  const stageResultText = variant === 'stage-complete'
    ? `${currentStageLabel} stage complete. ${nextStageLabel} unlocked.`
    : variant === 'mastered'
      ? `${pathwayLabel} pathway mastered. All five stages complete. Next step: Mixed Practice.`
      : currentStageLabel
        ? `${currentStageLabel}, stage ${stageNumber} of ${PATHWAY_STAGES.length}.`
        : '';
  const accessibleSummary = [
    heading,
    scoreText,
    starText,
    `${score} words strengthened.`,
    `${needsAnotherLook} need another look.`,
    stageResultText
  ].filter(Boolean).join(' ');

  return {
    variant,
    score,
    denominator,
    stars,
    pathwayId,
    pathwayLabel,
    stageId:startStage,
    stageLabel:currentStageLabel,
    stageNumber,
    nextStageId:variant === 'stage-complete' ? postStage : null,
    nextStageLabel,
    heading,
    kicker,
    supportCopy,
    primaryAction,
    nextStep,
    celebration:variant === 'session' ? null : variant === 'mastered' ? 'mastered' : 'stage',
    showProgressSaved,
    completedStages,
    needsAnotherLook,
    accessibleSummary
  };
}

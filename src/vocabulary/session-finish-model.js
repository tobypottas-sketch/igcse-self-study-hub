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
  fixedMissionSize = 10,
  // Server-held Sets-of-10 progression. When supplied it decides the whole screen: { setNumber, setCount, score, next } where `next` is
  // describeNext(). The hidden per-word evidence (postPathwayState) is then not consulted for the visible stage at all.
  setInfo = null
} = {}) {
  if (setInfo) return buildSetFinishModel({ summary, pathwayId, startStage, preview, fixedMissionSize, setInfo });
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

const FOLLOW_UP_COPY = Object.freeze({
  consolidate: label => `Nearly there. One follow-up mission will lock in ${label}.`,
  recovery: label => `Let us rebuild ${label} with a recovery mission, then you move on.`,
  fresh: label => `One fresh ${label} mission next. You move on after it.`
});

// The completion screen for a mission that belongs to a Set. Every word on it comes from the server-held state (or its projection until the
// server's settlement returns): the stage just completed, the score out of 10, and the stage the Continue button will really start.
function buildSetFinishModel({ summary, pathwayId, startStage, preview, fixedMissionSize, setInfo }) {
  const score = Number.isInteger(setInfo.score) ? setInfo.score : safeCount(summary.strengthened);
  const denominator = fixedMissionSize;
  const needsAnotherLook = Math.max(0,denominator - score);
  const pathwayLabel = PATHWAY_LABEL[pathwayId] ?? '';
  const startStageIndex = STAGE_INDEX[startStage] ?? 0;
  const currentStageLabel = stageLabel(startStage);
  const next = preview ? null : setInfo.next ?? null;
  const stars = starsFor(score,denominator,safeCount(fixedMissionSize));
  const setNumber = setInfo.setNumber ?? 1; const setCount = setInfo.setCount ?? 1;
  const variant = !next ? 'session' : next.kind === 'pathway-complete' ? 'mastered' : next.kind === 'set-complete' ? 'set-complete' : next.kind === 'advance' ? 'stage-complete' : 'session';
  const nextStageLabel = next && next.stage ? stageLabel(next.stage) : null;
  const nextStageNumber = next && next.stage ? (STAGE_INDEX[next.stage] ?? 0) + 1 : null;

  let heading = 'Session complete'; let kicker = 'SESSION COMPLETE'; let supportCopy;
  let primaryAction = { id:'continue-practice', label:'Continue studying' };
  if (variant === 'stage-complete') {
    heading = `${currentStageLabel.toUpperCase()} COMPLETE`; kicker = `Stage ${startStageIndex + 1} cleared`;
    supportCopy = next.withSupport ? `On to ${nextStageLabel}. A few words will come back to you with support.` : 'You cleared this stage.';
  } else if (variant === 'set-complete') {
    heading = `SET ${setNumber} COMPLETE`; kicker = 'Set complete';
    supportCopy = `Set ${setNumber} moves to Maintain. Next up: Set ${setNumber + 1}.`;
  } else if (variant === 'mastered') {
    heading = `${pathwayLabel.toUpperCase()} FIRST PASS COMPLETE`; kicker = 'ALL SETS IN MAINTAIN';
    supportCopy = 'Every Set in this pathway is complete. Mixed Practice keeps them sharp.';
    primaryAction = null;
  } else if (next && FOLLOW_UP_COPY[next.kind]) {
    supportCopy = FOLLOW_UP_COPY[next.kind](stageLabel(next.stage));
  } else {
    supportCopy = supportCopyFor({ score, denominator, preview, variant:'session' });
  }
  if (preview) supportCopy = 'Preview only. No progress has been saved.';
  const nextLine = !next ? null
    : next.kind === 'pathway-complete' ? 'Next: Mixed Practice'
    : next.kind === 'set-complete' ? `Next: Set ${next.setNumber} · Recognise · Stage 1 of ${PATHWAY_STAGES.length}`
    : next.kind === 'advance' ? `Next: ${nextStageLabel} · Stage ${nextStageNumber} of ${PATHWAY_STAGES.length}`
    : `Next: ${nextStageLabel} ${next.kind === 'consolidate' ? 'follow-up' : next.kind === 'recovery' ? 'recovery' : 'fresh'} mission · Stage ${nextStageNumber} of ${PATHWAY_STAGES.length}`;
  const stageNumber = startStageIndex + 1;
  const scoreText = `${score} out of ${denominator} correct`;
  const starText = stars == null ? '' : stars === 0 ? 'No stars earned' : `${stars} out of 3 stars earned`;
  const completedStages = next && (next.kind === 'advance' || next.kind === 'set-complete' || next.kind === 'pathway-complete')
    ? [...new Set([...(setInfo.completedStages ?? []), startStage])] : [...(setInfo.completedStages ?? [])];
  return {
    variant, score, denominator, stars, pathwayId, pathwayLabel, stageId:startStage, stageLabel:currentStageLabel, stageNumber,
    setNumber, setCount,
    nextStageId:next?.stage ?? null, nextStageLabel, nextStageNumber, nextLine, nextKind:next?.kind ?? null,
    heading, kicker, supportCopy, primaryAction,
    nextStep:variant === 'mastered' ? { id:'start-mixed-review', label:'Try Mixed Practice' } : null,
    celebration:variant === 'session' ? null : variant === 'mastered' ? 'mastered' : 'stage',
    showProgressSaved:!preview, completedStages, needsAnotherLook,
    accessibleSummary:[heading, scoreText, starText, `${currentStageLabel}, Set ${setNumber} of ${setCount}.`, nextLine].filter(Boolean).join(' ')
  };
}

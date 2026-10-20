import fs from 'node:fs';

const path = 'src/vocabulary/app.js';
let source = fs.readFileSync(path,'utf8');
if (source.includes("from './session-reward.js'")) {
  console.log('Reward controller already patched');
  process.exit(0);
}

function replaceOnce(find,replacement,label) {
  if (!source.includes(find)) throw new Error(`${label} owner not found; refusing to patch`);
  source = source.replace(find,replacement);
}

replaceOnce(
  "import { deriveLearningStage } from './learning-stage.js';\n",
  "import { deriveLearningStage } from './learning-stage.js';\nimport { buildSessionRewardSummary } from './session-reward.js';\nimport { deriveSessionCompletion } from './session-completion.js';\n",
  'reward imports'
);

replaceOnce(
  "  globalMastery:{}, unitMastery:{}, session:null, queue:[], current:null, practiceFocus:null, pathwayId:null, pathwayStage:null, mixedReview:false,\n",
  "  globalMastery:{}, unitMastery:{}, session:null, queue:[], current:null, practiceFocus:null, pathwayId:null, pathwayStage:null, pathwayStartState:null, mixedReview:false,\n",
  'controller state'
);

replaceOnce(
  "  state.pathwayId = pathwayId; state.pathwayStage = stageId; state.practiceFocus = null; state.mixedReview = false;\n",
  "  state.pathwayId = pathwayId; state.pathwayStage = stageId; state.pathwayStartState = pathwayStates?.[pathwayId] ?? null; state.practiceFocus = null; state.mixedReview = false;\n",
  'pathway start snapshot'
);

replaceOnce(
  "  state.pathwayId = null; state.pathwayStage = null; state.mixedReview = true; state.practiceFocus = 'adaptive';\n",
  "  state.pathwayId = null; state.pathwayStage = null; state.pathwayStartState = null; state.mixedReview = true; state.practiceFocus = 'adaptive';\n",
  'mixed review reset'
);

replaceOnce(
  "  const timed = mode === 'timed';\n",
  "  const timed = mode === 'timed';\n  state.pathwayStartState = null;\n",
  'non-pathway session reset'
);

replaceOnce(
  "  state.pathwayId = null; state.pathwayStage = null; state.mixedReview = false; state.practiceFocus = null;\n",
  "  state.pathwayId = null; state.pathwayStage = null; state.pathwayStartState = null; state.mixedReview = false; state.practiceFocus = null;\n",
  'leave session reset'
);

const oldComplete = "  state.session = completeAttempt(state.session, { targetId:current.target.occurrenceId, evidence:{ correct:result.correct, recovery:recoverySucceeded, activityType:current.question.type }, completeTarget, strengthened:result.correct, movedToSecure:shouldUpdate && previousGlobalStatus !== 'secure' && nextGlobal.status === 'secure', mastered:shouldUpdate && previousGlobalStatus !== 'mastered' && nextGlobal.status === 'mastered', needsAnotherLook:completeTarget && !result.correct });\n";
const newComplete = "  state.session = completeAttempt(state.session, { targetId:current.target.occurrenceId, evidence:{ correct:result.correct, recovery:recoverySucceeded, activityType:current.question.type, firstAttemptCorrect:result.correct === true && current.initialError !== true && current.retry !== true && current.recovery !== true, correctedAfterRetry:result.correct === true && current.initialError === true && current.retry === true && current.recovery !== true }, completeTarget, strengthened:result.correct, movedToSecure:shouldUpdate && previousGlobalStatus !== 'secure' && nextGlobal.status === 'secure', mastered:shouldUpdate && previousGlobalStatus !== 'mastered' && nextGlobal.status === 'mastered', needsAnotherLook:completeTarget && !result.correct });\n";
replaceOnce(oldComplete,newComplete,'completeAttempt evidence');

const oldFinish = `function finishSession() {
  if (!state.session) return; if (state.session.mode === 'timed') state.session = expireSession(state.session, new Date()); clearClock(); const finished = state.session; state.current = null;
  if (!state.preview) void trackVocabularyEvent(state.client, { event_type:'exercise_result', activity_id:\`session_complete:\${finished.mode}:\${state.pathwayId ?? (state.mixedReview ? 'mixed-review' : finished.practiceMode ?? 'adaptive')}\`, skill:'vocabulary_mastery', mode:'practice', set_id:\`unit-\${finished.unitNumber}\`, score:finished.summary.strengthened, max_score:Math.max(1, finished.summary.practised), metadata:{ unit_number:finished.unitNumber, pathway_id:state.pathwayId, pathway_stage:state.pathwayStage, review_only:state.mixedReview } }).catch(() => {});
  renderSessionSummary(root, { durationMinutes:finished.durationMinutes, summary:finished.summary, practiceMode:finished.practiceMode ?? 'adaptive' }); decoratePreview();
}
`;
const newFinish = `function finishSession() {
  if (!state.session) return; if (state.session.mode === 'timed') state.session = expireSession(state.session, new Date()); clearClock(); const finished = state.session; state.current = null;
  if (!state.preview) void trackVocabularyEvent(state.client, { event_type:'exercise_result', activity_id:\`session_complete:\${finished.mode}:\${state.pathwayId ?? (state.mixedReview ? 'mixed-review' : finished.practiceMode ?? 'adaptive')}\`, skill:'vocabulary_mastery', mode:'practice', set_id:\`unit-\${finished.unitNumber}\`, score:finished.summary.strengthened, max_score:Math.max(1, finished.summary.practised), metadata:{ unit_number:finished.unitNumber, pathway_id:state.pathwayId, pathway_stage:state.pathwayStage, review_only:state.mixedReview } }).catch(() => {});
  const afterPathwayStates = state.pathwayId ? buildUnitPathwayStates({ occurrences:state.content?.occurrences ?? [], unitMastery:state.unitMastery, globalMastery:state.globalMastery }) : null;
  const afterPathwayState = state.pathwayId ? afterPathwayStates?.[state.pathwayId] ?? null : null;
  const reward = state.pathwayId ? buildSessionRewardSummary({ completedAttempts:finished.completedAttempts, sessionSummary:finished.summary, totalQuestions:finished.targetIds.length || 10, pathwayId:state.pathwayId, pathwayStage:state.pathwayStage }) : null;
  const completion = state.pathwayId ? deriveSessionCompletion({ pathwayId:state.pathwayId, servedStageId:state.pathwayStage, beforePathwayState:state.pathwayStartState, afterPathwayState }) : null;
  renderSessionSummary(root, { durationMinutes:finished.durationMinutes, summary:finished.summary, practiceMode:finished.practiceMode ?? 'adaptive', pathwayId:state.pathwayId, pathwayStage:state.pathwayStage, reward, completion }); decoratePreview();
}
`;
replaceOnce(oldFinish,newFinish,'finishSession');

fs.writeFileSync(path,source);
console.log('Patched vocabulary reward controller');

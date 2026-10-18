import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { freshPathwayProgress, applyPathwayAttempt } from '../src/vocabulary/pathway-progress.js';

// Release blocker: easier support must never manufacture evidence for the harder learner stage.
const edgeSource = fs.readFileSync(new URL('../supabase/functions/vocabulary-attempt-action/index.ts', import.meta.url),'utf8');

function supportedRecovery(stageId, servedStageId, overrides = {}) {
  return {
    stageId,
    servedStageId,
    correct:true,
    firstAttempt:true,
    retryUsed:false,
    supportLevel:'light',
    contentId:`support-${servedStageId}`,
    promptKey:`support-${servedStageId}`,
    activityType:'definition_to_word',
    operation:'meaning_recognition',
    ...overrides
  };
}

test('one-stage-lower support clears Needs practice without earning clean credit for the harder current stage', () => {
  let progress = freshPathwayProgress({ completedStages:['recognise'], needsPracticeStage:'match' });
  progress = applyPathwayAttempt(progress, supportedRecovery('match','recognise'));
  assert.equal(progress.stages.match.needsPractice,false);
  assert.equal(progress.supportRequested,false);
  assert.equal(progress.stages.match.successes,0);
  assert.equal(progress.stages.match.cleanSuccesses,0);
  assert.equal(progress.stages.match.completed,false);
});

test('Recall support cannot manufacture a Mastery success', () => {
  let progress = freshPathwayProgress({ completedStages:['recognise','match','apply','recall'], needsPracticeStage:'mastery' });
  progress = applyPathwayAttempt(progress, supportedRecovery('mastery','recall',{
    activityType:'spell_word', operation:'spelling_retrieval'
  }));
  assert.equal(progress.stages.mastery.needsPractice,false);
  assert.equal(progress.stages.mastery.successes,0);
  assert.equal(progress.stages.mastery.cleanUnassistedSuccesses,0);
  assert.equal(progress.stages.mastery.completed,false);
});

test('same-stage light support may record learning but never counts as clean or unassisted proof', () => {
  let progress = freshPathwayProgress({ completedStages:['recognise'] });
  progress = applyPathwayAttempt(progress, supportedRecovery('match','match',{ contentId:'same-stage-support' }));
  assert.equal(progress.stages.match.successes,1);
  assert.equal(progress.stages.match.cleanSuccesses,0);
  assert.equal(progress.stages.match.cleanUnassistedSuccesses,0);
  assert.equal(progress.stages.match.completed,false);
});

test('authoritative Edge forwards the actually served support stage into pathway progression', () => {
  assert.match(edgeSource,/applyPathwayAttempt\([\s\S]*?stageId:input\.pathwayStage,[\s\S]*?servedStageId:input\.servedPathwayStage,/);
});

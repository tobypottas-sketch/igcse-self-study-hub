import test from 'node:test';
import assert from 'node:assert/strict';

import { deriveSessionCompletion } from '../src/vocabulary/session-completion.js';

const match = { currentStage:'match', completedStages:['recognise'], mastered:false };

test('unchanged authoritative pathway state yields a normal session finish', () => {
  assert.deepEqual(deriveSessionCompletion({
    pathwayId:'meaning', servedStageId:'match', beforePathwayState:match, afterPathwayState:match
  }), {
    kind:'session_complete',
    pathwayId:'meaning',
    clearedStageId:null,
    nextStageId:'match'
  });
});

test('authoritative stage advancement yields stage complete and names the unlocked rung', () => {
  assert.deepEqual(deriveSessionCompletion({
    pathwayId:'meaning',
    servedStageId:'match',
    beforePathwayState:match,
    afterPathwayState:{ currentStage:'apply', completedStages:['recognise','match'], mastered:false }
  }), {
    kind:'stage_complete',
    pathwayId:'meaning',
    clearedStageId:'match',
    nextStageId:'apply'
  });
});

test('stars or local accuracy cannot manufacture stage completion', () => {
  assert.equal(deriveSessionCompletion({
    pathwayId:'meaning', servedStageId:'match', beforePathwayState:match, afterPathwayState:match,
    stars:3, firstAttemptCorrect:10
  }).kind, 'session_complete');
});

test('authoritative mastery of the final rung yields pathway mastered', () => {
  assert.deepEqual(deriveSessionCompletion({
    pathwayId:'meaning',
    servedStageId:'mastery',
    beforePathwayState:{ currentStage:'mastery', completedStages:['recognise','match','apply','recall'], mastered:false },
    afterPathwayState:{ currentStage:'mastery', completedStages:['recognise','match','apply','recall','mastery'], mastered:true }
  }), {
    kind:'pathway_mastered',
    pathwayId:'meaning',
    clearedStageId:'mastery',
    nextStageId:null
  });
});

test('reviewing an already-mastered pathway never produces another mastery celebration', () => {
  const mastered = { currentStage:'mastery', completedStages:['recognise','match','apply','recall','mastery'], mastered:true };
  assert.equal(deriveSessionCompletion({ pathwayId:'meaning', servedStageId:'mastery', beforePathwayState:mastered, afterPathwayState:mastered }).kind,'session_complete');
});

test('a stale or missing authoritative after-state fails safely to session complete', () => {
  assert.deepEqual(deriveSessionCompletion({ pathwayId:'meaning', servedStageId:'match', beforePathwayState:match, afterPathwayState:null }), {
    kind:'session_complete', pathwayId:'meaning', clearedStageId:null, nextStageId:'match'
  });
});

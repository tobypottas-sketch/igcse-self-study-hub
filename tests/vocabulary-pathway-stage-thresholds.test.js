import test from 'node:test';
import assert from 'node:assert/strict';
import { freshPathwayProgress, applyPathwayAttempt } from '../src/vocabulary/pathway-progress.js';

function clean(stageId, overrides = {}) {
  return {
    stageId,
    servedStageId:stageId,
    correct:true,
    firstAttempt:true,
    retryUsed:false,
    supportLevel:'none',
    contentId:'same-stable-item',
    promptKey:'same-stable-prompt',
    activityType:'test_activity',
    operation:'test_operation',
    ...overrides
  };
}

function applyMany(progress, attempts) {
  return attempts.reduce((state, attempt) => applyPathwayAttempt(state, attempt), progress);
}

test('Match follows the approved rule: two clean successes, without an extra distinct-content requirement', () => {
  const start = freshPathwayProgress({ completedStages:['recognise'] });
  const result = applyMany(start, [clean('match'), clean('match')]);
  assert.equal(result.stages.match.cleanSuccesses, 2);
  assert.equal(result.stages.match.contentIds.length, 1);
  assert.equal(result.stages.match.completed, true);
});

test('non-context Apply follows the approved rule: two clean successes; distinct contexts are only required for context-sensitive Apply', () => {
  const start = freshPathwayProgress({ completedStages:['recognise','match'] });
  const result = applyMany(start, [clean('apply',{ contextSensitive:false }), clean('apply',{ contextSensitive:false })]);
  assert.equal(result.stages.apply.cleanSuccesses, 2);
  assert.equal(result.stages.apply.contentIds.length, 1);
  assert.equal(result.stages.apply.completed, true);
});

test('Recall follows the approved rule: two clean unassisted successes, without an extra distinct-content requirement', () => {
  const start = freshPathwayProgress({ completedStages:['recognise','match','apply'] });
  const result = applyMany(start, [clean('recall'), clean('recall')]);
  assert.equal(result.stages.recall.cleanUnassistedSuccesses, 2);
  assert.equal(result.stages.recall.contentIds.length, 1);
  assert.equal(result.stages.recall.completed, true);
});

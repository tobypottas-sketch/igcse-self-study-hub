import test from 'node:test';
import assert from 'node:assert/strict';
import {
  freshPathwayProgress,
  applyPathwayAttempt,
  currentPathwayStage,
  isPathwayStageUnlocked,
  pathwayMasteryNeedsReview
} from '../src/vocabulary/pathway-progress.js';

function success(stageId, overrides = {}) {
  return {
    stageId,
    correct:true,
    firstAttempt:true,
    retryUsed:false,
    supportLevel:'none',
    contentId:`${stageId}-${Math.random()}`,
    activityType:'definition_to_word',
    operation:'recognition',
    ...overrides
  };
}

function applyMany(progress, attempts) {
  return attempts.reduce((state, attempt) => applyPathwayAttempt(state, attempt), progress);
}

test('fresh progress starts at Recognise with later stages locked', () => {
  const progress = freshPathwayProgress();
  assert.equal(currentPathwayStage(progress), 'recognise');
  assert.equal(isPathwayStageUnlocked(progress, 'recognise'), true);
  assert.equal(isPathwayStageUnlocked(progress, 'match'), false);
});

test('Recognise passes after two clean successes on distinct questions', () => {
  const progress = applyMany(freshPathwayProgress(), [
    success('recognise',{ contentId:'r1' }),
    success('recognise',{ contentId:'r2' })
  ]);
  assert.equal(progress.stages.recognise.completed, true);
  assert.equal(currentPathwayStage(progress), 'match');
});

test('repeating the same Recognise content cannot unlock Match', () => {
  const progress = applyMany(freshPathwayProgress(), [
    success('recognise',{ contentId:'same' }),
    success('recognise',{ contentId:'same' })
  ]);
  assert.equal(progress.stages.recognise.completed, false);
  assert.equal(currentPathwayStage(progress), 'recognise');
});

test('Match passes after two clean successes', () => {
  let progress = freshPathwayProgress({ completedStages:['recognise'] });
  progress = applyMany(progress, [success('match',{contentId:'m1'}), success('match',{contentId:'m2'})]);
  assert.equal(progress.stages.match.completed, true);
  assert.equal(currentPathwayStage(progress), 'apply');
});

test('Apply requires two clean successes and distinct context when context-sensitive', () => {
  let progress = freshPathwayProgress({ completedStages:['recognise','match'] });
  progress = applyMany(progress, [
    success('apply',{contentId:'a1', contextId:'ctx-1', contextSensitive:true}),
    success('apply',{contentId:'a2', contextId:'ctx-1', contextSensitive:true})
  ]);
  assert.equal(progress.stages.apply.completed, false);
  progress = applyPathwayAttempt(progress, success('apply',{contentId:'a3', contextId:'ctx-2', contextSensitive:true}));
  assert.equal(progress.stages.apply.completed, true);
});

test('Recall requires two clean unassisted successes', () => {
  let progress = freshPathwayProgress({ completedStages:['recognise','match','apply'] });
  progress = applyMany(progress, [
    success('recall',{contentId:'q1', supportLevel:'light'}),
    success('recall',{contentId:'q2'}),
    success('recall',{contentId:'q3'})
  ]);
  assert.equal(progress.stages.recall.completed, true);
  assert.equal(progress.stages.recall.cleanUnassistedSuccesses, 2);
});

test('supported retry recovery helps learning but cannot count as clean Recall proof', () => {
  let progress = freshPathwayProgress({ completedStages:['recognise','match','apply'] });
  progress = applyMany(progress, [
    success('recall',{contentId:'q1', firstAttempt:false, retryUsed:true, supportLevel:'light'}),
    success('recall',{contentId:'q2'})
  ]);
  assert.equal(progress.stages.recall.completed, false);
  assert.equal(progress.stages.recall.successes, 2);
  assert.equal(progress.stages.recall.cleanUnassistedSuccesses, 1);
});

test('Mastery needs three successes, two unassisted and two distinct prompts or contexts', () => {
  let progress = freshPathwayProgress({ completedStages:['recognise','match','apply','recall'] });
  progress = applyMany(progress, [
    success('mastery',{contentId:'p1', promptKey:'prompt-a', operation:'production'}),
    success('mastery',{contentId:'p2', promptKey:'prompt-a', operation:'production', supportLevel:'light'}),
    success('mastery',{contentId:'p3', promptKey:'prompt-b', operation:'production'})
  ]);
  assert.equal(progress.stages.mastery.completed, true);
  assert.equal(progress.stages.mastery.successes, 3);
  assert.equal(progress.stages.mastery.cleanUnassistedSuccesses, 2);
  assert.equal(progress.stages.mastery.distinctPromptCount, 2);
});

test('Mastery fails closed when three successes reuse only one prompt/context', () => {
  let progress = freshPathwayProgress({ completedStages:['recognise','match','apply','recall'] });
  progress = applyMany(progress, [1,2,3].map(index => success('mastery',{
    contentId:`different-ui-${index}`,
    promptKey:'same-prompt',
    operation:'production'
  })));
  assert.equal(progress.stages.mastery.completed, false);
});

test('matching and drag matching do not create fake pedagogical diversity', () => {
  let progress = freshPathwayProgress({ completedStages:['recognise','match','apply','recall'] });
  progress = applyMany(progress, [
    success('mastery',{contentId:'one', promptKey:'p1', activityType:'word_definition_match', operation:'semantic_match'}),
    success('mastery',{contentId:'two', promptKey:'p2', activityType:'drag_word_definition', operation:'semantic_match'}),
    success('mastery',{contentId:'three', promptKey:'p3', activityType:'drag_definition_word', operation:'semantic_match'})
  ]);
  assert.equal(progress.stages.mastery.distinctOperationCount, 1);
});

test('one wrong answer does not erase completed stages', () => {
  let progress = freshPathwayProgress({ completedStages:['recognise','match'] });
  progress = applyPathwayAttempt(progress, {
    stageId:'apply', correct:false, firstAttempt:true, retryUsed:false, supportLevel:'none', contentId:'bad-1', activityType:'drag_word_sentence', operation:'gap_use'
  });
  assert.equal(progress.stages.recognise.completed, true);
  assert.equal(progress.stages.match.completed, true);
  assert.equal(progress.stages.apply.needsPractice, false);
  assert.equal(currentPathwayStage(progress), 'apply');
});

test('repeated difficulty marks current stage Needs practice without relocking lower stages', () => {
  let progress = freshPathwayProgress({ completedStages:['recognise','match'] });
  for (const contentId of ['bad-1','bad-2']) {
    progress = applyPathwayAttempt(progress, {
      stageId:'apply', correct:false, firstAttempt:true, retryUsed:false, supportLevel:'none', contentId, activityType:'drag_word_sentence', operation:'gap_use'
    });
  }
  assert.equal(progress.stages.apply.needsPractice, true);
  assert.equal(progress.stages.recognise.completed, true);
  assert.equal(progress.stages.match.completed, true);
  assert.equal(progress.supportRequested, true);
});

test('successful recovery clears Needs practice but returns to the same current stage', () => {
  let progress = freshPathwayProgress({ completedStages:['recognise','match'], needsPracticeStage:'apply' });
  progress = applyPathwayAttempt(progress, success('apply',{contentId:'recovery', firstAttempt:false, retryUsed:true, supportLevel:'light'}));
  assert.equal(progress.stages.apply.needsPractice, false);
  assert.equal(currentPathwayStage(progress), 'apply');
});

test('completed lower stages can never be relocked by later mistakes', () => {
  let progress = freshPathwayProgress({ completedStages:['recognise','match','apply','recall'] });
  for (let i=0;i<4;i+=1) {
    progress = applyPathwayAttempt(progress, {stageId:'mastery', correct:false, firstAttempt:true, retryUsed:false, supportLevel:'none', contentId:`miss-${i}`, activityType:'rewrite_idea', operation:'production'});
  }
  for (const stageId of ['recognise','match','apply','recall']) assert.equal(progress.stages[stageId].completed, true);
  assert.equal(currentPathwayStage(progress), 'mastery');
});

test('mastered pathway can be marked as needing review without resetting the ladder', () => {
  const progress = freshPathwayProgress({ completedStages:['recognise','match','apply','recall','mastery'], reviewFailures:1 });
  assert.equal(pathwayMasteryNeedsReview(progress), true);
  assert.equal(progress.stages.mastery.completed, true);
  assert.equal(currentPathwayStage(progress), 'mastery');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { buildUnitPathwayStates } from '../src/vocabulary/pathway-view-model.js';

const occurrences = [
  { occurrenceId:'o1', vocabularyId:'v1' },
  { occurrenceId:'o2', vocabularyId:'v2' }
];

function stage(currentStage, completedStages = [], needsPractice = false) {
  return { currentStage, completedStages, needsPractice };
}

test('unit pathway state uses persisted pathway progress and takes the lowest current stage across words', () => {
  const unitMastery = {
    o1:{ contextualEvidence:{ pathwayProgress:{ meaning:stage('recall',['recognise','match','apply']) } } },
    o2:{ contextualEvidence:{ pathwayProgress:{ meaning:stage('apply',['recognise','match']) } } }
  };
  const result = buildUnitPathwayStates({ occurrences, unitMastery, globalMastery:{} });
  assert.equal(result.meaning.currentStage, 'apply');
  assert.deepEqual(result.meaning.completedStages, ['recognise','match']);
  assert.equal(result.meaning.mastered, false);
});

test('pathway is mastered only when every word has completed mastery', () => {
  const complete = ['recognise','match','apply','recall','mastery'];
  const unitMastery = {
    o1:{ contextualEvidence:{ pathwayProgress:{ spelling_recall:stage('mastery',complete) } } },
    o2:{ contextualEvidence:{ pathwayProgress:{ spelling_recall:stage('mastery',complete) } } }
  };
  const result = buildUnitPathwayStates({ occurrences, unitMastery, globalMastery:{} });
  assert.equal(result.spelling_recall.mastered, true);
  assert.equal(result.spelling_recall.currentStage, 'mastery');
  assert.deepEqual(result.spelling_recall.completedStages, complete);
});

test('needs-practice propagates if any word in the pathway currently needs support', () => {
  const unitMastery = {
    o1:{ contextualEvidence:{ pathwayProgress:{ context:stage('apply',['recognise','match'],true) } } },
    o2:{ contextualEvidence:{ pathwayProgress:{ context:stage('apply',['recognise','match']) } } }
  };
  const result = buildUnitPathwayStates({ occurrences, unitMastery, globalMastery:{} });
  assert.equal(result.context.needsPractice, true);
});

test('legacy evidence places returning students conservatively without mutating history', () => {
  const unitMastery = {
    o1:{ status:'secure', contextualEvidence:{ strandEvidence:{ meaning:4, context:4 } } },
    o2:{ status:'building', contextualEvidence:{ strandEvidence:{ meaning:2 } } }
  };
  const globalMastery = {
    v1:{ status:'secure', strandEvidence:{ meaning:4, context:4 } },
    v2:{ status:'building', strandEvidence:{ meaning:2 } }
  };
  const before = JSON.stringify({ unitMastery, globalMastery });
  const result = buildUnitPathwayStates({ occurrences, unitMastery, globalMastery });
  assert.equal(result.meaning.currentStage, 'match');
  assert.equal(JSON.stringify({ unitMastery, globalMastery }), before);
});

test('all six pathway states are returned even with no evidence', () => {
  const result = buildUnitPathwayStates({ occurrences, unitMastery:{}, globalMastery:{} });
  assert.deepEqual(Object.keys(result), ['meaning','context','word_families','paraphrasing','precision_use','spelling_recall']);
  for (const state of Object.values(result)) {
    assert.equal(state.currentStage, 'recognise');
    assert.deepEqual(state.completedStages, []);
    assert.equal(state.mastered, false);
  }
});

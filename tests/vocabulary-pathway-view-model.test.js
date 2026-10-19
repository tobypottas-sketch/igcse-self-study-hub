import test from 'node:test';
import assert from 'node:assert/strict';
import { buildUnitPathwayStates, targetsForPathwayStage } from '../src/vocabulary/pathway-view-model.js';

const occurrences = [
  { occurrenceId:'o1', vocabularyId:'v1' },
  { occurrenceId:'o2', vocabularyId:'v2' }
];

function stage(currentStage, completedStages = [], needsPractice = false) {
  return { currentStage, completedStages, needsPractice };
}

test('unit pathway state aggregates only the declared serviceable cohort', () => {
  const unitMastery = {
    o1:{ contextualEvidence:{ pathwayProgress:{ meaning:stage('recall',['recognise','match','apply']) } } },
    o2:{ contextualEvidence:{ pathwayProgress:{ meaning:stage('recognise',[]) } } }
  };
  const coverageByPathway = {
    meaning:{ available:true, occurrenceIds:['o1'], totalOccurrences:2 }
  };
  const result = buildUnitPathwayStates({ occurrences, unitMastery, globalMastery:{}, coverageByPathway });
  assert.equal(result.meaning.currentStage, 'recall');
  assert.deepEqual(result.meaning.completedStages, ['recognise','match','apply']);
  assert.equal(result.meaning.coverageCount,1);
  assert.equal(result.meaning.totalCount,2);
  assert.equal(result.meaning.available,true);
});

test('unsupported words do not freeze a pathway but remain visible in its coverage count', () => {
  const unitMastery = {
    o1:{ contextualEvidence:{ pathwayProgress:{ context:stage('apply',['recognise','match']) } } },
    o2:{ contextualEvidence:{ pathwayProgress:{ context:stage('recognise',[]) } } }
  };
  const result = buildUnitPathwayStates({
    occurrences,
    unitMastery,
    globalMastery:{},
    coverageByPathway:{ context:{ available:true, occurrenceIds:['o1'], totalOccurrences:2 } }
  });
  assert.equal(result.context.currentStage,'apply');
  assert.deepEqual(result.context.completedStages,['recognise','match']);
  assert.equal(result.context.coverageCount,1);
  assert.equal(result.context.totalCount,2);
});

test('an intentionally withheld pathway is unavailable instead of presenting a live stuck ladder', () => {
  const result = buildUnitPathwayStates({
    occurrences,
    unitMastery:{},
    globalMastery:{},
    coverageByPathway:{ precision_use:{ available:false, occurrenceIds:[], totalOccurrences:2, reason:'mastery_withheld' } }
  });
  assert.equal(result.precision_use.available,false);
  assert.equal(result.precision_use.coverageCount,0);
  assert.equal(result.precision_use.totalCount,2);
  assert.equal(result.precision_use.unavailableReason,'mastery_withheld');
});

test('pathway is mastered only when every serviceable word has completed mastery', () => {
  const complete = ['recognise','match','apply','recall','mastery'];
  const unitMastery = {
    o1:{ contextualEvidence:{ pathwayProgress:{ spelling_recall:stage('mastery',complete) } } },
    o2:{ contextualEvidence:{ pathwayProgress:{ spelling_recall:stage('recognise',[]) } } }
  };
  const result = buildUnitPathwayStates({
    occurrences,
    unitMastery,
    globalMastery:{},
    coverageByPathway:{ spelling_recall:{ available:true, occurrenceIds:['o1'], totalOccurrences:2 } }
  });
  assert.equal(result.spelling_recall.mastered, true);
  assert.equal(result.spelling_recall.currentStage, 'mastery');
  assert.deepEqual(result.spelling_recall.completedStages, complete);
});

test('needs-practice propagates only from serviceable words in the pathway', () => {
  const unitMastery = {
    o1:{ contextualEvidence:{ pathwayProgress:{ context:stage('apply',['recognise','match']) } } },
    o2:{ contextualEvidence:{ pathwayProgress:{ context:stage('recognise',[],true) } } }
  };
  const result = buildUnitPathwayStates({
    occurrences,
    unitMastery,
    globalMastery:{},
    coverageByPathway:{ context:{ available:true, occurrenceIds:['o1'], totalOccurrences:2 } }
  });
  assert.equal(result.context.needsPractice, false);
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
  assert.equal(result.meaning.currentStage, 'apply');
  assert.equal(JSON.stringify({ unitMastery, globalMastery }), before);
});

test('stale unit journey cannot override word-level pathway evidence', () => {
  const unitMastery = {
    o1:{ contextualEvidence:{ pathwayProgress:{ meaning:stage('match',['recognise']) } } },
    o2:{ contextualEvidence:{ pathwayProgress:{ meaning:stage('match',['recognise']) } } }
  };
  const result = buildUnitPathwayStates({
    occurrences,
    unitMastery,
    globalMastery:{},
    journeyByPathway:{ meaning:{ currentStage:'recognise', completedStages:[], stageAttempts:9, stageCleanSuccesses:9 } }
  });
  assert.equal(result.meaning.currentStage,'match');
  assert.deepEqual(result.meaning.completedStages,['recognise']);
});

test('a progressed word keeps the next rung reachable while another word is untouched', () => {
  const unitMastery = {
    o1:{ contextualEvidence:{ pathwayProgress:{ meaning:stage('match',['recognise']) } } },
    o2:{ contextualEvidence:{ pathwayProgress:{ meaning:stage('recognise',[]) } } }
  };
  const result = buildUnitPathwayStates({ occurrences, unitMastery, globalMastery:{} });
  assert.equal(result.meaning.currentStage,'match');
  assert.deepEqual(result.meaning.completedStages,['recognise']);
  assert.equal(result.meaning.mastered,false);
});

test('fixed pathway target selection includes only words whose real stage matches the selected rung', () => {
  const unitMastery = {
    o1:{ contextualEvidence:{ pathwayProgress:{ meaning:stage('match',['recognise']) } } },
    o2:{ contextualEvidence:{ pathwayProgress:{ meaning:stage('recognise',[]) } } }
  };
  const matchTargets = targetsForPathwayStage({ pathwayId:'meaning', stageId:'match', occurrences, unitMastery, globalMastery:{} });
  const recogniseTargets = targetsForPathwayStage({ pathwayId:'meaning', stageId:'recognise', occurrences, unitMastery, globalMastery:{} });
  assert.deepEqual(matchTargets.map(row => row.occurrenceId), ['o1']);
  assert.deepEqual(recogniseTargets.map(row => row.occurrenceId), ['o2']);
});

test('completed Mastery words are not re-served as live ladder targets', () => {
  const unitMastery = {
    o1:{ contextualEvidence:{ pathwayProgress:{ meaning:stage('mastery',['recognise','match','apply','recall','mastery']) } } },
    o2:{ contextualEvidence:{ pathwayProgress:{ meaning:stage('mastery',['recognise','match','apply','recall']) } } }
  };
  const targets = targetsForPathwayStage({ pathwayId:'meaning', stageId:'mastery', occurrences, unitMastery, globalMastery:{} });
  assert.deepEqual(targets.map(row => row.occurrenceId), ['o2']);
});

test('all six pathway states are returned even with no evidence', () => {
  const result = buildUnitPathwayStates({ occurrences, unitMastery:{}, globalMastery:{} });
  assert.deepEqual(Object.keys(result), ['meaning','context','word_families','paraphrasing','precision_use','spelling_recall']);
  for (const state of Object.values(result)) {
    assert.equal(state.currentStage, 'recognise');
    assert.deepEqual(state.completedStages, []);
    assert.equal(state.mastered, false);
    assert.equal(state.available,true);
  }
});

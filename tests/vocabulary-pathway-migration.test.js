import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWordPathwayStates } from '../src/vocabulary/pathway-view-model.js';

const occurrence = { occurrenceId:'o1', vocabularyId:'v1' };
const pathways = ['meaning','context','word_families','paraphrasing','precision_use','spelling_recall'];

function states({ unit = {}, global = {} } = {}) {
  return buildWordPathwayStates({ occurrence, unitMastery:{ o1:unit }, globalMastery:{ v1:global } });
}
function stageMap(value) { return Object.fromEntries(pathways.map(id => [id,value])); }
function completedProgress(completed, reviewFailures = 0) {
  const ids=['recognise','match','apply','recall','mastery'];
  return {
    stages:Object.fromEntries(ids.map(id => [id,{ completed:completed.includes(id), needsPractice:false }])),
    reviewFailures
  };
}

test('legacy new records with no pathway detail start every pathway at Recognise', () => {
  const result = states({ global:{ status:'new', strandEvidence:{} } });
  assert.deepEqual(Object.fromEntries(pathways.map(id => [id,result[id].currentStage])),stageMap('recognise'));
});

test('legacy building records place conservatively at Match rather than fabricating advanced pathway mastery', () => {
  const result = states({ global:{ status:'building', strandEvidence:{} } });
  assert.deepEqual(Object.fromEntries(pathways.map(id => [id,result[id].currentStage])),stageMap('match'));
  assert.ok(pathways.every(id => result[id].mastered === false));
});

test('legacy secure and mastered statuses alone place no pathway above Apply', () => {
  for (const status of ['secure','mastered']) {
    const result = states({ global:{ status, strandEvidence:{} } });
    assert.deepEqual(Object.fromEntries(pathways.map(id => [id,result[id].currentStage])),stageMap('apply'));
    assert.ok(pathways.every(id => result[id].mastered === false));
  }
});

test('missing contextual evidence is tolerated without rewriting or inventing pathway progress', () => {
  const result = states({ unit:{ status:'building' }, global:{ status:'new', strandEvidence:{} } });
  assert.equal(result.meaning.currentStage,'match');
  assert.equal(result.context.currentStage,'match');
});

test('malformed explicit currentStage cannot jump past incomplete prerequisite stages', () => {
  const unit = { contextualEvidence:{ pathwayProgress:{ meaning:{ currentStage:'mastery', stages:{ recognise:{ completed:true }, match:{ completed:false }, apply:{ completed:false }, recall:{ completed:false }, mastery:{ completed:false } } } } } };
  const result = states({ unit, global:{ status:'building', strandEvidence:{ meaning:4 } } });
  assert.equal(result.meaning.currentStage,'match');
  assert.equal(result.meaning.mastered,false);
});

test('partial pathway detail falls forward from contiguous completed stages only', () => {
  const unit = { contextualEvidence:{ pathwayProgress:{ context:{ stages:{ recognise:{ completed:true }, apply:{ completed:true } } } } } };
  const result = states({ unit, global:{ status:'secure', strandEvidence:{ context:8 } } });
  assert.equal(result.context.currentStage,'match');
  assert.deepEqual(result.context.completedStages,['recognise']);
});

test('existing mastered pathway review state remains mastered while surfacing review need', () => {
  const unit = { contextualEvidence:{ pathwayProgress:{ paraphrasing:completedProgress(['recognise','match','apply','recall','mastery'],1) } } };
  const result = states({ unit, global:{ status:'mastered', strandEvidence:{ paraphrasing:9 } } });
  assert.equal(result.paraphrasing.currentStage,'mastery');
  assert.equal(result.paraphrasing.mastered,true);
  assert.equal(result.paraphrasing.needsPractice,true);
});

test('mixed old and new records use authoritative pathway detail only for the pathway that owns it', () => {
  const unit = { status:'secure', contextualEvidence:{ pathwayProgress:{ meaning:completedProgress(['recognise','match','apply']) } } };
  const result = states({ unit, global:{ status:'secure', strandEvidence:{ meaning:8, context:8, recognition:8, paraphrasing:8 } } });
  assert.equal(result.meaning.currentStage,'recall');
  assert.equal(result.context.currentStage,'apply');
  assert.equal(result.word_families.currentStage,'apply');
  assert.equal(result.paraphrasing.currentStage,'apply');
});

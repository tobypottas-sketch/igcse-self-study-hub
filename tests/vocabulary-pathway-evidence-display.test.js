import { renderVocabularyUnit } from '../src/vocabulary/views.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildUnitPathwayStates } from '../src/vocabulary/pathway-view-model.js';

function stage({ completed = false, successes = 0, cleanSuccesses = 0, cleanUnassistedSuccesses = 0, failures = 0, promptKeys = [], contentIds = [], contextIds = [] } = {}) {
  return { completed, successes, cleanSuccesses, cleanUnassistedSuccesses, failures, promptKeys, contentIds, contextIds };
}

const occurrences = [
  { occurrenceId:'o1', vocabularyId:'v1', unitNumber:1 },
  { occurrenceId:'o2', vocabularyId:'v2', unitNumber:1 }
];
const unitMastery = {
  o1:{ contextualEvidence:{ pathwayProgress:{ meaning:{ stages:{
    recognise:stage({ completed:true, successes:2, cleanSuccesses:2, contentIds:['r1','r2'] }),
    match:stage({ successes:3, cleanSuccesses:2, failures:1, promptKeys:['p1','p2'], contentIds:['m1','m2'] })
  } } } } },
  o2:{ contextualEvidence:{ pathwayProgress:{ meaning:{ stages:{
    recognise:stage({ completed:true, successes:2, cleanSuccesses:2, contentIds:['r3','r4'] }),
    match:stage({ successes:1, cleanSuccesses:1, promptKeys:['p3'], contentIds:['m3'] })
  } } } } }
};

test('unit pathway state exposes accumulated evidence for the current stage', () => {
  const state = buildUnitPathwayStates({ occurrences, unitMastery, globalMastery:{} }).meaning;
  assert.equal(state.currentStage,'match');
  assert.equal(state.stageAttempts,5);
  assert.equal(state.stageCleanSuccesses,3);
  assert.equal(state.stageEvidence.stageId,'match');
  assert.equal(state.stageEvidence.activeWords,2);
  assert.equal(state.stageEvidence.attempts,5);
  assert.equal(state.stageEvidence.cleanSuccesses,3);
  assert.equal(state.stageEvidence.distinctPrompts,3);
  assert.equal(state.stageEvidence.progressPercent,75);
});

test('pathway cards render persistent current-stage evidence and an evidence meter in the first HTML', () => {
  const target = { innerHTML:'' };
  const evidence = { stageId:'match', attempts:12, cleanSuccesses:8, distinctPrompts:1, progressPercent:42 };
  renderVocabularyUnit(target,{ unitNumber:1, unitTitle:'Sports', contentReady:true, pathwayStates:{
    meaning:{ currentStage:'match', completedStages:['recognise'], stageEvidence:evidence },
    context:{ currentStage:'recognise', completedStages:[], stageEvidence:{ stageId:'recognise', attempts:0, cleanSuccesses:0, distinctPrompts:0, progressPercent:0 } },
    spelling_recall:{ available:false, stageEvidence:evidence }
  } });
  const html = target.innerHTML;
  assert.match(html,/data-pathway="meaning"[\s\S]*?<strong>Match evidence<\/strong><small>12 attempts · 8 clean · 1 prompt<\/small>[\s\S]*?aria-valuenow="42"[\s\S]*?--pathway-evidence:42%/);
  assert.match(html,/<strong>Recognise evidence<\/strong><small>No saved evidence yet<\/small>/);
  assert.equal((html.match(/vocab-pathway-card__evidence"/g) ?? []).length, 5, 'every available pathway has its evidence row; the unavailable one has none');
  assert.doesNotMatch(html,/data-pathway-evidence-shell/);
});

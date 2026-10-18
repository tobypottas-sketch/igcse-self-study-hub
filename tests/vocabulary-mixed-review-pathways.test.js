import test from 'node:test';
import assert from 'node:assert/strict';
import { unlockedReviewStages, planMixedReviewQuestion } from '../src/vocabulary/mixed-review.js';

const content = {
  occurrences:[{ occurrenceId:'o1', vocabularyId:'v1', senseId:'s1' }],
  items:[{ vocabularyId:'v1', term:'leisure', partOfSpeech:'noun', coreMeaning:'free time', senses:[{ senseId:'s1', meaning:'free time', misleadingDistractors:['salary','training','deadline'] }] }],
  contexts:[], activities:[],
  itemsById:{ v1:{ vocabularyId:'v1', term:'leisure', partOfSpeech:'noun', coreMeaning:'free time', senses:[{ senseId:'s1', meaning:'free time', misleadingDistractors:['salary','training','deadline'] }] } },
  contextsByOccurrence:{ o1:[] }
};
const target = content.occurrences[0];

function progress(completed = []) {
  const ids=['recognise','match','apply','recall','mastery'];
  return { stages:Object.fromEntries(ids.map(id => [id,{ completed:completed.includes(id), needsPractice:false }])) };
}

test('mixed review exposes only stages already unlocked for a persisted pathway', () => {
  const unit = { contextualEvidence:{ pathwayProgress:{ meaning:progress(['recognise','match']) } } };
  assert.deepEqual(unlockedReviewStages({ pathwayId:'meaning', unitMastery:unit, globalMastery:{} }), ['recognise','match','apply']);
});

test('mixed review never exposes a future locked stage', () => {
  const unit = { contextualEvidence:{ pathwayProgress:{ meaning:progress(['recognise']) } } };
  const unlocked = unlockedReviewStages({ pathwayId:'meaning', unitMastery:unit, globalMastery:{} });
  assert.deepEqual(unlocked, ['recognise','match']);
  assert.equal(unlocked.includes('recall'), false);
  assert.equal(unlocked.includes('mastery'), false);
});

test('legacy evidence conservatively unlocks only up to its derived placement', () => {
  const unit = { status:'building', contextualEvidence:{ strandEvidence:{ meaning:3 } } };
  assert.deepEqual(unlockedReviewStages({ pathwayId:'meaning', unitMastery:unit, globalMastery:{} }), ['recognise','match']);
});

test('mixed review returns the actual pathway and learner stage with the built question', () => {
  const unitMastery = { o1:{ contextualEvidence:{ pathwayProgress:{ meaning:progress([]) } } } };
  const result = planMixedReviewQuestion({ content, target, unitMastery, globalMastery:{}, seed:'mixed-1' });
  assert.equal(result.plan.pathwayId, 'meaning');
  assert.equal(result.plan.learnerStage, 'recognise');
  assert.ok(result.question);
});

test('mixed review fails closed rather than selecting a locked or fabricated question', () => {
  const empty = { ...content, items:[], itemsById:{} };
  assert.throws(() => planMixedReviewQuestion({ content:empty, target, unitMastery:{}, globalMastery:{}, seed:'mixed-2' }), /No suitable unlocked vocabulary review activity/);
});

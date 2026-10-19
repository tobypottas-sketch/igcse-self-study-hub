import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';

const VERBS = Object.freeze([
  'avoid','afford','deny','permit','arrange','urge','recommend',
  'demand','threaten','resent','regret','struggle','produce'
]);

function itemFor(term) {
  return unit1.items.find(item => item.term === term);
}

function occurrenceFor(item) {
  return unit1.occurrences.find(occurrence => occurrence.vocabularyId === item.vocabularyId);
}

function retrievalContextsFor(item) {
  const occurrence = occurrenceFor(item);
  return unit1.contexts.filter(context => context.occurrenceId === occurrence.occurrenceId && context.type === 'gap_fill');
}

test('all 13 Unit 1 verbs have complete morphology and at least four curated retrieval contexts', () => {
  for (const term of VERBS) {
    const item = itemFor(term);
    assert.ok(item, term);
    assert.equal(item.partOfSpeech, 'verb', term);
    const forms = item.senses[0].grammarForms;
    for (const key of ['base','thirdPerson','past','pastParticiple','ing']) {
      assert.ok(forms?.[key], `${term}:${key}`);
    }
    const contexts = retrievalContextsFor(item);
    assert.ok(contexts.length >= 4, `${term}: retrieval context count`);
    assert.ok(contexts.every(context => context.targetRewrite && context.acceptedAnswers?.[0] === context.targetRewrite), `${term}: exact retrieval answer`);
    assert.ok(new Set(contexts.map(context => context.targetRewrite.toLocaleLowerCase('en'))).size >= 3, `${term}: form variety`);
  }
});

test('Unit 1 explicitly covers the live grammar failures that triggered the repair', () => {
  const denyAnswers = retrievalContextsFor(itemFor('deny')).map(context => context.acceptedAnswers[0]);
  const arrangeAnswers = retrievalContextsFor(itemFor('arrange')).map(context => context.acceptedAnswers[0]);
  const recommendAnswers = retrievalContextsFor(itemFor('recommend')).map(context => context.acceptedAnswers[0]);
  assert.ok(denyAnswers.includes('denied'));
  assert.ok(arrangeAnswers.includes('arranged'));
  assert.ok(recommendAnswers.includes('recommends'));
  assert.ok(recommendAnswers.includes('recommended'));
});
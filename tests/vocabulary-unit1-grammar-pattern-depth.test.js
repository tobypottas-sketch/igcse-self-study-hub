import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';

const VERBS = [
  'avoid','afford','deny','permit','arrange','urge','recommend',
  'demand','threaten','resent','regret','struggle','produce'
];

const REQUIRED_PATTERNS = Object.freeze({
  avoid:['avoid + noun','avoid + -ing'],
  afford:['can/could afford + noun','can/could afford + to-infinitive'],
  deny:['deny + -ing','deny + that-clause'],
  permit:['permit + object + to-infinitive','permit + -ing','be permitted + to-infinitive'],
  arrange:['arrange + noun','arrange + to-infinitive','arrange for + object + to-infinitive'],
  urge:['urge + object + to-infinitive','be urged + to-infinitive'],
  recommend:['recommend + -ing','recommend + noun + to + person','recommend + that-clause'],
  demand:['demand + noun','demand + that-clause'],
  threaten:['threaten + noun','threaten + to-infinitive'],
  resent:['resent + noun','resent + -ing','resent + object + -ing'],
  regret:['regret + -ing','regret + that-clause'],
  struggle:['struggle + to-infinitive','struggle with + noun'],
  produce:['produce + noun','be produced + passive']
});

function itemFor(term) {
  return unit1.items.find(item => item.term === term);
}

function occurrenceFor(term) {
  const item = itemFor(term);
  return unit1.occurrences.find(row => row.vocabularyId === item?.vocabularyId);
}

function gapContextsFor(term) {
  const occurrence = occurrenceFor(term);
  const ids = new Set(occurrence?.contextIds ?? []);
  return unit1.contexts.filter(row => ids.has(row.contextId) && row.type === 'gap_fill');
}

test('all Unit 1 verbs expose explicit high-value grammar patterns', () => {
  for (const term of VERBS) {
    const sense = itemFor(term)?.senses?.[0];
    assert.ok(sense, `${term} should have an authored sense`);
    for (const pattern of REQUIRED_PATTERNS[term]) {
      assert.ok(sense.grammarPatterns?.includes(pattern), `${term} should include grammar pattern: ${pattern}`);
    }
  }
});

test('all Unit 1 verbs have at least six curated retrieval contexts spanning grammar patterns', () => {
  for (const term of VERBS) {
    const contexts = gapContextsFor(term);
    assert.ok(contexts.length >= 6, `${term} should have at least six curated retrieval contexts`);
    assert.ok(contexts.every(row => row.grammarPattern), `${term} retrieval contexts should identify their grammar pattern`);
    assert.ok(new Set(contexts.map(row => row.grammarPattern)).size >= 2, `${term} should practise at least two grammar patterns`);
  }
});

test('Unit 1 verb contexts deliberately mix tense, aspect, voice, and complement structure', () => {
  const deny = gapContextsFor('deny');
  assert.ok(deny.some(row => /had denied|have denied|has denied/i.test(row.text)), 'deny should include a perfect-form context');
  assert.ok(deny.some(row => row.grammarPattern === 'deny + that-clause'));
  assert.ok(deny.some(row => row.grammarPattern === 'deny + -ing'));

  const permit = gapContextsFor('permit');
  assert.ok(permit.some(row => row.grammarPattern === 'be permitted + to-infinitive'), 'permit should include a passive pattern');

  const recommend = gapContextsFor('recommend');
  assert.ok(recommend.some(row => row.grammarPattern === 'recommend + -ing'));
  assert.ok(recommend.some(row => row.grammarPattern === 'recommend + that-clause'));

  const afford = gapContextsFor('afford');
  assert.ok(afford.every(row => /afford/i.test(row.targetRewrite ?? '')), 'afford retrieval should stay on the ability-to-pay/time sense');
  assert.ok(afford.every(row => !/afforded .* access|afforded .* chance/i.test(row.text)), 'afford retrieval must not drift into the provide/opportunity sense');
});

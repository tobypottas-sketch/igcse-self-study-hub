import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { buildPathwayCoverage } from '../src/vocabulary/pathway-coverage.js';

function contentForPlanner(unit) {
  const content = {
    occurrences:unit.occurrences,
    items:unit.items,
    contexts:unit.contexts,
    activities:unit.activities,
    itemsById:Object.fromEntries(unit.items.map(item => [item.vocabularyId,item])),
    contextsByOccurrence:{}
  };
  for (const ctx of unit.contexts) (content.contextsByOccurrence[ctx.occurrenceId] ??= []).push(ctx);
  return content;
}

const content = contentForPlanner(unit1);

test('Unit 1 coverage excludes words that cannot traverse every declared rung', () => {
  const coverage = buildPathwayCoverage({ content });
  assert.ok(coverage.meaning.occurrenceIds.length > 0);
  assert.ok(coverage.meaning.occurrenceIds.length < content.occurrences.length,'Meaning should not pretend every Unit 1 word is serviceable');
  assert.equal(coverage.meaning.available,true);
  assert.equal(coverage.meaning.totalOccurrences,content.occurrences.length);
});

test('an explicitly withheld required rung makes that pathway unavailable for the unit', () => {
  const coverage = buildPathwayCoverage({ content });
  assert.equal(coverage.precision_use.available,false);
  assert.deepEqual(coverage.precision_use.occurrenceIds,[]);
  assert.equal(coverage.precision_use.reason,'required_rung_withheld');
  assert.ok(coverage.precision_use.withheldStages.includes('mastery'));
});

test('coverage is deterministic and never mutates content or mastery', () => {
  const before = JSON.stringify(content);
  const first = buildPathwayCoverage({ content });
  const second = buildPathwayCoverage({ content });
  assert.deepEqual(second,first);
  assert.equal(JSON.stringify(content),before);
});

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

test('a pathway with a withheld rung is unavailable; Precision & Use is complete now that its Mastery rung is live', () => {
  const coverage = buildPathwayCoverage({ content });
  assert.equal(coverage.precision_use.available,true);
  assert.ok(coverage.precision_use.occurrenceIds.length > 0);
  assert.deepEqual(coverage.precision_use.withheldStages ?? [],[]);
  // The withholding rule itself still holds: removing the Mastery content makes the pathway unavailable again.
  const stripped = { ...content, activities:content.activities.filter(row => row.activityData?.taskType !== 'improve_vocabulary') };
  const withoutContent = buildPathwayCoverage({ content:stripped });
  assert.equal(withoutContent.precision_use.available,false);
});

test('coverage is deterministic and never mutates content or mastery', () => {
  const before = JSON.stringify(content);
  const first = buildPathwayCoverage({ content });
  const second = buildPathwayCoverage({ content });
  assert.deepEqual(second,first);
  assert.equal(JSON.stringify(content),before);
});

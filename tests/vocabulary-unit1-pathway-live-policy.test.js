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
  for (const context of unit.contexts) (content.contextsByOccurrence[context.occurrenceId] ??= []).push(context);
  return content;
}

const content = contentForPlanner(unit1);

test('Unit 1 exposes only pathway banks that are currently defensible end to end', () => {
  const coverage = buildPathwayCoverage({ content });
  assert.equal(coverage.meaning.available,true);
  assert.equal(coverage.context.available,true);
  assert.equal(coverage.word_families.available,true);
  // The end-to-end cohort is constrained by the strictest real rung, not an inflated unit-wide count.
  const wordFamilyEndToEndCount = Math.min(...Object.values(coverage.word_families.stageCounts));
  assert.equal(coverage.word_families.occurrenceIds.length,wordFamilyEndToEndCount);
  assert.equal(coverage.spelling_recall.available,true);

  assert.equal(coverage.paraphrasing.available,false);
  assert.equal(coverage.paraphrasing.reason,'content_bank_incomplete');
  assert.equal(coverage.precision_use.available,true);
  assert.equal(coverage.precision_use.occurrenceIds.length,50);
});

test('diagnostic buildable counts preserve the curated 37-target Word Family cohort across every rung', () => {
  const coverage = buildPathwayCoverage({ content });
  assert.equal(coverage.word_families.stageCounts.recognise,37);
  assert.equal(coverage.word_families.stageCounts.match,37);
  assert.equal(coverage.word_families.stageCounts.apply,37);
  assert.equal(coverage.word_families.stageCounts.recall,37);
  assert.equal(coverage.word_families.stageCounts.mastery,37);
  assert.equal(coverage.word_families.occurrenceIds.length,37);
  assert.equal(coverage.paraphrasing.stageCounts.recognise,24);
  assert.equal(coverage.paraphrasing.stageCounts.match,12);
  assert.equal(coverage.precision_use.stageCounts.recognise,50);
});

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
  // Word Families is live for the 29 targets with an authored, reviewed, complete family (Job 9); the others are held back, never padded.
  assert.equal(coverage.word_families.available,true);
  assert.equal(coverage.word_families.occurrenceIds.length,29);
  assert.equal(coverage.spelling_recall.available,true);

  assert.equal(coverage.paraphrasing.available,false);
  assert.equal(coverage.paraphrasing.reason,'stage_below_minimum');
  assert.equal(coverage.precision_use.available,true);
  assert.equal(coverage.precision_use.occurrenceIds.length,50);
});

test('diagnostic buildable counts: Word Families serves the 29 authored families at Mastery; Paraphrasing and Precision counts are unchanged', () => {
  const coverage = buildPathwayCoverage({ content });
  assert.equal(coverage.word_families.stageCounts.recognise,29);
  assert.equal(coverage.word_families.stageCounts.mastery,29);
  assert.equal(coverage.word_families.occurrenceIds.length,29);
  assert.equal(coverage.paraphrasing.stageCounts.recognise,12);
  assert.equal(coverage.paraphrasing.stageCounts.match,12);
  assert.equal(coverage.precision_use.stageCounts.recognise,50);
});

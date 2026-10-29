import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { coverageFromServerSetMembers } from '../src/vocabulary/data.js';

const dataSource = await readFile(new URL('../src/vocabulary/data.js', import.meta.url), 'utf8');

function occurrences(count = 50) {
  return Array.from({ length:count }, (_, index) => ({ occurrence_id:`occ-${index + 1}` }));
}

function setMembers(pathwayId, setCount) {
  return Array.from({ length:setCount * 10 }, (_, index) => ({
    pathway_id:pathwayId,
    set_number:Math.floor(index / 10) + 1,
    position:(index % 10) + 1,
    occurrence_id:`occ-${index + 1}`
  }));
}

test('student unit loading uses published server Set membership instead of client readiness evaluation', () => {
  assert.match(dataSource, /client\.from\('vocabulary_set_members'\)/);
  assert.match(dataSource, /coverageFromServerSetMembers/);
  assert.doesNotMatch(dataSource, /buildPathwayCoverage/);
});

test('published Set membership builds the student pathway state without unlocking unpublished pathways', () => {
  const rows = [
    ...setMembers('meaning', 4),
    ...setMembers('context', 4),
    ...setMembers('word_families', 2),
    ...setMembers('precision_use', 5),
    ...setMembers('spelling_recall', 5)
  ];
  const coverage = coverageFromServerSetMembers(rows, occurrences());

  assert.deepEqual(
    Object.fromEntries(Object.entries(coverage).map(([id, value]) => [id, { available:value.available, setCount:value.setCount, occurrenceCount:value.occurrenceIds.length }])),
    {
      meaning:{ available:true, setCount:4, occurrenceCount:40 },
      context:{ available:true, setCount:4, occurrenceCount:40 },
      word_families:{ available:true, setCount:2, occurrenceCount:20 },
      paraphrasing:{ available:false, setCount:0, occurrenceCount:0 },
      precision_use:{ available:true, setCount:5, occurrenceCount:50 },
      spelling_recall:{ available:true, setCount:5, occurrenceCount:50 }
    }
  );
  assert.equal(coverage.paraphrasing.reason, 'no_published_sets');
});

test('server membership cannot make unknown or non-live occurrences available to students', () => {
  const rows = [
    ...setMembers('meaning', 1),
    { pathway_id:'meaning', set_number:2, position:1, occurrence_id:'not-live' },
    { pathway_id:'not-a-pathway', set_number:1, position:1, occurrence_id:'occ-1' }
  ];
  const coverage = coverageFromServerSetMembers(rows, occurrences(10));

  assert.equal(coverage.meaning.available, true);
  assert.equal(coverage.meaning.setCount, 1);
  assert.equal(coverage.meaning.occurrenceIds.length, 10);
  assert.equal(coverage.meaning.occurrenceIds.includes('not-live'), false);
});

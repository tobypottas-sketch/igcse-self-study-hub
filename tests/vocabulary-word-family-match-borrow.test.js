import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { buildPathwayActivity } from '../src/vocabulary/pathway-activity-builder.js';

test('incredible has a clean family and Word Family Match borrows wrong forms from other families', () => {
  const item = unit1.items.find(row => row.term === 'incredible');
  assert.deepEqual(item.wordFamily, ['incredibly']);
  const occurrence = unit1.occurrences.find(row => row.vocabularyId === item.vocabularyId);
  for (let n = 0; n < 12; n += 1) {
    const q = buildPathwayActivity({
      activityType:'word_family_match', occurrence, item,
      contexts:unit1.contexts.filter(row => row.occurrenceId === occurrence.occurrenceId),
      unitActivities:unit1.activities, unitItems:unit1.items, unitContexts:unit1.contexts, unitOccurrences:unit1.occurrences,
      mastery:{ status:'building' }, readinessStage:'building', seed:`borrow:${n}`
    });
    const options = q.pairs.map(pair => pair.definition);
    assert.ok(options.length >= 3, options.join(','));
    assert.ok(!options.some(option => /credib/.test(option) && !/incredi/.test(option)), `different-meaning form offered: ${options.join(',')}`);
    assert.equal(new Set(options).size, options.length);
  }
});

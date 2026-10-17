import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCuratedUnit } from '../content/vocabulary/build-unit.js';
import { validateUnit } from '../content/vocabulary/schema.js';

function entry(index) {
  return {
    term:`term ${index}`,
    partOfSpeech:'noun',
    meaning:`meaning ${index}`,
    paraphrases:[`equivalent ${index}`],
    distractors:[`wrong ${index}`],
    meaningSentence:`The text uses term ${index} in context.`,
    paraphrase:{ source:`source ${index}`, sentence:`The text uses source ${index} in context.` },
    production:{ source:`source two ${index}`, sentence:`A learner sees source two ${index} in a new context.` }
  };
}

test('compact authoring expands to the canonical approved unit shape', () => {
  const unit = buildCuratedUnit({
    unitNumber:1,
    unitTitle:'Sports and Free Time',
    status:'approved',
    source:'0511_UNIT_1.docx',
    entries:Array.from({ length:50 }, (_, index) => entry(index + 1))
  });
  assert.equal(unit.items.length, 50);
  assert.equal(unit.occurrences.length, 50);
  assert.equal(unit.contexts.length, 150);
  assert.equal(unit.occurrences.filter(row => row.setNumber === 1).length, 10);
  assert.equal(unit.occurrences.filter(row => row.setNumber === 5).length, 10);
  assert.equal(unit.items[0].status, 'approved');
  assert.equal(unit.occurrences[0].contextIds.length, 3);
  assert.equal(validateUnit(unit).ok, true);
});

test('authoring keeps multi-word terms as one vocabulary target', () => {
  const entries = Array.from({ length:50 }, (_, index) => entry(index + 1));
  entries[0] = { ...entry(1), term:'goal-oriented' };
  const unit = buildCuratedUnit({ unitNumber:1, unitTitle:'Sports and Free Time', status:'approved', source:'source.docx', entries });
  assert.equal(unit.items[0].term, 'goal-oriented');
  assert.equal(unit.items[0].vocabularyId, 'vocab_goal_oriented');
  assert.equal(unit.occurrences[0].occurrenceId, 'u1_01_goal_oriented');
});

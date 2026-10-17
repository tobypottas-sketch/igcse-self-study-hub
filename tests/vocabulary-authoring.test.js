import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCuratedUnit } from '../content/vocabulary/build-unit.js';
import { promoteVocabularyUnit } from '../content/vocabulary/promote-unit.js';
import unit1 from '../content/vocabulary/units/unit-01.js';
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
  assert.deepEqual(unit.activities, []);
  assert.equal(unit.occurrences.filter(row => row.setNumber === 1).length, 10);
  assert.equal(unit.occurrences.filter(row => row.setNumber === 5).length, 10);
  assert.equal(unit.items[0].status, 'approved');
  assert.equal(unit.occurrences[0].contextIds.length, 3);
  assert.equal(validateUnit(unit).ok, true);
});

test('compact authoring preserves curated unit-level activity records', () => {
  const activities = [{
    activityContentId:'u1_phrase_01', unitNumber:1, contentType:'phrase_set', status:'approved',
    activityData:{ originalPhrase:'free time', equivalentPhrase:'leisure time', acceptedVariants:['spare time'], chunks:['leisure','time'], commonMeaningDistortions:['working time'], linkedVocabularyIds:['vocab_term_1'], primaryEvidenceTargetId:'vocab_term_1' }
  }];
  const unit = buildCuratedUnit({
    unitNumber:1, unitTitle:'Sports and Free Time', status:'approved', source:'source.docx',
    entries:Array.from({ length:50 }, (_, index) => entry(index + 1)), activities
  });
  assert.deepEqual(unit.activities, activities);
});

test('promotion moves curated unit activities to live alongside items contexts and occurrences', () => {
  const unit = buildCuratedUnit({
    unitNumber:1, unitTitle:'Sports and Free Time', status:'approved', source:'source.docx',
    entries:Array.from({ length:50 }, (_, index) => entry(index + 1)),
    activities:[{ activityContentId:'u1_phrase_01', unitNumber:1, contentType:'phrase_set', status:'approved', activityData:{} }]
  });
  const live = promoteVocabularyUnit(unit);
  assert.equal(live.status, 'live');
  assert.equal(live.activities[0].status, 'live');
});

test('authoring keeps multi-word terms as one vocabulary target', () => {
  const entries = Array.from({ length:50 }, (_, index) => entry(index + 1));
  entries[0] = { ...entry(1), term:'goal-oriented' };
  const unit = buildCuratedUnit({ unitNumber:1, unitTitle:'Sports and Free Time', status:'approved', source:'source.docx', entries });
  assert.equal(unit.items[0].term, 'goal-oriented');
  assert.equal(unit.items[0].vocabularyId, 'vocab_goal_oriented');
  assert.equal(unit.occurrences[0].occurrenceId, 'u1_01_goal_oriented');
});

test('authored Unit 1 is complete, source-aligned, and strict-validator clean', () => {
  assert.equal(unit1.status, 'approved');
  assert.equal(unit1.source, '0511_UNIT_1.docx');
  assert.equal(unit1.items.length, 50);
  assert.equal(unit1.contexts.length, 150);
  assert.deepEqual(unit1.items.map(item => item.term), [
    'leisure','preference','avoid','afford','deny','permit','arrange','urge','recommend','demand',
    'threaten','resent','regret','unfamiliar','racquet','opponent','intense','tournament','determined','discipline',
    'goal-oriented','achievement','elite','overwhelming','generation','challenge','solution','pastime','feat','regardless',
    'monetary','estimated','struggle','minimum','championship','competitor','relatively','patience','atmosphere','incredible',
    'criteria','historic','selection','produce','craftspeople','significant','expansion','reputation','reasonable','antiques'
  ]);
  const result = validateUnit(unit1);
  assert.equal(result.ok, true, result.errors.join('\n'));
});

test('every authored Unit 1 replacement source occurs in its curated sentence', () => {
  for (const context of unit1.contexts.filter(row => row.targetRewrite)) {
    assert.match(context.text.toLocaleLowerCase('en'), new RegExp(context.targetRewrite.toLocaleLowerCase('en').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

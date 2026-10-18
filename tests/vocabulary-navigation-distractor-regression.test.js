import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildActivity } from '../src/vocabulary/activity-builder.js';
import { loadVocabularyUnit, loadStudentMastery } from '../src/vocabulary/data.js';

const permit = {
  vocabularyId:'vocab_permit', term:'permit', partOfSpeech:'verb', coreMeaning:'to allow something to happen',
  senses:[{ senseId:'permit_1', meaning:'to allow something to happen', acceptedParaphrases:['allow','give permission for'], misleadingDistractors:['prevent','demand','resent'] }]
};
const occurrence = { occurrenceId:'u1_6_permit', vocabularyId:'vocab_permit', unitNumber:1, unitTitle:'Sports and Free Time', senseId:'permit_1' };
const contexts = [{ contextId:'permit_meaning', vocabularyId:'vocab_permit', occurrenceId:'u1_6_permit', senseId:'permit_1', type:'meaning_context', text:'The club does not permit spectators to enter the training area.', acceptedAnswers:['allow'] }];
const unrelated = [
  { vocabularyId:'vocab_competitor', term:'competitor', partOfSpeech:'noun', coreMeaning:'a person taking part in a competition', senses:[{ senseId:'competitor_1', acceptedParaphrases:['contestant'] }] },
  { vocabularyId:'vocab_monetary', term:'monetary', partOfSpeech:'adjective', coreMeaning:'related to money', senses:[{ senseId:'monetary_1', acceptedParaphrases:['financial'] }] },
  { vocabularyId:'vocab_challenge', term:'challenge', partOfSpeech:'noun', coreMeaning:'a difficult task', senses:[{ senseId:'challenge_1', acceptedParaphrases:['test'] }] }
];

for (const activityType of ['meaning_match','meaning_in_context']) {
  test(`${activityType} prefers curated misconception distractors over unrelated unit synonyms`, () => {
    const mastery = activityType === 'meaning_match' ? { status:'new', strandEvidence:{} } : { status:'building', strandEvidence:{ meaning:3, context:2 } };
    const question = buildActivity({ activityType, occurrence, item:permit, contexts, unitItems:[permit, ...unrelated], mastery, seed:'permit-regression' });
    assert.equal(question.options.includes('allow'), true);
    for (const distractor of ['prevent','demand','resent']) assert.equal(question.options.includes(distractor), true, `expected curated distractor ${distractor}`);
    for (const weak of ['contestant','financial','test']) assert.equal(question.options.includes(weak), false, `unrelated distractor ${weak} should not appear`);
  });
}

function queryResult(data, onSelect = null) {
  return {
    select(columns) { onSelect?.(columns); return this; },
    eq() { return this; }, in() { return this; }, order() { return this; },
    then(resolve) { return Promise.resolve({ data, error:null }).then(resolve); }
  };
}

test('unit content and mastery loaders reuse preloaded dashboard occurrences instead of querying occurrences twice', async () => {
  const calls = [];
  const preloaded = [{ occurrence_id:'u1_6_permit', vocabulary_id:'vocab_permit', unit_number:1, unit_title:'Sports and Free Time', set_number:1, position_in_unit:6, sense_id:'permit_1', status:'live' }];
  const client = {
    from(name) {
      calls.push(name);
      if (name === 'vocabulary_unit_occurrences') throw new Error('preloaded occurrences should eliminate this query');
      if (name === 'vocabulary_items') return queryResult([permit]);
      if (name === 'vocabulary_contexts') return queryResult(contexts.map(row => ({ context_id:row.contextId, vocabulary_id:row.vocabularyId, occurrence_id:row.occurrenceId, sense_id:row.senseId, context_type:row.type, prompt_text:row.text, accepted_answers:row.acceptedAnswers, status:'live' })));
      if (name === 'vocabulary_unit_activities') return queryResult([]);
      if (name === 'vocabulary_global_mastery') return queryResult([]);
      if (name === 'vocabulary_unit_mastery') return queryResult([]);
      throw new Error(`Unexpected table ${name}`);
    }
  };
  const [unit, mastery] = await Promise.all([
    loadVocabularyUnit(client, 1, { occurrences:preloaded }),
    loadStudentMastery(client, 1, { occurrences:preloaded })
  ]);
  assert.equal(unit.occurrences.length, 1);
  assert.deepEqual(mastery, { global:[], unit:[] });
  assert.equal(calls.includes('vocabulary_unit_occurrences'), false);
});

test('dashboard occurrence payload includes sense_id so opening a unit can reuse it immediately', () => {
  const source = fs.readFileSync(new URL('../src/vocabulary/data.js', import.meta.url), 'utf8');
  const dashboard = source.match(/export async function loadVocabularyDashboard[\s\S]*?export async function loadVocabularyUnit/);
  assert.ok(dashboard);
  assert.match(dashboard[0], /select\(['"][^'"]*sense_id/);
});

test('openUnit passes dashboard occurrences into both unit loaders', () => {
  const source = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');
  const helper = source.match(/async function openUnit\(unitNumber\) \{([\s\S]*?)\n\}/);
  assert.ok(helper);
  assert.match(helper[1], /state\.dashboard\.occurrences/);
  assert.match(helper[1], /loadVocabularyUnit\(state\.client, unitNumber, \{ occurrences:/);
  assert.match(helper[1], /loadStudentMastery\(state\.client, unitNumber, \{ occurrences:/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadVocabularyUnit, loadStudentMastery, submitVocabularyAttempt } from '../src/vocabulary/data.js';

function queryResult(data) {
  return {
    select() { return this; },
    eq() { return this; },
    in() { return this; },
    order() { return this; },
    then(resolve) { return Promise.resolve({ data, error:null }).then(resolve); }
  };
}

test('student vocabulary data adapter loads live content and mastery without writing mastery directly', async () => {
  const calls = [];
  const client = {
    from(name) {
      calls.push(name);
      if (name === 'vocabulary_unit_occurrences') return queryResult([{ occurrence_id:'u1_1', vocabulary_id:'v1', unit_number:1, status:'live' }]);
      if (name === 'vocabulary_items') return queryResult([{ vocabulary_id:'v1', term:'leisure', status:'live' }]);
      if (name === 'vocabulary_contexts') return queryResult([{ context_id:'c1', occurrence_id:'u1_1', status:'live' }]);
      if (name === 'vocabulary_unit_activities') return queryResult([{ activity_content_id:'a1', unit_number:1, status:'live' }]);
      if (name === 'vocabulary_global_mastery') return queryResult([{ vocabulary_id:'v1', status:'building' }]);
      if (name === 'vocabulary_unit_mastery') return queryResult([{ occurrence_id:'u1_1', status:'building' }]);
      throw new Error(`Unexpected table ${name}`);
    }
  };
  const unit = await loadVocabularyUnit(client, 1);
  assert.equal(unit.occurrences.length, 1);
  assert.equal(unit.items.length, 1);
  assert.equal(unit.contexts.length, 1);
  assert.equal(unit.activities.length, 1);
  const mastery = await loadStudentMastery(client, 1);
  assert.equal(mastery.global.length, 1);
  assert.equal(mastery.unit.length, 1);
  assert.ok(calls.includes('vocabulary_global_mastery'));
});

test('legacy context attempt submission invokes Edge Function and never supplies a student identity field', async () => {
  let invocation;
  const client = { functions:{ invoke:async (name, options) => { invocation = { name, options }; return { data:{ ok:true }, error:null }; } } };
  await submitVocabularyAttempt(client, { occurrenceId:'u1_1', contextId:'c1', questionType:'meaning_match', rawAnswer:'leisure', studentId:'should-not-pass', firstAttempt:true });
  assert.equal(invocation.name, 'vocabulary-attempt-action');
  assert.equal('studentId' in invocation.options.body, false);
  assert.equal(invocation.options.body.rawAnswer, 'leisure');
  assert.equal(invocation.options.body.contentSource, 'context');
});

test('unit activity attempt sends curated IDs and evidence metadata but no student identity or marking answer bank', async () => {
  let invocation;
  const client = { functions:{ invoke:async (name, options) => { invocation = { name, options }; return { data:{ ok:true }, error:null }; } } };
  await submitVocabularyAttempt(client, {
    occurrenceId:'u1_46_significant',
    activityContentId:'u1_idea_significant',
    contentSource:'unit_activity',
    questionType:'rewrite_idea',
    rawAnswer:'The programme produced an important improvement in results.',
    strands:['paraphrasing','production'],
    evidenceStrength:'very_strong',
    supportLevel:'none',
    productive:true,
    repeatedGuess:false,
    primaryEvidenceTargetId:'vocab_significant',
    studentId:'must-not-pass'
  });
  const body = invocation.options.body;
  assert.equal(body.contentSource, 'unit_activity');
  assert.equal(body.activityContentId, 'u1_idea_significant');
  assert.deepEqual(body.strands, ['paraphrasing','production']);
  assert.equal(body.evidenceStrength, 'very_strong');
  assert.equal(body.supportLevel, 'none');
  assert.equal(body.primaryEvidenceTargetId, 'vocab_significant');
  assert.equal('studentId' in body, false);
  assert.equal('acceptedAnswers' in body, false);
  assert.equal('markingReference' in body, false);
});

test('browser vocabulary data module contains no direct mastery upsert path', () => {
  const source = fs.readFileSync(new URL('../src/vocabulary/data.js', import.meta.url), 'utf8');
  assert.equal(/from\(['"]vocabulary_(?:global|unit)_mastery['"]\)[\s\S]{0,200}\.upsert\(/.test(source), false);
});

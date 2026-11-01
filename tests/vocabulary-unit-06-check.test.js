// Unit 6 (Learning and Study Skills) formal check, through the existing Unit Check machinery. Fixtures only; no real student data.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import unit6Content from '../content/vocabulary/units/unit-06.js';
import { UNIT_CHECKS, unitCheckFor } from '../content/vocabulary/checks/index.js';
import unit1Check from '../content/vocabulary/checks/unit-01-check.js';
import unit4Check from '../content/vocabulary/checks/unit-04-check.js';
import { attemptPayload, feedbackForAttempt, nextCheckState, scoreCheck, scoreSummary } from '../src/vocabulary/unit-check-model.js';
import { loadVocabularyUnitCheckAttempts, recordVocabularyUnitCheckAttempt } from '../src/vocabulary/unit-check-data.js';
import { renderUnitCheckReview, renderUnitCheckScreen } from '../src/vocabulary/unit-check-view.js';

const expectedTypes = ['passage_mcq','passage_mcq','passage_mcq','passage_mcq','passage_mcq','passage_mcq','paraphrase_mcq','paraphrase_mcq','word_form','precision_mcq'];
const occurrences = new Map(unit6Content.occurrences.map(row => [row.occurrenceId, row]));
const termOf = occurrenceId => unit6Content.items.find(item => item.vocabularyId === occurrences.get(occurrenceId).vocabularyId).term;
const controller = fs.readFileSync(new URL('../src/vocabulary/unit-check-controller.js', import.meta.url), 'utf8');

function fakeClient() {
  const store = [];
  const calls = [];
  const client = { calls, store, from(table) {
    calls.push(['from', table]);
    const query = {
      insert(payload) { calls.push(['insert', payload]); store.push({ ...payload, completed_at:'2026-01-01T00:00:00Z' }); return query; },
      select() { return query; },
      eq(column, value) { calls.push(['eq', column, value]); return query; },
      order() { return Promise.resolve({ data:store.filter(row => row.unit_number === calls.findLast(call => call[0] === 'eq')[2]), error:null }); },
      single() { return Promise.resolve({ data:store.at(-1), error:null }); }
    };
    return query;
  } };
  return client;
}

test('1. Unit 6 is registered with the established three-form Unit Check contract', () => {
  const check = unitCheckFor(6);
  assert.ok(check, 'Unit 6 must have an authored check');
  assert.equal(check.unitNumber, 6);
  assert.equal(check.maxAttempts, 3);
  assert.deepEqual(Object.keys(check.forms), ['A','B','C']);
  assert.equal(new Set(Object.values(check.forms).map(form => form.passage)).size, 3);
  for (const [formId, form] of Object.entries(check.forms)) {
    assert.equal(form.id, formId);
    assert.equal(form.questions.length, 10);
    assert.deepEqual(form.questions.map(question => question.type), expectedTypes);
    assert.equal((form.passage.match(/\[\[[1-6]\]\]/g) ?? []).length, 6);
    for (const question of form.questions) {
      assert.ok(question.id.startsWith(formId) && question.target && question.prompt && question.answer && question.diagnostic && question.explanation);
      if (question.type.endsWith('_mcq')) {
        assert.equal(question.choices.length, 4);
        assert.equal(new Set(question.choices).size, 4);
        assert.equal(question.choices.filter(choice => choice === question.answer).length, 1);
      } else assert.equal(question.choices, undefined);
      assert.equal(question.diagnostic.toLowerCase().includes(question.answer.toLowerCase()), false, `${question.id} diagnostic must not reveal the answer`);
    }
  }
});

test('2. Unit 6 uses thirty distinct real Unit 6 targets, including all isolated duplicate ids', () => {
  const check = unitCheckFor(6);
  assert.ok(check);
  const questions = Object.values(check.forms).flatMap(form => form.questions);
  assert.equal(questions.length, 30);
  assert.equal(new Set(questions.map(question => question.target)).size, 30);
  for (const question of questions) {
    const occurrence = occurrences.get(question.target);
    assert.ok(occurrence, `${question.target} is a Unit 6 occurrence`);
    assert.equal(occurrence.unitNumber, 6);
    assert.match(question.target, /^u6_\d\d_/);
    assert.ok(question.explanation.toLowerCase().includes(termOf(question.target).toLowerCase()), `${question.id} explanation names ${termOf(question.target)}`);
  }
  for (const occurrenceId of ['u6_12_evaluate_6','u6_31_struggle_6','u6_40_pressure_6','u6_46_achievement_6']) {
    assert.ok(questions.some(question => question.target === occurrenceId), `${occurrenceId} is explicitly tested`);
  }
});

test('3. British spellings are preserved in Unit 6 check content', () => {
  const text = JSON.stringify(unitCheckFor(6));
  for (const spelling of ['prioritise','summarise','memorise']) assert.match(text, new RegExp(spelling, 'i'));
  assert.doesNotMatch(text, /prioritize|summarize|memorize/i);
});

test('4. completing and retrying Unit 6 persists unit_number 6 through forms A, B and C', async () => {
  const check = unitCheckFor(6);
  assert.ok(check);
  const client = fakeClient();
  const attempts = [];
  for (const [attemptNumber, formId] of [[1,'A'],[2,'B'],[3,'C']]) {
    const state = nextCheckState(attempts);
    assert.deepEqual([state.attemptNumber, state.formId, state.locked], [attemptNumber, formId, false]);
    const form = check.forms[formId];
    const scored = scoreCheck(form, Object.fromEntries(form.questions.map(question => [question.id, question.answer])));
    assert.equal(scored.score, 10);
    attempts.push(await recordVocabularyUnitCheckAttempt(client, { unitNumber:6, formId, attemptNumber, score:10, maxScore:10 }));
    const review = renderUnitCheckReview({ unitNumber:6, form, attemptNumber, scored, feedback:feedbackForAttempt(form, scored.results, attemptNumber), locked:nextCheckState(attempts).locked });
    assert.match(review, /Back to Unit 6/);
    assert.match(renderUnitCheckScreen({ unitNumber:6, form, attemptNumber, questionIndex:0, answers:{} }), /<\/span> Unit 6<\/button>/);
  }
  assert.deepEqual(client.store.map(row => [row.unit_number, row.form_id, row.attempt_number]), [[6,'A',1],[6,'B',2],[6,'C',3]]);
  assert.deepEqual(scoreSummary(attempts).best, { score:10, maxScore:10 });
  assert.equal(nextCheckState(attempts).locked, true);
  assert.deepEqual(attemptPayload({ unitNumber:6, formId:'A', attemptNumber:1, score:10, maxScore:10 }), { unit_number:6, form_id:'A', attempt_number:1, score:10, max_score:10 });
  const rows = await loadVocabularyUnitCheckAttempts(client, 6);
  assert.equal(rows.length, 3);
  assert.match(controller, /unitNumber:active\.unitNumber/);
});

test('5. existing Unit 1 and Unit 4 checks stay registered; Units 3 and 5 still do not gain checks', () => {
  assert.equal(unitCheckFor(1), unit1Check);
  assert.equal(unitCheckFor(4), unit4Check);
  assert.ok(unitCheckFor(2), 'Unit 2 now has its authored check');
  assert.equal(unitCheckFor(3), null);
  assert.equal(unitCheckFor(5), null);
  assert.deepEqual(Object.keys(UNIT_CHECKS), ['1','2','4','6']);
});

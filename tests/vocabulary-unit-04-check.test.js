// Unit 4 (Transport) formal check, run through the existing Unit Check machinery. Fixtures and fakes only: no real student data.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import unit4Content from '../content/vocabulary/units/unit-04.js';
import { UNIT_CHECKS, unitCheckFor } from '../content/vocabulary/checks/index.js';
import unit1Check from '../content/vocabulary/checks/unit-01-check.js';
import unit4Check from '../content/vocabulary/checks/unit-04-check.js';
import { attemptPayload, feedbackForAttempt, nextCheckState, scoreCheck, scoreSummary } from '../src/vocabulary/unit-check-model.js';
import { loadVocabularyUnitCheckAttempts, recordVocabularyUnitCheckAttempt } from '../src/vocabulary/unit-check-data.js';
import { renderUnitCheckReview, renderUnitCheckScreen } from '../src/vocabulary/unit-check-view.js';

const expectedTypes = ['passage_mcq','passage_mcq','passage_mcq','passage_mcq','passage_mcq','passage_mcq','paraphrase_mcq','paraphrase_mcq','word_form','precision_mcq'];
const occurrences = new Map(unit4Content.occurrences.map(row => [row.occurrenceId, row]));
const termOf = occurrenceId => unit4Content.items.find(item => item.vocabularyId === occurrences.get(occurrenceId).vocabularyId).term;
const allQuestions = Object.values(unit4Check.forms).flatMap(form => form.questions);
const controller = fs.readFileSync(new URL('../src/vocabulary/unit-check-controller.js', import.meta.url), 'utf8');
const view = fs.readFileSync(new URL('../src/vocabulary/unit-check-view.js', import.meta.url), 'utf8');

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

test('1. Unit 4 is registered and loads the Unit 4 check; it has the same contract as Unit 1', () => {
  assert.equal(unitCheckFor(4), unit4Check);
  assert.equal(unit4Check.unitNumber, 4);
  assert.equal(unit4Check.maxAttempts, 3);
  assert.deepEqual(Object.keys(unit4Check.forms), ['A','B','C']);
  assert.equal(new Set(Object.values(unit4Check.forms).map(form => form.passage)).size, 3);
  for (const [formId, form] of Object.entries(unit4Check.forms)) {
    assert.equal(form.id, formId);
    assert.equal(form.questions.length, 10);
    assert.deepEqual(form.questions.map(question => question.type), expectedTypes);
    assert.equal((form.passage.match(/\[\[[1-6]\]\]/g) ?? []).length, 6);
    for (const question of form.questions) {
      assert.ok(question.id.startsWith(formId) && question.prompt && question.answer && question.diagnostic && question.explanation);
      if (question.type.endsWith('_mcq')) {
        assert.equal(question.choices.length, 4);
        assert.equal(new Set(question.choices).size, 4);
        assert.equal(question.choices.filter(choice => choice === question.answer).length, 1);
      } else assert.equal(question.choices, undefined);
      assert.equal(question.diagnostic.toLowerCase().includes(question.answer.toLowerCase()), false, `${question.id} diagnostic must not reveal the answer`);
    }
  }
});

test('2. a missing unit never falls back to Unit 1', () => {
  assert.notEqual(unitCheckFor(4), unit1Check);
  assert.equal(unitCheckFor(4, { 1:unit1Check }), null, 'no Unit 4 entry means no check, not Unit 1');
  assert.equal(unitCheckFor(4, { 4:{ forms:{} }, 1:unit1Check }), null);
  assert.equal(unitCheckFor(undefined), null);
  assert.doesNotMatch(controller, /unitCheckFor\([^)]*\|\|\s*1|\?\?\s*1\b|unit1VocabularyCheck/);
  assert.doesNotMatch(view, /Unit 1/, 'the view no longer hard-codes Unit 1');
  const text = JSON.stringify(unit4Check);
  assert.doesNotMatch(text, /Maya|climbing|badminton/i, 'no Unit 1 passage content');
});

test('3. every question targets a Unit 4 occurrence, and each target is tested once', () => {
  assert.equal(allQuestions.length, 30);
  const targets = allQuestions.map(question => question.target);
  assert.equal(new Set(targets).size, 30, 'thirty distinct Unit 4 targets');
  for (const target of targets) {
    const occurrence = occurrences.get(target);
    assert.ok(occurrence, `${target} is a Unit 4 occurrence`);
    assert.equal(occurrence.unitNumber, 4);
    assert.match(target, /^u4_\d\d_/);
  }
  for (const question of allQuestions) {
    assert.ok(question.explanation.toLowerCase().includes(termOf(question.target).toLowerCase()), `${question.id} explanation names ${termOf(question.target)}`);
  }
  // Unit 1 questions carry no target, so the registry's other check is unaffected.
  assert.ok(Object.values(unit1Check.forms).every(form => form.questions.every(question => !('target' in question))));
});

test('4. duplicate lexical terms resolve to their Unit 4 occurrence ids', () => {
  const byAnswer = Object.fromEntries(allQuestions.map(question => [question.target, question]));
  const expected = { demand:'u4_22_demand_4', advertisement:'u4_25_advertisement_4', equipment:'u4_27_equipment_4', participant:'u4_30_participant_4' };
  for (const [term, occurrenceId] of Object.entries(expected)) {
    assert.ok(byAnswer[occurrenceId], `${term} is tested via ${occurrenceId}`);
    assert.equal(termOf(occurrenceId), term);
    assert.match(byAnswer[occurrenceId].answer, new RegExp(term, 'i'));
    assert.equal(allQuestions.some(question => question.target === `u4_${occurrenceId.slice(3, 5)}_${term}`), false, 'no un-suffixed (earlier-unit) id');
    assert.equal(occurrences.get(occurrenceId).vocabularyId, `vocab_${term}_4`);
  }
});

test('all 50 Unit 4 words remain eligible, including the Set-held-back words, and efficiently is not special-cased', () => {
  const heldBack = ['offences','provisional','enforcement','statistics','safety','sustainability','legislation','introduce','innovative'];
  const tested = new Set(allQuestions.map(question => termOf(question.target)));
  for (const term of ['provisional','statistics','safety','legislation']) assert.ok(tested.has(term), `${term} (held back from Sets) is tested`);
  assert.ok(heldBack.length === 9 && unit4Content.items.length === 50);
  assert.equal(/efficiently/i.test(JSON.stringify(unit4Check)), false, 'no special handling');
});

test('5. completing Unit 4 records unit_number = 4 with form, attempt, score and max score only', async () => {
  const client = fakeClient();
  const form = unit4Check.forms.A;
  const scored = scoreCheck(form, Object.fromEntries(form.questions.map((question, index) => [question.id, index < 7 ? question.answer : 'wrong'])));
  assert.deepEqual([scored.score, scored.maxScore], [7, 10]);
  const saved = await recordVocabularyUnitCheckAttempt(client, { unitNumber:4, formId:'A', attemptNumber:1, score:scored.score, maxScore:scored.maxScore, answers:{ A1:'x' } });
  const insert = client.calls.find(call => call[0] === 'insert')[1];
  assert.deepEqual(insert, { unit_number:4, form_id:'A', attempt_number:1, score:7, max_score:10 });
  assert.equal(saved.unit_number, 4);
  assert.deepEqual(attemptPayload({ unitNumber:4, formId:'A', attemptNumber:1, score:7, maxScore:10 }), insert);
  assert.ok(client.calls.some(call => call[0] === 'from' && call[1] === 'vocabulary_unit_check_attempts'));
  const rows = await loadVocabularyUnitCheckAttempts(client, 4);
  assert.ok(client.calls.some(call => call[0] === 'eq' && call[1] === 'unit_number' && call[2] === 4));
  assert.equal(rows.length, 1);
  // The controller saves with the unit it started the check in, never a constant.
  const saveCall = controller.match(/recordVocabularyUnitCheckAttempt\(client, \{([\s\S]*?)\n    \}\);/)[1];
  assert.match(saveCall, /unitNumber:active\.unitNumber/);
  assert.match(controller, /unitNumber,\n\s+attemptNumber:next\.attemptNumber/);
  assert.match(controller, /loadVocabularyUnitCheckAttempts\(client, unitNumber\)/);
  assert.match(controller, /attemptsCache\.set\(active\.unitNumber, attempts\)/);
});

test('6. result and retry flow keeps Unit 4 through all three attempts, in order A, B, C', async () => {
  const client = fakeClient();
  const attempts = [];
  for (const [attemptNumber, formId] of [[1,'A'],[2,'B'],[3,'C']]) {
    const state = nextCheckState(attempts);
    assert.deepEqual([state.attemptNumber, state.formId, state.locked], [attemptNumber, formId, false]);
    const form = unitCheckFor(4).forms[state.formId];
    const screen = renderUnitCheckScreen({ unitNumber:4, form, attemptNumber, questionIndex:0, answers:{} });
    assert.match(screen, /<\/span> Unit 4<\/button>/);
    assert.doesNotMatch(screen, /Unit 1/);
    const scored = scoreCheck(form, Object.fromEntries(form.questions.map(question => [question.id, question.answer])));
    assert.equal(scored.score, 10);
    attempts.push(await recordVocabularyUnitCheckAttempt(client, { unitNumber:4, formId, attemptNumber, score:scored.score, maxScore:scored.maxScore }));
    const locked = nextCheckState(attempts).locked;
    const review = renderUnitCheckReview({ unitNumber:4, form, attemptNumber, scored, feedback:feedbackForAttempt(form, scored.results, attemptNumber), locked });
    assert.match(review, /Back to Unit 4/);
    assert.doesNotMatch(review, /Unit 1/);
    assert.equal(locked, attemptNumber === 3);
  }
  assert.deepEqual(client.store.map(row => [row.unit_number, row.form_id, row.attempt_number]), [[4,'A',1],[4,'B',2],[4,'C',3]]);
  assert.deepEqual(scoreSummary(attempts).best, { score:10, maxScore:10 });
  assert.equal(nextCheckState(attempts).locked, true);
  // Back / Retry / refresh read the unit from the page badge and the active session, with no Unit 1 default.
  assert.match(controller, /function visibleUnitNumber\(\)[\s\S]*Unit\\s\+\(\\d\+\)[\s\S]*: null/);
  assert.match(controller, /unitNumber:active\.unitNumber,\n\s+form:active\.form/);
  assert.match(controller, /renderUnitCheckReview\(\{ unitNumber:active\.unitNumber/);
  assert.match(controller, /attemptsCache\.get\(active\.unitNumber\)/);
});

test('7. Unit 1 behaviour is unchanged and Units 3 and 5 now have their checks', () => {
  assert.equal(unitCheckFor(1), unit1Check);
  assert.ok(unitCheckFor(3));
  assert.ok(unitCheckFor(5));
  assert.deepEqual(Object.keys(UNIT_CHECKS), ['1','2','3','4','5','6']);
  const form = unit1Check.forms.A;
  const html = renderUnitCheckScreen({ unitNumber:1, form, attemptNumber:1, questionIndex:0, answers:{} });
  assert.match(html, /<\/span> Unit 1<\/button>/);
  assert.match(html, /Trying a new sport/);
  assert.match(renderUnitCheckReview({ unitNumber:1, attemptNumber:3, scored:{ score:5, maxScore:10 }, feedback:{ mode:'full', items:[] }, locked:true }), /Back to Unit 1/);
  // A screen with no unit number says "Unit", never "Unit 1".
  assert.doesNotMatch(renderUnitCheckScreen({ form, attemptNumber:1 }), /Unit 1</);
});

test('the existing table constraints already accept Unit 4 attempts (no schema change)', () => {
  const sql = fs.readFileSync(new URL('../supabase/migrations/20261027130000_vocabulary_unit_checks.sql', import.meta.url), 'utf8');
  assert.match(sql, /unit_number integer not null check \(unit_number > 0\)/);
  assert.match(sql, /max_score = 10/);
  assert.doesNotMatch(sql, /unit_number\s*=\s*1\b/);
});

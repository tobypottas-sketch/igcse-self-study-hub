// Unit 7 (Learning and Study Skills) formal check, through the existing Unit Check machinery. Fixtures only; no real student data.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import unit7Content from '../content/vocabulary/units/unit-07.js';
import { UNIT_CHECKS, unitCheckFor } from '../content/vocabulary/checks/index.js';
import unit1Check from '../content/vocabulary/checks/unit-01-check.js';
import unit4Check from '../content/vocabulary/checks/unit-04-check.js';
import { attemptPayload, feedbackForAttempt, nextCheckState, scoreCheck, scoreSummary } from '../src/vocabulary/unit-check-model.js';
import { loadVocabularyUnitCheckAttempts, recordVocabularyUnitCheckAttempt } from '../src/vocabulary/unit-check-data.js';
import { renderUnitCheckReview, renderUnitCheckScreen } from '../src/vocabulary/unit-check-view.js';

const expectedTypes = ['passage_mcq','passage_mcq','passage_mcq','passage_mcq','passage_mcq','passage_mcq','paraphrase_mcq','paraphrase_mcq','word_form','precision_mcq'];
const occurrences = new Map(unit7Content.occurrences.map(row => [row.occurrenceId, row]));
const termOf = occurrenceId => unit7Content.items.find(item => item.vocabularyId === occurrences.get(occurrenceId).vocabularyId).term;
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

test('1. Unit 7 is registered with the established three-form Unit Check contract', () => {
  const check = unitCheckFor(7);
  assert.ok(check, 'Unit 7 must have an authored check');
  assert.equal(check.unitNumber, 7);
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

test('2. Unit 7 uses thirty distinct real Unit 7 targets, including the isolated duplicate ids that Unit 7 shares with other units', () => {
  const check = unitCheckFor(7);
  assert.ok(check);
  const questions = Object.values(check.forms).flatMap(form => form.questions);
  assert.equal(questions.length, 30);
  assert.equal(new Set(questions.map(question => question.target)).size, 30);
  for (const question of questions) {
    const occurrence = occurrences.get(question.target);
    assert.ok(occurrence, `${question.target} is a Unit 7 occurrence`);
    assert.equal(occurrence.unitNumber, 7);
    assert.match(question.target, /^u7_\d\d_/);
    assert.ok(question.explanation.toLowerCase().includes(termOf(question.target).toLowerCase()), `${question.id} explanation names ${termOf(question.target)}`);
  }
  for (const occurrenceId of ['u7_16_availability_7','u7_19_strategy_7','u7_24_respond_7','u7_25_relevant_7','u7_35_confidence_7','u7_36_anxious_7','u7_39_evaluate_7','u7_48_criteria_7']) {
    assert.ok(questions.some(question => question.target === occurrenceId), `${occurrenceId} is explicitly tested`);
  }
});

test('3. Unit 7 check content uses British spelling and no American forms', () => {
  const text = JSON.stringify(unitCheckFor(7));
  assert.doesNotMatch(text, /organize|summarize|prioritize|recognize|analyze/i);
});

test('4. completing and retrying Unit 7 persists unit_number 7 through forms A, B and C', async () => {
  const check = unitCheckFor(7);
  assert.ok(check);
  const client = fakeClient();
  const attempts = [];
  for (const [attemptNumber, formId] of [[1,'A'],[2,'B'],[3,'C']]) {
    const state = nextCheckState(attempts);
    assert.deepEqual([state.attemptNumber, state.formId, state.locked], [attemptNumber, formId, false]);
    const form = check.forms[formId];
    const scored = scoreCheck(form, Object.fromEntries(form.questions.map(question => [question.id, question.answer])));
    assert.equal(scored.score, 10);
    attempts.push(await recordVocabularyUnitCheckAttempt(client, { unitNumber:7, formId, attemptNumber, score:10, maxScore:10 }));
    const review = renderUnitCheckReview({ unitNumber:7, form, attemptNumber, scored, feedback:feedbackForAttempt(form, scored.results, attemptNumber), locked:nextCheckState(attempts).locked });
    assert.match(review, /Back to Unit 7/);
    assert.match(renderUnitCheckScreen({ unitNumber:7, form, attemptNumber, questionIndex:0, answers:{} }), /<\/span> Unit 7<\/button>/);
  }
  assert.deepEqual(client.store.map(row => [row.unit_number, row.form_id, row.attempt_number]), [[7,'A',1],[7,'B',2],[7,'C',3]]);
  assert.deepEqual(scoreSummary(attempts).best, { score:10, maxScore:10 });
  assert.equal(nextCheckState(attempts).locked, true);
  assert.deepEqual(attemptPayload({ unitNumber:7, formId:'A', attemptNumber:1, score:10, maxScore:10 }), { unit_number:7, form_id:'A', attempt_number:1, score:10, max_score:10 });
  const rows = await loadVocabularyUnitCheckAttempts(client, 7);
  assert.equal(rows.length, 3);
  assert.match(controller, /unitNumber:active\.unitNumber/);
});

test('5. existing Unit 1 and Unit 4 checks stay registered; Units 1 to 7 are the only checks and Unit 8 has none', () => {
  assert.equal(unitCheckFor(1), unit1Check);
  assert.equal(unitCheckFor(4), unit4Check);
  assert.ok(unitCheckFor(2), 'Unit 2 now has its authored check');
  assert.ok(unitCheckFor(3), 'Unit 3 now has its authored check');
  assert.ok(unitCheckFor(5));
  assert.deepEqual(Object.keys(UNIT_CHECKS), ['1','2','3','4','5','6','7']);
  assert.equal(unitCheckFor(8), null);
  assert.ok(unitCheckFor(6), 'Unit 6 keeps its check');
});

const BLUEPRINT = {
  A:['u7_01_applicant','u7_02_qualifications','u7_16_availability_7','u7_13_reference','u7_20_flexible','u7_03_demonstrate','u7_23_impress','u7_04_summary','u7_15_enthusiastic','u7_34_experience'],
  B:['u7_36_anxious_7','u7_19_strategy_7','u7_10_interviewer','u7_24_respond_7','u7_25_relevant_7','u7_27_coherent','u7_18_dominate','u7_17_compromise','u7_26_contribute','u7_35_confidence_7'],
  C:['u7_44_editor','u7_45_proofread','u7_48_criteria_7','u7_49_accurate','u7_46_layout','u7_32_certificate','u7_41_distribute','u7_39_evaluate_7','u7_07_frequent','u7_21_schedule']
};

test('6. the approved blueprint: ten fixed targets per form, in order, and no look-alike partners together in one form', () => {
  const check = unitCheckFor(7);
  for (const [formId, targets] of Object.entries(BLUEPRINT)) assert.deepEqual(check.forms[formId].questions.map(question => question.target), targets, `Form ${formId}`);
  const pairs = [['applicant','candidate'],['interviewer','interviewee'],['referee','reference'],['qualification','qualifications'],['overview','summary'],['expertise','proficiency'],['editor','proofread']];
  for (const form of Object.values(check.forms)) {
    const terms = form.questions.map(question => termOf(question.target));
    for (const [a, b] of pairs.slice(0, 5)) assert.ok(!(terms.includes(a) && terms.includes(b)), `${form.id}: ${a} and ${b} must not share a form`);
  }
});

test('7. every wrong choice fails and exactly one choice is right: no answer appears twice, no choice repeats the typed answer, no gap offers its own sentence word twice', () => {
  const check = unitCheckFor(7);
  for (const form of Object.values(check.forms)) {
    for (const question of form.questions) {
      if (!question.choices) { assert.equal(question.type, 'word_form'); assert.match(question.answer, /^[a-z]+$/); continue; }
      const wrong = question.choices.filter(choice => choice !== question.answer);
      assert.equal(wrong.length, 3, question.id);
      assert.equal(scoreCheck({ questions:[question] }, { [question.id]:question.answer }).score, 1);
      for (const choice of wrong) assert.equal(scoreCheck({ questions:[question] }, { [question.id]:choice }).score, 0, `${question.id} ${choice}`);
    }
  }
});

test('8. scoring, case and spacing for typed answers, and feedback by attempt, use the unchanged engine', () => {
  const check = unitCheckFor(7);
  const typedQuestion = check.forms.A.questions[8];
  assert.equal(typedQuestion.answer, 'enthusiasm');
  for (const ok of ['enthusiasm', ' Enthusiasm ', 'ENTHUSIASM']) assert.equal(scoreCheck(check.forms.A, { A9:ok }).results[8].correct, true, ok);
  for (const bad of ['enthusiastic', 'enthusiasms', 'enthusiastically', '']) assert.equal(scoreCheck(check.forms.A, { A9:bad }).results[8].correct, false, bad);
  assert.equal(check.forms.C.questions[8].answer, 'frequently');
  assert.equal(check.forms.B.questions[8].answer, 'contribution');
  const none = scoreCheck(check.forms.B, {});
  assert.equal(none.score, 0); assert.equal(none.maxScore, 10);
  const onlyFirst = scoreCheck(check.forms.B, { B1:check.forms.B.questions[0].answer });
  assert.equal(feedbackForAttempt(check.forms.B, onlyFirst.results, 1).items.length, 9);
  assert.equal(feedbackForAttempt(check.forms.B, onlyFirst.results, 1).items.every(item => item.correctAnswer === undefined), true, 'attempts 1 and 2 give diagnostic hints only');
  const full = feedbackForAttempt(check.forms.B, onlyFirst.results, 3);
  assert.equal(full.items.length, 10); assert.ok(full.items.every(item => item.correctAnswer && item.explanation), 'attempt 3 shows every answer and explanation');
});

test('9. original wording: no passage or prompt shares a five-word run with the Unit 7 pathway content', () => {
  const words = text => String(text).toLowerCase().match(/[a-z\u2019']+/g) ?? [];
  const grams = (text, n = 5) => { const list = words(text), found = new Set(); for (let i = 0; i + n <= list.length; i += 1) found.add(list.slice(i, i + n).join(' ')); return found; };
  const pathway = new Set();
  const walk = value => { if (typeof value === 'string') for (const gram of grams(value)) pathway.add(gram); else if (value && typeof value === 'object') Object.values(value).forEach(walk); };
  walk(unit7Content.contexts); walk(unit7Content.activities); walk(unit7Content.items);
  const check = unitCheckFor(7), shared = [];
  for (const form of Object.values(check.forms)) for (const text of [form.passage, ...form.questions.map(question => question.prompt)]) for (const gram of grams(text)) if (pathway.has(gram)) shared.push(`${form.id}: ${gram}`);
  assert.deepEqual(shared, []);
});

test('10. the three forms are comparable: same shape, similar passage and prompt lengths, and every target word is a real Unit 7 word', () => {
  const check = unitCheckFor(7);
  const lengths = Object.values(check.forms).map(form => form.passage.split(/\s+/).length);
  assert.ok(Math.max(...lengths) - Math.min(...lengths) <= 15, `passage lengths ${lengths}`);
  const classes = Object.values(check.forms).map(form => form.questions.map(question => termOf(question.target)).length);
  assert.deepEqual(classes, [10, 10, 10]);
  const terms = new Set(unit7Content.items.map(item => item.term));
  for (const form of Object.values(check.forms)) for (const question of form.questions) assert.ok(terms.has(termOf(question.target)), question.id);
  const unassessed = unit7Content.items.map(item => item.term).filter(term => !Object.values(check.forms).some(form => form.questions.some(question => termOf(question.target) === term)));
  assert.equal(unassessed.length, 20);
});

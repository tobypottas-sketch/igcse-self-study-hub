import test from 'node:test';
import assert from 'node:assert/strict';
import { nextCheckState, markCheck, scoreCheck, scoreSummary, feedbackForAttempt } from '../src/vocabulary/unit-check-model.js';
import { unit1VocabularyCheck } from '../content/vocabulary/checks/unit-01-check.js';

test('formal attempts map once to A then B then C and lock after three saves', () => {
  assert.deepEqual(nextCheckState([]), { attemptNumber:1, formId:'A', locked:false });
  assert.deepEqual(nextCheckState([{ attempt_number:1, form_id:'A', score:6, max_score:10 }]), { attemptNumber:2, formId:'B', locked:false });
  assert.deepEqual(nextCheckState([{ attempt_number:1, form_id:'A' },{ attempt_number:2, form_id:'B' }]), { attemptNumber:3, formId:'C', locked:false });
  assert.deepEqual(nextCheckState([{ attempt_number:1, form_id:'A' },{ attempt_number:2, form_id:'B' },{ attempt_number:3, form_id:'C' }]), { attemptNumber:null, formId:null, locked:true });
});

test('typed word-form marking ignores harmless case and surrounding whitespace only', () => {
  const q = unit1VocabularyCheck.forms.A.questions[8];
  assert.equal(markCheck(q, '  Determination  '), true);
  assert.equal(markCheck(q, 'determined'), false);
  assert.equal(markCheck(q, ''), false);
});

test('scoreCheck marks all ten items and returns score without mutating answers', () => {
  const form = unit1VocabularyCheck.forms.A;
  const answers = Object.fromEntries(form.questions.map(question => [question.id, question.answer]));
  answers.A4 = 'relatively';
  const result = scoreCheck(form, answers);
  assert.equal(result.score, 9);
  assert.equal(result.maxScore, 10);
  assert.equal(result.results.find(row => row.questionId === 'A4').correct, false);
  assert.equal(answers.A4, 'relatively');
});

test('score summary reports latest and best independently', () => {
  assert.deepEqual(scoreSummary([]), { latest:null, best:null, attemptsUsed:0 });
  assert.deepEqual(scoreSummary([
    { attempt_number:1, score:8, max_score:10 },
    { attempt_number:2, score:6, max_score:10 }
  ]), { latest:{ score:6, maxScore:10 }, best:{ score:8, maxScore:10 }, attemptsUsed:2 });
});

test('attempts one and two expose diagnostics only; attempt three may reveal answers', () => {
  const form = unit1VocabularyCheck.forms.C;
  const answers = Object.fromEntries(form.questions.map(question => [question.id, 'wrong']));
  const scored = scoreCheck(form, answers);
  const early = feedbackForAttempt(form, scored.results, 2);
  assert.equal(early.mode, 'diagnostic');
  assert.ok(early.items.every(item => item.correctAnswer === undefined && item.explanation === undefined));
  assert.ok(early.items.every(item => item.diagnostic));

  const final = feedbackForAttempt(form, scored.results, 3);
  assert.equal(final.mode, 'full');
  assert.equal(final.items[0].correctAnswer, form.questions[0].answer);
  assert.ok(final.items[0].explanation);
});

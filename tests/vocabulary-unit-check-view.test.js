import test from 'node:test';
import assert from 'node:assert/strict';
import { renderUnitCheckCard, renderUnitCheckScreen, renderUnitCheckReview } from '../src/vocabulary/unit-check-view.js';
import { unit1VocabularyCheck } from '../content/vocabulary/checks/unit-01-check.js';
import { scoreCheck, feedbackForAttempt } from '../src/vocabulary/unit-check-model.js';

test('Unit Check card is clearly separate, shows attempt status and separate scores', () => {
  const html = renderUnitCheckCard({ attemptNumber:2, formId:'B', attemptsUsed:1, latest:{ score:7, maxScore:10 }, best:{ score:7, maxScore:10 } });
  assert.match(html, /Unit Vocabulary Check/);
  assert.match(html, /Cambridge iGCSE ESL 0511/);
  assert.match(html, /Attempt 2 of 3/);
  assert.match(html, /Latest.*7 \/ 10/s);
  assert.match(html, /Best.*7 \/ 10/s);
  assert.match(html, /data-unit-check-action="start"/);
  assert.doesNotMatch(html, /pathway|mastery/i);
});

test('question screen renders passage and current question together without correctness feedback', () => {
  const form = unit1VocabularyCheck.forms.A;
  const html = renderUnitCheckScreen({ form, attemptNumber:1, questionIndex:0, answers:{} });
  assert.match(html, /data-unit-check-passage/);
  assert.match(html, /Trying a new sport/);
  assert.match(html, /Question 1 of 10/);
  assert.match(html, /Which word best completes gap 1/);
  assert.match(html, /data-unit-check-answer/);
  assert.doesNotMatch(html, /Correct answer|Not quite|diagnostic/i);
});

test('Q7-10 retain the passage as reference instead of removing it', () => {
  const form = unit1VocabularyCheck.forms.B;
  const html = renderUnitCheckScreen({ form, attemptNumber:2, questionIndex:7, answers:{} });
  assert.match(html, /data-unit-check-passage/);
  assert.match(html, /is-reference/);
  assert.match(html, /Question 8 of 10/);
});

test('attempt two review contains diagnostics but no correct answers', () => {
  const form = unit1VocabularyCheck.forms.C;
  const scored = scoreCheck(form, {});
  const feedback = feedbackForAttempt(form, scored.results, 2);
  const html = renderUnitCheckReview({ form, attemptNumber:2, scored, feedback, locked:false });
  assert.match(html, /aria-label="Score 0 out of 10"/);
  assert.match(html, /Next form ready\./);
  assert.match(html, /your next attempt uses a different passage and questions/);
  for (const item of feedback.items) assert.ok(html.includes(item.diagnostic), `Question ${item.questionId} diagnostic is shown`);
  assert.doesNotMatch(html, /Correct answer:/);
  assert.doesNotMatch(html, new RegExp(form.questions[0].answer, 'i'));
});

test('attempt three review reveals full answers and locks the assessment', () => {
  const form = unit1VocabularyCheck.forms.C;
  const scored = scoreCheck(form, {});
  const feedback = feedbackForAttempt(form, scored.results, 3);
  const html = renderUnitCheckReview({ form, attemptNumber:3, scored, feedback, locked:true });
  assert.match(html, /Correct answer:/);
  assert.match(html, /Assessment complete/);
  assert.match(html, /Back to Unit 1/);
});

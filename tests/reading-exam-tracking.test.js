import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  buildReadingAttempt,
  buildReadingExamAnswer,
  buildReadingExamFinalAttempt,
  buildReadingNotesResult
} from '../src/tracking/reading-core.js';

const paper = {
  id: 'paper1',
  exercises: [
    {
      type: 'matching',
      skill: 'multiple matching',
      questions: [{ id: 'm1', answer: 'A' }]
    },
    {
      type: 'notes',
      skill: 'note completion',
      noteSections: [{ bullets: [{ id: 'n1', answers: ['rain'] }, { id: 'n2', answers: ['shoes'] }] }]
    }
  ]
};

test('practice attempts remain scored Practice events', () => {
  const event = buildReadingAttempt({ paper, questionId: 'm1', attemptNumber: 2, correct: true });
  assert.equal(event.event_type, 'question_attempt');
  assert.equal(event.mode, 'practice');
  assert.equal(event.score, 1);
  assert.equal(event.max_score, 1);
  assert.equal(event.metadata.outcome, 'correct');
});

test('exam answer changes are unscored until submission', () => {
  const event = buildReadingExamAnswer({ paper, questionId: 'm1', attemptNumber: 3 });
  assert.equal(event.event_type, 'question_answered');
  assert.equal(event.mode, 'exam');
  assert.equal(event.activity_id, 'paper1:m1');
  assert.equal(event.metadata.attempt_number, 3);
  assert.equal(event.metadata.question_type, 'matching');
  assert.equal('score' in event, false);
  assert.equal('max_score' in event, false);
  assert.equal('strong' in event, false);
  assert.equal('outcome' in event.metadata, false);
});

test('exam submission produces one scored final attempt for ordinary questions', () => {
  const event = buildReadingExamFinalAttempt({ paper, questionId: 'm1', correct: false });
  assert.equal(event.event_type, 'question_attempt');
  assert.equal(event.mode, 'exam');
  assert.equal(event.score, 0);
  assert.equal(event.max_score, 1);
  assert.equal(event.metadata.outcome, 'try_again');
  assert.equal(event.metadata.result_type, 'exam_reconciliation');
});

test('note completion keeps grouped scoring in either mode', () => {
  const event = buildReadingNotesResult({
    paper,
    exerciseIndex: 1,
    score: 1,
    maxScore: 2,
    mode: 'exam',
    resultType: 'exam_reconciliation'
  });
  assert.equal(event.event_type, 'exercise_result');
  assert.equal(event.mode, 'exam');
  assert.equal(event.score, 1);
  assert.equal(event.max_score, 2);
  assert.equal(event.metadata.result_type, 'exam_reconciliation');
});

test('wrapper reads Reading studyMode and reconciles on submitExam', () => {
  const source = fs.readFileSync(new URL('../src/tracking/reading-wrapper.js', import.meta.url), 'utf8');
  assert.match(source, /function\s+studyMode\s*\(/);
  assert.match(source, /buildReadingExamAnswer/);
  assert.match(source, /buildReadingExamFinalAttempt/);
  assert.match(source, /submitExam/);
  assert.match(source, /examSubmitted/);
  assert.match(source, /mode:\s*studyMode\(/);
});

// This suite intentionally describes the new mode-aware tracking contract before implementation.

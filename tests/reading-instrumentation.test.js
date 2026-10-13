import test from 'node:test';
import assert from 'node:assert/strict';
import {
  findReadingQuestion,
  buildReadingAttempt,
  buildReadingNotesResult
} from '../src/tracking/reading-core.js';

const paper = {
  id: 'paper_1',
  exercises: [
    {
      type: 'matching',
      skill: 'multiple matching',
      questions: [{ id: 'm1', answer: 'A' }]
    },
    {
      type: 'notes',
      skill: 'note completion',
      noteSections: [
        { bullets: [{ id: 'n1', answers: ['rain'] }, { id: 'n2', answers: ['shoes'] }] }
      ]
    }
  ]
};

test('findReadingQuestion resolves normal and note questions', () => {
  assert.equal(findReadingQuestion(paper, 'm1').exercise.type, 'matching');
  assert.equal(findReadingQuestion(paper, 'n2').exercise.type, 'notes');
});

test('normal reading attempts carry correctness but never answer text', () => {
  const payload = buildReadingAttempt({
    paper,
    questionId: 'm1',
    attemptNumber: 2,
    correct: true,
    answerText: 'A'
  });

  assert.equal(payload.app_key, 'reading');
  assert.equal(payload.strong, true);
  assert.equal(payload.score, 1);
  assert.equal(payload.max_score, 1);
  assert.equal(payload.metadata.question_type, 'matching');
  assert.equal('answerText' in payload, false);
});

test('note attempts do not claim per-box correctness because notes are accepted in any order', () => {
  const payload = buildReadingAttempt({
    paper,
    questionId: 'n1',
    attemptNumber: 1,
    correct: false,
    answerText: 'shoes'
  });

  assert.equal(payload.metadata.question_type, 'notes');
  assert.equal('strong' in payload, false);
  assert.equal('score' in payload, false);
  assert.equal('max_score' in payload, false);
});

test('note exercise result stores only grouped numeric score', () => {
  const payload = buildReadingNotesResult({ paper, exerciseIndex: 1, score: 1, maxScore: 2 });
  assert.deepEqual(payload, {
    app_key: 'reading',
    event_type: 'exercise_result',
    activity_id: 'paper_1:exercise2',
    skill: 'note completion',
    set_id: 'paper_1',
    mode: 'practice',
    strong: false,
    score: 1,
    max_score: 2,
    metadata: { question_type: 'notes' }
  });
});

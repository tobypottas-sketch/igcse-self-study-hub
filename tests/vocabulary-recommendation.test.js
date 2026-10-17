import test from 'node:test';
import assert from 'node:assert/strict';
import { buildVocabularyInterventionDraft } from '../src/vocabulary/interventions.js';

const students = [{ studentId:'11111111-1111-4111-8111-111111111111' },{ studentId:'22222222-2222-4222-8222-222222222222' }];

test('problem-area recommendation defaults to affected students and current weak strand', () => {
  const draft = buildVocabularyInterventionDraft({
    affectedStudents:students,
    strand:'production',
    vocabularyIds:['vocab_significant','vocab_proficiency'],
    unitNumber:7
  });
  assert.equal(draft.interventionType, 'recommendation');
  assert.equal(draft.targetScope, 'group');
  assert.deepEqual(draft.studentIds, students.map(row => row.studentId));
  assert.equal(draft.learningArea, 'vocabulary_paraphrase');
  assert.equal(draft.skill, 'production');
  assert.deepEqual(draft.context, { unitNumber:7, vocabularyIds:['vocab_significant','vocab_proficiency'] });
  assert.deepEqual(draft.session, { mode:'adaptive' });
});

test('teacher can choose one of the approved timed durations for the same target set', () => {
  const draft = buildVocabularyInterventionDraft({ affectedStudents:students, strand:'paraphrasing', unitNumber:7, durationMinutes:10 });
  assert.deepEqual(draft.session, { mode:'timed', durationMinutes:10 });
  assert.throws(() => buildVocabularyInterventionDraft({ affectedStudents:students, strand:'paraphrasing', unitNumber:7, durationMinutes:7 }), /duration/i);
});

test('individual student profile creates a student-scoped recommendation', () => {
  const draft = buildVocabularyInterventionDraft({ studentId:'11111111-1111-4111-8111-111111111111', strand:'production', unitNumber:7 });
  assert.equal(draft.targetScope, 'student');
  assert.deepEqual(draft.studentIds, ['11111111-1111-4111-8111-111111111111']);
});

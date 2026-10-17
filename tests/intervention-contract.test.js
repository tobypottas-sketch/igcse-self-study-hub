import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateInterventionAction, validateCreateIntervention, validateStatusTransition } from '../supabase/functions/learning-intervention-action/validation.js';
import { buildTeamsTargetList } from '../src/vocabulary/interventions.js';

const UUID = '11111111-1111-4111-8111-111111111111';
const UUID2 = '22222222-2222-4222-8222-222222222222';

test('teacher intervention contract supports adaptive or exact approved timed sessions and Teams follow-up', () => {
  const adaptive = validateCreateIntervention({
    interventionType:'recommendation', targetScope:'student', studentIds:[UUID], learningArea:'vocabulary_paraphrase',
    skill:'production', context:{ unitNumber:7, vocabularyIds:['vocab_significant'] }, session:{ mode:'adaptive' }, reasonCode:'persistent_production_gap'
  });
  assert.equal(adaptive.session.mode, 'adaptive');

  const timed = validateCreateIntervention({
    interventionType:'assignment', targetScope:'group', studentIds:[UUID,UUID2], learningArea:'vocabulary_paraphrase',
    skill:'paraphrasing', context:{ unitNumber:7 }, session:{ mode:'timed', durationMinutes:10 }, externalFollowUp:'teams_quiz'
  });
  assert.equal(timed.session.durationMinutes, 10);
  assert.equal(timed.externalFollowUp, 'teams_quiz');
  assert.throws(() => validateCreateIntervention({ ...timed, session:{ mode:'timed', durationMinutes:7 } }), /duration/i);
});

test('intervention lifecycle only allows sensible forward transitions', () => {
  assert.equal(validateStatusTransition('assigned','started'), 'started');
  assert.equal(validateStatusTransition('started','completed'), 'completed');
  assert.equal(validateStatusTransition('completed','reviewed'), 'reviewed');
  assert.throws(() => validateStatusTransition('assigned','reviewed'), /transition/i);
  assert.throws(() => validateStatusTransition('completed','started'), /transition/i);
});

test('action validator rejects unsupported actions and malformed IDs', () => {
  assert.throws(() => validateInterventionAction({ action:'delete' }), /unsupported/i);
  assert.throws(() => validateInterventionAction({ action:'status', interventionId:'bad', status:'started' }), /uuid/i);
});

test('Teams target export contains teaching targets and no student answer text', () => {
  const text = buildTeamsTargetList([
    { student:'Student One', term:'significant', strand:'production', failureType:'retrieval_failure', typedAnswer:'SECRET' }
  ]);
  assert.match(text, /Student One/);
  assert.match(text, /significant/);
  assert.match(text, /production/);
  assert.equal(text.includes('SECRET'), false);
});

test('intervention schema fix permits either student or class targets without requiring both', () => {
  const sql = fs.readFileSync(new URL('../supabase/migrations/20261017053500_learning_intervention_fix.sql', import.meta.url), 'utf8');
  assert.match(sql, /drop constraint learning_intervention_targets_pkey/i);
  assert.match(sql, /alter column student_id drop not null/i);
  assert.match(sql, /alter column class_id drop not null/i);
  assert.match(sql, /add column id uuid/i);
  assert.match(sql, /outcome_status/i);
});

// Part 4: Consolidate and Recovery as state contracts. No UI. Unresolved behaviour is marked, not invented.
import test from 'node:test';
import assert from 'node:assert/strict';
import { followUpFor, applyMission, newSetState, MISSION_SIZE } from './support/vocabulary-contract/reference-progression.js';
import * as production from '../src/vocabulary/stage-progression.js';
import { unresolvedDecision } from './support/vocabulary-contract/xfail.js';

test('Consolidate: triggered by 6-7, same stage, focused on missed targets, fresh fingerprints, can advance', () => {
  const f = followUpFor('consolidate', ['t3', 't7']);
  assert.deepEqual({ kind: f.kind, sameStage: f.sameStage, focus: f.focus, freshFingerprints: f.freshFingerprints, canAdvance: f.canAdvance }, { kind: 'consolidate', sameStage: true, focus: ['t3', 't7'], freshFingerprints: true, canAdvance: true });
});
test('Recovery: triggered by 5 or below, same stage, scaffolded, missed targets first, fresh questions on retry', () => {
  const f = followUpFor('recovery', ['t1', 't2', 't3']);
  assert.equal(f.sameStage, true); assert.equal(f.scaffolded, true); assert.deepEqual(f.focus, ['t1', 't2', 't3']); assert.equal(f.freshFingerprints, true);
});
test('a pass has no follow-up', () => assert.equal(followUpFor('pass'), null));
test('passing the Consolidate mission advances the stage', () => {
  let s = applyMission(newSetState(), { missionId: 'a', stage: 'recognise', size: MISSION_SIZE, score: 6, complete: true });
  assert.equal(s.pending, 'consolidate'); assert.equal(s.stage, 'recognise');
  s = applyMission(s, { missionId: 'b', stage: 'recognise', size: MISSION_SIZE, score: 8, complete: true });
  assert.equal(s.stage, 'match'); assert.equal(s.pending, null);
});
test('after Recovery a later retry at the same stage can pass; the stage never regressed meanwhile', () => {
  let s = applyMission(newSetState(), { missionId: 'a', stage: 'recognise', size: MISSION_SIZE, score: 2, complete: true });
  assert.equal(s.stage, 'recognise'); assert.equal(s.pending, 'recovery');
  s = applyMission(s, { missionId: 'b', stage: 'recognise', size: MISSION_SIZE, score: 9, complete: true });
  assert.equal(s.stage, 'match');
});

unresolvedDecision({
  rule: 'No permanent dead end: repeated Consolidate / Recovery must have a finite escape (STAGE_CONTRACT v2, Part 4 brief)',
  openQuestion: 'How many consecutive 6-7 or <=5 results trigger the escape, and what happens (advance with a support flag, or teacher flag only)? Audit 2 floated "two 6-7s advance with support flagged; three <=5s raise a teacher flag" but Locked Decisions 1-9 do not adopt it.',
  needed: 'A locked numeric rule, then a property test that no sequence of non-pass results keeps a learner in the same state beyond N missions'
}, 'finite escape from repeated Consolidate / Recovery');
unresolvedDecision({
  rule: 'Teacher/support flag after repeated failure (Part 4 brief)',
  openQuestion: 'What exactly raises the flag, who sees it, and does it block or merely inform?',
  needed: 'A locked flag rule and a flag record shape'
}, 'teacher/support flag for repeated failure');
unresolvedDecision({
  rule: 'Recovery is a scaffolded mini-mission of 5 questions (Audit 2) versus mission_size = 10 enforced by the database',
  openQuestion: 'Is Recovery a full 10-question mission, or a 5-question mini-mission that the current vocabulary_missions constraint (mission_size = 10) and record_vocabulary_mission (ten distinct finished targets) cannot record?',
  needed: 'Decision on Recovery/Consolidate mission size, then a matching migration or a rule that they are 10 questions'
}, 'size of Consolidate and Recovery missions');

test('production followUpFor equals the reference contract', () => {
  for (const outcome of ['pass', 'consolidate', 'recovery', 'incomplete']) assert.deepEqual(production.followUpFor(outcome, ['t1', 't2']), followUpFor(outcome, ['t1', 't2']));
  assert.equal(production.followUpFor('recovery', ['t1']).canAdvance, false);
});
test('production: passing the Consolidate mission advances; Recovery retry passes later; no regression', () => {
  const m = (missionId, stage, score) => ({ missionId, stage, size: MISSION_SIZE, score, complete: true });
  let s = production.applyMissionResult(production.newSetState(), m('a', 'recognise', 6));
  assert.deepEqual([s.stage, s.pending], ['recognise', 'consolidate']);
  s = production.applyMissionResult(s, m('b', 'recognise', 8)); assert.deepEqual([s.stage, s.pending], ['match', null]);
  s = production.applyMissionResult(s, m('c', 'match', 1)); assert.deepEqual([s.stage, s.pending], ['match', 'recovery']);
  s = production.applyMissionResult(s, m('d', 'match', 9)); assert.equal(s.stage, 'apply');
});

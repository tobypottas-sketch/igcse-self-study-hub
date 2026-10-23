// Part 4 (LOCKED): the finite Consolidate / Recovery escape, support flag, mission size and composition. No UI.
import test from 'node:test';
import assert from 'node:assert/strict';
import { applyMissionResult as apply, newSetState, nextMissionKind, composeFollowUp, followUpFor, MISSION_SIZE, MAX_MISSIONS_PER_STAGE, STAGE_ORDER as STAGES } from '../src/vocabulary/stage-progression.js';

let n = 0;
const m = (stage, kind, score, extra = {}) => ({ missionId: `x${++n}`, stage, kind, size: MISSION_SIZE, score, complete: true, ...extra });
const phaseOf = s => `${s.stage}/${s.phase}`;

test('normal stage 8-10 passes and advances with no follow-up', () => {
  const s = apply(newSetState(), m('recognise', 'stage', 8)); assert.equal(phaseOf(s), 'match/stage'); assert.equal(nextMissionKind(s), 'stage');
});
test('6-7 → Consolidate (same stage); Consolidate pass → advance', () => {
  let s = apply(newSetState(), m('recognise', 'stage', 7)); assert.equal(phaseOf(s), 'recognise/consolidate'); assert.equal(nextMissionKind(s), 'consolidate');
  s = apply(s, m('recognise', 'consolidate', 8)); assert.equal(phaseOf(s), 'match/stage'); assert.deepEqual(s.advancedWithSupport, []); assert.deepEqual(s.supportFlags, []);
});
test('Consolidate fail → Recovery; Recovery never advances; then one fresh full stage mission', () => {
  let s = apply(newSetState(), m('recognise', 'stage', 6));
  s = apply(s, m('recognise', 'consolidate', 7)); assert.equal(phaseOf(s), 'recognise/recovery'); assert.equal(nextMissionKind(s), 'recovery');
  s = apply(s, m('recognise', 'recovery', 10)); assert.equal(phaseOf(s), 'recognise/fresh', 'a perfect Recovery still does not advance'); assert.equal(nextMissionKind(s), 'stage');
  s = apply(s, m('recognise', 'stage', 9)); assert.equal(phaseOf(s), 'match/stage'); assert.deepEqual(s.advancedWithSupport, [], 'a passed fresh attempt is not "with support"');
});
test('<=5 on a stage mission goes straight to Recovery (no Consolidate)', () => {
  const s = apply(newSetState(), m('recognise', 'stage', 5)); assert.equal(phaseOf(s), 'recognise/recovery');
});
test('fresh attempt still below 8: advance anyway, mark advanced_with_support, flag ONLY the weak words, never block, never loop', () => {
  let s = apply(newSetState(), m('recognise', 'stage', 3));
  s = apply(s, m('recognise', 'recovery', 6));
  const fresh = m('recognise', 'stage', 6, { missedTargetIds: ['t2', 't5', 't2', 't9', 't7'] });
  s = apply(s, fresh);
  assert.equal(phaseOf(s), 'match/stage', 'visible stage advanced; no further Consolidate/Recovery at Recognise');
  assert.deepEqual(s.advancedWithSupport, [{ stage: 'recognise', missionId: fresh.missionId }]);
  assert.deepEqual(s.supportFlags, [{ stage: 'recognise', missionId: fresh.missionId, targetIds: ['t2', 't5', 't9', 't7'], reason: 'recovery_sequence_not_passed', blocksProgression: false }]);
  assert.equal('studentFlag' in s || 'pathwayFlag' in s, false, 'the flag is per word, not per student or pathway');
});
test('the flag is raised ONLY after the whole sequence fails (not by one weak mission, a Consolidate fail, or a Recovery)', () => {
  let s = apply(newSetState(), m('recognise', 'stage', 2, { missedTargetIds: ['a'] })); assert.deepEqual(s.supportFlags, []);
  s = apply(s, m('recognise', 'recovery', 1, { missedTargetIds: ['a'] })); assert.deepEqual(s.supportFlags, []);
  s = apply(s, m('recognise', 'stage', 4, { missedTargetIds: ['a'] })); assert.equal(s.supportFlags.length, 1);
});
test('the final stage escapes the same way: Mastery completes the Set (Maintain) even on a weak fresh attempt', () => {
  let s = newSetState(); for (const st of STAGES.slice(0, 4)) s = apply(s, m(st, 'stage', 9));
  s = apply(s, m('mastery', 'stage', 1)); s = apply(s, m('mastery', 'recovery', 1)); s = apply(s, m('mastery', 'stage', 2, { missedTargetIds: ['w'] }));
  assert.equal(s.maintain, true); assert.equal(s.stage, 'mastery'); assert.equal(s.advancedWithSupport.at(-1).stage, 'mastery');
});
test('a mission of the wrong kind for the current phase is recorded but moves nothing', () => {
  const s = apply(newSetState(), m('recognise', 'stage', 6));                      // now Consolidate
  assert.equal(phaseOf(apply(s, m('recognise', 'stage', 10))), 'recognise/consolidate');
  assert.equal(phaseOf(apply(s, m('recognise', 'recovery', 10))), 'recognise/consolidate');
});
test('incomplete or duplicate follow-up missions do not move the phase', () => {
  const s = apply(newSetState(), m('recognise', 'stage', 6)); const c = m('recognise', 'consolidate', 5);
  assert.equal(apply(s, { ...c, complete: false }), s);
  const once = apply(s, c); assert.equal(apply(once, c), once);
});
test('NO DEAD END (property): at most four completed missions at any stage, then the learner always moves on, whatever the scores', () => {
  let seed = 11; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  for (let run = 0; run < 300; run += 1) {
    let s = newSetState(); let sinceAdvance = 0; let guard = 0;
    while (!s.maintain && guard++ < 200) {
      const before = s.stage; const kind = nextMissionKind(s);
      s = apply(s, m(s.stage, kind, Math.floor(rnd() * 11), { missedTargetIds: ['w'] })); sinceAdvance += 1;
      assert.ok(sinceAdvance <= MAX_MISSIONS_PER_STAGE, `stuck at ${before} for ${sinceAdvance} missions`);
      if (s.stage !== before || s.maintain) sinceAdvance = 0;
    }
    assert.equal(s.maintain, true, 'every learner finishes the Set');
  }
  assert.equal(MAX_MISSIONS_PER_STAGE, 4);
});
test('worst case (always 0/10) finishes in 3 missions per stage (15 in total), never regressing, with five support flags', () => {
  let s = newSetState(); let count = 0;
  while (!s.maintain) { s = apply(s, m(s.stage, nextMissionKind(s), 0, { missedTargetIds: ['w'] })); count += 1; }
  assert.equal(count, 15); // 0-5 skips Consolidate: stage, recovery, fresh = 3 per stage
  assert.equal(s.advancedWithSupport.length, 5); assert.equal(s.supportFlags.length, 5);
  assert.ok(s.supportFlags.every(f => f.blocksProgression === false));
});

// ---------- Recovery / Consolidate size and composition ----------
const SET = Array.from({ length: 10 }, (_, i) => `t${i + 1}`);
test('follow-up descriptions keep the stage and require 10 questions and fresh fingerprints', () => {
  for (const outcome of ['consolidate', 'recovery']) { const f = followUpFor(outcome, ['t1']); assert.equal(f.size, 10); assert.equal(f.sameStage, true); assert.equal(f.freshFingerprints, true); }
  assert.equal(followUpFor('recovery').scaffolded, true); assert.equal(followUpFor('recovery').canAdvance, false); assert.equal(followUpFor('consolidate').canAdvance, true); assert.equal(followUpFor('pass'), null);
});
test('Consolidate with 3 missed words: all 3 appear first, 7 other Set words fill the mission, never a 3-question mission', () => {
  const f = composeFollowUp({ outcome: 'consolidate', missedTargetIds: ['t2', 't5', 't9'], setTargetIds: SET, missionSeed: 's' });
  assert.equal(f.size, 10); assert.equal(f.slots.length, 10);
  assert.deepEqual(f.slots.slice(0, 3).map(s => s.targetId), ['t2', 't5', 't9']); assert.ok(f.slots.slice(0, 3).every(s => s.weak));
  assert.ok(f.slots.slice(3).every(s => !s.weak)); assert.equal(new Set(f.slots.map(s => s.targetId)).size, 10, 'all ten distinct: no literal repeats');
  assert.ok(f.slots.every(s => s.freshFingerprint)); assert.equal(f.canAdvance, true); assert.equal(f.sameStage, true);
});
test('Recovery is scaffolded, weak words first, different forms, 10 questions, cannot advance on its own', () => {
  const f = composeFollowUp({ outcome: 'recovery', missedTargetIds: SET.slice(0, 6), setTargetIds: SET });
  assert.equal(f.size, 10); assert.equal(f.scaffolded, true); assert.equal(f.canAdvance, false);
  assert.deepEqual(f.slots.slice(0, 6).map(s => s.targetId), SET.slice(0, 6)); assert.ok(f.slots.every(s => s.differentForm && s.freshFingerprint));
});
test('composition is deterministic for a mission seed and varies the filler order with another seed', () => {
  const a = composeFollowUp({ outcome: 'consolidate', missedTargetIds: ['t1'], setTargetIds: SET, missionSeed: 'A' });
  assert.deepEqual(a, composeFollowUp({ outcome: 'consolidate', missedTargetIds: ['t1'], setTargetIds: SET, missionSeed: 'A' }));
  assert.notDeepEqual(a.slots.map(s => s.targetId), composeFollowUp({ outcome: 'consolidate', missedTargetIds: ['t1'], setTargetIds: SET, missionSeed: 'B' }).slots.map(s => s.targetId));
});
test('if a Set somehow has fewer than 10 words, missed words repeat but ONLY flagged for a different question identity; never a short mission', () => {
  const f = composeFollowUp({ outcome: 'consolidate', missedTargetIds: ['t1', 't2'], setTargetIds: SET.slice(0, 6) });
  assert.equal(f.size, 10); const repeats = f.slots.filter(s => s.repeat); assert.equal(repeats.length, 4);
  assert.ok(repeats.every(s => s.weak && s.differentForm && s.freshFingerprint));
});
test('missed words not in the Set are ignored; a pass or incomplete outcome has no follow-up', () => {
  assert.equal(composeFollowUp({ outcome: 'consolidate', missedTargetIds: ['zzz'], setTargetIds: SET }).slots.some(s => s.targetId === 'zzz'), false);
  assert.equal(composeFollowUp({ outcome: 'pass' }), null); assert.equal(composeFollowUp({ outcome: 'incomplete' }), null);
});

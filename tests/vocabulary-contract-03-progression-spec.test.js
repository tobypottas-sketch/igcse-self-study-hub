// Part 3: visible progression (Locked Decision 3) against the production module src/vocabulary/stage-progression.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import { missionOutcome, applyMissionResult as apply, newSetState, STAGE_ORDER as STAGES, MISSION_SIZE } from '../src/vocabulary/stage-progression.js';

const OUTCOMES = [[10, 'pass'], [9, 'pass'], [8, 'pass'], [7, 'consolidate'], [6, 'consolidate'], [5, 'recovery'], [4, 'recovery'], [3, 'recovery'], [2, 'recovery'], [1, 'recovery'], [0, 'recovery']];
let n = 0; const mission = (stage, score, extra = {}) => ({ missionId: `m${++n}`, stage, kind: 'stage', size: MISSION_SIZE, score, complete: true, ...extra });

test('outcome: 10/10 9/10 8/10 pass; 7 and 6 Consolidate; 5 and below Recovery', () => { for (const [score, expected] of OUTCOMES) assert.equal(missionOutcome({ score }), expected, `${score}/10`); });
test('an incomplete or non-standard mission has no outcome and cannot advance', () => {
  assert.equal(missionOutcome({ score: 10, complete: false }), 'incomplete');
  assert.equal(missionOutcome({ score: 5, size: 5 }), 'incomplete');
  assert.equal(missionOutcome({ score: 11 }), 'incomplete');
  const s = newSetState();
  assert.equal(apply(s, mission('recognise', 10, { complete: false })), s);
  assert.equal(apply(s, mission('recognise', 10, { size: 9 })), s);
});
test('a passed mission advances exactly one stage: Recognise → Match → Apply → Recall → Mastery → Maintain', () => {
  let s = newSetState();
  for (let i = 0; i < 4; i += 1) { s = apply(s, mission(STAGES[i], 8)); assert.equal(s.stage, STAGES[i + 1]); assert.equal(s.maintain, false); }
  s = apply(s, mission('mastery', 10));
  assert.equal(s.maintain, true); assert.equal(s.stage, 'mastery', 'a completed Set stays on Mastery (Maintain)');
});
test('a non-pass keeps the same visible stage and sends the learner to Consolidate (6-7) or Recovery (<=5)', () => {
  for (const score of [7, 6, 5, 0]) {
    let s = apply(newSetState(), mission('recognise', 9)); const before = s.stage;
    s = apply(s, mission('match', score));
    assert.equal(s.stage, before, `${score}/10`); assert.equal(s.phase, score >= 6 ? 'consolidate' : 'recovery');
  }
});
test('stars do not gate advancement', () => {
  assert.equal(apply(newSetState(), mission('recognise', 7, { stars: 3 })).stage, 'recognise');
  assert.equal(apply(newSetState(), mission('recognise', 8, { stars: 0 })).stage, 'match');
});
test('one passed mission advances once only, even if submitted twice', () => {
  const m = mission('recognise', 10); const once = apply(newSetState(), m);
  assert.equal(apply(once, m).stage, 'match'); assert.equal(apply(once, m), once);
});
test('replaying an already-passed stage does not double-advance', () => {
  let s = apply(newSetState(), mission('recognise', 10)); s = apply(s, mission('recognise', 10));
  assert.equal(s.stage, 'match'); s = apply(s, mission('match', 8)); assert.equal(s.stage, 'apply');
});
test('a mission without an id, with an unknown stage or unknown kind changes nothing', () => {
  const s = newSetState();
  assert.equal(apply(s, { stage: 'recognise', size: 10, score: 10, complete: true }), s);
  assert.equal(apply(s, mission('bogus', 10)), s);
  assert.equal(apply(s, mission('recognise', 10, { kind: 'bonus' })), s);
});
test('apply never mutates its input', () => {
  const s = newSetState(); const copy = JSON.parse(JSON.stringify(s)); apply(s, mission('recognise', 10)); assert.deepEqual(s, copy);
});
test('the visible stage never moves backwards under any sequence of results (property test)', () => {
  let seed = 7; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  for (let run = 0; run < 200; run += 1) {
    let s = newSetState(); let top = 0;
    for (let i = 0; i < 80; i += 1) {
      s = apply(s, mission(STAGES[Math.floor(rnd() * 5)], Math.floor(rnd() * 11), { kind: ['stage', 'consolidate', 'recovery'][Math.floor(rnd() * 3)], complete: rnd() > 0.1, stars: Math.floor(rnd() * 4) }));
      const idx = STAGES.indexOf(s.stage); assert.ok(idx >= top, 'stage regressed'); top = idx;
      if (s.maintain) assert.equal(s.stage, 'mastery');
    }
  }
});

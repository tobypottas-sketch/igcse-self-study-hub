// Part 3: the approved visible-progression model as an executable specification (reference model), plus production hooks.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as reference from './support/vocabulary-contract/reference-progression.js';
import * as production from '../src/vocabulary/stage-progression.js';
const { STAGES, MISSION_SIZE } = reference;

const OUTCOMES = [[10, 'pass'], [9, 'pass'], [8, 'pass'], [7, 'consolidate'], [6, 'consolidate'], [5, 'recovery'], [4, 'recovery'], [3, 'recovery'], [2, 'recovery'], [1, 'recovery'], [0, 'recovery']];
let n = 0; const mission = (stage, score, extra = {}) => ({ missionId: `m${++n}`, stage, size: MISSION_SIZE, score, complete: true, ...extra });


// The same specification runs against the reference model and the production module.
const IMPLEMENTATIONS = [
  ['reference', reference.missionOutcome, reference.applyMission, reference.newSetState],
  ['production', production.missionOutcome, production.applyMissionResult, production.newSetState]
];
for (const [label, missionOutcome, applyMission, newSetState] of IMPLEMENTATIONS) {
test(`[${label}] outcome: 10/10 9/10 8/10 pass; 7 and 6 Consolidate; 5 and below Recovery`, () => {
  for (const [score, expected] of OUTCOMES) assert.equal(missionOutcome({ score }), expected, `${score}/10`);
});
test(`[${label}] an incomplete or non-standard mission has no outcome and cannot advance`, () => {
  assert.equal(missionOutcome({ score: 10, complete: false }), 'incomplete');
  assert.equal(missionOutcome({ score: 5, size: 5 }), 'incomplete');
  assert.equal(missionOutcome({ score: 11 }), 'incomplete');
  const s = newSetState();
  assert.equal(applyMission(s, mission('recognise', 10, { complete: false })).stage, 'recognise');
  assert.equal(applyMission(s, mission('recognise', 10, { size: 9 })).stage, 'recognise');
});
test(`[${label}] a passed mission advances exactly one stage: Recognise → Match → Apply → Recall → Mastery → Maintain`, () => {
  let s = newSetState();
  for (let i = 0; i < 4; i += 1) { s = applyMission(s, mission(STAGES[i], 8)); assert.equal(s.stage, STAGES[i + 1]); assert.equal(s.maintain, false); }
  s = applyMission(s, mission('mastery', 10));
  assert.equal(s.maintain, true);
  assert.equal(s.stage, 'mastery', 'a completed Set stays on Mastery (Maintain), it does not fall back');
});
test(`[${label}] Consolidate and Recovery keep the same visible stage and never regress it`, () => {
  for (const score of [7, 6, 5, 0]) {
    let s = applyMission(newSetState(), mission('recognise', 9));        // now Match
    const before = s.stage;
    s = applyMission(s, mission('match', score));
    assert.equal(s.stage, before, `${score}/10`);
    assert.equal(s.pending, score >= 6 ? 'consolidate' : 'recovery');
  }
});
test(`[${label}] stars do not gate advancement`, () => {
  assert.equal(applyMission(newSetState(), mission('recognise', 7, { stars: 3 })).stage, 'recognise');
  assert.equal(applyMission(newSetState(), mission('recognise', 8, { stars: 0 })).stage, 'match');
});
test(`[${label}] one passed mission advances once only, even if submitted twice`, () => {
  const m = mission('recognise', 10);
  const once = applyMission(newSetState(), m);
  assert.equal(applyMission(once, m).stage, 'match');
  assert.deepEqual(applyMission(once, m), once);
});
test(`[${label}] replaying an already-passed stage does not double-advance`, () => {
  let s = applyMission(newSetState(), mission('recognise', 10));        // Match
  s = applyMission(s, mission('recognise', 10));                          // replay of Recognise
  assert.equal(s.stage, 'match');
  s = applyMission(s, mission('match', 8)); assert.equal(s.stage, 'apply');
});
test(`[${label}] the visible stage never moves backwards under any sequence of results (property test)`, () => {
  let seed = 7; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  for (let run = 0; run < 200; run += 1) {
    let s = newSetState(); let top = 0;
    for (let i = 0; i < 60; i += 1) {
      const stage = STAGES[Math.floor(rnd() * 5)];
      s = applyMission(s, mission(stage, Math.floor(rnd() * 11), { complete: rnd() > 0.1, stars: Math.floor(rnd() * 4) }));
      const idx = STAGES.indexOf(s.stage);
      assert.ok(idx >= top, 'stage regressed'); top = idx;
      if (s.maintain) assert.equal(s.stage, 'mastery');
    }
  }
});


}
test('production state is not mutated by applyMissionResult', () => {
  const s = production.newSetState(); const copy = JSON.parse(JSON.stringify(s));
  production.applyMissionResult(s, { missionId: 'q', stage: 'recognise', size: 10, score: 10, complete: true });
  assert.deepEqual(s, copy);
});
test('production and reference agree on every score and stage transition', () => {
  for (let score = 0; score <= 10; score += 1) for (const stage of STAGES) {
    const m = { missionId: `${stage}${score}`, stage, size: 10, score, complete: true };
    assert.equal(production.missionOutcome(m), reference.missionOutcome(m));
    assert.deepEqual(production.applyMissionResult(production.newSetState(), m), reference.applyMission(reference.newSetState(), m));
  }
});
test(`[production] a mission without an id, or for an unknown stage, changes nothing`, () => {
  const s = production.newSetState();
  assert.equal(production.applyMissionResult(s, { stage: 'recognise', size: 10, score: 10, complete: true }), s);
  assert.equal(production.applyMissionResult(s, { missionId: 'x', stage: 'bogus', size: 10, score: 10, complete: true }), s);
});

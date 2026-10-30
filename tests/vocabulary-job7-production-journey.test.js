// Job 7, Part 17: production-style Unit 1 journey. Every live pathway x every seeded Set x five stages x four score scripts (clean pass,
// Consolidate then pass, Recovery -> fresh pass, failed Consolidate -> Recovery -> fresh advanced-with-support). Each mission is composed
// exactly as the app composes it (missionTargetIds / composeFollowUp over the SEEDED membership), every target is built by the real
// planner under a server-style missionSeed, and each question type must be in the server allow-list for that pathway stage.
// Set states come from the production pure state machine (parity with the SQL trigger is proven in tests/db/pathway-sets.parity.sql).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { membershipRows } from '../scripts/generate-set-membership-sql.mjs';
import { applyMissionResult, composeFollowUp, newSetState, MISSION_SIZE, STAGE_ORDER } from '../src/vocabulary/stage-progression.js';
import { PATHWAY_ACTIVITY_MAP } from '../supabase/functions/_shared/vocabulary-pathway-contract.js';
import { buildQuestion, content } from './support/vocabulary-contract/bank.js';

const rows = membershipRows().filter(r => r.unit === 1); // this journey simulates Unit 1 only; Unit 2 has its own release test
const sets = new Map();
for (const r of rows) { const k = `${r.pathway}|${r.set}`; (sets.get(k) ?? sets.set(k, { pathway: r.pathway, set: r.set, members: [] }).get(k)).members.push(r.occurrenceId); }
const byOcc = new Map(content.occurrences.map(o => [o.occurrenceId, o]));
const SCRIPTS = {
  clean: [10, 10, 10, 10, 10],
  consolidate_then_pass: [7, 9, 7, 9, 7, 9, 7, 9, 7, 9],
  recovery_then_fresh_pass: [4, 5, 9, 10, 10, 10, 10],
  failed_consolidate_to_fresh_support: [7, 6, 3, 2, 10, 10, 10, 10]
};
const journeyLog = [];

function runJourney(set, scriptName) {
  const script = SCRIPTS[scriptName]; let state = newSetState(); const log = []; let n = 0;
  for (const score of script) {
    if (state.maintain) break;
    n += 1;
    const phase = state.phase; const kind = phase === 'consolidate' ? 'consolidate' : phase === 'recovery' ? 'recovery' : 'stage';
    const missedIds = set.members.slice(0, 10 - score);
    const targetIds = kind === 'stage' || phase === 'fresh' ? [...set.members] : composeFollowUp({ outcome: kind, missedTargetIds: state.weak ?? missedIds, setTargetIds: set.members, missionSeed: `m${n}` }).slots.map(s => s.targetId);
    const types = new Set();
    assert.equal(targetIds.length, MISSION_SIZE, `${set.pathway} Set ${set.set}: mission ${n} has ten targets`);
    assert.equal(new Set(targetIds).size, 10, 'no duplicate target');
    assert.ok(targetIds.every(id => set.members.includes(id)), 'no outside-Set target');
    targetIds.forEach((id, slot) => {
      const q = buildQuestion({ pathwayId: set.pathway, stageId: state.stage, target: byOcc.get(id), k: slot, nonce: `n${n}`, missionSeed: `seed-${n}-${set.set}-abcdefghijkl` });
      assert.ok(PATHWAY_ACTIVITY_MAP[set.pathway][state.stage].includes(q.type), `${set.pathway}/${state.stage}: ${q.type} is in the server allow-list`);
      types.add(q.type);
    });
    const before = { stage: state.stage, phase };
    const next = applyMissionResult(state, { missionId: `j-${scriptName}-${n}`, stage: state.stage, kind, size: 10, score, complete: true, missedTargetIds: missedIds });
    assert.ok(next !== state, 'a complete mission always settles');
    const si = STAGE_ORDER.indexOf(state.stage), ni = STAGE_ORDER.indexOf(next.stage);
    assert.ok(ni >= si && ni - si <= 1, 'never regresses, never skips a stage');
    log.push({ n, ...before, kind, score, size: targetIds.length, types: [...types].sort(), to: next.maintain ? 'maintain' : `${next.stage}/${next.phase}` });
    state = { ...next, weak: missedIds };
  }
  assert.equal(state.maintain, true, `${set.pathway} Set ${set.set} / ${scriptName}: ends in Maintain, stranded at ${state.stage}/${state.phase}`);
  assert.equal(new Set(state.appliedMissionIds).size, state.appliedMissionIds.length, 'no duplicate completion');
  journeyLog.push({ pathway: set.pathway, set: set.set, script: scriptName, missions: log, advancedWithSupport: state.advancedWithSupport.map(s => s.stage) });
  return log;
}

for (const set of sets.values()) for (const scriptName of Object.keys(SCRIPTS)) {
  test(`Unit 1 ${set.pathway} Set ${set.set} · ${scriptName}: five stages reach Maintain with ten-target missions and allow-listed activities`, () => { runJourney(set, scriptName); });
}
test('journey summary: counts and (optionally) the full log for the report', () => {
  const total = journeyLog.reduce((s, j) => s + j.missions.length, 0);
  assert.ok(total > 0);
  const byPathway = {};
  for (const j of journeyLog) byPathway[j.pathway] = (byPathway[j.pathway] ?? 0) + 1;
  assert.deepEqual(Object.keys(byPathway).sort(), ['context', 'meaning', 'precision_use', 'spelling_recall', 'word_families']);
  if (process.env.JOB7_JOURNEY_OUT) fs.writeFileSync(process.env.JOB7_JOURNEY_OUT, JSON.stringify({ sets: sets.size, journeys: journeyLog.length, missions: total, byPathway, journeyLog }, null, 1));
});

// ---- Part 9/Stranding: every seeded Set member must build at every stage under many server-style mission seeds ----
test('no Set member of any live pathway fails to build at any stage under 12 mission seeds (a student can never be stranded by a build failure)', () => {
  let builds = 0;
  for (const r of rows) for (const stage of STAGE_ORDER) for (let i = 0; i < 12; i += 1) {
    builds += 1;
    try { buildQuestion({ pathwayId: r.pathway, stageId: stage, target: byOcc.get(r.occurrenceId), k: i % 10, nonce: `n${i}`, missionSeed: `seed-${i}-abcdefghijkl` }); }
    catch (error) { assert.fail(`${r.pathway}/${stage}/${r.occurrenceId} (seed ${i}): ${error.message}`); }
  }
  assert.ok(builds > 10000);
});

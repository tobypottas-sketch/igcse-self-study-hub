// Wiring regression: the "How do you want to practise?" sheet must offer exactly what startPathwaySession accepts. Before the fix the sheet
// listed every activity of the Set's current AND earlier cleared stages as ready, so clicking an earlier one (or the stale "Last time" pick)
// hit "That activity is not part of this stage of your Set yet." The launch guard is untouched; these tests prove the sheet now agrees with it.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { harness } from './vocabulary-app-harness.mjs';
import { activityFamilies } from '../src/vocabulary/activity-families.js';
import { pathwayPracticeOptions, restrictOptionsToStep, familyServesStage } from '../src/vocabulary/pathway-choice.js';

const store = new Map();
globalThis.localStorage = { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const LIVE = ['meaning', 'context', 'word_families', 'precision_use', 'spelling_recall'];
const STAGES = ['recognise', 'match', 'apply', 'recall', 'mastery'];
const WF_SET_1 = ['preference', 'avoid', 'afford', 'deny', 'arrange', 'recommend', 'threaten', 'resent', 'regret', 'unfamiliar'];
let students = 0;
const fresh = (pathwayId, stage) => harness({ pathwayId, stage, size: 10, setServer: true, userKey: `sheet-${students += 1}`, ...(pathwayId === 'word_families' ? { terms: WF_SET_1 } : {}) });
// Build the options exactly as openPracticeSheet does.
async function sheetFor(h, pathwayId) {
  await h.run('refreshSetRows()');
  const wordStates = await h.run(`wordSetStatesFor('${pathwayId}')`);
  const step = await h.run(`pathwayStep('${pathwayId}')`);
  const options = restrictOptionsToStep(pathwayPracticeOptions({ pathwayId, content: h.state.content, unitMastery: h.state.unitMastery, globalMastery: h.state.globalMastery, seed: `unit-${h.state.currentUnitNumber}:${pathwayId}`, wordStateFor: t => wordStates[t.occurrenceId] ?? null }), step);
  return { options, step };
}

for (const pathwayId of LIVE) for (const stage of STAGES) test(`${pathwayId} @ ${stage}: every activity the sheet offers starts; every other one is locked`, async () => {
  const probe = fresh(pathwayId, stage);
  const { options, step } = await sheetFor(probe, pathwayId);
  assert.equal(step.stage, stage);
  assert.ok(options.some(o => o.status !== 'locked'), 'the current stage always has at least one offered activity');
  for (const option of options) {
    if (option.status === 'locked') continue;
    assert.ok(option.family.stageIds.includes(stage), `${option.family.id} is offered but does not serve ${stage}`);
    const h = fresh(pathwayId, stage);
    await h.run('refreshSetRows()');
    await h.run(`startPathwaySession('${pathwayId}', false, { familyId: '${option.family.id}' })`);
    assert.equal(h.state.pathwayId, pathwayId);
    assert.equal(h.state.pathwayStage, stage);
    assert.equal(h.state.setStep.setNumber, 1);
    assert.ok(h.state.current, 'a question renders');
  }
  for (const option of options.filter(o => !o.family.stageIds.includes(stage))) assert.equal(option.status, 'locked', `${option.family.id} must be locked at ${stage}`);
});

for (const pathwayId of LIVE) test(`${pathwayId}: Recommended resolves to this pathway at the Set's current stage`, async () => {
  const h = fresh(pathwayId, 'match');
  await h.run('refreshSetRows()');
  await h.run(`startPathwaySession('${pathwayId}')`);
  assert.equal(h.state.pathwayId, pathwayId);
  assert.equal(h.state.pathwayStage, 'match');
  assert.ok(h.state.current);
});

test('earlier-stage activity is refused by the launch guard (guard untouched) and locked in the sheet', async () => {
  const h = fresh('context', 'match');
  await h.run('refreshSetRows()');
  const earlier = activityFamilies('context').find(f => !f.stageIds.includes('match') && f.stageIds.every(s => STAGES.indexOf(s) < STAGES.indexOf('match')));
  assert.ok(earlier);
  await assert.rejects(() => h.run(`startPathwaySession('context', false, { familyId: '${earlier.id}' })`), /not part of this stage/);
  const { options } = await sheetFor(h, 'context');
  const row = options.find(o => o.family.id === earlier.id);
  assert.equal(row.status, 'locked'); assert.match(row.hint, /Cleared in this Set/);
});

test('switching pathway leaves no stale pathway/stage/choice', async () => {
  const h = fresh('meaning', 'apply');
  await h.run('refreshSetRows()');
  await h.run(`startPathwaySession('meaning')`);
  assert.equal(h.state.pathwayId, 'meaning');
  await h.run(`startPathwaySession('context', false, null, true)`).catch(() => {});
  if (h.state.pathwayId === 'context') assert.notEqual(h.state.pathwayChoice?.familyId?.split(':')[0], 'meaning');
});

test('restrictOptionsToStep: unit behaviour', () => {
  const ctx = activityFamilies('context');
  const mk = family => ({ family, count: 10, status: 'ready', hint: null, targets: [] });
  const opts = ctx.map(mk);
  const at = stage => restrictOptionsToStep(opts, { stage, firstPassComplete: false });
  for (const stage of STAGES) for (const o of at(stage)) assert.equal(o.status === 'ready', familyServesStage(o.family, stage));
  assert.ok(restrictOptionsToStep(opts, { stage: 'match', firstPassComplete: true }).every(o => o.status === 'locked'), 'Maintain locks everything');
  assert.ok(restrictOptionsToStep(opts, {}).every(o => o.status === 'locked'), 'no stage → nothing offered');
});

test('openPracticeSheet applies restrictOptionsToStep and the launch guard is still present', () => {
  const src = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');
  assert.match(src, /restrictOptionsToStep\(pathwayPracticeOptions\(/);
  assert.match(src, /!family\.stageIds\.includes\(step\.stage\)\) throw notOffered/);
});

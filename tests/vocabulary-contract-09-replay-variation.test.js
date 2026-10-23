// Part 8: replay variation. Confirmed failure: a replay of an unpassed stage serves the same questions in the same order.
import test from 'node:test';
import assert from 'node:assert/strict';
import { newLearner, playMission, lcg, content } from './support/vocabulary-contract/journey-sim.js';
import { LIVE_PATHWAYS, STAGES, buildQuestion } from './support/vocabulary-contract/bank.js';
import { expectedFailure } from './support/vocabulary-contract/xfail.js';
import { newStore, startMission, resumeMission, abandonMission, completeMission, refresh } from './support/vocabulary-contract/reference-mission-identity.js';
import { createSession } from '../src/vocabulary/session.js';
import { isSolvedOrder } from '../src/vocabulary/tile-order.js';

const MIN_DIFFERING = 5;
// Fingerprint = question identity + distractor SET. It deliberately excludes presentation order, seed and nonce.
const sorted = a => (a ? [...a].sort() : null);
export const fingerprint = q => JSON.stringify([q.type, q.contentId, q.contextId, q.prompt, q.sourceText, sorted(q.options), sorted(q.matchOptions), q.matchCue, sorted(q.tiles), q.answers]);
const presentation = q => JSON.stringify(q.options ?? q.matchOptions ?? q.tiles ?? null);
// `seed` = a server-issued mission seed (content + target order + presentation derive from it); without it only the legacy nonce applies.
const mission = (p, stages, nonce, seed = null) => playMission(p, newLearner(p, stages), lcg(1), 1, { record: false, optionNonce: nonce, missionSeed: seed });

// Capacity: how many distinct fingerprints can the content produce for one word at one stage, given mission seeds AND the app's
// seen-content memory (a replay is served material the student has not met when any exists)?
function capacity(pathwayId, stageId) {
  let thin = 0; let total = 0;
  for (const target of content.occurrences) {
    const prints = new Set(); let built = true;
    try {
      const seen = new Set();
      for (let s = 0; s < 4; s += 1) { const q = buildQuestion({ pathwayId, stageId, target, k: 0, missionSeed: `cap_${s}` }); prints.add(fingerprint(q)); if (q.contentId) seen.add(q.contentId); }
      for (const contentId of [...seen]) for (let s = 0; s < 2; s += 1) prints.add(fingerprint(buildQuestion({ pathwayId, stageId, target, k: 0, missionSeed: `cap_m${s}`, used: [contentId] })));
    } catch { built = false; }
    if (!built || prints.size === 0) continue; total += 1; if (prints.size < 2) thin += 1;
  }
  return { thin, total };
}

// ---------- the reference lifecycle (always runs) ----------
test('mission identity lifecycle: new gets a new seed, resume keeps it, abandon-then-new re-seeds, refresh preserves, completion re-seeds', () => {
  const s = newStore(); const a = startMission(s, { pathwayId: 'meaning', stageId: 'recognise' });
  assert.deepEqual(resumeMission(s), a);
  const reloaded = refresh(s); assert.equal(reloaded.current.missionId, a.missionId); assert.equal(reloaded.current.missionSeed, a.missionSeed);
  abandonMission(s); assert.equal(resumeMission(s), null);
  const b = startMission(s, { pathwayId: 'meaning', stageId: 'recognise' });
  assert.notEqual(b.missionSeed, a.missionSeed); assert.notEqual(b.missionId, a.missionId);
  completeMission(s); const c = startMission(s, { pathwayId: 'meaning', stageId: 'recognise' });
  assert.notEqual(c.missionSeed, b.missionSeed); assert.notEqual(c.missionId, b.missionId);
});

// The app side of this lifecycle (server RPC -> session identity -> cache -> resume) is exercised against the REAL app.js in
// vocabulary-contract-14-mission-wiring.test.js.
test('consecutive fresh missions (different server seeds) do not serve the same targets in the same order', () => {
  const a = mission('meaning', [], 'A', 'ms_seed_A'); const b = mission('meaning', [], 'B', 'ms_seed_B');
  assert.notDeepEqual(a.selectedIds, b.selectedIds);
});
test('the SAME mission seed reproduces the same mission exactly (targets, order, questions, presentation)', () => {
  const a = mission('meaning', [], 'A', 'ms_seed_A'); const b = mission('meaning', [], 'A', 'ms_seed_A');
  assert.deepEqual(a.selectedIds, b.selectedIds); assert.deepEqual(a.questions, b.questions);
});

// ---------- per pathway/stage fingerprint variation ----------
for (const pathwayId of LIVE_PATHWAYS) STAGES.forEach((stageId, si) => {
  const stages = STAGES.slice(0, si);
  const a = mission(pathwayId, stages, 'A', 'ms_seed_A');
  // The replay: same learner state, a NEW server mission seed, and the seen-content memory the app keeps between missions.
  const replayer = newLearner(pathwayId, stages); for (const q of a.questions ?? []) if (q.contentId) replayer.used.set(q.occ, [q.contentId]);
  const b = playMission(pathwayId, replayer, lcg(1), 1, { record: false, optionNonce: 'B', missionSeed: 'ms_seed_B' });
  if (!a.questions || !b.questions) return;
  // Compared PER WORD, not per position: reordering the same ten words is not variation, so a word's question in mission B is compared
  // with the question the same word had in mission A (a word absent from A counts as new material).
  const before = new Map(a.questions.map(q => [q.occ, fingerprint(q)]));
  const differing = b.questions.filter(q => before.get(q.occ) !== fingerprint(q)).length;
  const label = `${pathwayId}/${stageId}: at least ${MIN_DIFFERING}/10 question fingerprints differ from the previous mission`;
  if (differing >= MIN_DIFFERING) return test(label, () => assert.ok(differing >= MIN_DIFFERING));
  const cap = capacity(pathwayId, stageId);
  const insufficient = cap.total === 0 || cap.thin > cap.total / 2;
  expectedFailure(insufficient
    ? { rule: 'Replay: >=5/10 fingerprints differ when content allows; otherwise report INSUFFICIENT VARIATION CAPACITY', today: `INSUFFICIENT VARIATION CAPACITY: ${cap.thin}/${cap.total} words yield only one distinct fingerprint under every mission seed plus seen-content memory (served: ${[...new Set(a.questions.map(q => q.type))].join(', ')}); ${differing}/10 differ. Deficit: at least ${cap.thin} further reviewed cue(s) — one more per word — for this stage`, turnsGreenWhen: 'More reviewed content variants (contexts, sentences, distractor sets) exist for this pathway/stage, then missionSeed rotation can satisfy 5/10' }
    : { rule: 'Replay: >=5/10 fingerprints differ when content allows', today: `capacity exists (${cap.total - cap.thin}/${cap.total} words have >=2 variants) but only ${differing}/10 differ`, turnsGreenWhen: 'missionSeed feeds content_seed = H(missionSeed, occurrenceId, slot) so content variants rotate per mission' },
  label, () => assert.ok(differing >= MIN_DIFFERING));
});

// ---------- presentation order ----------
const KINDS = { choice: q => q.options, matching: q => q.matchOptions, tiles: q => q.tiles };
for (const pathwayId of LIVE_PATHWAYS) STAGES.forEach((stageId, si) => {
  const stages = STAGES.slice(0, si);
  const a = mission(pathwayId, stages, 'A'); const b = mission(pathwayId, stages, 'B');
  if (!a.questions || !b.questions) return;
  const byType = new Map();
  a.questions.forEach((q, i) => { const o = b.questions[i]; if (!o) return; const kind = q.tiles ? 'tiles' : q.matchOptions ? 'matching' : q.options ? 'choice' : null; if (!kind) return;
    const key = `${kind}:${q.type}`; const e = byType.get(key) ?? { n: 0, moved: 0 }; e.n += 1; if (presentation(q) !== presentation(o)) e.moved += 1; byType.set(key, e); });
  for (const [key, e] of byType) {
    const [kind, type] = key.split(':'); const label = `${pathwayId}/${stageId} ${type}: ${kind} order varies with the presentation nonce`;
    if (e.moved > 0) test(label, () => assert.ok(e.moved > 0));
    else expectedFailure({ rule: `Replay: ${kind === 'tiles' ? 'spelling tile order' : kind === 'matching' ? 'spelling/match option order' : 'option positions'} vary between missions`, today: `${e.moved}/${e.n} questions changed order when only the presentation nonce changed: the order is seeded from the question seed alone`, turnsGreenWhen: 'the builder mixes presentation_nonce into the option/tile shuffle (as shuffleAnswerOptions already does for some choice types)' }, label, () => assert.ok(e.moved > 0));
  }
});

test('tiles are never served in the solved order (every seed and word)', () => {
  let n = 0;
  for (const target of content.occurrences) for (const s of [0, 1, 2, 3]) {
    let q; try { q = buildQuestion({ pathwayId: 'spelling_recall', stageId: 'apply', target, seed: `t:${s}:${target.occurrenceId}`, nonce: `x${s}` }); } catch { continue; }
    if (!q.tiles) continue; n += 1; assert.equal(isSolvedOrder(q.tiles, q.answers[0]), false, q.term);
  }
  assert.ok(n > 30, `only ${n} tile questions sampled`);
});

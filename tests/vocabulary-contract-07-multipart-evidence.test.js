// Part 6: multi-part Mastery tasks keep evidence per component while the visible item and mission score stay simple.
import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreMultiPart } from './support/vocabulary-contract/reference-evidence.js';
import { STAGE_CONTRACT, PATHWAY_ORDER, STAGE_ORDER, contractTypes, ACTIVITY_REGISTRY } from './support/vocabulary-contract/stage-contract-manifest.js';
import { hook, hookLocation } from './support/vocabulary-contract/production-hooks.js';
import { expectedFailure } from './support/vocabulary-contract/xfail.js';
import { applyPathwayAttempt, freshPathwayProgress } from '../supabase/functions/_shared/vocabulary-pathway-progress.js';

const CASES = [
  [[true, true, true], true, [true, true, true], 3, 1],
  [[true, true, false], false, [true, true, false], 2, 0],
  [[true, false, false], false, [true, false, false], 1, 0],
  [[false, false, false], false, [false, false, false], 0, 0],
  [[true, false], false, [true, false], 1, 0]   // a two-part item
];

function run(fn, label) {
  for (const [components, visible, kept, correct, points] of CASES) {
    const r = fn(components);
    assert.equal(r.visibleCorrect, visible, `${label} ${components}`);
    assert.deepEqual(r.evidence.components, kept, `${label} ${components}`);
    assert.equal(r.evidence.correct, correct, `${label} ${components}`);
    assert.equal(r.evidence.total, components.length);
    assert.equal(r.missionPoints, points, `${label} ${components}: mission score must not be inflated`);
  }
}
test('reference: 3/3 → item correct with [1,1,1]; 2/3, 1/3, 0/3 → item incorrect with components preserved', () => run(scoreMultiPart, 'reference'));
test('reference: partial credit never adds mission points (no score inflation)', () => {
  assert.equal(scoreMultiPart([true, true, false]).missionPoints + scoreMultiPart([true, false, false]).missionPoints, 0);
});
test('manifest: multi-part evidence is declared for Word Families, Context and Precision Mastery only', () => {
  const declared = PATHWAY_ORDER.flatMap(p => STAGE_ORDER.filter(s => STAGE_CONTRACT[p][s].multiPartAllowed).map(s => `${p}/${s}`)).sort();
  assert.deepEqual(declared, ['context/mastery', 'precision_use/mastery', 'word_families/mastery']);
  for (const p of ['word_families', 'context', 'precision_use']) for (const t of contractTypes(p, 'mastery')) assert.equal(ACTIVITY_REGISTRY[t].multiPart, true, t);
});
test('regression guard: today\'s per-word pathway progress sees a multi-part item only as one correct/incorrect attempt', () => {
  const p0 = freshPathwayProgress({ completedStages: ['recognise', 'match', 'apply', 'recall'] });
  const after = applyPathwayAttempt(p0, { stageId: 'mastery', servedStageId: 'mastery', correct: false, firstAttempt: true, supportLevel: 'none', contentId: 'c1' });
  assert.equal(after.stages.mastery.failures, 1); assert.equal(after.stages.mastery.successes, 0);
});
expectedFailure({
  rule: 'Multi-part evidence is recorded per component (Locked Decision 8)',
  today: `no module exports ${hookLocation('scoreMultiPart')}; the attempt metadata allow-list (vocabulary_activity_metadata_is_safe) has no component fields and the multi-part types do not exist`,
  turnsGreenWhen: `${hookLocation('scoreMultiPart')} is implemented, the attempt/evidence schema stores components, and the three multi-part Mastery types exist`
}, 'production multi-part scoring preserves components without inflating mission score', async () => {
  const fn = await hook('scoreMultiPart');
  assert.equal(typeof fn, 'function', 'scoreMultiPart is not exported');
  run(fn, 'production');
});

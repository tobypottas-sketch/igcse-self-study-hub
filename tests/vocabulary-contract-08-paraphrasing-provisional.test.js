// Part 7: Paraphrasing Mastery is provisional (Locked Decision 5).
import test from 'node:test';
import assert from 'node:assert/strict';
import { confidenceFrom } from './support/vocabulary-contract/reference-evidence.js';
import { applyMissionResult as applyMission, newSetState, MISSION_SIZE } from '../src/vocabulary/stage-progression.js';
import { STAGE_CONTRACT, PATHWAY_ORDER, STAGE_ORDER } from './support/vocabulary-contract/stage-contract-manifest.js';
import { hook, hookLocation } from './support/vocabulary-contract/production-hooks.js';
import { expectedFailure, unresolvedDecision } from './support/vocabulary-contract/xfail.js';
import { PATHWAY_ACTIVITY_MAP } from '../supabase/functions/_shared/vocabulary-pathway-contract.js';

const prov = (extra = {}) => ({ productive: true, correct: true, provisional: true, ...extra });
const firm = (extra = {}) => ({ productive: true, correct: true, provisional: false, ...extra });

test('a passed Paraphrasing Mastery mission completes the visible stage', () => {
  let s = newSetState(); for (const st of ['recognise', 'match', 'apply', 'recall']) s = applyMission(s, { missionId: st, stage: st, size: MISSION_SIZE, score: 8, complete: true });
  s = applyMission(s, { missionId: 'pm', stage: 'mastery', size: MISSION_SIZE, score: 9, complete: true });
  assert.equal(s.maintain, true);
});
test('provisional evidence alone never produces secure confidence, however much of it there is', () => {
  assert.notEqual(confidenceFrom([prov(), prov(), prov(), prov(), prov()]), 'secure');
});
test('corroboration by a non-provisional productive success can upgrade confidence', () => {
  assert.equal(confidenceFrom([prov(), firm()]), 'secure');
});
test('the manifest marks only Paraphrasing Mastery as provisional and not able to satisfy "secure" alone', () => {
  for (const p of PATHWAY_ORDER) for (const s of STAGE_ORDER) {
    const e = STAGE_CONTRACT[p][s];
    assert.equal(e.provisionalEvidenceAllowed, p === 'paraphrasing' && s === 'mastery', `${p}/${s}`);
    if (e.provisionalEvidenceAllowed) assert.equal(e.canSatisfySecureAlone, false);
  }
});
test('flagged / sampled status is separate from correctness', () => {
  const a = { correct: true, provisional: true, reviewFlag: 'flagged' }; const b = { ...a, reviewFlag: 'none' };
  assert.equal(a.correct, b.correct);
  assert.equal(confidenceFrom([a]), confidenceFrom([b]));
});
unresolvedDecision({
  rule: 'Teacher review sees only a small sample / flagged cases, never every response (Locked Decision 5)',
  openQuestion: 'What selects a response for the sample or flag (rate, drift-check failure, low anchor overlap, student request), and where is the sample stored?',
  needed: 'A locked selection rule and record shape; then a test that review volume is bounded (e.g. never more than a stated share of responses)'
}, 'sampling / flag criteria for Paraphrasing review');
unresolvedDecision({
  rule: 'Hidden confidence thresholds (what makes a word "secure") — the numbers in reference-evidence.js are placeholders',
  openQuestion: 'LOCKED: do not invent or recalibrate thresholds; preserve the current evidence thresholds exactly (the evidence golden is authoritative). Still open: how a provisional flag changes what "secure" means once corroboration is stored.',
  needed: 'The later job that stores the provisional flag; until then only "provisional alone is never secure; corroboration upgrades" is tested and reference-evidence.js numbers stay placeholders'
}, 'secure-confidence thresholds');

const mastery = PATHWAY_ACTIVITY_MAP.paraphrasing.mastery;
expectedFailure({
  rule: 'Paraphrasing Mastery evidence carries provisional = true and cannot alone create secure confidence',
  today: `production lists ${mastery.join(', ')} at Paraphrasing Mastery with no provisional flag anywhere in the attempt/evidence schema; ${hookLocation('confidenceFrom')} does not exist; and explain_another_way (unmarkable) is still in the ladder`,
  turnsGreenWhen: `attempt evidence stores provisional, ${hookLocation('confidenceFrom')} exists, and explain_another_way is removed from the auto-graded ladder`
}, 'production treats Paraphrasing Mastery evidence as provisional', async () => {
  assert.ok(!mastery.includes('explain_another_way'), 'explain_another_way is still in the auto-graded ladder');
  const fn = await hook('confidenceFrom');
  assert.equal(typeof fn, 'function', 'confidenceFrom is not exported');
  assert.notEqual(fn([prov(), prov(), prov()]), 'secure');
});

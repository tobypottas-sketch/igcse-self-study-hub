// Part 11: golden guard. The per-word evidence engine is being demoted from "visible progression gate" to "confidence/review engine",
// NOT replaced. For identical attempt sequences its output must not change. Regenerate ONLY with UPDATE_GOLDEN=1 and a reviewed diff.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { buildSnapshot, MASTERY_SCENARIOS, PATHWAY_SCENARIOS, STAGE_THRESHOLD_SCENARIOS } from './support/vocabulary-contract/evidence-scenarios.js';
import { MASTERY_THRESHOLDS } from '../supabase/functions/_shared/vocabulary-engine.js';

const file = new URL('./fixtures/vocabulary-contract/evidence-golden.json', import.meta.url);
if (process.env.UPDATE_GOLDEN === '1') writeFileSync(file, `${JSON.stringify(buildSnapshot(), null, 2)}\n`);
const golden = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null;
const now = buildSnapshot();

test('golden fixture exists and covers every scenario', () => {
  assert.ok(golden, 'run once with UPDATE_GOLDEN=1 on reviewed code to create the fixture');
  assert.deepEqual(Object.keys(golden.mastery), Object.keys(MASTERY_SCENARIOS));
  assert.deepEqual(Object.keys(golden.pathway), Object.keys(PATHWAY_SCENARIOS));
  assert.deepEqual(Object.keys(golden.stageThresholds), Object.keys(STAGE_THRESHOLD_SCENARIOS));
});
test('mastery thresholds and review ladder are unchanged', () => {
  assert.deepEqual(MASTERY_THRESHOLDS, { building: 1, secure: 3, masteredProductions: 2, reviewFailuresForDemotion: 2 });
  assert.deepEqual(now.thresholds.reviewDays, [4, 10, 24, 45, 70, 100, 100, 100]); assert.equal(now.thresholds.failureReviewDays, 4);
  assert.deepEqual(now.thresholds, golden.thresholds);
});
for (const name of Object.keys(MASTERY_SCENARIOS)) test(`per-word evidence unchanged: ${name} (successes, failures, strands, contexts, activity types, support, status, review)`, () => assert.deepEqual(now.mastery[name], golden.mastery[name]));
for (const name of Object.keys(PATHWAY_SCENARIOS)) test(`pathway stage evidence unchanged: ${name} (successes, failures, clean, cleanUnassisted, prompt keys, content ids)`, () => assert.deepEqual(now.pathway[name], golden.pathway[name]));
for (const name of Object.keys(STAGE_THRESHOLD_SCENARIOS)) test(`stage completion thresholds unchanged: ${name}`, () => assert.deepEqual(now.stageThresholds[name], golden.stageThresholds[name]));

test('the golden snapshot is not vacuous: stages complete and stay incomplete, and productive/error evidence is recorded', () => {
  const flags = Object.entries(golden.stageThresholds).map(([k, v]) => v.stages[k.split('_')[0]].completed);
  assert.ok(flags.includes(true) && flags.includes(false));
  const last = Object.values(golden.mastery).map(t => t.at(-1));
  assert.ok(last.some(m => m.successfulProductions > 0), 'no productive evidence in snapshot');
  assert.ok(last.some(m => m.reviewFailureCount > 0 || m.recentErrorCount > 0 || m.recoveryCount > 0), 'no failure evidence in snapshot');
});

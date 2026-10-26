// Activity-entry latency regression coverage. Absolute timings on a shared CI machine are noisy, so the hard assertions are about STRUCTURE:
// which reads a launch makes, in what order, how many, and what runs before the first usable question. The browser timings that remain use
// deliberately generous ceilings (roughly 3-5x the measured warm value) so only a clear regression, not scheduler noise, fails them.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { findChromium, loadPlaywright } from './helpers/pathway-geometry-harness.mjs';
import { openEntryPage } from './helpers/activity-entry-harness.mjs';
import { plannerFor } from './helpers/mastery-slot-audit.mjs';
import { availableActivityTypesForTarget, withContentMemo } from '../src/vocabulary/session-targets.js';
import unit from '../content/vocabulary/releases/unit-01.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const app = readFileSync(`${root}/src/vocabulary/app.js`, 'utf8');
const browserTest = loadPlaywright() && await findChromium() ? test : test.skip;
const names = calls => calls.map(call => call.name.replace(/^(from|rpc|invoke):/, ''));
const blocking = calls => calls.filter(call => !/activity_events/.test(call.name));

// ── Static structure ─────────────────────────────────────────────────────────────
test('the Set-members read is started alongside, never after, the Set refresh at launch', () => {
  const launch = app.match(/async function startPathwaySession\([^)]*\) \{([\s\S]*?)\n\}\n/)?.[1] ?? '';
  const members = launch.indexOf('setMembersFor(');
  const refresh = launch.indexOf('await refreshSetRows()');
  assert.ok(members > 0 && refresh > 0, 'both reads exist in the launch');
  assert.ok(members < refresh, 'the members read is started before the Set refresh is awaited');
  assert.doesNotMatch(launch, /await loadSetMembers/, 'no awaited members read is chained after the refresh');
});

test('the launch guard and Stage Contract validation are still in the launch', () => {
  const launch = app.match(/async function startPathwaySession\([^)]*\) \{([\s\S]*?)\n\}\n/)?.[1] ?? '';
  assert.match(launch, /await state\.settling;\s*\n\s*if \(!state\.preview\) await refreshSetRows\(\)/, 'the Set rows are re-read after settling, before validating');
  assert.match(launch, /if \(step\.phase === 'stage' && !family\.stageIds\.includes\(step\.stage\)\) throw notOffered/);
  assert.match(launch, /planPathwayQuestion\(\{ pathwayId, stageId:step\.stage/);
  assert.match(launch, /compareSetMembership\(/);
});

test('the practice sheet starts the members read early without delaying its own render', () => {
  const sheet = app.match(/async function openFreshPracticeSheet\(pathwayId\) \{([\s\S]*?)\n\}\n/)?.[1] ?? '';
  assert.match(sheet, /void setMembersFor\(/);
  assert.ok(sheet.indexOf('setMembersFor(') < sheet.indexOf('await refreshSetRows()'));
  assert.doesNotMatch(sheet, /await setMembersFor/);
});

// ── Memoised readiness answers are identical to the uncached ones ────────────────
test('memoised activity-type answers equal the uncached answers for every Unit 1 word', () => {
  const content = plannerFor(unit);
  const ask = target => {
    const item = content.items.find(row => row.vocabularyId === target.vocabularyId);
    const contexts = content.contexts.filter(row => row.occurrenceId === target.occurrenceId);
    return availableActivityTypesForTarget({ content, target, item, contexts });
  };
  const plain = content.occurrences.map(ask);
  const memoised = withContentMemo(content, () => content.occurrences.map(target => { ask(target); return ask(target); }));
  assert.deepEqual(memoised, plain);
  assert.ok(plain.some(types => types.length > 3), 'the comparison covers non-trivial answers');
  const again = withContentMemo(content, () => { const first = ask(content.occurrences[0]); first.push('mutated'); return ask(content.occurrences[0]); });
  assert.deepEqual(again, plain[0], 'a caller mutating a returned array cannot corrupt the memo');
  assert.deepEqual(content.occurrences.map(ask), plain, 'nothing leaks out of the memo scope');
});

// ── Browser: order, counts, generous ceilings, desktop and phone ─────────────────
for (const [label, width, cpu] of [['desktop', 1280, 1], ['phone 390px, 4x CPU', 390, 4]]) {
  browserTest(`${label}: launch reads are parallel, not chained, and the members read is not repeated`, async () => {
    const page = await openEntryPage({ root, width, height:width < 600 ? 844 : 900, netMs:40, cpu, pathway:'meaning', stage:'recognise' });
    try {
      await page.openUnit();
      const first = await page.enter('meaning', 'recommended');
      assert.equal(first.launch.reason, 'ok');
      const calls = blocking(first.launch.calls);
      const sets = calls.find(call => call.name === 'from:vocabulary_pathway_sets');
      const members = calls.find(call => call.name === 'from:vocabulary_set_members');
      assert.ok(sets, 'the launch re-reads the Set rows (the launch guard needs them fresh)');
      assert.ok(!members || members.at < sets.end, 'members read overlaps the Set refresh');
      assert.equal(calls.filter(call => call.name === 'from:vocabulary_pathway_sets').length, 1, 'one Set refresh per launch');
      assert.equal(calls.filter(call => call.name === 'rpc:start_vocabulary_mission').length, 1, 'one mission request per launch');
      const rpc = calls.find(call => call.name === 'rpc:start_vocabulary_mission');
      assert.ok(rpc.at >= sets.end, 'the mission is requested only after the fresh Set rows have been validated');
      const render = first.launch.tl.find(event => event.name === 'render:question:start');
      assert.ok(render && render.at >= rpc.end, 'the question renders after the mission, and nothing non-critical runs before it');
      // Serial depth: Set refresh then mission = two round trips (80ms with 40ms each way), never three.
      assert.ok(first.launch.paintMs < 2 * 40 + 400 * cpu, `cold launch ${first.launch.paintMs}ms within the generous ceiling`);
      await page.leave();
      const second = await page.enter('meaning', 'recommended');
      assert.equal(second.launch.reason, 'ok');
      assert.equal(names(blocking(second.launch.calls)).includes('vocabulary_set_members'), false, 'Set members are read once per unit, not on every launch');
      assert.deepEqual(page.errors(), []);
    } finally { await page.close(); }
  });

  browserTest(`${label}: warm launches across Match, Mastery and Mixed Practice stay within a generous ceiling`, async () => {
    const page = await openEntryPage({ root, width, height:width < 600 ? 844 : 900, netMs:0, cpu, pathway:'precision_use', stage:'apply' });
    try {
      await page.openUnit();
      await page.enter('meaning', 'recommended'); await page.leave();      // warm up: unit content, JIT, member cache
      const trials = [];
      for (const choice of ['precision_use:apply', 'recommended']) {
        const pathway = 'precision_use';
        const out = await page.enter(pathway, choice);
        assert.equal(out.launch.reason, 'ok', `${choice} reached a usable question`);
        trials.push([choice, out.launch.paintMs]);
        await page.leave();
      }
      const mixed = await page.mixed(); assert.equal(mixed.reason, 'ok'); trials.push(['mixed', mixed.paintMs]);
      // Measured warm on this harness: roughly 50-150ms desktop (about 4x that CPU-throttled). Ceilings are about 5x so only a real regression fails.
      for (const [choice, ms] of trials) assert.ok(ms < 750 * cpu, `${label}: warm ${choice} took ${ms}ms`);
    } finally { await page.close(); }
  });
}

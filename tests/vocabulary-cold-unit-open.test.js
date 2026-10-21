import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { findChromium, loadPlaywright } from './helpers/pathway-geometry-harness.mjs';
import { cachedOpen, coldOpen, runColdUnitFlow, staleRequest } from './helpers/cold-unit-flow-harness.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const app = readFileSync(`${root}/src/vocabulary/app.js`, 'utf8');
const css = readFileSync(`${root}/vocabulary-layout-stability.css`, 'utf8');
const browserTest = loadPlaywright() && await findChromium() ? test : test.skip;

const openUnit = app.match(/async function openUnit\(unitNumber\) \{([\s\S]*?)\n\}\n/)?.[1] ?? '';

// ── Lifecycle, statically ──────────────────────────────────────────────────────────────────────────
test('cold openUnit never renders the unit before its data is ready', () => {
  assert.ok(openUnit, 'openUnit found');
  const renders = [...openUnit.matchAll(/renderCurrentUnit\(\)/g)].map(match => match.index);
  assert.equal(renders.length, 2, 'one render for the cached path, one for the loaded cold path');
  const cachedBlock = openUnit.slice(openUnit.indexOf('if (cached) {'), openUnit.indexOf('state.loadingUnit = unitNumber'));
  assert.match(cachedBlock, /renderCurrentUnit\(\)/, 'cached units still render immediately');
  const awaitLoad = openUnit.indexOf('await Promise.all([contentPromise, masteryPromise])');
  assert.ok(awaitLoad > 0);
  assert.ok(renders[1] > awaitLoad, 'the cold render happens only after content and mastery are awaited');
  assert.ok(openUnit.indexOf('renderCurrentUnit()') < openUnit.indexOf('state.loadingUnit = unitNumber'));
  assert.doesNotMatch(openUnit, /state\.content = null/, 'no placeholder state');
  assert.doesNotMatch(openUnit, /attempts\(\)\.reset/);
});

test('stale unit loads are rejected by a request token', () => {
  assert.match(openUnit, /const request = state\.unitRequest \+= 1/);
  assert.match(openUnit, /if \(request !== state\.unitRequest\) return;/);
  assert.match(app, /async function showHome\(\) \{\s*state\.unitRequest \+= 1/, 'going Home also invalidates an in-flight load');
});

test('loading is shown on the clicked card only, without taking space', () => {
  assert.match(css, /\.vocab-unit-card\[data-loading="true"\]::after\{[^}]*position:absolute/);
  assert.doesNotMatch(css, /\.vocab-unit-card\[data-loading="true"\][^{]*\{[^}]*(?:min-height|height:\s*\d+px;\s*margin|padding)/);
  assert.match(css, /prefers-reduced-motion:reduce\)\{\s*\.vocab-unit-card\[data-loading="true"\]::after\{animation:none\}/);
});

// ── The real flow, in Chromium: real app.js + views + data.js, starting from Home ──────────────────
browserTest('cold unit open: Home stays mounted while loading, then the unit renders exactly once', async () => {
  const r = await runColdUnitFlow({ root, scenario:coldOpen });
  for (const during of [r.duringDelay, r.duringDelayLater]) {
    assert.equal(during.homeMounted, true, 'Home stays mounted during the delay');
    assert.equal(during.unitMounted, false, 'no unit DOM yet');
    assert.equal(during.pathwayCards, 0, 'no intermediate pathway cards');
    assert.equal(during.docHeight, r.beforeClick.docHeight, 'page height does not change during loading');
    assert.equal(during.rootHeight, r.beforeClick.rootHeight, 'root geometry does not change during loading');
    assert.deepEqual(during.busy, ['1'], 'only the clicked card is marked busy');
  }
  assert.equal(r.duringDelay.scrollY, r.duringDelayLater.scrollY, 'no scroll movement while waiting');
  assert.equal(r.after.unitMounted, true);
  assert.equal(r.after.pathwayCards, 6);
  assert.equal(r.after.title, 'Unit 1 title');
  assert.deepEqual(r.after.busy, []);
  assert.equal(r.log.unitRenders, 1, 'exactly one final unit render');
  assert.equal(r.log.replacements, 1, 'the root is replaced exactly once (Home -> final unit)');
  assert.equal(r.log.homeRenders, 0);
  assert.equal(r.log.events.length, 1, 'no temporary unit render and no second render afterwards');
  assert.deepEqual(r.settled, r.after, 'nothing changes after the final render');
  assert.equal(r.log.shifts.reduce((sum, entry) => sum + entry.value, 0), 0, 'layout-shift score is zero across the whole flow');
});

browserTest('cached unit still renders immediately, without reloading or waiting', async () => {
  const r = await runColdUnitFlow({ root, scenario:cachedOpen });
  assert.equal(r.immediately.unitMounted, true, 'rendered synchronously on click');
  assert.equal(r.immediately.pathwayCards, 6);
  assert.equal(r.unitRendersForCachedOpen, 1);
  assert.equal(r.loadCalls, 1, 'the unit data was not loaded a second time');
  assert.deepEqual(r.later, r.immediately);
});

browserTest('a slow first request cannot overwrite a later unit navigation', async () => {
  const r = await runColdUnitFlow({ root, scenario:staleRequest });
  assert.equal(r.afterFirstClick.homeMounted, true);
  assert.equal(r.afterSecondUnit.title, 'Unit 2 title');
  assert.equal(r.afterStaleResolves.title, 'Unit 2 title', 'Unit 1 finished later but did not render over Unit 2');
  assert.equal(r.rendersAddedByStale, 0);
  assert.equal(r.log.unitRenders, 1);
  assert.deepEqual(r.afterStaleResolves.busy, []);
});

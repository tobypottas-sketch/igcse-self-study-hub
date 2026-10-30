// The Unit Check is unit-aware: a unit has a check only if one is registered with at least one form; otherwise no card is shown.
import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { UNIT_CHECKS, unitCheckFor } from '../content/vocabulary/checks/index.js';
import unit1Check from '../content/vocabulary/checks/unit-01-check.js';
import { findChromium, loadPlaywright } from './helpers/pathway-geometry-harness.mjs';
import { openEntryPage } from './helpers/activity-entry-harness.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const browserTest = loadPlaywright() && await findChromium() ? test : test.skip;

test('registry: Units 1 and 4 have their checks; units without an authored check have none', () => {
  assert.equal(unitCheckFor(1), unit1Check);
  assert.deepEqual(Object.keys(unit1Check.forms), ['A', 'B', 'C']);
  for (const unit of [2, 3, 20, 0, 21, NaN, null, undefined, '2']) assert.equal(unitCheckFor(unit), null, `unit ${unit}`);
  assert.deepEqual(Object.keys(UNIT_CHECKS), ['1', '4']);
});

test('registry: a registered check with no forms is treated as no check', () => {
  assert.equal(unitCheckFor(2, { 2:{ forms:{} } }), null);
  assert.equal(unitCheckFor(2, { 2:{} }), null);
  const check = { forms:{ A:{} } };
  assert.equal(unitCheckFor(2, { 2:check }), check);
});

browserTest('Unit 1 shows the Unit Check card and a Unit 2 screen does not', async () => {
  const api = await openEntryPage({ root, netMs:0 });
  try {
    await api.openUnit();
    await api.page.waitForSelector('[data-unit-check-card]');
    assert.equal(await api.page.locator('[data-unit-check-card]').count(), 1);
    assert.equal(await api.page.locator('[data-unit-check-action="start"]').count() >= 1, true, 'Unit 1 can start its check');
    // Present the same unit screen as Unit 2: the card must go away and must not come back.
    await api.page.evaluate(() => {
      document.querySelector('[data-unit-check-card]').remove();
      document.querySelectorAll('.vocab-unit-id__badge').forEach(el => { el.textContent = 'Unit 2'; });
    });
    await api.page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
    assert.equal(await api.page.locator('[data-unit-check-card]').count(), 0, 'no card for a unit without a check');
    assert.equal(await api.page.locator('[data-unit-check-action]').count(), 0, 'no Unit Check button');
    assert.doesNotMatch(await api.page.locator('#vocabularyApp').innerText(), /Unit Vocabulary Check|Unit Check/i);
    assert.deepEqual(api.errors(), []);
  } finally { await api.close(); }
});

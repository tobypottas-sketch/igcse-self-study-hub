// Student Activity UI consolidation: structure and compactness only, synthetic anonymised data.
import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { findChromium, loadPlaywright } from './helpers/pathway-geometry-harness.mjs';
import { openActivityDemo } from './helpers/admin-activity-harness.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const browserTest = loadPlaywright() && await findChromium() ? test : test.skip;

for (const width of [1280, 820, 390]) {
  browserTest(`activity list at ${width}px: unit-specific progress and no automatic attention flag`, async () => {
    const demo = await openActivityDemo({ root, width });
    try {
      await demo.show('list');
      const { page } = demo;
      assert.equal(await page.locator('[data-activity-row]').count(), 14);
      const text = await page.evaluate(() => { const clone = document.querySelector('.activity-table').cloneNode(true); clone.querySelectorAll('.vocab-sr').forEach(el => el.remove()); return clone.textContent; });
      assert.doesNotMatch(text, /Meaning: recognise|No Unit Check yet|None new/i);
      assert.equal(await page.locator('.activity-table[data-single-class="true"]').count(), 1);
      assert.ok(await page.locator('[data-activity-row] .vocab-pill[data-tone="done"]').count() >= 1, 'merits show as alert pills');
      assert.equal(await page.locator('[data-action="activity-student"]').count(), 14);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'no horizontal page scroll');
      assert.ok(await page.evaluate(() => { const w = document.querySelector('.admin-table-wrap'); return w.scrollWidth <= w.clientWidth + 1; }), 'table does not scroll sideways');
      assert.deepEqual(demo.errors(), []);
    } finally { await demo.close(); }
  });
}

browserTest('activity detail keeps every section and its actions', async () => {
  const demo = await openActivityDemo({ root, width: 1280 });
  try {
    await demo.show('detail');
    const text = await demo.page.locator('.activity-detail-grid').innerText();
    for (const heading of ['Recorded engagement', 'Vocabulary progression', 'Vocabulary merits', 'Unit Checks', 'Recent activity']) assert.match(text, new RegExp(heading));
    assert.equal(await demo.page.locator('[data-action="activity-back"]').count(), 1);
    assert.equal(await demo.page.locator(".activity-rows li[data-pathway]").count(), 6);
    assert.doesNotMatch(text,/needs attention|stalled/i);
    assert.deepEqual(demo.errors(), []);
  } finally { await demo.close(); }
});

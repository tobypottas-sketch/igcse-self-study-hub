// Student Activity UI consolidation: structure and compactness only, synthetic anonymised data.
import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { findChromium, loadPlaywright } from './helpers/pathway-geometry-harness.mjs';
import { openActivityDemo } from './helpers/admin-activity-harness.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const browserTest = loadPlaywright() && await findChromium() ? test : test.skip;

for (const width of [1280, 820, 390]) {
  browserTest(`activity list at ${width}px: six pathway pills per started student, no prose, no horizontal overflow`, async () => {
    const demo = await openActivityDemo({ root, width });
    try {
      await demo.show('list');
      const { page } = demo;
      assert.equal(await page.locator('[data-activity-row]').count(), 14);
      assert.equal(await page.locator('[data-activity-row] .activity-strip').count(), 13);
      assert.equal(await page.locator('[data-activity-row]:first-child .activity-strip__cell').count(), 6);
      assert.doesNotMatch(await page.locator('.activity-table').innerText(), /Meaning: recognise/i);
      assert.equal(await page.locator('[data-action="activity-student"]').count(), 14);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'no horizontal page scroll');
      assert.ok(await page.evaluate(() => { const w = document.querySelector('.admin-table-wrap'); return w.scrollWidth <= w.clientWidth + 1; }), 'table does not scroll sideways');
      if (width === 1280) assert.ok(await page.evaluate(() => document.querySelector('[data-activity-row]').getBoundingClientRect().height) < 70, 'rows are short');
      assert.equal(await page.locator('[data-needs-attention="true"] .vocab-pill[data-tone="warn"]').count() >= 3, true);
      assert.deepEqual(demo.errors(), []);
    } finally { await demo.close(); }
  });
}

browserTest('activity detail keeps every section and its actions', async () => {
  const demo = await openActivityDemo({ root, width: 1280 });
  try {
    await demo.show('detail');
    const text = await demo.page.locator('.activity-detail-grid').innerText();
    for (const heading of ['Usage', 'Vocabulary progression', 'Needs attention', 'Merits', 'Unit Checks', 'Recent activity']) assert.match(text, new RegExp(heading));
    assert.equal(await demo.page.locator('[data-action="activity-back"]').count(), 1);
    assert.equal(await demo.page.locator('.activity-strip__cell').count(), 6);
    assert.ok(await demo.page.evaluate(() => document.documentElement.scrollHeight) < 1100);
    assert.deepEqual(demo.errors(), []);
  } finally { await demo.close(); }
});

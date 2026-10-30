// Teacher/admin UI consolidation: structure and compactness only, on synthetic anonymised data. No new analytics.
import test from 'node:test';
import assert from 'node:assert/strict';
import { findChromium, loadPlaywright } from './helpers/pathway-geometry-harness.mjs';
import { openTeacherDemo } from './helpers/teacher-ui-harness.mjs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const browserTest = loadPlaywright() && await findChromium() ? test : test.skip;

async function view(width, name) {
  const demo = await openTeacherDemo({ root, width });
  await demo.show(name);
  return demo;
}

for (const width of [1280, 390]) {
  browserTest(`overview at ${width}px: one primary action, pathways as one table, no percentages, no overflow`, async () => {
    const demo = await view(width, 'overview');
    try {
      const { page } = demo;
      assert.equal(await page.locator('.vocab-button--primary').count(), 1);
      assert.equal(await page.locator('.vocab-teacher-actions').count(), 1);
      assert.equal(await page.locator('table.vocab-matrix').count(), 1);
      assert.equal(await page.locator('table.vocab-matrix thead th').count(), 7);
      assert.equal(await page.locator('table.vocab-matrix tbody tr').count(), 14);
      assert.doesNotMatch(await page.locator('.vocab-shell--teacher').innerText(), /\d+\s*%/);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'no horizontal page scroll');
      if (width === 1280) assert.ok(await page.evaluate(() => document.documentElement.scrollHeight) < 2400, 'overview stays compact');
      assert.deepEqual(demo.errors(), []);
    } finally { await demo.close(); }
  });
  browserTest(`profile at ${width}px: one primary action and a compact page`, async () => {
    const demo = await view(width, 'profile');
    try {
      assert.equal(await demo.page.locator('.vocab-button--primary').count(), 1);
      assert.equal(await demo.page.locator('.vocab-teacher-actions').count(), 1);
      if (width === 1280) assert.ok(await demo.page.evaluate(() => document.documentElement.scrollHeight) < 1300);
      assert.deepEqual(demo.errors(), []);
    } finally { await demo.close(); }
  });
}

browserTest('readiness: healthy pathways are one line, locked ones expand with stage coverage', async () => {
  const demo = await view(1280, 'readiness-broken');
  try {
    const { page } = demo;
    const rows = await page.$$eval('[data-readiness-pathway]', list => list.map(el => ({ live: el.dataset.live, expanded: el.dataset.expanded, stages: el.querySelectorAll('.vocab-readiness__stages').length })));
    assert.equal(rows.length, 6);
    for (const row of rows) {
      if (row.live === 'true') assert.deepEqual([row.expanded, row.stages], ['false', 0]);
      else assert.deepEqual([row.expanded, row.stages], ['true', 1]);
    }
    assert.ok(rows.some(row => row.live === 'false'));
  } finally { await demo.close(); }
});

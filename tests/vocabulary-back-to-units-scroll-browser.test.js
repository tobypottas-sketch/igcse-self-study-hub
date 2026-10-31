import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { findChromium, loadPlaywright, serve } from './helpers/pathway-geometry-harness.mjs';
import { installRoutes, FAKE_SUPABASE } from './helpers/question-latency-harness.mjs';

// Root cause being guarded: the unit screen is usually scrolled far down. Back painted the much shorter Home without resetting
// that offset, so Home appeared clamped to its bottom (title and first cards scrolled away) and stayed there: the whole screen
// jumped to an unrelated position. Back must return to where All units was left, from the very first painted frame.
const playwright = loadPlaywright();
const executablePath = await findChromium();
const browserTest = playwright && executablePath ? test : test.skip;

async function openApp(root, origin, browser) {
  const page = await browser.newPage({ viewport:{ width:390, height:600 } });
  await installRoutes(page, root);
  await page.route('**/src/supabase.js', route => route.fulfill({ contentType:'text/javascript', body:FAKE_SUPABASE.replace('Promise.resolve(run(target)).then(resolve, reject)', 'new Promise(done => setTimeout(done, window.__latency ?? 0)).then(() => run(target)).then(resolve, reject)') }));
  await page.goto(`${origin}/vocabulary.html`);
  await page.waitForSelector('.vocab-unit-card');
  await page.waitForTimeout(500);
  return page;
}
const scrollTo = (page, top) => page.evaluate(position => { window.scrollTo({ top:position, behavior:'instant' }); }, top);
const sampleBack = page => page.evaluate(() => new Promise(resolve => {
  window.__latency = 250; const start = performance.now(); const seen = [];
  const tick = () => { seen.push(Math.round(window.scrollY)); if (performance.now() - start < 900) requestAnimationFrame(tick); else resolve(seen); };
  document.querySelector('[data-action="back-units"]').click();
  requestAnimationFrame(tick);
}));

for (const [name, homeTop] of [['from the top of All units', 0], ['from partway down All units', 200]]) {
  browserTest(`Back returns to where All units was left (${name}), on every painted frame, however far the unit screen was scrolled`, async () => {
    const root = fileURLToPath(new URL('..', import.meta.url));
    const { server, origin } = await serve(root);
    const browser = await playwright.chromium.launch({ executablePath });
    try {
      const page = await openApp(root, origin, browser);
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      for (let round = 1; round <= 2; round += 1) {
        await scrollTo(page, homeTop);
        const before = await page.evaluate(() => Math.round(window.scrollY));
        assert.equal(before, homeTop, 'All units is scrollable to the position under test');
        await page.evaluate(() => document.querySelector('.vocab-unit-card[data-unit="1"]').click());   // not page.click(): that scrolls the card into view first
        await page.waitForSelector('.vocab-pathway-card');
        await page.waitForTimeout(400);
        await scrollTo(page, 99999);
        assert.ok(await page.evaluate(() => window.scrollY) > 1000, 'the unit screen really is scrolled far down');
        const frames = await sampleBack(page);
        assert.ok(frames.length > 20);
        assert.deepEqual([...new Set(frames)], [homeTop], `round ${round}: every painted frame, across both Home paints, is at the position All units was left`);
        await page.waitForTimeout(300);
      }
      assert.deepEqual(errors, []);
    } finally { await browser.close(); server.close(); }
  });
}

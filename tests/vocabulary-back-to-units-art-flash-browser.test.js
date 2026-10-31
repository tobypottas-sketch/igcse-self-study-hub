import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { findChromium, loadPlaywright, serve } from './helpers/pathway-geometry-harness.mjs';
import { installRoutes } from './helpers/question-latency-harness.mjs';

// Root cause being guarded: Back to All units rebuilds the screen with innerHTML, which created brand-new <img>/slot elements.
// Every cover then started hidden (opacity 0, placeholder SVG hidden) until its own load event fired, and faded back in over
// ~300ms: the visible flash. A PNG that has already loaded must be revealed in the same task, so no painted frame is hidden.
const playwright = loadPlaywright();
const executablePath = await findChromium();
const browserTest = playwright && executablePath ? test : test.skip;

browserTest('Back to All units never paints a hidden or fading cover: every painted frame shows the loaded PNG at full opacity, on every return', async () => {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const { server, origin } = await serve(root);
  const browser = await playwright.chromium.launch({ executablePath });
  try {
    const page = await browser.newPage({ viewport:{ width:1280, height:900 } });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await installRoutes(page, root);
    await page.goto(`${origin}/vocabulary.html`);
    await page.waitForSelector('.vocab-unit-card');
    await page.waitForFunction(() => document.querySelectorAll('.vocab-unit-card [data-art-slot].is-png-ready').length >= 1);
    for (let round = 1; round <= 3; round += 1) {
      await page.click('.vocab-unit-card[data-unit="1"]');
      await page.waitForSelector('.vocab-pathway-card');
      await page.waitForFunction(() => document.querySelector('.vocab-unit-hero [data-art-slot].is-png-ready'));
      const frames = await page.evaluate(() => new Promise(resolve => {
        const rootEl = document.getElementById('vocabularyApp'); const seen = []; const start = performance.now();
        const tick = () => {
          const slots = [...rootEl.querySelectorAll('.vocab-unit-card [data-art-slot]')];
          seen.push(slots.map(slot => { const image = slot.querySelector('img[data-art-png]'); return { ready:slot.classList.contains('is-png-ready'), opacity:image ? Number(getComputedStyle(image).opacity) : -1, painted:Boolean(image?.complete && image.naturalWidth), svgHidden:getComputedStyle(slot.querySelector('.study-art__svg')).visibility === 'hidden' }; }));
          if (performance.now() - start < 700) requestAnimationFrame(tick); else resolve(seen);
        };
        document.querySelector('[data-action="back-units"]').click();
        requestAnimationFrame(tick);
      }));
      assert.ok(frames.length > 10, `round ${round}: sampled the return`);
      for (const [index, frame] of frames.entries()) {
        assert.ok(frame.length >= 1, `round ${round} frame ${index}: Home covers are present`);
        for (const slot of frame) assert.deepEqual(slot, { ready:true, opacity:1, painted:true, svgHidden:true }, `round ${round} frame ${index}: a painted frame must show the loaded PNG at full opacity (no hidden art, no fade-in)`);
      }
      // Home -> Unit still works afterwards and the unit banner is the real loaded PNG.
      await page.click('.vocab-unit-card[data-unit="1"]');
      await page.waitForSelector('.vocab-pathway-card');
      const hero = await page.evaluate(() => { const image = document.querySelector('.vocab-unit-hero [data-art-slot] img[data-art-png]'); return { connected:image?.isConnected, natural:image?.naturalWidth > 0, ready:Boolean(image?.closest('[data-art-slot]')?.classList.contains('is-png-ready')) }; });
      assert.deepEqual(hero, { connected:true, natural:true, ready:true });
      await page.click('[data-action="back-units"]');
      await page.waitForSelector('.vocab-unit-card');
    }
    assert.deepEqual(errors, []);
  } finally { await browser.close(); server.close(); }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { findChromium, loadPlaywright, serve } from './helpers/pathway-geometry-harness.mjs';
import { installRoutes, FAKE_SUPABASE } from './helpers/question-latency-harness.mjs';

// Root cause being guarded: Back paints Home twice (the cached snapshot, then the authoritative showHome() refresh once its data
// arrives). Each paint inserts brand-new `.vocab-unit-card.study-enter` elements, and `study-enter` is an entrance animation
// (opacity .2 + 10px slide), so the whole card grid dimmed and slid in on the restore and AGAIN on the refresh: the screen flash.
// This asserts whole-screen stability on every painted frame, across both paints, not just the cover art (see the #309 test).
const playwright = loadPlaywright();
const executablePath = await findChromium();
const browserTest = playwright && executablePath ? test : test.skip;

for (const reducedMotion of ['no-preference', 'reduce']) {
  browserTest(`Back to All units keeps the whole screen stable across both Home paints (${reducedMotion} motion): shell present, cards fully opaque, no entrance animation replays`, async () => {
    const root = fileURLToPath(new URL('..', import.meta.url));
    const { server, origin } = await serve(root);
    const browser = await playwright.chromium.launch({ executablePath });
    try {
      const context = await browser.newContext({ viewport:{ width:1280, height:900 }, reducedMotion });
      const page = await context.newPage();
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      await installRoutes(page, root);
      // Realistic read latency, so the refresh lands well after the cached paint (two distinct, separated paints).
      await page.route('**/src/supabase.js', route => route.fulfill({ contentType:'text/javascript', body:FAKE_SUPABASE.replace('Promise.resolve(run(target)).then(resolve, reject)', 'new Promise(done => setTimeout(done, window.__latency ?? 0)).then(() => run(target)).then(resolve, reject)') }));
      await page.goto(`${origin}/vocabulary.html`);
      await page.waitForSelector('.vocab-unit-card');
      await page.waitForTimeout(500);
      for (let round = 1; round <= 2; round += 1) {
        await page.click('.vocab-unit-card[data-unit="1"]');
        await page.waitForSelector('.vocab-pathway-card');
        await page.waitForTimeout(500);
        const result = await page.evaluate(() => new Promise(resolve => {
          window.__latency = 250;
          const rootEl = document.getElementById('vocabularyApp'); const frames = []; let paints = 0; const start = performance.now();
          new MutationObserver(() => { paints += 1; }).observe(rootEl, { childList:true });
          const tick = () => {
            const cards = [...rootEl.querySelectorAll('.vocab-unit-card')];
            frames.push({
              shell:Boolean(rootEl.querySelector('.vocab-shell--home')), cards:cards.length,
              minOpacity:cards.length ? Math.min(...cards.map(card => Number(getComputedStyle(card).opacity))) : -1,
              entering:cards.flatMap(card => card.getAnimations()).filter(animation => animation.animationName === 'study-enter').length,
              bodyBg:getComputedStyle(document.body).backgroundColor, scrollY:window.scrollY
            });
            if (performance.now() - start < 1400) requestAnimationFrame(tick); else resolve({ frames, paints });
          };
          document.querySelector('[data-action="back-units"]').click();
          requestAnimationFrame(tick);
        }));
        assert.ok(result.paints >= 2, `round ${round}: Home was painted twice (cache restore + refresh), so both are covered (saw ${result.paints})`);
        assert.ok(result.frames.length > 30);
        const bodyBg = result.frames[0].bodyBg;
        for (const [index, frame] of result.frames.entries()) {
          assert.equal(frame.shell, true, `round ${round} frame ${index}: Home shell present`);
          assert.ok(frame.cards >= 1, `round ${round} frame ${index}: cards present`);
          assert.equal(frame.minOpacity, 1, `round ${round} frame ${index}: every card fully opaque (no dim-and-fade replay)`);
          assert.equal(frame.entering, 0, `round ${round} frame ${index}: no study-enter entrance animation is running`);
          assert.equal(frame.bodyBg, bodyBg); assert.equal(frame.scrollY, 0);
        }
        await page.waitForTimeout(300);
      }
      assert.deepEqual(errors, []);
    } finally { await browser.close(); server.close(); }
  });
}

browserTest('opening a unit immediately after Back is still honoured once the Home refresh lands (the refresh is recognised, not ended early by cover swaps)', async () => {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const { server, origin } = await serve(root);
  const browser = await playwright.chromium.launch({ executablePath });
  try {
    const page = await browser.newPage({ viewport:{ width:1280, height:900 } });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await installRoutes(page, root);
    await page.route('**/src/supabase.js', route => route.fulfill({ contentType:'text/javascript', body:FAKE_SUPABASE.replace('Promise.resolve(run(target)).then(resolve, reject)', 'new Promise(done => setTimeout(done, window.__latency ?? 0)).then(() => run(target)).then(resolve, reject)') }));
    await page.goto(`${origin}/vocabulary.html`);
    await page.waitForSelector('.vocab-unit-card');
    await page.waitForTimeout(500);
    await page.click('.vocab-unit-card[data-unit="1"]');
    await page.waitForSelector('.vocab-pathway-card');
    await page.waitForTimeout(500);
    await page.evaluate(() => { window.__latency = 250; });
    await page.click('[data-action="back-units"]');
    await page.waitForTimeout(60);   // the cached Home is painted; the refresh has not landed
    await page.evaluate(() => { document.querySelector('.vocab-unit-card[data-unit="1"]').click(); });
    await page.waitForSelector('.vocab-pathway-card', { timeout:4000 });
    await page.waitForTimeout(1200);   // long enough for the delayed refresh to land
    assert.ok(await page.evaluate(() => Boolean(document.querySelector('.vocab-pathway-card')) && !document.querySelector('.vocab-unit-card')), 'the unit stays open; the late Home refresh does not overwrite it');
    assert.deepEqual(errors, []);
  } finally { await browser.close(); server.close(); }
});

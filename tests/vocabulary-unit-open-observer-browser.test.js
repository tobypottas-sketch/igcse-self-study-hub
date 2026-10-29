import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { findChromium, loadPlaywright, serve } from './helpers/pathway-geometry-harness.mjs';
import { FAKE_SUPABASE } from './helpers/question-latency-harness.mjs';
import unit from '../content/vocabulary/releases/unit-01.js';

const playwright = loadPlaywright();
const executablePath = await findChromium();
const browserTest = playwright && executablePath ? test : test.skip;

browserTest('Unit 1 opens with a successful delayed display RPC and the real student router', async () => {
  assert.deepEqual([unit.occurrences.length,unit.contexts.length,unit.activities.length],[50,342,490]);
  const root = fileURLToPath(new URL('..', import.meta.url));
  const { server,origin } = await serve(root);
  const browser = await playwright.chromium.launch({ executablePath });
  try {
    const page = await browser.newPage({ viewport:{ width:390,height:844 } });
    const errors = [];
    page.on('pageerror',error => errors.push(error.message));
    await page.addInitScript(() => {
      window.__observers = []; window.__operations = []; window.__clicked = false;
      const NativeObserver = window.MutationObserver;
      window.MutationObserver = class extends NativeObserver {
        constructor(callback) {
          const record = { source:new Error().stack, calls:0, ms:0, capped:false };
          window.__observers.push(record);
          super((mutations,observer) => {
            const start = performance.now();
            record.first ??= start; record.last = start; record.calls += 1;
            // Diagnostic escape hatch: fail with evidence instead of hanging CI indefinitely.
            if (record.calls > 1000 && start - record.first > 1000) { record.capped = true; observer.disconnect(); return; }
            callback(mutations,observer); record.ms += performance.now() - start;
          });
        }
      };
    });
    const fixture = FAKE_SUPABASE
      .replace('Promise.resolve(run(target)).then(resolve, reject)', `(window.__clicked && ['vocabulary_items','vocabulary_contexts','vocabulary_unit_activities'].includes(table)
        ? new Promise(done => setTimeout(() => done(run(target)),150)) : Promise.resolve(run(target))).then(resolve,reject)`)
      .replace('from:builder, functions:{ invoke }', `from:builder, functions:{ invoke }, rpc:async name => {
        if (name !== 'current_merit_pathways_required') return { data:null,error:{ message:'Unsupported synthetic RPC' } };
        await new Promise(done => { window.__resolveDisplay = done; }); return { data:2,error:null };
      }`);
    await page.route('**/src/supabase.js',route => route.fulfill({ contentType:'text/javascript',body:fixture }));
    // Time the actual synchronous render functions; do not stub the router or any DOM adapters.
    for (const [file,names] of [
      ['app.js',['renderCurrentUnit']], ['views.js',['buildUnitProgress','renderVocabularyUnit']],
      ['set-progress.js',['buildSetPathwayStates']], ['engagement-model.js',['progressSnapshot']]
    ]) {
      let body = await readFile(new URL(`../src/vocabulary/${file}`,import.meta.url),'utf8');
      for (const name of names) {
        let exported = false;
        body = body.replace(new RegExp(`(export )?function ${name}\\(`), (_,prefix) => {
          exported = Boolean(prefix); return `function __timed_${name}(`;
        });
        body += `\n${exported ? 'export ' : ''}function ${name}(...args) { const start = performance.now();
          try { return __timed_${name}(...args); } finally { window.__operations.push({ name:'${name}',ms:performance.now()-start }); } }\n`;
      }
      await page.route(`**/src/vocabulary/${file}`,route => route.fulfill({ contentType:'text/javascript',body }));
    }
    await page.goto(`${origin}/vocabulary.html`);
    await page.locator('.vocab-unit-card[data-unit="1"]').waitFor();
    await page.waitForFunction(() => typeof window.__resolveDisplay === 'function');
    await (await page.context().newCDPSession(page)).send('Emulation.setCPUThrottlingRate',{ rate:4 });
    await page.evaluate(() => {
      window.__clicked = true; window.__clickAt = performance.now();
      document.querySelector('.vocab-unit-card[data-unit="1"]').click();
      window.__resolveDisplay();
      setTimeout(() => { window.__heartbeat = performance.now() - window.__clickAt; },0);
    });
    await page.locator('.vocab-pathway-card').first().waitFor();
    await page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
    const result = await page.evaluate(() => ({ observers:window.__observers,operations:window.__operations,heartbeatMs:window.__heartbeat,paintMs:performance.now()-window.__clickAt }));
    console.log(JSON.stringify(result));
    assert.equal(result.observers.some(observer => observer.capped),false,'no self-sustaining DOM observer loop may starve Unit loading');
    assert.ok(result.observers.every(observer => observer.calls < 20),'DOM observers settle after rendering');
    assert.equal(await page.locator('.vocab-pathway-card').count(),6);
    assert.equal(await page.locator('.vocab-pathway-card:not([disabled])').count(),5);
    assert.equal(await page.locator('[data-unit-check-card]').count(),1);
    await page.locator('[data-action="back-units"]').click();
    await page.locator('.vocab-unit-card[data-unit="1"]').waitFor();
    assert.deepEqual(errors,[]);
  } finally { await browser.close(); server.close(); }
});

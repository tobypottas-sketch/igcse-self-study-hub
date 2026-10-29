import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { findChromium, loadPlaywright, serve } from './helpers/pathway-geometry-harness.mjs';
import { FAKE_SUPABASE } from './helpers/question-latency-harness.mjs';

const root = fileURLToPath(new URL('..',import.meta.url));
const playwright = loadPlaywright();
const executablePath = await findChromium();
const browserTest = playwright && executablePath ? test : test.skip;

for (const [width,cpu] of [[1280,1],[390,4]]) {
  browserTest(`first-time Unit 1 open avoids readiness planning and starts Set 1 (${width}px, ${cpu}x CPU)`, async () => {
    const { server,origin } = await serve(root);
    const browser = await playwright.chromium.launch({ executablePath });
    try {
      const page = await browser.newPage({ viewport:{ width,height:900 } });
      const errors = [];
      page.on('pageerror',error => errors.push(error.message));
      await page.addInitScript(() => { window.__readinessCalls = 0; window.__targetCalls = 0; window.__progressReads = 0; });
      const fixture = FAKE_SUPABASE.replace('function run(q) {', "function run(q) { if(q.table === 'vocabulary_pathway_sets') window.__progressReads += 1;")
        .replace('from:builder, functions:{ invoke }', `from:builder, functions:{ invoke }, rpc:async (name,args) => name === 'start_vocabulary_mission'
          ? { data:{ mission_id:'synthetic-mission',mission_seed:'synthetic-seed',pathway_stage:'recognise',set_number:1,set_phase:'stage',weak_target_ids:[] },error:null }
          : { data:null,error:{ message:'Unsupported fixture RPC' } }`);
      await page.route('**/src/supabase.js',route => route.fulfill({ contentType:'text/javascript',body:fixture }));
      await page.route('**/src/vocabulary/pathway-readiness.js',route => route.fulfill({ contentType:'text/javascript',body:"export function evaluateUnitReadiness() { window.__readinessCalls += 1; throw new Error('Readiness must not run during student Unit open'); }" }));
      const planner = await readFile(new URL('../src/vocabulary/pathway-planner.js',import.meta.url),'utf8');
      await page.route('**/src/vocabulary/pathway-planner.js',route => route.fulfill({ contentType:'text/javascript',body:planner.replace("export function evaluateTargetForPathwayStage({ pathwayId, stageId, content, target, mastery = {}, seed = '' } = {}) {", "export function evaluateTargetForPathwayStage({ pathwayId, stageId, content, target, mastery = {}, seed = '' } = {}) { window.__targetCalls += 1;") }));
      await page.goto(`${origin}/vocabulary.html`);
      await page.locator('.vocab-unit-card[data-unit="1"]').waitFor();
      if (cpu > 1) await (await page.context().newCDPSession(page)).send('Emulation.setCPUThrottlingRate',{ rate:cpu });
      await page.locator('.vocab-unit-card[data-unit="1"]').click();
      await page.locator('.vocab-pathway-card[data-pathway="meaning"]:not([disabled]), [data-study-error-state]').first().waitFor();
      assert.equal(await page.evaluate(() => window.__readinessCalls),0,'the full readiness evaluator must not run');
      assert.equal(await page.locator('.vocab-pathway-card').count(),6);
      assert.equal(await page.locator('.vocab-pathway-card:not([disabled])').count(),5);
      assert.equal(await page.locator('.vocab-pathway-card[data-pathway="paraphrasing"]').isDisabled(),true);
      const state = await page.evaluate(() => ({ readiness:window.__readinessCalls,targets:window.__targetCalls,progressReads:window.__progressReads }));
      assert.deepEqual({ readiness:state.readiness,targets:state.targets },{ readiness:0,targets:0 });
      assert.ok(state.progressReads > 0, 'an empty student progression table was actually read');
      await page.locator('.vocab-pathway-card[data-pathway="meaning"]').click();
      await page.locator('[data-action="start-recommended"][data-pathway="meaning"]').click();
      await page.locator('.vocab-shell--session [data-choice-answer]').first().waitFor();
      assert.match(await page.locator('.vocab-study-question-header').innerText(),/Recognise/i);
      await page.locator('[data-action="leave-session"]').click();
      await page.locator('.vocab-pathway-card[data-pathway="meaning"]:not([disabled])').waitFor();
      assert.deepEqual(errors,[]);
    } finally { await browser.close(); server.close(); }
  });
}

// Activity-entry latency harness. Runs the REAL Vocabulary Builder (app.js, views.js, data.js, attempt-persistence) in headless Chromium
// against a fake Supabase serving real Unit 1 content, and measures click -> first USABLE activity UI with a deterministic end condition
// (no sleeps). Production source is only wrapped at the network layer to add timeline marks (app.js is served with tl() calls inserted).
// The fake also answers the mission RPCs and logs every Supabase call (name, start, end) so entry paths can be compared by round-trips.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { findChromium, loadPlaywright, serve } from './pathway-geometry-harness.mjs';
import { FAKE_SUPABASE, installRoutes } from './question-latency-harness.mjs';

export const PATHWAYS = ['meaning', 'context', 'word_families', 'paraphrasing', 'precision_use', 'spelling_recall'];

function patchFake(src) {
  const steps = [
    ['function run(q) {', 'function run0(q) {'],
    ["return { auth:{ getUser:async () => ({ data:{ user:{ id:'u1' } }, error:null }) }, from:builder, functions:{ invoke } };", "return { auth:{ getUser:async () => ({ data:{ user:{ id:'u1' } }, error:null }) }, from:builder, functions:{ invoke }, rpc };"],
    ['Promise.resolve(run(target)).then(resolve, reject)', "netCall('from:' + target.table, () => run(target)).then(resolve, reject)"],
    ["if (name !== 'vocabulary-attempt-action') return { data:{ ok:true }, error:null };", "if (name !== 'vocabulary-attempt-action') return netCall('invoke:' + name, () => ({ data:{ ok:true }, error:null }));"]
  ];
  let out = src;
  for (const [from, to] of steps) { if (!out.includes(from)) throw new Error('fake patch missed: ' + from.slice(0, 50)); out = out.replace(from, to); }
  return out + `
window.__calls = []; window.__netMs = 0; let __missionCounter = 0;
async function netCall(name, fn) {
  const call = { name, start:performance.now(), end:null }; window.__calls.push(call);
  if (window.__netMs) await new Promise(done => setTimeout(done, window.__netMs));
  const out = fn(); call.end = performance.now(); return out;
}
function run(q) {
  const out = run0(q);
  if (q.table === 'vocabulary_pathway_sets' && window.__fakeStage?.all && out.data?.length) return { data:${JSON.stringify(PATHWAYS)}.map(pathway_id => ({ ...out.data[0], pathway_id })), error:null };
  return out;
}
function rpc(name, args) {
  return netCall('rpc:' + name, () => {
    if (name === 'start_vocabulary_mission') { __missionCounter += 1; return { data:{ mission_id:'mission-' + __missionCounter, mission_seed:'seed-' + __missionCounter, resumed:false, started_at:new Date().toISOString(), pathway_stage:args.p_pathway_stage, set_number:1, set_phase:'stage', weak_target_ids:[] }, error:null }; }
    return { data:null, error:{ message:'RPC not modelled by the activity-entry fixture' } };
  });
}
`;
}

const TL = "const tl = (name, extra = {}) => { (window.__tl ??= []).push({ name, t:performance.now(), ...extra }); };\n";
const APP_MARKS = [
  ["const target = event.target?.closest?.('[data-action]'); const action = target?.dataset?.action; if (!action) return;", "tl('click:handler', { action });"],
  ['async function openFreshPracticeSheet(pathwayId) {', "tl('sheet:open:start');"],
  ['function openPracticeSheet(pathwayId, { known = true } = {}) {', "tl('sheet:build:start');"],
  ["root.insertAdjacentHTML('beforeend', renderPracticeSheet({ pathwayId, options,", "tl('sheet:render:start');"],
  ['async function startPathwaySession(pathwayId, continueHistory = false, choice = null, forceNew = false) {', "tl('launch:startPathwaySession');"],
  ['function startMixedReview(continueHistory = false, durationMinutes = null, forceNew = false) {', "tl('launch:startMixedReview');"],
  ['function beginSession(request) {', "tl('session:begin');"],
  ['function commitSession(request, acquired, slot) {', "tl('session:commit');"],
  ['function nextQuestion() {', "tl('question:next');"]
];
function patchApp(src) {
  let out = TL + src;
  for (const [anchor, mark] of APP_MARKS) {
    if (!out.includes(anchor)) throw new Error('app mark missed: ' + anchor.slice(0, 50));
    out = anchor.startsWith('root.insertAdjacentHTML') ? out.replace(anchor, mark + ' ' + anchor) : out.replace(anchor, anchor + ' ' + mark);
  }
  const pairs = [
    ['state.setRows = await loadPathwaySets(state.client, state.currentUnitNumber);', "tl('set:refresh:start'); state.setRows = await loadPathwaySets(state.client, state.currentUnitNumber); tl('set:refresh:end');"],
    ['current = buildNextForTarget(target);', "tl('question:build:start'); current = buildNextForTarget(target); tl('question:build:end');"]
  ];
  for (const [from, to] of pairs) { if (!out.includes(from)) throw new Error('app pair missed: ' + from.slice(0, 50)); out = out.replace(from, to); }
  return out;
}

const END_USABLE = `(() => {
  const rootEl = document.querySelector('#vocabularyApp'); if (!rootEl || rootEl.querySelector('[data-practice-sheet]')) return false;
  if (rootEl.querySelector('.vocab-error,[data-vocab-error]')) return 'error';
  if (!rootEl.querySelector('.vocab-shell--session')) return false;
  const usable = rootEl.querySelector('[data-choice-answer]:not([disabled]),[data-evidence-answer]:not([disabled]),[data-match-word]:not([disabled]),[data-tile-answer]:not([disabled]),input[name="answer"]:not([disabled]),select[name="answer"]:not([disabled]),input[data-slot-input]:not([disabled]),textarea:not([disabled])');
  return Boolean(usable);
})()`;
export const END_SHEET = `Boolean(document.querySelector('#vocabularyApp [data-practice-sheet] [data-action]'))`;
export const END_UNIT = `Boolean(document.querySelector('.vocab-pathway-card[data-pathway="meaning"]:not([disabled])'))`;
export const END_USABLE_EXPR = END_USABLE;

const IN_PAGE = `
window.__measure = (clickSel, endExpr, timeoutMs = 15000) => new Promise(resolve => {
  const rootEl = document.querySelector('#vocabularyApp'); const el = document.querySelector(clickSel);
  if (!el) { resolve({ error:'no click target ' + clickSel }); return; }
  const endFn = new Function('return (' + endExpr + ')');
  window.__tl = []; window.__calls.length = 0;
  let long = 0; const po = typeof PerformanceObserver === 'function' ? new PerformanceObserver(list => { for (const e of list.getEntries()) long += e.duration; }) : null; try { po?.observe({ entryTypes:['longtask'] }); } catch {}
  const t0 = performance.now(); let done = false; let renders = 0; let tDom = null;
  const finish = (reason) => {
    if (done) return; done = true; observer.disconnect(); clearTimeout(timer); tDom = performance.now();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const tPaint = performance.now(); po?.disconnect();
      const rel = e => Math.round((e - t0) * 10) / 10;
      resolve({ reason, domMs:rel(tDom), paintMs:rel(tPaint), longTaskMs:Math.round(long), renders,
        tl:window.__tl.map(e => ({ name:e.name, at:rel(e.t), action:e.action })),
        calls:window.__calls.map(c => ({ name:c.name, at:rel(c.start), end:c.end == null ? null : rel(c.end) })) });
    }));
  };
  const check = () => { renders += 1; const r = endFn(); if (r) finish(r === true ? 'ok' : r); };
  const observer = new MutationObserver(check); observer.observe(rootEl, { childList:true, subtree:true, attributes:true, attributeFilter:['disabled'] });
  const timer = setTimeout(() => finish('timeout'), timeoutMs);
  el.click(); check();
});
`;

export async function openEntryPage({ root, width = 1280, height = 900, stage = 'recognise', pathway = 'meaning', netMs = 0, cpu = 1 }) {
  const playwright = loadPlaywright(); const executablePath = await findChromium();
  if (!playwright || !executablePath) return null;
  const { server: http, origin } = await serve(root);
  const browser = await playwright.chromium.launch({ executablePath });
  const page = await browser.newPage({ viewport:{ width, height } });
  page.on('pageerror', error => { (page.__errors ??= []).push(error.message); });
  await installRoutes(page, root);
  // Un-wrap the engine: the shared question-latency harness wraps markCuratedAnswer for its own timeline, which would distort these timings.
  const engineSource = await readFile(path.join(root, 'supabase/functions/_shared/vocabulary-engine.js'), 'utf8');
  await page.route('**/supabase/functions/_shared/vocabulary-engine.js', route => route.fulfill({ body:engineSource, contentType:'text/javascript' }));
  await page.route('**/src/supabase.js', route => route.fulfill({ body:patchFake(FAKE_SUPABASE), contentType:'text/javascript' }));
  const appSource = patchApp(await readFile(path.join(root, 'src/vocabulary/app.js'), 'utf8'));
  await page.route('**/src/vocabulary/app.js', route => route.fulfill({ body:appSource, contentType:'text/javascript' }));
  await page.addInitScript(placement => { window.__tl = []; window.__fakeStage = placement; }, { pathway, stage, all:true });
  await page.goto(`${origin}/vocabulary.html`, { waitUntil:'load' });
  await page.waitForSelector('.vocab-unit-card');
  await page.evaluate(IN_PAGE);
  await page.evaluate(ms => { window.__netMs = ms; }, netMs);
  if (cpu > 1) { const cdp = await page.context().newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate:cpu }); }
  const api = {
    page, errors:() => page.__errors ?? [],
    close:async () => { await browser.close(); http.close(); },
    measure:(clickSel, endExpr, timeoutMs) => page.evaluate(([s, e, t]) => window.__measure(s, e, t), [clickSel, endExpr, timeoutMs]),
    openUnit:() => api.measure('.vocab-unit-card[data-unit="1"]', END_UNIT),
    openSheet:id => api.measure(`.vocab-pathway-card[data-pathway="${id}"]`, END_SHEET),
    launch:selector => api.measure(selector, END_USABLE),
    leave:async () => { await page.evaluate(() => document.querySelector('[data-action="leave-session"],[data-action="back-unit"]')?.click()); await page.waitForSelector('.vocab-pathway-card:not([disabled])'); },
    // Pathway card -> popup -> activity, measured as one student gesture pair.
    enter:async (pathwayId, choice) => {
      const sheet = await api.openSheet(pathwayId);
      if (sheet.error) return { sheet, launch:sheet, totalMs:null };
      const sel = choice === 'recommended' ? `[data-action="start-recommended"][data-pathway="${pathwayId}"]` : `[data-action="start-practice-choice"][data-pathway="${pathwayId}"][data-family="${choice}"]`;
      const launch = await api.launch(sel);
      return { sheet, launch, totalMs:launch.paintMs == null ? null : launch.paintMs };
    },
    mixed:() => api.launch('[data-action="start-mixed-review"]')
  };
  return api;
}

// Real-flow harness: runs the REAL Vocabulary app.js, views and data.js in headless Chromium against a fake
// Supabase client, starting from the Home screen, and records how the root is replaced when a unit is opened.
import { findChromium, loadPlaywright, serve } from './pathway-geometry-harness.mjs';

const FAKE_SUPABASE = `
const ROWS = 6;
const occurrences = [];
for (let unit = 1; unit <= 5; unit += 1) for (let i = 1; i <= ROWS; i += 1) occurrences.push({ occurrence_id:'o-u'+unit+'-'+i, vocabulary_id:'v-u'+unit+'-'+i, unit_number:unit, unit_title:'Unit '+unit+' title', set_number:1, position_in_unit:i, sense_id:'s', status:'live' });
window.__gates = window.__gates || {};
window.__calls = window.__calls || [];
const gate = name => { const g = window.__gates[name]; return g ? g.promise : Promise.resolve(); };
function builder(table) {
  const q = { table, inArgs:null };
  const proxy = new Proxy(q, { get(target, prop) {
    if (prop === 'then') return (resolve, reject) => resolve$(target).then(resolve, reject);
    if (prop === 'in') return (_column, values) => { target.inArgs = values; return proxy; };
    return () => proxy;
  } });
  return proxy;
}
async function resolve$(q) {
  if (q.table === 'profiles') return { data:{ id:'u1', role:'student', display_name:'Sam', active:true }, error:null };
  if (q.table === 'vocabulary_unit_occurrences') return { data:occurrences, error:null };
  if (q.table === 'vocabulary_items') {
    const unit = String(q.inArgs?.[0] ?? '').match(/u(\\d+)/)?.[1];
    window.__calls.push('load:' + unit);
    await gate('unit:' + unit);
    return { data:(q.inArgs ?? []).map((id, i) => ({ vocabulary_id:id, term:'word' + i, part_of_speech:'verb', core_meaning:'meaning', senses:[], word_family:[], collocations:[], status:'live' })), error:null };
  }
  return { data:[], error:null };
}
export async function getSupabaseClient() {
  return { auth:{ getUser:async () => ({ data:{ user:{ id:'u1' } }, error:null }) }, from:builder, functions:{ invoke:async () => ({ data:{}, error:null }) } };
}
`;

// Runs in the page after Home has rendered. Instruments the app root and returns helpers on window.
function instrument() {
  const root = document.querySelector('#vocabularyApp');
  const log = { replacements:0, unitRenders:0, homeRenders:0, events:[], shifts:[] };
  new MutationObserver(records => {
    let added = false; let removed = false; const names = [];
    for (const r of records) { if (r.addedNodes.length) { added = true; for (const n of r.addedNodes) names.push(n.className ?? n.nodeName); } if (r.removedNodes.length) removed = true; }
    if (!added) return;
    if (removed) log.replacements += 1;
    const unit = root.querySelector('.vocab-unit-hero');
    const home = root.querySelector('.vocab-unit-card');
    if (unit) log.unitRenders += 1; else if (home) log.homeRenders += 1;
    log.events.push({ t:Math.round(performance.now()), kind:unit ? 'unit' : home ? 'home' : 'other', title:root.querySelector('h1')?.textContent ?? null, names });
  }).observe(root, { childList:true });
  new PerformanceObserver(list => { for (const e of list.getEntries()) log.shifts.push({ t:Math.round(e.startTime), value:e.value, hadInput:e.hadRecentInput }); }).observe({ type:'layout-shift', buffered:true });
  window.__log = log;
  window.__snap = () => ({
    docHeight:document.documentElement.scrollHeight,
    scrollY:Math.round(scrollY),
    rootHeight:Math.round(root.getBoundingClientRect().height),
    homeMounted:Boolean(root.querySelector('.vocab-unit-card')),
    unitMounted:Boolean(root.querySelector('.vocab-unit-hero')),
    pathwayCards:root.querySelectorAll('.vocab-pathway-card').length,
    title:root.querySelector('h1')?.textContent ?? null,
    busy:[...root.querySelectorAll('.vocab-unit-card[data-loading="true"]')].map(card => card.dataset.unit)
  });
  window.__gate = name => { let resolve; const promise = new Promise(done => { resolve = done; }); window.__gates[name] = { promise, resolve }; };
  window.__release = name => window.__gates[name]?.resolve();
}

export async function runColdUnitFlow({ root, width = 1280, height = 560, scenario }) {
  const playwright = loadPlaywright(); const executablePath = await findChromium();
  if (!playwright || !executablePath) return null;
  const { server, origin } = await serve(root);
  const browser = await playwright.chromium.launch({ executablePath });
  try {
    const page = await browser.newPage({ viewport:{ width, height } });
    await page.route('**/src/supabase.js', route => route.fulfill({ body:FAKE_SUPABASE, contentType:'text/javascript' }));
    await page.route('**/src/vocabulary/router.js', route => route.fulfill({ body:"import './app.js';", contentType:'text/javascript' }));
    await page.addInitScript(() => { window.__gates = {}; window.__calls = []; });
    await page.goto(`${origin}/vocabulary.html`, { waitUntil:'load' });
    await page.waitForSelector('.vocab-unit-card');
    await page.evaluate(instrument);
    const out = await scenario({ page, wait:ms => page.waitForTimeout(ms), snap:() => page.evaluate(() => window.__snap()), log:() => page.evaluate(() => JSON.parse(JSON.stringify(window.__log))) });
    return out;
  } finally { await browser.close(); server.close(); }
}

// Scenario 1: cold open with the unit load delayed.
export const coldOpen = async ({ page, wait, snap, log }) => {
  const result = {};
  await page.evaluate(() => window.__gate('unit:1'));
  result.beforeClick = await snap();
  await page.click('.vocab-unit-card[data-unit="1"]');
  await wait(500);
  result.duringDelay = await snap();
  await wait(500);
  result.duringDelayLater = await snap();
  await page.evaluate(() => window.__release('unit:1'));
  await wait(800);
  result.after = await snap();
  await wait(600);
  result.settled = await snap();
  result.log = await log();
  return result;
};

// Scenario 2: open (cold) -> back to Home -> open again (cached) must render immediately.
export const cachedOpen = async ({ page, wait, snap, log }) => {
  const result = {};
  await page.click('.vocab-unit-card[data-unit="1"]');
  await page.waitForSelector('.vocab-unit-hero');
  await page.click('[data-action="back-units"]');
  await page.waitForSelector('.vocab-unit-card');
  await wait(100);
  const rendersBefore = (await log()).unitRenders;
  // Gate the unit: a cached open must not wait for it.
  await page.evaluate(() => { window.__gate('unit:1'); });
  await page.evaluate(() => document.querySelector('.vocab-unit-card[data-unit="1"]').click());
  result.immediately = await snap();
  await wait(300);
  result.later = await snap();
  const finalLog = await log();
  result.unitRendersForCachedOpen = finalLog.unitRenders - rendersBefore;
  result.loadCalls = await page.evaluate(() => window.__calls.filter(c => c === 'load:1').length);
  result.log = finalLog;
  return result;
};

// Scenario 3: a slow first request must never overwrite a later navigation.
export const staleRequest = async ({ page, wait, snap, log }) => {
  const result = {};
  await page.evaluate(() => window.__gate('unit:1'));
  await page.click('.vocab-unit-card[data-unit="1"]');
  await wait(200);
  result.afterFirstClick = await snap();
  await page.click('.vocab-unit-card[data-unit="2"]');
  await page.waitForSelector('.vocab-unit-hero');
  await wait(200);
  result.afterSecondUnit = await snap();
  const before = await log();
  await page.evaluate(() => window.__release('unit:1'));
  await wait(800);
  result.afterStaleResolves = await snap();
  const after = await log();
  result.rendersAddedByStale = after.unitRenders - before.unitRenders;
  result.log = after;
  return result;
};

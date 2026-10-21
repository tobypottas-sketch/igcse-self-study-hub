// Real-browser geometry harness for the Vocabulary unit screen.
//
// Serves the repo over HTTP, loads vocabulary.html in headless Chromium (router.js stubbed so no Supabase
// is needed), renders the unit screen exactly the way app.js does (buildUnitPathwayStates -> renderVocabularyUnit)
// with REAL evidence data, and records the geometry of every pathway card and its containers at several points
// in time. It also counts DOM mutations after the render and records browser layout-shift entries.
import http from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const TYPES = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.json':'application/json', '.png':'image/png' };

export async function findChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  try {
    const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
    const dirs = (await readdir(base)).filter(name => name.startsWith('chromium')).sort().reverse();
    for (const dir of dirs) for (const rel of ['chrome-linux/chrome', 'chrome']) {
      try { await readFile(path.join(base, dir, rel), { flag:'r' }); return path.join(base, dir, rel); } catch { /* try next */ }
    }
  } catch { /* no browsers directory */ }
  return null;
}
export function loadPlaywright() {
  for (const from of [import.meta.url, 'file:///home/claude/.npm-global/lib/node_modules/']) {
    try { const require = createRequire(from); try { return require('playwright'); } catch { return require('@playwright/test'); } } catch { /* next */ }
  }
  return null;
}

export function serve(root) {
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://x');
      const file = path.join(root, decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
      if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
      const body = await readFile(file);
      res.writeHead(200, { 'content-type':TYPES[path.extname(file)] ?? 'application/octet-stream' }).end(body);
    } catch { res.writeHead(404).end(); }
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve({ server, origin:`http://127.0.0.1:${server.address().port}` })));
}

// Runs inside the page.
async function inPage({ mode }) {
  const views = await import('/src/vocabulary/views.js');
  const model = await import('/src/vocabulary/pathway-view-model.js');
  const root = document.querySelector('#vocabularyApp');
  const pathways = ['meaning', 'context', 'word_families', 'paraphrasing', 'precision_use', 'spelling_recall'];
  const occurrences = Array.from({ length:10 }, (_, i) => ({ occurrenceId:`o${i}`, vocabularyId:`v${i}`, unitNumber:1 }));
  const stage = (successes, failures, cleanSuccesses, prompts) => ({ successes, failures, cleanSuccesses, cleanUnassistedSuccesses:cleanSuccesses, promptKeys:Array.from({ length:prompts }, (_, n) => `p${n}`) });
  const progressFor = (pathway, i) => {
    if (pathway === 'meaning') return { completedStages:['recognise'], stages:{ recognise:{ completed:true }, match:stage(7 + i, 2, 5 + i, 3) } };
    if (pathway === 'context') return { completedStages:[], stages:{ recognise:stage(1, 0, 1, 1) } };
    if (pathway === 'word_families') return { completedStages:['recognise', 'match'], stages:{ recognise:{ completed:true }, match:{ completed:true }, apply:stage(12 + i, 5, 9 + i, 6) } };
    return null; // paraphrasing + precision_use: no saved evidence; spelling_recall is unavailable below
  };
  const unitMastery = {};
  for (const [i, occ] of occurrences.entries()) {
    const pathwayProgress = {};
    for (const pathway of pathways) { const progress = progressFor(pathway, i); if (progress) pathwayProgress[pathway] = progress; }
    unitMastery[occ.occurrenceId] = { status:'learning', contextualEvidence:{ pathwayProgress } };
  }
  const coverage = { spelling_recall:{ available:false, reason:'no_serviceable_targets', totalOccurrences:10, occurrenceIds:[] } };
  const build = withEvidence => model.buildUnitPathwayStates({ occurrences, unitMastery:withEvidence ? unitMastery : {}, globalMastery:{}, coverageByPathway:coverage });
  const renderUnit = withEvidence => views.renderVocabularyUnit(root, { unitNumber:1, unitTitle:'Sports and Free Time', progress:{ mastered:0, total:50, needsAnotherLook:0, reviewDue:0, stages:{} }, pathwayStates:build(withEvidence), contentReady:true });

  const rect = el => { const r = el.getBoundingClientRect(); return [Math.round((r.x + scrollX) * 100) / 100, Math.round((r.y + scrollY) * 100) / 100, Math.round(r.width * 100) / 100, Math.round(r.height * 100) / 100]; };
  const snap = () => ({
    docHeight:document.documentElement.scrollHeight,
    shell:root.firstElementChild ? rect(root.firstElementChild) : null,
    hero:document.querySelector('.vocab-unit-hero') ? rect(document.querySelector('.vocab-unit-hero')) : null,
    grid:document.querySelector('.vocab-pathway-grid') ? rect(document.querySelector('.vocab-pathway-grid')) : null,
    cards:Object.fromEntries([...document.querySelectorAll('.vocab-pathway-card')].map(card => [card.dataset.pathway, {
      card:rect(card),
      art:card.querySelector('.vocab-pathway-card__art') ? rect(card.querySelector('.vocab-pathway-card__art')) : null,
      evidence:card.querySelector('.vocab-pathway-card__evidence') ? rect(card.querySelector('.vocab-pathway-card__evidence')) : null,
      ladder:card.querySelector('.vocab-pathway-ladder') ? rect(card.querySelector('.vocab-pathway-ladder')) : null,
      children:card.children.length,
      evidenceText:card.querySelector('.vocab-pathway-card__evidence small')?.textContent ?? null
    }]))
  });

  window.__shifts = [];
  new PerformanceObserver(list => { for (const e of list.getEntries()) window.__shifts.push(e.value); }).observe({ type:'layout-shift', buffered:true });

  // Placeholder screen first (how openUnit paints before data arrives), then the real render.
  if (mode === 'preloaded-then-loaded') renderUnit(false);
  const frames = [];
  renderUnit(true);
  let mutations = 0;
  const observer = new MutationObserver(records => { mutations += records.length; });
  observer.observe(root, { childList:true, subtree:true, characterData:true, attributes:true });
  frames.push(['1 immediately after render', snap()]);
  await Promise.resolve(); await Promise.resolve();
  frames.push(['2 after microtasks / observers', snap()]);
  await new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done)));
  frames.push(['3 after two animation frames', snap()]);
  await new Promise(done => setTimeout(done, 900));
  frames.push(['4 after 900ms delay (evidence populated)', snap()]);
  await new Promise(done => setTimeout(done, 400));
  observer.disconnect();
  return { frames, mutations, shifts:window.__shifts, scripts:[...document.scripts].map(s => s.getAttribute('src')).filter(Boolean) };
}

export async function measure({ root, width, mode = 'direct', delayScripts = 0 }) {
  const playwright = loadPlaywright();
  const executablePath = await findChromium();
  if (!playwright || !executablePath) return null;
  const { server, origin } = await serve(root);
  const browser = await playwright.chromium.launch({ executablePath });
  try {
    const page = await browser.newPage({ viewport:{ width, height:900 } });
    await page.route('**/src/vocabulary/router.js', route => route.fulfill({ body:'', contentType:'text/javascript' }));
    if (delayScripts) await page.route('**/src/vocabulary/study-art-runtime.js', async route => { await new Promise(done => setTimeout(done, delayScripts)); route.continue().catch(() => {}); });
    await page.goto(`${origin}/vocabulary.html`, { waitUntil:'load' });
    return await page.evaluate(inPage, { mode });
  } finally { await browser.close(); server.close(); }
}

// Compare frame N with frame 0 for every card + container. Returns a list of human-readable differences.
export function geometryDifferences(frames) {
  const [, first] = frames[0];
  const out = [];
  for (const [label, frame] of frames.slice(1)) {
    for (const key of ['docHeight', 'shell', 'hero', 'grid']) if (JSON.stringify(frame[key]) !== JSON.stringify(first[key])) out.push(`${label}: ${key} ${JSON.stringify(first[key])} -> ${JSON.stringify(frame[key])}`);
    for (const [id, now] of Object.entries(frame.cards)) {
      const before = first.cards[id];
      for (const part of ['card', 'art', 'evidence', 'ladder', 'children']) if (JSON.stringify(before?.[part]) !== JSON.stringify(now[part])) out.push(`${label}: ${id}.${part} ${JSON.stringify(before?.[part])} -> ${JSON.stringify(now[part])}`);
    }
  }
  return out;
}

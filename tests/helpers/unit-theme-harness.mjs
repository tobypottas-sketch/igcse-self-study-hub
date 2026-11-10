import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderVocabularyHome, renderVocabularyQuestion, renderVocabularyUnit } from '../../src/vocabulary/views.js';
import { contextQuestions, otherQuestions } from './wrap-audit-harness.mjs';
// FIXTURE CONTENT: every question rendered by this harness (all units) is a real Unit 1 sample from wrap-audit-harness.mjs, used only so the
// cards have realistic text and height. It is not the student content of the unit being themed; only the backgrounds are under test.
import { findChromium, loadPlaywright } from './pathway-geometry-harness.mjs';

// Shared browser harness for the unit background themes: renders the REAL question-session markup with the REAL stylesheets
// (the <link>s in vocabulary.html) in Chromium and checks that a themed unit shows its wallpaper without touching content, and that
// unthemed units are unchanged. Content is the reviewed Unit 1 question content (the unit number only drives the theme).
export const root = fileURLToPath(new URL('../..', import.meta.url));
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
export const playwright = loadPlaywright();
export const executablePath = await findChromium();
export const browserAvailable = Boolean(playwright && executablePath);
const contexts = contextQuestions(), others = otherQuestions();
export const PATHWAYS = {
  meaning: [contexts[2], 'Meaning'], context: [others.find(q => q.type === 'gap_fill_choice'), 'Context'],
  word_families: [others.find(q => q.type === 'gap_fill_choice'), 'Word Families'], paraphrasing: [others.find(q => q.type === 'choose_paraphrase'), 'Paraphrasing'],
  precision_use: [others.find(q => q.type === 'gap_fill_choice'), 'Precision & Use'], spelling_recall: [others.find(q => q.type === 'type_word_from_definition'), 'Spelling & Recall']
};
export const VIEWPORTS = [[1440, 900], [820, 1100], [390, 844], [320, 640]];
const FEEDBACK_PATHWAYS = new Set(['meaning', 'spelling_recall']); // the feedback box is the other content that must stay clear
const links = [...read('vocabulary.html').matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map(m => `<link rel="stylesheet" href="/${m[1]}">`).join('');
const markup = (unit, pathwayId, feedback) => {
  const [question, label] = PATHWAYS[pathwayId], holder = { innerHTML: '' };
  renderVocabularyQuestion(holder, { unitNumber: unit, unitTitle: `Unit ${unit}`, question, term: question.term, sessionLabel: `${label} · 3 of 10`, sessionPosition: 3, sessionTotal: 10, pathwayId,
    ...(feedback ? { feedback: { correct: false, message: 'Not quite — look again at the sentence.' }, retry: true } : {}) });
  return holder.innerHTML;
};
// Student homepage and unit overview, rendered the way app.js does (real views, real stylesheets).
export const UNIT_TITLES = { 1: 'Sports and Free Time', 2: 'Digital Life', 3: 'Food and Drink', 4: 'Transport', 5: 'Holidays', 6: 'Learning and Study Skills', 7: 'Interviews' };
const homeMarkup = () => { const holder = { innerHTML: '' }; renderVocabularyHome(holder, { displayName: 'Mina', units: Object.entries(UNIT_TITLES).filter(([n]) => Number(n) <= 4).map(([n, t]) => ({ unitNumber: Number(n), unitTitle: t, mastered: 0, total: 50 })), soundOn: false }); return holder.innerHTML; };
const overviewMarkup = unit => { const holder = { innerHTML: '' }; renderVocabularyUnit(holder, { unitNumber: unit, unitTitle: UNIT_TITLES[unit] ?? `Unit ${unit}`, progress: { mastered: 0, total: 50, needsAnotherLook: 0, reviewDue: 0, stages: {} }, pathwayStates: {}, contentReady: true }); return holder.innerHTML; };
const TYPES = { '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp' };
export function serve() {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    if (url.pathname === '/page') {
      const body = markup(Number(url.searchParams.get('u')), url.searchParams.get('p'), url.searchParams.get('fb') === '1');
      res.writeHead(200, { 'content-type': 'text/html' }).end(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${links}</head><body><div id="vocabularyApp">${body}</div></body></html>`);
      return;
    }
    if (url.pathname === '/home' || url.pathname === '/overview') {
      const body = url.pathname === '/home' ? homeMarkup() : overviewMarkup(Number(url.searchParams.get('u')));
      res.writeHead(200, { 'content-type': 'text/html' }).end(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${links}</head><body><div id="vocabularyApp">${body}</div></body></html>`);
      return;
    }
    let data; const file = path.join(root, decodeURIComponent(url.pathname));
    try { data = fs.readFileSync(file); } catch { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' }).end(data);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve({ server, origin: `http://127.0.0.1:${server.address().port}` })));
}

// Largest per-channel difference between two PNG screenshots, measured in the browser. A few levels of difference (<= 4) is just the
// page gradient being rasterised in a different layer; the artwork itself (about 8% of navy/teal) differs by 10+ levels.
export const MAX_NOISE = 4;
export async function maxDiff(page, a, b) {
  return page.evaluate(async ([x, y]) => {
    const load = async b64 => { const img = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob()); const c = new OffscreenCanvas(img.width, img.height); const g = c.getContext('2d'); g.drawImage(img, 0, 0); return g.getImageData(0, 0, img.width, img.height); };
    const A = await load(x), B = await load(y);
    if (A.width !== B.width || A.height !== B.height) return 255;
    let max = 0; for (let i = 0; i < A.data.length; i++) { const d = Math.abs(A.data[i] - B.data[i]); if (d > max) max = d; } return max;
  }, [a.toString('base64'), b.toString('base64')]);
}
// Raster statistics of a wallpaper tile: ink touching the 6px border, ink coverage and its spread over the four quadrants.
export async function tileStats(file) {
  const { server, origin } = await serve();
  const browser = await playwright.chromium.launch({ executablePath });
  try {
    const page = await browser.newPage();
    await page.goto(`${origin}/page?u=1&p=meaning`);
    return await page.evaluate(async file => {
      const img = new Image(); img.src = '/assets/vocabulary/themes/' + file; await img.decode();
      const W = 420, c = new OffscreenCanvas(W, W), g = c.getContext('2d'); g.drawImage(img, 0, 0, W, W);
      const d = g.getImageData(0, 0, W, W).data, a = (x, y) => d[(y * W + x) * 4 + 3];
      let edge = 0, ink = 0; const quad = [0, 0, 0, 0];
      for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) { const alpha = a(x, y); if (alpha > 0) { ink++; quad[(y >= W / 2 ? 2 : 0) + (x >= W / 2 ? 1 : 0)]++; } if (alpha > 0 && (x < 6 || y < 6 || x >= W - 6 || y >= W - 6)) edge++; }
      return { edge, ink: ink / (W * W), quad };
    }, file);
  } finally { await browser.close(); server.close(); }
}

// Themed unit: wallpaper present on every pathway/viewport; layout, DOM and content regions untouched. Returns a list of failures.
export async function checkThemedUnit({ unit, themeId, wallpaperFile }) {
  const { server, origin } = await serve();
  const browser = await playwright.chromium.launch({ executablePath });
  const failures = [];
  try {
    for (const [width, height] of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: { width, height } });
      const page = await ctx.newPage(), cmp = await ctx.newPage();
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      for (const pathwayId of Object.keys(PATHWAYS)) for (const feedback of FEEDBACK_PATHWAYS.has(pathwayId) ? [false, true] : [false]) {
        const tag = `${width}px / ${pathwayId}${feedback ? ' + feedback' : ''}`;
        const q = `p=${pathwayId}&fb=${feedback ? 1 : 0}`;
        const snapshot = () => page.evaluate(() => {
          const rect = el => { const r = el.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(n => Math.round(n * 100) / 100); };
          const shell = document.querySelector('.vocab-shell');
          return {
            bg: getComputedStyle(document.body).backgroundImage, scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
            scrollH: document.documentElement.scrollHeight, shell: rect(shell), card: rect(document.querySelector('.vocab-question-card')),
            controls: [...document.querySelectorAll('.vocab-topbar > *, .vocab-topbar button, [data-study-question] button, [data-study-question] input, [data-study-feedback]')].map(rect),
            nodes: document.getElementsByTagName('*').length, theme: shell.getAttribute('data-unit-theme')
          };
        });
        // Same markup with the theme attribute removed = the plain page the student sees today.
        await page.goto(`${origin}/page?u=${unit}&${q}`);
        await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' }); await page.waitForTimeout(250);
        const themed = await snapshot();
        // Cards and chips are checked inside their rounded corners and soft shadow ring (that ring is page background, not content).
        const clips = await page.evaluate(() => [[document.querySelector('.vocab-question-card'), 24], ...[...document.querySelectorAll('.vocab-topbar > *')].map(el => [el, 6])].filter(([el]) => el).map(([el, inset]) => { const r = el.getBoundingClientRect(); return { x: Math.floor(r.x) + inset, y: Math.floor(r.y) + inset, width: Math.ceil(r.width) + 1 - 2 * inset, height: Math.ceil(r.height) + 1 - 2 * inset }; }).filter(c => c.x >= 0 && c.y >= 0 && c.width > 1 && c.height > 1));
        const shotsThemed = []; for (const clip of clips) shotsThemed.push(await page.screenshot({ clip: { ...clip, width: Math.min(clip.width, width - clip.x), height: Math.min(clip.height, height - clip.y) } }));
        const fullThemed = await page.screenshot();
        // Same themed page with ONLY the wallpaper layer taken off (page gradient kept): isolates exactly what the artwork paints.
        await page.evaluate(() => { const s = document.body.style; s.setProperty('background-image', 'radial-gradient(circle at 8% 0%,rgba(37,174,182,.09),transparent 28%),radial-gradient(circle at 94% 0%,rgba(46,115,214,.08),transparent 30%)', 'important'); s.setProperty('background-size', 'auto', 'important'); s.setProperty('background-repeat', 'no-repeat', 'important'); }); await page.waitForTimeout(100);
        const shotsPlain = []; for (const clip of clips) shotsPlain.push(await page.screenshot({ clip: { ...clip, width: Math.min(clip.width, width - clip.x), height: Math.min(clip.height, height - clip.y) } }));
        const fullPlain = await page.screenshot();
        // The text plates must be solid (so the wallpaper cannot show through them).
        const plates = await page.evaluate(() => [...document.querySelectorAll('.vocab-topbar > span, .vocab-session-unit')].map(el => getComputedStyle(el).backgroundColor));
        for (const colour of plates) if (!/^rgb\(/.test(colour) && !/, 1\)$/.test(colour)) failures.push(`${tag}: loose text plate is not solid (${colour})`);
        // And the plain page (theme attribute removed) is the baseline for layout and DOM.
        await page.evaluate(() => { for (const p of ['background-image', 'background-size', 'background-repeat']) document.body.style.removeProperty(p); document.querySelector('.vocab-shell').removeAttribute('data-unit-theme'); }); await page.waitForTimeout(100);
        const plain = await snapshot();

        if (themed.theme !== themeId) failures.push(`${tag}: Unit ${unit} shell is not themed`);
        if (!themed.bg.includes(wallpaperFile)) failures.push(`${tag}: wallpaper layer missing`);
        if (!/radial-gradient/.test(themed.bg)) failures.push(`${tag}: the page's light gradient was lost`);
        if (await maxDiff(cmp, fullThemed, fullPlain) <= MAX_NOISE) failures.push(`${tag}: artwork is not visible in the page at all`);
        if (themed.scrollW > themed.clientW) failures.push(`${tag}: horizontal overflow`);
        for (const key of ['scrollH', 'shell', 'card', 'controls', 'nodes']) if (JSON.stringify(themed[key]) !== JSON.stringify(plain[key])) failures.push(`${tag}: ${key} differs with the artwork (layout or DOM changed)`);
        for (const [i, clip] of clips.entries()) { const diff = await maxDiff(cmp, shotsThemed[i], shotsPlain[i]); if (diff > MAX_NOISE) failures.push(`${tag}: artwork reaches content region ${i} (${clip.x},${clip.y} ${clip.width}x${clip.height}) by ${diff} levels`); }

      }
      if (errors.length) failures.push(`${width}px: page errors ${errors.join('; ')}`);
      await ctx.close();
    }
  } finally { await browser.close(); server.close(); }
  return failures;
}

// Unthemed units: no theme attribute, no wallpaper, identical page background, no horizontal overflow.
export async function checkPlainUnits(units) {
  const { server, origin } = await serve();
  const browser = await playwright.chromium.launch({ executablePath });
  const failures = [];
  try {
    for (const [width, height] of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: { width, height } });
      const page = await ctx.newPage();
      const snapshot = () => page.evaluate(() => ({ bg: getComputedStyle(document.body).backgroundImage, scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth, theme: document.querySelector('.vocab-shell').getAttribute('data-unit-theme') }));
      for (const pathwayId of Object.keys(PATHWAYS)) {
        const tag = `${width}px / ${pathwayId}`;
        await page.goto(`${origin}/page?u=99&p=${pathwayId}`); // a unit with no theme = the plain page today
        const reference = await snapshot();
        for (const unit of units) {
          await page.goto(`${origin}/page?u=${unit}&p=${pathwayId}`);
          const other = await snapshot();
          if (other.theme !== null) failures.push(`${tag}: Unit ${unit} got a theme`);
          if (/wallpaper/.test(other.bg)) failures.push(`${tag}: Unit ${unit} got a wallpaper`);
          if (other.bg !== reference.bg) failures.push(`${tag}: Unit ${unit} background differs from the plain page`);
          if (other.scrollW > other.clientW) failures.push(`${tag}: Unit ${unit} horizontal overflow`);
        }
      }
      await ctx.close();
    }
  } finally { await browser.close(); server.close(); }
  return failures;
}

// Homepage and unit-overview backgrounds: the art is present where intended, absent everywhere else, and never changes layout or reaches content.
// Content is compared with the artwork switched off (same page, same scroll position), so only what the art itself paints can differ.
const PAGE_CASES = [
  { name: 'home', url: '/home', art: 'vocabulary-home-background.svg' },
  { name: 'unit 1 overview', url: '/overview?u=1', art: 'sports-free-time-overview.svg', compact: 'sports-free-time-overview-compact.svg' },
  { name: 'unit 2 overview', url: '/overview?u=2', art: 'digital-life-overview.svg', compact: 'digital-life-overview-compact.svg' },
  { name: 'unit 3 overview', url: '/overview?u=3', art: 'food-and-drink-overview.svg', compact: 'food-and-drink-overview-compact.svg' }, { name: 'unit 4 overview', url: '/overview?u=4', art: 'transport-overview.svg', compact: 'transport-overview-compact.svg' }, { name: 'unit 5 overview', url: '/overview?u=5', art: 'holidays-overview.svg', compact: 'holidays-overview-compact.svg' }, { name: 'unit 6 overview', url: '/overview?u=6', art: 'learning-study-skills-overview.svg', compact: 'learning-study-skills-overview-compact.svg' }, { name: 'unit 7 overview', url: '/overview?u=7', art: null }
];
export async function checkPageBackgrounds() {
  const { server, origin } = await serve();
  const browser = await playwright.chromium.launch({ executablePath });
  const failures = [], seen = {};
  try {
    for (const [width, height] of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: { width, height } });
      const page = await ctx.newPage(), cmp = await ctx.newPage();
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      for (const c of PAGE_CASES) {
        const tag = `${width}px / ${c.name}`;
        await page.goto(origin + c.url, { waitUntil: 'networkidle' });
        await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}html{scroll-behavior:auto!important}' }); await page.waitForTimeout(250);
        const layout = () => page.evaluate(() => {
          const rect = el => { const r = el.getBoundingClientRect(); return [r.x, r.y + scrollY, r.width, r.height].map(n => Math.round(n * 100) / 100); };
          return { scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth, scrollH: document.documentElement.scrollHeight, nodes: document.body.getElementsByTagName('*').length,
            boxes: [...document.querySelectorAll('.vocab-shell, .vocab-topbar, .vocab-topbar > *, .vocab-hero, .vocab-unit-hero, .vocab-unit-card, .vocab-pathway-card, .vocab-coursebook, .vocab-engage-home, .vocab-pathways__head, .vocab-support__head, button, a')].map(rect) };
        });
        const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundImage);
        const expected = width <= 900 && c.compact ? c.compact : c.art;
        if (expected) { if (!bg.includes(expected)) failures.push(`${tag}: background art ${expected} missing`); seen[`${width}/${c.name}`] = bg.match(/themes\/([\w-]+\.svg)/)?.[1]; }
        else if (bg.includes('assets/vocabulary/themes')) failures.push(`${tag}: this page must keep the plain background but has artwork`);
        if (!/radial-gradient/.test(bg)) failures.push(`${tag}: the page's light gradient was lost`);
        const themed = await layout();
        if (themed.scrollW > themed.clientW) failures.push(`${tag}: horizontal overflow`);
        const maxY = themed.scrollH - height, positions = [...new Set([0, Math.round(maxY * 0.5), Math.max(0, maxY)])];
        const clipsAt = () => page.evaluate(() => {
          const sel = '.vocab-topbar > *, .vocab-hero, .vocab-unit-hero, .vocab-unit-card, .vocab-pathway-card, .vocab-coursebook, .vocab-engage-home, .vocab-route-card, .vocab-support-card, .vocab-games-entry, .vocab-pathways__head > *, .vocab-support__head > *';
          return [...document.querySelectorAll(sel)].filter(el => !(innerWidth <= 900 && el.matches('.vocab-pathways__head > *, .vocab-support__head > *'))).map(el => { const r = el.getBoundingClientRect(); const inset = el.matches('.vocab-pathways__head > *, .vocab-support__head > *') ? 2 : el.matches('.vocab-topbar > *') ? 6 : 24;
            const x = Math.max(0, Math.floor(r.x) + inset), y = Math.max(0, Math.floor(r.y) + inset), w = Math.min(innerWidth, Math.ceil(r.right) - inset) - x, h = Math.min(innerHeight, Math.ceil(r.bottom) - inset) - y; return { x, y, width: w, height: h }; }).filter(c => c.width > 4 && c.height > 4);
        });
        const withArt = [], without = [];
        for (const y of positions) {
          await page.evaluate(y => scrollTo(0, y), y); await page.waitForTimeout(80);
          const clips = await clipsAt();
          withArt.push({ y, clips, full: await page.screenshot(), shots: await Promise.all(clips.map(clip => page.screenshot({ clip }))) });
        }
        await page.addStyleTag({ content: 'body{background-image:radial-gradient(circle at 8% 0%,rgba(37,174,182,.09),transparent 28%),radial-gradient(circle at 94% 0%,rgba(46,115,214,.08),transparent 30%)!important;background-attachment:scroll!important;background-size:auto!important}' }); await page.waitForTimeout(100);
        for (const y of positions) { await page.evaluate(y => scrollTo(0, y), y); await page.waitForTimeout(80); without.push({ full: await page.screenshot(), shots: await Promise.all(withArt[without.length].clips.map(clip => page.screenshot({ clip }))) }); }
        await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(80);
        const plain = await layout();
        for (const key of ['scrollW', 'scrollH', 'nodes', 'boxes']) if (JSON.stringify(themed[key]) !== JSON.stringify(plain[key])) failures.push(`${tag}: ${key} differs with the artwork (layout or DOM changed)`);
        if (expected) { const visible = (await Promise.all(withArt.map((s, i) => maxDiff(cmp, s.full, without[i].full)))).some(d => d > MAX_NOISE); if (!visible) failures.push(`${tag}: artwork is not visible at any scroll position`); }
        for (const [i, s] of withArt.entries()) for (const [j, clip] of s.clips.entries()) { const d = await maxDiff(cmp, s.shots[j], without[i].shots[j]); if (d > MAX_NOISE) failures.push(`${tag} @${s.y}px: artwork reaches content (${clip.x},${clip.y} ${clip.width}x${clip.height}) by ${d} levels`); }
      }
      if (errors.length) failures.push(`${width}px: page errors ${errors.join('; ')}`);
      await ctx.close();
    }
  } finally { await browser.close(); server.close(); }
  return { failures, seen };
}

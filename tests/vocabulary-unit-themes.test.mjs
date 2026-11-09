import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { UNIT_THEMES, unitThemeAttr, unitThemeId } from '../src/vocabulary/unit-themes.js';
import { renderVocabularyQuestion } from '../src/vocabulary/views.js';
import { SHEETS, contextQuestions, otherQuestions } from './helpers/wrap-audit-harness.mjs';
import { findChromium, loadPlaywright } from './helpers/pathway-geometry-harness.mjs';

// Unit background artwork pilot: Unit 1 (Sports & Free Time) only, decorative only.
const root = fileURLToPath(new URL('..', import.meta.url));
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const views = read('src/vocabulary/views.js');
const css = read('vocabulary-unit-themes.css');

test('only Unit 1 has a theme; every other unit keeps the plain background', () => {
  assert.deepEqual(Object.keys(UNIT_THEMES), ['1']);
  assert.equal(unitThemeId(1), 'sports-free-time');
  assert.equal(unitThemeAttr(1), ' data-unit-theme="sports-free-time"');
  for (const unit of [2, 3, 4, 5, 6, 7, 8, 9, 10, 0, null, undefined, 'x']) assert.equal(unitThemeAttr(unit), '', `unit ${unit}`);
});

test('the theme is wired through one attribute on the activity shell and one stylesheet, with no other behaviour', () => {
  assert.equal((views.match(/unitThemeAttr\(/g) ?? []).length, 1, 'one use in views.js');
  assert.match(views, /vocab-shell vocab-shell--session"\$\{unitThemeAttr\(unitNumber\)\}/);
  assert.match(read('vocabulary.html'), /<link rel="stylesheet" href="vocabulary-unit-themes\.css">/);
  assert.ok(SHEETS.includes('vocabulary-unit-themes.css'));
  // Decorative only: no motion, no layout properties, no pointer handling, only ever scoped to a themed shell.
  for (const forbidden of [/animation|transition|@keyframes/, /(?<![-\w])(width|height|margin|padding|display|position):/, /content:/, /z-index/]) {
    assert.doesNotMatch(css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/background-size:[^;]*;/g, ''), forbidden, String(forbidden));
  }
  assert.doesNotMatch(css.replace(/\/\*[\s\S]*?\*\//g, ''), /data-unit-theme="(?!sports-free-time")/);
  assert.match(css, /prefers|forced-colors/);
});

test('the SVG artwork is original, lightweight, self-contained and faint', () => {
  for (const name of ['main', 'accent']) {
    const file = `assets/vocabulary/themes/sports-free-time-${name}.svg`;
    const svg = read(file);
    assert.ok(svg.length < 4000, `${file} is ${svg.length} bytes`);
    assert.doesNotMatch(svg, /<script|<image|href=|xlink|<style|javascript:|<text/i);
    const opacity = Number(svg.match(/<svg[^>]*\sopacity="([\d.]+)"/)?.[1]);
    assert.ok(opacity >= 0.03 && opacity <= 0.1, `${file} opacity ${opacity}`);
  }
});

const playwright = loadPlaywright();
const executablePath = await findChromium();
const browserTest = playwright && executablePath ? test : test.skip;

const contexts = contextQuestions(), others = otherQuestions();
const PATHWAYS = {
  meaning: [contexts[2], 'Meaning'], context: [others.find(q => q.type === 'gap_fill_choice'), 'Context'],
  word_families: [others.find(q => q.type === 'gap_fill_choice'), 'Word Families'], paraphrasing: [others.find(q => q.type === 'choose_paraphrase'), 'Paraphrasing'],
  precision_use: [others.find(q => q.type === 'gap_fill_choice'), 'Precision & Use'], spelling_recall: [others.find(q => q.type === 'type_word_from_definition'), 'Spelling & Recall']
};
const VIEWPORTS = [[1440, 900], [820, 1100], [390, 844], [320, 640]];
const FEEDBACK_PATHWAYS = new Set(['meaning', 'spelling_recall']); // the feedback box is the other content that must stay clear
const links = [...read('vocabulary.html').matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map(m => `<link rel="stylesheet" href="/${m[1]}">`).join('');
const markup = (unit, pathwayId, feedback) => {
  const [question, label] = PATHWAYS[pathwayId], holder = { innerHTML: '' };
  renderVocabularyQuestion(holder, { unitNumber: unit, unitTitle: `Unit ${unit}`, question, term: question.term, sessionLabel: `${label} · 3 of 10`, sessionPosition: 3, sessionTotal: 10, pathwayId,
    ...(feedback ? { feedback: { correct: false, message: 'Not quite — look again at the sentence.' }, retry: true } : {}) });
  return holder.innerHTML;
};
const TYPES = { '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp' };
function serve() {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    if (url.pathname === '/page') {
      const body = markup(Number(url.searchParams.get('u')), url.searchParams.get('p'), url.searchParams.get('fb') === '1');
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
const MAX_NOISE = 4;
async function maxDiff(page, a, b) {
  return page.evaluate(async ([x, y]) => {
    const load = async b64 => { const img = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob()); const c = new OffscreenCanvas(img.width, img.height); const g = c.getContext('2d'); g.drawImage(img, 0, 0); return g.getImageData(0, 0, img.width, img.height); };
    const A = await load(x), B = await load(y);
    if (A.width !== B.width || A.height !== B.height) return 255;
    let max = 0; for (let i = 0; i < A.data.length; i++) { const d = Math.abs(A.data[i] - B.data[i]); if (d > max) max = d; } return max;
  }, [a.toString('base64'), b.toString('base64')]);
}

browserTest('Unit 1 shows the artwork on every pathway and viewport without touching content, layout or scrolling; Units 2 and 4 are unchanged', async () => {
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
        await page.goto(`${origin}/page?u=1&${q}`);
        await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' }); await page.waitForTimeout(250);
        const themed = await snapshot();
        // The card is checked inside its 20px rounded corners and soft shadow ring (that ring is page background, not content).
        const clips = await page.evaluate(() => [[document.querySelector('.vocab-question-card'), 24], ...[...document.querySelectorAll('.vocab-topbar > *')].map(el => [el, 0])].filter(([el]) => el).map(([el, inset]) => { const r = el.getBoundingClientRect(); return { x: Math.floor(r.x) + inset, y: Math.floor(r.y) + inset, width: Math.ceil(r.width) + 1 - 2 * inset, height: Math.ceil(r.height) + 1 - 2 * inset }; }).filter(c => c.x >= 0 && c.y >= 0 && c.width > 1 && c.height > 1));
        const shotsThemed = []; for (const clip of clips) shotsThemed.push(await page.screenshot({ clip: { ...clip, width: Math.min(clip.width, width - clip.x), height: Math.min(clip.height, height - clip.y) } }));
        const fullThemed = await page.screenshot();
        await page.evaluate(() => document.querySelector('.vocab-shell').removeAttribute('data-unit-theme')); await page.waitForTimeout(100);
        const plain = await snapshot();
        const shotsPlain = []; for (const clip of clips) shotsPlain.push(await page.screenshot({ clip: { ...clip, width: Math.min(clip.width, width - clip.x), height: Math.min(clip.height, height - clip.y) } }));
        const fullPlain = await page.screenshot();

        if (themed.theme !== 'sports-free-time') failures.push(`${tag}: Unit 1 shell is not themed`);
        if (!/sports-free-time-accent\.svg/.test(themed.bg)) failures.push(`${tag}: artwork layer missing`);
        if (width >= 1240 && !/sports-free-time-main\.svg/.test(themed.bg)) failures.push(`${tag}: main motif missing on a wide screen`);
        if (await maxDiff(cmp, fullThemed, fullPlain) <= MAX_NOISE) failures.push(`${tag}: artwork is not visible in the page at all`);
        if (themed.scrollW > themed.clientW) failures.push(`${tag}: horizontal overflow`);
        for (const key of ['scrollH', 'shell', 'card', 'controls', 'nodes']) if (JSON.stringify(themed[key]) !== JSON.stringify(plain[key])) failures.push(`${tag}: ${key} differs with the artwork (layout or DOM changed)`);
        for (const [i, clip] of clips.entries()) { const diff = await maxDiff(cmp, shotsThemed[i], shotsPlain[i]); if (diff > MAX_NOISE) failures.push(`${tag}: artwork reaches content region ${i} (${clip.x},${clip.y} ${clip.width}x${clip.height}) by ${diff} levels`); }

        for (const unit of [2, 4]) {
          await page.goto(`${origin}/page?u=${unit}&${q}`);
          await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' }); await page.waitForTimeout(150);
          const other = await snapshot();
          if (other.theme !== null) failures.push(`${tag}: Unit ${unit} got a theme`);
          if (/sports-free-time/.test(other.bg)) failures.push(`${tag}: Unit ${unit} got artwork`);
          if (other.bg !== plain.bg) failures.push(`${tag}: Unit ${unit} background differs from the plain page`);
          if (other.scrollW > other.clientW) failures.push(`${tag}: Unit ${unit} horizontal overflow`);
        }
      }
      if (errors.length) failures.push(`${width}px: page errors ${errors.join('; ')}`);
      await ctx.close();
    }
  } finally { await browser.close(); server.close(); }
  assert.deepEqual(failures, []);
});

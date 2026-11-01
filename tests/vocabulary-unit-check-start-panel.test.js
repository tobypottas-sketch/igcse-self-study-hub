// Unit Check start panel (presentation polish): all information, the CTA wiring and the locked/disabled states are unchanged; layout holds at 1440/1024/768/390.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { renderUnitCheckCard } from '../src/vocabulary/unit-check-view.js';
import { findChromium, loadPlaywright } from './helpers/pathway-geometry-harness.mjs';

const repo = fileURLToPath(new URL('..', import.meta.url));
const text = html => html.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const one = { attemptNumber: 2, formId: 'B', attemptsUsed: 1, latest: { score: 7, maxScore: 10 }, best: { score: 8, maxScore: 10 } };

test('fresh card: every piece of the old information is still present', () => {
  const html = renderUnitCheckCard(); const t = text(html);
  for (const s of ['Formal assessment', 'Unit Vocabulary Check', 'Cambridge iGCSE ESL 0511', '10 questions', '3 attempts', 'Feedback after submission', 'Attempt 1 of 3', 'Form A', 'Start Unit Check']) assert.ok(t.includes(s), s);
  assert.match(html, /Latest<\/small><strong>—<\/strong>/); assert.match(html, /Best<\/small><strong>—<\/strong>/); assert.match(html, /Attempts left<\/small><strong>3<\/strong>/);
  assert.match(html, /<h2 id="unitCheckTitle">Unit Vocabulary Check<\/h2>/); assert.match(html, /aria-labelledby="unitCheckTitle"/);
  assert.doesNotMatch(html, /<img|emoji|https?:\/\//);
});

test('after attempts: Latest, Best, Attempts left, attempt number and form follow the data; remaining state is words as well as colour', () => {
  const html = renderUnitCheckCard(one); assert.match(html, /Latest<\/small><strong>7 \/ 10/); assert.match(html, /Best<\/small><strong>8 \/ 10/); assert.match(html, /Attempts left<\/small><strong>2<\/strong>/);
  assert.match(html, /Attempt 2 of 3/); assert.match(html, /Form B/); assert.match(html, /data-remaining="2"/); assert.match(html, /Two attempts remain/); assert.match(html, /aria-label="Attempts left: 2 of 3"/);
  const last = renderUnitCheckCard({ ...one, attemptNumber: 3, formId: 'C', attemptsUsed: 2 }); assert.match(last, /Attempts left<\/small><strong>1<\/strong>/); assert.match(last, /Last attempt/); assert.match(last, /Start next attempt/);
});

test('CTA stays wired: same action attribute, same labels, same disabled states; locked shows the finished state and no button', () => {
  assert.match(renderUnitCheckCard(), /<button type="button" class="vocab-button vocab-button--primary vocab-unit-check-card__cta" data-unit-check-action="start">Start Unit Check/);
  assert.match(renderUnitCheckCard(one), /data-unit-check-action="start">Start next attempt/);
  for (const state of [{ loading: true }, { unavailable: true }]) assert.match(renderUnitCheckCard(state), /data-unit-check-action="start" disabled aria-disabled="true"/);
  const locked = renderUnitCheckCard({ attemptsUsed: 3, locked: true, latest: { score: 9, maxScore: 10 }, best: { score: 9, maxScore: 10 } });
  assert.doesNotMatch(locked, /<button/); assert.match(locked, /Assessment complete/); assert.match(locked, /All 3 attempts complete/); assert.match(locked, /Attempts left<\/small><strong>0<\/strong>/); assert.match(locked, /data-remaining="0"/);
  assert.match(renderUnitCheckCard({ loading: true }), /Loading your check/); assert.match(renderUnitCheckCard({ unavailable: true }), /Score service unavailable/);
});

test('CSS: reuses the existing palette tokens, adds no motion, and keeps stacked/phone rules', () => {
  const css = fs.readFileSync(path.join(repo, 'vocabulary-unit-check.css'), 'utf8'); const card = css.split('\n')[0];
  assert.match(card, /var\(--c-teal/); assert.doesNotMatch(card, /animation|transition|@keyframes/);
  assert.match(css, /@media\(max-width:900px\)\{\.vocab-unit-check-card\{grid-template-columns:1fr\}/); assert.match(css, /@media\(max-width:560px\)\{\.vocab-unit-check-card\{padding:20px 16px/);
  assert.match(css, /\.vocab-unit-check-card__cta:focus-visible\{outline/);
});

const browserTest = loadPlaywright() && await findChromium() ? test : test.skip;
browserTest('the panel has no horizontal overflow or clipped chips at 1440 / 1024 / 768 / 390 in every state', async () => {
  const css = [...fs.readFileSync(path.join(repo, 'vocabulary.html'), 'utf8').matchAll(/<link rel="stylesheet" href="([^"?]+\.css)[^"]*">/g)].map(m => m[1]).filter(f => fs.existsSync(path.join(repo, f))).map(f => fs.readFileSync(path.join(repo, f), 'utf8')).join('\n');
  const states = [{}, one, { ...one, attemptNumber: 3, formId: 'C', attemptsUsed: 2 }, { attemptsUsed: 3, locked: true, latest: { score: 9, maxScore: 10 }, best: { score: 9, maxScore: 10 } }];
  const browser = await loadPlaywright().chromium.launch({ executablePath: await findChromium() });
  try {
    for (const w of [1440, 1024, 768, 390]) for (const state of states) {
      const p = await browser.newPage({ viewport: { width: w, height: 800 } });
      await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body><main class="vocab-shell"><div id="vocabularyApp">${renderUnitCheckCard(state)}</div></main></body></html>`);
      const m = await p.evaluate(() => { const card = document.querySelector('[data-unit-check-card]'); const cr = card.getBoundingClientRect();
        const spill = [...card.querySelectorAll('*')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.right > cr.right + 1 || r.left < cr.left - 1); }).length;
        const clipped = [...card.querySelectorAll('li, .vocab-unit-check-card__pill, .vocab-unit-check-card__stat, button')].filter(e => e.scrollWidth > e.clientWidth + 1).length;
        const stats = [...card.querySelectorAll('.vocab-unit-check-card__stat')].map(e => Math.round(e.getBoundingClientRect().width)); const btn = card.querySelector('button');
        return { overflow: document.documentElement.scrollWidth - innerWidth, spill, clipped, stats, btnW: btn ? Math.round(btn.getBoundingClientRect().width) : null, height: Math.round(cr.height) }; });
      const where = `${w}px ${JSON.stringify(state).slice(0, 40)}`;
      assert.ok(m.overflow <= 0, `${where}: overflow`); assert.equal(m.spill, 0, `${where}: content outside card`); assert.equal(m.clipped, 0, `${where}: clipped text`);
      assert.ok(m.stats.every(x => x >= 90), `${where}: stat cards stay readable ${m.stats}`); assert.ok(Math.max(...m.stats) - Math.min(...m.stats) <= 2, `${where}: equal stat widths`); assert.ok(m.height < 520, `${where}: no giant empty card`);
      if (m.btnW) assert.ok(m.btnW >= (w <= 768 ? w * 0.7 : 260), `${where}: CTA is a clear primary action`);
      await p.close();
    }
  } finally { await browser.close(); }
});

test('scope: only the card view, its CSS and tests changed (no logic, Supabase, SQL, Edge, Games or content)', t => {
  let files; try { files = execFileSync('git', ['diff', '--name-only', 'origin/main...HEAD'], { cwd: repo, encoding: 'utf8' }).split('\n').filter(Boolean); } catch { t.skip('no git history'); return; }
  if (!files.length) { t.skip('no committed diff yet'); return; }
  for (const f of files) assert.match(f, /^(src\/vocabulary\/unit-check-view\.js|vocabulary-unit-check\.css|tests\/vocabulary-unit-check-start-panel\.test\.js)$/, f);
});

// Unit navigation / header identity (presentation only). Renderers: renderVocabularyHome and renderVocabularyUnit in views.js; the only style
// owner for the new classes is vocabulary-unit-header.css. Navigation destinations and actions are unchanged.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderVocabularyHome, renderVocabularyUnit } from '../src/vocabulary/views.js';
import { findChromium, loadPlaywright } from './helpers/pathway-geometry-harness.mjs';

const repo = fileURLToPath(new URL('..', import.meta.url));
const read = file => fs.readFileSync(path.join(repo, file), 'utf8');
const unitHtml = (unitNumber, unitTitle) => { const root = { innerHTML: '' }; renderVocabularyUnit(root, { unitNumber, unitTitle, progress: { mastered: 3, total: 50, needsAnotherLook: 1, reviewDue: 0, stages: {} }, pathwayStates: {}, contentReady: true }); return root.innerHTML; };
const homeHtml = () => { const root = { innerHTML: '' }; renderVocabularyHome(root, { displayName: 'Amy', units: [{ unitNumber: 1, unitTitle: 'Sports & Free Time', mastered: 3, total: 50 }], soundOn: true }); return root.innerHTML; };

test('inside a unit: the unit number and title in the strip come from the unit data, not from navigation code', () => {
  for (const [number, title] of [[1, 'Sports & Free Time'], [7, 'Travel and Tourism'], [12, 'Global Citizenship, Sustainable Development and the Responsibilities of Young People']]) {
    const out = unitHtml(number, title);
    const strip = out.match(/<header class="vocab-topbar vocab-topbar--unit">[\s\S]*?<\/header>/)[0];
    assert.match(strip, new RegExp(`vocab-unit-id__badge">Unit ${number}<`));
    assert.match(strip, new RegExp(`vocab-unit-id__title">${title.replace(/&/g, '&amp;').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<`));
  }
  assert.doesNotMatch(read('src/vocabulary/views.js').match(/vocab-topbar vocab-topbar--unit[^`]*/)[0], /Sports|Free Time/, 'no hard-coded unit title');
  assert.doesNotMatch(read('vocabulary-unit-header.css'), /Sports|Free Time/);
});

test('the unit title is escaped, never injected as markup', () => {
  const out = unitHtml(2, '<img src=x onerror=alert(1)>');
  assert.doesNotMatch(out.match(/vocab-topbar--unit[\s\S]*?<\/header>/)[0], /<img/);
});

test('back navigation is the same control and the same action: a <button data-action="back-units">; Hub stays a link to ./', () => {
  const strip = unitHtml(1, 'Sports & Free Time').match(/<header class="vocab-topbar vocab-topbar--unit">[\s\S]*?<\/header>/)[0];
  assert.match(strip, /<button class="vocab-back vocab-back--chip" data-action="back-units"[^>]*>/);
  assert.match(strip, />\s*<span class="vocab-back__arrow" aria-hidden="true">←<\/span> All units<\/button>/);
  assert.equal((strip.match(/data-action=/g) ?? []).length, 1, 'one action only');
  assert.match(homeHtml(), /<a href="\.\/" class="vocab-back vocab-back--chip">/);
  assert.match(read('src/vocabulary/app.js'), /action === 'back-units'\) showHome\(\)/, 'controller wiring untouched');
});

test('unit selection keeps its structure: strip, hero, XP strip, unit grid, coursebook card, sound toggle; the hero copy is unchanged', () => {
  const out = homeHtml();
  assert.match(out, /vocab-topbar vocab-topbar--home[\s\S]*Cambridge IGCSE ESL 0511[\s\S]*vocab-sound/i);
  assert.match(out, /<section class="vocab-hero vocab-hero--home"><p class="vocab-kicker">Vocabulary &amp; Paraphrase Builder<\/p><h1>Choose a unit<\/h1><p><strong>Hi Amy\.<\/strong> Choose a unit, then work upwards through each vocabulary pathway\.<\/p><\/section>/);
  assert.match(out, /vocab-unit-grid/); assert.match(out, /vocab-coursebook/); assert.match(out, /data-action="open-unit" data-unit="1"/);
});

test('one style owner: the new header classes are styled only in vocabulary-unit-header.css, which is loaded once', () => {
  const owned = /\.(vocab-topbar--home|vocab-topbar--unit|vocab-back--chip|vocab-back__arrow|vocab-unit-id|vocab-topbar__course|vocab-hero--home)/;
  for (const sheet of fs.readdirSync(repo).filter(f => f.endsWith('.css') && f !== 'vocabulary-unit-header.css')) assert.doesNotMatch(read(sheet), owned, `${sheet} must not style the unit header`);
  assert.match(read('vocabulary-unit-header.css'), owned);
  assert.equal((read('vocabulary.html').match(/vocabulary-unit-header\.css/g) ?? []).length, 1);
  // session screens keep the plain strip
  assert.match(read('src/vocabulary/views.js'), /<header class="vocab-topbar">/);
});

const browserTest = loadPlaywright() && await findChromium() ? test : test.skip;
browserTest('geometry at 1440 / 1280 / 820 / 390 / 320: no overflow, back tap target >= 44px, title never collides with back, long titles wrap, strip stays compact', async () => {
  const playwright = loadPlaywright();
  const browser = await playwright.chromium.launch({ executablePath: await findChromium() });
  try {
    const css = [...read('vocabulary.html').matchAll(/href="([^"]+\.css)"/g)].map(m => `<style>${read(m[1])}</style>`).join('');
    const pages = { unit: unitHtml(1, 'Sports & Free Time'), longUnit: unitHtml(12, 'Global Citizenship, Sustainable Development and the Responsibilities of Young People'), home: homeHtml() };
    for (const [name, body] of Object.entries(pages)) {
      for (const [w, h] of [[1440, 900], [1280, 720], [820, 1100], [390, 844], [320, 640]]) {
        const page = await browser.newPage({ viewport: { width: w, height: h } });
        await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${css}</head><body><div id="vocabularyApp">${body}</div></body></html>`);
        const r = await page.evaluate(() => {
          const rect = el => el?.getBoundingClientRect();
          const strip = rect(document.querySelector('.vocab-topbar')); const back = rect(document.querySelector('.vocab-back')); const id = rect(document.querySelector('.vocab-unit-id')); const hero = document.querySelector('.vocab-unit-hero h1, .vocab-hero h1');
          const overlap = back && id ? !(back.right <= id.left + 0.5 || id.right <= back.left + 0.5 || back.bottom <= id.top + 0.5 || id.bottom <= back.top + 0.5) : false;
          const h1 = rect(hero);
          return { over: document.documentElement.scrollWidth - document.documentElement.clientWidth, stripH: strip.height, backH: back.height, backW: back.width, overlap, heroOut: h1 ? h1.right > innerWidth : false, stripW: strip.width, titleInside: id ? id.right <= strip.right + 1 && id.left >= strip.left - 1 : true };
        });
        assert.ok(r.over <= 0, `${name}@${w}: overflow ${r.over}`);
        assert.ok(r.backH >= 44 && r.backW >= 44, `${name}@${w}: back tap ${r.backW}x${r.backH}`);
        assert.equal(r.overlap, false, `${name}@${w}: title collides with back`);
        assert.equal(r.titleInside, true, `${name}@${w}: title outside the strip`);
        assert.equal(r.heroOut, false, `${name}@${w}: hero title runs past the viewport`);
        assert.ok(r.stripH <= 110, `${name}@${w}: strip too tall ${r.stripH}`);
        if (w >= 820) assert.ok(r.stripH <= 64, `${name}@${w}: strip should be one slim row (${r.stripH})`);
        await page.close();
      }
    }
  } finally { await browser.close(); }
});

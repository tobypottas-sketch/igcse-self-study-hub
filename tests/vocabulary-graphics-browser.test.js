import test from 'node:test';
import assert from 'node:assert/strict';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { findChromium, loadPlaywright } from './helpers/pathway-geometry-harness.mjs';
import { openMission } from './helpers/question-latency-harness.mjs';
import { allGraphicNames } from '../src/vocabulary/graphics-registry.js';

// Real views, CSS and runtime in headless Chromium. The manifest module and the PNG files are served by the test (no fake art is
// committed): this proves the layering, the geometry guarantee and the fallback for every width, with and without the files.
const root = fileURLToPath(new URL('..', import.meta.url));
const browserTest = loadPlaywright() && await findChromium() ? test : test.skip;
const PATHWAYS = ['meaning', 'context', 'word_families', 'paraphrasing', 'precision_use', 'spelling_recall'];

function crc32(buffer) { let crc = ~0; for (const byte of buffer) { crc ^= byte; for (let k = 0; k < 8; k += 1) crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1)); } return ~crc >>> 0; }
function chunk(type, data) { const out = Buffer.alloc(12 + data.length); out.writeUInt32BE(data.length, 0); out.write(type, 4, 'ascii'); data.copy(out, 8); out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length); return out; }
function png(width, height) {
  const header = Buffer.alloc(13); header.writeUInt32BE(width, 0); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 2;
  const row = Buffer.alloc(1 + width * 3); for (let x = 0; x < width; x += 1) { row[1 + x * 3] = 40; row[2 + x * 3] = 150; row[3 + x * 3] = 170; }
  const raw = Buffer.concat(Array.from({ length:height }, () => row));
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
const UNIT_PNG = png(320, 180); const PATHWAY_PNG = png(128, 128);

const MANIFEST = names => route => route.fulfill({ contentType:'text/javascript', body:`export const SHIPPED_PNG = Object.freeze(${JSON.stringify(names)});` });
function withAssets({ names = allGraphicNames(), files = 'serve', requests = [] } = {}) {
  return async page => {
    await page.route('**/src/vocabulary/graphics-manifest.js', MANIFEST(names));
    await page.route('**/assets/vocabulary/**', route => {
      requests.push(new URL(route.request().url()).pathname);
      if (files === 'missing') return route.fulfill({ status:404, body:'not found' });
      return route.fulfill({ contentType:'image/png', body:route.request().url().includes('/units/') ? UNIT_PNG : PATHWAY_PNG });
    });
  };
}
// The real manifest now lists every shipped PNG, so a test that wants "nothing shipped" serves an empty manifest explicitly.
async function open(options = {}, extra = {}) {
  const api = await openMission({ root, pathway:'meaning', beforeLoad:withAssets({ names:[] }), ...options, ...extra });
  await api.page.waitForSelector('.vocab-pathway-card');
  return api;
}
const geometry = async api => { await api.page.mouse.move(0, 0); await api.page.waitForTimeout(350); return measure(api); };   // no hover transform while measuring
const measure = api => api.page.evaluate(() => {
  const box = el => { const r = el?.getBoundingClientRect(); return r ? [Math.round(r.x * 10) / 10, Math.round(r.y * 10) / 10, Math.round(r.width * 10) / 10, Math.round(r.height * 10) / 10] : null; };
  return {
    hScroll:document.documentElement.scrollWidth > document.documentElement.clientWidth,
    hero:box(document.querySelector('.vocab-unit-hero')), heroArt:box(document.querySelector('.vocab-unit-hero__art')),
    cards:[...document.querySelectorAll('.vocab-pathway-card')].map(card => { const origin = card.getBoundingClientRect(); const inside = el => { const b = box(el); return b && [Math.round((b[0] - origin.x) * 10) / 10, Math.round((b[1] - origin.y) * 10) / 10, b[2], b[3]]; }; return { id:card.dataset.pathway, size:[Math.round(origin.width * 10) / 10, Math.round(origin.height * 10) / 10], art:inside(card.querySelector('.vocab-pathway-card__art')), cta:inside(card.querySelector('.vocab-pathway-card__cta')), ladder:inside(card.querySelector('.vocab-pathway-ladder')), evidence:inside(card.querySelector('.vocab-pathway-card__evidence')) }; })
  };
});
const layers = api => api.page.evaluate(() => [...document.querySelectorAll('[data-art-slot]')].map(slot => {
  const image = slot.querySelector('img[data-art-png]'); const svg = slot.querySelector('.study-art__svg');
  return { slot:slot.className, loaded:slot.classList.contains('is-png-ready'), failed:slot.classList.contains('png-failed'), img:Boolean(image), natural:image?.naturalWidth ?? 0, imgOpacity:image ? getComputedStyle(image).opacity : null, fit:image ? getComputedStyle(image).objectFit : null, svgVisibility:svg ? getComputedStyle(svg).visibility : null, svg:Boolean(svg), within:image ? (() => { const a = image.getBoundingClientRect(); const b = slot.getBoundingClientRect(); if (slot.matches('.vocab-unit-hero__art')) return Math.abs(a.width - b.width) < 1 && a.height <= b.height + 1 && (Math.abs(a.width / a.height - 2.2) < 0.05 || Math.abs(a.height - b.height) < 1); return Math.abs(a.width - b.width) < 1 && Math.abs(a.height - b.height) < 1; })() : null };
}));
// Images below the fold are lazy (loading="lazy"), exactly as for a student; scroll them into view, then return to the top.
async function reveal(api, settled = '.is-png-ready', minimum = 7) {
  const total = await api.page.evaluate(() => document.querySelectorAll('[data-art-slot]').length);
  for (let index = 0; index < total; index += 1) {
    await api.page.evaluate(position => document.querySelectorAll('[data-art-slot]')[position]?.scrollIntoView({ block:'center', behavior:'instant' }), index);
    await api.page.waitForTimeout(140);
  }
  await api.page.waitForFunction(({ selector, count }) => document.querySelectorAll(`[data-art-slot]${selector}`).length >= count, { selector:settled, count:minimum }, { timeout:8000 });
  await api.page.evaluate(() => window.scrollTo({ top:0, behavior:'instant' }));
  await api.page.waitForTimeout(400);   // let the 220ms fade finish before measuring opacity
}
const WIDTHS = [[1280, 900], [820, 1000], [390, 800]];

browserTest('nothing is shipped by default: no PNG request is made and the SVG artwork is shown', async () => {
  const requests = [];
  const api = await open({ width:1280 }, { beforeLoad:async page => { await withAssets({ names:[] })(page); page.on('request', request => { if (/assets\/vocabulary/.test(request.url())) requests.push(request.url()); }); } });
  try {
    assert.deepEqual(requests, []);
    assert.equal(await api.page.evaluate(() => document.querySelectorAll('img[data-art-png]').length), 0);
    assert.ok(await api.page.evaluate(() => document.querySelectorAll('.vocab-pathway-card__art .study-art__svg').length) >= 6);
    assert.equal(await api.page.evaluate(() => document.querySelectorAll('.vocab-unit-hero__art .study-art__svg').length), 1);
  } finally { await api.close(); }
});

for (const [width, height] of WIDTHS) {
  browserTest(`${width}px: PNGs replace the SVG inside the same slots with identical geometry and no overflow`, async () => {
    const baseline = await open({ width, height });
    let before; try { before = await geometry(baseline); } finally { await baseline.close(); }
    const requests = [];
    const api = await open({ width, height }, { beforeLoad:withAssets({ requests }) });
    try {
      await reveal(api);
      const states = await layers(api);
      assert.equal(states.length, 7, 'one unit banner and six pathway illustrations');
      for (const state of states) {
        assert.equal(state.loaded, true); assert.ok(state.natural > 0); assert.equal(state.imgOpacity, '1');
        assert.equal(state.svgVisibility, 'hidden', 'the placeholder is hidden once the PNG has loaded (transparent PNGs show no SVG behind)');
        assert.equal(state.within, true, 'the image fills its slot exactly: no overflow, no stretching of the slot');
      }
      assert.equal(states.filter(state => state.fit === 'cover').length, 1, 'unit banner crops (cover)');
      assert.equal(states.filter(state => state.fit === 'contain').length, 6, 'pathway art is contained at a consistent size');
      const after = await geometry(api);
      assert.deepEqual(after.cards, before.cards, 'adding the PNGs changes no pathway card, art slot, ladder, evidence or CTA geometry');
      assert.ok(after.hero[3] - before.hero[3] <= 40, `the banner does not become dramatically taller (${before.hero[3]} → ${after.hero[3]})`);
      assert.ok(after.heroArt[0] + after.heroArt[2] <= after.hero[0] + after.hero[2], 'the banner art stays inside the banner');
      assert.equal(after.hScroll, false);
      // each pathway card requested its own file; nothing else under assets/vocabulary
      for (const file of ['units/unit-01.png', 'pathways/meaning.png', 'pathways/context.png', 'pathways/word-families.png', 'pathways/paraphrasing.png', 'pathways/precision-use.png', 'pathways/spelling-recall.png']) assert.ok(requests.some(path => path.endsWith(`/assets/vocabulary/${file}`)), file);
      assert.deepEqual(api.errors(), []);
    } finally { await api.close(); }
  });
}

browserTest('the Meaning card still starts its pathway with a PNG in place (CTA, ladder and chips are reachable)', async () => {
  const api = await open({ width:390, height:800 }, { beforeLoad:withAssets() });
  try {
    await reveal(api);
    const reachable = await api.page.evaluate(() => { const card = document.querySelector('.vocab-pathway-card[data-pathway="meaning"]'); const art = card.querySelector('.vocab-pathway-card__art'); return { pointerEvents:getComputedStyle(art).pointerEvents, ladder:Boolean(card.querySelector('.vocab-pathway-stage[data-state="current"]')), cta:Boolean(card.querySelector('.vocab-pathway-card__cta')) }; });
    assert.deepEqual(reachable, { pointerEvents:'none', ladder:true, cta:true });
    await api.start();
    assert.ok(await api.page.evaluate(() => window.__currentQuestion));
  } finally { await api.close(); }
});

browserTest('missing files: no broken-image icon, the SVG stays, layout is unchanged and the failure is not retried', async () => {
  for (const [width, height] of WIDTHS) {
    const baseline = await open({ width, height });
    let before; try { before = await geometry(baseline); } finally { await baseline.close(); }
    const requests = [];
    const api = await open({ width, height }, { beforeLoad:withAssets({ files:'missing', requests }) });
    try {
      await reveal(api, '.png-failed', 6);   // the unit banner shares the home card’s file, which already failed: it is not requested again
      const states = await layers(api);
      assert.ok(states.length >= 6);
      for (const state of states) { assert.equal(state.img, false, 'the failed <img> is removed'); assert.equal(state.loaded, false); assert.equal(state.failed, true); assert.equal(state.svg, true); assert.equal(state.svgVisibility, 'visible'); }
      assert.equal(await api.page.evaluate(() => [...document.images].filter(image => !image.complete || image.naturalWidth === 0).length), 0, 'no broken image anywhere on the page');
      const after = await geometry(api);
      assert.deepEqual(after.cards, before.cards);
      assert.equal(after.hScroll, false);
      assert.ok(after.hero[3] - before.hero[3] <= 40);
      const first = requests.length;
      // re-rendering the unit page (back to the list and in again) does not request the failed files again
      await api.page.click('[data-action="back-units"]'); await api.page.waitForSelector('.vocab-unit-card');
      await api.page.waitForTimeout(300);
      assert.equal(await api.page.evaluate(() => document.querySelectorAll('img[data-art-png]').length), 0);
      assert.equal(requests.length, first + 0, 'failed assets are not requested again this session');
    } finally { await api.close(); }
  }
});

browserTest('home unit cards use the unit PNG too, cropped to the card slot without distortion', async () => {
  const api = await open({ width:820, height:900 }, { beforeLoad:withAssets() });
  try {
    await api.page.click('[data-action="back-units"]'); await api.page.waitForSelector('.vocab-unit-card__art');
    await api.page.waitForFunction(() => document.querySelector('.vocab-unit-card__art.is-png-ready'));
    const state = await api.page.evaluate(() => { const slot = document.querySelector('.vocab-unit-card__art'); const image = slot.querySelector('img'); const a = image.getBoundingClientRect(); const b = slot.getBoundingClientRect(); return { fit:getComputedStyle(image).objectFit, same:Math.abs(a.width - b.width) < 1 && Math.abs(a.height - b.height) < 1, hScroll:document.documentElement.scrollWidth > document.documentElement.clientWidth }; });
    assert.deepEqual(state, { fit:'cover', same:true, hScroll:false });
  } finally { await api.close(); }
});

browserTest('reduced motion: the PNG appears without a fade', async () => {
  const api = await open({ width:1280, reducedMotion:true }, { beforeLoad:withAssets() });
  try {
    await reveal(api);
    assert.ok(parseFloat(await api.page.evaluate(() => getComputedStyle(document.querySelector('img[data-art-png]')).transitionDuration)) < 0.001, 'no fade under reduced motion');
  } finally { await api.close(); }
});

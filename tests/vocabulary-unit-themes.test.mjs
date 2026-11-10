import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { UNIT_THEMES, unitThemeAttr, unitThemeId } from '../src/vocabulary/unit-themes.js';
import { SHEETS } from './helpers/wrap-audit-harness.mjs';
import { browserAvailable, checkPlainUnits, checkThemedUnit, tileStats } from './helpers/unit-theme-harness.mjs';

// Unit background wallpapers (decorative only): Unit 1 Sports & Free Time, Unit 2 Digital Life, Unit 3 Food and Drink, Unit 4 Transport, Unit 5 Holidays. Unit 2's to 5's browser checks live in
// vocabulary-unit2-theme.test.mjs to vocabulary-unit5-theme.test.mjs so the units run in parallel; this file also holds the shared static and tile checks.
const root = fileURLToPath(new URL('..', import.meta.url));
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const views = read('src/vocabulary/views.js');
const css = read('vocabulary-unit-themes.css');
const THEMES = { 1: 'sports-free-time', 2: 'digital-life', 3: 'food-and-drink', 4: 'transport', 5: 'holidays' };
const wallpaper = id => `assets/vocabulary/themes/${id}-wallpaper.svg`;

test('Units 1 to 5 have a theme; every other unit keeps the plain background', () => {
  assert.deepEqual({ ...UNIT_THEMES }, THEMES);
  for (const [unit, id] of Object.entries(THEMES)) {
    assert.equal(unitThemeId(Number(unit)), id);
    assert.equal(unitThemeAttr(Number(unit)), ` data-unit-theme="${id}"`);
  }
  for (const unit of [6, 7, 8, 9, 10, 0, null, undefined, 'x']) assert.equal(unitThemeAttr(unit), '', `unit ${unit}`);
});

test('themes are wired through one attribute on the activity shell and one shared stylesheet, with no other behaviour', () => {
  assert.equal((views.match(/unitThemeAttr\(/g) ?? []).length, 1, 'one use in views.js');
  assert.match(views, /vocab-shell vocab-shell--session"\$\{unitThemeAttr\(unitNumber\)\}/);
  assert.match(read('vocabulary.html'), /<link rel="stylesheet" href="vocabulary-unit-themes\.css">/);
  assert.ok(SHEETS.includes('vocabulary-unit-themes.css'));
  // Decorative only: no motion, no generated content, no stacking or positioning; the only box property is the footer line's shrink-wrap.
  const rules = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/[^{}]*\.vocab-session-unit\{width:fit-content;margin-inline:auto\}/, '').replace(/@media \(min-width:901px\)\{[\s\S]*?\}\s*\}/, '').replace(/background-size:[^;]*;/g, '');
  for (const forbidden of [/animation|transition|@keyframes/, /(?<![-\w])(width|height|margin|padding|display|position|top|left|right|bottom|float):/, /content:/, /z-index/, /pointer-events/]) {
    assert.doesNotMatch(rules, forbidden, String(forbidden));
  }
  assert.match(css, /background-repeat:\s*repeat/);
  // Exactly one wallpaper declaration per theme, no theme without a mapping entry and no mapping entry without a wallpaper.
  const named = [...css.matchAll(/data-unit-theme="([^"]+)"\]\)\{--unit-wallpaper:url\("([^"]+)"\)\}/g)].map(m => [m[1], m[2]]);
  assert.deepEqual(named.map(([id]) => id).sort(), Object.values(THEMES).sort());
  for (const [id, file] of named) assert.equal(file, wallpaper(id), id);
  assert.doesNotMatch(css.replace(/\/\*[\s\S]*?\*\//g, ''), /data-unit-theme="(?!sports-free-time"|digital-life"|food-and-drink"|transport"|holidays")/);
  assert.match(css, /prefers|forced-colors/);
});

test('every wallpaper tile is an original, lightweight, self-contained SVG with a light-coloured, restrained stroke', () => {
  for (const id of Object.values(THEMES)) {
    const file = wallpaper(id), svg = read(file);
    assert.ok(svg.length < 8000, `${file} is ${svg.length} bytes`);
    assert.doesNotMatch(svg, /<script|<image|xlink|<style|javascript:|<text|<foreignObject|href="(?!#)/i);
    assert.doesNotMatch(svg, /<rect[^>]*fill="(?!none)|background/i, 'the tile carries no background fill of its own');
    const opacity = Number(svg.match(/<svg[^>]*\sopacity="([\d.]+)"/)?.[1]);
    assert.ok(opacity >= 0.2 && opacity <= 0.5, `${file} opacity ${opacity}`);
    for (const stroke of new Set([...svg.matchAll(/stroke="(#[0-9a-f]{6})"/gi)].map(m => m[1]))) {
      const [r, g, b] = [1, 3, 5].map(i => parseInt(stroke.slice(i, i + 2), 16));
      assert.ok(Math.max(r, g, b) > 0x60 && Math.min(r, g, b) < 0xb0 && !(r < 0x40 && g < 0x40 && b < 0x40), `stroke ${stroke} is a muted teal / blue-grey`);
    }
  }
  for (const old of ['main', 'accent']) assert.equal(fs.existsSync(path.join(root, `assets/vocabulary/themes/sports-free-time-${old}.svg`)), false);
});

test('Units 1 to 5 share one visual standard: same tile size, stroke, strength, palette, icon grid and variety', () => {
  const facts = id => {
    const svg = read(wallpaper(id));
    const root = svg.match(/<svg[^>]*>/)[0];
    return {
      viewBox: root.match(/viewBox="([^"]+)"/)[1], stroke: root.match(/stroke-width="([^"]+)"/)[1], opacity: root.match(/opacity="([^"]+)"/)[1],
      icons: new Set([...svg.matchAll(/<use href="#([^"]+)"/g)].map(m => m[1])).size, placed: (svg.match(/<use /g) ?? []).length,
      palette: [...new Set([...svg.matchAll(/stroke="(#[0-9a-f]{6})"/gi)].map(m => m[1].toLowerCase()))].sort().join(),
      accents: (svg.match(/<(?:circle|path)[^>]*stroke="#[0-9a-f]{6}"[^>]*\/>/g) ?? []).length
    };
  };
  const a = facts('sports-free-time');
  for (const id of ['digital-life', 'food-and-drink', 'transport', 'holidays']) {
    const b = facts(id);
    for (const key of ['viewBox', 'stroke', 'opacity', 'placed', 'palette']) assert.equal(a[key], b[key], `${id} ${key}`);
    assert.ok(a.icons >= 12 && a.icons <= 15 && b.icons >= 12 && b.icons <= 15, `distinct icons ${a.icons} / ${b.icons}`);
    assert.ok(Math.abs(a.accents - b.accents) <= 2, `accent marks ${a.accents} / ${b.accents}`);
  }
  // The two tiles must really be different wallpapers (no shared illustrations).
  const idsOf = id => new Set([...read(wallpaper(id)).matchAll(/<g id="([^"]+)"/g)].map(m => m[1]));
  const ids = Object.values(THEMES).map(idsOf);
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) assert.deepEqual([...ids[i]].filter(x => ids[j].has(x)), [], 'no illustration is reused between themes');
});

const browserTest = browserAvailable ? test : test.skip;

browserTest('both wallpaper tiles repeat cleanly (nothing cut at the edges, evenly filled, clearly visible) and match in density', async () => {
  const stats = {};
  for (const id of Object.values(THEMES)) {
    stats[id] = await tileStats(`${id}-wallpaper.svg`);
    assert.equal(stats[id].edge, 0, `${id}: no stroke touches the tile edge, so tiles join without a visible seam`);
    assert.ok(stats[id].ink > 0.04 && stats[id].ink < 0.2, `${id}: ink coverage ${stats[id].ink}`);
    const mean = stats[id].quad.reduce((x, y) => x + y) / 4;
    for (const q of stats[id].quad) assert.ok(Math.abs(q - mean) / mean < 0.2, `${id}: quadrants are evenly filled ${stats[id].quad}`);
  }
  const [a, ...rest] = Object.values(stats);
  for (const b of rest) assert.ok(Math.abs(a.ink - b.ink) / a.ink < 0.25, `ink coverage differs too much between themes: ${a.ink} vs ${b.ink}`);
});

browserTest('Unit 1 keeps its wallpaper on every pathway and viewport without touching content, layout or scrolling', async () => {
  assert.deepEqual(await checkThemedUnit({ unit: 1, themeId: 'sports-free-time', wallpaperFile: 'sports-free-time-wallpaper.svg' }), []);
});

browserTest('Units 6 and 7 are unchanged: no theme, no wallpaper, the plain page background', async () => {
  assert.deepEqual(await checkPlainUnits([6, 7]), []);
});

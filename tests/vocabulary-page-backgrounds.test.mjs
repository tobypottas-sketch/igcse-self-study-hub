import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { UNIT_OVERVIEW_THEMES, UNIT_THEMES, unitOverviewAttr } from '../src/vocabulary/unit-themes.js';
import { browserAvailable, checkPageBackgrounds } from './helpers/unit-theme-harness.mjs';

// Vocabulary Builder page backgrounds (decorative only): student homepage (abstract academic) and the Unit 1 and Unit 2 overviews (Sports & Free Time and Digital Life illustrations).
const root = fileURLToPath(new URL('..', import.meta.url));
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const css = read('vocabulary-unit-themes.css').replace(/\/\*[\s\S]*?\*\//g, '');
const views = read('src/vocabulary/views.js');
const art = file => `assets/vocabulary/themes/${file}`;
const FILES = ['vocabulary-home-background.svg', 'sports-free-time-overview.svg', 'sports-free-time-overview-compact.svg', 'digital-life-overview.svg', 'digital-life-overview-compact.svg', 'food-and-drink-overview.svg', 'food-and-drink-overview-compact.svg', 'transport-overview.svg', 'transport-overview-compact.svg', 'holidays-overview.svg', 'holidays-overview-compact.svg', 'learning-study-skills-overview.svg', 'learning-study-skills-overview-compact.svg', 'interviews-overview.svg', 'interviews-overview-compact.svg'];

test('Units 1 to 6 have an overview illustration; every other overview stays plain', () => {
  assert.deepEqual({ ...UNIT_OVERVIEW_THEMES }, { 1: 'sports-free-time', 2: 'digital-life', 3: 'food-and-drink', 4: 'transport', 5: 'holidays', 6: 'learning-study-skills', 7: 'interviews' });
  assert.equal(unitOverviewAttr(4), ' data-unit-overview="transport"');
  assert.equal(unitOverviewAttr(5), ' data-unit-overview="holidays"');
  assert.equal(unitOverviewAttr(6), ' data-unit-overview="learning-study-skills"');
  assert.equal(unitOverviewAttr(7), ' data-unit-overview="interviews"');
  assert.equal(unitOverviewAttr(3), ' data-unit-overview="food-and-drink"');
  assert.equal(unitOverviewAttr(2), ' data-unit-overview="digital-life"');
  assert.equal(unitOverviewAttr(1), ' data-unit-overview="sports-free-time"');
  for (const unit of [8, 10, 0, null, undefined, 'x']) assert.equal(unitOverviewAttr(unit), '', `unit ${unit}`);
  assert.equal((views.match(/unitOverviewAttr\(/g) ?? []).length, 1, 'one use in views.js');
  assert.match(views, /<main class="vocab-shell"\$\{unitOverviewAttr\(unitNumber\)\}><header class="vocab-topbar vocab-topbar--unit">/);
  // The activity wallpapers keep their own attribute and mapping.
  assert.deepEqual({ ...UNIT_THEMES }, { 1: 'sports-free-time', 2: 'digital-life', 3: 'food-and-drink', 4: 'transport', 5: 'holidays', 6: 'learning-study-skills', 7: 'interviews' });
});

test('the page backgrounds extend the one theme stylesheet, are light, decorative-only and hidden for print / forced colours', () => {
  assert.match(css, /body:has\(\.vocab-shell--home\)\{--page-art:url\("assets\/vocabulary\/themes\/vocabulary-home-background\.svg"\)\}/);
  assert.match(css, /body:has\(\.vocab-shell\[data-unit-overview="sports-free-time"\]\)\{--page-art:url\("assets\/vocabulary\/themes\/sports-free-time-overview\.svg"\)\}/);
  assert.match(css, /max-width:900px\)\{\s*body:has\(\.vocab-shell\[data-unit-overview="sports-free-time"\]\)\{--page-art:url\("assets\/vocabulary\/themes\/sports-free-time-overview-compact\.svg"\)/);
  assert.match(css, /body:has\(\.vocab-shell\[data-unit-overview="digital-life"\]\)\{--page-art:url\("assets\/vocabulary\/themes\/digital-life-overview\.svg"\)\}/);
  assert.match(css, /body:has\(\.vocab-shell\[data-unit-overview="digital-life"\]\)\{--page-art:url\("assets\/vocabulary\/themes\/digital-life-overview-compact\.svg"\)\}/);
  assert.match(css, /body:has\(\.vocab-shell\[data-unit-overview="food-and-drink"\]\)\{--page-art:url\("assets\/vocabulary\/themes\/food-and-drink-overview\.svg"\)\}/);
  assert.match(css, /body:has\(\.vocab-shell\[data-unit-overview="food-and-drink"\]\)\{--page-art:url\("assets\/vocabulary\/themes\/food-and-drink-overview-compact\.svg"\)\}/);
  assert.match(css, /body:has\(\.vocab-shell\[data-unit-overview="transport"\]\)\{--page-art:url\("assets\/vocabulary\/themes\/transport-overview\.svg"\)\}/);
  assert.match(css, /body:has\(\.vocab-shell\[data-unit-overview="transport"\]\)\{--page-art:url\("assets\/vocabulary\/themes\/transport-overview-compact\.svg"\)\}/);
  assert.match(css, /body:has\(\.vocab-shell\[data-unit-overview="holidays"\]\)\{--page-art:url\("assets\/vocabulary\/themes\/holidays-overview\.svg"\)\}/);
  assert.match(css, /body:has\(\.vocab-shell\[data-unit-overview="holidays"\]\)\{--page-art:url\("assets\/vocabulary\/themes\/holidays-overview-compact\.svg"\)\}/);
  assert.match(css, /body:has\(\.vocab-shell\[data-unit-overview="learning-study-skills"\]\)\{--page-art:url\("assets\/vocabulary\/themes\/learning-study-skills-overview\.svg"\)\}/);
  assert.match(css, /body:has\(\.vocab-shell\[data-unit-overview="learning-study-skills"\]\)\{--page-art:url\("assets\/vocabulary\/themes\/learning-study-skills-overview-compact\.svg"\)\}/);
  assert.match(css, /body:has\(\.vocab-shell\[data-unit-overview="interviews"\]\)\{--page-art:url\("assets\/vocabulary\/themes\/interviews-overview\.svg"\)\}/);
  assert.match(css, /body:has\(\.vocab-shell\[data-unit-overview="interviews"\]\)\{--page-art:url\("assets\/vocabulary\/themes\/interviews-overview-compact\.svg"\)\}/);
  assert.match(css, /background-color:var\(--c-bg\)/);
  assert.match(css, /print,\(forced-colors:active\)\)?\{body:has\(\.vocab-shell--home\),body:has\(\.vocab-shell\[data-unit-overview\]\)\{background-image:none!important\}/);
  const block = css.slice(css.indexOf('--page-art:url("assets/vocabulary/themes/vocabulary-home'));
  for (const forbidden of [/animation|transition|@keyframes/, /content:/, /z-index|pointer-events|(?<![-\w])position:/, /#0|#1[0-9a-f]{5}|black|navy|charcoal|dark/i]) assert.doesNotMatch(block, forbidden, String(forbidden));
  assert.equal(fs.existsSync(path.join(root, 'assets/vocabulary/themes/sports-free-time-wallpaper.svg')), true);
});

test('the three new illustrations are original, lightweight, self-contained SVGs with no backgrounds, scripts, text or external references', () => {
  for (const file of FILES) {
    const svg = read(art(file));
    assert.ok(svg.length < 10000, `${file} is ${svg.length} bytes`);
    assert.doesNotMatch(svg, /<script|<image|xlink|<style|javascript:|<text|<foreignObject|href=|<animate|<set /i, file);
    assert.doesNotMatch(svg, /<rect[^>]*width="1600"|background/i, `${file} paints no full-page background of its own`);
    for (const colour of new Set([...svg.matchAll(/(?:stroke|fill)="(#[0-9a-f]{6})"/gi)].map(m => m[1]))) {
      const [r, g, b] = [1, 3, 5].map(i => parseInt(colour.slice(i, i + 2), 16));
      assert.ok(Math.min(r, g, b) > 0x40 && Math.max(r, g, b) > 0x70, `${file}: ${colour} is a light, muted teal / blue-grey / white (no dark colours)`);
    }
  }
});

test('homepage, overview and activity wallpapers are three distinct treatments', () => {
  const a = read(art(FILES[0])), b = read(art(FILES[1]));
  assert.notEqual(a, b);
  const ids = svg => new Set([...svg.matchAll(/<(?:g|clipPath)[^>]*id="([^"]+)"/g)].map(m => m[1]));
  assert.equal([...ids(b)].filter(i => ids(read(art('sports-free-time-wallpaper.svg'))).has(i)).length, 0, 'the overview does not reuse the dense activity wallpaper');
  assert.doesNotMatch(b, /<use /, 'the overview is a composed illustration, not a repeated tile');
});

test('the Digital Life and Food and Drink overviews match the approved Unit 1 overview standard and are their own compositions (not the activity wallpapers)', () => {
  const sports = read(art('sports-free-time-overview.svg'));
  const facts = svg => ({ viewBox: svg.match(/viewBox="([^"]+)"/)[1], opacity: svg.match(/<svg[^>]*\sopacity="([\d.]+)"/)?.[1], widths: [...new Set([...svg.matchAll(/stroke-width="([\d.]+)"/g)].map(m => Number(m[1])))].filter(w => w >= 3) });
  const palette = svg => new Set([...svg.matchAll(/(?:stroke|fill)="(#[0-9a-f]{6})"/gi)].map(m => m[1].toLowerCase()));
  const a = facts(sports);
  for (const id of ['digital-life', 'food-and-drink', 'transport', 'holidays', 'learning-study-skills', 'interviews']) {
    const overview = read(art(`${id}-overview.svg`)), wall = read(art(`${id}-wallpaper.svg`)), b = facts(overview);
    assert.equal(b.viewBox, a.viewBox, id); assert.equal(b.opacity, a.opacity, id);
    assert.ok(Math.max(...b.widths) <= Math.max(...a.widths) && Math.min(...b.widths) >= 2.2, `${id} stroke widths ${b.widths} vs ${a.widths}`);
    for (const colour of palette(overview)) assert.ok(palette(sports).has(colour), `${id}: ${colour} is in the Unit 1 palette`);
    assert.doesNotMatch(overview, /<use /, id); assert.notEqual(overview, wall, id);
  }
});

const browserTest = browserAvailable ? test : test.skip;
browserTest('homepage and Unit 1 overview show their art on desktop, tablet and phone without touching layout or content; other overviews are unchanged', async () => {
  const { failures, seen } = await checkPageBackgrounds();
  assert.deepEqual(failures, []);
  assert.equal(seen['1440/home'], 'vocabulary-home-background.svg');
  assert.equal(seen['1440/unit 1 overview'], 'sports-free-time-overview.svg');
  assert.equal(seen['390/unit 1 overview'], 'sports-free-time-overview-compact.svg');
  assert.equal(seen['1440/unit 2 overview'], 'digital-life-overview.svg');
  assert.equal(seen['390/unit 2 overview'], 'digital-life-overview-compact.svg');
  assert.equal(seen['1440/unit 3 overview'], 'food-and-drink-overview.svg');
  assert.equal(seen['390/unit 3 overview'], 'food-and-drink-overview-compact.svg');
  assert.equal(seen['1440/unit 4 overview'], 'transport-overview.svg');
  assert.equal(seen['390/unit 4 overview'], 'transport-overview-compact.svg');
  assert.equal(seen['1440/unit 5 overview'], 'holidays-overview.svg');
  assert.equal(seen['390/unit 5 overview'], 'holidays-overview-compact.svg');
  assert.equal(seen['1440/unit 6 overview'], 'learning-study-skills-overview.svg');
  assert.equal(seen['390/unit 6 overview'], 'learning-study-skills-overview-compact.svg');
  assert.equal(seen['1440/unit 7 overview'], 'interviews-overview.svg');
  assert.equal(seen['390/unit 7 overview'], 'interviews-overview-compact.svg');
});

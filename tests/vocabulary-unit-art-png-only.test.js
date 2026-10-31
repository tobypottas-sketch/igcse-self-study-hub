// A shipped Unit PNG must render even when the unit has no inline SVG fallback (Unit 6 has none: study-art-svg.js defines fallbacks for Units 1–5 only).
import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { allGraphicNames, withShippedGraphics } from '../src/vocabulary/graphics-registry.js';
import { renderVocabularyUnit, renderVocabularyHome } from '../src/vocabulary/views.js';
import { STUDY_ART_KEYS, unitArtSvg } from '../src/vocabulary/study-art-svg.js';

const html = render => { const target = { innerHTML:'' }; render(target); return target.innerHTML; };
const home = n => html(target => renderVocabularyHome(target, { displayName:'A', units:[{ unitNumber:n, unitTitle:'T', mastered:0, total:50 }] }));
const unit = n => html(target => renderVocabularyUnit(target, { unitNumber:n, unitTitle:'T', progress:null }));
const hash = text => crypto.createHash('sha256').update(text).digest('hex').slice(0, 16);

test('Unit 6 has a shipped PNG but no inline SVG fallback, and the renderer does not need one', () => {
  assert.equal(unitArtSvg(6), '');
  assert.ok(!STUDY_ART_KEYS.units.includes(6));
  withShippedGraphics(allGraphicNames(), () => {
    assert.match(home(6), /<span class="vocab-unit-card__art has-png" data-unit-art="6" data-art-slot aria-hidden="true"><img class="study-art__png" data-art-png src="assets\/vocabulary\/units\/unit-06\.png" width="1672" height="411" alt="" decoding="async" loading="lazy" draggable="false"><\/span>/);
    const page = unit(6);
    assert.match(page, /<figure class="vocab-unit-hero__art has-png" data-unit-hero-art="6" data-art-slot aria-hidden="true"><img class="study-art__png" data-art-png src="assets\/vocabulary\/units\/unit-06\.png" width="1672" height="411" alt="" decoding="async" loading="eager" draggable="false"><\/figure>/);
    assert.doesNotMatch(page, /<svg class="study-art__svg[^>]*vocab-unit-hero__art-image/);
  });
});

test('the Unit 6 hero gets the art classes when only a PNG exists', () => {
  withShippedGraphics(allGraphicNames(), () => assert.match(unit(6), /<section class="vocab-unit-hero has-study-art has-png-art">/));
  withShippedGraphics([], () => { const page = unit(6); assert.match(page, /<section class="vocab-unit-hero">/); assert.doesNotMatch(page, /data-unit-hero-art|has-png-art/); });
});

test('an unshipped unit with no SVG renders no artwork at all', () => {
  withShippedGraphics(['units/unit-06.png'], () => { // only Unit 6 is shipped here; Units 7+ are not
    for (const n of [7, 12, 20]) {
      assert.doesNotMatch(home(n), /data-unit-art|<img class="study-art__png"[^>]*units\//, `Unit ${n} home card`);
      const page = unit(n);
      assert.doesNotMatch(page, /data-unit-hero-art|has-png-art|<img class="study-art__png"/, `Unit ${n} hero`);
      assert.match(page, /<section class="vocab-unit-hero">/);
    }
  });
});

test('Units 1–5 render byte-for-byte as before (home card and unit page, with and without shipped PNGs)', () => {
  const expected = {
    shipped: ['93917eda2aba1262', '4e09ab6f75e2f73f', '0edc4689efd26774', '5197ad47e47e69cd', 'adbaa6e772f2a30f'],
    none: ['5ae72e6464f21a5f', '8325328c685347c8', '308cd5d95e2c1a60', 'b6e3bb89e669ed93', 'd3770a96c6677549']
  };
  for (const [label, names] of [['shipped', allGraphicNames()], ['none', []]]) {
    withShippedGraphics(names, () => {
      for (let n = 1; n <= 5; n++) assert.equal(hash(`${home(n)}\n${unit(n)}`), expected[label][n - 1], `Unit ${n} (${label})`);
    });
  }
});

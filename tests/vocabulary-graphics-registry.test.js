import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { SHIPPED_PNG } from '../src/vocabulary/graphics-manifest.js';
import { GRAPHICS_ROOT, PATHWAY_PNG, allGraphicNames, graphicPath, shippedGraphic, unitPngName, withShippedGraphics } from '../src/vocabulary/graphics-registry.js';
import { renderVocabularyUnit, renderVocabularyHome } from '../src/vocabulary/views.js';
import { STUDY_ART_KEYS } from '../src/vocabulary/study-art-svg.js';

const html = render => { const target = { innerHTML:'' }; render(target); return target.innerHTML; };
const unitPage = (states = { precision_use:{ currentStage:'recognise', completedStages:[], mastered:false, needsPractice:false, available:false, coverageCount:0, totalCount:50, unavailableReason:'required_rung_withheld' } }) => html(target => renderVocabularyUnit(target, { unitNumber:1, unitTitle:'Sports and Free Time', progress:{ mastered:0, total:50, needsAnotherLook:0, reviewDue:0, stages:{} }, pathwayStates:states, contentReady:true }));
const PATHWAY_IDS = ['meaning', 'context', 'word_families', 'paraphrasing', 'precision_use', 'spelling_recall'];

test('one canonical asset root and one naming rule: no scattered paths', () => {
  assert.equal(GRAPHICS_ROOT, 'assets/vocabulary');
  assert.deepEqual(Object.keys(PATHWAY_PNG), PATHWAY_IDS);
  assert.equal(graphicPath('unit', 1), 'assets/vocabulary/units/unit-01.png');
  assert.equal(graphicPath('unit', 12), 'assets/vocabulary/units/unit-12.png', 'future units need no code');
  assert.equal(graphicPath('pathway', 'meaning'), 'assets/vocabulary/pathways/meaning.png');
  assert.equal(graphicPath('pathway', 'context'), 'assets/vocabulary/pathways/context.png');
  assert.equal(graphicPath('pathway', 'word_families'), 'assets/vocabulary/pathways/word-families.png');
  assert.equal(graphicPath('pathway', 'paraphrasing'), 'assets/vocabulary/pathways/paraphrasing.png');
  assert.equal(graphicPath('pathway', 'precision_use'), 'assets/vocabulary/pathways/precision-use.png');
  assert.equal(graphicPath('pathway', 'spelling_recall'), 'assets/vocabulary/pathways/spelling-recall.png');
  assert.equal(graphicPath('pathway', 'nope'), null);
  assert.equal(graphicPath('unit', 0), null); assert.equal(graphicPath('unit', 'x'), null); assert.equal(graphicPath('banner', 1), null);
  assert.equal(unitPngName(7), 'units/unit-07.png');
  assert.equal(new Set(allGraphicNames()).size, allGraphicNames().length);
});

test('the correct asset is selected for every pathway and for Unit 1, with the right intrinsic shape', () => {
  withShippedGraphics(allGraphicNames(), () => {
    for (const id of PATHWAY_IDS) {
      const asset = shippedGraphic('pathway', id);
      assert.equal(asset.src, graphicPath('pathway', id));
      assert.deepEqual([asset.width, asset.height], [1024, 1024]);
    }
    const unit = shippedGraphic('unit', 1);
    assert.equal(unit.src, 'assets/vocabulary/units/unit-01.png');
    assert.deepEqual([unit.width, unit.height], [1672, 411]);
    assert.equal(shippedGraphic('pathway', 'unknown'), null);
  });
});

test('nothing is requested for an asset that has not been shipped (the SVG artwork is used)', () => {
  assert.deepEqual([...SHIPPED_PNG].filter(name => !allGraphicNames().includes(name)), [], 'the manifest only lists known names');
  withShippedGraphics([], () => {
    assert.equal(shippedGraphic('unit', 1), null);
    for (const id of PATHWAY_IDS) assert.equal(shippedGraphic('pathway', id), null);
    const home = html(target => renderVocabularyHome(target, { displayName:'A', units:[{ unitNumber:1, unitTitle:'Sports and Free Time', mastered:0, total:50 }] }));
    assert.doesNotMatch(home.replace(/<aside class="vocab-coursebook"[\s\S]*?<\/aside>/, ''), /<img|\.png/); // the coursebook cover is the only image allowed
    assert.match(home, /<svg /);
  });
});

test('manifest ⇄ files: every listed PNG exists and is a real PNG, and every PNG in assets/vocabulary is listed', () => {
  const dir = new URL('../assets/vocabulary/', import.meta.url);
  const listed = new Set(SHIPPED_PNG);
  for (const name of listed) {
    const file = new URL(name, dir);
    assert.ok(existsSync(file), `${name} is listed in graphics-manifest.js but missing from assets/vocabulary/`);
    const bytes = readFileSync(file);
    assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${name} is not a PNG file`);
    assert.ok(statSync(file).size < 1_500_000, `${name} is larger than 1.5 MB`);
  }
  const onDisk = [];
  if (existsSync(dir)) for (const group of ['units', 'pathways']) if (existsSync(new URL(`${group}/`, dir))) for (const file of readdirSync(new URL(`${group}/`, dir))) if (/\.png$/i.test(file)) onDisk.push(`${group}/${file}`);
  for (const name of onDisk) assert.ok(listed.has(name), `${name} exists but is not listed in graphics-manifest.js`);
});

test('shipped graphics render as a PNG layer over the existing SVG, keeping the slot, the SVG and the evidence markup', () => {
  withShippedGraphics(allGraphicNames(), () => {
    const home = html(target => renderVocabularyHome(target, { displayName:'A', units:[{ unitNumber:1, unitTitle:'Sports and Free Time', mastered:0, total:50 }] }));
    assert.match(home, /class="vocab-unit-card__art has-png" data-unit-art="1" data-art-slot aria-hidden="true"><svg [^>]*>.*<\/svg><img class="study-art__png" data-art-png src="assets\/vocabulary\/units\/unit-01\.png" width="1672" height="411" alt="" /s);
    const hero = unitPage();
    assert.match(hero, /<figure class="vocab-unit-hero__art has-png" data-unit-hero-art="1" data-art-slot aria-hidden="true"><svg /);
    assert.match(hero, /src="assets\/vocabulary\/units\/unit-01\.png" width="1672" height="411" alt="" decoding="async" loading="eager"/);
  });
});

test('every pathway card gets its own PNG, the disabled card renders too, and nothing else in the markup changes', () => {
  const without = withShippedGraphics([], () => unitPage());
  const withPng = withShippedGraphics(allGraphicNames(), () => unitPage());
  for (const id of PATHWAY_IDS) assert.ok(withPng.includes(`src="${graphicPath('pathway', id)}"`), `${id} uses its own PNG`);
  const disabled = withPng.match(/<button[^>]*data-pathway="precision_use"[^>]*>.*?<\/button>/s)?.[0] ?? '';
  assert.ok(disabled.includes('disabled') && disabled.includes('precision-use.png'), 'the withheld pathway still shows its illustration, disabled');
  // removing the PNG layers from the "with" markup gives back exactly the "without" markup: stage ladder, evidence, CTA, badges, chips are untouched
  const stripped = withPng.replace(/<img class="study-art__png"[^>]*>/g, '').replace(/ has-png-art/g, '').replace(/ has-png(?![-\w])/g, '').replace(/ data-art-slot/g, '');
  assert.equal(stripped, without);
});

test('the SVG fallback artwork is still present for every unit and pathway (the placeholder and the fallback)', () => {
  assert.deepEqual(STUDY_ART_KEYS.pathways, PATHWAY_IDS);
  assert.ok(STUDY_ART_KEYS.units.includes(1));
});

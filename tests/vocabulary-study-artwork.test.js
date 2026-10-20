import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderSessionSummary } from '../src/vocabulary/views.js';
import { achievementArtSvg, pathwayArtSvg, unitArtSvg, STUDY_ART_KEYS, studyArtAlt } from '../src/vocabulary/study-art-svg.js';

function root(){ return { innerHTML:'' }; }

test('first five units have dedicated inline artwork', () => {
  assert.deepEqual(STUDY_ART_KEYS.units, [1,2,3,4,5]);
  const seen = new Set();
  for (const unit of STUDY_ART_KEYS.units) {
    const svg = unitArtSvg(unit);
    assert.match(svg, /^<svg /);
    assert.ok(studyArtAlt('unit', unit).length > 0);
    seen.add(svg);
  }
  assert.equal(seen.size, 5, 'each unit has its own scene');
  assert.equal(unitArtSvg(99), '');
});

test('achievement artwork is distinct and unknown kinds render nothing', () => {
  assert.deepEqual(STUDY_ART_KEYS.achievements, ['completion','stage_advanced','mastered']);
  assert.equal(new Set(STUDY_ART_KEYS.achievements.map(kind => achievementArtSvg(kind))).size, 3);
  assert.equal(achievementArtSvg('unknown'), '');
});

test('all six pathways have artwork in the same visual language', () => {
  assert.deepEqual(STUDY_ART_KEYS.pathways, ['meaning','context','word_families','paraphrasing','precision_use','spelling_recall']);
  for (const id of STUDY_ART_KEYS.pathways) {
    const svg = pathwayArtSvg(id);
    assert.match(svg, /viewBox="0 0 160 112"/, `${id}: shared canvas`);
    assert.match(svg, /class="sa-i/, `${id}: shared outline style`);
    assert.match(svg, /--sa-a:#/, `${id}: one accent hue`);
  }
  assert.equal(pathwayArtSvg('unknown'), '');
});

test('artwork is inline, decorative and lightweight (no image fetches, no remote hosts)', () => {
  const all = [...STUDY_ART_KEYS.units.map(unitArtSvg), ...STUDY_ART_KEYS.pathways.map(pathwayArtSvg), ...STUDY_ART_KEYS.achievements.map(achievementArtSvg)];
  assert.equal(all.length, 14);
  for (const svg of all) {
    assert.match(svg, /aria-hidden="true"/);
    assert.match(svg, /focusable="false"/);
    assert.doesNotMatch(svg, /<image|href=|url\(|https?:/i, 'no external or referenced resources');
    assert.ok(svg.length < 1500, `art should stay tiny (${svg.length} bytes)`);
  }
});

test('the SVG never sizes itself: it fills whatever slot the container gives it', () => {
  const svg = unitArtSvg(1);
  assert.match(svg, /width="100%" height="100%"/);
  assert.match(svg, /preserveAspectRatio="xMidYMid meet"/);
});

test('artwork is rendered by the views, not injected after paint', () => {
  const runtime = readFileSync(new URL('../src/vocabulary/study-art-runtime.js', import.meta.url),'utf8');
  assert.doesNotMatch(runtime, /createElement\('img'\)|\.src\s*=|new Image|document\.createElement\('figure'\)/);
  assert.doesNotMatch(runtime, /study-art\.js|unitArtwork|pathwayArtwork|achievementArtwork/);
  assert.match(runtime, /MutationObserver/, 'the evidence readout is still hydrated by the runtime');
});

test('vocabulary page loads artwork CSS and runtime after the core study app layer', () => {
  const html = readFileSync(new URL('../vocabulary.html', import.meta.url),'utf8');
  assert.match(html,/vocabulary-study-art\.css/);
  assert.ok(html.indexOf('vocabulary-study-art.css') > html.indexOf('vocabulary-study-app.css'));
  assert.match(html,/src\/vocabulary\/study-art-runtime\.js/);
});

test('ten-question completion renders its artwork slot in the first HTML', () => {
  const target = root();
  renderSessionSummary(target,{pathwayId:'meaning',summary:{practised:10,strengthened:8,advanced:2,mastered:1,needsAnotherLook:2}});
  assert.match(target.innerHTML,/data-study-completion/);
  assert.match(target.innerHTML,/Great work!/);
  assert.match(target.innerHTML,/data-study-completion-art="completion"/);
  assert.match(target.innerHTML,/<svg class="study-art__svg vocab-completion-art__image"/);
});

test('study artwork CSS contains dedicated composition and animation hooks', () => {
  const css = readFileSync(new URL('../vocabulary-study-art.css', import.meta.url),'utf8');
  for (const selector of ['.vocab-unit-card__art','.vocab-unit-hero__art','.vocab-completion-art','.vocab-completion-rays','.study-milestone-art','.study-art__svg']) {
    assert.match(css,new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  }
  assert.match(css,/@keyframes\s+study-trophy-pop/);
  assert.match(css,/@keyframes\s+study-rays-in/);
  assert.match(css,/@keyframes\s+study-stage-sweep/);
  assert.match(css,/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});

test('pathway artwork is integrated into cards instead of reserving a fixed right-hand strip', () => {
  const css = readFileSync(new URL('../vocabulary-study-art.css', import.meta.url),'utf8');
  assert.doesNotMatch(css,/\.vocab-pathway-card\.has-study-art\{[^}]*padding-right:\s*132px/i);
  assert.doesNotMatch(css,/\.vocab-pathway-card__art\{[^}]*top:\s*12px;[^}]*bottom:\s*12px;[^}]*width:\s*108px/i);
  assert.match(css,/\.vocab-pathway-card__art\{[^}]*bottom:\s*-?\d+px/i);
});

test('every artwork slot owns explicit dimensions so the SVG can never size the layout', () => {
  const css = readFileSync(new URL('../vocabulary-study-art.css', import.meta.url),'utf8');
  assert.match(css, /\.study-milestone-art\{[^}]*width:\s*82px;[^}]*height:\s*72px/);
  assert.match(css, /\.study-art__svg\{[^}]*width:100%;[^}]*height:100%/);
  assert.doesNotMatch(css, /__image\{[^}]*\bwidth:\s*\d+px/, 'images fill their slot; they carry no pixel size of their own');
  assert.doesNotMatch(css, /@keyframes[^{]*\{[^}]*(?:width|height|margin|padding|top|left)\s*:/, 'no layout-affecting animation');
});

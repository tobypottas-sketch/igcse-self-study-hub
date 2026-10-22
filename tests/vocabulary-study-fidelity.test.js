import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderVocabularyUnit } from '../src/vocabulary/views.js';
import { pathwayArtSvg, STUDY_ART_KEYS } from '../src/vocabulary/study-art-svg.js';

test('all six pathways have dedicated mature study artwork', () => {
  for (const pathway of STUDY_ART_KEYS.pathways) assert.match(pathwayArtSvg(pathway), /^<svg /);
  assert.equal(pathwayArtSvg('unknown'),'');
});

test('pathway cards render their artwork slot and evidence shell in the first HTML without replacing controls', () => {
  const target = { innerHTML:'' };
  renderVocabularyUnit(target,{ unitNumber:1, unitTitle:'Sports and Free Time', contentReady:true });
  assert.equal((target.innerHTML.match(/class="vocab-pathway-card has-study-art/g) ?? []).length, 6);
  for (const pathway of STUDY_ART_KEYS.pathways) assert.match(target.innerHTML, new RegExp(`data-pathway-art="${pathway}"`));
  assert.equal((target.innerHTML.match(/data-action="open-pathway"/g) ?? []).length, 6, 'cards remain the single control');
  assert.equal((target.innerHTML.match(/vocab-pathway-card__evidence"/g) ?? []).length, 6);
  // The only images are the decorative PNG layers of the graphics system (src from graphics-manifest.js); nothing else.
  assert.doesNotMatch(target.innerHTML.replace(/<img class="study-art__png" data-art-png [^>]*alt=""[^>]*>/g, ''), /<img/);
});

test('final artwork CSS gives pathway illustrations a real composition layer', () => {
  const css = readFileSync(new URL('../vocabulary-study-art.css', import.meta.url),'utf8');
  assert.match(css,/\.vocab-pathway-card__art/);
  assert.match(css,/\.vocab-pathway-card__art-image/);
  assert.match(css,/\.vocab-pathway-card:not\(:disabled\):hover \.vocab-pathway-card__art/);
  assert.match(css,/@media\s*\(max-width:620px\)/);
  assert.match(css,/@media\s*\(prefers-reduced-motion:reduce\)/);
});

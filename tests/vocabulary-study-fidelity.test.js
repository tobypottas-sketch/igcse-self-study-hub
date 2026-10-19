import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { pathwayArtwork } from '../src/vocabulary/study-art.js';

const expectedPathwayArt = {
  meaning:'pathway-meaning.svg',
  context:'pathway-context.svg',
  word_families:'pathway-word-families.svg',
  paraphrasing:'pathway-paraphrasing.svg',
  precision_use:'pathway-precision.svg',
  spelling_recall:'pathway-spelling.svg'
};

test('all six pathways have dedicated mature study artwork', () => {
  for (const [pathway,file] of Object.entries(expectedPathwayArt)) {
    const art = pathwayArtwork(pathway);
    assert.equal(art.src,`assets/vocabulary-study/${file}`);
    assert.ok(art.alt.length > 0);
    assert.ok(existsSync(new URL(`../${art.src}`, import.meta.url)), `${file} should exist`);
  }
  assert.equal(pathwayArtwork('unknown'),null);
});

test('artwork runtime decorates pathway cards without replacing existing controls', () => {
  const runtime = readFileSync(new URL('../src/vocabulary/study-art-runtime.js', import.meta.url),'utf8');
  assert.match(runtime,/decoratePathwayCards/);
  assert.match(runtime,/\.vocab-pathway-card\[data-pathway\]/);
  assert.match(runtime,/dataset\.pathwayArt/);
  assert.match(runtime,/vocab-pathway-card__art/);
});

test('final artwork CSS gives pathway illustrations a real composition layer', () => {
  const css = readFileSync(new URL('../vocabulary-study-art.css', import.meta.url),'utf8');
  assert.match(css,/\.vocab-pathway-card__art/);
  assert.match(css,/\.vocab-pathway-card__art-image/);
  assert.match(css,/\.vocab-pathway-card:hover \.vocab-pathway-card__art/);
  assert.match(css,/@media\s*\(max-width:620px\)/);
  assert.match(css,/@media\s*\(prefers-reduced-motion:reduce\)/);
});

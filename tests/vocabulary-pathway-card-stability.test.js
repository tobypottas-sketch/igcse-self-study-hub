import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const views = fs.readFileSync(new URL('../src/vocabulary/views.js', import.meta.url), 'utf8');
const runtime = fs.readFileSync(new URL('../src/vocabulary/study-art-runtime.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../vocabulary-layout-stability.css', import.meta.url), 'utf8');

test('pathway cards render their evidence shell before async decorators run', () => {
  assert.match(views, /vocab-pathway-card__top/);
  assert.match(views, /vocab-pathway-card__evidence/);
  assert.match(views, /vocab-pathway-card__evidence-meter/);
  assert.match(views, /stageEvidence/);
  assert.doesNotMatch(runtime, /card\.append\(wrap\)|ladder\?\.before\(wrap\)/,
    'the artwork runtime must not inject evidence after first paint');
});

test('pathway card layout uses explicit vertical regions instead of an auto-flowing crowded grid', () => {
  assert.match(css, /\.vocab-pathway-card\s*\{[^}]*grid-template-columns:\s*minmax\(0,1fr\)/s);
  assert.match(css, /\.vocab-pathway-card__top\s*\{[^}]*display:flex/s);
  assert.match(css, /\.vocab-pathway-card__coverage\s*\{[^}]*justify-self:start/s);
  assert.match(css, /\.vocab-pathway-card__evidence\s*\{[^}]*width:100%/s);
});

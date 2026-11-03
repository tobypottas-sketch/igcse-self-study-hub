import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../vocabulary.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../vocabulary-class-illustrations.css', import.meta.url), 'utf8').catch(() => '');

test('vocabulary page loads the isolated class illustration stylesheet', () => {
  assert.match(html, /<link rel="stylesheet" href="vocabulary-class-illustrations\.css">/);
});

test('class card artwork is chooser-scoped, decorative, and has three academic variants', () => {
  assert.match(css, /\.vocab-class-chooser \.vocab-class-card::after/);
  assert.match(css, /pointer-events:none/);
  assert.match(css, /\.vocab-class-chooser__grid > \.vocab-class-card:nth-child\(3n\+1\)::after/);
  assert.match(css, /\.vocab-class-chooser__grid > \.vocab-class-card:nth-child\(3n\+2\)::after/);
  assert.match(css, /\.vocab-class-chooser__grid > \.vocab-class-card:nth-child\(3n\+3\)::after/);
  assert.match(css, /data:image\/svg\+xml/);
});

test('illustrations protect content readability and adapt on narrow screens', () => {
  assert.match(css, /\.vocab-class-chooser \.vocab-class-card > \*\{position:relative;z-index:1\}/);
  assert.match(css, /@media\(max-width:620px\)/);
  assert.match(css, /background-size:/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../vocabulary-word-list-nav.css', import.meta.url), 'utf8');

test('desktop A-Z navigation is a persistent vertical rail', () => {
  assert.match(css, /@media\(min-width:761px\)/);
  assert.match(css, /\.vocab-az-nav\{[^}]*position:fixed/i);
  assert.match(css, /\.vocab-az-nav\{[^}]*grid-template-columns:1fr/i);
  assert.match(css, /\.vocab-az-nav\{[^}]*grid-template-rows:repeat\(26,/i);
});

test('mobile A-Z navigation stays horizontal and scrollable', () => {
  assert.match(css, /@media\(max-width:760px\)/);
  assert.match(css, /grid-template-columns:repeat\(26,minmax\(36px,1fr\)\)/);
  assert.match(css, /overflow-x:auto/);
});

test('back to top control remains available', () => {
  assert.match(css, /\.vocab-back-to-top\{[^}]*position:fixed/i);
});

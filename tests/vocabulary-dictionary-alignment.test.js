import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('dictionary headword and part-of-speech pill are vertically centred on the same row', () => {
  const css = fs.readFileSync(new URL('../vocabulary-extra.css', import.meta.url), 'utf8');
  assert.match(css, /\.vocab-dictionary-entry__heading\{[^}]*align-items:center!important/);
});

test('dictionary context label and sentence share a true typographic baseline', () => {
  const css = fs.readFileSync(new URL('../vocabulary-extra.css', import.meta.url), 'utf8');
  assert.match(css, /\.vocab-dictionary-entry__context\{[^}]*align-items:baseline/);
  assert.match(css, /\.vocab-dictionary-entry__context span\{[^}]*line-height:1\.4/);
  assert.match(css, /\.vocab-dictionary-entry__context p\{[^}]*line-height:1\.4/);
  assert.doesNotMatch(css, /\.vocab-dictionary-entry__context span\{[^}]*min-height:/);
  assert.doesNotMatch(css, /\.vocab-dictionary-entry__context p\{[^}]*min-height:/);
});

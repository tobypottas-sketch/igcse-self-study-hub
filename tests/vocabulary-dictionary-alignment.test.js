import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('dictionary headword and part-of-speech pill are vertically centred on the same row', () => {
  const css = fs.readFileSync(new URL('../vocabulary-extra.css', import.meta.url), 'utf8');
  assert.match(css, /\.vocab-dictionary-entry__heading\{[^}]*align-items:center!important/);
});

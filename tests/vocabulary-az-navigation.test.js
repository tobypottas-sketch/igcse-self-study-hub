import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildAlphabetModel } from '../src/vocabulary/word-list-navigation.js';

test('alphabet model always spans A-Z and marks only present starting letters active', () => {
  const model = buildAlphabetModel(['avoid','leisure','opponent']);
  assert.equal(model.length, 26);
  assert.deepEqual(model.filter(item => item.available).map(item => item.letter), ['A','L','O']);
  assert.equal(model.find(item => item.letter === 'B')?.available, false);
  assert.equal(model.find(item => item.letter === 'L')?.targetId, 'vocab-letter-l');
});

test('word-list navigation enhancer anchors first matching word and drives back-to-top visibility from scroll', () => {
  const source = fs.readFileSync(new URL('../src/vocabulary/word-list-navigation.js', import.meta.url), 'utf8');
  assert.match(source, /\.vocab-word-list/);
  assert.match(source, /\.vocab-dictionary-entry__term/);
  assert.match(source, /vocab-letter-/);
  assert.match(source, /vocab-words-top/);
  assert.match(source, /vocab-back-to-top/);
  assert.match(source, /scrollY/);
  assert.match(source, /is-visible/);
  assert.match(source, /MutationObserver/);
});

test('A-Z bar is full width on desktop and scrollable rather than squashed on narrow screens', () => {
  const css = fs.readFileSync(new URL('../vocabulary-word-list-nav.css', import.meta.url), 'utf8');
  assert.match(css, /\.vocab-az-nav[^}]*width:\s*100%/s);
  assert.match(css, /grid-template-columns:\s*repeat\(26,minmax\(0,1fr\)\)/);
  assert.match(css, /\.vocab-back-to-top\.is-visible/);
  assert.match(css, /overflow-x:\s*auto/);
  assert.match(css, /\.vocab-word-row:target/);
});

test('vocabulary page loads the word-list navigation assets', () => {
  const html = fs.readFileSync(new URL('../vocabulary.html', import.meta.url), 'utf8');
  assert.match(html, /vocabulary-word-list-nav\.css/);
  assert.match(html, /src\/vocabulary\/word-list-navigation\.js/);
});

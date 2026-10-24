import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderVocabularyWords } from '../src/vocabulary/views.js';
const read = name => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
test('dictionary page opens at the top: scrolls to 0 instantly after rendering', () => {
  const app = read('src/vocabulary/app.js');
  assert.match(app, /renderVocabularyWords\([^;]*\);\s*decoratePreview\(\);[\s\S]{0,260}window\.scrollTo\(\{ top:0, left:0, behavior:'instant' \}\)/);
});
test('dictionary hero and word cards share one column (no list-only gutter)', () => {
  const root = { innerHTML:'' };
  renderVocabularyWords(root, { unitNumber:1, unitTitle:'Sports and Free Time', words:[] });
  assert.match(root.innerHTML, /<main class="vocab-shell vocab-shell--words">/);
  const css = read('vocabulary-support.css');
  assert.match(css, /\.vocab-shell--words \.vocab-word-list\{padding-right:0\}/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { renderVocabularyHome } from '../src/vocabulary/views.js';
test('home shows the coursebook reference with exact details and selectable ISBN text', () => {
  const root = { innerHTML:'' };
  renderVocabularyHome(root, { units:[] });
  const html = root.innerHTML;
  assert.match(html, /alt="Cambridge IGCSE English as a Second Language Sixth Edition coursebook cover"/);
  assert.match(html, /Sixth edition<\/span><span class="vocab-coursebook__sep"> · <\/span><span class="vocab-coursebook__nb">Peter Lucantoni/);
  assert.match(html, /ISBN <span>9781009031943<\/span>/);
  assert.match(html, /width="398" height="502"/);
  assert.equal(html.match(/vocab-coursebook__cover/g).length, 1);
  assert.doesNotMatch(html.match(/<aside[\s\S]*<\/aside>/)[0], /buy now|\$|£|<a /i);
  assert.ok(existsSync(new URL('../assets/coursebook/lucantoni-igcse-esl-6e-cover.webp', import.meta.url)));
});

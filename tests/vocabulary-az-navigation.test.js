import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderVocabularyWords } from '../src/vocabulary/views.js';

// RED contract for the approved full-width A-Z navigation and floating return control.
function root() { return { innerHTML:'' }; }
const pathways = Object.fromEntries(['meaning','context','word_families','paraphrasing','precision_use','spelling_recall'].map(id => [id,{ currentStage:'recognise' }]));

const words = [
  { term:'avoid', learningStage:'emerging', pathways, strands:{} },
  { term:'leisure', learningStage:'emerging', pathways, strands:{} },
  { term:'opponent', learningStage:'emerging', pathways, strands:{} }
];

test('all-words view renders a full A-Z navigator with active and muted letters', () => {
  const target = root();
  renderVocabularyWords(target, { unitNumber:1, unitTitle:'Sports and Free Time', words });
  assert.match(target.innerHTML, /class="vocab-az-nav"/);
  assert.match(target.innerHTML, /aria-label="A to Z vocabulary navigation"/);
  assert.match(target.innerHTML, /href="#vocab-letter-a"[^>]*>A<\/a>/);
  assert.match(target.innerHTML, /href="#vocab-letter-l"[^>]*>L<\/a>/);
  assert.match(target.innerHTML, /href="#vocab-letter-o"[^>]*>O<\/a>/);
  assert.match(target.innerHTML, /data-letter-disabled="true"[^>]*>B<\/span>/);
  assert.equal((target.innerHTML.match(/data-az-letter=/g) ?? []).length, 26);
});

test('first word for each available letter is an anchor destination and top anchor exists', () => {
  const target = root();
  renderVocabularyWords(target, { unitNumber:1, unitTitle:'Sports and Free Time', words });
  assert.match(target.innerHTML, /id="vocab-words-top"/);
  assert.match(target.innerHTML, /id="vocab-letter-a"/);
  assert.match(target.innerHTML, /id="vocab-letter-l"/);
  assert.match(target.innerHTML, /id="vocab-letter-o"/);
});

test('all-words view includes a floating back-to-top control', () => {
  const target = root();
  renderVocabularyWords(target, { unitNumber:1, unitTitle:'Sports and Free Time', words });
  assert.match(target.innerHTML, /class="vocab-back-to-top"/);
  assert.match(target.innerHTML, /href="#vocab-words-top"/);
  assert.match(target.innerHTML, /Back to top/);
});

test('A-Z layout spans the full width and back-to-top visibility is scroll-driven', () => {
  const css = fs.readFileSync(new URL('../vocabulary-extra.css', import.meta.url), 'utf8');
  const app = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');
  assert.match(css, /\.vocab-az-nav[^}]*width:\s*100%/s);
  assert.match(css, /grid-template-columns:\s*repeat\(26,minmax\(0,1fr\)\)/);
  assert.match(css, /\.vocab-back-to-top\.is-visible/);
  assert.match(app, /setupWordsNavigation/);
  assert.match(app, /window\.scrollY/);
  assert.match(app, /is-visible/);
});

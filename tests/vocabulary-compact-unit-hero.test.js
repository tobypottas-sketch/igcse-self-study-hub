import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderVocabularyUnit, renderVocabularyWords } from '../src/vocabulary/views.js';

const renderUnit = unitNumber => {
  const root = { innerHTML: '' };
  renderVocabularyUnit(root, {
    unitNumber, unitTitle: 'A unit title',
    progress: { mastered: 3, total: 50, needsAnotherLook: 2, reviewDue: 1, stages: {} },
    pathwayStates: {}
  });
  return root.innerHTML;
};

test('all unit landing heroes show Cambridge beside the unit badge, before the heading', () => {
  for (const unitNumber of [1, 2, 3, 4, 5, 6]) {
    const html = renderUnit(unitNumber);
    const hero = html.match(/<section class="vocab-unit-hero[^"]*">([\s\S]*?)<\/section>/)?.[1];
    assert.ok(hero, 'unit hero is present');
    assert.match(hero, new RegExp('<div class="vocab-unit-hero__identity"><p class="vocab-kicker">Unit ' + unitNumber + '<\\/p><span class="vocab-unit-hero__course">Cambridge IGCSE ESL 0511<\\/span><\\/div><h1>'));
    assert.match(hero, /3 \/ 50 overall mastered/);
    assert.match(hero, /vocab-unit-hero__art/);
  }
});

test('unit hero layout rules are scoped, responsive and stylesheet cache is refreshed', async () => {
  const [css, html] = await Promise.all([
    readFile(new URL('../vocabulary-unit-header.css', import.meta.url), 'utf8'),
    readFile(new URL('../vocabulary.html', import.meta.url), 'utf8')
  ]);
  assert.match(css, /\.vocab-unit-hero__identity\s*\{[^}]*display:flex/);
  assert.match(css, /\.vocab-unit-hero__course\s*\{/);
  assert.match(css, /\.vocab-unit-hero:not\(\.vocab-unit-hero--detail\)/);
  assert.match(css, /@media\s*\(max-width:620px\)/);
  assert.match(html, /vocabulary-unit-header\.css\?v=compact-hero-v1/);
});

test('word list detail hero and its progress explanation are unchanged', () => {
  const root = { innerHTML: '' };
  renderVocabularyWords(root, { unitNumber: 3, unitTitle: 'Food', words: [] });
  assert.match(root.innerHTML, /vocab-unit-hero--detail"><p class="vocab-kicker">Unit 3<\/p><h1>All 50 words/);
  assert.match(root.innerHTML, /How progress works/);
});

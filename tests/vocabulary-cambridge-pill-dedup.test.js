import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderVocabularyUnit } from '../src/vocabulary/views.js';

test('each unit hero has exactly one Cambridge course badge and no generated duplicate', async () => {
  const css = await readFile(new URL('../vocabulary-branding.css', import.meta.url), 'utf8');
  const heroBefore = /\.vocab-unit-hero\s*::before/;
  assert.doesNotMatch(css, heroBefore, 'unit hero must not inject a second badge through CSS');
  assert.match(css, /\.vocab-shell--session \.vocab-topbar\s*>\s*span::before/, 'session course identity remains unchanged');
  for (const unitNumber of [1, 2, 3, 4, 5, 6]) {
    const root = { innerHTML:'' };
    renderVocabularyUnit(root, { unitNumber, unitTitle: 'Sample', pathwayStates:{}, progress:{mastered:0,total:50,needsAnotherLook:0,reviewDue:0,stages:{}} });
    const section = root.innerHTML.match(/<section class="vocab-unit-hero[^"]*">([\s\S]*?)<\/section>/)?.[1];
    assert.ok(section);
    assert.equal((section.match(/Cambridge IGCSE ESL 0511/g) ?? []).length, 1);
    assert.match(section, new RegExp('Unit ' + unitNumber + '<\\/p><span class="vocab-unit-hero__course">Cambridge IGCSE ESL 0511'));
  }
});

test('branding stylesheet refreshes so the deleted pseudo-label does not remain cached', async () => {
  const html = await readFile(new URL('../vocabulary.html', import.meta.url), 'utf8');
  assert.match(html, /vocabulary-branding\.css\?v=course-pill-dedup-v1/);
});

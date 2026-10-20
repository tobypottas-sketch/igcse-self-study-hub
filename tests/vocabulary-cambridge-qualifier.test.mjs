import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderVocabularyQuestion } from '../src/vocabulary/views.js';

test('training questions keep the session label and add a quiet Cambridge qualifier via presentation styling', async () => {
  const root = { innerHTML: '' };

  renderVocabularyQuestion(root, {
    unitNumber: 1,
    unitTitle: 'Sports and Free Time',
    sessionLabel: 'Meaning',
    pathwayId: 'meaning',
    pathwayStage: 'recognise',
    sessionPosition: 1,
    sessionTotal: 10,
    question: {
      type: 'definition_to_word',
      prompt: 'Choose the word that matches the definition.',
      options: ['avoid', 'prefer', 'permit', 'deny']
    }
  });

  assert.match(root.innerHTML, /vocab-shell--session/);
  assert.match(root.innerHTML, />Meaning</);

  const html = await readFile(new URL('../vocabulary.html', import.meta.url), 'utf8');
  const brandingCss = await readFile(new URL('../vocabulary-branding.css', import.meta.url), 'utf8');

  assert.match(html, /vocabulary-branding\.css/);
  assert.match(brandingCss, /\.vocab-shell--session\s+\.vocab-topbar\s*>\s*span::before/);
  assert.match(brandingCss, /content:\s*["']Cambridge IGCSE ESL 0511["']/);
  assert.doesNotMatch(brandingCss, /logo|crest|background-image/i);
});

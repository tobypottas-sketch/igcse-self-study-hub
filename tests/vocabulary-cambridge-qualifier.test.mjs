import test from 'node:test';
import assert from 'node:assert/strict';
import { renderVocabularyQuestion } from '../src/vocabulary/views.js';

test('training questions show a quiet Cambridge IGCSE ESL 0511 qualifier in the top bar', () => {
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

  assert.match(root.innerHTML, /vocab-topbar__qualifier/);
  assert.match(root.innerHTML, /Cambridge IGCSE ESL 0511/);
  assert.match(root.innerHTML, />Meaning</);
  assert.doesNotMatch(root.innerHTML, /cambridge[^>]*(logo|crest)|<(img|svg)[^>]*cambridge/i);
});

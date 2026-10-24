import test from 'node:test';
import assert from 'node:assert/strict';
import { renderVocabularyWords } from '../src/vocabulary/views.js';

function root() { return { innerHTML:'' }; }

const words = [
  { term:'significant', status:'mastered', strands:{ meaning:'Secure', recognition:'Secure', context:'Secure', paraphrasing:'Secure', production:'Secure' } },
  { term:'proficiency', status:'building', strands:{ meaning:'Secure', recognition:'Secure', context:'Developing', paraphrasing:'Developing', production:'Keep practising' } }
];

test('view-all words shows qualitative state and six pathways without the evidence disclosure', () => {
  const target = root();
  renderVocabularyWords(target, { unitNumber:7, unitTitle:'Interviews', words });
  assert.match(target.innerHTML, /All 50 words/i);
  assert.match(target.innerHTML, /significant/);
  assert.match(target.innerHTML, /Mastered/);
  assert.match(target.innerHTML, /proficiency/);
  assert.match(target.innerHTML, /Building/);
  assert.equal((target.innerHTML.match(/data-word-pathway=/g) ?? []).length, 12);
  assert.doesNotMatch(target.innerHTML, /<details|<summary|vocab-word-evidence|Overall evidence detail|View evidence/);
  assert.doesNotMatch(target.innerHTML, /Production|Keep practising/);
  assert.equal(words[1].strands.production, 'Keep practising');
  assert.doesNotMatch(target.innerHTML, /%/);
  assert.doesNotMatch(target.innerHTML, /Weak|Failed/);
});

test('word list has a route back to the unit screen', () => {
  const target = root();
  renderVocabularyWords(target, { unitNumber:7, unitTitle:'Interviews', words });
  assert.match(target.innerHTML, /data-action="back-unit"/);
});

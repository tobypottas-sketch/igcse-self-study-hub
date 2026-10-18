import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderVocabularyWords } from '../src/vocabulary/views.js';

// Presentation-only contract: dictionary metadata must not replace pathway progress.
function root() { return { innerHTML:'' }; }

const pathways = {
  meaning:{ currentStage:'recognise' }, context:{ currentStage:'recognise' }, word_families:{ currentStage:'recognise' },
  paraphrasing:{ currentStage:'recognise' }, precision_use:{ currentStage:'recognise' }, spelling_recall:{ currentStage:'recognise' }
};

test('all-words list renders each vocabulary item as a compact dictionary entry', () => {
  const target = root();
  renderVocabularyWords(target, {
    unitNumber:1,
    unitTitle:'Sports and Free Time',
    words:[{
      term:'leisure',
      partOfSpeech:'noun',
      definition:'free time when you are not working or studying',
      contextSentence:'Many students use their leisure to play sport or meet friends.',
      learningStage:'emerging',
      pathways,
      strands:{}
    }]
  });

  assert.match(target.innerHTML, /class="vocab-dictionary-entry"/);
  assert.match(target.innerHTML, /class="vocab-dictionary-entry__term">leisure</);
  assert.match(target.innerHTML, /class="vocab-dictionary-entry__pos">noun</);
  assert.match(target.innerHTML, /free time when you are not working or studying/);
  assert.match(target.innerHTML, /In context/);
  assert.match(target.innerHTML, /Many students use their leisure to play sport or meet friends\./);
  assert.match(target.innerHTML, /data-word-pathway="meaning"/);
});

test('all-words controller supplies canonical item metadata and a linked context sentence', () => {
  const source = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');
  assert.match(source, /partOfSpeech:target\?\.partOfSpeech/);
  assert.match(source, /definition:target\?\.coreMeaning/);
  assert.match(source, /contextSentence:/);
  assert.match(source, /contextsByOccurrence/);
});

test('dictionary entry styling is present without replacing pathway progress styling', () => {
  const css = fs.readFileSync(new URL('../vocabulary-extra.css', import.meta.url), 'utf8');
  assert.match(css, /\.vocab-dictionary-entry/);
  assert.match(css, /\.vocab-dictionary-entry__pos/);
  assert.match(css, /\.vocab-dictionary-entry__context/);
  assert.match(css, /\.vocab-word-pathways/);
});

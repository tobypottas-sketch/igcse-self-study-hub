import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderVocabularyWords } from '../src/vocabulary/views.js';

function root() { return { innerHTML:'' }; }

const pathways = {
  meaning:{ currentStage:'match', completedStages:['recognise'] },
  context:{ currentStage:'recognise', completedStages:[] },
  word_families:{ currentStage:'apply', completedStages:['recognise','match'] },
  paraphrasing:{ currentStage:'recall', completedStages:['recognise','match','apply'] },
  precision_use:{ currentStage:'recognise', completedStages:[] },
  spelling_recall:{ currentStage:'mastery', completedStages:['recognise','match','apply','recall'], mastered:true }
};

test('dictionary cards expose a compact five-rung visual for each pathway without changing pathway data', () => {
  const target = root();
  renderVocabularyWords(target, {
    unitNumber:1,
    unitTitle:'Sports and Free Time',
    words:[{
      term:'urge',
      partOfSpeech:'verb',
      definition:'to strongly encourage someone to do something',
      contextSentence:'Doctors urge teenagers to stay active for their health.',
      learningStage:'emerging',
      pathways,
      strands:{}
    }]
  });

  assert.match(target.innerHTML, /class="vocab-word-pathway__ladder"/);
  assert.match(target.innerHTML, /data-rung="recognise"/);
  assert.match(target.innerHTML, /data-rung="match"/);
  assert.match(target.innerHTML, /data-rung="apply"/);
  assert.match(target.innerHTML, /data-rung="recall"/);
  assert.match(target.innerHTML, /data-rung="mastery"/);
  assert.match(target.innerHTML, /data-marker-state="complete"/);
  assert.match(target.innerHTML, /data-marker-state="current"/);
  assert.match(target.innerHTML, /data-marker-state="locked"/);
});

test('dictionary card copy makes overall status and evidence controls clearer', () => {
  const target = root();
  renderVocabularyWords(target, {
    unitNumber:1,
    unitTitle:'Sports and Free Time',
    words:[{
      term:'urge', learningStage:'emerging', pathways, strands:{},
      partOfSpeech:'verb', definition:'to strongly encourage someone to do something',
      contextSentence:'Doctors urge teenagers to stay active for their health.'
    }]
  });

  assert.match(target.innerHTML, /Overall progress/);
  assert.match(target.innerHTML, /Emerging/);
  assert.match(target.innerHTML, /<summary>View evidence<\/summary>/);
});

test('dictionary polish uses restrained pathway accents and preserves baseline context alignment', () => {
  const css = fs.readFileSync(new URL('../vocabulary-extra.css', import.meta.url), 'utf8');

  for (const pathway of ['meaning','context','word_families','paraphrasing','precision_use','spelling_recall']) {
    assert.match(css, new RegExp(`\\.vocab-word-pathway\\[data-word-pathway="${pathway}"\\]`));
  }
  assert.match(css, /\.vocab-word-pathway__ladder/);
  assert.match(css, /data-marker-state="current"/);
  assert.match(css, /data-marker-state="complete"/);
  assert.match(css, /\.vocab-dictionary-entry__context\{[^}]*align-items:baseline/s);
  assert.match(css, /\.vocab-dictionary-entry__context::before/);
  assert.match(css, /\.vocab-word-evidence summary::after/);
});

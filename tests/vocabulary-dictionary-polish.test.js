import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderVocabularyWords } from '../src/vocabulary/views.js';

// Presentation-only: the visual rung rail reads existing pathway stage hooks.
function root() { return { innerHTML:'' }; }

const pathways = {
  meaning:{ currentStage:'match', completedStages:['recognise'] },
  context:{ currentStage:'recognise', completedStages:[] },
  word_families:{ currentStage:'apply', completedStages:['recognise','match'] },
  paraphrasing:{ currentStage:'recall', completedStages:['recognise','match','apply'] },
  precision_use:{ currentStage:'recognise', completedStages:[] },
  spelling_recall:{ currentStage:'mastery', completedStages:['recognise','match','apply','recall'], mastered:true }
};

test('dictionary cards retain authoritative pathway stage hooks for the five-rung visual', () => {
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

  assert.match(target.innerHTML, /data-word-pathway="meaning" data-stage="match"/);
  assert.match(target.innerHTML, /data-word-pathway="context" data-stage="recognise"/);
  assert.match(target.innerHTML, /data-word-pathway="word_families" data-stage="apply"/);
  assert.match(target.innerHTML, /data-word-pathway="paraphrasing" data-stage="recall"/);
  assert.match(target.innerHTML, /data-word-pathway="spelling_recall" data-stage="mastery"/);
});

test('dictionary polish renders a five-rung rail from existing stage data only', () => {
  const css = fs.readFileSync(new URL('../vocabulary-dictionary-polish.css', import.meta.url), 'utf8');
  assert.match(css, /\[data-stage="recognise"\]::after\{content:"◉ ○ ○ ○ ○"\}/);
  assert.match(css, /\[data-stage="match"\]::after\{content:"● ◉ ○ ○ ○"\}/);
  assert.match(css, /\[data-stage="apply"\]::after\{content:"● ● ◉ ○ ○"\}/);
  assert.match(css, /\[data-stage="recall"\]::after\{content:"● ● ● ◉ ○"\}/);
  assert.match(css, /\[data-stage="mastery"\]::after\{content:"● ● ● ● ◉"\}/);
});

test('dictionary polish uses restrained pathway accents and preserves context baseline alignment', () => {
  const css = fs.readFileSync(new URL('../vocabulary-dictionary-polish.css', import.meta.url), 'utf8');

  for (const pathway of ['meaning','context','word_families','paraphrasing','precision_use','spelling_recall']) {
    assert.match(css, new RegExp(`\\.vocab-word-pathway\\[data-word-pathway="${pathway}"\\]`));
  }
  assert.match(css, /\.vocab-dictionary-entry__context\{[^}]*align-items:baseline/s);
  assert.match(css, /\.vocab-dictionary-entry__context::before/);
  assert.match(css, /\.vocab-word-row__head>\.vocab-state-pill::before\{[^}]*content:"Overall progress ·"/s);
  assert.match(css, /\.vocab-word-evidence summary::before\{[^}]*content:"View evidence"/s);
  assert.match(css, /\.vocab-word-evidence summary::after/);
});

test('vocabulary page loads dictionary polish after the existing vocabulary styles', () => {
  const html = fs.readFileSync(new URL('../vocabulary.html', import.meta.url), 'utf8');
  assert.match(html, /vocabulary-word-list-nav\.css[\s\S]*vocabulary-dictionary-polish\.css/);
});

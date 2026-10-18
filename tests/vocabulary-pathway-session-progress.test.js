import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderVocabularyQuestion } from '../src/vocabulary/views.js';

function root() { return { innerHTML:'' }; }

const question = {
  type:'meaning_match',
  responseMode:'choice',
  prompt:'What does “leisure” mean in this context?\nMany students use their leisure to play sport or meet friends.',
  options:['free time','salary','deadline']
};

test('fixed pathway sessions show pathway stage progress instead of per-word learning stage', () => {
  const target = root();
  renderVocabularyQuestion(target, {
    unitNumber:1,
    unitTitle:'Sports and Free Time',
    question,
    term:'leisure',
    sessionLabel:'1 / 10 activities',
    learningStage:'building',
    pathwayId:'meaning',
    pathwayStage:'recognise'
  });

  assert.match(target.innerHTML, /data-pathway-session-progress="meaning"/);
  assert.match(target.innerHTML, /Recognise/);
  assert.match(target.innerHTML, /Stage 1 of 5/);
  assert.match(target.innerHTML, /aria-valuenow="1"/);
  assert.match(target.innerHTML, /--pathway-progress:20%/);
  assert.doesNotMatch(target.innerHTML, /vocab-learning-stage/);
  assert.doesNotMatch(target.innerHTML, />Building</);
});

test('pathway progress bar advances from teal to violet across five fixed stages', () => {
  const css = fs.readFileSync(new URL('../vocabulary-foundational.css', import.meta.url), 'utf8');
  assert.match(css, /\.vocab-pathway-session-progress/);
  assert.match(css, /\.vocab-pathway-progress__fill/);
  assert.match(css, /linear-gradient\([^)]*#(?:[0-9a-fA-F]{6})[^)]*#(?:[0-9a-fA-F]{6})[^)]*\)/);
});

test('app passes the fixed pathway identity and stage to the question renderer', () => {
  const source = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');
  assert.match(source, /pathwayId:state\.pathwayId/);
  assert.match(source, /pathwayStage:state\.pathwayStage/);
});

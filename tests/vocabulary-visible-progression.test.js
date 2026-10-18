import test from 'node:test';
import assert from 'node:assert/strict';
import { renderVocabularyQuestion, renderVocabularyUnit, renderVocabularyWords } from '../src/vocabulary/views.js';

function root() { return { innerHTML:'' }; }

const stages = { emerging:12, building:14, developing:10, secure:8, mastered:6 };

test('unit view shows one calm five-stage progression strip from Emerging to Mastered', () => {
  const target = root();
  renderVocabularyUnit(target, {
    unitNumber:1, unitTitle:'Sports and Free Time',
    progress:{ total:50, mastered:6, needsAnotherLook:24, reviewDue:2, stages },
    contentReady:true
  });
  for (const label of ['Emerging','Building','Developing','Secure','Mastered']) assert.match(target.innerHTML, new RegExp(label));
  assert.match(target.innerHTML, /data-learning-progress/);
  assert.match(target.innerHTML, /12/);
  assert.match(target.innerHTML, /14/);
  assert.match(target.innerHTML, /10/);
  assert.match(target.innerHTML, /8/);
  assert.match(target.innerHTML, /6/);
});

test('word list displays derived learningStage instead of persisted backend status', () => {
  const target = root();
  renderVocabularyWords(target, {
    unitNumber:1, unitTitle:'Sports and Free Time',
    words:[{ term:'active', status:'building', learningStage:'developing', strands:{ meaning:'Secure', context:'Developing' } }]
  });
  assert.match(target.innerHTML, /data-state="developing">Developing/);
  assert.doesNotMatch(target.innerHTML, /data-state="building">Building/);
});

test('practice question shows the current evidence-backed learning stage quietly near the task metadata', () => {
  const target = root();
  renderVocabularyQuestion(target, {
    unitNumber:1, unitTitle:'Sports and Free Time', term:'active', sessionLabel:'1 / 10 activities',
    question:{ type:'meaning_match', responseMode:'choice', prompt:'What does active mean?', options:['energetic','silent'], learningStage:'building' }
  });
  assert.match(target.innerHTML, /vocab-learning-stage/);
  assert.match(target.innerHTML, /Building/);
  assert.match(target.innerHTML, /2 of 5/);
});

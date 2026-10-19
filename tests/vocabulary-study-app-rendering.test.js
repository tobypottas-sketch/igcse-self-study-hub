import test from 'node:test';
import assert from 'node:assert/strict';
import { renderVocabularyHome, renderVocabularyUnit } from '../src/vocabulary/views.js';

function root(){ return { innerHTML:'' }; }

test('unit cards expose a visual progress hook without changing navigation actions', () => {
  const target = root();
  renderVocabularyHome(target,{displayName:'Sam',units:[{unitNumber:1,unitTitle:'Sports and free time',mastered:7,total:50}]});
  assert.match(target.innerHTML,/data-action="open-unit"/);
  assert.match(target.innerHTML,/data-unit="1"/);
  assert.match(target.innerHTML,/data-study-unit-progress/);
  assert.match(target.innerHTML,/7 \/ 50 mastered/);
});

test('pathway cards render icon, purpose, status, five-rung rail and CTA', () => {
  const target = root();
  renderVocabularyUnit(target,{unitNumber:1,unitTitle:'Sports and free time',contentReady:true,pathwayStates:{meaning:{currentStage:'match',completedStages:['recognise']}}});
  assert.match(target.innerHTML,/data-pathway="meaning"/);
  assert.match(target.innerHTML,/data-study-accent="meaning"/);
  assert.match(target.innerHTML,/data-study-icon="book"/);
  assert.match(target.innerHTML,/Understand the definition/);
  assert.match(target.innerHTML,/Current: Match/);
  for (const stage of ['recognise','match','apply','recall','mastery']) assert.match(target.innerHTML,new RegExp(`data-pathway-stage="${stage}"`));
  assert.match(target.innerHTML,/Continue pathway/);
});

test('mastered, needs-practice and unavailable pathway states remain explicit and unavailable stays disabled', () => {
  const target = root();
  renderVocabularyUnit(target,{unitNumber:1,unitTitle:'Sports and free time',contentReady:true,pathwayStates:{
    meaning:{currentStage:'mastery',completedStages:['recognise','match','apply','recall','mastery'],mastered:true},
    context:{currentStage:'match',needsPractice:true},
    paraphrasing:{available:false,currentStage:'recognise'}
  }});
  assert.match(target.innerHTML,/data-pathway="meaning"[^>]*data-pathway-status="mastered"/);
  assert.match(target.innerHTML,/data-pathway="context"[^>]*data-pathway-status="needs-practice"/);
  assert.match(target.innerHTML,/data-pathway="paraphrasing"[^>]*data-pathway-status="unavailable"[^>]*disabled aria-disabled="true"/);
  assert.match(target.innerHTML,/Not yet available for this unit/);
});

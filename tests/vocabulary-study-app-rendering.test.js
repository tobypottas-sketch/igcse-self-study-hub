import test from 'node:test';
import assert from 'node:assert/strict';
import { renderSessionSummary, renderVocabularyError, renderVocabularyHome, renderVocabularyQuestion, renderVocabularyUnit, renderVocabularyWords } from '../src/vocabulary/views.js';

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

test('question header shows pathway identity, rung, session position and animated progress hook', () => {
  const target = root();
  renderVocabularyQuestion(target,{unitNumber:1,unitTitle:'Sports and free time',term:'leisure',sessionLabel:'Meaning',pathwayId:'meaning',pathwayStage:'match',sessionPosition:3,sessionTotal:10,question:{type:'word_definition_match',responseMode:'matching',prompt:'Choose the correct definition.',matchCue:'leisure',matchOptions:['free time','a crowd','a problem']}});
  assert.match(target.innerHTML,/data-study-question/);
  assert.match(target.innerHTML,/data-study-accent="meaning"/);
  assert.match(target.innerHTML,/data-study-icon="book"/);
  assert.match(target.innerHTML,/Meaning/);
  assert.match(target.innerHTML,/Match/);
  assert.match(target.innerHTML,/3 \/ 10/);
  assert.match(target.innerHTML,/class="study-progress/);
  assert.match(target.innerHTML,/data-match-card="free time"/);
  assert.match(target.innerHTML,/<input type="hidden" name="answer"/);
  assert.doesNotMatch(target.innerHTML,/data-match-select/);
});

test('retry remains card based and uses a calm guided support panel', () => {
  const target = root();
  renderVocabularyQuestion(target,{unitNumber:1,unitTitle:'Sports and free time',pathwayId:'meaning',pathwayStage:'match',sessionPosition:3,sessionTotal:10,retry:true,feedback:{correct:false,message:'Not quite.'},support:{action:'retry',kind:'narrow_match',options:['free time','a problem']},question:{type:'word_definition_match',responseMode:'matching',prompt:'Choose the correct definition.',matchCue:'leisure',matchOptions:['free time','a crowd','a problem']}});
  assert.match(target.innerHTML,/data-study-feedback="retry"/);
  assert.match(target.innerHTML,/Try again with two choices/);
  assert.equal((target.innerHTML.match(/data-match-card=/g) ?? []).length,2);
  assert.doesNotMatch(target.innerHTML,/data-study-milestone/);
});

test('ordinary correct feedback is compact and does not pretend a milestone happened', () => {
  const target = root();
  renderVocabularyQuestion(target,{unitNumber:1,unitTitle:'Sports and free time',pathwayId:'meaning',pathwayStage:'recognise',sessionPosition:1,sessionTotal:10,feedback:{correct:true,message:'Correct!',detail:'Leisure means free time.'},question:{type:'meaning_match',responseMode:'choice',prompt:'Choose the meaning.',options:['free time','money']}});
  assert.match(target.innerHTML,/data-study-feedback="correct"/);
  assert.match(target.innerHTML,/data-study-icon="check"/);
  assert.match(target.innerHTML,/data-action="next-question"/);
  assert.doesNotMatch(target.innerHTML,/data-study-milestone/);
});

test('ten-question completion uses evidence-backed counts and clear actions', () => {
  const target = root();
  renderSessionSummary(target,{practiceMode:'adaptive',pathwayId:'meaning',summary:{practised:10,strengthened:7,advanced:2,mastered:1,needsAnotherLook:3}});
  assert.match(target.innerHTML,/data-study-completion/);
  assert.match(target.innerHTML,/10/);
  assert.match(target.innerHTML,/7/);
  assert.match(target.innerHTML,/2/);
  assert.match(target.innerHTML,/1/);
  assert.match(target.innerHTML,/data-study-icon="book"/);
  assert.match(target.innerHTML,/data-action="continue-practice"/);
  assert.match(target.innerHTML,/data-action="back-unit"/);
});

test('dictionary rows carry pathway identities and mastered state remains textually explicit', () => {
  const target = root();
  renderVocabularyWords(target,{unitNumber:1,unitTitle:'Sports and free time',words:[{term:'leisure',partOfSpeech:'noun',definition:'time when you are not working',contextSentence:'Many people enjoy outdoor activities in their leisure time.',learningStage:'mastered',pathways:{meaning:{currentStage:'mastery',mastered:true}}}]});
  assert.match(target.innerHTML,/data-word-pathway="meaning"/);
  assert.match(target.innerHTML,/data-study-accent="meaning"/);
  assert.match(target.innerHTML,/data-study-icon="book"/);
  assert.match(target.innerHTML,/Mastery/);
  assert.match(target.innerHTML,/In context/);
});

test('empty and error states use mature shared visual hooks', () => {
  const empty = root();
  renderVocabularyHome(empty,{units:[]});
  assert.match(empty.innerHTML,/data-study-empty/);
  assert.match(empty.innerHTML,/data-study-icon="spark"/);
  const error = root();
  renderVocabularyError(error,'Connection problem');
  assert.match(error.innerHTML,/data-study-error-state/);
  assert.match(error.innerHTML,/data-study-icon="spark"/);
});

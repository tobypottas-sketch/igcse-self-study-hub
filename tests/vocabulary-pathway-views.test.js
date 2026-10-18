import test from 'node:test';
import assert from 'node:assert/strict';
import { renderVocabularyUnit } from '../src/vocabulary/views.js';

function root() { return { innerHTML:'' }; }

const pathwayStates = {
  meaning:{ currentStage:'apply', completedStages:['recognise','match'], needsPractice:false, mastered:false },
  context:{ currentStage:'match', completedStages:['recognise'], needsPractice:true, mastered:false },
  word_families:{ currentStage:'recognise', completedStages:[], needsPractice:false, mastered:false },
  paraphrasing:{ currentStage:'recall', completedStages:['recognise','match','apply'], needsPractice:false, mastered:false },
  precision_use:{ currentStage:'apply', completedStages:['recognise','match'], needsPractice:false, mastered:false },
  spelling_recall:{ currentStage:'mastery', completedStages:['recognise','match','apply','recall','mastery'], needsPractice:false, mastered:true }
};

test('unit dashboard renders exactly six fixed vocabulary pathways', () => {
  const target = root();
  renderVocabularyUnit(target, {
    unitNumber:1,
    unitTitle:'Sports and Free Time',
    progress:{ mastered:0,total:50,needsAnotherLook:0,reviewDue:0,stages:{} },
    pathwayStates,
    contentReady:true
  });
  const cards = [...target.innerHTML.matchAll(/data-pathway="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(cards, ['meaning','context','word_families','paraphrasing','precision_use','spelling_recall']);
  for (const label of ['Meaning','Context','Word Families','Paraphrasing','Precision &amp; Use','Spelling &amp; Recall']) assert.match(target.innerHTML, new RegExp(label));
});

test('every pathway card renders the five stages in fixed order with discrete states', () => {
  const target = root();
  renderVocabularyUnit(target, { unitNumber:1, unitTitle:'Sports and Free Time', pathwayStates, contentReady:true });
  const cards = target.innerHTML.split('data-pathway="').slice(1);
  assert.equal(cards.length, 6);
  for (const card of cards) {
    const stageIds = [...card.matchAll(/data-pathway-stage="([^"]+)"/g)].slice(0,5).map(match => match[1]);
    assert.deepEqual(stageIds, ['recognise','match','apply','recall','mastery']);
  }
  assert.match(target.innerHTML, /data-pathway="meaning"[\s\S]*data-pathway-stage="recognise"[^>]*data-state="complete"/);
  assert.match(target.innerHTML, /data-pathway="meaning"[\s\S]*data-pathway-stage="apply"[^>]*data-state="current"/);
  assert.match(target.innerHTML, /data-pathway="meaning"[\s\S]*data-pathway-stage="recall"[^>]*data-state="locked"/);
  assert.match(target.innerHTML, /data-pathway="context"[\s\S]*data-pathway-status="needs-practice"/);
  assert.match(target.innerHTML, /data-pathway="spelling_recall"[\s\S]*data-pathway-status="mastered"/);
});

test('old seven-mode skill launcher is absent and Mixed Practice is clearly review-only', () => {
  const target = root();
  renderVocabularyUnit(target, { unitNumber:1, unitTitle:'Sports and Free Time', pathwayStates, contentReady:true });
  assert.doesNotMatch(target.innerHTML, /data-action="set-practice-focus"/);
  assert.doesNotMatch(target.innerHTML, /vocab-focus-grid--seven/);
  assert.match(target.innerHTML, /Mixed Practice/);
  assert.match(target.innerHTML, /review/i);
  assert.match(target.innerHTML, /data-action="start-mixed-review"/);
});

test('pathway cards are the primary navigation actions and no pseudo mastery percentage is shown', () => {
  const target = root();
  renderVocabularyUnit(target, { unitNumber:1, unitTitle:'Sports and Free Time', pathwayStates, contentReady:true });
  assert.equal((target.innerHTML.match(/data-action="open-pathway"/g) ?? []).length, 6);
  assert.doesNotMatch(target.innerHTML, /\b\d{1,3}%\b/);
});
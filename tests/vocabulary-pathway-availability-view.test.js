import test from 'node:test';
import assert from 'node:assert/strict';
import { renderVocabularyUnit } from '../src/vocabulary/views.js';

function render(pathwayStates) {
  const root = { innerHTML:'' };
  renderVocabularyUnit(root, {
    unitNumber:1,
    unitTitle:'Sports and Free Time',
    progress:{ mastered:0, total:50, needsAnotherLook:0, reviewDue:0, stages:{} },
    pathwayStates,
    contentReady:true
  });
  return root.innerHTML;
}

test('withheld pathway is visibly unavailable and cannot be opened', () => {
  const html = render({
    precision_use:{
      currentStage:'recognise', completedStages:[], mastered:false, needsPractice:false,
      available:false, coverageCount:0, totalCount:50, unavailableReason:'required_rung_withheld'
    }
  });
  const card = html.match(/<button[^>]*data-pathway="precision_use"[^>]*>.*?<\/button>/s)?.[0] ?? '';
  assert.ok(card.includes('disabled'));
  assert.ok(card.includes('Coming soon'));
  assert.ok(!card.includes('Continue pathway'));
});

test('partial pathway coverage is stated honestly on the card', () => {
  const html = render({
    meaning:{
      currentStage:'recognise', completedStages:[], mastered:false, needsPractice:false,
      available:true, coverageCount:48, totalCount:50
    }
  });
  const card = html.match(/<button[^>]*data-pathway="meaning"[^>]*>.*?<\/button>/s)?.[0] ?? '';
  assert.ok(card.includes('48 of 50 words available'));
  assert.ok(!card.includes('disabled'));
});

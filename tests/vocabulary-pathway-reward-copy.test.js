import test from 'node:test';
import assert from 'node:assert/strict';
import { renderVocabularyUnit } from '../src/vocabulary/views.js';

function render(pathwayStates) {
  const root = { innerHTML:'' };
  renderVocabularyUnit(root, {
    unitNumber:1,
    unitTitle:'Sports and Free Time',
    progress:{ mastered:0,total:50,needsAnotherLook:0,reviewDue:0,stages:{} },
    pathwayStates,
    contentReady:true
  });
  return root.innerHTML;
}
function plain(html) { return String(html).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(); }

const unavailable = { available:false,currentStage:'recognise',completedStages:[],mastered:false };
function states(meaning) {
  return {
    meaning,
    context:unavailable,
    word_families:unavailable,
    paraphrasing:unavailable,
    precision_use:unavailable,
    spelling_recall:unavailable
  };
}

test('in-progress pathway tells students where they are and that a session is finite', () => {
  const html = render(states({
    available:true,currentStage:'apply',completedStages:['recognise','match'],mastered:false,needsPractice:false,coverageCount:50,totalCount:50
  }));
  const meaning = html.match(/<button[^>]*data-pathway="meaning"[\s\S]*?<\/button>/)?.[0] ?? '';
  const text = plain(meaning);
  assert.match(text,/2 of 5 stages complete/);
  assert.match(text,/Next up:\s*Apply/);
  assert.match(text,/Complete short 10-question study sessions to build this skill/i);
  assert.match(text,/Start 10-question session/);
  assert.doesNotMatch(text,/sessions? remaining|days? left|ETA/i);
});

test('mastered pathway reads as a genuine completed destination', () => {
  const html = render(states({
    available:true,currentStage:'mastery',completedStages:['recognise','match','apply','recall','mastery'],mastered:true,needsPractice:false,coverageCount:50,totalCount:50
  }));
  const meaning = html.match(/<button[^>]*data-pathway="meaning"[\s\S]*?<\/button>/)?.[0] ?? '';
  const text = plain(meaning);
  assert.match(text,/5 of 5 stages complete/);
  assert.match(text,/Mastered ✓/);
  assert.match(text,/Review pathway/);
  assert.doesNotMatch(text,/Next up:/);
});

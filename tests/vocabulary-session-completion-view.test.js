import test from 'node:test';
import assert from 'node:assert/strict';
import { renderSessionSummary } from '../src/vocabulary/views.js';

function render(options) {
  const root = { innerHTML:'' };
  renderSessionSummary(root, options);
  return root.innerHTML;
}
function plain(html) {
  return String(html).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
}

const reward = {
  firstAttemptCorrect:9, correctedMistakes:1, stars:3,
  practised:10, strengthened:6, needsAnotherLook:1, totalQuestions:10,
  pathwayId:'meaning', pathwayStage:'match'
};

test('normal pathway set ends with stars, learning evidence, and an optional Continue', () => {
  const html = render({
    summary:{ practised:10, strengthened:6, secure:0, mastered:0, needsAnotherLook:1 },
    reward,
    completion:{ kind:'session_complete', pathwayId:'meaning', clearedStageId:null, nextStageId:'match' },
    pathwayId:'meaning', pathwayStage:'match'
  });
  const text = plain(html);
  assert.match(text,/Session complete/i);
  assert.match(html,/aria-label="3 stars"/i);
  assert.match(text,/9\s*\/\s*10/);
  assert.match(text,/first-attempt correct/i);
  assert.match(html,/aria-label="6 words strengthened"/i);
  assert.match(html,/aria-label="1 mistake corrected"/i);
  assert.match(text,/building confidence in Meaning · Match/i);
  assert.match(html,/data-action="back-unit"/);
  assert.match(text,/Finish for now/);
  assert.match(html,/data-action="continue-practice"/);
  assert.match(text,/Continue/);
  assert.doesNotMatch(text,/failed|failure/i);
});

test('stage clear upgrades the finish state and names the next rung', () => {
  const html = render({
    summary:{ practised:10, strengthened:8 }, reward:{...reward,firstAttemptCorrect:8,stars:2},
    completion:{ kind:'stage_complete', pathwayId:'meaning', clearedStageId:'match', nextStageId:'apply' },
    pathwayId:'meaning', pathwayStage:'match'
  });
  const text = plain(html);
  assert.match(text,/MATCH COMPLETE/);
  assert.match(text,/Stage 2 of 5 cleared/);
  assert.match(text,/Next stage unlocked:\s*APPLY/);
  assert.match(text,/Recognise/);
  assert.match(text,/Match/);
  assert.match(text,/Apply/);
  assert.match(html,/data-action="continue-practice"/);
  assert.match(text,/Start Apply/);
  assert.match(text,/Come back later to keep building/);
});

test('pathway mastery is a distinct major finish with no generic Continue', () => {
  const html = render({
    summary:{ practised:10, strengthened:9 }, reward,
    completion:{ kind:'pathway_mastered', pathwayId:'meaning', clearedStageId:'mastery', nextStageId:null },
    pathwayId:'meaning', pathwayStage:'mastery'
  });
  const text = plain(html);
  assert.match(text,/PATHWAY MASTERED/);
  assert.match(text,/Meaning complete/);
  assert.match(text,/5\s*\/\s*5 stages cleared/);
  assert.match(text,/You’ve completed the Meaning pathway/);
  assert.match(html,/data-action="back-units"/);
  assert.match(text,/Back to Vocabulary Builder/);
  assert.match(html,/data-action="back-unit"/);
  assert.match(text,/Choose another pathway/);
  assert.doesNotMatch(html,/data-action="continue-practice"/);
});

test('a low-score session remains complete and supportive without a red failure message', () => {
  const html = render({
    summary:{ practised:10, strengthened:3, needsAnotherLook:4 },
    reward:{...reward,firstAttemptCorrect:4,stars:0,strengthened:3,needsAnotherLook:4},
    completion:{ kind:'session_complete', pathwayId:'meaning', clearedStageId:null, nextStageId:'match' },
    pathwayId:'meaning', pathwayStage:'match'
  });
  const text = plain(html);
  assert.match(text,/Session complete/i);
  assert.match(text,/Good practice/i);
  assert.doesNotMatch(text,/failed|failure|0 stars/i);
});

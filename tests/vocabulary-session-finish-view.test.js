import test from 'node:test';
import assert from 'node:assert/strict';
import { renderSessionSummary } from '../src/vocabulary/views.js';

function root() { return { innerHTML:'' }; }
function render(finishModel) {
  const target = root();
  renderSessionSummary(target,{ summary:{ practised:finishModel.denominator, strengthened:finishModel.score, needsAnotherLook:finishModel.needsAnotherLook ?? 0 }, pathwayId:'meaning', finishModel });
  return target.innerHTML;
}

const base = {
  score:8, denominator:10, stars:2, needsAnotherLook:2, pathwayId:'meaning', pathwayLabel:'Meaning',
  stageId:'match', stageLabel:'Match', stageNumber:2, nextStageLabel:null, completedStages:['recognise'],
  heading:'Session complete', kicker:'SESSION COMPLETE', supportCopy:'Good work — keep building. Your progress is saved.',
  primaryAction:{ action:'continue-practice', label:'Continue studying' }, showProgressSaved:true,
  accessibleSummary:'Session complete. 8 out of 10 correct. 2 out of 3 stars earned. 8 words strengthened. 2 need another look. Current stage: Match.'
};

test('standard pathway finish renders score, stars, evidence, stage and genuine stopping choice', () => {
  const html = render({ ...base, variant:'session' });
  assert.match(html,/SESSION COMPLETE/);
  assert.match(html,/8\s*\/\s*10 correct/);
  assert.match(html,/2 out of 3 stars earned/);
  assert.match(html,/8[^<]*<\/strong><span>words strengthened/);
  assert.match(html,/2[^<]*<\/strong><span>need another look/);
  assert.match(html,/Meaning/);
  assert.match(html,/Match/);
  assert.match(html,/Continue studying/);
  assert.match(html,/Finish for now/);
});

test('low-score pathway finish omits empty-star UI and avoids failure language', () => {
  const html = render({ ...base, variant:'session', score:4, stars:0, needsAnotherLook:6, supportCopy:'Good practice — a few words need another go.', accessibleSummary:'Session complete. 4 out of 10 correct. 4 words strengthened. 6 need another look. Current stage: Match.' });
  assert.doesNotMatch(html,/vocab-finish-stars/);
  assert.match(html,/Good practice — a few words need another go\./);
  assert.doesNotMatch(html,/\bfailed\b|\bfailure\b/i);
});

test('stage-complete finish renders cleared stage, unlocked stage, full ladder and next-stage CTA', () => {
  const html = render({ ...base, variant:'stage-complete', score:9, stars:3, heading:'MATCH COMPLETE', kicker:'MATCH COMPLETE', stageId:'apply', stageLabel:'Apply', stageNumber:3, nextStageLabel:'Apply', completedStages:['recognise','match'], primaryAction:{ action:'continue-practice', label:'Start Apply' }, accessibleSummary:'MATCH COMPLETE. 9 out of 10 correct. 3 out of 3 stars earned. Match stage complete. Apply unlocked.' });
  assert.match(html,/MATCH COMPLETE/);
  assert.match(html,/Stage 2 cleared/);
  assert.match(html,/APPLY UNLOCKED/);
  assert.match(html,/Start Apply/);
  for (const stage of ['Recognise','Match','Apply','Recall','Mastery']) assert.match(html,new RegExp(stage));
});

test('mastery finish celebrates the pathway and does not force Continue', () => {
  const html = render({ ...base, variant:'mastered', score:10, stars:3, stageId:'mastery', stageLabel:'Mastery', stageNumber:5, completedStages:['recognise','match','apply','recall','mastery'], heading:'MEANING MASTERED', kicker:'PATHWAY MASTERED', primaryAction:null, accessibleSummary:'MEANING MASTERED. 10 out of 10 correct. Meaning pathway mastered.' });
  assert.match(html,/MEANING MASTERED/);
  assert.match(html,/completed all five stages/i);
  assert.doesNotMatch(html,/data-action="continue-practice"/);
  assert.match(html,/Finish for now/);
});

test('finish heading and stars expose accessible text equivalents', () => {
  const html = render({ ...base, variant:'session' });
  assert.match(html,/data-session-finish-heading[^>]*tabindex="-1"/);
  assert.match(html,/aria-label="2 out of 3 stars earned"/);
  assert.match(html,/class="vocab-finish-sr"/);
});

test('preview finish never claims saved progress or pathway unlocks', () => {
  const html = render({ ...base, variant:'session', showProgressSaved:false, supportCopy:'Preview only — no progress has been saved.', accessibleSummary:'Session complete. 8 out of 10 correct. Preview only.' });
  assert.match(html,/Preview only — no progress has been saved\./);
  assert.doesNotMatch(html,/Your progress is saved/);
  assert.doesNotMatch(html,/UNLOCKED|MASTERED/);
});

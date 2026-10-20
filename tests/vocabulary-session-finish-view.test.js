import test from 'node:test';
import assert from 'node:assert/strict';
import { renderSessionSummary } from '../src/vocabulary/views.js';

function root() { return { innerHTML:'' }; }
function model(extra = {}) {
  return {
    variant:'session', score:8, denominator:10, stars:2, pathwayId:'meaning', pathwayLabel:'Meaning', stageId:'match', stageLabel:'Match', stageNumber:2,
    nextStageId:null, nextStageLabel:null, heading:'Session complete', kicker:'SESSION COMPLETE', supportCopy:'Good work — keep building. Your progress is saved.',
    primaryAction:{ id:'continue-practice', label:'Continue studying' }, showProgressSaved:true, completedStages:['recognise'], needsAnotherLook:2,
    accessibleSummary:'Session complete. 8 out of 10 correct. 2 out of 3 stars earned. 8 words strengthened. 2 need another look. Match, stage 2 of 5.',
    ...extra
  };
}

test('standard result is a complete optional-stop mission with score, stars, evidence and both actions', () => {
  const target = root(); renderSessionSummary(target,{ pathwayId:'meaning', summary:{practised:10,strengthened:8,needsAnotherLook:2}, finishModel:model() });
  assert.match(target.innerHTML,/SESSION COMPLETE/i); assert.match(target.innerHTML,/8 \/ 10/); assert.match(target.innerHTML,/2 out of 3 stars earned/);
  assert.match(target.innerHTML,/words strengthened/); assert.match(target.innerHTML,/need another look/); assert.match(target.innerHTML,/Continue studying/); assert.match(target.innerHTML,/Finish for now/);
  assert.match(target.innerHTML,/data-session-finish-heading/); assert.match(target.innerHTML,/tabindex="-1"/);
});

test('low score omits empty-star UI and stays supportive', () => {
  const target = root(); renderSessionSummary(target,{ pathwayId:'meaning', finishModel:model({score:4,stars:0,needsAnotherLook:6,supportCopy:'Good practice — a few words need another go.'}) });
  assert.doesNotMatch(target.innerHTML,/vocab-finish-stars/); assert.match(target.innerHTML,/Good practice/); assert.doesNotMatch(target.innerHTML,/failed|failure/i);
});

test('stage clear shows the authoritative unlock but still offers Finish for now', () => {
  const target = root(); renderSessionSummary(target,{ pathwayId:'meaning', finishModel:model({variant:'stage-complete',heading:'MATCH COMPLETE',kicker:'Stage 2 cleared',nextStageId:'apply',nextStageLabel:'Apply',completedStages:['recognise','match'],primaryAction:{id:'continue-practice',label:'Start Apply'},supportCopy:'You cleared this stage.'}) });
  assert.match(target.innerHTML,/MATCH COMPLETE/); assert.match(target.innerHTML,/Stage 2 cleared/); assert.match(target.innerHTML,/APPLY UNLOCKED/); assert.match(target.innerHTML,/Start Apply/); assert.match(target.innerHTML,/Finish for now/);
});

test('mastery is a valid stopping point with no forced Continue action', () => {
  const target = root(); renderSessionSummary(target,{ pathwayId:'meaning', finishModel:model({variant:'mastered',heading:'MEANING MASTERED',kicker:'PATHWAY COMPLETE',completedStages:['recognise','match','apply','recall','mastery'],primaryAction:null,supportCopy:'You completed all five stages.'}) });
  assert.match(target.innerHTML,/MEANING MASTERED/); assert.match(target.innerHTML,/All five stages complete/); assert.doesNotMatch(target.innerHTML,/data-action="continue-practice"/); assert.match(target.innerHTML,/Finish for now/);
});

test('preview result never claims saved or unlocked progression', () => {
  const target = root(); renderSessionSummary(target,{ pathwayId:'meaning', finishModel:model({supportCopy:'Preview only — no progress has been saved.',showProgressSaved:false}) });
  assert.match(target.innerHTML,/Preview only/); assert.doesNotMatch(target.innerHTML,/Your progress is saved/); assert.doesNotMatch(target.innerHTML,/UNLOCKED|MASTERED/);
});

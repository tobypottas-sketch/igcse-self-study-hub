import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSessionFinishModel } from '../src/vocabulary/session-finish-model.js';

function build(summary, extra = {}) {
  return buildSessionFinishModel({
    summary,
    pathwayId:'meaning',
    startStage:'match',
    postPathwayState:{ currentStage:'match', mastered:false, completedStages:['recognise'] },
    ...extra
  });
}

test('10-target mission uses the approved star thresholds', () => {
  assert.equal(build({ practised:10, strengthened:10 }).stars,3);
  assert.equal(build({ practised:10, strengthened:9 }).stars,3);
  assert.equal(build({ practised:10, strengthened:8 }).stars,2);
  assert.equal(build({ practised:10, strengthened:6 }).stars,1);
  assert.equal(build({ practised:10, strengthened:4 }).stars,0);
});

test('non-10 mission keeps the truthful denominator and does not apply stars', () => {
  const model = build({ practised:8, strengthened:4 });
  assert.equal(model.score,4);
  assert.equal(model.denominator,8);
  assert.equal(model.stars,null);
});

test('session score is derived from strengthened and practised targets', () => {
  const model = build({ practised:10, strengthened:7, needsAnotherLook:3 });
  assert.equal(model.score,7);
  assert.equal(model.denominator,10);
  assert.equal(model.needsAnotherLook,3);
});

test('same-stage authoritative state remains an ordinary session finish', () => {
  const model = build({ practised:10, strengthened:8 });
  assert.equal(model.variant,'session');
  assert.equal(model.heading,'Session complete');
  assert.equal(model.primaryAction?.label,'Continue studying');
});

test('Match to Apply becomes stage complete using authoritative post-save state', () => {
  const model = build(
    { practised:10, strengthened:9 },
    { postPathwayState:{ currentStage:'apply', mastered:false, completedStages:['recognise','match'] } }
  );
  assert.equal(model.variant,'stage-complete');
  assert.equal(model.heading,'MATCH COMPLETE');
  assert.equal(model.nextStageLabel,'Apply');
  assert.equal(model.primaryAction?.label,'Start Apply');
});

test('mastered authoritative state becomes pathway mastery with no continue action', () => {
  const model = build(
    { practised:10, strengthened:10 },
    { postPathwayState:{ currentStage:'mastery', mastered:true, completedStages:['recognise','match','apply','recall','mastery'] } }
  );
  assert.equal(model.variant,'mastered');
  assert.equal(model.heading,'MEANING MASTERED');
  assert.equal(model.primaryAction,null);
});

test('preview remains session-level and never claims saved progression', () => {
  const model = build(
    { practised:10, strengthened:10 },
    { preview:true, postPathwayState:{ currentStage:'mastery', mastered:true, completedStages:['recognise','match','apply','recall','mastery'] } }
  );
  assert.equal(model.variant,'session');
  assert.equal(model.showProgressSaved,false);
  assert.match(model.supportCopy,/Preview only/i);
});

test('support copy is fixed and score-banded', () => {
  assert.equal(build({ practised:10, strengthened:9 }).supportCopy,'Strong session. Your progress is saved.');
  assert.equal(build({ practised:10, strengthened:7 }).supportCopy,'Good work — keep building. Your progress is saved.');
  assert.equal(build({ practised:10, strengthened:4 }).supportCopy,'Good practice — a few words need another go.');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { ADAPTIVE_FAMILY_MIX, planNextActivity } from '../src/vocabulary/adaptive-planner.js';
import { activityDefinition, activitiesForMode } from '../src/vocabulary/activity-catalogue.js';

function mastery(status, strandEvidence = {}) {
  return { status, strandEvidence:{ meaning:0, recognition:0, context:0, paraphrasing:0, production:0, ...strandEvidence }, recentErrorCount:0 };
}

const allAvailable = activitiesForMode('adaptive').map(activity => activity.id);
const demand = { recognition:0, retrieval:1, discrimination:2, manipulation:3, production:4 };

test('planner publishes the approved five-stage family mix', () => {
  assert.deepEqual(ADAPTIVE_FAMILY_MIX, {
    emerging:{ recognition:70, retrieval:20, discrimination:10, manipulation:0, production:0 },
    building:{ recognition:25, retrieval:50, discrimination:20, manipulation:5, production:0 },
    developing:{ recognition:10, retrieval:25, discrimination:45, manipulation:20, production:0 },
    secure:{ recognition:5, retrieval:15, discrimination:25, manipulation:40, production:15 },
    mastered:{ recognition:5, retrieval:10, discrimination:15, manipulation:25, production:45 }
  });
});

test('adaptive family selection follows the derived learner stage when eligible activities exist', () => {
  const emerging = planNextActivity({ practiceMode:'adaptive', mastery:mastery('new'), availableContent:allAvailable });
  assert.equal(emerging.stage, 'emerging');
  assert.equal(emerging.family, 'recognition');

  const developing = planNextActivity({ practiceMode:'adaptive', mastery:mastery('building', { meaning:3, context:3 }), availableContent:allAvailable });
  assert.equal(developing.stage, 'developing');
  assert.equal(developing.family, 'discrimination');

  const secure = planNextActivity({ practiceMode:'adaptive', mastery:mastery('secure', { meaning:7, recognition:7, context:5, paraphrasing:5, production:2 }), availableContent:allAvailable });
  assert.equal(secure.stage, 'secure');
  assert.equal(secure.family, 'manipulation');

  const mastered = planNextActivity({ practiceMode:'adaptive', mastery:mastery('mastered', { meaning:9, recognition:9, context:8, paraphrasing:8, production:8 }), availableContent:allAvailable });
  assert.equal(mastered.stage, 'mastered');
  assert.equal(mastered.family, 'production');
});

test('clean success raises demand when a harder eligible family is available', () => {
  const strong = mastery('secure', { meaning:7, recognition:7, context:5, paraphrasing:5, production:2 });
  const plan = planNextActivity({
    practiceMode:'adaptive', mastery:strong,
    recentActivities:[{ type:'same_idea', family:'discrimination', correct:true }],
    availableContent:allAvailable
  });
  assert.ok(demand[plan.family] >= demand.manipulation, plan.family);
});

test('struggle temporarily steps down to support-suitable demand without changing stage', () => {
  const strong = mastery('secure', { meaning:7, recognition:7, context:5, paraphrasing:5, production:3 });
  const plan = planNextActivity({
    practiceMode:'adaptive', mastery:strong,
    recentActivities:[{ type:'rewrite_idea', family:'production', correct:false, contentId:'idea-a' }],
    supportState:{ struggling:true }, availableContent:allAvailable
  });
  assert.equal(plan.stage, 'secure');
  assert.ok(demand[plan.family] < demand.production, plan.family);
  assert.equal(activityDefinition(plan.activityType).supportSuitable, true);
  assert.notEqual(plan.activityType, 'rewrite_idea');
});

test('recycle avoids the failed type and prior content', () => {
  const plan = planNextActivity({
    practiceMode:'phrase_paraphrase', mastery:mastery('building', { meaning:4, recognition:4, paraphrasing:2 }),
    recentActivities:[{ type:'build_paraphrase', family:'manipulation', correct:false, contentId:'u1_phrase_a' }],
    supportState:{ recycle:true }, availableContent:activitiesForMode('phrase_paraphrase').map(activity => activity.id)
  });
  assert.notEqual(plan.activityType, 'build_paraphrase');
  assert.deepEqual(plan.avoidContentIds, ['u1_phrase_a']);
});

test('two high-demand activities bias the next mixed question toward lower friction', () => {
  const strong = mastery('secure', { meaning:7, recognition:7, context:5, paraphrasing:5, production:3 });
  const plan = planNextActivity({
    practiceMode:'adaptive', mastery:strong,
    recentActivities:[
      { type:'rewrite_phrase', family:'production', correct:true },
      { type:'build_same_idea', family:'manipulation', correct:true }
    ],
    availableContent:allAvailable
  });
  assert.ok(demand[plan.family] <= demand.discrimination, plan.family);
});

test('three recent activities from one family prevent that family dominating when alternatives exist', () => {
  const strong = mastery('secure', { meaning:7, recognition:7, context:5, paraphrasing:5, production:3 });
  const plan = planNextActivity({
    practiceMode:'adaptive', mastery:strong,
    recentActivities:[
      { type:'build_paraphrase', family:'manipulation', correct:true },
      { type:'complete_paraphrase', family:'manipulation', correct:true },
      { type:'build_same_idea', family:'manipulation', correct:true }
    ],
    availableContent:allAvailable
  });
  assert.notEqual(plan.family, 'manipulation');
});

test('same activity type is avoided consecutively when another eligible type exists in the chosen family', () => {
  const strong = mastery('secure', { meaning:7, recognition:7, context:5, paraphrasing:5, production:2 });
  const plan = planNextActivity({
    practiceMode:'adaptive', mastery:strong,
    recentActivities:[{ type:'build_paraphrase', family:'manipulation', correct:false }],
    availableContent:allAvailable
  });
  if (plan.family === 'manipulation') assert.notEqual(plan.activityType, 'build_paraphrase');
});

test('focused practice remains inside its approved mode and supports deliberate entry', () => {
  for (const practiceMode of ['learn','context','question_text','phrase_paraphrase','idea_paraphrase','writing']) {
    const allowed = activitiesForMode(practiceMode).map(activity => activity.id);
    const plan = planNextActivity({ practiceMode, mastery:mastery('new'), recentActivities:[], availableContent:allowed });
    assert.ok(allowed.includes(plan.activityType), `${practiceMode}: ${plan.activityType}`);
  }
});

test('review-due mastered targets prefer review-suitable manipulation or production', () => {
  const plan = planNextActivity({
    practiceMode:'adaptive', mastery:mastery('mastered', { meaning:9, recognition:9, context:8, paraphrasing:8, production:8 }),
    reviewDue:true, recentActivities:[], availableContent:allAvailable
  });
  assert.ok(['manipulation','production'].includes(plan.family), plan.family);
  assert.equal(activityDefinition(plan.activityType).reviewSuitable, true);
});

test('planner is deterministic for the same evidence state and availability', () => {
  const args = { practiceMode:'adaptive', mastery:mastery('building', { meaning:4, recognition:3, context:1 }), recentActivities:[], availableContent:allAvailable };
  assert.deepEqual(planNextActivity(args), planNextActivity(args));
});

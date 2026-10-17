import test from 'node:test';
import assert from 'node:assert/strict';
import { planNextActivity } from '../src/vocabulary/adaptive-planner.js';
import { activitiesForMode } from '../src/vocabulary/activity-catalogue.js';

function mastery(status, strandEvidence = {}) {
  return { status, strandEvidence:{ meaning:0, recognition:0, context:0, paraphrasing:0, production:0, ...strandEvidence }, recentErrorCount:0 };
}

const allAvailable = activitiesForMode('adaptive').map(activity => activity.id);

test('fresh learner begins with supported recognition instead of blind production', () => {
  const plan = planNextActivity({ practiceMode:'adaptive', mastery:mastery('new'), recentActivities:[], supportState:null, reviewDue:false, availableContent:allAvailable });
  assert.ok(['meaning_match','which_situation_fits','phrase_match'].includes(plan.activityType));
  assert.equal(['rewrite_phrase','rewrite_idea','explain_another_way'].includes(plan.activityType), false);
});

test('successful work raises semantic demand through context transfer and production', () => {
  const fresh = mastery('building', { meaning:4, recognition:4, context:1, paraphrasing:1, production:0 });
  const first = planNextActivity({ practiceMode:'adaptive', mastery:fresh, recentActivities:[{ type:'meaning_match', correct:true }], availableContent:allAvailable });
  assert.ok(['which_situation_fits','meaning_in_context','correct_usage','question_text_bridge','phrase_match'].includes(first.activityType));

  const stronger = mastery('secure', { meaning:7, recognition:7, context:5, paraphrasing:5, production:2 });
  const later = planNextActivity({ practiceMode:'adaptive', mastery:stronger, recentActivities:[{ type:'build_paraphrase', correct:true }], availableContent:allAvailable });
  assert.ok(['complete_paraphrase','rewrite_phrase','build_same_idea','rewrite_idea','improve_vocabulary'].includes(later.activityType));
});

test('struggle temporarily steps back to a more scaffolded operation', () => {
  const plan = planNextActivity({
    practiceMode:'adaptive',
    mastery:mastery('secure', { meaning:7, recognition:7, context:5, paraphrasing:5, production:3 }),
    recentActivities:[{ type:'rewrite_idea', correct:false }],
    supportState:{ struggling:true },
    availableContent:allAvailable
  });
  assert.ok(['same_idea','spot_meaning_change','build_same_idea','build_paraphrase','complete_paraphrase'].includes(plan.activityType));
  assert.notEqual(plan.activityType, 'rewrite_idea');
});

test('recovery avoids the failed activity type and asks the builder to avoid prior content', () => {
  const plan = planNextActivity({
    practiceMode:'phrase_paraphrase',
    mastery:mastery('building', { meaning:4, recognition:4, paraphrasing:2 }),
    recentActivities:[{ type:'build_paraphrase', correct:false, contentId:'u1_phrase_a' }],
    supportState:{ recycle:true },
    availableContent:activitiesForMode('phrase_paraphrase').map(activity => activity.id)
  });
  assert.notEqual(plan.activityType, 'build_paraphrase');
  assert.deepEqual(plan.avoidContentIds, ['u1_phrase_a']);
});

test('each focused practice mode stays inside its approved activity family while adapting difficulty', () => {
  for (const practiceMode of ['learn','context','question_text','phrase_paraphrase','idea_paraphrase','writing']) {
    const allowed = new Set(activitiesForMode(practiceMode).map(activity => activity.id));
    const plan = planNextActivity({
      practiceMode,
      mastery:mastery('secure', { meaning:7, recognition:7, context:5, paraphrasing:5, production:3 }),
      recentActivities:[],
      availableContent:[...allowed]
    });
    assert.ok(allowed.has(plan.activityType), `${practiceMode}: ${plan.activityType}`);
  }
});

test('review-due mastered targets prioritise transfer or independent production', () => {
  const plan = planNextActivity({
    practiceMode:'adaptive',
    mastery:mastery('mastered', { meaning:9, recognition:9, context:8, paraphrasing:8, production:8 }),
    reviewDue:true,
    recentActivities:[],
    availableContent:allAvailable
  });
  assert.ok(['rewrite_phrase','rewrite_idea','improve_vocabulary','explain_another_way'].includes(plan.activityType));
});

test('planner is deterministic for the same evidence state and availability', () => {
  const args = { practiceMode:'adaptive', mastery:mastery('building', { meaning:4, recognition:3, context:1 }), recentActivities:[], availableContent:allAvailable };
  assert.deepEqual(planNextActivity(args), planNextActivity(args));
});

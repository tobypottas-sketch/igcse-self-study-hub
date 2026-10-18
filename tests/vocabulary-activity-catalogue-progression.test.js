import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ACTIVITY_TYPES,
  activitiesForFamily,
  activitiesForLearningStage,
  isActivityLive
} from '../src/vocabulary/activity-catalogue.js';

const FAMILIES = ['recognition','retrieval','discrimination','manipulation','production'];
const STAGES = ['emerging','building','developing','secure','mastered'];

test('live activities declare one authoritative progression contract', () => {
  for (const activity of ACTIVITY_TYPES.filter(candidate => isActivityLive(candidate.id))) {
    assert.ok(FAMILIES.includes(activity.family), `${activity.id}: family`);
    assert.ok(STAGES.includes(activity.earliestStage), `${activity.id}: earliestStage`);
    assert.ok(Array.isArray(activity.preferredStages) && activity.preferredStages.length > 0, `${activity.id}: preferredStages`);
    assert.ok(activity.preferredStages.every(stage => STAGES.includes(stage)), `${activity.id}: preferred stage value`);
    assert.equal(typeof activity.supportSuitable, 'boolean', `${activity.id}: supportSuitable`);
    assert.equal(typeof activity.reviewSuitable, 'boolean', `${activity.id}: reviewSuitable`);
    assert.ok(activity.responseMode, `${activity.id}: responseMode`);
    assert.ok(Array.isArray(activity.strands) && activity.strands.length > 0, `${activity.id}: strands`);
    assert.ok(activity.evidenceStrength, `${activity.id}: evidenceStrength`);
    assert.equal(typeof activity.productive, 'boolean', `${activity.id}: productive`);
  }
});

test('catalogue exposes exactly the five approved activity families', () => {
  const families = [...new Set(ACTIVITY_TYPES.filter(candidate => isActivityLive(candidate.id)).map(activity => activity.family))].sort();
  assert.deepEqual(families, [...FAMILIES].sort());
  for (const family of FAMILIES) assert.ok(activitiesForFamily(family).every(activity => activity.family === family));
});

test('learning-stage helpers include only activities whose earliest stage is reachable', () => {
  const order = Object.fromEntries(STAGES.map((stage,index) => [stage,index]));
  for (const stage of STAGES) {
    const activities = activitiesForLearningStage(stage);
    assert.ok(activities.length > 0, `${stage} should have live activities`);
    assert.ok(activities.every(activity => order[activity.earliestStage] <= order[stage]), `${stage}: readiness leak`);
  }
});

test('independent production is limited to genuinely open productive activities', () => {
  const productive = ACTIVITY_TYPES.filter(activity => isActivityLive(activity.id) && activity.productive).map(activity => activity.id).sort();
  assert.deepEqual(productive, ['explain_another_way','rewrite_idea','rewrite_phrase'].sort());
  assert.ok(ACTIVITY_TYPES.filter(activity => isActivityLive(activity.id) && activity.family === 'production').every(activity => activity.productive));
});

test('retired Correct Usage and legacy Collocation Builder remain historical only', () => {
  assert.equal(isActivityLive('correct_usage'), false);
  assert.equal(isActivityLive('collocation_builder'), false);
  assert.equal(activitiesForFamily('recognition').some(activity => activity.id === 'correct_usage'), false);
  assert.equal(activitiesForFamily('manipulation').some(activity => activity.id === 'collocation_builder'), false);
});

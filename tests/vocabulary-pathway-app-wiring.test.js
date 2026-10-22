import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');

test('unit rendering derives six pathway cards from persisted evidence', () => {
  assert.match(source, /buildUnitPathwayStates/);
  assert.match(source, /pathwayStates\s*=\s*buildUnitPathwayStates/);
  assert.match(source, /renderVocabularyUnit\([\s\S]*pathwayStates/);
});

test('open-pathway starts a fixed pathway session and Mixed Practice is separate review', () => {
  assert.match(source, /action === 'open-pathway'/);
  assert.match(source, /startPathwaySession\(/);
  assert.match(source, /action === 'start-mixed-review'/);
  assert.match(source, /startMixedReview\(/);
  assert.doesNotMatch(source, /action === 'set-practice-focus'/);
  assert.doesNotMatch(source, /action === 'start-timed'/);
});

test('pathway questions use the fixed pathway planner rather than the adaptive pool', () => {
  assert.match(source, /planPathwayQuestion/);
  assert.match(source, /pathwayId:state\.pathwayId/);
  assert.match(source, /stageId:state\.pathwayChoice\?\.stageByOccurrence\?\.get\(target\.occurrenceId\) \?\? state\.pathwayStage/);
});

test('submission records learner stage and actually served support stage', () => {
  assert.match(source, /pathwayId:state\.pathwayId/);
  assert.match(source, /pathwayStage:current\.pathwayPlan\?\.learnerStage \?\? state\.pathwayStage/);
  assert.match(source, /servedPathwayStage:current\.pathwayPlan\?\.servedStage/);
});

test('item-backed pathway activities submit through the item content source', () => {
  assert.match(source, /current\.activityRecord\s*\?\s*'unit_activity'\s*:\s*current\.context\s*\?\s*'context'\s*:\s*'item'/);
});

test('authoritative server pathway progress is copied into unit mastery before navigation', () => {
  assert.match(source, /result\.pathwayProgress/);
  assert.match(source, /pathwayProgress:\s*\{/);
});

test('timed Mixed Practice is offered, review-only, and saves evidence to the source pathway', () => {
  assert.match(source, /planMixedReviewQuestion/);
  assert.match(source, /startMixedReview\(false, timerMinutes\(target\)/);
  assert.match(source, /pathwayId:current\.pathwayPlan\.pathwayId, pathwayStage:current\.pathwayPlan\.learnerStage/);
  const views = fs.readFileSync(new URL('../src/vocabulary/views.js', import.meta.url), 'utf8');
  assert.match(views, /\[5,10,15,20\]\.map\(minutes => `<button[^`]*data-action="start-mixed-review" data-minutes="\$\{minutes\}"/);
});

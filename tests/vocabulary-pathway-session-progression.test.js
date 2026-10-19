import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildUnitPathwayStates, targetsForPathwayStage } from '../src/vocabulary/pathway-view-model.js';
import { freshPathwayProgress, applyPathwayAttempt, currentPathwayStage } from '../supabase/functions/_shared/vocabulary-pathway-progress.js';

const PATHWAY_IDS = ['meaning','context','word_families','paraphrasing','precision_use','spelling_recall'];

function coverageFor(pathwayId, ids) {
  return Object.fromEntries(PATHWAY_IDS.map(id => [id, {
    available:id === pathwayId,
    occurrenceIds:id === pathwayId ? ids : [],
    totalOccurrences:ids.length
  }]));
}

const occurrences = [
  { occurrenceId:'u1-a', vocabularyId:'a', unitNumber:1 },
  { occurrenceId:'u1-b', vocabularyId:'b', unitNumber:1 }
];

function progressRow(progress) {
  return { contextualEvidence:{ pathwayProgress:{ meaning:progress } } };
}

function cleanAttempt(stageId, index, extra = {}) {
  return {
    stageId,
    servedStageId:stageId,
    correct:true,
    firstAttempt:true,
    retryUsed:false,
    supportLevel:'none',
    contentId:`${stageId}-content-${index}`,
    contextId:`${stageId}-context-${index}`,
    promptKey:`${stageId}-prompt-${index}`,
    operation:`${stageId}-operation-${index}`,
    ...extra
  };
}

test('one progressed word makes Match reachable even while another word remains on Recognise', () => {
  let progressed = freshPathwayProgress();
  progressed = applyPathwayAttempt(progressed, cleanAttempt('recognise',1));
  progressed = applyPathwayAttempt(progressed, cleanAttempt('recognise',2));
  assert.equal(currentPathwayStage(progressed),'match');

  const states = buildUnitPathwayStates({
    occurrences,
    unitMastery:{ 'u1-a':progressRow(progressed), 'u1-b':progressRow(freshPathwayProgress()) },
    globalMastery:{},
    coverageByPathway:coverageFor('meaning',['u1-a','u1-b']),
    journeyByPathway:{ meaning:{ currentStage:'recognise', completedStages:[] } }
  });
  assert.equal(states.meaning.currentStage,'match');
  assert.deepEqual(states.meaning.completedStages,['recognise']);
});

test('a word can traverse Recognise through Mastery using the canonical evidence thresholds', () => {
  let progress = freshPathwayProgress();

  progress = applyPathwayAttempt(progress, cleanAttempt('recognise',1));
  progress = applyPathwayAttempt(progress, cleanAttempt('recognise',2));
  assert.equal(currentPathwayStage(progress),'match');

  progress = applyPathwayAttempt(progress, cleanAttempt('match',1));
  progress = applyPathwayAttempt(progress, cleanAttempt('match',2));
  assert.equal(currentPathwayStage(progress),'apply');

  progress = applyPathwayAttempt(progress, cleanAttempt('apply',1,{ contextSensitive:true }));
  progress = applyPathwayAttempt(progress, cleanAttempt('apply',2,{ contextSensitive:true }));
  assert.equal(currentPathwayStage(progress),'recall');

  progress = applyPathwayAttempt(progress, cleanAttempt('recall',1));
  progress = applyPathwayAttempt(progress, cleanAttempt('recall',2));
  assert.equal(currentPathwayStage(progress),'mastery');

  progress = applyPathwayAttempt(progress, cleanAttempt('mastery',1));
  progress = applyPathwayAttempt(progress, cleanAttempt('mastery',2));
  progress = applyPathwayAttempt(progress, { ...cleanAttempt('mastery',3), firstAttempt:false, retryUsed:true, supportLevel:'light' });
  assert.equal(progress.stages.mastery.completed,true);
  assert.equal(currentPathwayStage(progress),'mastery');
});

test('fixed pathway sessions select only words at the displayed earned rung', () => {
  let progressed = freshPathwayProgress();
  progressed = applyPathwayAttempt(progressed, cleanAttempt('recognise',1));
  progressed = applyPathwayAttempt(progressed, cleanAttempt('recognise',2));
  const unitMastery = { 'u1-a':progressRow(progressed), 'u1-b':progressRow(freshPathwayProgress()) };
  const targets = targetsForPathwayStage({ pathwayId:'meaning', stageId:'match', occurrences, unitMastery, globalMastery:{} });
  assert.deepEqual(targets.map(target => target.occurrenceId),['u1-a']);
});

test('question progress helper renders stage and current-set progress without retired clean-success targets', async () => {
  const url = new URL('../src/vocabulary/pathway-question-progress.js', import.meta.url);
  assert.equal(fs.existsSync(url), true, 'pathway question progress helper should exist');
  const { renderPathwayQuestionProgress } = await import(url);
  const html = renderPathwayQuestionProgress({ pathwayId:'meaning', stageId:'match', current:4, total:10 });
  assert.match(html,/Meaning/);
  assert.match(html,/Match · Stage 2 of 5/);
  assert.match(html,/Question 4 of 10/);
  assert.match(html,/aria-valuenow="4"[^>]*aria-valuemax="10"/);
  assert.doesNotMatch(html,/8 clean|clean successes/i);
});

test('live vocabulary page loads the pathway question progress enhancer', () => {
  const html = fs.readFileSync(new URL('../vocabulary.html', import.meta.url),'utf8');
  assert.match(html,/src\/vocabulary\/pathway-question-progress\.js/);
  const css = fs.readFileSync(new URL('../vocabulary-pathway-progress.css', import.meta.url),'utf8');
  assert.match(css,/\.vocab-set-progress/);
  assert.match(css,/--set-progress/);
});

test('normal client progression no longer reads or mirrors the retired unit journey', () => {
  const source = fs.readFileSync(new URL('../src/vocabulary/data.js', import.meta.url),'utf8');
  assert.doesNotMatch(source,/vocabulary_unit_pathway_journey/);
  assert.doesNotMatch(source,/loadPathwayJourney/);
  assert.doesNotMatch(source,/registerPathwayJourney/);
  assert.doesNotMatch(source,/applyRegisteredPathwayJourneyAttempt/);
});

test('pathway launch intersects planner coverage with real word-stage eligibility', () => {
  const source = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url),'utf8');
  assert.match(source,/targetsForPathwayStage/);
  assert.match(source,/stageTargetIds/);
  assert.match(source,/\.filter\(target => stageTargetIds\.has\(target\.occurrenceId\)\)/);
});

test('retirement migration disables the old activity-event journey trigger without deleting evidence', () => {
  const url = new URL('../supabase/migrations/20261019023000_retire_vocabulary_pathway_journey_trigger.sql', import.meta.url);
  assert.equal(fs.existsSync(url),true,'journey trigger retirement migration should exist');
  const source = fs.readFileSync(url,'utf8');
  assert.match(source,/drop trigger if exists trg_record_vocabulary_pathway_journey/i);
  assert.match(source,/drop function if exists public\.record_vocabulary_pathway_journey_from_event/i);
  assert.doesNotMatch(source,/drop table/i);
  assert.doesNotMatch(source,/delete\s+from\s+public\.vocabulary_unit_pathway_journey/i);
});

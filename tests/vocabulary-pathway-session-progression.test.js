import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildUnitPathwayStates } from '../src/vocabulary/pathway-view-model.js';

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
const weakWordMastery = {
  'u1-a':{ contextualEvidence:{ pathwayProgress:{ meaning:{ stages:{ recognise:{ completed:false } } } } } },
  'u1-b':{ contextualEvidence:{ pathwayProgress:{ meaning:{ completedStages:['recognise'], stages:{ recognise:{ completed:true }, match:{ completed:false } } } } }
};

test('unit pathway stage follows the persistent journey, not the weakest individual word', () => {
  const states = buildUnitPathwayStates({
    occurrences,
    unitMastery:weakWordMastery,
    globalMastery:{},
    coverageByPathway:coverageFor('meaning',['u1-a','u1-b']),
    journeyByPathway:{ meaning:{ currentStage:'match', completedStages:['recognise'], stageAttempts:0, stageCleanSuccesses:0 } }
  });
  assert.equal(states.meaning.currentStage,'match');
  assert.deepEqual(states.meaning.completedStages,['recognise']);
});

test('registered unit journey is used by normal app calls that do not pass journey explicitly', async () => {
  const url = new URL('../src/vocabulary/pathway-journey-store.js', import.meta.url);
  assert.equal(fs.existsSync(url), true, 'pathway journey store should exist');
  const { registerPathwayJourney, clearPathwayJourney } = await import(url);
  registerPathwayJourney(1,[{ pathway_id:'meaning', current_stage:'apply', completed_stages:['recognise','match'], stage_attempts:0, stage_clean_successes:0 }]);
  const states = buildUnitPathwayStates({
    occurrences,
    unitMastery:weakWordMastery,
    globalMastery:{},
    coverageByPathway:coverageFor('meaning',['u1-a','u1-b'])
  });
  assert.equal(states.meaning.currentStage,'apply');
  clearPathwayJourney(1);
});

test('question progress helper renders stage and set progress together', async () => {
  const url = new URL('../src/vocabulary/pathway-question-progress.js', import.meta.url);
  assert.equal(fs.existsSync(url), true, 'pathway question progress helper should exist');
  const { renderPathwayQuestionProgress } = await import(url);
  const html = renderPathwayQuestionProgress({ pathwayId:'meaning', stageId:'recognise', current:1, total:10 });
  assert.match(html,/Meaning/);
  assert.match(html,/Recognise · Stage 1 of 5/);
  assert.match(html,/Question 1 of 10/);
  assert.match(html,/aria-valuenow="1"[^>]*aria-valuemax="10"/);
});

test('live vocabulary page loads the pathway question progress enhancer', () => {
  const html = fs.readFileSync(new URL('../vocabulary.html', import.meta.url),'utf8');
  assert.match(html,/src\/vocabulary\/pathway-question-progress\.js/);
  const css = fs.readFileSync(new URL('../vocabulary-pathway-progress.css', import.meta.url),'utf8');
  assert.match(css,/\.vocab-set-progress/);
  assert.match(css,/--set-progress/);
});

test('client loads persistent unit pathway journey independently of per-word mastery', () => {
  const source = fs.readFileSync(new URL('../src/vocabulary/data.js', import.meta.url),'utf8');
  assert.match(source,/loadPathwayJourney/);
  assert.match(source,/vocabulary_unit_pathway_journey/);
  assert.match(source,/registerPathwayJourney/);
});

test('database trigger advances pathway journey from authoritative scored attempt events', () => {
  const source = fs.readFileSync(new URL('../supabase/migrations/20261018140000_vocabulary_pathway_journey.sql', import.meta.url),'utf8');
  assert.match(source,/activity_events/i);
  assert.match(source,/create trigger/i);
  assert.match(source,/NEW\.strong/i);
  assert.match(source,/attempt_number/i);
  assert.match(source,/served_pathway_stage/i);
  assert.match(source,/stage_clean_successes/i);
});

test('journey advances only after a 10-question window with at least 8 clean successes', async () => {
  const url = new URL('../supabase/functions/_shared/vocabulary-pathway-journey.js', import.meta.url);
  assert.equal(fs.existsSync(url), true, 'pathway journey module should exist');
  const { freshPathwayJourney, applyPathwayJourneyAttempt } = await import(url);
  let journey = freshPathwayJourney();
  for (let i = 0; i < 9; i += 1) journey = applyPathwayJourneyAttempt(journey, { stageId:'recognise', servedStageId:'recognise', firstAttempt:true, correct:i < 8, supportLevel:'none' });
  assert.equal(journey.currentStage,'recognise');
  assert.equal(journey.stageAttempts,9);
  journey = applyPathwayJourneyAttempt(journey, { stageId:'recognise', servedStageId:'recognise', firstAttempt:true, correct:false, supportLevel:'none' });
  assert.equal(journey.currentStage,'match');
  assert.deepEqual(journey.completedStages,['recognise']);
  assert.equal(journey.stageAttempts,0);
  assert.equal(journey.stageCleanSuccesses,0);
});

test('failed 10-question window resets without moving the pathway backwards or forwards', async () => {
  const url = new URL('../supabase/functions/_shared/vocabulary-pathway-journey.js', import.meta.url);
  const { freshPathwayJourney, applyPathwayJourneyAttempt } = await import(url);
  let journey = freshPathwayJourney({ currentStage:'apply', completedStages:['recognise','match'] });
  for (let i = 0; i < 10; i += 1) journey = applyPathwayJourneyAttempt(journey, { stageId:'apply', servedStageId:'apply', firstAttempt:true, correct:i < 7, supportLevel:'none' });
  assert.equal(journey.currentStage,'apply');
  assert.deepEqual(journey.completedStages,['recognise','match']);
  assert.equal(journey.stageAttempts,0);
  assert.equal(journey.stageCleanSuccesses,0);
});

test('retry and lower-stage support do not consume a pathway journey question', async () => {
  const url = new URL('../supabase/functions/_shared/vocabulary-pathway-journey.js', import.meta.url);
  const { freshPathwayJourney, applyPathwayJourneyAttempt } = await import(url);
  let journey = freshPathwayJourney({ currentStage:'recall', completedStages:['recognise','match','apply'] });
  journey = applyPathwayJourneyAttempt(journey, { stageId:'recall', servedStageId:'recall', firstAttempt:false, retryUsed:true, correct:true, supportLevel:'light' });
  journey = applyPathwayJourneyAttempt(journey, { stageId:'recall', servedStageId:'apply', firstAttempt:true, correct:true, supportLevel:'none' });
  assert.equal(journey.stageAttempts,0);
  assert.equal(journey.stageCleanSuccesses,0);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildUnitPathwayStates } from '../src/vocabulary/pathway-view-model.js';
import { renderVocabularyQuestion } from '../src/vocabulary/views.js';

const PATHWAY_IDS = ['meaning','context','word_families','paraphrasing','precision_use','spelling_recall'];
function root() { return { innerHTML:'' }; }
function coverageFor(pathwayId, ids) {
  return Object.fromEntries(PATHWAY_IDS.map(id => [id, {
    available:id === pathwayId,
    occurrenceIds:id === pathwayId ? ids : [],
    totalOccurrences:ids.length
  }]));
}

test('unit pathway stage follows the persistent journey, not the weakest individual word', () => {
  const occurrences = [
    { occurrenceId:'u1-a', vocabularyId:'a', unitNumber:1 },
    { occurrenceId:'u1-b', vocabularyId:'b', unitNumber:1 }
  ];
  const unitMastery = {
    'u1-a':{ contextualEvidence:{ pathwayProgress:{ meaning:{ stages:{ recognise:{ completed:false } } } } } },
    'u1-b':{ contextualEvidence:{ pathwayProgress:{ meaning:{ completedStages:['recognise'], stages:{ recognise:{ completed:true }, match:{ completed:false } } } } }
  };
  const states = buildUnitPathwayStates({
    occurrences,
    unitMastery,
    globalMastery:{},
    coverageByPathway:coverageFor('meaning',['u1-a','u1-b']),
    journeyByPathway:{ meaning:{ currentStage:'match', completedStages:['recognise'], stageAttempts:0, stageCleanSuccesses:0 } }
  });
  assert.equal(states.meaning.currentStage,'match');
  assert.deepEqual(states.meaning.completedStages,['recognise']);
});

test('pathway question shows both stage progress and question-set progress', () => {
  const target = root();
  renderVocabularyQuestion(target, {
    unitNumber:1,
    unitTitle:'Sports and Free Time',
    question:{ type:'meaning_match', prompt:'What does leisure mean?', options:['free time','work'], responseMode:'choice' },
    term:'leisure',
    sessionLabel:'0 / 10 activities',
    pathwayId:'meaning',
    pathwayStage:'recognise',
    setProgress:{ current:1, total:10 }
  });
  assert.match(target.innerHTML,/data-pathway-session-progress="meaning"/);
  assert.match(target.innerHTML,/Recognise · Stage 1 of 5/);
  assert.match(target.innerHTML,/Question 1 of 10/);
  assert.match(target.innerHTML,/role="progressbar"[^>]*aria-valuenow="1"[^>]*aria-valuemax="10"/);
});

test('app passes fixed pathway identity and 10-question progress into the question renderer', () => {
  const source = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url),'utf8');
  assert.match(source,/pathwayId\s*:\s*state\.pathwayId/);
  assert.match(source,/pathwayStage\s*:\s*state\.pathwayStage/);
  assert.match(source,/setProgress\s*:/);
});

test('client loads persistent unit pathway journey independently of per-word mastery', () => {
  const source = fs.readFileSync(new URL('../src/vocabulary/data.js', import.meta.url),'utf8');
  assert.match(source,/loadPathwayJourney/);
  assert.match(source,/vocabulary_unit_pathway_journey/);
});

test('server attempt action updates persistent pathway journey from authoritative marking', () => {
  const source = fs.readFileSync(new URL('../supabase/functions/vocabulary-attempt-action/index.ts', import.meta.url),'utf8');
  assert.match(source,/vocabulary_unit_pathway_journey/);
  assert.match(source,/applyPathwayJourneyAttempt/);
  assert.match(source,/stage_clean_successes/);
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
  assert.equal(fs.existsSync(url), true, 'pathway journey module should exist');
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
  assert.equal(fs.existsSync(url), true, 'pathway journey module should exist');
  const { freshPathwayJourney, applyPathwayJourneyAttempt } = await import(url);
  let journey = freshPathwayJourney({ currentStage:'recall', completedStages:['recognise','match','apply'] });
  journey = applyPathwayJourneyAttempt(journey, { stageId:'recall', servedStageId:'recall', firstAttempt:false, retryUsed:true, correct:true, supportLevel:'light' });
  journey = applyPathwayJourneyAttempt(journey, { stageId:'recall', servedStageId:'apply', firstAttempt:true, correct:true, supportLevel:'none' });
  assert.equal(journey.stageAttempts,0);
  assert.equal(journey.stageCleanSuccesses,0);
});

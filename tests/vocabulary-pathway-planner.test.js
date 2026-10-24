import test from 'node:test';
import assert from 'node:assert/strict';
import {
  selectPathwayStageActivity,
  planPathwayQuestion
} from '../src/vocabulary/pathway-planner.js';

test('Meaning Recognise stays inside its fixed stage activity set', () => {
  const plan = selectPathwayStageActivity({
    pathwayId:'meaning', stageId:'recognise',
    availableActivityTypes:['rewrite_idea','definition_to_word','meaning_match'],
    seed:'meaning-recognise'
  });
  assert.ok(['definition_to_word','meaning_match'].includes(plan.activityType));
  assert.notEqual(plan.activityType,'rewrite_idea');
});

test('Paraphrasing Apply never jumps to spelling or production Mastery', () => {
  const plan = selectPathwayStageActivity({
    pathwayId:'paraphrasing', stageId:'apply',
    availableActivityTypes:['spell_word','build_paraphrase','rewrite_idea'],
    seed:'para-apply'
  });
  assert.equal(plan.activityType,'build_paraphrase');
});

test('requested fixed stage fails closed instead of jumping when no mapped activity is available', () => {
  assert.throws(() => selectPathwayStageActivity({
    pathwayId:'context', stageId:'recall', availableActivityTypes:['choose_word_sentence','drag_word_sentence']
  }), /No suitable curated activity/);
});

test('support fallback may use the immediately previous stage but preserves the learner current stage', () => {
  const plan = selectPathwayStageActivity({
    pathwayId:'context', stageId:'recall',
    availableActivityTypes:['drag_word_sentence','type_missing_word'],
    supportState:{ struggling:true },
    seed:'support'
  });
  assert.equal(plan.learnerStage,'recall');
  assert.equal(plan.servedStage,'apply');
  assert.equal(plan.activityType,'drag_word_sentence');
  assert.equal(plan.supportLevel,'light');
});

test('support fallback does not descend more than one stage', () => {
  assert.throws(() => selectPathwayStageActivity({
    pathwayId:'context', stageId:'recall',
    availableActivityTypes:['choose_word_sentence'],
    supportState:{ struggling:true }
  }), /No suitable curated activity/);
});

test('recent activity is avoided when another valid activity exists in the same fixed stage', () => {
  const plan = selectPathwayStageActivity({
    pathwayId:'meaning', stageId:'recognise',
    availableActivityTypes:['definition_to_word','meaning_match'],
    recentActivities:['definition_to_word'],
    seed:'same-stage-variety'
  });
  assert.equal(plan.activityType,'meaning_match');
});

test('planner rejects invalid pathway or stage identifiers', () => {
  assert.throws(() => selectPathwayStageActivity({pathwayId:'random',stageId:'recognise',availableActivityTypes:['meaning_match']}), /Unknown vocabulary pathway/);
  assert.throws(() => selectPathwayStageActivity({pathwayId:'meaning',stageId:'random',availableActivityTypes:['meaning_match']}), /Unknown vocabulary pathway stage/);
});

test('full question planner uses only the selected fixed-stage type', () => {
  const target = { occurrenceId:'occ-1', vocabularyId:'v1', senseId:'s1', unitNumber:1 };
  const content = {
    occurrences:[target],
    items:[
      {vocabularyId:'v1',term:'urge',partOfSpeech:'verb',coreMeaning:'strongly encourage',senses:[{senseId:'s1',meaning:'strongly encourage'}]},
      {vocabularyId:'v2',term:'avoid',partOfSpeech:'verb',coreMeaning:'stay away from',senses:[{senseId:'s2',meaning:'stay away from'}]},
      {vocabularyId:'v3',term:'reduce',partOfSpeech:'verb',coreMeaning:'make smaller',senses:[{senseId:'s3',meaning:'make smaller'}]},
      {vocabularyId:'v4',term:'maintain',partOfSpeech:'verb',coreMeaning:'keep at same level',senses:[{senseId:'s4',meaning:'keep at same level'}]}
    ],
    contexts:[], activities:[]
  };
  content.itemsById = Object.fromEntries(content.items.map(item => [item.vocabularyId,item]));
  content.contextsByOccurrence = {'occ-1':[]};
  const built = planPathwayQuestion({pathwayId:'meaning',stageId:'recognise',content,target,seed:'build-one'});
  assert.equal(built.plan.pathwayId,'meaning');
  assert.equal(built.plan.learnerStage,'recognise');
  assert.ok(['definition_to_word'].includes(built.question.type));
});

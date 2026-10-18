import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPathwayAnalytics } from '../src/vocabulary/analytics.js';
import { pathwayCoordinatesForQuestionType } from '../src/vocabulary/skill-profile.js';
import { buildWordPathwayStates } from '../src/vocabulary/pathway-view-model.js';
import { normalizeTeacherVocabularyData } from '../src/vocabulary/teacher-data.js';
import { renderVocabularyWords } from '../src/vocabulary/views.js';

const stageIds = ['recognise','match','apply','recall','mastery'];
function progress(currentStage, completed = []) {
  return {
    currentStage,
    stages:Object.fromEntries(stageIds.map(id => [id,{ completed:completed.includes(id), needsPractice:false }]))
  };
}
function root() { return { innerHTML:'' }; }

test('one word can expose six independent pathway states without collapsing to one overall stage', () => {
  const occurrence = { occurrenceId:'o1', vocabularyId:'v1' };
  const unitMastery = {
    o1:{ contextualEvidence:{ pathwayProgress:{
      meaning:progress('mastery',['recognise','match','apply','recall','mastery']),
      context:progress('recall',['recognise','match','apply']),
      word_families:progress('apply',['recognise','match']),
      paraphrasing:progress('match',['recognise']),
      precision_use:progress('recognise',[]),
      spelling_recall:progress('apply',['recognise','match'])
    } } }
  };
  const states = buildWordPathwayStates({ occurrence, unitMastery, globalMastery:{} });
  assert.equal(states.meaning.currentStage,'mastery');
  assert.equal(states.context.currentStage,'recall');
  assert.equal(states.word_families.currentStage,'apply');
  assert.equal(states.paraphrasing.currentStage,'match');
  assert.equal(states.precision_use.currentStage,'recognise');
  assert.equal(states.spelling_recall.currentStage,'apply');
});

test('all-words view renders all six pathway states for each word', () => {
  const target = root();
  renderVocabularyWords(target, {
    unitNumber:1,
    unitTitle:'Sports and Free Time',
    words:[{
      term:'leisure', status:'building', learningStage:'developing',
      pathways:{
        meaning:{ currentStage:'mastery' }, context:{ currentStage:'recall' }, word_families:{ currentStage:'apply' },
        paraphrasing:{ currentStage:'match' }, precision_use:{ currentStage:'recognise' }, spelling_recall:{ currentStage:'apply' }
      }
    }]
  });
  for (const label of ['Meaning','Context','Word Families','Paraphrasing','Precision &amp; Use','Spelling &amp; Recall']) assert.match(target.innerHTML,new RegExp(label));
  assert.match(target.innerHTML,/data-word-pathway="meaning"[^>]*>[\s\S]*Mastery/);
  assert.match(target.innerHTML,/data-word-pathway="context"[^>]*>[\s\S]*Recall/);
});

test('teacher normalization retains privacy-safe unit pathway progress', () => {
  const normalized = normalizeTeacherVocabularyData({
    profiles:[{ id:'s1', display_name:'Student One', role:'student' }],
    memberships:[{ student_id:'s1', class_id:'c1', ended_at:null }],
    classes:[{ id:'c1', class_name:'Class 1' }],
    items:[{ vocabulary_id:'v1', term:'leisure' }],
    occurrences:[{ occurrence_id:'o1', vocabulary_id:'v1', unit_number:1, unit_title:'Sports and Free Time' }],
    mastery:[{ student_id:'s1', vocabulary_id:'v1', status:'building', strand_evidence:{} }],
    unitMastery:[{ student_id:'s1', occurrence_id:'o1', status:'building', contextual_evidence:{ pathwayProgress:{ meaning:progress('apply',['recognise','match']) } } }],
    activity:[]
  });
  assert.equal(normalized.classes[0].unitMastery[0].occurrenceId,'o1');
  assert.equal(normalized.classes[0].unitMastery[0].contextualEvidence.pathwayProgress.meaning.currentStage,'apply');
});

test('class pathway analytics builds compact student × pathway and word × pathway summaries', () => {
  const result = buildPathwayAnalytics({
    students:[{ id:'s1', displayName:'Student One' },{ id:'s2', displayName:'Student Two' }],
    targets:[{ vocabularyId:'v1', term:'leisure' }],
    occurrences:[{ occurrenceId:'o1', vocabularyId:'v1', unitNumber:1, unitTitle:'Sports and Free Time' }],
    globalMastery:[
      { studentId:'s1', vocabularyId:'v1', status:'building', strandEvidence:{} },
      { studentId:'s2', vocabularyId:'v1', status:'new', strandEvidence:{} }
    ],
    unitMastery:[
      { studentId:'s1', occurrenceId:'o1', status:'building', contextualEvidence:{ pathwayProgress:{ meaning:progress('apply',['recognise','match']), context:progress('match',['recognise']) } } }
    ]
  });
  assert.equal(result.studentRows.length,2);
  assert.equal(result.wordRows.length,1);
  assert.deepEqual(Object.keys(result.studentRows[0].pathways),['meaning','context','word_families','paraphrasing','precision_use','spelling_recall']);
  assert.deepEqual(Object.keys(result.wordRows[0].pathways),['meaning','context','word_families','paraphrasing','precision_use','spelling_recall']);
});

test('activity types map to authoritative pathway/stage analytics coordinates without treating interaction variants as new skills', () => {
  assert.deepEqual(pathwayCoordinatesForQuestionType('meaning_match'),[{ pathwayId:'meaning', stageId:'recognise' }]);
  assert.deepEqual(pathwayCoordinatesForQuestionType('drag_word_definition'),[{ pathwayId:'meaning', stageId:'apply' }]);
  assert.deepEqual(pathwayCoordinatesForQuestionType('spell_word'),[
    { pathwayId:'spelling_recall', stageId:'recall' }
  ]);
  assert.deepEqual(pathwayCoordinatesForQuestionType('spell_in_context'),[
    { pathwayId:'spelling_recall', stageId:'mastery' }
  ]);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildClassPathwayAnalytics,
  buildWordPathwayAnalytics,
  pathwayCoordinatesForQuestionType
} from '../src/vocabulary/pathway-analytics.js';

function progress(currentStage, completedStages = [], needsPractice = false) {
  return { currentStage, completedStages, needsPractice };
}

test('class pathway analytics exposes all six pathways per student', () => {
  const result = buildClassPathwayAnalytics({
    students:[{ id:'s1', displayName:'A' },{ id:'s2', displayName:'B' }],
    occurrences:[{ occurrenceId:'o1', vocabularyId:'v1', term:'leisure' }],
    unitMastery:[
      { studentId:'s1', occurrenceId:'o1', status:'building', contextualEvidence:{ pathwayProgress:{ meaning:progress('apply',['recognise','match']), context:progress('match',['recognise']) } } }
    ]
  });
  assert.equal(result.studentRows.length,2);
  assert.equal(result.wordRows.length,1);
  assert.deepEqual(Object.keys(result.studentRows[0].pathways),['meaning','context','word_families','paraphrasing','precision_use','spelling_recall']);
  assert.deepEqual(Object.keys(result.wordRows[0].pathways),['meaning','context','word_families','paraphrasing','precision_use','spelling_recall']);
});

test('word pathway analytics preserves distinct pathway states across students', () => {
  const result = buildWordPathwayAnalytics({
    vocabularyId:'v1',
    occurrenceIds:['o1'],
    students:[{ id:'s1' },{ id:'s2' }],
    unitMastery:[
      { studentId:'s1', occurrenceId:'o1', contextualEvidence:{ pathwayProgress:{ meaning:progress('recall',['recognise','match','apply']) } } },
      { studentId:'s2', occurrenceId:'o1', contextualEvidence:{ pathwayProgress:{ meaning:progress('match',['recognise']) } } }
    ]
  });
  assert.equal(result.pathways.meaning.recall,1);
  assert.equal(result.pathways.meaning.match,1);
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

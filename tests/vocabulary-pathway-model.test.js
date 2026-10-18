import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VOCABULARY_PATHWAYS,
  PATHWAY_STAGES,
  pathwayDefinition,
  activityTypesForPathwayStage,
  derivePathwayPlacement,
  deriveOverallLearningStageFromPathways
} from '../src/vocabulary/pathway-model.js';

const expectedPathways = [
  ['meaning','Meaning'],
  ['context','Context'],
  ['word_families','Word Families'],
  ['paraphrasing','Paraphrasing'],
  ['precision_use','Precision & Use'],
  ['spelling_recall','Spelling & Recall']
];

const expectedStages = [
  ['recognise','Recognise'],
  ['match','Match'],
  ['apply','Apply'],
  ['recall','Recall'],
  ['mastery','Mastery']
];

test('exports exactly six fixed student-facing pathways', () => {
  assert.deepEqual(VOCABULARY_PATHWAYS.map(({ id, label }) => [id,label]), expectedPathways);
});

test('exports the five ordered progression stages', () => {
  assert.deepEqual(PATHWAY_STAGES.map(({ id, label }) => [id,label]), expectedStages);
});

test('every pathway defines all five stages in the same order', () => {
  for (const [pathwayId] of expectedPathways) {
    const definition = pathwayDefinition(pathwayId);
    assert.ok(definition, pathwayId);
    assert.deepEqual(definition.stages.map(stage => stage.id), expectedStages.map(([id]) => id));
  }
});

test('uses explicit activity mappings for the approved ladders', () => {
  assert.ok(activityTypesForPathwayStage('meaning','recognise').includes('definition_to_word'));
  assert.ok(activityTypesForPathwayStage('meaning','match').includes('word_definition_match'));
  assert.ok(activityTypesForPathwayStage('context','apply').includes('drag_word_sentence'));
  assert.ok(activityTypesForPathwayStage('context','recall').includes('type_missing_word'));
  assert.ok(activityTypesForPathwayStage('word_families','apply').includes('word_family_choice'));
  assert.ok(activityTypesForPathwayStage('paraphrasing','apply').includes('build_paraphrase'));
  assert.ok(activityTypesForPathwayStage('paraphrasing','mastery').includes('rewrite_idea'));
  assert.ok(activityTypesForPathwayStage('precision_use','apply').includes('improve_vocabulary'));
  assert.ok(activityTypesForPathwayStage('spelling_recall','recall').includes('spell_word'));
  assert.equal(activityTypesForPathwayStage('meaning','recognise').includes('rewrite_idea'), false);
});

test('places brand-new learning at Recognise', () => {
  assert.equal(derivePathwayPlacement({ pathwayId:'meaning', legacyMastery:{ status:'new' } }), 'recognise');
});

test('legacy recognition evidence can place above Recognise but not at Mastery', () => {
  const placement = derivePathwayPlacement({
    pathwayId:'meaning',
    legacyMastery:{ status:'building', strandEvidence:{ meaning:6, recognition:6, context:0, paraphrasing:0, production:0 } }
  });
  assert.ok(['match','apply'].includes(placement));
});

test('independent contextual retrieval can defensibly place at Recall', () => {
  const placement = derivePathwayPlacement({
    pathwayId:'context',
    legacyMastery:{ status:'secure', strandEvidence:{ meaning:5, recognition:5, context:7, paraphrasing:0, production:0 }, unscaffoldedProductions:1 }
  });
  assert.equal(placement, 'recall');
});

test('old overall mastered status alone does not grant pathway Mastery', () => {
  const placement = derivePathwayPlacement({ pathwayId:'meaning', legacyMastery:{ status:'mastered' } });
  assert.notEqual(placement, 'mastery');
});

test('authoritative pathway evidence wins over conservative legacy placement', () => {
  const placement = derivePathwayPlacement({
    pathwayId:'meaning',
    legacyMastery:{ status:'mastered' },
    pathwayEvidence:{ currentStage:'recall', completedStages:['recognise','match','apply'] }
  });
  assert.equal(placement, 'recall');
});

test('overall summary requires breadth across pathways', () => {
  assert.equal(deriveOverallLearningStageFromPathways({ meaning:'mastery' }), 'building');
  assert.equal(deriveOverallLearningStageFromPathways({ meaning:'apply', context:'apply', word_families:'match' }), 'developing');
  assert.equal(deriveOverallLearningStageFromPathways({ meaning:'mastery', context:'mastery', word_families:'recall', paraphrasing:'recall', precision_use:'recall', spelling_recall:'mastery' }), 'mastered');
});

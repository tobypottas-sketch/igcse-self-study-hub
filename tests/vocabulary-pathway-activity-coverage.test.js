import test from 'node:test';
import assert from 'node:assert/strict';
import { VOCABULARY_PATHWAYS, PATHWAY_STAGES, activityTypesForPathwayStage } from '../src/vocabulary/pathway-model.js';
import { activityDefinition, isActivityLive } from '../src/vocabulary/activity-catalogue.js';

test('every one of the thirty pathway stages has at least one live activity type', () => {
  for (const pathway of VOCABULARY_PATHWAYS) {
    for (const stage of PATHWAY_STAGES) {
      const types = activityTypesForPathwayStage(pathway.id,stage.id);
      assert.ok(types.length > 0, `${pathway.label} ${stage.label} has no activity type`);
      for (const type of types) {
        assert.ok(activityDefinition(type), `${pathway.id}/${stage.id} references missing ${type}`);
        assert.equal(isActivityLive(type),true,`${type} must be live`);
      }
    }
  }
});

test('missing approved rungs use dedicated operations rather than disguising unrelated tasks', () => {
  assert.deepEqual(activityTypesForPathwayStage('meaning','recall'),['type_word_from_definition']);
  assert.ok(activityTypesForPathwayStage('context','match').includes('context_sentence_match'));
  assert.ok(activityTypesForPathwayStage('word_families','match').includes('word_family_match'));
  assert.ok(activityTypesForPathwayStage('precision_use','match').includes('precision_match'));
  assert.ok(activityTypesForPathwayStage('spelling_recall','recognise').includes('spelling_choice'));
  assert.ok(activityTypesForPathwayStage('spelling_recall','match').includes('spelling_cue_match'));
  assert.ok(activityTypesForPathwayStage('spelling_recall','apply').includes('spelling_rebuild'));
});

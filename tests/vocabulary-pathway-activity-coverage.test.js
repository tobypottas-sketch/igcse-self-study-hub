import test from 'node:test';
import assert from 'node:assert/strict';
import { VOCABULARY_PATHWAYS, PATHWAY_STAGES, activityTypesForPathwayStage } from '../src/vocabulary/pathway-model.js';
import { activityDefinition, isActivityLive } from '../src/vocabulary/activity-catalogue.js';

const INTENTIONALLY_WITHHELD = new Set(); // every rung of every pathway now has a live activity

test('every declared live pathway stage has a valid live activity type, with incomplete rungs explicitly withheld', () => {
  for (const pathway of VOCABULARY_PATHWAYS) {
    for (const stage of PATHWAY_STAGES) {
      const coordinate = `${pathway.id}:${stage.id}`;
      const types = activityTypesForPathwayStage(pathway.id,stage.id);
      if (INTENTIONALLY_WITHHELD.has(coordinate)) {
        assert.deepEqual(types,[],`${pathway.label} ${stage.label} should remain withheld until a genuine activity exists`);
        continue;
      }
      assert.ok(types.length > 0, `${pathway.label} ${stage.label} has no activity type and is not explicitly withheld`);
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
  assert.deepEqual(activityTypesForPathwayStage('precision_use','mastery'),['upgrade_passage'],'Precision Mastery is an unsupported typed passage upgrade');
  assert.deepEqual(activityTypesForPathwayStage('precision_use','apply'),['improve_vocabulary']);
  assert.deepEqual(activityTypesForPathwayStage('precision_use','recall'),['precision_type_cued']);
  assert.ok(activityTypesForPathwayStage('spelling_recall','recognise').includes('spelling_choice'));
  assert.ok(activityTypesForPathwayStage('spelling_recall','match').includes('spot_the_error'));
  assert.ok(!activityTypesForPathwayStage('spelling_recall','match').includes('spelling_cue_match'),'retired');
  assert.ok(activityTypesForPathwayStage('spelling_recall','apply').includes('spelling_rebuild'));
});

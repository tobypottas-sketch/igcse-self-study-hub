import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { VOCABULARY_PATHWAYS, PATHWAY_STAGES, activityTypesForPathwayStage } from '../src/vocabulary/pathway-model.js';
import { eligibleTargetsForPathwayStage } from '../src/vocabulary/pathway-planner.js';

function contentForPlanner(unit) {
  const content = {
    occurrences:unit.occurrences,
    items:unit.items,
    contexts:unit.contexts,
    activities:unit.activities,
    itemsById:Object.fromEntries(unit.items.map(item => [item.vocabularyId,item])),
    contextsByOccurrence:{}
  };
  for (const ctx of unit.contexts) (content.contextsByOccurrence[ctx.occurrenceId] ??= []).push(ctx);
  return content;
}

const content = contentForPlanner(unit1);

test('diagnostic: report Unit 1 buildable counts while distinguishing intentionally withheld rungs', () => {
  const counts = {};
  for (const pathway of VOCABULARY_PATHWAYS) {
    counts[pathway.id] = {};
    let cohort = new Set(content.occurrences.map(row => row.occurrenceId));
    let pathwayWithheld = false;
    for (const stage of PATHWAY_STAGES) {
      const mappedTypes = activityTypesForPathwayStage(pathway.id,stage.id);
      const withheld = mappedTypes.length === 0;
      const eligible = withheld ? [] : eligibleTargetsForPathwayStage({ pathwayId:pathway.id, stageId:stage.id, content, masteryByVocabularyId:{}, seed:`diagnostic:${pathway.id}:${stage.id}` });
      counts[pathway.id][stage.id] = { buildable:eligible.length, withheld };
      if (withheld) {
        pathwayWithheld = true;
        cohort.clear();
        continue;
      }
      const ids = new Set(eligible.map(row => row.occurrenceId));
      cohort = new Set([...cohort].filter(id => ids.has(id)));
      assert.ok(eligible.length > 0, `${pathway.id}/${stage.id} has zero buildable Unit 1 targets but is not explicitly withheld`);
    }
    counts[pathway.id].allStages = pathwayWithheld ? 0 : cohort.size;
  }
  console.log('UNIT1_PATHWAY_COUNTS', JSON.stringify(counts));

  assert.equal(counts.precision_use.mastery.withheld,false,'Precision Mastery is live (typed precision production, no clue)');
  for (const pathway of VOCABULARY_PATHWAYS) {
    assert.ok(counts[pathway.id].allStages > 0, `${pathway.id} needs at least one target buildable through every declared rung`);
  }
});

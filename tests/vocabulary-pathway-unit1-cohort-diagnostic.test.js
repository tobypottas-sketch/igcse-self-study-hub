import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { VOCABULARY_PATHWAYS, PATHWAY_STAGES } from '../src/vocabulary/pathway-model.js';
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

test('diagnostic: report real Unit 1 buildable counts for every fixed-pathway rung', () => {
  const counts = {};
  for (const pathway of VOCABULARY_PATHWAYS) {
    counts[pathway.id] = {};
    let cohort = new Set(content.occurrences.map(row => row.occurrenceId));
    for (const stage of PATHWAY_STAGES) {
      const eligible = eligibleTargetsForPathwayStage({ pathwayId:pathway.id, stageId:stage.id, content, masteryByVocabularyId:{}, seed:`diagnostic:${pathway.id}:${stage.id}` });
      counts[pathway.id][stage.id] = eligible.length;
      const ids = new Set(eligible.map(row => row.occurrenceId));
      cohort = new Set([...cohort].filter(id => ids.has(id)));
      assert.ok(eligible.length > 0, `${pathway.id}/${stage.id} has zero buildable Unit 1 targets`);
    }
    counts[pathway.id].allStages = cohort.size;
  }
  console.log('UNIT1_PATHWAY_COUNTS', JSON.stringify(counts));
  assert.ok(Object.values(counts).every(pathway => pathway.allStages > 0), 'every pathway needs at least one target buildable through all five stages');
});

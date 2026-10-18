import fs from 'node:fs';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { VOCABULARY_PATHWAYS, PATHWAY_STAGES } from '../src/vocabulary/pathway-model.js';
import { eligibleTargetsForPathwayStage } from '../src/vocabulary/pathway-planner.js';

const content = {
  occurrences:unit1.occurrences,
  items:unit1.items,
  contexts:unit1.contexts,
  activities:unit1.activities,
  itemsById:Object.fromEntries(unit1.items.map(item => [item.vocabularyId,item])),
  contextsByOccurrence:{}
};
for (const ctx of unit1.contexts) (content.contextsByOccurrence[ctx.occurrenceId] ??= []).push(ctx);

const counts = {};
for (const pathway of VOCABULARY_PATHWAYS) {
  counts[pathway.id] = {};
  let cohort = new Set(content.occurrences.map(row => row.occurrenceId));
  for (const stage of PATHWAY_STAGES) {
    const eligible = eligibleTargetsForPathwayStage({ pathwayId:pathway.id, stageId:stage.id, content, masteryByVocabularyId:{}, seed:`diagnostic:${pathway.id}:${stage.id}` });
    counts[pathway.id][stage.id] = eligible.length;
    const ids = new Set(eligible.map(row => row.occurrenceId));
    cohort = new Set([...cohort].filter(id => ids.has(id)));
  }
  counts[pathway.id].allStages = cohort.size;
}
fs.mkdirSync('diagnostics',{recursive:true});
fs.writeFileSync('diagnostics/unit1-pathway-counts.json',JSON.stringify(counts,null,2)+'\n');

import fs from 'node:fs';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { VOCABULARY_PATHWAYS, PATHWAY_STAGES, activityTypesForPathwayStage } from '../src/vocabulary/pathway-model.js';
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

function occurrenceId(row = {}) { return row.occurrenceId ?? row.occurrence_id; }
function vocabularyId(row = {}) { return row.vocabularyId ?? row.vocabulary_id; }
function termForOccurrence(row = {}) {
  const item = content.itemsById[vocabularyId(row)] ?? {};
  return item.term ?? vocabularyId(row) ?? occurrenceId(row);
}
function describe(rows = []) {
  return rows
    .map(row => ({ occurrenceId:occurrenceId(row), vocabularyId:vocabularyId(row), term:termForOccurrence(row) }))
    .sort((a,b) => String(a.term).localeCompare(String(b.term)));
}

const report = {};
for (const pathway of VOCABULARY_PATHWAYS) {
  const stageReport = {};
  let cohort = new Set(content.occurrences.map(occurrenceId));
  let pathwayWithheld = false;

  for (const stage of PATHWAY_STAGES) {
    const mappedTypes = activityTypesForPathwayStage(pathway.id,stage.id);
    const withheld = mappedTypes.length === 0;
    const eligible = withheld ? [] : eligibleTargetsForPathwayStage({
      pathwayId:pathway.id,
      stageId:stage.id,
      content,
      masteryByVocabularyId:{},
      seed:`diagnostic:${pathway.id}:${stage.id}`
    });
    const eligibleIds = new Set(eligible.map(occurrenceId));
    const missing = content.occurrences.filter(row => !eligibleIds.has(occurrenceId(row)));

    stageReport[stage.id] = {
      mappedTypes,
      withheld,
      buildableCount:eligible.length,
      eligible:describe(eligible),
      missing:describe(missing)
    };

    if (withheld) {
      pathwayWithheld = true;
      cohort.clear();
    } else {
      cohort = new Set([...cohort].filter(id => eligibleIds.has(id)));
    }
  }

  const allStagesRows = pathwayWithheld
    ? []
    : content.occurrences.filter(row => cohort.has(occurrenceId(row)));

  report[pathway.id] = {
    label:pathway.label,
    totalOccurrences:content.occurrences.length,
    allStagesCount:allStagesRows.length,
    allStages:describe(allStagesRows),
    stages:stageReport
  };
}

fs.mkdirSync('diagnostics',{recursive:true});
fs.writeFileSync('diagnostics/unit1-pathway-counts.json',JSON.stringify(report,null,2)+'\n');

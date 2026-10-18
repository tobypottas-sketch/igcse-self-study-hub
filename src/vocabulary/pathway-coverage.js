import { VOCABULARY_PATHWAYS, PATHWAY_STAGES, activityTypesForPathwayStage } from './pathway-model.js';
import { rawEligibleTargetsForPathwayStage } from './pathway-planner.js';

function array(value) { return Array.isArray(value) ? value : []; }

export function buildPathwayCoverage({ content, masteryByVocabularyId = {} } = {}) {
  const occurrences = array(content?.occurrences);
  const totalOccurrences = occurrences.length;
  const result = {};

  for (const pathway of VOCABULARY_PATHWAYS) {
    const withheldStages = PATHWAY_STAGES
      .filter(stage => activityTypesForPathwayStage(pathway.id,stage.id).length === 0)
      .map(stage => stage.id);

    if (withheldStages.length) {
      result[pathway.id] = {
        available:false,
        occurrenceIds:[],
        totalOccurrences,
        withheldStages,
        reason:'required_rung_withheld'
      };
      continue;
    }

    let cohort = new Set(occurrences.map(row => String(row.occurrenceId ?? row.occurrence_id)));
    const stageCounts = {};
    for (const stage of PATHWAY_STAGES) {
      const eligible = rawEligibleTargetsForPathwayStage({
        pathwayId:pathway.id,
        stageId:stage.id,
        content,
        masteryByVocabularyId,
        seed:`coverage:${pathway.id}:${stage.id}`
      });
      const eligibleIds = new Set(eligible.map(row => String(row.occurrenceId ?? row.occurrence_id)));
      stageCounts[stage.id] = eligibleIds.size;
      cohort = new Set([...cohort].filter(id => eligibleIds.has(id)));
    }

    const occurrenceIds = [...cohort];
    result[pathway.id] = {
      available:occurrenceIds.length > 0,
      occurrenceIds,
      totalOccurrences,
      withheldStages:[],
      stageCounts,
      reason:occurrenceIds.length ? null : 'no_end_to_end_cohort'
    };
  }

  return result;
}

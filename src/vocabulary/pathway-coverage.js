import { VOCABULARY_PATHWAYS, PATHWAY_STAGES, activityTypesForPathwayStage } from './pathway-model.js';
import { rawEligibleTargetsForPathwayStage } from './pathway-planner.js';
import { pathwayLivePolicy } from './pathway-live-policy.js';

function array(value) { return Array.isArray(value) ? value : []; }
function unitNumberFor(content = {}) {
  const first = array(content?.occurrences)[0] ?? {};
  return first.unitNumber ?? first.unit_number ?? null;
}

export function buildPathwayCoverage({ content, masteryByVocabularyId = {} } = {}) {
  const occurrences = array(content?.occurrences);
  const totalOccurrences = occurrences.length;
  const unitNumber = unitNumberFor(content);
  const result = {};

  for (const pathway of VOCABULARY_PATHWAYS) {
    let cohort = new Set(occurrences.map(row => String(row.occurrenceId ?? row.occurrence_id)));
    const stageCounts = {};
    const withheldStages = [];

    for (const stage of PATHWAY_STAGES) {
      const mappedTypes = activityTypesForPathwayStage(pathway.id,stage.id);
      const withheld = mappedTypes.length === 0;
      if (withheld) withheldStages.push(stage.id);
      const eligible = withheld ? [] : rawEligibleTargetsForPathwayStage({
        pathwayId:pathway.id,
        stageId:stage.id,
        content,
        masteryByVocabularyId,
        seed:`coverage:${pathway.id}:${stage.id}`
      });
      const eligibleIds = new Set(eligible.map(row => String(row.occurrenceId ?? row.occurrence_id)));
      stageCounts[stage.id] = eligibleIds.size;
      if (withheld) cohort.clear();
      else cohort = new Set([...cohort].filter(id => eligibleIds.has(id)));
    }

    const policy = pathwayLivePolicy(unitNumber,pathway.id);
    const occurrenceIds = [...cohort];
    if (policy?.available === false) {
      result[pathway.id] = {
        available:false,
        occurrenceIds:[],
        totalOccurrences,
        withheldStages,
        stageCounts,
        reason:policy.reason ?? 'content_bank_incomplete'
      };
      continue;
    }

    if (withheldStages.length) {
      result[pathway.id] = {
        available:false,
        occurrenceIds:[],
        totalOccurrences,
        withheldStages,
        stageCounts,
        reason:'required_rung_withheld'
      };
      continue;
    }

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

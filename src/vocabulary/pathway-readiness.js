// The one evaluator that decides which pathways are live for a unit. The student app, the teacher pathway table, the teacher
// readiness report and the release test all call this; there is no second interpretation of "live".
//
// It never judges content by counting rows. A word counts for a stage only when the real question builder produces a question
// for it, so a stage can never be "ready" on records the engine could not actually use.
import { VOCABULARY_PATHWAYS, PATHWAY_STAGES, activityTypesForPathwayStage } from './pathway-model.js';
import { rawEligibleTargetsForPathwayStage } from './pathway-planner.js';
import { linkedActivitiesForTarget } from './session-targets.js';
import { pathwayLivePolicy } from './pathway-live-policy.js';
import { READINESS_RULES, stageMinimum } from '../../content/vocabulary/pathway-readiness-rules.js';
import { unitConfig } from '../../content/vocabulary/unit-registry.js';

function array(value) { return Array.isArray(value) ? value : []; }
function idOf(row) { return String(row.occurrenceId ?? row.occurrence_id); }
function unitNumberFor(content = {}) {
  const first = array(content?.occurrences)[0] ?? {};
  return first.unitNumber ?? first.unit_number ?? null;
}
const STAGE_LABEL = Object.freeze(Object.fromEntries(PATHWAY_STAGES.map(stage => [stage.id, stage.label])));

export function evaluateUnitReadiness({ content, masteryByVocabularyId = {}, expectedWords = null, policy = pathwayLivePolicy } = {}) {
  const occurrences = array(content?.occurrences);
  const unitNumber = unitNumberFor(content);
  const expected = Number(expectedWords ?? unitConfig(unitNumber)?.expectedWords ?? occurrences.length);
  const pathways = {};

  for (const pathway of VOCABULARY_PATHWAYS) {
    const stageCounts = {}; const stageMinimums = {}; const withheldStages = []; const missing = [];
    let served = new Set(occurrences.map(idOf));

    for (const stage of PATHWAY_STAGES) {
      const withheld = activityTypesForPathwayStage(pathway.id, stage.id).length === 0;
      if (withheld) withheldStages.push(stage.id);
      const eligible = withheld ? [] : rawEligibleTargetsForPathwayStage({
        pathwayId:pathway.id, stageId:stage.id, content, masteryByVocabularyId, seed:`coverage:${pathway.id}:${stage.id}`
      });
      const ids = new Set(eligible.map(idOf));
      stageCounts[stage.id] = ids.size;
      stageMinimums[stage.id] = stageMinimum(pathway.id, stage.id, expected);
      // A word is served by the pathway only if it can run every rung. A word that can start but not continue would be stranded
      // part-way, and a pathway counts as mastered only when every served word is.
      served = withheld ? new Set() : new Set([...served].filter(id => ids.has(id)));
      if (ids.size < stageMinimums[stage.id]) {
        missing.push({ kind:'stage', stage:stage.id, label:`${STAGE_LABEL[stage.id]} stage`, have:ids.size, need:stageMinimums[stage.id] });
      }
    }

    const servedIds = [...served];
    const servedTargets = occurrences.filter(row => served.has(idOf(row)));
    const servedNeed = Math.min(...Object.values(stageMinimums));
    if (servedIds.length < servedNeed) {
      missing.push({ kind:'full_path', label:'words that can run every stage', have:servedIds.length, need:servedNeed });
    }
    for (const rule of READINESS_RULES[pathway.id]?.diversity ?? []) {
      const have = servedTargets.filter(target => linkedActivitiesForTarget(content, target).some(row => row.contentType === rule.contentType)).length;
      if (have < rule.minimum) missing.push({ kind:'diversity', id:rule.id, label:rule.label, have, need:rule.minimum });
    }

    const hold = policy(unitNumber, pathway.id);
    const held = hold?.available === false;
    let reason = null;
    if (held) reason = hold.reason ?? 'editorial_hold';
    else if (withheldStages.length) reason = 'required_rung_withheld';
    else if (missing.some(row => row.kind === 'stage')) reason = 'stage_below_minimum';
    else if (missing.some(row => row.kind === 'full_path')) reason = 'too_few_full_path_words';
    else if (missing.some(row => row.kind === 'diversity')) reason = 'diversity_below_minimum';
    const live = !reason;

    pathways[pathway.id] = {
      pathwayId:pathway.id,
      live,
      reason,
      held,
      stageCounts,
      stageMinimums,
      supportedStages:PATHWAY_STAGES.map(stage => stage.id).filter(id => stageCounts[id] >= stageMinimums[id]),
      servedOccurrenceIds:live ? servedIds : [],
      servedCount:servedIds.length,
      totalOccurrences:occurrences.length,
      withheldStages,
      missing
    };
  }

  return { unitNumber, expectedWords:expected, pathways };
}

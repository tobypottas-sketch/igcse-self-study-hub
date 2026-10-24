import { PATHWAY_ACTIVITY_MAP, PATHWAY_IDS, PATHWAY_STAGE_IDS, pathwayStageActivities } from '../../supabase/functions/_shared/vocabulary-pathway-contract.js';

const STAGE_IDS = PATHWAY_STAGE_IDS;
const STAGE_INDEX = Object.freeze(Object.fromEntries(STAGE_IDS.map((id,index) => [id,index])));
const PATHWAY_LABELS = Object.freeze({
  meaning:'Meaning', context:'Context', word_families:'Word Families', paraphrasing:'Paraphrasing',
  precision_use:'Precision & Use', spelling_recall:'Spelling & Recall'
});

export const PATHWAY_STAGES = Object.freeze([
  { id:'recognise', label:'Recognise' },
  { id:'match', label:'Match' },
  { id:'apply', label:'Apply' },
  { id:'recall', label:'Recall' },
  { id:'mastery', label:'Mastery' }
]);

const PATHWAY_DEFINITIONS = Object.freeze(PATHWAY_IDS.map(id => Object.freeze({
  id,
  label:PATHWAY_LABELS[id],
  stages:Object.freeze(PATHWAY_STAGES.map(stage => Object.freeze({ id:stage.id, activityTypes:pathwayStageActivities(id,stage.id) })))
})));

export const VOCABULARY_PATHWAYS = Object.freeze(PATHWAY_DEFINITIONS.map(({ id,label }) => ({ id,label })));
const PATHWAY_BY_ID = new Map(PATHWAY_DEFINITIONS.map(definition => [definition.id,definition]));

export function pathwayDefinition(pathwayId) { return PATHWAY_BY_ID.get(String(pathwayId ?? '')) ?? null; }
export function activityTypesForPathwayStage(pathwayId, stageId) { return pathwayStageActivities(pathwayId,stageId); }

function normalizedEvidence(mastery = {}) {
  return mastery?.strandEvidence ?? mastery?.strand_evidence ?? mastery?.contextualEvidence?.strandEvidence ?? mastery?.contextualEvidence?.strand_evidence ?? {};
}
function explicitPathwayStage(pathwayEvidence = {}) {
  const candidate = pathwayEvidence?.currentStage ?? pathwayEvidence?.current_stage ?? null;
  return STAGE_INDEX[candidate] == null ? null : candidate;
}
function relevantLegacyScore(pathwayId, legacyMastery = {}) {
  const evidence = normalizedEvidence(legacyMastery);
  switch (pathwayId) {
    case 'meaning': return Math.max(Number(evidence.meaning ?? 0),Number(evidence.recognition ?? 0));
    case 'context': return Number(evidence.context ?? 0);
    case 'word_families': return Math.min(Number(evidence.context ?? 0),Number(evidence.recognition ?? 0));
    case 'paraphrasing': return Number(evidence.paraphrasing ?? 0);
    case 'precision_use': return Math.max(Number(evidence.context ?? 0),Number(evidence.production ?? 0));
    case 'spelling_recall': return Number(evidence.recognition ?? 0);
    default: return 0;
  }
}

export function derivePathwayPlacement({ pathwayId, legacyMastery = {}, pathwayEvidence = null } = {}) {
  if (!pathwayDefinition(pathwayId)) return 'recognise';
  const explicit=explicitPathwayStage(pathwayEvidence); if (explicit) return explicit;
  const status=String(legacyMastery?.status ?? 'new'), score=relevantLegacyScore(pathwayId,legacyMastery);
  const unassisted=Number(legacyMastery?.unscaffoldedProductions ?? legacyMastery?.unscaffolded_productions ?? 0);
  if (status==='new' && score<1) return 'recognise';
  if (pathwayId==='context' && score>=6 && unassisted>=1) return 'recall';
  if ((pathwayId==='paraphrasing'||pathwayId==='precision_use') && score>=6 && unassisted>=1) return 'recall';
  if (score>=6 || status==='secure' || status==='mastered') return 'apply';
  if (score>=3 || status==='building') return 'match';
  return 'recognise';
}

function stageScore(stage) { return STAGE_INDEX[String(stage ?? '')] ?? 0; }
export function deriveOverallLearningStageFromPathways(pathwayStates = {}) {
  const scores=VOCABULARY_PATHWAYS.map(({id})=>stageScore(pathwayStates?.[id]));
  const active=scores.filter(score=>score>0).length; if (!active) return 'emerging';
  const masteryCount=scores.filter(score=>score>=4).length, recallOrBetter=scores.filter(score=>score>=3).length, applyOrBetter=scores.filter(score=>score>=2).length;
  const meaning=stageScore(pathwayStates?.meaning), context=stageScore(pathwayStates?.context);
  if (meaning>=4 && context>=4 && masteryCount>=3 && recallOrBetter>=6) return 'mastered';
  if (meaning>=3 && context>=3 && recallOrBetter>=3 && applyOrBetter>=4) return 'secure';
  if (applyOrBetter>=2 && active>=3) return 'developing';
  return 'building';
}

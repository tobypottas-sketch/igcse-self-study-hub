const STAGE_IDS = Object.freeze(['recognise','match','apply','recall','mastery']);
const STAGE_INDEX = Object.freeze(Object.fromEntries(STAGE_IDS.map((id,index) => [id,index])));

export const PATHWAY_STAGES = Object.freeze([
  { id:'recognise', label:'Recognise' },
  { id:'match', label:'Match' },
  { id:'apply', label:'Apply' },
  { id:'recall', label:'Recall' },
  { id:'mastery', label:'Mastery' }
]);

const PATHWAY_DEFINITIONS = Object.freeze([
  {
    id:'meaning', label:'Meaning',
    stages:[
      { id:'recognise', activityTypes:['meaning_match','definition_to_word'] },
      { id:'match', activityTypes:['word_definition_match'] },
      { id:'apply', activityTypes:['drag_word_definition','drag_definition_word','which_situation_fits'] },
      { id:'recall', activityTypes:[] },
      { id:'mastery', activityTypes:['meaning_in_context'] }
    ]
  },
  {
    id:'context', label:'Context',
    stages:[
      { id:'recognise', activityTypes:['choose_word_sentence'] },
      { id:'match', activityTypes:[] },
      { id:'apply', activityTypes:['gap_fill_bank','drag_word_sentence'] },
      { id:'recall', activityTypes:['type_missing_word'] },
      { id:'mastery', activityTypes:['meaning_in_context'] }
    ]
  },
  {
    id:'word_families', label:'Word Families',
    stages:[
      { id:'recognise', activityTypes:['word_family_choice'] },
      { id:'match', activityTypes:[] },
      { id:'apply', activityTypes:['word_family_choice'] },
      { id:'recall', activityTypes:['word_family_switch'] },
      { id:'mastery', activityTypes:['word_family_switch'] }
    ]
  },
  {
    id:'paraphrasing', label:'Paraphrasing',
    stages:[
      { id:'recognise', activityTypes:['phrase_match','same_idea'] },
      { id:'match', activityTypes:['phrase_match'] },
      { id:'apply', activityTypes:['build_paraphrase','build_same_idea'] },
      { id:'recall', activityTypes:['complete_paraphrase'] },
      { id:'mastery', activityTypes:['rewrite_phrase','rewrite_idea','explain_another_way'] }
    ]
  },
  {
    id:'precision_use', label:'Precision & Use',
    stages:[
      { id:'recognise', activityTypes:['meaning_in_context'] },
      { id:'match', activityTypes:[] },
      { id:'apply', activityTypes:['improve_vocabulary'] },
      { id:'recall', activityTypes:['improve_vocabulary'] },
      { id:'mastery', activityTypes:['explain_another_way'] }
    ]
  },
  {
    id:'spelling_recall', label:'Spelling & Recall',
    stages:[
      { id:'recognise', activityTypes:[] },
      { id:'match', activityTypes:[] },
      { id:'apply', activityTypes:[] },
      { id:'recall', activityTypes:['spell_word'] },
      { id:'mastery', activityTypes:['spell_word'] }
    ]
  }
]);

export const VOCABULARY_PATHWAYS = Object.freeze(PATHWAY_DEFINITIONS.map(({ id,label }) => ({ id,label })));

const PATHWAY_BY_ID = new Map(PATHWAY_DEFINITIONS.map(definition => [definition.id, definition]));

export function pathwayDefinition(pathwayId) {
  return PATHWAY_BY_ID.get(String(pathwayId ?? '')) ?? null;
}

export function activityTypesForPathwayStage(pathwayId, stageId) {
  const pathway = pathwayDefinition(pathwayId);
  const stage = pathway?.stages.find(candidate => candidate.id === stageId);
  return stage ? [...stage.activityTypes] : [];
}

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
    case 'meaning': return Math.max(Number(evidence.meaning ?? 0), Number(evidence.recognition ?? 0));
    case 'context': return Number(evidence.context ?? 0);
    case 'word_families': return Math.min(Number(evidence.context ?? 0), Number(evidence.recognition ?? 0));
    case 'paraphrasing': return Number(evidence.paraphrasing ?? 0);
    case 'precision_use': return Math.max(Number(evidence.context ?? 0), Number(evidence.production ?? 0));
    case 'spelling_recall': return Number(evidence.recognition ?? 0);
    default: return 0;
  }
}

export function derivePathwayPlacement({ pathwayId, legacyMastery = {}, pathwayEvidence = null } = {}) {
  if (!pathwayDefinition(pathwayId)) return 'recognise';
  const explicit = explicitPathwayStage(pathwayEvidence);
  if (explicit) return explicit;

  const status = String(legacyMastery?.status ?? 'new');
  const score = relevantLegacyScore(pathwayId, legacyMastery);
  const unassisted = Number(legacyMastery?.unscaffoldedProductions ?? legacyMastery?.unscaffolded_productions ?? 0);

  if (status === 'new' && score < 1) return 'recognise';
  if (pathwayId === 'context' && score >= 6 && unassisted >= 1) return 'recall';
  if ((pathwayId === 'paraphrasing' || pathwayId === 'precision_use') && score >= 6 && unassisted >= 1) return 'recall';
  if (score >= 6 || status === 'secure' || status === 'mastered') return 'apply';
  if (score >= 3 || status === 'building') return 'match';
  return 'recognise';
}

function stageScore(stage) {
  return STAGE_INDEX[String(stage ?? '')] ?? 0;
}

export function deriveOverallLearningStageFromPathways(pathwayStates = {}) {
  const scores = VOCABULARY_PATHWAYS.map(({ id }) => stageScore(pathwayStates?.[id]));
  const active = scores.filter(score => score > 0).length;
  if (!active) return 'emerging';

  const masteryCount = scores.filter(score => score >= 4).length;
  const recallOrBetter = scores.filter(score => score >= 3).length;
  const applyOrBetter = scores.filter(score => score >= 2).length;
  const meaning = stageScore(pathwayStates?.meaning);
  const context = stageScore(pathwayStates?.context);

  if (meaning >= 4 && context >= 4 && masteryCount >= 3 && recallOrBetter >= 6) return 'mastered';
  if (meaning >= 3 && context >= 3 && recallOrBetter >= 3 && applyOrBetter >= 4) return 'secure';
  if (applyOrBetter >= 2 && active >= 3) return 'developing';
  return 'building';
}

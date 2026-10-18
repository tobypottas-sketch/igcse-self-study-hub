const STRANDS = Object.freeze(['meaning','recognition','context','paraphrasing','production']);
const HIGHER_ORDER_STRANDS = new Set(['context','paraphrasing']);
export const DEVELOPING_EVIDENCE_THRESHOLD = 3;

export const LEARNING_STAGES = Object.freeze([
  Object.freeze({ id:'emerging', label:'Emerging', order:0, description:'Starting to recognise the word and its meaning.' }),
  Object.freeze({ id:'building', label:'Building', order:1, description:'Retrieving the word with growing confidence.' }),
  Object.freeze({ id:'developing', label:'Developing', order:2, description:'Using meaning and context across different tasks.' }),
  Object.freeze({ id:'secure', label:'Secure', order:3, description:'Manipulating the word and its meaning accurately.' }),
  Object.freeze({ id:'mastered', label:'Mastered', order:4, description:'Using the word independently and flexibly.' })
]);

const LEARNING_STAGE_BY_ID = new Map(LEARNING_STAGES.map(stage => [stage.id, stage]));

function evidenceValue(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}
function evidenceObject(mastery = {}) {
  const candidates = [
    mastery?.strandEvidence,
    mastery?.strand_evidence,
    mastery?.contextualEvidence?.strandEvidence,
    mastery?.contextualEvidence?.strand_evidence,
    mastery?.contextual_evidence?.strandEvidence,
    mastery?.contextual_evidence?.strand_evidence
  ];
  return candidates.find(value => value && typeof value === 'object' && !Array.isArray(value)) ?? {};
}

export function learningStageDefinition(id) {
  return LEARNING_STAGE_BY_ID.get(String(id ?? '')) ?? LEARNING_STAGE_BY_ID.get('emerging');
}

export function deriveLearningStage(mastery = {}) {
  const persisted = ['new','building','secure','mastered'].includes(mastery?.status) ? mastery.status : 'new';
  if (persisted === 'new') return 'emerging';
  if (persisted === 'secure') return 'secure';
  if (persisted === 'mastered') return 'mastered';

  const evidence = evidenceObject(mastery);
  const strongStrands = STRANDS.filter(strand => evidenceValue(evidence[strand]) >= DEVELOPING_EVIDENCE_THRESHOLD);
  const hasHigherOrderEvidence = strongStrands.some(strand => HIGHER_ORDER_STRANDS.has(strand));
  return strongStrands.length >= 2 && hasHigherOrderEvidence ? 'developing' : 'building';
}
export const LEARNING_AREAS = Object.freeze([
  'reading',
  'listening',
  'paraphrasing',
  'essay_writing',
  'vocabulary_paraphrase'
]);

export const EVIDENCE_STATUSES = Object.freeze(['needs_attention', 'developing', 'secure', 'strong']);
export const TRENDS = Object.freeze(['improving', 'stable', 'declining', 'insufficient_evidence']);
export const SIGNAL_STRENGTHS = Object.freeze(['weak', 'moderate', 'strong']);
export const INTERVENTION_STATUSES = Object.freeze(['recommended', 'assigned', 'started', 'completed', 'overdue', 'reviewed']);

function requireText(value, label) {
  const text = String(value ?? '').trim();
  if (!text) throw new Error(`${label} is required.`);
  return text;
}

function requireAllowed(value, allowed, label) {
  if (!allowed.includes(value)) throw new Error(`Invalid ${label}.`);
  return value;
}

function requireDate(value, label) {
  const text = requireText(value, label);
  if (Number.isNaN(Date.parse(text))) throw new Error(`Invalid ${label}.`);
  return text;
}

function requireProvenance(value) {
  if (!Array.isArray(value) || value.length === 0) throw new Error('Provenance is required.');
  return value.map(item => ({
    source: requireText(item?.source, 'Provenance source'),
    id: requireText(item?.id, 'Provenance id')
  }));
}

export function buildEvidenceSummary(input = {}) {
  const status = requireAllowed(input.status, EVIDENCE_STATUSES, 'status');
  const trend = input.trend == null ? 'insufficient_evidence' : requireAllowed(input.trend, TRENDS, 'trend');
  const signalStrength = input.signalStrength == null ? 'weak' : requireAllowed(input.signalStrength, SIGNAL_STRENGTHS, 'signal strength');
  const strands = input.strands && typeof input.strands === 'object' && !Array.isArray(input.strands) ? { ...input.strands } : {};

  return {
    learningArea: requireText(input.learningArea, 'Learning area'),
    studentId: requireText(input.studentId, 'Student ID'),
    status,
    trend,
    signalStrength,
    evidenceWindowStart: requireDate(input.evidenceWindowStart, 'Evidence window start'),
    evidenceWindowEnd: requireDate(input.evidenceWindowEnd, 'Evidence window end'),
    provenance: requireProvenance(input.provenance),
    strands
  };
}

export function buildInterventionOutcome(input = {}) {
  const allowed = ['improved', 'partially_improved', 'no_clear_change', 'insufficient_follow_up_evidence'];
  return {
    interventionId: requireText(input.interventionId, 'Intervention ID'),
    outcome: requireAllowed(input.outcome, allowed, 'intervention outcome'),
    evidenceWindowStart: requireDate(input.evidenceWindowStart, 'Evidence window start'),
    evidenceWindowEnd: requireDate(input.evidenceWindowEnd, 'Evidence window end'),
    provenance: requireProvenance(input.provenance)
  };
}

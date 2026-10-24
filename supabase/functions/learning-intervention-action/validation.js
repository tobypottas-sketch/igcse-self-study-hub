const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INTERVENTION_TYPES = new Set(['recommendation','assignment','intervention']);
const SCOPES = new Set(['student','group','class']);
const LEARNING_AREA_RE = /^[a-z0-9_]{1,80}$/;
const MODES = new Set(['adaptive','timed']);
const DURATIONS = new Set([5,10,15,20]);
const STATUSES = new Set(['recommended','assigned','started','completed','overdue','reviewed']);
const OUTCOMES = new Set(['improved','partially_improved','no_clear_change','insufficient_follow_up_evidence']);
const TRANSITIONS = Object.freeze({
  recommended:new Set(['started','completed']),
  assigned:new Set(['started','overdue']),
  started:new Set(['completed']),
  overdue:new Set(['started','completed']),
  completed:new Set(['reviewed']),
  reviewed:new Set()
});

function uuid(value, label) {
  const text = String(value ?? '');
  if (!UUID_RE.test(text)) throw new Error(`${label} must be a valid UUID.`);
  return text;
}
function text(value, max, label, required = false) {
  const result = String(value ?? '').trim();
  if (required && !result) throw new Error(`${label} is required.`);
  if (result.length > max) throw new Error(`${label} is too long.`);
  return result || null;
}
function object(value) { return value && typeof value === 'object' && !Array.isArray(value) ? { ...value } : {}; }

export function validateStatusTransition(current, next) {
  if (!STATUSES.has(current) || !STATUSES.has(next) || !TRANSITIONS[current]?.has(next)) throw new Error('Invalid intervention status transition.');
  return next;
}

export function validateCreateIntervention(value = {}) {
  if (!INTERVENTION_TYPES.has(value.interventionType)) throw new Error('Intervention type is invalid.');
  if (!SCOPES.has(value.targetScope)) throw new Error('Target scope is invalid.');
  const learningArea = String(value.learningArea ?? '');
  if (!LEARNING_AREA_RE.test(learningArea)) throw new Error('Learning area is invalid.');

  const studentIds = Array.isArray(value.studentIds) ? [...new Set(value.studentIds.map(id => uuid(id,'Student ID')))] : [];
  const classIds = Array.isArray(value.classIds) ? [...new Set(value.classIds.map(id => uuid(id,'Class ID')))] : [];
  if (value.targetScope === 'class' && classIds.length === 0) throw new Error('At least one class target is required.');
  if (value.targetScope !== 'class' && studentIds.length === 0) throw new Error('At least one student target is required.');

  const session = object(value.session);
  if (!MODES.has(session.mode)) throw new Error('Session mode is invalid.');
  const normalizedSession = { mode:session.mode };
  if (session.mode === 'timed') {
    const durationMinutes = Number(session.durationMinutes);
    if (!DURATIONS.has(durationMinutes)) throw new Error('Timed session duration must be 5, 10, 15 or 20 minutes.');
    normalizedSession.durationMinutes = durationMinutes;
  }
  const context = object(value.context);
  if (context.unitNumber != null && (!Number.isInteger(Number(context.unitNumber)) || Number(context.unitNumber) < 1 || Number(context.unitNumber) > 20)) throw new Error('Unit number is invalid.');
  if (Array.isArray(context.vocabularyIds)) context.vocabularyIds = context.vocabularyIds.map(id => String(id).slice(0,160));

  const externalFollowUp = value.externalFollowUp == null ? null : String(value.externalFollowUp);
  if (externalFollowUp && externalFollowUp !== 'teams_quiz') throw new Error('External follow-up is invalid.');
  const dueAt = value.dueAt == null ? null : new Date(value.dueAt).toISOString();
  const initialStatus = value.interventionType === 'recommendation' ? 'recommended' : 'assigned';

  return {
    action:'create',
    interventionType:value.interventionType,
    targetScope:value.targetScope,
    studentIds,
    classIds,
    learningArea,
    skill:text(value.skill,80,'Skill'),
    context,
    session:normalizedSession,
    status:initialStatus,
    reasonCode:text(value.reasonCode,120,'Reason code'),
    externalFollowUp,
    dueAt
  };
}

export function validateInterventionAction(value = {}) {
  if (value.action === 'create') return validateCreateIntervention(value);
  if (value.action === 'status') {
    const status = String(value.status ?? '');
    if (!STATUSES.has(status)) throw new Error('Intervention status is invalid.');
    return { action:'status', interventionId:uuid(value.interventionId,'Intervention ID'), status };
  }
  if (value.action === 'outcome') {
    const outcomeStatus = String(value.outcomeStatus ?? '');
    if (!OUTCOMES.has(outcomeStatus)) throw new Error('Intervention outcome is invalid.');
    return { action:'outcome', interventionId:uuid(value.interventionId,'Intervention ID'), outcomeStatus, outcomeSummary:object(value.outcomeSummary) };
  }
  throw new Error('Unsupported intervention action.');
}

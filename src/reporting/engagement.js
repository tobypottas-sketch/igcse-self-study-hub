import { REPORTING_CAPABILITIES } from './capabilities.js';
import { schoolDay, timestampOf } from './periods.js';

export function classifyEvidence(row) {
  const module = REPORTING_CAPABILITIES[row.appKey];
  if (!Object.hasOwn(REPORTING_CAPABILITIES, row.appKey) || row.preview || row.synthetic) return null;
  if (row.source === 'unit-check' && row.appKey === 'vocabulary_paraphrase') return 'assessment-completion';
  if (row.source === 'mission' && row.appKey === 'vocabulary_paraphrase') return 'activity-completion';
  if (row.source === 'submission' && module.submissions) return 'writing-submission';
  if (!module.engagement || (row.source && row.source !== 'event')) return null;
  switch (row.eventType) {
    case 'app_open': return 'access';
    case 'active_time': return Number(row.activeSeconds) > 0 ? 'time' : 'interaction';
    case 'question_attempt':
    case 'question_answered':
      if (row.resultType === 'exam_reconciliation') return 'assessment-result';
      return module.answerAttempts ? (row.mode === 'exam' ? 'assessment-answer' : 'answer-attempt') : null;
    case 'exercise_result':
      if (!module.completions || row.appKey === 'vocabulary_paraphrase') return 'interaction';
      return row.mode === 'exam' ? 'assessment-result' : 'activity-completion';
    case 'section_use':
    case 'support_use': return 'interaction';
    default: return null;
  }
}

export function summarizeEngagement(records, period, membership = null) {
  const seen = new Set();
  const days = new Set();
  const modules = new Map();
  let lastInteraction = null;
  let lastPractice = null;
  const visible = [];
  const enrolledAt = membership ? timestampOf(membership.startedAt) : -Infinity;
  if (membership && !Number.isFinite(enrolledAt)) {
    return { lastInteraction, lastPractice, activeDays:0, modules, visible, sufficient:false };
  }
  for (const row of records) {
    const timestamp = timestampOf(row.occurredAt);
    if (!Number.isFinite(timestamp) || timestamp > period.asOf || timestamp < enrolledAt) continue;
    if (membership && row.classId && row.classId !== membership.classId) continue;
    const kind = classifyEvidence(row);
    if (!kind) continue;
    const identity = row.attemptId ?? row.id;
    const key = identity == null ? null : JSON.stringify([row.appKey, row.source ?? 'event', kind, identity]);
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);
    visible.push(row);
    const practice = !['access', 'interaction', 'time'].includes(kind);
    if (!lastInteraction || timestamp > timestampOf(lastInteraction.occurredAt)) lastInteraction = row;
    if (practice && (!lastPractice || timestamp > timestampOf(lastPractice.occurredAt))) lastPractice = row;
    if (timestamp < period.start || timestamp >= period.end) continue;
    if (practice) days.add(schoolDay(timestamp));
    if (!modules.has(row.appKey)) modules.set(row.appKey, {
      access:0, answerAttempts:0, activityCompletions:0, assessmentAnswers:0,
      assessmentCompletions:0, assessmentResults:0, writingSubmissions:0, estimatedSeconds:0, activeDays:new Set()
    });
    const summary = modules.get(row.appKey);
    if (practice) summary.activeDays.add(schoolDay(timestamp));
    switch (kind) {
      case 'access': summary.access++; break;
      case 'answer-attempt': summary.answerAttempts++; break;
      case 'activity-completion': summary.activityCompletions++; break;
      case 'assessment-answer': summary.assessmentAnswers++; break;
      case 'assessment-result': summary.assessmentResults++; break;
      case 'assessment-completion': summary.assessmentCompletions++; break;
      case 'writing-submission': summary.writingSubmissions++; break;
      case 'time': summary.estimatedSeconds += Number(row.activeSeconds); break;
    }
  }
  return {
    lastInteraction, lastPractice, activeDays:days.size, modules,
    learningAreas:[...modules].filter(([, summary]) => summary.activeDays.size).map(([key]) => key),
    visible, sufficient:true
  };
}

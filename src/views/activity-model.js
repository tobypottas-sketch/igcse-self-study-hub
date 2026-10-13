const APP_LABELS = { paraphrasing: 'Paraphrasing', reading: 'Reading' };
const SKILL_LABELS = {
  phrase_match: 'Phrase matching',
  sentence_match: 'Sentence matching',
  synonym_write: 'Synonym writing',
  paraphrase_write: 'Paraphrase writing',
  'short answers': 'Short answers',
  short_answers: 'Short answers',
  matching: 'Multiple matching',
  'multiple matching': 'Multiple matching',
  notes: 'Note completion',
  'note completion': 'Note completion',
  mcq: 'Multiple choice',
  'multiple choice': 'Multiple choice'
};

export function periodToSince(period, now = new Date()) {
  if (period === 'all') return null;
  const days = period === '30d' ? 30 : 7;
  return new Date(now.getTime() - days * 86400000).toISOString();
}

export function formatActiveTime(seconds) {
  const total = Math.max(0, Number(seconds) || 0);
  const minutes = Math.round(total / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} h ${remainder} min` : `${hours} h`;
}

export function formatAccuracy(correctScore, validMaxScore) {
  const denominator = Number(validMaxScore) || 0;
  if (denominator <= 0) return '—';
  return `${Math.round(((Number(correctScore) || 0) / denominator) * 100)}%`;
}

export function formatAppLabels(appKeys = []) {
  return appKeys.map(key => APP_LABELS[key] || key);
}

export function formatSkill(skill) {
  return SKILL_LABELS[skill] || skill || 'Not enough data';
}

export function formatLastActive(value) {
  if (!value) return 'No activity';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'No activity' : date.toLocaleString();
}

export function buildClassActivityModel(rows = [], options = {}) {
  return {
    period: options.period || '7d',
    rows: rows.map(row => ({
      studentId: row.student_id,
      displayName: row.display_name,
      classId: row.class_id,
      className: row.class_name,
      lastActive: formatLastActive(row.last_active),
      activeTime: formatActiveTime(row.active_seconds),
      attempts: Number(row.attempts) || 0,
      accuracy: formatAccuracy(row.correct_score, row.valid_max_score),
      apps: formatAppLabels(row.apps_used || []),
      weakestSkill: row.weakest_skill ? formatSkill(row.weakest_skill) : 'Not enough data'
    }))
  };
}

export function buildStudentActivityModel(summary = {}, recent = [], options = {}) {
  return {
    studentId: summary.student_id,
    displayName: summary.display_name || '',
    className: summary.class_name || 'No current class',
    period: options.period || '7d',
    lastActive: formatLastActive(summary.last_active),
    activeTime: formatActiveTime(summary.active_seconds),
    attempts: Number(summary.attempts) || 0,
    accuracy: formatAccuracy(summary.correct_score, summary.valid_max_score),
    appsUsed: formatAppLabels(summary.apps_used || []),
    apps: (summary.apps || []).map(app => ({
      appKey: app.app_key,
      appLabel: APP_LABELS[app.app_key] || app.app_key,
      activeTime: formatActiveTime(app.active_seconds),
      attempts: Number(app.attempts) || 0,
      accuracy: formatAccuracy(app.correct_score, app.valid_max_score),
      skills: (app.skills || []).map(formatSkill)
    })),
    skills: (summary.skills || []).map(skill => ({
      skill: formatSkill(skill.skill),
      attempts: Number(skill.attempts) || 0,
      correct: Number(skill.correct_score) || 0,
      accuracy: formatAccuracy(skill.correct_score, skill.valid_max_score)
    })),
    exerciseResults: (summary.exercise_results || []).map(item => ({
      appLabel: APP_LABELS[item.app_key] || item.app_key,
      skill: formatSkill(item.skill),
      scoreLabel: item.score != null && item.max_score != null ? `${item.score}/${item.max_score}` : '—',
      occurredAt: formatLastActive(item.occurred_at)
    })),
    recent: recent.map(item => ({ ...item, appLabel: APP_LABELS[item.app_key] || item.app_key, skillLabel: formatSkill(item.skill) }))
  };
}

import { escapeHtml } from './html.js';
import { formatActiveTime } from './activity-model.js';

const RECENT_VISIBLE_LIMIT = 8;

function periodLabel(period) {
  return period === '30d' ? 'Last 30 days' : period === 'all' ? 'All time' : 'Last 7 days';
}

function option(value, label, selected) {
  return `<option value="${escapeHtml(value)}" ${value === selected ? 'selected' : ''}>${escapeHtml(label)}</option>`;
}

export function renderActivityOverview(root, profile, classes, model, state = {}) {
  const classId = state.classId || classes[0]?.class_id || '';
  const period = state.period || '7d';
  const classOptions = classes.map(c => option(c.class_id, c.class_name, classId)).join('');
  const rows = (model.rows || []).map(row => `
    <tr>
      <td><button class="link-button" data-action="activity-student" data-student-id="${escapeHtml(row.studentId)}">${escapeHtml(row.displayName)}</button></td>
      <td>${escapeHtml(row.lastActive)}</td>
      <td>${escapeHtml(row.activeTime)}</td>
      <td>${escapeHtml(row.attempts)}</td>
      <td>${escapeHtml(row.accuracy)}</td>
      <td>${escapeHtml((row.apps || []).join(', ') || '—')}</td>
      <td>${escapeHtml(row.weakestSkill)}</td>
    </tr>`).join('');

  root.innerHTML = `
    <section class="shell">
      <header class="topbar">
        <div><p class="eyebrow">iGCSE Self-Study</p><h1>Activity</h1><p class="muted">Teacher view · ${escapeHtml(periodLabel(period))}</p></div>
        <div class="button-row"><button class="button button--ghost" data-action="activity-home">Home</button><button class="button button--ghost" data-action="logout">Log out</button></div>
      </header>
      <div class="activity-filters card-panel">
        <label>Class<select data-action="activity-class">${classOptions}</select></label>
        <label>Period<select data-action="activity-period">${option('7d','Last 7 days',period)}${option('30d','Last 30 days',period)}${option('all','All time',period)}</select></label>
      </div>
      <div class="activity-table-wrap card-panel">
        ${(model.rows || []).length ? `<table class="activity-table"><thead><tr><th>Student</th><th>Last active</th><th>Active time</th><th>Questions attempted</th><th>First-attempt accuracy</th><th>Apps</th><th>Main weakness</th></tr></thead><tbody>${rows}</tbody></table>` : '<p class="empty-state">No Self-Study activity recorded for this period.</p>'}
      </div>
    </section>`;
}

function renderRecentActivityItem(item, index) {
  const extraClass = index >= RECENT_VISIBLE_LIMIT ? ' activity-timeline__item--extra' : '';
  const isMinor = ['active_time','app_open','section_use','support_use','question_answered'].includes(item.event_type);
  const minorClass = isMinor ? ' activity-timeline__item--minor' : '';
  let body = '';

  if (item.event_type === 'question_attempt') {
    const skill = item.skillLabel || item.skill || 'Question';
    const detail = item.outcome === 'correct' ? 'Correct' : 'Try again';
    body = `${escapeHtml(skill)} · ${escapeHtml(detail)}`;
  } else if (item.event_type === 'question_answered') {
    const skill = item.skillLabel && item.skillLabel !== 'Not enough data' ? item.skillLabel : 'Question';
    body = `${escapeHtml(skill)} · Answer recorded`;
  } else if (item.event_type === 'exercise_result') {
    const skill = item.skillLabel || item.skill || 'Exercise';
    const detail = item.score != null && item.max_score != null ? `${item.score}/${item.max_score}` : 'Exercise result';
    body = `${escapeHtml(skill)} · ${escapeHtml(detail)}`;
  } else if (item.event_type === 'active_time') {
    body = `Active study · ${escapeHtml(formatActiveTime(item.active_seconds))}`;
  } else if (item.event_type === 'section_use') {
    const skill = item.skillLabel && item.skillLabel !== 'Not enough data' ? item.skillLabel : 'Listening section';
    body = `${escapeHtml(skill)} · Section opened`;
  } else if (item.event_type === 'support_use') {
    body = 'Transcript support used';
  } else {
    body = 'Opened app';
  }

  return `<li class="activity-timeline__item${extraClass}${minorClass}"><strong>${escapeHtml(item.appLabel)}</strong> · ${body}</li>`;
}

export function renderStudentActivity(root, profile, studentModel, state = {}) {
  const period = state.period || studentModel.period || '7d';
  const appCards = (studentModel.apps || []).map(app => `
    <div class="metric-card"><strong>${escapeHtml(app.appLabel)}</strong><span>${escapeHtml(app.activeTime)}</span><span>${escapeHtml(app.attempts)} questions attempted</span><span>${escapeHtml(app.accuracy)} first-attempt accuracy</span><small>${escapeHtml((app.skills || []).join(', ') || 'No comparable skills')}</small></div>`).join('');
  const skillRows = (studentModel.skills || []).map(skill => `<tr><td>${escapeHtml(skill.skill)}</td><td>${escapeHtml(skill.attempts)}</td><td>${escapeHtml(skill.correct)}</td><td>${escapeHtml(skill.accuracy)}</td></tr>`).join('');
  const recentItems = studentModel.recent || [];
  const timeline = recentItems.map(renderRecentActivityItem).join('');
  const exerciseRows = (studentModel.exerciseResults || []).map(item => `<tr><td>${escapeHtml(item.appLabel)}</td><td>${escapeHtml(item.skill)}</td><td>${escapeHtml(item.scoreLabel)}</td><td>${escapeHtml(item.occurredAt)}</td></tr>`).join('');
  const recentToggle = recentItems.length > RECENT_VISIBLE_LIMIT
    ? `<button class="button button--ghost activity-more-button" data-action="activity-toggle-more" aria-expanded="false">Show more</button>`
    : '';

  root.innerHTML = `
    <section class="shell">
      <header class="topbar">
        <div><p class="eyebrow">Student Activity</p><h1>${escapeHtml(studentModel.displayName)}</h1><p class="muted">${escapeHtml(studentModel.className)} · ${escapeHtml(periodLabel(period))}</p></div>
        <div class="button-row"><button class="button" data-action="activity-back">Back to class overview</button><button class="button button--ghost" data-action="logout">Log out</button></div>
      </header>
      <div class="metric-grid">
        <div class="metric-card"><span>Last active</span><strong>${escapeHtml(studentModel.lastActive)}</strong></div>
        <div class="metric-card"><span>Active time</span><strong>${escapeHtml(studentModel.activeTime)}</strong></div>
        <div class="metric-card"><span>Questions attempted</span><strong>${escapeHtml(studentModel.attempts)}</strong></div>
        <div class="metric-card"><span>First-attempt accuracy</span><strong>${escapeHtml(studentModel.accuracy)}</strong></div>
        <div class="metric-card"><span>Apps used</span><strong>${escapeHtml((studentModel.appsUsed || []).join(', ') || '—')}</strong></div>
      </div>
      <section class="card-panel"><h2>App breakdown</h2><div class="metric-grid">${appCards || '<p class="empty-state">No app activity in this period.</p>'}</div></section>
      <section class="card-panel"><h2>Skill breakdown</h2>${skillRows ? `<table class="activity-table"><thead><tr><th>Skill</th><th>Questions attempted</th><th>Correct first time</th><th>First-attempt accuracy</th></tr></thead><tbody>${skillRows}</tbody></table>` : '<p class="empty-state">No comparable question attempts.</p>'}</section>
      ${exerciseRows ? `<section class="card-panel"><h2>Exercise results</h2><table class="activity-table"><thead><tr><th>App</th><th>Skill</th><th>Score</th><th>When</th></tr></thead><tbody>${exerciseRows}</tbody></table></section>` : ''}
      <section class="card-panel recent-activity-card"><div class="recent-activity-heading"><h2>Recent activity</h2>${recentToggle}</div>${timeline ? `<ul class="activity-timeline">${timeline}</ul>` : '<p class="empty-state">No recent activity.</p>'}</section>
    </section>`;
}

import { escapeHtml } from './html.js';
import { formatActiveTime } from './activity-model.js';

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
        ${(model.rows || []).length ? `<table class="activity-table"><thead><tr><th>Student</th><th>Last active</th><th>Active time</th><th>Attempts</th><th>Accuracy</th><th>Apps</th><th>Main weakness</th></tr></thead><tbody>${rows}</tbody></table>` : '<p class="empty-state">No Self-Study activity recorded for this period.</p>'}
      </div>
    </section>`;
}

export function renderStudentActivity(root, profile, studentModel, state = {}) {
  const period = state.period || studentModel.period || '7d';
  const appCards = (studentModel.apps || []).map(app => `
    <div class="metric-card"><strong>${escapeHtml(app.appLabel)}</strong><span>${escapeHtml(app.activeTime)}</span><span>${escapeHtml(app.attempts)} attempts</span><span>${escapeHtml(app.accuracy)} accuracy</span><small>${escapeHtml((app.skills || []).join(', ') || 'No comparable skills')}</small></div>`).join('');
  const skillRows = (studentModel.skills || []).map(skill => `<tr><td>${escapeHtml(skill.skill)}</td><td>${escapeHtml(skill.attempts)}</td><td>${escapeHtml(skill.correct)}</td><td>${escapeHtml(skill.accuracy)}</td></tr>`).join('');
  const timeline = (studentModel.recent || []).map(item => {
    let detail = '';
    if (item.event_type === 'question_attempt') detail = item.outcome === 'correct' ? 'Correct' : 'Try again';
    else if (item.event_type === 'exercise_result') detail = item.score != null && item.max_score != null ? `${item.score}/${item.max_score}` : 'Exercise result';
    else if (item.event_type === 'active_time') detail = `Active study · ${formatActiveTime(item.active_seconds)}`;
    else detail = 'Opened app';
    return `<li><strong>${escapeHtml(item.appLabel)}</strong> · ${escapeHtml(item.skillLabel || item.skill || (item.event_type === 'active_time' ? 'Active study' : 'Activity'))} · ${escapeHtml(detail)}</li>`;
  }).join('');
  const exerciseRows = (studentModel.exerciseResults || []).map(item => `<tr><td>${escapeHtml(item.appLabel)}</td><td>${escapeHtml(item.skill)}</td><td>${escapeHtml(item.scoreLabel)}</td><td>${escapeHtml(item.occurredAt)}</td></tr>`).join('');

  root.innerHTML = `
    <section class="shell">
      <header class="topbar">
        <div><p class="eyebrow">Student Activity</p><h1>${escapeHtml(studentModel.displayName)}</h1><p class="muted">${escapeHtml(studentModel.className)} · ${escapeHtml(periodLabel(period))}</p></div>
        <div class="button-row"><button class="button" data-action="activity-back">Back to class overview</button><button class="button button--ghost" data-action="logout">Log out</button></div>
      </header>
      <div class="metric-grid">
        <div class="metric-card"><span>Last active</span><strong>${escapeHtml(studentModel.lastActive)}</strong></div>
        <div class="metric-card"><span>Active time</span><strong>${escapeHtml(studentModel.activeTime)}</strong></div>
        <div class="metric-card"><span>Attempts</span><strong>${escapeHtml(studentModel.attempts)}</strong></div>
        <div class="metric-card"><span>Valid accuracy</span><strong>${escapeHtml(studentModel.accuracy)}</strong></div>
        <div class="metric-card"><span>Apps used</span><strong>${escapeHtml((studentModel.appsUsed || []).join(', ') || '—')}</strong></div>
      </div>
      <section class="card-panel"><h2>App breakdown</h2><div class="metric-grid">${appCards || '<p class="empty-state">No app activity in this period.</p>'}</div></section>
      <section class="card-panel"><h2>Skill breakdown</h2>${skillRows ? `<table class="activity-table"><thead><tr><th>Skill</th><th>Attempts</th><th>Correct</th><th>Accuracy</th></tr></thead><tbody>${skillRows}</tbody></table>` : '<p class="empty-state">No comparable question attempts.</p>'}</section>
      ${exerciseRows ? `<section class="card-panel"><h2>Exercise results</h2><table class="activity-table"><thead><tr><th>App</th><th>Skill</th><th>Score</th><th>When</th></tr></thead><tbody>${exerciseRows}</tbody></table></section>` : ''}
      <section class="card-panel"><h2>Recent activity</h2>${timeline ? `<ul class="activity-timeline">${timeline}</ul>` : '<p class="empty-state">No recent activity.</p>'}</section>
    </section>`;
}

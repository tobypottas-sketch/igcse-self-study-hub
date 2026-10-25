import { escapeHtml } from '../views/html.js';
import { skillLabel } from './skill-profile.js';
import { VOCABULARY_PATHWAYS, PATHWAY_STAGES } from './pathway-model.js';
import { habitsLastPractice } from './practice-habits.js';

function label(value) { return String(value ?? '').replaceAll('_',' '); }
function previewButton() { return '<a class="vocab-button" href="./vocabulary.html?preview=1">Preview student activities</a>'; }
function actionButtons() {
  return `<div class="vocab-teacher-actions"><button class="vocab-button vocab-button--primary" data-action="teacher-recommend-practice">Recommend Hub Practice</button><button class="vocab-button" data-action="teacher-teams-targets">Create Teams Target List</button><button class="vocab-button" data-action="teacher-open-readiness">Unit readiness</button>${previewButton()}</div>`;
}
function skillRows(profile) {
  const rows = Object.entries(profile?.skills ?? {}).filter(([,row]) => Number(row?.evidenceCount ?? 0) > 0);
  if (!rows.length) return '<p class="vocab-empty-small">Not enough 0511 activity evidence yet.</p>';
  return rows.map(([id,row]) => `<div class="vocab-strand-row"><span>${escapeHtml(row.label ?? skillLabel(id))}</span><strong>${escapeHtml(row.status)}</strong></div>`).join('');
}
function misconceptionList(patterns = []) {
  const rows = patterns.slice(0,5);
  if (!rows.length) return '<li>No repeated semantic error pattern yet.</li>';
  return rows.map(row => `<li><strong>${escapeHtml(row.label ?? label(row.code))}</strong><span>${escapeHtml(row.count)}</span></li>`).join('');
}
function pathwayStageLabel(state = {}) {
  if (state.mastered === true) return 'Mastery';
  return PATHWAY_STAGES.find(stage => stage.id === state.currentStage)?.label ?? 'Recognise';
}
function pathwayCells(pathways = {}) {
  return VOCABULARY_PATHWAYS.map(pathway => {
    const state = pathways?.[pathway.id] ?? { currentStage:'recognise', mastered:false, needsPractice:false };
    if (state.available === false) return `<span class="vocab-teacher-pathway" data-teacher-pathway="${escapeHtml(pathway.id)}" data-stage="locked" data-live="false"><small>${escapeHtml(pathway.label)}</small><strong>Not live</strong></span>`;
    return `<span class="vocab-teacher-pathway" data-teacher-pathway="${escapeHtml(pathway.id)}" data-stage="${escapeHtml(state.currentStage ?? 'recognise')}"><small>${escapeHtml(pathway.label)}</small><strong>${escapeHtml(pathwayStageLabel(state))}</strong>${state.needsPractice === true ? '<em>Needs practice</em>' : ''}</span>`;
  }).join('');
}
function unitSelector(units) {
  if (!units || (units.options ?? []).length < 2) return '';
  const buttons = [...units.options.map(option => ({ value:String(option.unitNumber), text:`Unit ${option.unitNumber}`, title:option.unitTitle })), { value:'all', text:'All units', title:'Every unit together' }]
    .map(option => `<button type="button" class="vocab-unit-chip${option.value === String(units.selected) ? ' is-selected' : ''}" data-action="teacher-select-unit" data-unit="${escapeHtml(option.value)}" title="${escapeHtml(option.title ?? '')}" aria-pressed="${option.value === String(units.selected) ? 'true' : 'false'}">${escapeHtml(option.text)}</button>`).join('');
  return `<div class="vocab-unit-chips" role="group" aria-label="Choose a unit">${buttons}</div>`;
}
function classPathwayPanel(analytics = {}, units = null) {
  const students = analytics?.studentRows ?? [];
  const rows = students.map(student => `<div class="vocab-teacher-pathway-row"><strong>${escapeHtml(student.displayName)}</strong><div class="vocab-teacher-pathway-cells">${pathwayCells(student.pathways)}</div></div>`).join('') || '<p class="vocab-empty-small">No pathway evidence yet.</p>';
  const scope = units?.selected === 'all' ? 'all units together' : units?.selectedTitle ? `Unit ${units.selected}: ${units.selectedTitle}` : '';
  return `<article class="vocab-teacher-panel vocab-teacher-panel--wide vocab-teacher-pathways-panel"><p class="vocab-kicker">Vocabulary pathways</p><h2>Class progression by pathway</h2>${unitSelector(units)}<p class="vocab-empty-small">Qualitative stages only — no pseudo mastery percentages.${scope ? ` Showing ${escapeHtml(scope)}.` : ''}</p><div class="vocab-teacher-pathway-table">${rows}</div></article>`;
}

function habitsNote() { return '<p class="vocab-empty-small">Practice activity only — not evidence of mastery. It never changes progress, merits or recommendations.</p>'; }
function secondTryText(percent) { return percent == null ? 'Not enough practice yet' : `${percent}% of first answers needed a second try`; }
function habitsPanel(habits) {
  if (!habits) return '';
  if (habits.available === false) return '<article class="vocab-teacher-panel vocab-teacher-panel--wide vocab-habits-panel" data-habits-panel><p class="vocab-kicker">Practice habits</p><h2>Weekly practice</h2><p class="vocab-empty-small">Mission records are not available yet.</p></article>';
  const quiet = (habits.quiet ?? []).slice(0,8).map(row => `<button class="vocab-student-row" data-action="teacher-open-student" data-student-id="${escapeHtml(row.studentId)}"><span>${escapeHtml(row.displayName)}</span><small>${escapeHtml(habitsLastPractice(row))} →</small></button>`).join('');
  const quietBlock = quiet ? `<div class="vocab-habits-quiet"><h3>Gone quiet (${escapeHtml(habits.quiet.length)})</h3><p class="vocab-empty-small">No mission for ${escapeHtml(habits.quietAfterDays)} days or more.</p><div class="vocab-habits-list">${quiet}</div></div>` : '<p class="vocab-empty-small">Everyone has completed a mission in the last ' + escapeHtml(habits.quietAfterDays) + ' days.</p>';
  return `<article class="vocab-teacher-panel vocab-teacher-panel--wide vocab-habits-panel" data-habits-panel><p class="vocab-kicker">Practice habits</p><h2>Weekly practice</h2>${habitsNote()}<div class="vocab-habits-stats"><span><strong>${escapeHtml(habits.missionsThisWeek)}</strong><small>missions this week</small></span><span><strong>${escapeHtml(habits.studentsMetGoal)} of ${escapeHtml(habits.studentCount)}</strong><small>reached ${escapeHtml(habits.goal)} missions</small></span><span><strong>${escapeHtml(habits.studentsActiveThisWeek)}</strong><small>practised this week</small></span><span><strong>${habits.classSecondTryPercent == null ? '—' : escapeHtml(habits.classSecondTryPercent) + '%'}</strong><small>${habits.classSecondTryPercent == null ? 'second tries: not enough yet' : 'first answers needed a second try'}</small></span></div>${quietBlock}</article>`;
}
function studentHabitsCard(habit) {
  if (!habit) return '';
  return `<article class="vocab-teacher-panel vocab-habits-card" data-habits-student><p class="vocab-kicker">Practice habits</p><h2>This week</h2>${habitsNote()}<div class="vocab-habit-row"><span>Missions this week</span><strong>${escapeHtml(habit.missionsThisWeek)} of ${escapeHtml(habit.goal)}${habit.goalMet ? ' ✓' : ''}</strong></div><div class="vocab-habit-row"><span>Last mission</span><strong>${escapeHtml(habitsLastPractice(habit))}</strong></div><div class="vocab-habit-row"><span>Days practised this week</span><strong>${escapeHtml(habit.activeDaysThisWeek)}</strong></div><div class="vocab-habit-row"><span>Weeks goal reached</span><strong>${escapeHtml(habit.weeksMet)}</strong></div><div class="vocab-habit-row"><span>Second tries</span><strong>${escapeHtml(secondTryText(habit.secondTryPercent))}</strong></div></article>`;
}

function meritPanel(merits) {
  if (!merits) return '';
  if (merits.available === false) return '<article class="vocab-teacher-panel vocab-teacher-panel--wide vocab-merit-panel" data-merit-panel><p class="vocab-kicker">Merits</p><h2>Merits to award</h2><p class="vocab-empty-small">Merits are not switched on yet. Run the merit database update first.</p></article>';
  const pending = (merits.rows ?? []).filter(row => row.pendingNumbers.length);
  const list = pending.map(row => `<li class="vocab-merit-row" data-merit-student="${escapeHtml(row.studentId)}"><span><strong>${escapeHtml(row.displayName)}</strong><small>${escapeHtml(row.skillsPassed)} skills passed · ${escapeHtml(row.pendingNumbers.length)} merit${row.pendingNumbers.length === 1 ? '' : 's'} to award</small></span><button class="vocab-button vocab-button--primary" data-action="teacher-award-merit" data-student-id="${escapeHtml(row.studentId)}">Mark awarded</button></li>`).join('');
  const body = list ? `<ul class="vocab-merit-list">${list}</ul>` : '<p class="vocab-empty-small">No merits waiting. Nobody has reached the next milestone yet.</p>';
  return `<article class="vocab-teacher-panel vocab-teacher-panel--wide vocab-merit-panel" data-merit-panel><p class="vocab-kicker">Merits</p><h2>Merits to award${pending.length ? ` (${pending.length})` : ''}</h2><p class="vocab-empty-small">One merit for every ${escapeHtml(merits.skillsPerMerit)} pathway stages a student passes. Tap “Mark awarded” after you have given it.</p>${body}</article>`;
}

export function renderTeacherOverview(root, { className = '', insights, merits = null, habits = null, units = null } = {}) {
  const data = insights ?? { studentsNeedingAttention:[], mainWeakness:null, difficultWords:[], misconceptionPatterns:[], skillProfile:{ skills:{} }, engagement:{ practisedRecently:0, notRecentlyPractised:0 }, trend:{ label:'Insufficient evidence', improvedCount:0 }, pathwayAnalytics:{ studentRows:[], wordRows:[] } };
  const weaknessLabel = data.mainWeakness?.skillId ? skillLabel(data.mainWeakness.skillId) : label(data.mainWeakness?.strand);
  const weakness = data.mainWeakness ? `<article class="vocab-insight-card"><p>Main class weakness</p><strong>${escapeHtml(weaknessLabel)}</strong><span>${escapeHtml(data.mainWeakness.affectedCount)} students affected</span><small>${escapeHtml(data.mainWeakness.summary)}</small><button class="vocab-link" data-action="teacher-open-problem" ${data.mainWeakness.skillId ? `data-skill-id="${escapeHtml(data.mainWeakness.skillId)}"` : `data-strand="${escapeHtml(data.mainWeakness.strand)}"`}>Open problem area →</button></article>` : `<article class="vocab-insight-card"><p>Main class weakness</p><strong>Not enough evidence yet</strong><span>Keep practice voluntary or recommend a short session.</span></article>`;
  const difficult = data.difficultWords.slice(0,5).map(row => `<li><strong>${escapeHtml(row.term)}</strong><span>${escapeHtml(row.affectedCount)} affected</span></li>`).join('') || '<li>No persistent vocabulary pattern yet.</li>';
  const attention = data.studentsNeedingAttention.slice(0,8).map(row => `<button class="vocab-student-row" data-action="teacher-open-student" data-student-id="${escapeHtml(row.studentId)}"><span>${escapeHtml(row.displayName)}</span><small>${escapeHtml(row.targetCount)} recurring target${row.targetCount === 1 ? '' : 's'} →</small></button>`).join('') || '<p class="vocab-empty-small">No persistent attainment concern yet.</p>';
  root.innerHTML = `<main class="vocab-shell"><header class="vocab-topbar"><a class="vocab-back" href="./">← Hub</a><span>Teacher analytics</span></header><section class="vocab-teacher-hero"><p class="vocab-kicker">Vocabulary &amp; Paraphrase</p><h1>${escapeHtml(className || 'Class overview')}</h1><p>What needs attention → why → who → what should I do next?</p></section><section class="vocab-insight-grid"><article class="vocab-insight-card"><p>Students needing attention</p><strong>${escapeHtml(data.studentsNeedingAttention.length)}</strong><span>persistent learning signals</span></article>${weakness}<article class="vocab-insight-card"><p>Recent engagement</p><strong>${escapeHtml(data.engagement.practisedRecently)}</strong><span>practised recently · ${escapeHtml(data.engagement.notRecentlyPractised)} have not</span></article><article class="vocab-insight-card"><p>Recent trend</p><strong>${escapeHtml(data.trend.label)}</strong><span>${escapeHtml(data.trend.improvedCount)} secure/mastered signals recently</span></article></section><section class="vocab-teacher-grid">${meritPanel(merits)}${habitsPanel(habits)}${classPathwayPanel(data.pathwayAnalytics, units)}<article class="vocab-teacher-panel"><p class="vocab-kicker">0511 skill profile</p><h2>How is the class using vocabulary?</h2>${skillRows(data.skillProfile)}</article><article class="vocab-teacher-panel"><p class="vocab-kicker">Meaning accuracy</p><h2>Repeated paraphrasing errors</h2><ul class="vocab-priority-list">${misconceptionList(data.misconceptionPatterns)}</ul></article><article class="vocab-teacher-panel"><p class="vocab-kicker">Priority words</p><h2>Most difficult words</h2><ul class="vocab-priority-list">${difficult}</ul></article><article class="vocab-teacher-panel"><p class="vocab-kicker">Students</p><h2>Who needs a closer look?</h2>${attention}</article></section>${actionButtons()}</main>`;
}

export function renderProblemArea(root, { className = '', drilldown } = {}) {
  const data = drilldown ?? { affectedStudents:[], words:[], failureTypes:[] };
  const people = data.affectedStudents.map(row => `<li>${escapeHtml(row.displayName)}</li>`).join('') || '<li>No students currently affected.</li>';
  const words = data.words.map(row => `<li><strong>${escapeHtml(row.term)}</strong><span>${escapeHtml(row.affectedCount)} students</span></li>`).join('') || '<li>No repeated word pattern.</li>';
  const failures = data.failureTypes.map(row => `<li><strong>${escapeHtml(row.label ?? label(row.type))}</strong><span>${escapeHtml(row.count)}</span></li>`).join('') || '<li>No repeated failure type.</li>';
  const title = data.skillId ? skillLabel(data.skillId) : label(data.strand || 'Vocabulary');
  root.innerHTML = `<main class="vocab-shell"><header class="vocab-topbar"><button class="vocab-back" data-action="teacher-back-overview">← ${escapeHtml(className || 'Class overview')}</button><span>Problem area</span></header><section class="vocab-teacher-hero"><p class="vocab-kicker">Problem area</p><h1>${escapeHtml(title)}</h1><p>See what is going wrong, who is affected and the most useful next action.</p></section><section class="vocab-teacher-grid"><article class="vocab-teacher-panel"><h2>Affected students</h2><ul>${people}</ul></article><article class="vocab-teacher-panel"><h2>Target words</h2><ul class="vocab-priority-list">${words}</ul></article><article class="vocab-teacher-panel"><h2>Failure pattern</h2><ul class="vocab-priority-list">${failures}</ul></article></section><div class="vocab-teacher-actions"><button class="vocab-button vocab-button--primary" data-action="teacher-recommend-practice">Recommend practice</button><button class="vocab-button" data-action="teacher-teams-targets">Create Teams Target List</button><button class="vocab-button" data-action="teacher-view-evidence" disabled aria-disabled="true" title="Evidence drill-down is not available yet">View evidence</button>${previewButton()}</div></main>`;
}

export function renderStudentVocabularyProfile(root, { className = '', profile, habit = null } = {}) {
  const data = profile ?? { strands:{}, persistentTargets:[], skillProfile:{ skills:{} }, misconceptionPatterns:[], pathways:{} };
  const strands = Object.entries(data.strands ?? {}).map(([strand,status]) => `<div class="vocab-strand-row"><span>${escapeHtml(label(strand))}</span><strong>${escapeHtml(status)}</strong></div>`).join('');
  const targets = (data.persistentTargets ?? []).map(row => `<li><strong>${escapeHtml(row.term)}</strong><span>${escapeHtml(label(row.status))}</span></li>`).join('') || '<li>No persistent target right now.</li>';
  const strongest = data.strongestSkill ? skillLabel(data.strongestSkill) : label(data.strongestStrand || 'insufficient evidence');
  const development = data.developmentSkill ? skillLabel(data.developmentSkill) : label(data.developmentArea || 'insufficient evidence');
  root.innerHTML = `<main class="vocab-shell"><header class="vocab-topbar"><button class="vocab-back" data-action="teacher-back-overview">← ${escapeHtml(className || 'Class overview')}</button><span>Student profile</span></header><section class="vocab-teacher-hero"><p class="vocab-kicker">Vocabulary learning profile</p><h1>${escapeHtml(data.displayName || 'Student')}</h1><div class="vocab-profile-highlights"><span>Strongest area <strong>${escapeHtml(strongest)}</strong></span><span>Development area <strong>${escapeHtml(development)}</strong></span><span>Last practice <strong>${escapeHtml(data.lastPractice || 'No recent practice')}</strong></span></div></section><section class="vocab-teacher-grid"><article class="vocab-teacher-panel vocab-teacher-panel--wide"><p class="vocab-kicker">Vocabulary pathways</p><h2>Independent pathway progress</h2><div class="vocab-teacher-pathway-cells">${pathwayCells(data.pathways)}</div></article>${studentHabitsCard(habit)}<article class="vocab-teacher-panel"><h2>0511 skill pattern</h2>${skillRows(data.skillProfile)}</article><article class="vocab-teacher-panel"><h2>Meaning-preservation patterns</h2><ul class="vocab-priority-list">${misconceptionList(data.misconceptionPatterns)}</ul></article><article class="vocab-teacher-panel"><h2>Mastery strands</h2>${strands}</article><article class="vocab-teacher-panel"><h2>Persistent vocabulary gaps</h2><ul class="vocab-priority-list">${targets}</ul></article></section>${actionButtons()}</main>`;
}

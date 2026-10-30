import { escapeHtml } from '../views/html.js';
import { skillLabel } from './skill-profile.js';
import { VOCABULARY_PATHWAYS, PATHWAY_STAGES } from './pathway-model.js';
import { habitsLastPractice } from './practice-habits.js';

// Teacher / admin analytics views. Presentation only: every figure comes from the builders that already feed these screens.
// One status-pill system (data-tone: done / mid / start / locked / warn / quiet) and one button system (primary / secondary / quiet).
function label(value) { return String(value ?? '').replaceAll('_',' '); }
function pill(text, tone = 'quiet') { return `<span class="vocab-pill" data-tone="${tone}">${escapeHtml(text)}</span>`; }
function previewButton() { return '<a class="vocab-button vocab-button--quiet" href="./vocabulary.html?preview=1">Preview student activities</a>'; }
// ONE primary action per screen; everything else is quiet. The recommendation chooser opens directly under this bar.
function actionButtons({ readiness = true, teams = true } = {}) {
  return `<div class="vocab-teacher-actions"><button class="vocab-button vocab-button--primary" data-action="teacher-recommend-practice">Recommend Hub Practice</button><span class="vocab-teacher-actions__quiet">${teams ? '<button class="vocab-button vocab-button--quiet" data-action="teacher-teams-targets">Create Teams Target List</button>' : ''}${readiness ? '<button class="vocab-button vocab-button--quiet" data-action="teacher-open-readiness">Unit readiness</button>' : ''}${previewButton()}</span></div>`;
}
function skillRows(profile) {
  const rows = Object.entries(profile?.skills ?? {}).filter(([,row]) => Number(row?.evidenceCount ?? 0) > 0);
  if (!rows.length) return '<p class="vocab-muted-line">Not enough 0511 activity evidence yet.</p>';
  return `<ul class="vocab-rows">${rows.map(([id,row]) => `<li><span>${escapeHtml(row.label ?? skillLabel(id))}</span>${pill(row.status, row.status === 'Needs attention' ? 'warn' : row.status === 'Strong' || row.status === 'Secure' ? 'done' : 'mid')}</li>`).join('')}</ul>`;
}
function misconceptionList(patterns = []) {
  const rows = patterns.slice(0,5);
  if (!rows.length) return '<p class="vocab-muted-line">No repeated semantic error pattern yet.</p>';
  return `<ul class="vocab-rows">${rows.map(row => `<li><span>${escapeHtml(row.label ?? label(row.code))}</span><b>${escapeHtml(row.count)}</b></li>`).join('')}</ul>`;
}
function pathwayStageLabel(state = {}) {
  if (state.mastered === true) return 'Mastery';
  return PATHWAY_STAGES.find(stage => stage.id === state.currentStage)?.label ?? 'Recognise';
}
function stageTone(state = {}) {
  if (state.mastered === true || state.currentStage === 'mastery') return 'done';
  return ['recall', 'apply'].includes(state.currentStage) ? 'mid' : 'start';
}
const hidden = text => `<span class="vocab-sr">${escapeHtml(text)}</span>`;
// A student's six pathways as compact tiles (profile).
function pathwayCells(pathways = {}) {
  return VOCABULARY_PATHWAYS.map(pathway => {
    const state = pathways?.[pathway.id] ?? { currentStage:'recognise', mastered:false, needsPractice:false };
    if (state.available === false) return `<span class="vocab-teacher-pathway" data-teacher-pathway="${escapeHtml(pathway.id)}" data-stage="locked" data-live="false"><small>${escapeHtml(pathway.label)}</small>${pill('Not live', 'locked')}</span>`;
    return `<span class="vocab-teacher-pathway" data-teacher-pathway="${escapeHtml(pathway.id)}" data-stage="${escapeHtml(state.currentStage ?? 'recognise')}"><small>${escapeHtml(pathway.label)}</small>${pill(pathwayStageLabel(state), stageTone(state))}${state.needsPractice === true ? '<em>Needs practice</em>' : ''}</span>`;
  }).join('');
}
// A class's pathways as ONE table: pathway names once in the header, one row per student, one pill per cell.
function matrixCell(pathway, state) {
  if (state?.available === false) return `<td data-teacher-pathway="${escapeHtml(pathway.id)}" data-stage="locked" data-live="false">${pill('Not live', 'locked')}</td>`;
  const stage = state ?? { currentStage:'recognise', mastered:false, needsPractice:false };
  return `<td data-teacher-pathway="${escapeHtml(pathway.id)}" data-stage="${escapeHtml(stage.currentStage ?? 'recognise')}">${pill(pathwayStageLabel(stage), stageTone(stage))}${stage.needsPractice === true ? `<i class="vocab-flag" title="Needs practice" aria-hidden="true"></i>${hidden('Needs practice')}` : ''}</td>`;
}
function unitSelector(units) {
  if (!units || (units.options ?? []).length < 2) return '';
  const buttons = [...units.options.map(option => ({ value:String(option.unitNumber), text:`Unit ${option.unitNumber}`, title:option.unitTitle })), { value:'all', text:'All units', title:'Every unit together' }]
    .map(option => `<button type="button" class="vocab-unit-chip${option.value === String(units.selected) ? ' is-selected' : ''}" data-action="teacher-select-unit" data-unit="${escapeHtml(option.value)}" title="${escapeHtml(option.title ?? '')}" aria-pressed="${option.value === String(units.selected) ? 'true' : 'false'}">${escapeHtml(option.text)}</button>`).join('');
  return `<div class="vocab-unit-chips" role="group" aria-label="Choose a unit">${buttons}</div>`;
}
function classPathwayPanel(analytics = {}, units = null) {
  const students = analytics?.studentRows ?? [];
  const scope = units?.selected === 'all' ? 'all units together' : units?.selectedTitle ? `Unit ${units.selected}: ${units.selectedTitle}` : '';
  const head = `<tr><th scope="col">Student</th>${VOCABULARY_PATHWAYS.map(pathway => `<th scope="col">${escapeHtml(pathway.label)}</th>`).join('')}</tr>`;
  const rows = students.map(student => `<tr><th scope="row">${escapeHtml(student.displayName)}</th>${VOCABULARY_PATHWAYS.map(pathway => matrixCell(pathway, student.pathways?.[pathway.id])).join('')}</tr>`).join('');
  const body = students.length
    ? `<div class="vocab-matrix-wrap" role="region" aria-label="Pathway progress by student" tabindex="0"><table class="vocab-matrix"><thead>${head}</thead><tbody>${rows}</tbody></table></div>`
    : '<p class="vocab-muted-line">No pathway evidence yet.</p>';
  return `<article class="vocab-teacher-panel vocab-teacher-panel--wide vocab-teacher-pathways-panel"><header class="vocab-panel-head"><h2 title="Qualitative stages only, no mastery percentages.${scope ? ` Showing ${escapeHtml(scope)}.` : ''}">Vocabulary pathways</h2>${unitSelector(units)}</header>${body}</article>`;
}

function habitsNote() { return '<p class="vocab-note">Activity only — not evidence of mastery.</p>'; }
function secondTryText(percent) { return percent == null ? 'Not enough practice yet' : `${percent}% of first answers needed a second try`; }
function habitsPanel(habits) {
  if (!habits) return '';
  if (habits.available === false) return '<article class="vocab-teacher-panel vocab-habits-panel" data-habits-panel><h2>Weekly practice</h2><p class="vocab-muted-line">Mission records are not available yet.</p></article>';
  const quietRows = (habits.quiet ?? []).slice(0,8).map(row => `<li><button class="vocab-student-row" data-action="teacher-open-student" data-student-id="${escapeHtml(row.studentId)}"><span>${escapeHtml(row.displayName)}</span><small>${escapeHtml(habitsLastPractice(row))} →</small></button></li>`).join('');
  const quietBlock = quietRows ? `<h3 title="No mission for ${escapeHtml(habits.quietAfterDays)} days or more">Gone quiet (${escapeHtml(habits.quiet.length)})</h3><ul class="vocab-rows vocab-rows--links">${quietRows}</ul>` : `<p class="vocab-muted-line">Everyone has completed a mission in the last ${escapeHtml(habits.quietAfterDays)} days.</p>`;
  const second = habits.classSecondTryPercent == null ? '' : `<span><strong>${escapeHtml(habits.classSecondTryPercent)}%</strong><small>needed a second try</small></span>`;
  return `<article class="vocab-teacher-panel vocab-habits-panel" data-habits-panel><h2>Weekly practice</h2>${habitsNote()}<div class="vocab-habits-stats"><span><strong>${escapeHtml(habits.missionsThisWeek)}</strong><small>missions</small></span><span><strong>${escapeHtml(habits.studentsMetGoal)} of ${escapeHtml(habits.studentCount)}</strong><small>reached ${escapeHtml(habits.goal)} missions</small></span><span><strong>${escapeHtml(habits.studentsActiveThisWeek)}</strong><small>practised</small></span>${second}</div>${quietBlock}</article>`;
}
// Recent practice on the student profile: three facts, the rest sits under "More detail".
function recentPracticeCard(habit, lastPractice) {
  if (!habit) return `<article class="vocab-teacher-panel" data-recent-practice><h2>Recent practice</h2><p class="vocab-muted-line">${escapeHtml(lastPractice || 'No recent practice')}</p></article>`;
  return `<article class="vocab-teacher-panel vocab-habits-card" data-habits-student data-recent-practice><h2>Recent practice</h2>${habitsNote()}<ul class="vocab-rows"><li><span>Last mission</span><b>${escapeHtml(habitsLastPractice(habit))}</b></li><li><span>This week</span><b>${escapeHtml(habit.missionsThisWeek)} of ${escapeHtml(habit.goal)}${habit.goalMet ? ' ✓' : ''}</b></li><li><span>Days practised</span><b>${escapeHtml(habit.activeDaysThisWeek)}</b></li></ul></article>`;
}
function habitDetailRows(habit) {
  if (!habit) return '';
  return `<li><span>Weeks goal reached</span><b>${escapeHtml(habit.weeksMet)}</b></li><li><span>Second tries</span><b>${escapeHtml(secondTryText(habit.secondTryPercent))}</b></li>`;
}

function meritPanel(merits) {
  if (!merits) return '';
  if (merits.available === false) return '<aside class="vocab-merit-panel vocab-merit-panel--quiet" data-merit-panel><strong>Merits</strong> <span>Not switched on yet. Run the merit database update first.</span></aside>';
  const pending = (merits.rows ?? []).filter(row => row.pendingNumbers.length);
  if (!pending.length) return `<aside class="vocab-merit-panel vocab-merit-panel--quiet" data-merit-panel><strong>Merits</strong> <span>None waiting.</span></aside>`;
  const list = pending.map(row => `<li class="vocab-merit-row" data-merit-student="${escapeHtml(row.studentId)}"><span><strong>${escapeHtml(row.displayName)}</strong><small>${escapeHtml(row.skillsPassed)} skills passed · ${escapeHtml(row.pendingNumbers.length)} merit${row.pendingNumbers.length === 1 ? '' : 's'} to award</small></span><button class="vocab-button vocab-button--secondary" data-action="teacher-award-merit" data-student-id="${escapeHtml(row.studentId)}">Mark awarded</button></li>`).join('');
  return `<article class="vocab-teacher-panel vocab-merit-panel" data-merit-panel><h2 title="One merit for every ${escapeHtml(merits.skillsPerMerit)} pathway stages a student passes. Tap Mark awarded after you have given it.">Merits to award (${pending.length})</h2><ul class="vocab-merit-list">${list}</ul></article>`;
}
function stat(labelText, value, detail, extra = '') { return `<article class="vocab-insight-card"><p>${escapeHtml(labelText)}</p><strong>${escapeHtml(value)}</strong>${detail ? `<span>${escapeHtml(detail)}</span>` : ''}${extra}</article>`; }

export function renderTeacherOverview(root, { className = '', insights, merits = null, habits = null, units = null } = {}) {
  const data = insights ?? { studentsNeedingAttention:[], mainWeakness:null, difficultWords:[], misconceptionPatterns:[], skillProfile:{ skills:{} }, engagement:{ practisedRecently:0, notRecentlyPractised:0 }, trend:{ label:'Insufficient evidence', improvedCount:0 }, pathwayAnalytics:{ studentRows:[], wordRows:[] } };
  const weaknessLabel = data.mainWeakness?.skillId ? skillLabel(data.mainWeakness.skillId) : label(data.mainWeakness?.strand);
  const weakness = data.mainWeakness
    ? `<article class="vocab-insight-card"><p>Main class weakness</p><strong>${escapeHtml(weaknessLabel)}</strong><span title="${escapeHtml(data.mainWeakness.summary)}">${escapeHtml(data.mainWeakness.affectedCount)} students</span><button class="vocab-link" data-action="teacher-open-problem" ${data.mainWeakness.skillId ? `data-skill-id="${escapeHtml(data.mainWeakness.skillId)}"` : `data-strand="${escapeHtml(data.mainWeakness.strand)}"`}>Open problem area →</button></article>`
    : stat('Main class weakness', 'Not enough evidence yet', '');
  const difficult = data.difficultWords.slice(0,5).map(row => `<li><span>${escapeHtml(row.term)}</span><b title="students affected">${escapeHtml(row.affectedCount)}</b></li>`).join('');
  const attention = data.studentsNeedingAttention.slice(0,8).map(row => `<li><button class="vocab-student-row" data-action="teacher-open-student" data-student-id="${escapeHtml(row.studentId)}"><span>${escapeHtml(row.displayName)}</span><small>${escapeHtml(row.targetCount)} recurring target${row.targetCount === 1 ? '' : 's'} →</small></button></li>`).join('');
  const attentionPanel = `<article class="vocab-teacher-panel"><h2>Needs attention</h2>${attention ? `<ul class="vocab-rows vocab-rows--links">${attention}</ul>` : '<p class="vocab-muted-line">No persistent attainment concern yet.</p>'}</article>`;
  root.innerHTML = `<main class="vocab-shell vocab-shell--teacher"><header class="vocab-topbar"><a class="vocab-back" href="./">← Hub</a><span>Teacher analytics</span></header><section class="vocab-teacher-hero"><p class="vocab-kicker">Vocabulary &amp; Paraphrase</p><h1>${escapeHtml(className || 'Class overview')}</h1></section>${actionButtons()}<section class="vocab-insight-grid">${stat('Students needing attention', data.studentsNeedingAttention.length, 'students')}${weakness}${stat('Practised recently', data.engagement.practisedRecently, `${data.engagement.notRecentlyPractised} not recently`)}${stat('Recent trend', data.trend.label, `${data.trend.improvedCount} secure signals`)}</section>${meritPanel(merits)}<section class="vocab-teacher-grid">${attentionPanel}${habitsPanel(habits)}${classPathwayPanel(data.pathwayAnalytics, units)}</section><section class="vocab-teacher-grid vocab-teacher-grid--three"><article class="vocab-teacher-panel"><h2>0511 skills</h2>${skillRows(data.skillProfile)}</article><article class="vocab-teacher-panel"><h2>Repeated errors</h2>${misconceptionList(data.misconceptionPatterns)}</article><article class="vocab-teacher-panel"><h2>Hardest words</h2>${difficult ? `<ul class="vocab-rows">${difficult}</ul>` : '<p class="vocab-muted-line">No persistent vocabulary pattern yet.</p>'}</article></section></main>`;
}

export function renderProblemArea(root, { className = '', drilldown } = {}) {
  const data = drilldown ?? { affectedStudents:[], words:[], failureTypes:[] };
  const list = (rows, empty) => rows.length ? `<ul class="vocab-rows">${rows.join('')}</ul>` : `<p class="vocab-muted-line">${empty}</p>`;
  const people = list(data.affectedStudents.map(row => `<li><span>${escapeHtml(row.displayName)}</span></li>`), 'No students currently affected.');
  const words = list(data.words.map(row => `<li><span>${escapeHtml(row.term)}</span><b>${escapeHtml(row.affectedCount)} students</b></li>`), 'No repeated word pattern.');
  const failures = list(data.failureTypes.map(row => `<li><span>${escapeHtml(row.label ?? label(row.type))}</span><b>${escapeHtml(row.count)}</b></li>`), 'No repeated failure type.');
  const title = data.skillId ? skillLabel(data.skillId) : label(data.strand || 'Vocabulary');
  root.innerHTML = `<main class="vocab-shell vocab-shell--teacher"><header class="vocab-topbar"><button class="vocab-back" data-action="teacher-back-overview">← ${escapeHtml(className || 'Class overview')}</button><span>Problem area</span></header><section class="vocab-teacher-hero"><p class="vocab-kicker">Problem area</p><h1>${escapeHtml(title)}</h1></section><div class="vocab-teacher-actions"><button class="vocab-button vocab-button--primary" data-action="teacher-recommend-practice">Recommend practice</button><span class="vocab-teacher-actions__quiet"><button class="vocab-button vocab-button--quiet" data-action="teacher-teams-targets">Create Teams Target List</button><button class="vocab-button vocab-button--quiet" data-action="teacher-view-evidence" disabled aria-disabled="true" title="Evidence drill-down is not available yet">View evidence</button>${previewButton()}</span></div><section class="vocab-teacher-grid vocab-teacher-grid--three"><article class="vocab-teacher-panel"><h2>Affected students</h2>${people}</article><article class="vocab-teacher-panel"><h2>Target words</h2>${words}</article><article class="vocab-teacher-panel"><h2>Failure pattern</h2>${failures}</article></section></main>`;
}

export function renderStudentVocabularyProfile(root, { className = '', profile, habit = null } = {}) {
  const data = profile ?? { strands:{}, persistentTargets:[], skillProfile:{ skills:{} }, misconceptionPatterns:[], pathways:{} };
  const strands = Object.entries(data.strands ?? {}).map(([strand,status]) => `<li><span>${escapeHtml(label(strand))}</span><b>${escapeHtml(status)}</b></li>`).join('');
  const targetRows = data.persistentTargets ?? [];
  const targets = targetRows.length ? `<ul class="vocab-chips">${targetRows.map(row => `<li class="vocab-chip"><strong>${escapeHtml(row.term)}</strong>${pill(label(row.status), String(row.status).includes('attention') ? 'warn' : 'quiet')}</li>`).join('')}</ul>` : '<p class="vocab-muted-line">No persistent target right now.</p>';
  const strongest = data.strongestSkill ? skillLabel(data.strongestSkill) : label(data.strongestStrand || 'insufficient evidence');
  const development = data.developmentSkill ? skillLabel(data.developmentSkill) : label(data.developmentArea || 'insufficient evidence');
  // The recommendation reads only fields this screen already shows: the weakest area and the recurring words.
  const focusWords = targetRows.slice(0, 3).map(row => row.term).join(', ');
  const reason = `Focus: ${development}${focusWords ? ` · ${focusWords}` : ''}`;
  root.innerHTML = `<main class="vocab-shell vocab-shell--teacher"><header class="vocab-topbar"><button class="vocab-back" data-action="teacher-back-overview">← ${escapeHtml(className || 'Class overview')}</button><span>Student profile</span></header><section class="vocab-teacher-hero"><p class="vocab-kicker">Vocabulary learning profile</p><h1>${escapeHtml(data.displayName || 'Student')}</h1></section>${actionButtons({ teams:false, readiness:false }).replace('</div>', `<p class="vocab-teacher-actions__reason">${escapeHtml(reason)}</p></div>`)}<section class="vocab-teacher-grid"><article class="vocab-teacher-panel vocab-teacher-panel--wide"><h2>Vocabulary pathways</h2><div class="vocab-teacher-pathway-cells">${pathwayCells(data.pathways)}</div></article>${recentPracticeCard(habit, data.lastPractice)}<article class="vocab-teacher-panel"><h2>Strongest and weakest</h2><ul class="vocab-rows"><li><span>Strongest area</span>${pill(strongest, 'done')}</li><li><span>Development area</span>${pill(development, 'warn')}</li></ul></article><article class="vocab-teacher-panel vocab-teacher-panel--wide"><h2>Recurring problem words</h2>${targets}</article></section><details class="vocab-more"><summary>More detail</summary><div class="vocab-teacher-grid vocab-teacher-grid--three"><article class="vocab-teacher-panel"><h3>0511 skill pattern</h3>${skillRows(data.skillProfile)}</article><article class="vocab-teacher-panel"><h3>Meaning-preservation patterns</h3>${misconceptionList(data.misconceptionPatterns)}</article><article class="vocab-teacher-panel"><h3>Mastery strands</h3><ul class="vocab-rows">${strands}${habitDetailRows(habit)}</ul></article></div></details><p class="vocab-teacher-actions__footer"><button class="vocab-button vocab-button--quiet" data-action="teacher-teams-targets">Create Teams Target List</button>${previewButton()}</p></main>`;
}

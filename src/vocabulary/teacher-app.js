import { escapeHtml } from '../views/html.js';
import { buildClassInsights, buildProblemDrilldown, buildStudentProfile } from './analytics.js';
import { loadVocabularyTeacherData } from './teacher-data.js';
import { renderTeacherOverview, renderProblemArea, renderStudentVocabularyProfile } from './teacher-views.js';
import { renderVocabularyError } from './views.js';

const teacherState = { root:null, client:null, profile:null, data:null, currentClass:null, currentDrilldown:null, currentStudent:null };

function renderClassChooser() {
  const classes = teacherState.data?.classes ?? [];
  const cards = classes.map(row => `<button class="vocab-unit-card" data-action="teacher-open-class" data-class-id="${escapeHtml(row.id)}"><span class="vocab-unit-card__number">Class</span><strong>${escapeHtml(row.className)}</strong><span>${escapeHtml(row.students.length)} students</span><small>Open analytics →</small></button>`).join('') || '<p class="vocab-empty">No classes are currently available to this account.</p>';
  teacherState.root.innerHTML = `<main class="vocab-shell"><header class="vocab-topbar"><a href="./" class="vocab-back">← Hub</a><span>Teacher analytics</span></header><section class="vocab-teacher-hero"><p class="vocab-kicker">Vocabulary &amp; Paraphrase</p><h1>Choose a class</h1><p>Open the class that needs your attention.</p></section><section class="vocab-unit-grid">${cards}</section></main>`;
}

function classInsights(classData) {
  return buildClassInsights({ students:classData.students, targets:classData.targets, mastery:classData.mastery, activity:classData.activity, now:new Date() });
}

function openClass(classId) {
  const classData = teacherState.data.classes.find(row => row.id === classId);
  if (!classData) return;
  teacherState.currentClass = classData;
  teacherState.currentDrilldown = null;
  teacherState.currentStudent = null;
  renderTeacherOverview(teacherState.root, { className:classData.className, insights:classInsights(classData) });
}

function openProblem(strand) {
  if (!teacherState.currentClass) return;
  teacherState.currentDrilldown = buildProblemDrilldown({
    students:teacherState.currentClass.students,
    targets:teacherState.currentClass.targets,
    mastery:teacherState.currentClass.mastery,
    strand
  });
  renderProblemArea(teacherState.root, { className:teacherState.currentClass.className, drilldown:teacherState.currentDrilldown });
}

function openStudent(studentId) {
  if (!teacherState.currentClass) return;
  const student = teacherState.currentClass.students.find(row => row.id === studentId);
  if (!student) return;
  teacherState.currentStudent = buildStudentProfile({
    student,
    targets:teacherState.currentClass.targets,
    mastery:teacherState.currentClass.mastery.filter(row => row.studentId === studentId),
    activity:teacherState.currentClass.activity.filter(row => row.studentId === studentId)
  });
  renderStudentVocabularyProfile(teacherState.root, { className:teacherState.currentClass.className, profile:teacherState.currentStudent });
}

function targetRowsForTeams() {
  const classData = teacherState.currentClass;
  if (!classData) return [];
  const focus = teacherState.currentDrilldown;
  const mastery = focus?.strand ? classData.mastery.filter(row => Number(row.strandEvidence?.[focus.strand] ?? 0) < 3) : classData.mastery.filter(row => row.status === 'building' || row.recentErrorPattern);
  const studentById = new Map(classData.students.map(row => [row.id,row.displayName]));
  const targetById = new Map(classData.targets.map(row => [row.vocabularyId,row.term]));
  return mastery.map(row => ({ student:studentById.get(row.studentId) ?? row.studentId, term:targetById.get(row.vocabularyId) ?? row.vocabularyId, strand:focus?.strand ?? 'mixed', failureType:row.recentErrorPattern ?? '' }));
}

async function copyTeamsTargets() {
  const rows = targetRowsForTeams();
  const lines = ['Student\tTarget word/phrase\tWeak strand\tFailure type', ...rows.map(row => `${row.student}\t${row.term}\t${row.strand}\t${row.failureType}`)];
  if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(lines.join('\n'));
  const button = teacherState.root.querySelector?.('[data-action="teacher-teams-targets"]');
  if (button) button.textContent = rows.length ? 'Teams target list copied' : 'No target list yet';
}

function handleClick(event) {
  const target = event.target?.closest?.('[data-action]');
  const action = target?.dataset?.action;
  if (!action) return;
  if (action === 'teacher-open-class') openClass(target.dataset.classId);
  else if (action === 'teacher-open-problem') openProblem(target.dataset.strand);
  else if (action === 'teacher-open-student') openStudent(target.dataset.studentId);
  else if (action === 'teacher-back-overview') teacherState.currentClass ? openClass(teacherState.currentClass.id) : renderClassChooser();
  else if (action === 'teacher-teams-targets') void copyTeamsTargets().catch(() => {});
  else if (action === 'teacher-recommend-practice') {
    const button = target;
    button.textContent = 'Choose targets in intervention workflow';
  }
}

export async function initialiseVocabularyTeacher({ root, client, profile }) {
  teacherState.root = root;
  teacherState.client = client;
  teacherState.profile = profile;
  try {
    teacherState.data = await loadVocabularyTeacherData(client);
    root.addEventListener('click', handleClick);
    if (teacherState.data.classes.length === 1) openClass(teacherState.data.classes[0].id);
    else renderClassChooser();
  } catch (error) {
    renderVocabularyError(root, error instanceof Error ? error.message : 'Teacher vocabulary analytics are unavailable right now.');
  }
}

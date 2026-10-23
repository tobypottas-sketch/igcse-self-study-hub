import { escapeHtml } from '../views/html.js';
import { buildClassInsights, buildPathwayAnalytics, buildProblemDrilldown, buildStudentProfile } from './analytics.js';
import { buildTeamsTargetList, buildVocabularyInterventionDraft, createLearningIntervention } from './interventions.js';
import { buildPracticeHabits, buildStudentHabits } from './practice-habits.js';
import { buildMeritStatus, SKILLS_PER_MERIT } from './merits.js';
import { loadVocabularyTeacherData } from './teacher-data.js';
import { selectedUnit, unitOccurrences } from './teacher-units.js';
import { renderTeacherOverview, renderProblemArea, renderStudentVocabularyProfile } from './teacher-views.js';
import { renderVocabularyError } from './views.js';

const teacherState = { root:null, client:null, profile:null, data:null, currentClass:null, currentDrilldown:null, currentStudent:null, currentInsights:null };

function renderClassChooser() {
  const classes = teacherState.data?.classes ?? [];
  const cards = classes.map(row => `<button class="vocab-unit-card" data-action="teacher-open-class" data-class-id="${escapeHtml(row.id)}"><span class="vocab-unit-card__number">Class</span><strong>${escapeHtml(row.className)}</strong><span>${escapeHtml(row.students.length)} students</span><small>Open analytics →</small></button>`).join('') || '<p class="vocab-empty">No classes are currently available to this account.</p>';
  teacherState.root.innerHTML = `<main class="vocab-shell"><header class="vocab-topbar"><a href="./" class="vocab-back">← Hub</a><span>Teacher analytics</span></header><section class="vocab-teacher-hero"><p class="vocab-kicker">Vocabulary &amp; Paraphrase</p><h1>Choose a class</h1><p>Open the class that needs your attention.</p><div class="vocab-teacher-actions"><a class="vocab-button" href="./vocabulary.html?preview=1">Preview student activities</a></div></section><section class="vocab-unit-grid">${cards}</section></main>`;
}

function pathwayAnalytics(classData, students = classData.students) {
  const studentIds = new Set(students.map(row => row.id));
  return buildPathwayAnalytics({
    students,
    targets:classData.targets,
    occurrences:unitOccurrences(classData),
    globalMastery:classData.mastery.filter(row => studentIds.has(row.studentId)),
    unitMastery:(classData.unitMastery ?? []).filter(row => studentIds.has(row.studentId))
  });
}

function classInsights(classData) {
  const insights = buildClassInsights({ students:classData.students, targets:classData.targets, mastery:classData.mastery, activity:classData.activity, now:new Date() });
  return { ...insights, pathwayAnalytics:pathwayAnalytics(classData) };
}

function classHabits(classData) {
  if (classData.missionsAvailable === false) return { available:false };
  return { available:true, ...buildPracticeHabits({ students:classData.students, missions:classData.missions ?? [], activity:classData.activity, now:new Date() }) };
}

function classMerits(classData) {
  if (classData.meritsAvailable === false) return { available:false, skillsPerMerit:SKILLS_PER_MERIT, rows:[] };
  const rows = buildMeritStatus({ students:classData.students, occurrences:classData.occurrences, unitMastery:classData.unitMastery ?? [], globalMastery:classData.mastery, awards:classData.awards ?? [] });
  return { available:true, skillsPerMerit:SKILLS_PER_MERIT, rows };
}

async function awardMerit(target) {
  const classData = teacherState.currentClass;
  const studentId = target.dataset.studentId;
  const row = classMerits(classData).rows.find(item => item.studentId === studentId);
  if (!row?.pendingNumbers.length) return;
  target.disabled = true;
  const original = target.textContent;
  target.textContent = 'Saving…';
  const records = row.pendingNumbers.map(meritNumber => ({ student_id:studentId, merit_number:meritNumber, awarded_by:teacherState.profile?.id }));
  try {
    const { error } = await teacherState.client.from('vocabulary_merit_awards').upsert(records, { onConflict:'student_id,merit_number', ignoreDuplicates:true });
    if (error) throw new Error('Unable to save this merit. Please try again.');
    classData.awards = [...(classData.awards ?? []), ...row.pendingNumbers.map(meritNumber => ({ studentId, meritNumber }))];
    openClass(classData.id);
  } catch (error) {
    target.disabled = false;
    target.textContent = original;
    target.insertAdjacentHTML('afterend', `<small class="notice">${escapeHtml(error instanceof Error ? error.message : 'Unable to save this merit.')}</small>`);
  }
}

function openClass(classId) {
  const classData = teacherState.data.classes.find(row => row.id === classId);
  if (!classData) return;
  teacherState.currentClass = classData;
  teacherState.currentDrilldown = null;
  teacherState.currentStudent = null;
  teacherState.currentInsights = classInsights(classData);
  renderTeacherOverview(teacherState.root, { className:classData.className, insights:teacherState.currentInsights, merits:classMerits(classData), habits:classHabits(classData), units:selectedUnit(classData) });
}

function openProblem({ strand = null, skillId = null } = {}) {
  if (!teacherState.currentClass) return;
  teacherState.currentStudent = null;
  teacherState.currentDrilldown = buildProblemDrilldown({
    students:teacherState.currentClass.students,
    targets:teacherState.currentClass.targets,
    mastery:teacherState.currentClass.mastery,
    activity:teacherState.currentClass.activity,
    strand,
    skillId
  });
  renderProblemArea(teacherState.root, { className:teacherState.currentClass.className, drilldown:teacherState.currentDrilldown });
}

function openStudent(studentId) {
  if (!teacherState.currentClass) return;
  const student = teacherState.currentClass.students.find(row => row.id === studentId);
  if (!student) return;
  teacherState.currentDrilldown = null;
  const profile = buildStudentProfile({
    student,
    targets:teacherState.currentClass.targets,
    mastery:teacherState.currentClass.mastery.filter(row => row.studentId === studentId),
    activity:teacherState.currentClass.activity.filter(row => row.studentId === studentId)
  });
  const studentPathways = pathwayAnalytics(teacherState.currentClass,[student]).studentRows[0]?.pathways ?? {};
  teacherState.currentStudent = { ...profile, pathways:studentPathways };
  const habit = teacherState.currentClass.missionsAvailable === false ? null : buildStudentHabits({
    student,
    missions:(teacherState.currentClass.missions ?? []).filter(row => row.studentId === studentId),
    activity:teacherState.currentClass.activity.filter(row => row.studentId === studentId),
    now:new Date()
  });
  renderStudentVocabularyProfile(teacherState.root, { className:teacherState.currentClass.className, profile:teacherState.currentStudent, habit });
}

function targetRowsForTeams() {
  const classData = teacherState.currentClass;
  if (!classData) return [];
  const focus = teacherState.currentDrilldown;
  const mastery = focus?.strand ? classData.mastery.filter(row => Number(row.strandEvidence?.[focus.strand] ?? 0) < 3) : classData.mastery.filter(row => row.status === 'building' || row.recentErrorPattern);
  const studentById = new Map(classData.students.map(row => [row.id,row.displayName]));
  const targetById = new Map(classData.targets.map(row => [row.vocabularyId,row.term]));
  const learningFocus = focus?.skillId ?? focus?.strand ?? teacherState.currentStudent?.developmentSkill ?? teacherState.currentStudent?.developmentArea ?? teacherState.currentInsights?.mainWeakness?.skillId ?? teacherState.currentInsights?.mainWeakness?.strand ?? 'mixed';
  return mastery.map(row => ({ student:studentById.get(row.studentId) ?? row.studentId, term:targetById.get(row.vocabularyId) ?? row.vocabularyId, strand:learningFocus, failureType:row.recentErrorPattern ?? '' }));
}

async function copyTeamsTargets() {
  const text = buildTeamsTargetList(targetRowsForTeams());
  const rows = text.split('\n').slice(1);
  if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
  const button = teacherState.root.querySelector?.('[data-action="teacher-teams-targets"]');
  if (button) button.textContent = rows.length ? 'Teams target list copied' : 'No target list yet';
}

function recommendationContext() {
  if (!teacherState.currentClass) return null;
  if (teacherState.currentStudent) {
    return {
      studentId:teacherState.currentStudent.studentId,
      strand:teacherState.currentStudent.developmentSkill ?? teacherState.currentStudent.developmentArea,
      vocabularyIds:(teacherState.currentStudent.persistentTargets ?? []).map(row => row.vocabularyId)
    };
  }
  if (teacherState.currentDrilldown) {
    return {
      affectedStudents:teacherState.currentDrilldown.affectedStudents,
      strand:teacherState.currentDrilldown.skillId ?? teacherState.currentDrilldown.strand,
      vocabularyIds:teacherState.currentDrilldown.words.map(row => row.vocabularyId)
    };
  }
  const insights = teacherState.currentInsights ?? classInsights(teacherState.currentClass);
  return {
    affectedStudents:insights.studentsNeedingAttention,
    strand:insights.mainWeakness?.skillId ?? insights.mainWeakness?.strand ?? null,
    vocabularyIds:insights.difficultWords.slice(0,10).map(row => row.vocabularyId)
  };
}

function showRecommendationChooser() {
  const current = recommendationContext();
  const existing = teacherState.root.querySelector?.('[data-recommendation-chooser]');
  if (existing) existing.remove();
  const actions = teacherState.root.querySelector?.('.vocab-teacher-actions');
  if (!actions) return;
  if (!current || (!current.studentId && !(current.affectedStudents ?? []).length)) {
    actions.insertAdjacentHTML('afterend','<p class="vocab-empty-small" data-recommendation-chooser>No students currently have a persistent learning signal to target.</p>');
    return;
  }
  actions.insertAdjacentHTML('afterend', `<section class="vocab-recommendation-chooser" data-recommendation-chooser><div><p class="vocab-kicker">Recommend practice</p><h3>Choose session type</h3><p>Same target students and learning focus; only the stopping point changes.</p></div><div class="vocab-time-grid"><button class="vocab-button vocab-button--primary" data-action="teacher-create-recommendation" data-duration="adaptive">Adaptive</button>${[5,10,15,20].map(minutes => `<button class="vocab-button" data-action="teacher-create-recommendation" data-duration="${minutes}">${minutes} min</button>`).join('')}</div></section>`);
}

async function createRecommendation(target) {
  const context = recommendationContext();
  if (!context) return;
  const duration = target.dataset.duration;
  const draft = buildVocabularyInterventionDraft({ ...context, durationMinutes:duration === 'adaptive' ? null : Number(duration) });
  target.disabled = true;
  const original = target.textContent;
  target.textContent = 'Saving…';
  try {
    await createLearningIntervention(teacherState.client, draft);
    const chooser = teacherState.root.querySelector?.('[data-recommendation-chooser]');
    if (chooser) chooser.innerHTML = '<strong>Practice recommended.</strong><p class="muted">The intervention is now trackable through the shared Hub/Evidence Hub workflow.</p>';
  } catch (error) {
    target.disabled = false;
    target.textContent = original;
    const chooser = teacherState.root.querySelector?.('[data-recommendation-chooser]');
    if (chooser) chooser.insertAdjacentHTML('beforeend', `<p class="notice">${escapeHtml(error instanceof Error ? error.message : 'Unable to recommend practice.')}</p>`);
  }
}

function handleClick(event) {
  const target = event.target?.closest?.('[data-action]');
  const action = target?.dataset?.action;
  if (!action) return;
  if (action === 'teacher-open-class') openClass(target.dataset.classId);
  else if (action === 'teacher-open-problem') openProblem({ strand:target.dataset.strand ?? null, skillId:target.dataset.skillId ?? null });
  else if (action === 'teacher-open-student') openStudent(target.dataset.studentId);
  else if (action === 'teacher-back-overview') teacherState.currentClass ? openClass(teacherState.currentClass.id) : renderClassChooser();
  else if (action === 'teacher-select-unit') { if (teacherState.currentClass) { teacherState.currentClass.selectedUnit = target.dataset.unit === 'all' ? 'all' : Number(target.dataset.unit); openClass(teacherState.currentClass.id); } }
  else if (action === 'teacher-award-merit') void awardMerit(target);
  else if (action === 'teacher-teams-targets') void copyTeamsTargets().catch(() => {});
  else if (action === 'teacher-recommend-practice') showRecommendationChooser();
  else if (action === 'teacher-create-recommendation') void createRecommendation(target);
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

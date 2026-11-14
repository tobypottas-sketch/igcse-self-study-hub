import { escapeHtml } from '../views/html.js';
import { buildClassInsights, buildPathwayAnalytics, buildProblemDrilldown, buildStudentProfile } from './analytics.js';
import { buildVocabularyInterventionDraft, createLearningIntervention } from './interventions.js';
import { buildPracticeHabits, buildStudentHabits } from './practice-habits.js';
import { buildWeeklyUsage, MAX_WEEKS_BACK } from './weekly-usage.js';
import { buildFollowUpPlan, teamsFollowUpMessage } from './follow-up-plan.js';
import { generateVocabularyActivity, renderVocabularyActivityStudio } from './teacher-activity-studio.js';
import { buildMeritStatus, SKILLS_PER_MERIT } from './merits.js';
import { loadVocabularyTeacherData, loadVocabularyTeacherClassList, loadUnitReadinessContent } from './teacher-data.js?v=fast-start-v1';
import { loadVocabularyStaffUsage, renderVocabularyStaffUsage, updateVocabularyUsageStudentRows } from './staff-usage.js?v=student-pages-v1';
import { evaluateUnitReadiness } from './pathway-readiness.js';
import { coverageFromReadiness } from './pathway-coverage.js';
import { registerPathwayCoverage } from './pathway-coverage-store.js';
import { selectedUnit, unitOccurrences } from './teacher-units.js';
import { renderTeacherOverview, weeklyUsagePanel, renderProblemArea, renderStudentVocabularyProfile, renderFollowUpPlan } from './teacher-views.js?v=staff-usage-v1';
import { renderVocabularyError } from './views.js';

const teacherState = { readiness:new Map(), root:null, client:null, profile:null, data:null, fullDataLoaded:false, fullDataPromise:null, currentClass:null, currentDrilldown:null, currentStudent:null, currentInsights:null, weeklyWeeksAgo:0, followUpPlan:null, usageData:null, usageDays:30, usageClassId:"all", usageStudentId:null, usageReturnClass:null, activityConfig:{type:"forms",minutes:10,level:"standard",variant:0} };

function showTeacherLoading(message) {
  const status=teacherState.root?.querySelector?.('[data-vocab-loading-status]');
  if(status){status.textContent=message;return;}
  teacherState.root.innerHTML='<section class="vocab-startup" aria-label="Loading Vocabulary Builder"><div class="vocab-startup__content"><span class="vocab-startup__symbol" aria-hidden="true">V</span><p class="vocab-startup__title">Vocabulary Builder</p><p class="vocab-startup__status" data-vocab-loading-status role="status"></p><div class="vocab-startup__track" aria-hidden="true"></div></div></section>';
  const next=teacherState.root.querySelector('[data-vocab-loading-status]');
  if(next)next.textContent=message;
}

function renderClassChooser() {
  const classes = teacherState.data?.classes ?? [];
  const cards = classes.map(row => `<button class="vocab-class-card" data-action="teacher-open-class" data-class-id="${escapeHtml(row.id)}"><span class="vocab-class-card__icon"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4.5 5.75A2.25 2.25 0 0 1 6.75 3.5H12v15.75H6.75A2.25 2.25 0 0 0 4.5 21.5V5.75Zm15 0a2.25 2.25 0 0 0-2.25-2.25H12v15.75h5.25a2.25 2.25 0 0 1 2.25 2.25V5.75Z"/></svg></span><span class="vocab-class-card__eyebrow">Class</span><strong class="vocab-class-card__title">${escapeHtml(row.className)}</strong><span class="vocab-class-card__count">${escapeHtml(row.students.length)} students</span><span class="vocab-class-card__cta">Open analytics →</span></button>`).join('') || '<p class="vocab-empty">No classes are currently available to this account.</p>';
  teacherState.root.innerHTML = `<main class="vocab-shell vocab-class-chooser"><header class="vocab-topbar"><a href="./" class="vocab-back">← Hub</a><span>Teacher analytics</span></header><section class="vocab-teacher-hero vocab-class-chooser__hero"><p class="vocab-kicker">Vocabulary &amp; Paraphrase</p><h1>Choose a class</h1><p>Open the class that needs your attention.</p><div class="vocab-teacher-actions"><button type="button" class="vocab-button vocab-button--primary" data-action="teacher-open-usage">Usage overview</button><a class="vocab-button" href="./vocabulary.html?preview=1">Preview student activities</a></div></section><section class="vocab-class-chooser__grid">${cards}</section></main>`;
}

function showStaffUsage() {
  if(!teacherState.usageData)return;
  renderVocabularyStaffUsage(teacherState.root,teacherState.usageData,{
    days:teacherState.usageDays,classId:teacherState.usageClassId,studentId:teacherState.usageStudentId
  });
}
async function openStaffUsage() {
  teacherState.usageReturnClass=teacherState.currentClass?.id??null;
  if(!teacherState.usageData) {
    showTeacherLoading('Loading recorded Vocabulary usage…');
    teacherState.usageData=await loadVocabularyStaffUsage(teacherState.client,teacherState.profile);
  }
  teacherState.usageClassId='all';teacherState.usageStudentId=null;
  showStaffUsage();
}
function returnFromStaffUsage() {
  const prior=teacherState.usageReturnClass;
  if(prior && teacherState.data.classes.some(row=>row.id===prior))void openClass(prior).catch(showError);
  else if(teacherState.data.classes.length===1)void openClass(teacherState.data.classes[0].id).catch(showError);
  else renderClassChooser();
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
    void openClass(classData.id).catch(showError);
  } catch (error) {
    target.disabled = false;
    target.textContent = original;
    target.insertAdjacentHTML('afterend', `<small class="notice">${escapeHtml(error instanceof Error ? error.message : 'Unable to save this merit.')}</small>`);
  }
}

// The same evaluator the student app uses decides which pathways are live. It runs once per unit and registers the result, so the
// teacher pathway table counts only live pathways and the readiness report shows exactly the same answer.
async function ensureReadiness(unitNumber) {
  const key = Number(unitNumber);
  if (teacherState.readiness.has(key)) return teacherState.readiness.get(key);
  const content = await loadUnitReadinessContent(teacherState.client, key);
  const readiness = evaluateUnitReadiness({ content });
  registerPathwayCoverage(key, coverageFromReadiness(readiness.pathways));
  const entry = { readiness, publishedWords:content.occurrences.length };
  teacherState.readiness.set(key, entry);
  return entry;
}

function weeklyForClass(classData) {
  return buildWeeklyUsage({ students:classData.students, activity:classData.activity, now:new Date(), weeksAgo:teacherState.weeklyWeeksAgo });
}
function changeWeeklyWeek(delta) {
  if (!teacherState.currentClass) return;
  teacherState.weeklyWeeksAgo = Math.max(0, Math.min(MAX_WEEKS_BACK, teacherState.weeklyWeeksAgo + delta));
  const panel = teacherState.root.querySelector('[data-weekly-activity]');
  if (panel) panel.outerHTML = weeklyUsagePanel(weeklyForClass(teacherState.currentClass));
}

async function ensureFullTeacherData() {
  if(teacherState.fullDataLoaded)return;
  if(!teacherState.fullDataPromise){
    teacherState.fullDataPromise=loadVocabularyTeacherData(teacherState.client,{profile:teacherState.profile})
      .then(data=>{teacherState.data=data;teacherState.fullDataLoaded=true;})
      .finally(()=>{teacherState.fullDataPromise=null;});
  }
  await teacherState.fullDataPromise;
}
async function openClass(classId) {
  if(!teacherState.data?.classes.some(row=>row.id===classId))return;
  if(!teacherState.fullDataLoaded){
    showTeacherLoading('Loading class analytics…');
    await ensureFullTeacherData();
  }
  const classData = teacherState.data.classes.find(row => row.id === classId);
  if (!classData) return;
  const { options, selected } = selectedUnit(classData);
  for (const unit of selected === 'all' ? options : options.filter(option => option.unitNumber === selected)) await ensureReadiness(unit.unitNumber);
  if (teacherState.currentClass?.id !== classId) teacherState.weeklyWeeksAgo = 0;
  teacherState.currentClass = classData;
  teacherState.currentDrilldown = null;
  teacherState.currentStudent = null;
  teacherState.currentInsights = classInsights(classData);
  renderTeacherOverview(teacherState.root, { className:classData.className, insights:teacherState.currentInsights, merits:classMerits(classData), habits:classHabits(classData), units:selectedUnit(classData), weeklyUsage:weeklyForClass(classData), canChooseClass:teacherState.data.classes.length > 1 });
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

function openFollowUpPlan() {
  if (!teacherState.currentClass) return;
  teacherState.followUpPlan = buildFollowUpPlan({
    classData:teacherState.currentClass,
    currentStudent:teacherState.currentStudent,
    currentDrilldown:teacherState.currentDrilldown,
    currentInsights:teacherState.currentInsights
  });
  teacherState.activityConfig = {type:"forms",minutes:10,level:"standard",variant:0};
  renderFollowUpPlan(teacherState.root, teacherState.followUpPlan, teacherState.activityConfig);
}

function closeFollowUpPlan() {
  teacherState.followUpPlan = null;
  if (teacherState.currentStudent) { openStudent(teacherState.currentStudent.studentId); return; }
  if (teacherState.currentDrilldown) {
    openProblem({ strand:teacherState.currentDrilldown.strand, skillId:teacherState.currentDrilldown.skillId });
    return;
  }
  if (teacherState.currentClass) void openClass(teacherState.currentClass.id).catch(showError);
}

async function copyFollowUpInstructions() {
  const text = teamsFollowUpMessage(teacherState.followUpPlan);
  const status = teacherState.root.querySelector?.('[data-follow-up-copy-status]');
  if (!text || !navigator.clipboard?.writeText) {
    if (status) status.textContent = 'Unable to copy automatically. Please copy the task manually.';
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    if (status) status.textContent = 'Instructions copied. Choose the recipients in Teams.';
  } catch {
    if (status) status.textContent = 'Clipboard access was blocked. Please allow clipboard access and try again.';
  }
}

function updateTeacherStudio(target) {
  if (!teacherState.followUpPlan) return;
  const option = target.dataset.kind;
  if (target.dataset.action === 'teacher-studio-refresh') {
    teacherState.activityConfig.variant += 1;
  } else if (option === 'type') {
    teacherState.activityConfig.type = target.dataset.value;
    teacherState.activityConfig.variant = 0;
  } else if (option === 'minutes') {
    teacherState.activityConfig.minutes = Number(target.dataset.value);
  } else if (option === 'level') {
    teacherState.activityConfig.level = target.dataset.value;
  }
  const previous = teacherState.root.querySelector('[data-vocab-studio]');
  if (!previous) return;
  // Update only the activity studio. Do not reset the student list or Hub recommendation.
  const holder = document.createElement('div');
  holder.innerHTML = renderVocabularyActivityStudio(teacherState.followUpPlan,teacherState.activityConfig);
  previous.replaceWith(holder.firstElementChild);
}
async function copyTeacherStudio(target) {
  if (!teacherState.followUpPlan) return;
  const result = generateVocabularyActivity(teacherState.followUpPlan,teacherState.activityConfig);
  const status = teacherState.root.querySelector('[data-vocab-studio-status]');
  const text = target.dataset.part === 'key' ? result.key : result.task;
  if (!result.ready) return;
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(text);
    if (status) status.textContent = target.dataset.part === 'key' ? 'Answer key copied' : 'Student task copied';
  } catch {
    if (status) status.textContent = 'Copy unavailable. Select the text above to copy manually.';
  }
}

function recommendationContext() {
  if (!teacherState.currentClass) return null;
  if (teacherState.followUpPlan) {
    const studentIds = new Set(teacherState.followUpPlan.students.map(row => row.id));
    const vocabularyIds = [...new Set(teacherState.currentClass.mastery.filter(row => studentIds.has(row.studentId) && (row.status === 'building' || row.recentErrorPattern)).map(row => row.vocabularyId))].slice(0,30);
    return { affectedStudents:teacherState.followUpPlan.students.map(row => ({studentId:row.id})), strand:null, vocabularyIds };
  }
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
  const actions = teacherState.root.querySelector?.('[data-follow-up-practice-actions]') ?? teacherState.root.querySelector?.('.vocab-teacher-actions');
  if (!actions) return;
  if (!current || (!current.studentId && !(current.affectedStudents ?? []).length)) {
    actions.insertAdjacentHTML('afterend','<p class="vocab-empty-small" data-recommendation-chooser>No students currently have a persistent learning signal to target.</p>');
    return;
  }
  actions.insertAdjacentHTML('afterend', `<section class="vocab-recommendation-chooser" data-recommendation-chooser><div><p class="vocab-kicker">Recommend practice</p><h3>Choose session type</h3><p>${teacherState.followUpPlan ? 'This recommends general practice for the selected students and their developing vocabulary; it is not a targeted assessment of the suggested teaching skill.' : 'Same target students and learning focus; only the stopping point changes.'}</p></div><div class="vocab-time-grid"><button class="vocab-button vocab-button--primary" data-action="teacher-create-recommendation" data-duration="adaptive">Adaptive</button>${[5,10,15,20].map(minutes => `<button class="vocab-button" data-action="teacher-create-recommendation" data-duration="${minutes}">${minutes} min</button>`).join('')}</div></section>`);
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

function showError(error) { renderVocabularyError(teacherState.root, error instanceof Error ? error.message : 'Teacher vocabulary analytics are unavailable right now.'); }

function filterStaffUsageStudents(event) {
  const input=event.target?.closest?.('[data-action="staff-usage-search"]');
  if(!input)return;
  updateVocabularyUsageStudentRows(teacherState.root,{query:input.value});
}

function handleStaffUsageChange(event) {
  const target=event.target?.closest?.('[data-action="staff-usage-select-class"]');
  if(!target)return;
  const requested=target.value;
  if(requested==='all'||teacherState.usageData?.classes.some(row=>row.id===requested)){
    teacherState.usageClassId=requested;
    teacherState.usageStudentId=null;
    showStaffUsage();
  }
}

function handleClick(event) {
  const target = event.target?.closest?.('[data-action]');
  const action = target?.dataset?.action;
  if (!action) return;
  if (action === 'teacher-open-usage') void openStaffUsage().catch(showError);
  else if (action === 'staff-usage-back') returnFromStaffUsage();
  else if (action === 'staff-usage-days') {
    teacherState.usageDays=Number(target.dataset.value);
    teacherState.usageStudentId=null;showStaffUsage();
  }
  else if (action === 'staff-usage-class') {
    const requested=target.dataset.value;
    if(requested==='all'||teacherState.usageData?.classes.some(row=>row.id===requested)){
      teacherState.usageClassId=requested;teacherState.usageStudentId=null;showStaffUsage();
    }
  }
  else if (action === 'staff-usage-toggle-classes') {
    const grid=teacherState.root.querySelector('[data-usage-class-grid]');
    const expanded=target.getAttribute('aria-expanded')!=='true';
    for(const card of grid?.querySelectorAll('[data-class-extra]')??[])card.hidden=!expanded;
    target.setAttribute('aria-expanded',String(expanded));
    target.innerHTML=(expanded?'Show fewer classes':'Show all '+target.dataset.total+' classes')+' <span aria-hidden="true">'+(expanded?'⌃':'⌄')+'</span>';
  }
  else if (action === 'staff-usage-view') {
    updateVocabularyUsageStudentRows(teacherState.root,{view:target.dataset.value});
  }
  else if (action === 'staff-usage-more-students') {
    updateVocabularyUsageStudentRows(teacherState.root,{more:true});
  }
  else if (action === 'staff-usage-student') {
    const requested=target.dataset.value;
    teacherState.usageStudentId=requested||null;showStaffUsage();
  }
  else if (action === 'teacher-open-class') void openClass(target.dataset.classId).catch(showError);
  else if (action === 'teacher-week-previous') changeWeeklyWeek(1);
  else if (action === 'teacher-week-next') changeWeeklyWeek(-1);
  else if (action === 'teacher-back-classes') { if (teacherState.data.classes.length === 1) void openClass(teacherState.data.classes[0].id).catch(showError); else renderClassChooser(); }
  else if (action === 'teacher-open-problem') openProblem({ strand:target.dataset.strand ?? null, skillId:target.dataset.skillId ?? null });
  else if (action === 'teacher-open-student') openStudent(target.dataset.studentId);
  else if (action === 'teacher-back-overview') teacherState.currentClass ? void openClass(teacherState.currentClass.id).catch(showError) : renderClassChooser();
  else if (action === 'teacher-select-unit') { if (teacherState.currentClass) { teacherState.currentClass.selectedUnit = target.dataset.unit === 'all' ? 'all' : Number(target.dataset.unit); void openClass(teacherState.currentClass.id).catch(showError); } }
  else if (action === 'teacher-award-merit') void awardMerit(target);
  else if (action === 'teacher-follow-up-plan') openFollowUpPlan();
  else if (action === 'teacher-follow-up-back') closeFollowUpPlan();
  else if (action === 'teacher-copy-follow-up') void copyFollowUpInstructions();
  else if (action === 'teacher-studio-select' || action === 'teacher-studio-refresh') updateTeacherStudio(target);
  else if (action === 'teacher-studio-copy') void copyTeacherStudio(target);
  else if (action === 'teacher-recommend-practice') showRecommendationChooser();
  else if (action === 'teacher-create-recommendation') void createRecommendation(target);
}

export async function initialiseVocabularyTeacher({ root, client, profile }) {
  teacherState.root = root;
  teacherState.client = client;
  teacherState.profile = profile;
  try {
    showTeacherLoading('Loading your classes…');
    teacherState.data = await loadVocabularyTeacherClassList(client,profile);
    root.addEventListener('click', handleClick);
    root.addEventListener('change', handleStaffUsageChange);
    root.addEventListener('input', filterStaffUsageStudents);
    renderClassChooser();
  } catch (error) {
    renderVocabularyError(root, error instanceof Error ? error.message : 'Teacher vocabulary analytics are unavailable right now.');
  }
}
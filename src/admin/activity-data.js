import { buildActivityDashboard } from './activity-model.js';
import { buildMeritStatus } from '../vocabulary/merits.js';

import { loadClassEvidence, loadReportingCatalogue } from '../reporting/activity-queries.js';
import { reportingPeriod } from '../reporting/periods.js';
import { loadReportingCoverage } from '../reporting/pathway-coverage.js';
import { fetchAllRows, fetchAllRowsForIds } from '../vocabulary/teacher-paging.js';
import { saveVocabularyMerits } from '../vocabulary/merit-awards.js';

const previewAwarded = new Set();

function payloads(rows, type) {
  return (rows ?? []).filter(row => row.record_type === type).map(row => row.payload ?? {});
}

function shouldUsePreviewFixture() {
  if (typeof globalThis.location === 'undefined') return false;
  const host = String(globalThis.location.hostname ?? '');
  const params = new URLSearchParams(String(globalThis.location.search ?? ''));
  return host === 'igcse-self-study-preview.onrender.com' && params.get('activity_preview') === '1';
}

function previewPending(studentId, meritNumber) {
  return previewAwarded.has(`${studentId}:${meritNumber}`) ? [] : [meritNumber];
}

function previewDashboard(now, meritOnly) {
  const students = [{
    studentId:'preview-student', displayName:'Preview student', classId:'preview-class',
    className:'Preview class', pendingMeritNumbers:previewPending('preview-student',1),
    lastPractice:now.toISOString(), lastInteraction:now.toISOString(), activeDays:1,
    practiceState:'recorded', unitChecks:[], unitPathways:[], awardedMerits:0, eligibleMerits:1
  }].map(student => ({ ...student, pendingMerits:student.pendingMeritNumbers.length }));
  return { students:meritOnly ? students.filter(student => student.pendingMerits) : students,
    pendingMerits:students[0].pendingMerits, preview:true };
}

function loadActivityRows(client, meritOnly, requestedTypes = null) {
  const types = requestedTypes ?? ['student','vocabulary_global_mastery','vocabulary_unit_mastery','merit_award'];
  if (!requestedTypes && !meritOnly) types.push('unit_check');
  return fetchAllRows(() => ({
    async range(from, to) {
      const result = await client.rpc('teacher_activity_rows',{}, { count:'exact' })
        .in('record_type',types).order('record_type').order('payload').range(from,to);
      if (result.error) throw Object.assign(new Error('Unable to load staff activity records.'), {
        code:result.error.code, status:result.status
      });
      return result;
    }
  }), { label:'staff activity records' });
}

// Only numeric school-email usernames are valid identifiers. Preserve internal zeros.
export function studentNumberFromEmail(email) {
  const match = /^(\d+)@[^@\s]+$/.exec(String(email ?? '').trim());
  return match ? match[1].replace(/^0+(?=\d)/, '') : null;
}

async function loadScopedStudentNumbers(client, students) {
  const ids = [...new Set(students.map(s => s.id).filter(Boolean))];
  const numbers = new Map();
  // The activity RPC supplies the authorised roster; profile RLS remains in force.
  const batches = Array.from({length:Math.ceil(ids.length/100)},(_,i)=>ids.slice(i*100,i*100+100));
  // Bounded parallelism avoids a round trip per chunk without an unbounded burst.
  for (let offset=0;offset<batches.length;offset+=3) await Promise.all(batches.slice(offset,offset+3).map(async batch=>{
    const allowed = new Set(batch);
    try {
      const { data, error } = await client.from('profiles').select('id, school_email').in('id', batch);
      if (error) return;
      for (const row of data ?? []) {
        if (allowed.has(row.id)) numbers.set(row.id, studentNumberFromEmail(row.school_email));
      }
    } catch { /* Missing identifiers must never prevent progress or merit access. */ }
  }));
  return numbers;
}

export async function loadTeacherActivityData(client, { now = new Date(), meritOnly = false, selectedPeriod = null, onUsageReady = null } = {}) {
  if (shouldUsePreviewFixture()) return previewDashboard(now,meritOnly);

  // Student Progress only: fetch the small authorised roster, check and award payload first.
  // Keep the original full-data path for Staff Administration and the merit notifier.
  const progressive = !meritOnly && selectedPeriod && typeof onUsageReady === 'function';
  const [records, [occurrences, classes]] = await Promise.all([
    loadActivityRows(client, meritOnly, progressive?['student','unit_check','merit_award']:null), loadReportingCatalogue(client)
  ]);
  const thresholdByClass = new Map(classes.map(row => [row.id, Number(row.merit_pathways_required) || 2]));
  const rows = records ?? [];
  const students = payloads(rows,'student').map(row => ({
    id:row.student_id,
    displayName:row.display_name,
    classId:row.class_id,
    className:row.class_name,
    meritPathwaysRequired:thresholdByClass.get(row.class_id) ?? 2
  }));
  const missionsRequest=fetchAllRowsForIds(students.map(s=>s.id),ids=>client.from('vocabulary_missions').select('mission_id,student_id,unit_number,mission_kind,pathway_id,pathway_stage,set_number,outcome,completed_at',{count:'exact'}).in('student_id',ids).order('mission_id'),{label:'merit missions'}).then(value=>({value}),error=>({error}));
  const numbersRequest = meritOnly ? Promise.resolve(new Map()) : loadScopedStudentNumbers(client, students);
  const evidenceRequest = meritOnly ? Promise.resolve(null) : loadClassEvidence(client, students, selectedPeriod ?? reportingPeriod('last30',{now})).then(value=>({value}),error=>({error}));
  const normalizeGlobal = source => payloads(source,'vocabulary_global_mastery').map(row => ({
    studentId:row.student_id,
    vocabularyId:row.vocabulary_id,
    status:row.status,
    strandEvidence:row.strand_evidence ?? {},
    recentErrorPattern:row.recent_error_pattern ?? null,
    updatedAt:row.updated_at ?? null
  }));
  const normalizeUnit = source => payloads(source,'vocabulary_unit_mastery').map(row => ({
    studentId:row.student_id,
    occurrenceId:row.occurrence_id,
    status:row.status,
    contextualEvidence:row.contextual_evidence ?? {},
    recentErrorPattern:row.recent_error_pattern ?? null,
    updatedAt:row.updated_at ?? null
  }));
  const unitChecks = payloads(rows,'unit_check').map(row => ({
    studentId:row.student_id,
    unitNumber:Number(row.unit_number),
    formId:row.form_id,
    attemptNumber:Number(row.attempt_number),
    score:Number(row.score),
    maxScore:Number(row.max_score),
    completedAt:row.completed_at
  }));
  const awards = payloads(rows,'merit_award').map(row => ({
    studentId:row.student_id,
    meritNumber:Number(row.merit_number),
    awardedAt:row.awarded_at
  }));
  const normalizedOccurrences = occurrences.map(row => ({
    occurrenceId:row.occurrence_id,
    vocabularyId:row.vocabulary_id,
    unitNumber:Number(row.unit_number),
    unitTitle:row.unit_title
  }));

  if (meritOnly) {
    const coverageByUnit = await loadReportingCoverage(client, normalizedOccurrences);
    const globalMastery=normalizeGlobal(rows),unitMastery=normalizeUnit(rows);
    const mr=await missionsRequest;if(mr.error)throw mr.error;
    const status = buildMeritStatus({ missions:mr.value,students, occurrences:normalizedOccurrences, globalMastery, unitMastery, awards, coverageByUnit });
    const byId = new Map(status.map(row => [row.studentId,row.pendingNumbers]));
    const alerts = students.map(s => {
      const pendingMeritNumbers = byId.get(s.id) ?? [];
      return {studentId:s.id,displayName:s.displayName,className:s.className,pendingMerits:pendingMeritNumbers.length,pendingMeritNumbers};
    }).filter(s => s.pendingMerits);
    return {students:alerts,pendingMerits:alerts.reduce((sum,s)=>sum+s.pendingMerits,0)};
  }
  const vocabUnits=[...new Map(normalizedOccurrences.map(o=>[o.unitNumber,{unitNumber:o.unitNumber,unitTitle:o.unitTitle}])).values()];
  const classList=classes.map(c=>({classId:c.id,className:c.class_name}));
  // Non-progressive callers overlap coverage computation with the evidence and number requests.
  const coverageRequest=progressive?null:loadReportingCoverage(client, normalizedOccurrences).then(value=>({value}),error=>({error}));
  const [numbers,evidenceResult]=await Promise.all([numbersRequest,evidenceRequest]);
  for (const student of students) student.studentNumber = numbers.get(student.id) ?? null;
  let activity = [];
  let engagementAvailable = true;
  try {
    if(evidenceResult.error)throw evidenceResult.error;
    const { memberships, evidence } = evidenceResult.value;
    const current = new Map(memberships.map(row => [row.student_id, row]));
    for (const student of students) {
      const membership = current.get(student.id);
      if (membership?.class_id === student.classId) student.startedAt = membership.started_at;
    }
    activity = evidence;
  } catch {
    engagementAvailable = false;
  }
  const common={students,occurrences:normalizedOccurrences,activity,unitChecks,awards,now,engagementAvailable,selectedPeriod};
  if(progressive){
    const usage=buildActivityDashboard({...common,detailsPending:true});
    // A false return means the requesting view/account is no longer current.
    if(onUsageReady({...usage,classes:classList,vocabUnits,detailsPending:true})===false)return null;
    // Yield so the browser can paint usage before the heavier detail calculations.
    await new Promise(resolve=>setTimeout(resolve,0));
    const [detailRows,coverageByUnit]=await Promise.all([
      loadActivityRows(client,false,['vocabulary_global_mastery','vocabulary_unit_mastery']),
      loadReportingCoverage(client,normalizedOccurrences)
    ]);
    const mr=await missionsRequest;if(mr.error)throw mr.error;
    const dashboard=buildActivityDashboard({...common,missions:mr.value,globalMastery:normalizeGlobal(detailRows),unitMastery:normalizeUnit(detailRows),coverageByUnit});
    return {...dashboard,classes:classList,vocabUnits};
  }
  const coverageResult=await coverageRequest;
  if(coverageResult.error)throw coverageResult.error;
  const mr=await missionsRequest;if(mr.error)throw mr.error;
    const dashboard=buildActivityDashboard({...common,missions:mr.value,globalMastery:normalizeGlobal(rows),unitMastery:normalizeUnit(rows),coverageByUnit:coverageResult.value});
  return selectedPeriod ? {...dashboard,classes:classList} : dashboard;
}

export async function markMeritAwarded(client, studentId, meritNumber) {
  if (shouldUsePreviewFixture()) {
    previewAwarded.add(`${studentId}:${Number(meritNumber)}`);
    return;
  }
  const { data:userData, error:userError } = await client.auth.getUser();
  if (userError || !userData?.user?.id) throw userError ?? new Error('Authentication required.');
  await saveVocabularyMerits(client, userData.user.id, studentId, [Number(meritNumber)]);
}

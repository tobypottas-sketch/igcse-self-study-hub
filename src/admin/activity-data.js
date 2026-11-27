import { buildActivityDashboard } from './activity-model.js';
import { buildMeritStatus } from '../vocabulary/merits.js';

import { loadClassEvidence, loadReportingCatalogue } from '../reporting/activity-queries.js';
import { reportingPeriod } from '../reporting/periods.js';
import { loadReportingCoverage } from '../reporting/pathway-coverage.js';
import { fetchAllRows } from '../vocabulary/teacher-paging.js';
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

function loadActivityRows(client, meritOnly) {
  const types = ['student','vocabulary_global_mastery','vocabulary_unit_mastery','merit_award'];
  if (!meritOnly) types.push('unit_check');
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
  for (let offset = 0; offset < ids.length; offset += 100) {
    const batch = ids.slice(offset, offset + 100);
    const allowed = new Set(batch);
    try {
      const { data, error } = await client.from('profiles').select('id, school_email').in('id', batch);
      if (error) continue;
      for (const row of data ?? []) {
        if (allowed.has(row.id)) numbers.set(row.id, studentNumberFromEmail(row.school_email));
      }
    } catch { /* Missing identifiers must never prevent progress or merit access. */ }
  }
  return numbers;
}

export async function loadTeacherActivityData(client, { now = new Date(), meritOnly = false } = {}) {
  if (shouldUsePreviewFixture()) return previewDashboard(now,meritOnly);

  const [records, [occurrences, classes]] = await Promise.all([
    loadActivityRows(client, meritOnly), loadReportingCatalogue(client)
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
  if (!meritOnly) {
    const numbers = await loadScopedStudentNumbers(client, students);
    for (const student of students) student.studentNumber = numbers.get(student.id) ?? null;
  }
  const globalMastery = payloads(rows,'vocabulary_global_mastery').map(row => ({
    studentId:row.student_id,
    vocabularyId:row.vocabulary_id,
    status:row.status,
    strandEvidence:row.strand_evidence ?? {},
    recentErrorPattern:row.recent_error_pattern ?? null,
    updatedAt:row.updated_at ?? null
  }));
  const unitMastery = payloads(rows,'vocabulary_unit_mastery').map(row => ({
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

  const coverageByUnit = await loadReportingCoverage(client, normalizedOccurrences);
  if (meritOnly) {
    const status = buildMeritStatus({ students, occurrences:normalizedOccurrences, globalMastery, unitMastery, awards, coverageByUnit });
    const byId = new Map(status.map(row => [row.studentId,row.pendingNumbers]));
    const alerts = students.map(s => {
      const pendingMeritNumbers = byId.get(s.id) ?? [];
      return {studentId:s.id,displayName:s.displayName,className:s.className,pendingMerits:pendingMeritNumbers.length,pendingMeritNumbers};
    }).filter(s => s.pendingMerits);
    return {students:alerts,pendingMerits:alerts.reduce((sum,s)=>sum+s.pendingMerits,0)};
  }
  let activity = [];
  let engagementAvailable = true;
  try {
    const { memberships, evidence } = await loadClassEvidence(client, students, reportingPeriod('last30',{now}));
    const current = new Map(memberships.map(row => [row.student_id, row]));
    for (const student of students) {
      const membership = current.get(student.id);
      if (membership?.class_id === student.classId) student.startedAt = membership.started_at;
    }
    activity = evidence;
  } catch {
    engagementAvailable = false;
  }
  return buildActivityDashboard({
    students, occurrences:normalizedOccurrences, globalMastery, unitMastery, activity,
    unitChecks, awards, coverageByUnit, now, engagementAvailable
  });
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

import { buildActivityDashboard } from './activity-model.js';

function payloads(rows, type) {
  return (rows ?? []).filter(row => row.record_type === type).map(row => row.payload ?? {});
}

export async function loadTeacherActivityData(client, { now = new Date() } = {}) {
  const [{ data:records, error:activityError }, { data:occurrences, error:occurrenceError }] = await Promise.all([
    client.rpc('teacher_activity_rows'),
    client.from('vocabulary_unit_occurrences')
      .select('occurrence_id, vocabulary_id, unit_number, unit_title')
      .eq('status','live')
      .eq('active',true)
      .order('unit_number')
      .order('position_in_unit')
  ]);
  if (activityError) throw activityError;
  if (occurrenceError) throw occurrenceError;

  const rows = records ?? [];
  const students = payloads(rows,'student').map(row => ({
    id:row.student_id,
    displayName:row.display_name,
    classId:row.class_id,
    className:row.class_name
  }));
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
  const activity = payloads(rows,'activity').map(row => ({
    studentId:row.student_id,
    appKey:row.app_key,
    eventType:row.event_type,
    occurredAt:row.occurred_at,
    metadata:row.metadata ?? {}
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
  const normalizedOccurrences = (occurrences ?? []).map(row => ({
    occurrenceId:row.occurrence_id,
    vocabularyId:row.vocabulary_id,
    unitNumber:Number(row.unit_number),
    unitTitle:row.unit_title
  }));

  return buildActivityDashboard({ students, occurrences:normalizedOccurrences, globalMastery, unitMastery, activity, unitChecks, awards, now });
}

export async function markMeritAwarded(client, studentId, meritNumber) {
  const { data:userData, error:userError } = await client.auth.getUser();
  if (userError || !userData?.user?.id) throw userError ?? new Error('Authentication required.');
  const { error } = await client.from('vocabulary_merit_awards').insert({
    student_id:studentId,
    merit_number:Number(meritNumber),
    awarded_by:userData.user.id
  });
  if (error) throw error;
}

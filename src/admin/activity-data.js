import { buildActivityDashboard } from './activity-model.js';

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

function previewDashboard(now = new Date()) {
  const day = 24 * 60 * 60 * 1000;
  const iso = offset => new Date(new Date(now).getTime() - offset * day).toISOString();
  const pathwaysA = {
    meaning:{ currentStage:'apply' }, context:{ currentStage:'match' }, word_families:{ currentStage:'recognise' },
    paraphrasing:{ currentStage:'recall' }, precision_use:{ currentStage:'match' }, spelling_recall:{ currentStage:'apply' }
  };
  const pathwaysB = {
    meaning:{ currentStage:'match' }, context:{ currentStage:'recognise' }, word_families:{ currentStage:'recognise' },
    paraphrasing:{ currentStage:'apply' }, precision_use:{ currentStage:'recognise' }, spelling_recall:{ currentStage:'match' }
  };
  const aminaMerits = previewPending('preview-amina',1);
  const soraMerits = previewPending('preview-sora',2);
  return {
    pendingMerits:aminaMerits.length + soraMerits.length,
    needsAttention:1,
    students:[
      {
        studentId:'preview-amina', displayName:'Amina K.', classId:'preview-g9', className:'Grade 9 ESL',
        lastActive:iso(0), activityThisWeek:8, recentApp:'vocabulary_paraphrase', recentPathway:'paraphrasing', pathways:pathwaysA,
        unitCheck:{ latestScore:8, bestScore:8, attemptsUsed:1, attemptsRemaining:2, rows:[{ attemptNumber:1, score:8, maxScore:10, completedAt:iso(0) }] },
        pendingMerits:aminaMerits.length, pendingMeritNumbers:aminaMerits, needsAttention:false, attention:[],
        recentActivity:[
          { occurredAt:iso(0), appKey:'vocabulary_paraphrase', label:'paraphrasing · recall' },
          { occurredAt:iso(1), appKey:'vocabulary_paraphrase', label:'Unit 1 Vocabulary Check · 8/10' }
        ]
      },
      {
        studentId:'preview-leo', displayName:'Leo M.', classId:'preview-g9', className:'Grade 9 ESL',
        lastActive:iso(9), activityThisWeek:0, recentApp:'vocabulary_paraphrase', recentPathway:'meaning', pathways:pathwaysB,
        unitCheck:{ latestScore:4, bestScore:5, attemptsUsed:2, attemptsRemaining:1, rows:[{ attemptNumber:2, score:4, maxScore:10, completedAt:iso(9) },{ attemptNumber:1, score:5, maxScore:10, completedAt:iso(12) }] },
        pendingMerits:0, pendingMeritNumbers:[], needsAttention:true, attention:[{ code:'inactive', label:'Inactive 7+ days' }],
        recentActivity:[{ occurredAt:iso(9), appKey:'vocabulary_paraphrase', label:'meaning · match' }]
      },
      {
        studentId:'preview-sora', displayName:'Sora T.', classId:'preview-g10', className:'Grade 10 ESL',
        lastActive:iso(1), activityThisWeek:5, recentApp:'vocabulary_paraphrase', recentPathway:'context', pathways:pathwaysA,
        unitCheck:{ latestScore:9, bestScore:9, attemptsUsed:1, attemptsRemaining:2, rows:[{ attemptNumber:1, score:9, maxScore:10, completedAt:iso(1) }] },
        pendingMerits:soraMerits.length, pendingMeritNumbers:soraMerits, needsAttention:false, attention:[],
        recentActivity:[{ occurredAt:iso(1), appKey:'vocabulary_paraphrase', label:'context · match' }]
      }
    ]
  };
}

export async function loadTeacherActivityData(client, { now = new Date() } = {}) {
  if (shouldUsePreviewFixture()) return previewDashboard(now);

  const [{ data:records, error:activityError }, { data:occurrences, error:occurrenceError }] = await Promise.all([
    client.rpc('teacher_activity_rows'),
    client.from('vocabulary_unit_occurrences')
      .select('occurrence_id, vocabulary_id, unit_number, unit_title, position_in_unit')
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
  if (shouldUsePreviewFixture()) {
    previewAwarded.add(`${studentId}:${Number(meritNumber)}`);
    return;
  }
  const { data:userData, error:userError } = await client.auth.getUser();
  if (userError || !userData?.user?.id) throw userError ?? new Error('Authentication required.');
  const { error } = await client.from('vocabulary_merit_awards').insert({
    student_id:studentId,
    merit_number:Number(meritNumber),
    awarded_by:userData.user.id
  });
  if (error) throw error;
}

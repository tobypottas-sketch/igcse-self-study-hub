import { fetchAllRows, fetchAllRowsForIds } from '../vocabulary/teacher-paging.js';

export async function loadClassEvidence(client, students, period) {
  const start = new Date(period.start).toISOString();
  const end = new Date(period.asOf).toISOString();
  const ids = students.map(student => student.id);
  if (!ids.length) return { memberships:[], evidence:[] };
  const [memberships, events, missions, submissions] = await Promise.all([
    fetchAllRowsForIds(ids, batch => client.from('student_class_memberships')
      .select('id, student_id, class_id, started_at', { count:'exact' }).in('student_id',batch)
      .is('ended_at',null).order('id'), { label:'current memberships' }),
    fetchAllRowsForIds(ids, batch => client.from('activity_events')
      .select('id, attempt_id, user_id, class_id, app_key, event_type, occurred_at, active_seconds, mode, result_type:metadata->>result_type', { count:'exact' })
      .in('user_id',batch).gte('occurred_at',start).lte('occurred_at',end).order('occurred_at').order('id'), { label:'recent activity' }),
    fetchAllRowsForIds(ids, batch => client.from('vocabulary_missions')
      .select('mission_id, student_id, completed_at', { count:'exact' }).in('student_id',batch)
      .gte('completed_at',start).lte('completed_at',end).order('completed_at').order('mission_id'), { label:'recent missions' }),
    fetchAllRowsForIds(ids, batch => client.from('student_writing_submissions')
      .select('id, student_id, app_key, submitted_at', { count:'exact' }).in('student_id',batch)
      .gte('submitted_at',start).lte('submitted_at',end).order('submitted_at').order('id'), { label:'recent writing submissions' })
  ]);
  return {
    memberships,
    evidence:[
      ...events.map(row => ({
        id:row.id, attemptId:row.attempt_id, studentId:row.user_id, classId:row.class_id,
        appKey:row.app_key, eventType:row.event_type, occurredAt:row.occurred_at,
        mode:row.mode, resultType:row.result_type, activeSeconds:row.active_seconds
      })),
      ...missions.map(row => ({
        id:row.mission_id, studentId:row.student_id, source:'mission',
        appKey:'vocabulary_paraphrase', occurredAt:row.completed_at
      })),
      ...submissions.map(row => ({
        id:row.id, studentId:row.student_id, source:'submission',
        appKey:row.app_key, occurredAt:row.submitted_at
      }))
    ]
  };
}

export function loadReportingCatalogue(client) {
  return Promise.all([
    fetchAllRows(() => client.from('vocabulary_unit_occurrences')
      .select('occurrence_id, vocabulary_id, unit_number, unit_title', { count:'exact' })
      .eq('status','live').eq('active',true).order('occurrence_id'), { label:'published vocabulary occurrences' }),
    fetchAllRows(() => client.from('classes')
      .select('id, merit_pathways_required', { count:'exact' }).eq('active',true).order('id'), { label:'class merit thresholds' })
  ]);
}

import { fetchAllRows, fetchAllRowsForIds } from './teacher-paging.js';
import { plannerContent } from './data.js';

const SAFE_ACTIVITY_METADATA = new Set([
  'unit_number','strand','question_type','attempt_number','outcome','retry_used','recovery',
  'misconception','evidence_strength','support_level','target_id','occurrence_id','practice_focus','skill_family',
  'pathway_id','pathway_stage','served_pathway_stage'
]);

function safeActivityMetadata(value) {
  const source = value && typeof value === 'object' ? value : {};
  const output = {};
  for (const key of SAFE_ACTIVITY_METADATA) {
    const item = source[key];
    if (item == null) continue;
    if (['retry_used','recovery'].includes(key)) {
      if (typeof item === 'boolean') output[key] = item;
      continue;
    }
    if (key === 'unit_number' || key === 'attempt_number') {
      const number = Number(item);
      if (Number.isInteger(number)) output[key] = number;
      continue;
    }
    if (typeof item === 'string' && item.length <= 160) output[key] = item;
  }
  return output;
}

export function normalizeTeacherVocabularyData(raw = {}) {
  const profiles = raw.profiles ?? [];
  const memberships = (raw.memberships ?? []).filter(row => row.ended_at == null);
  const classesRaw = raw.classes ?? [];
  const items = (raw.items ?? []).map(row => ({ vocabularyId:row.vocabulary_id, term:row.term }));
  const occurrences = (raw.occurrences ?? []).map(row => ({ occurrenceId:row.occurrence_id, vocabularyId:row.vocabulary_id, unitNumber:row.unit_number, unitTitle:row.unit_title }));
  const mastery = (raw.mastery ?? []).map(row => ({ studentId:row.student_id, vocabularyId:row.vocabulary_id, status:row.status, strandEvidence:row.strand_evidence ?? {}, recentErrorPattern:row.recent_error_pattern ?? null, updatedAt:row.updated_at ?? null }));
  const unitMastery = (raw.unitMastery ?? []).map(row => ({ studentId:row.student_id, occurrenceId:row.occurrence_id, status:row.status, recentErrorPattern:row.recent_error_pattern ?? null, contextualEvidence:row.contextual_evidence ?? {} }));
  const activity = (raw.activity ?? []).map(row => ({ studentId:row.user_id, occurredAt:row.occurred_at, eventType:row.event_type, metadata:safeActivityMetadata(row.metadata) }));
  const meritsAvailable = Array.isArray(raw.awards);
  const awards = (raw.awards ?? []).map(row => ({ studentId:row.student_id, meritNumber:Number(row.merit_number) }));
  const missionsAvailable = Array.isArray(raw.missions);
  const missions = (raw.missions ?? []).map(row => ({ studentId:row.student_id, completedAt:row.completed_at, kind:row.mission_kind, unitNumber:Number(row.unit_number) || null }));
  const profileById = new Map(profiles.filter(row => row.role === 'student').map(row => [row.id, { id:row.id, displayName:row.display_name }]));

  const classes = classesRaw.map(classRow => {
    const studentIds = memberships.filter(row => row.class_id === classRow.id).map(row => row.student_id).filter(id => profileById.has(id));
    const allowed = new Set(studentIds);
    return {
      id:classRow.id,
      className:classRow.class_name,
      students:studentIds.map(id => profileById.get(id)),
      mastery:mastery.filter(row => allowed.has(row.studentId)),
      unitMastery:unitMastery.filter(row => allowed.has(row.studentId)),
      activity:activity.filter(row => allowed.has(row.studentId)),
      awards:awards.filter(row => allowed.has(row.studentId)),
      missions:missions.filter(row => allowed.has(row.studentId)),
      missionsAvailable,
      meritsAvailable,
      targets:items,
      occurrences
    };
  });
  return { classes, targets:items, occurrences };
}

export const ACTIVITY_WINDOW_DAYS = 90;

async function optional(work) {
  try { return await work(); } catch { return null; }
}

// Everything is read in complete 1,000-row pages. Learning evidence (mastery) and engagement (missions, attempts) are read by
// separate calls and stay separate in the result. Attempts are limited to a recent window and then read completely;
// missions are tiny (one row each) and read in full.
export async function loadVocabularyTeacherData(client, { now = new Date() } = {}) {
  const [profiles, memberships, classes, items, occurrences] = await Promise.all([
    fetchAllRows(() => client.from('profiles').select('id, display_name, role', { count:'exact' }).eq('role','student').order('id'), { label:'students' }),
    fetchAllRows(() => client.from('student_class_memberships').select('student_id, class_id, ended_at', { count:'exact' }).order('student_id').order('class_id'), { label:'class memberships' }),
    fetchAllRows(() => client.from('classes').select('id, class_name, active', { count:'exact' }).eq('active',true).order('id'), { label:'classes' }),
    fetchAllRows(() => client.from('vocabulary_items').select('vocabulary_id, term', { count:'exact' }).eq('status','live').order('vocabulary_id'), { label:'vocabulary items' }),
    fetchAllRows(() => client.from('vocabulary_unit_occurrences').select('occurrence_id, vocabulary_id, unit_number, unit_title', { count:'exact' }).eq('status','live').eq('active',true).order('occurrence_id'), { label:'vocabulary occurrences' })
  ]);
  const studentIds = [...new Set(memberships.filter(row => row.ended_at == null).map(row => row.student_id))];
  const since = new Date(new Date(now).getTime() - ACTIVITY_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const [mastery, unitMastery, activity, awards, missions] = await Promise.all([
    fetchAllRowsForIds(studentIds, ids => client.from('vocabulary_global_mastery').select('student_id, vocabulary_id, status, strand_evidence, recent_error_pattern, updated_at', { count:'exact' }).in('student_id', ids).order('student_id').order('vocabulary_id'), { label:'vocabulary mastery' }),
    fetchAllRowsForIds(studentIds, ids => client.from('vocabulary_unit_mastery').select('student_id, occurrence_id, status, recent_error_pattern, contextual_evidence', { count:'exact' }).in('student_id', ids).order('student_id').order('occurrence_id'), { label:'vocabulary pathway progress' }),
    fetchAllRowsForIds(studentIds, ids => client.from('activity_events').select('id, user_id, occurred_at, event_type, metadata', { count:'exact' }).eq('app_key','vocabulary_paraphrase').in('user_id', ids).gte('occurred_at', since).order('occurred_at',{ ascending:false }).order('id'), { label:'vocabulary activity' }),
    optional(() => fetchAllRows(() => client.from('vocabulary_merit_awards').select('student_id, merit_number', { count:'exact' }).order('student_id').order('merit_number'), { label:'merit awards' })),
    optional(() => fetchAllRowsForIds(studentIds, ids => client.from('vocabulary_missions').select('mission_id, student_id, completed_at, mission_kind, unit_number', { count:'exact' }).in('student_id', ids).order('completed_at',{ ascending:false }).order('mission_id'), { label:'vocabulary missions' }))
  ]);
  return normalizeTeacherVocabularyData({ profiles, memberships, classes, items, occurrences, mastery, unitMastery, activity, awards, missions });
}

// One unit's live content, read completely (paged, stable order) so the readiness evaluator sees exactly what a student sees.
// Teachers can also read drafts, so every query keeps the same status = 'live' filter the student queries use.
export async function loadUnitReadinessContent(client, unitNumber) {
  const occurrences = await fetchAllRows(() => client.from('vocabulary_unit_occurrences').select('occurrence_id, vocabulary_id, unit_number, unit_title, set_number, position_in_unit, sense_id, status', { count:'exact' }).eq('unit_number', unitNumber).eq('status','live').eq('active',true).order('position_in_unit').order('occurrence_id'), { label:'unit occurrences' });
  const vocabularyIds = [...new Set(occurrences.map(row => row.vocabulary_id))];
  const occurrenceIds = occurrences.map(row => row.occurrence_id);
  const [items, contexts, activities] = await Promise.all([
    fetchAllRowsForIds(vocabularyIds, ids => client.from('vocabulary_items').select('vocabulary_id, term, part_of_speech, core_meaning, senses, word_family, collocations, status', { count:'exact' }).in('vocabulary_id', ids).eq('status','live').order('vocabulary_id'), { label:'unit items' }),
    fetchAllRowsForIds(occurrenceIds, ids => client.from('vocabulary_contexts').select('context_id, vocabulary_id, occurrence_id, sense_id, context_type, prompt_text, target_rewrite, accepted_answers, misconception_category, status', { count:'exact' }).in('occurrence_id', ids).eq('status','live').order('context_id'), { label:'unit contexts' }),
    fetchAllRows(() => client.from('vocabulary_unit_activities').select('activity_content_id, unit_number, content_type, activity_data, status', { count:'exact' }).eq('unit_number', unitNumber).eq('status','live').order('activity_content_id'), { label:'unit activities' })
  ]);
  return plannerContent({ occurrences, items, contexts, activities });
}

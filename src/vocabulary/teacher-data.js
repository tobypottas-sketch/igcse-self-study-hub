function assertNoError(result, message) {
  if (result?.error) throw new Error(message);
  return result?.data ?? [];
}

export function normalizeTeacherVocabularyData(raw = {}) {
  const profiles = raw.profiles ?? [];
  const memberships = (raw.memberships ?? []).filter(row => row.ended_at == null);
  const classesRaw = raw.classes ?? [];
  const items = (raw.items ?? []).map(row => ({ vocabularyId:row.vocabulary_id, term:row.term }));
  const occurrences = (raw.occurrences ?? []).map(row => ({ occurrenceId:row.occurrence_id, vocabularyId:row.vocabulary_id, unitNumber:row.unit_number, unitTitle:row.unit_title }));
  const mastery = (raw.mastery ?? []).map(row => ({ studentId:row.student_id, vocabularyId:row.vocabulary_id, status:row.status, strandEvidence:row.strand_evidence ?? {}, recentErrorPattern:row.recent_error_pattern ?? null, updatedAt:row.updated_at ?? null }));
  const activity = (raw.activity ?? []).map(row => ({ studentId:row.user_id, occurredAt:row.occurred_at, eventType:row.event_type, metadata:row.metadata ?? {} }));
  const profileById = new Map(profiles.filter(row => row.role === 'student').map(row => [row.id, { id:row.id, displayName:row.display_name }]));

  const classes = classesRaw.map(classRow => {
    const studentIds = memberships.filter(row => row.class_id === classRow.id).map(row => row.student_id).filter(id => profileById.has(id));
    const allowed = new Set(studentIds);
    return {
      id:classRow.id,
      className:classRow.class_name,
      students:studentIds.map(id => profileById.get(id)),
      mastery:mastery.filter(row => allowed.has(row.studentId)),
      activity:activity.filter(row => allowed.has(row.studentId)),
      targets:items,
      occurrences
    };
  });
  return { classes, targets:items, occurrences };
}

export async function loadVocabularyTeacherData(client) {
  const [profilesResult, membershipsResult, classesResult, itemsResult, occurrencesResult, masteryResult, activityResult] = await Promise.all([
    client.from('profiles').select('id, display_name, role').eq('role','student'),
    client.from('student_class_memberships').select('student_id, class_id, ended_at'),
    client.from('classes').select('id, class_name, active').eq('active',true),
    client.from('vocabulary_items').select('vocabulary_id, term').eq('status','live'),
    client.from('vocabulary_unit_occurrences').select('occurrence_id, vocabulary_id, unit_number, unit_title').eq('status','live').eq('active',true),
    client.from('vocabulary_global_mastery').select('student_id, vocabulary_id, status, strand_evidence, recent_error_pattern, updated_at'),
    client.from('activity_events').select('user_id, occurred_at, event_type, metadata').eq('app_key','vocabulary_paraphrase').order('occurred_at',{ ascending:false }).limit(5000)
  ]);
  return normalizeTeacherVocabularyData({
    profiles:assertNoError(profilesResult,'Unable to load students.'),
    memberships:assertNoError(membershipsResult,'Unable to load memberships.'),
    classes:assertNoError(classesResult,'Unable to load classes.'),
    items:assertNoError(itemsResult,'Unable to load vocabulary items.'),
    occurrences:assertNoError(occurrencesResult,'Unable to load vocabulary occurrences.'),
    mastery:assertNoError(masteryResult,'Unable to load vocabulary mastery.'),
    activity:assertNoError(activityResult,'Unable to load vocabulary activity.')
  });
}

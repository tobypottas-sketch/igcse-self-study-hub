const TIMED_DURATIONS = new Set([5,10,15,20]);

export function buildTeamsTargetList(rows = []) {
  const header = 'Student\tTarget word/phrase\tWeak strand\tFailure type';
  const lines = rows.map(row => [row.student, row.term, row.strand, row.failureType].map(value => String(value ?? '').replace(/[\t\r\n]+/g,' ')).join('\t'));
  return [header, ...lines].join('\n');
}

export function buildVocabularyInterventionDraft({ affectedStudents = [], studentId = null, strand = null, vocabularyIds = [], unitNumber = null, durationMinutes = null } = {}) {
  const studentIds = studentId ? [studentId] : affectedStudents.map(row => row.studentId ?? row.id).filter(Boolean);
  if (!studentIds.length) throw new Error('At least one student is required for a vocabulary recommendation.');
  const session = durationMinutes == null ? { mode:'adaptive' } : (() => {
    const minutes = Number(durationMinutes);
    if (!TIMED_DURATIONS.has(minutes)) throw new Error('Timed session duration must be 5, 10, 15 or 20 minutes.');
    return { mode:'timed', durationMinutes:minutes };
  })();
  const context = {};
  if (unitNumber != null) context.unitNumber = Number(unitNumber);
  if (vocabularyIds.length) context.vocabularyIds = [...new Set(vocabularyIds)];
  return {
    interventionType:'recommendation',
    targetScope:studentIds.length === 1 ? 'student' : 'group',
    studentIds,
    learningArea:'vocabulary_paraphrase',
    skill:strand || null,
    context,
    session,
    reasonCode:strand ? `persistent_${strand}_gap` : 'persistent_vocabulary_gap'
  };
}

export async function createLearningIntervention(client, input = {}) {
  const body = { action:'create', ...input };
  delete body.createdBy;
  const { data, error } = await client.functions.invoke('learning-intervention-action', { body });
  if (error || !data?.ok) throw new Error(data?.error || error?.message || 'Unable to create learning intervention.');
  return data.intervention;
}

export async function updateLearningInterventionStatus(client, interventionId, status) {
  const { data, error } = await client.functions.invoke('learning-intervention-action', { body:{ action:'status', interventionId, status } });
  if (error || !data?.ok) throw new Error(data?.error || error?.message || 'Unable to update learning intervention.');
  return data.intervention;
}

export async function recordLearningInterventionOutcome(client, interventionId, outcomeStatus, outcomeSummary = {}) {
  const { data, error } = await client.functions.invoke('learning-intervention-action', { body:{ action:'outcome', interventionId, outcomeStatus, outcomeSummary } });
  if (error || !data?.ok) throw new Error(data?.error || error?.message || 'Unable to record intervention outcome.');
  return data.intervention;
}

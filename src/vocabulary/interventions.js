export function buildTeamsTargetList(rows = []) {
  const header = 'Student\tTarget word/phrase\tWeak strand\tFailure type';
  const lines = rows.map(row => [row.student, row.term, row.strand, row.failureType].map(value => String(value ?? '').replace(/[\t\r\n]+/g,' ')).join('\t'));
  return [header, ...lines].join('\n');
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

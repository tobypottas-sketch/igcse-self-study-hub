function rowsOrThrow(result, message) {
  if (result?.error) throw new Error(message);
  return result?.data ?? [];
}

export async function loadVocabularyUnitCheckAttempts(client, unitNumber) {
  const result = await client
    .from('vocabulary_unit_check_attempts')
    .select('unit_number, form_id, attempt_number, score, max_score, completed_at')
    .eq('unit_number', Number(unitNumber))
    .order('attempt_number', { ascending:true });
  return rowsOrThrow(result, 'Unable to load your Unit Vocabulary Check scores.');
}

export async function recordVocabularyUnitCheckAttempt(client, { unitNumber, formId, attemptNumber, score, maxScore } = {}) {
  const payload = {
    unit_number:Number(unitNumber),
    form_id:String(formId ?? ''),
    attempt_number:Number(attemptNumber),
    score:Number(score),
    max_score:Number(maxScore)
  };
  const result = await client
    .from('vocabulary_unit_check_attempts')
    .insert(payload)
    .select('unit_number, form_id, attempt_number, score, max_score, completed_at')
    .single();
  if (result?.error || !result?.data) {
    const error = new Error(result?.error?.message || 'Unable to save your Unit Vocabulary Check score.');
    error.code = result?.error?.code ?? null;
    throw error;
  }
  return result.data;
}

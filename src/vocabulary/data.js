function assertNoError(result, message) {
  if (result?.error) throw new Error(message);
  return result?.data ?? [];
}

export async function loadVocabularyDashboard(client) {
  const [occurrencesResult, globalResult, unitResult] = await Promise.all([
    client.from('vocabulary_unit_occurrences').select('occurrence_id, vocabulary_id, unit_number, unit_title, set_number, position_in_unit, status').eq('status','live').eq('active',true).order('unit_number').order('position_in_unit'),
    client.from('vocabulary_global_mastery').select('vocabulary_id, status, review_due_at, recent_error_pattern, strand_evidence'),
    client.from('vocabulary_unit_mastery').select('occurrence_id, status, recent_error_pattern, contextual_evidence')
  ]);
  return {
    occurrences:assertNoError(occurrencesResult, 'Unable to load vocabulary units.'),
    global:assertNoError(globalResult, 'Unable to load vocabulary mastery.'),
    unit:assertNoError(unitResult, 'Unable to load unit mastery.')
  };
}

export async function loadVocabularyUnit(client, unitNumber) {
  const occurrencesResult = await client
    .from('vocabulary_unit_occurrences')
    .select('occurrence_id, vocabulary_id, unit_number, unit_title, set_number, position_in_unit, sense_id, status')
    .eq('unit_number', unitNumber)
    .eq('status', 'live')
    .eq('active', true)
    .order('position_in_unit');
  const occurrences = assertNoError(occurrencesResult, 'Unable to load vocabulary unit.');
  const vocabularyIds = [...new Set(occurrences.map(row => row.vocabulary_id))];
  const occurrenceIds = occurrences.map(row => row.occurrence_id);

  const [itemsResult, contextsResult] = await Promise.all([
    client.from('vocabulary_items').select('vocabulary_id, term, part_of_speech, core_meaning, senses, word_family, collocations, status').in('vocabulary_id', vocabularyIds).eq('status', 'live'),
    client.from('vocabulary_contexts').select('context_id, vocabulary_id, occurrence_id, sense_id, context_type, prompt_text, target_rewrite, accepted_answers, misconception_category, status').in('occurrence_id', occurrenceIds).eq('status', 'live')
  ]);
  return {
    occurrences,
    items:assertNoError(itemsResult, 'Unable to load vocabulary items.'),
    contexts:assertNoError(contextsResult, 'Unable to load vocabulary contexts.')
  };
}

export async function loadStudentMastery(client, unitNumber) {
  const occurrencesResult = await client
    .from('vocabulary_unit_occurrences')
    .select('occurrence_id, vocabulary_id')
    .eq('unit_number', unitNumber)
    .eq('status', 'live')
    .eq('active', true);
  const occurrences = assertNoError(occurrencesResult, 'Unable to load vocabulary unit.');
  const vocabularyIds = [...new Set(occurrences.map(row => row.vocabulary_id))];
  const occurrenceIds = occurrences.map(row => row.occurrence_id);
  const [globalResult, unitResult] = await Promise.all([
    client.from('vocabulary_global_mastery').select('*').in('vocabulary_id', vocabularyIds),
    client.from('vocabulary_unit_mastery').select('*').in('occurrence_id', occurrenceIds)
  ]);
  return {
    global:assertNoError(globalResult, 'Unable to load vocabulary mastery.'),
    unit:assertNoError(unitResult, 'Unable to load unit mastery.')
  };
}

export async function submitVocabularyAttempt(client, input = {}) {
  const body = {
    occurrenceId:input.occurrenceId,
    contextId:input.contextId,
    questionType:input.questionType,
    rawAnswer:input.rawAnswer,
    firstAttempt:input.firstAttempt !== false,
    retryUsed:input.retryUsed === true,
    recoveredLater:input.recoveredLater === true,
    review:input.review === true,
    preview:input.preview === true
  };
  const { data, error } = await client.functions.invoke('vocabulary-attempt-action', { body });
  if (error || !data?.ok) throw new Error(data?.error || error?.message || 'Unable to mark vocabulary attempt.');
  return data;
}

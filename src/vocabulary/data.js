import { buildPathwayCoverage } from './pathway-coverage.js';
import { registerPathwayCoverage } from './pathway-coverage-store.js';

function assertNoError(result, message) {
  if (result?.error) throw new Error(message);
  return result?.data ?? [];
}

function plannerContent({ occurrences = [], items = [], contexts = [], activities = [] } = {}) {
  const normalizedOccurrences = occurrences.map(row => ({
    occurrenceId:row.occurrence_id,
    vocabularyId:row.vocabulary_id,
    unitNumber:row.unit_number,
    unitTitle:row.unit_title,
    setNumber:row.set_number,
    positionInUnit:row.position_in_unit,
    senseId:row.sense_id
  }));
  const normalizedItems = items.map(row => ({
    vocabularyId:row.vocabulary_id,
    term:row.term,
    partOfSpeech:row.part_of_speech,
    coreMeaning:row.core_meaning,
    senses:row.senses ?? [],
    wordFamily:row.word_family ?? [],
    collocations:row.collocations ?? []
  }));
  const normalizedContexts = contexts.map(row => ({
    contextId:row.context_id,
    vocabularyId:row.vocabulary_id,
    occurrenceId:row.occurrence_id,
    senseId:row.sense_id,
    type:row.context_type,
    text:row.prompt_text,
    targetRewrite:row.target_rewrite,
    acceptedAnswers:row.accepted_answers ?? [],
    misconceptionCategory:row.misconception_category
  }));
  const normalizedActivities = activities.map(row => ({
    activityContentId:row.activity_content_id,
    unitNumber:row.unit_number,
    contentType:row.content_type,
    activityData:row.activity_data ?? {},
    status:row.status
  }));
  const content = {
    occurrences:normalizedOccurrences,
    items:normalizedItems,
    contexts:normalizedContexts,
    activities:normalizedActivities,
    itemsById:Object.fromEntries(normalizedItems.map(row => [row.vocabularyId,row])),
    contextsByOccurrence:{}
  };
  for (const ctx of normalizedContexts) (content.contextsByOccurrence[ctx.occurrenceId] ??= []).push(ctx);
  return content;
}

export async function loadVocabularyDashboard(client, options = {}) {
  const occurrencesResult = await client.from('vocabulary_unit_occurrences').select('occurrence_id, vocabulary_id, unit_number, unit_title, set_number, position_in_unit, sense_id, status').eq('status','live').eq('active',true).order('unit_number').order('position_in_unit');
  const occurrences = assertNoError(occurrencesResult, 'Unable to load vocabulary units.');
  if (options.preview === true) return { occurrences, global:[], unit:[] };
  const [globalResult, unitResult] = await Promise.all([
    client.from('vocabulary_global_mastery').select('vocabulary_id, status, review_due_at, recent_error_pattern, strand_evidence'),
    client.from('vocabulary_unit_mastery').select('occurrence_id, status, recent_error_pattern, contextual_evidence')
  ]);
  return { occurrences, global:assertNoError(globalResult, 'Unable to load vocabulary mastery.'), unit:assertNoError(unitResult, 'Unable to load unit mastery.') };
}

export async function loadVocabularyUnit(client, unitNumber, options = {}) {
  const preloaded = Array.isArray(options.occurrences) ? options.occurrences.filter(row => Number(row.unit_number) === Number(unitNumber)) : null;
  const occurrences = preloaded ?? assertNoError(
    await client.from('vocabulary_unit_occurrences').select('occurrence_id, vocabulary_id, unit_number, unit_title, set_number, position_in_unit, sense_id, status').eq('unit_number', unitNumber).eq('status', 'live').eq('active', true).order('position_in_unit'),
    'Unable to load vocabulary unit.'
  );
  const vocabularyIds = [...new Set(occurrences.map(row => row.vocabulary_id))];
  const occurrenceIds = occurrences.map(row => row.occurrence_id);
  const [itemsResult, contextsResult, activitiesResult] = await Promise.all([
    client.from('vocabulary_items').select('vocabulary_id, term, part_of_speech, core_meaning, senses, word_family, collocations, status').in('vocabulary_id', vocabularyIds).eq('status', 'live'),
    client.from('vocabulary_contexts').select('context_id, vocabulary_id, occurrence_id, sense_id, context_type, prompt_text, target_rewrite, accepted_answers, misconception_category, status').in('occurrence_id', occurrenceIds).eq('status', 'live'),
    client.from('vocabulary_unit_activities').select('activity_content_id, unit_number, content_type, activity_data, status').eq('unit_number', unitNumber).eq('status', 'live')
  ]);
  const items = assertNoError(itemsResult, 'Unable to load vocabulary items.');
  const contexts = assertNoError(contextsResult, 'Unable to load vocabulary contexts.');
  const activities = assertNoError(activitiesResult, 'Unable to load vocabulary activities.');
  const coverage = buildPathwayCoverage({ content:plannerContent({ occurrences, items, contexts, activities }) });
  registerPathwayCoverage(unitNumber, coverage);
  return { occurrences, items, contexts, activities };
}

export async function loadStudentMastery(client, unitNumber, options = {}) {
  const preloaded = Array.isArray(options.occurrences) ? options.occurrences.filter(row => Number(row.unit_number) === Number(unitNumber)) : null;
  const occurrences = preloaded ?? assertNoError(
    await client.from('vocabulary_unit_occurrences').select('occurrence_id, vocabulary_id').eq('unit_number', unitNumber).eq('status', 'live').eq('active', true),
    'Unable to load vocabulary unit.'
  );
  const vocabularyIds = [...new Set(occurrences.map(row => row.vocabulary_id))];
  const occurrenceIds = occurrences.map(row => row.occurrence_id);
  const [globalResult, unitResult] = await Promise.all([
    client.from('vocabulary_global_mastery').select('*').in('vocabulary_id', vocabularyIds),
    client.from('vocabulary_unit_mastery').select('*').in('occurrence_id', occurrenceIds)
  ]);
  return { global:assertNoError(globalResult, 'Unable to load vocabulary mastery.'), unit:assertNoError(unitResult, 'Unable to load unit mastery.') };
}

export async function loadPathwayJourney(client, unitNumber, options = {}) {
  if (options.preview === true) return [];
  const result = await client
    .from('vocabulary_unit_pathway_journey')
    .select('unit_number, pathway_id, current_stage, completed_stages, stage_attempts, stage_clean_successes, updated_at')
    .eq('unit_number', unitNumber);
  return assertNoError(result, 'Unable to load vocabulary pathway progress.');
}

export async function submitVocabularyAttempt(client, input = {}) {
  const contentSource = input.contentSource ?? (input.activityContentId ? 'unit_activity' : 'context');
  const body = {
    attemptId:input.attemptId ?? crypto.randomUUID(),
    occurrenceId:input.occurrenceId,
    contextId:input.contextId ?? null,
    activityContentId:input.activityContentId ?? null,
    activityVariantId:input.activityVariantId ?? null,
    contentSource,
    primaryEvidenceTargetId:input.primaryEvidenceTargetId ?? null,
    questionType:input.questionType,
    rawAnswer:input.rawAnswer,
    strands:Array.isArray(input.strands) ? input.strands : undefined,
    evidenceStrength:input.evidenceStrength ?? null,
    supportLevel:input.supportLevel ?? null,
    productive:input.productive === true,
    repeatedGuess:input.repeatedGuess === true,
    firstAttempt:input.firstAttempt !== false,
    retryUsed:input.retryUsed === true,
    recoveredLater:input.recoveredLater === true,
    review:input.review === true,
    preview:input.preview === true,
    pathwayId:input.pathwayId ?? null,
    pathwayStage:input.pathwayStage ?? null,
    servedPathwayStage:input.servedPathwayStage ?? null
  };
  const { data, error } = await client.functions.invoke('vocabulary-attempt-action', { body });
  if (error || !data?.ok) throw new Error(data?.error || error?.message || 'Unable to mark vocabulary attempt.');
  return data;
}

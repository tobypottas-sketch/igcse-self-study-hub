const ID_RE = /^[a-z0-9_:-]{1,160}$/i;
const QUESTION_TYPES = new Set([
  'meaning_match','paraphrase_match','context_inference','question_text_bridge','context_gap_fill',
  'replace_phrase','produce_paraphrase','use_target','identify_inaccurate_paraphrase','mini_mixed_check',
  'which_situation_fits','meaning_in_context','correct_usage','collocation_builder','word_family_switch',
  'find_evidence','phrase_match','build_paraphrase','complete_paraphrase','rewrite_phrase','same_idea',
  'spot_meaning_change','build_same_idea','rewrite_idea','improve_vocabulary','explain_another_way'
]);
const STRANDS = new Set(['meaning','recognition','context','paraphrasing','production']);
const MISCONCEPTIONS = new Set([
  'related_but_inaccurate','wrong_form','meaning_confusion','retrieval_failure','context_mismatch',
  'quantity_change','degree_change','time_change','cause_effect_change','contrast_change','added_information',
  'omitted_information','unnatural_collocation','too_vague','register_mismatch'
]);
const EVIDENCE_STRENGTHS = new Set(['light','medium','strong','very_strong']);
const SUPPORT_LEVELS = new Set(['none','light','major']);
const CONTENT_SOURCES = new Set(['context','unit_activity']);

function id(value, label) {
  const text = String(value ?? '').trim();
  if (!ID_RE.test(text)) throw new Error(`${label} is invalid.`);
  return text;
}

function optionalId(value, label) {
  if (value == null || value === '') return null;
  return id(value, label);
}

function validateStrands(value) {
  if (value == null) return [];
  if (!Array.isArray(value) || value.length === 0) throw new Error('Vocabulary strands are invalid.');
  const strands = [...new Set(value.map(item => String(item ?? '').trim()))];
  if (strands.some(strand => !STRANDS.has(strand))) throw new Error('Vocabulary strand is invalid.');
  return strands;
}

export function validateVocabularyAttempt(value = {}) {
  const rawAnswer = String(value.rawAnswer ?? '');
  if (!rawAnswer.trim() || rawAnswer.length > 500) throw new Error('Answer must contain 1–500 characters.');
  if (!QUESTION_TYPES.has(value.questionType)) throw new Error('Question type is invalid.');
  const contextId = optionalId(value.contextId, 'Context ID');
  const activityContentId = optionalId(value.activityContentId, 'Activity content ID');
  const inferredSource = value.contentSource ?? (activityContentId ? 'unit_activity' : 'context');
  if (!CONTENT_SOURCES.has(inferredSource)) throw new Error('Content source is invalid.');
  if (inferredSource === 'context' && !contextId) throw new Error('Context ID is required for context content.');
  if (inferredSource === 'unit_activity' && !activityContentId) throw new Error('Activity content ID is required for unit activity content.');
  if (value.evidenceStrength != null && !EVIDENCE_STRENGTHS.has(value.evidenceStrength)) throw new Error('Evidence strength is invalid.');
  if (value.supportLevel != null && !SUPPORT_LEVELS.has(value.supportLevel)) throw new Error('Support level is invalid.');
  return {
    occurrenceId:id(value.occurrenceId, 'Occurrence ID'),
    contextId,
    activityContentId,
    contentSource:inferredSource,
    primaryEvidenceTargetId:optionalId(value.primaryEvidenceTargetId, 'Primary evidence target ID'),
    questionType:value.questionType,
    rawAnswer,
    strands:validateStrands(value.strands),
    evidenceStrength:value.evidenceStrength ?? null,
    supportLevel:value.supportLevel ?? null,
    productive:value.productive === true,
    repeatedGuess:value.repeatedGuess === true,
    firstAttempt:value.firstAttempt !== false,
    retryUsed:value.retryUsed === true,
    recoveredLater:value.recoveredLater === true,
    review:value.review === true,
    preview:value.preview === true
  };
}

export function strandForQuestionType(questionType) {
  if (['produce_paraphrase','use_target','replace_phrase','rewrite_phrase','rewrite_idea','improve_vocabulary','explain_another_way','word_family_switch','collocation_builder'].includes(questionType)) return 'production';
  if (['build_paraphrase','complete_paraphrase','build_same_idea','same_idea','spot_meaning_change','phrase_match'].includes(questionType)) return 'paraphrasing';
  if (['context_inference','question_text_bridge','context_gap_fill','mini_mixed_check','find_evidence','meaning_in_context','correct_usage','which_situation_fits'].includes(questionType)) return 'context';
  if (questionType === 'paraphrase_match') return 'paraphrasing';
  if (questionType === 'meaning_match') return 'meaning';
  return 'recognition';
}

export function buildStoredAttemptMetadata(value = {}) {
  const strand = STRANDS.has(value.strand) ? value.strand : strandForQuestionType(value.questionType);
  const output = {
    unit_number:Number(value.unitNumber),
    strand,
    question_type:value.questionType,
    attempt_number:value.firstAttempt === false ? 2 : 1,
    outcome:value.correct ? 'correct' : 'try_again',
    retry_used:value.retryUsed === true,
    recovery:value.recoveredLater === true,
    target_id:id(value.vocabularyId, 'Vocabulary ID'),
    occurrence_id:id(value.occurrenceId, 'Occurrence ID')
  };
  if (MISCONCEPTIONS.has(value.misconceptionCategory)) output.misconception = value.misconceptionCategory;
  if (EVIDENCE_STRENGTHS.has(value.evidenceStrength)) output.evidence_strength = value.evidenceStrength;
  if (SUPPORT_LEVELS.has(value.supportLevel)) output.support_level = value.supportLevel;
  return output;
}

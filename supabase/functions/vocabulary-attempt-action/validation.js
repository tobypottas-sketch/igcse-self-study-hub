const ID_RE = /^[a-z0-9_:-]{1,160}$/i;
const QUESTION_TYPES = new Set([
  'meaning_match','paraphrase_match','context_inference','question_text_bridge','context_gap_fill',
  'replace_phrase','produce_paraphrase','use_target','identify_inaccurate_paraphrase','mini_mixed_check'
]);
const STRANDS = new Set(['meaning','recognition','context','paraphrasing','production']);
const MISCONCEPTIONS = new Set(['related_but_inaccurate','wrong_form','meaning_confusion','retrieval_failure','context_mismatch']);

function id(value, label) {
  const text = String(value ?? '').trim();
  if (!ID_RE.test(text)) throw new Error(`${label} is invalid.`);
  return text;
}

export function validateVocabularyAttempt(value = {}) {
  const rawAnswer = String(value.rawAnswer ?? '');
  if (!rawAnswer.trim() || rawAnswer.length > 500) throw new Error('Answer must contain 1–500 characters.');
  if (!QUESTION_TYPES.has(value.questionType)) throw new Error('Question type is invalid.');
  return {
    occurrenceId:id(value.occurrenceId, 'Occurrence ID'),
    contextId:id(value.contextId, 'Context ID'),
    questionType:value.questionType,
    rawAnswer,
    firstAttempt:value.firstAttempt !== false,
    retryUsed:value.retryUsed === true,
    recoveredLater:value.recoveredLater === true,
    review:value.review === true,
    preview:value.preview === true
  };
}

export function strandForQuestionType(questionType) {
  if (['produce_paraphrase','use_target','replace_phrase'].includes(questionType)) return 'production';
  if (['context_inference','question_text_bridge','context_gap_fill','mini_mixed_check'].includes(questionType)) return 'context';
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
  return output;
}

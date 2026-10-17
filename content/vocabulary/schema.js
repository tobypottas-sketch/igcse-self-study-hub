const STATUSES = new Set(['draft', 'reviewed', 'approved', 'live']);
const CONTEXT_TYPES = new Set(['meaning_context', 'paraphrase_context', 'production_context', 'reading_bridge', 'gap_fill', 'mixed_check']);

function text(value) {
  return String(value ?? '').trim();
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function errorIf(errors, condition, message) {
  if (condition) errors.push(message);
}

export function validateVocabularyItem(item = {}, { strict = true } = {}) {
  const errors = [];
  errorIf(errors, !text(item.vocabularyId), 'Vocabulary ID is required.');
  errorIf(errors, !text(item.term), 'Vocabulary term is required.');
  errorIf(errors, item.status != null && !STATUSES.has(item.status), 'Vocabulary status is invalid.');

  if (strict) {
    errorIf(errors, !text(item.partOfSpeech), `${text(item.term) || 'Item'} needs a part of speech.`);
    errorIf(errors, !text(item.coreMeaning), `${text(item.term) || 'Item'} needs a core meaning.`);
    errorIf(errors, array(item.senses).length === 0, `${text(item.term) || 'Item'} needs at least one sense.`);
    for (const sense of array(item.senses)) {
      errorIf(errors, !text(sense?.senseId), `${text(item.term) || 'Item'} has a sense without an ID.`);
      errorIf(errors, !text(sense?.meaning), `${text(item.term) || 'Item'} has a sense without a meaning.`);
      errorIf(errors, !Array.isArray(sense?.acceptedParaphrases), `${text(item.term) || 'Item'} accepted paraphrases must be an array.`);
      errorIf(errors, !Array.isArray(sense?.contextDependentParaphrases), `${text(item.term) || 'Item'} context-dependent paraphrases must be an array.`);
      errorIf(errors, !Array.isArray(sense?.misleadingDistractors), `${text(item.term) || 'Item'} distractors must be an array.`);
    }
  }

  return { ok: errors.length === 0, errors };
}

export function acceptedAnswersForContext(item, senseId, contextId) {
  const sense = array(item?.senses).find(candidate => candidate?.senseId === senseId);
  if (!sense) return [];
  const answers = new Set(array(sense.acceptedParaphrases).map(text).filter(Boolean));
  for (const scoped of array(sense.contextDependentParaphrases)) {
    if (scoped?.contextId !== contextId) continue;
    for (const answer of array(scoped.answers)) {
      const value = text(answer);
      if (value) answers.add(value);
    }
  }
  return [...answers];
}

function validateContext(context, strict) {
  const errors = [];
  errorIf(errors, !text(context?.contextId), 'Context ID is required.');
  errorIf(errors, !text(context?.vocabularyId), 'Context vocabulary ID is required.');
  errorIf(errors, !text(context?.senseId), 'Context sense ID is required.');
  if (context?.type != null) errorIf(errors, !CONTEXT_TYPES.has(context.type), `Context ${text(context.contextId)} has an invalid type.`);
  if (strict) {
    errorIf(errors, !text(context?.text), `Context ${text(context?.contextId)} needs text.`);
    if (context?.type === 'production_context') {
      errorIf(errors, array(context?.acceptedAnswers).map(text).filter(Boolean).length === 0, `Production context ${text(context?.contextId)} needs an accepted answer.`);
    }
  }
  return errors;
}

export function validateUnit(unit = {}) {
  const errors = [];
  const strict = unit.status === 'live';
  const items = array(unit.items);
  const occurrences = array(unit.occurrences);
  const contexts = array(unit.contexts);
  const itemsById = new Map(items.map(item => [item.vocabularyId, item]));
  const contextsById = new Map(contexts.map(context => [context.contextId, context]));

  errorIf(errors, !Number.isInteger(unit.unitNumber) || unit.unitNumber < 1 || unit.unitNumber > 20, 'Unit number must be 1–20.');
  errorIf(errors, !text(unit.unitTitle), 'Unit title is required.');
  errorIf(errors, unit.status != null && !STATUSES.has(unit.status), 'Unit status is invalid.');

  if (strict) {
    errorIf(errors, occurrences.length !== 50, 'A live unit must contain exactly 50 occurrences.');
    const occurrenceIds = new Set(occurrences.map(item => item.occurrenceId));
    errorIf(errors, occurrenceIds.size !== occurrences.length, 'A live unit must have distinct occurrence IDs.');
    const vocabularyIds = occurrences.map(item => item.vocabularyId);
    errorIf(errors, new Set(vocabularyIds).size !== vocabularyIds.length, 'A live unit must contain 50 distinct vocabulary targets.');
    for (let setNumber = 1; setNumber <= 5; setNumber += 1) {
      const expected = occurrences.filter(occurrence => occurrence.setNumber === setNumber);
      errorIf(errors, expected.length !== 10, `Set ${setNumber} must contain exactly ten targets.`);
    }
  }

  for (const item of items) errors.push(...validateVocabularyItem(item, { strict }).errors);

  for (const occurrence of occurrences) {
    const label = text(occurrence.occurrenceId) || 'Occurrence';
    errorIf(errors, !text(occurrence.occurrenceId), 'Occurrence ID is required.');
    errorIf(errors, !text(occurrence.vocabularyId), `${label} needs a vocabulary ID.`);
    errorIf(errors, !itemsById.has(occurrence.vocabularyId), `${label} references a missing vocabulary item.`);
    errorIf(errors, occurrence.unitNumber !== unit.unitNumber, `${label} has the wrong unit number.`);
    errorIf(errors, occurrence.unitTitle !== unit.unitTitle, `${label} has the wrong unit title.`);
    errorIf(errors, !Number.isInteger(occurrence.setNumber) || occurrence.setNumber < 1 || occurrence.setNumber > 5, `${label} has an invalid set number.`);
    errorIf(errors, !Number.isInteger(occurrence.positionInUnit) || occurrence.positionInUnit < 1 || occurrence.positionInUnit > 50, `${label} has an invalid position.`);
    errorIf(errors, !text(occurrence.senseId), `${label} needs a sense ID.`);

    const contextIds = array(occurrence.contextIds);
    if (strict) errorIf(errors, contextIds.length < 3, `${label} needs at least three curated contexts.`);
    for (const contextId of contextIds) {
      const context = contextsById.get(contextId);
      errorIf(errors, !context, `${label} references missing context ${contextId}.`);
      if (context) {
        errorIf(errors, context.vocabularyId !== occurrence.vocabularyId, `${contextId} belongs to the wrong vocabulary item.`);
        errorIf(errors, context.occurrenceId && context.occurrenceId !== occurrence.occurrenceId, `${contextId} belongs to the wrong occurrence.`);
        errorIf(errors, context.senseId !== occurrence.senseId, `${contextId} belongs to the wrong sense.`);
      }
    }
    if (strict) {
      const productionContexts = contextIds.map(id => contextsById.get(id)).filter(context => context?.type === 'production_context');
      errorIf(errors, productionContexts.length === 0, `${label} needs production marking material.`);
      for (const context of productionContexts) {
        errorIf(errors, array(context.acceptedAnswers).map(text).filter(Boolean).length === 0, `Production context ${context.contextId} needs an accepted answer.`);
      }
    }
  }

  for (const context of contexts) errors.push(...validateContext(context, strict));

  return { ok: errors.length === 0, errors };
}

export const VOCABULARY_CONTENT_STATUSES = Object.freeze([...STATUSES]);
export const VOCABULARY_CONTEXT_TYPES = Object.freeze([...CONTEXT_TYPES]);

import { EXPECTED_WORDS_PER_UNIT, unitConfig } from './unit-registry.js';

const STATUSES = new Set(['draft', 'reviewed', 'approved', 'live']);
const CONTEXT_TYPES = new Set(['meaning_context', 'paraphrase_context', 'production_context', 'reading_bridge', 'gap_fill', 'mixed_check']);
const UNIT_ACTIVITY_TYPES = new Set(['phrase_set', 'idea_set', 'question_text', 'writing_set']);

function text(value) {
  return String(value ?? '').trim();
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function object(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function errorIf(errors, condition, message) {
  if (condition) errors.push(message);
}

function nonEmptyTextArray(value) {
  return array(value).map(text).filter(Boolean);
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
      // Optional Word Families Mastery data. When present every row must be well formed; a malformed row is an error, never silently skipped.
      if (sense?.wordFamilyForms != null) {
        errorIf(errors, !Array.isArray(sense.wordFamilyForms), `${text(item.term) || 'Item'} wordFamilyForms must be an array.`);
        for (const row of array(sense.wordFamilyForms)) {
          const label = `${text(item.term) || 'Item'} family form “${text(row?.form)}”`;
          errorIf(errors, !text(row?.form), `${text(item.term) || 'Item'} has a family form without text.`);
          errorIf(errors, !['noun','verb','adjective','adverb'].includes(row?.partOfSpeech), `${label} needs partOfSpeech noun, verb, adjective or adverb (authored, never inferred).`);
          errorIf(errors, typeof row?.pedagogicallyUseful !== 'boolean', `${label} needs pedagogicallyUseful true or false.`);
          errorIf(errors, !text(row?.example) || !new RegExp(`(^|[^A-Za-z])${text(row?.form).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?=$|[^A-Za-z])`, 'i').test(text(row?.example)), `${label} needs an example sentence that contains the form.`);
        }
      }
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
      errorIf(errors, nonEmptyTextArray(context?.acceptedAnswers).length === 0, `Production context ${text(context?.contextId)} needs an accepted answer.`);
    }
  }
  return errors;
}

function validatePhraseSet(data, label, errors) {
  errorIf(errors, !text(data.originalPhrase), `${label} needs an original phrase.`);
  errorIf(errors, !text(data.equivalentPhrase), `${label} needs an equivalent phrase.`);
  errorIf(errors, !Array.isArray(data.acceptedVariants), `${label} accepted variants must be an array.`);
  errorIf(errors, nonEmptyTextArray(data.chunks).length < 2, `${label} needs at least two curated build chunks.`);
  errorIf(errors, nonEmptyTextArray(data.commonMeaningDistortions).length === 0, `${label} needs at least one common meaning distortion.`);
}

function validateIdeaSet(data, label, errors) {
  errorIf(errors, !text(data.originalIdea), `${label} needs an original idea.`);
  errorIf(errors, nonEmptyTextArray(data.accurateParaphrases).length === 0, `${label} needs at least one accurate paraphrase.`);
  errorIf(errors, array(data.meaningInvariants).length === 0, `${label} needs at least one meaning invariant.`);
  for (const invariant of array(data.meaningInvariants)) {
    errorIf(errors, !text(invariant?.type), `${label} has a meaning invariant without a type.`);
    errorIf(errors, invariant?.value == null || !text(invariant.value), `${label} has a meaning invariant without a value.`);
  }
  errorIf(errors, array(data.distractors).length === 0, `${label} needs at least one meaning-change distractor.`);
  for (const distractor of array(data.distractors)) {
    errorIf(errors, !text(distractor?.text), `${label} has a distractor without text.`);
    errorIf(errors, !text(distractor?.misconceptionCategory), `${label} has a distractor without a misconception category.`);
  }
}

function validateQuestionText(data, label, errors) {
  errorIf(errors, !text(data.sourceText), `${label} needs source text.`);
  errorIf(errors, array(data.questions).length === 0, `${label} needs at least one question.`);
  for (const question of array(data.questions)) {
    errorIf(errors, !text(question?.question), `${label} has a question without text.`);
    errorIf(errors, nonEmptyTextArray(question?.evidenceSpans).length === 0, `${label} question needs at least one evidence span.`);
    errorIf(errors, array(question?.paraphraseLinks).length === 0, `${label} question needs at least one paraphrase link.`);
    for (const link of array(question?.paraphraseLinks)) {
      errorIf(errors, !text(link?.questionText) || !text(link?.sourceText), `${label} has an incomplete paraphrase link.`);
    }
  }
}

function validateWritingSet(data, label, errors) {
  errorIf(errors, !text(data.taskType), `${label} needs a writing task type.`);
  errorIf(errors, !text(data.prompt), `${label} needs a writing prompt.`);
  errorIf(errors, !text(data.sourceText), `${label} needs writing source text.`);
  errorIf(errors, nonEmptyTextArray(data.acceptedAnswers).length === 0, `${label} needs at least one accepted answer.`);
}

export function validateUnitActivity(activity = {}, { strict = true, unitNumber = null, itemIds = new Set() } = {}) {
  const errors = [];
  const label = `Activity ${text(activity.activityContentId) || '(unnamed)'}`;
  const contentType = text(activity.contentType);
  const data = object(activity.activityData);
  errorIf(errors, !text(activity.activityContentId), 'Activity content ID is required.');
  errorIf(errors, !Number.isInteger(activity.unitNumber) || activity.unitNumber < 1 || activity.unitNumber > 20, `${label} has an invalid unit number.`);
  if (unitNumber != null) errorIf(errors, activity.unitNumber !== unitNumber, `${label} has the wrong unit number.`);
  errorIf(errors, !UNIT_ACTIVITY_TYPES.has(contentType), `${label} has an invalid content type.`);
  errorIf(errors, activity.status != null && !STATUSES.has(activity.status), `${label} has an invalid status.`);
  if (strict) errorIf(errors, !['approved','live'].includes(activity.status), `${label} must be approved before use in an approved/live unit.`);

  const linked = nonEmptyTextArray(data.linkedVocabularyIds);
  errorIf(errors, data.linkedVocabularyIds != null && !Array.isArray(data.linkedVocabularyIds), `${label} linked vocabulary IDs must be an array.`);
  errorIf(errors, new Set(linked).size !== linked.length, `${label} has duplicate linked vocabulary IDs.`);
  for (const vocabularyId of linked) errorIf(errors, itemIds.size > 0 && !itemIds.has(vocabularyId), `${label} references unknown linked vocabulary ${vocabularyId}.`);
  const primary = text(data.primaryEvidenceTargetId);
  if (data.primaryEvidenceTargetId != null) {
    errorIf(errors, !primary, `${label} has an invalid primary evidence target.`);
    errorIf(errors, primary && itemIds.size > 0 && !itemIds.has(primary), `${label} primary evidence target is not a vocabulary item in this unit.`);
    errorIf(errors, primary && !linked.includes(primary), `${label} primary evidence target must also be a linked vocabulary ID.`);
  }

  if (strict) {
    if (contentType === 'phrase_set') validatePhraseSet(data, label, errors);
    if (contentType === 'idea_set') validateIdeaSet(data, label, errors);
    if (contentType === 'question_text') validateQuestionText(data, label, errors);
    if (contentType === 'writing_set') validateWritingSet(data, label, errors);
  }
  return { ok: errors.length === 0, errors };
}

export function validateUnit(unit = {}) {
  const errors = [];
  const strict = unit.status === 'approved' || unit.status === 'live';
  const items = array(unit.items);
  const occurrences = array(unit.occurrences);
  const contexts = array(unit.contexts);
  const activities = array(unit.activities);
  const itemsById = new Map(items.map(item => [item.vocabularyId, item]));
  const contextsById = new Map(contexts.map(context => [context.contextId, context]));

  errorIf(errors, !Number.isInteger(unit.unitNumber) || unit.unitNumber < 1 || unit.unitNumber > 20, 'Unit number must be 1–20.');
  errorIf(errors, !text(unit.unitTitle), 'Unit title is required.');
  errorIf(errors, unit.status != null && !STATUSES.has(unit.status), 'Unit status is invalid.');

  if (strict) {
    errorIf(errors, occurrences.length !== EXPECTED_WORDS_PER_UNIT, `An approved/live unit must contain exactly ${EXPECTED_WORDS_PER_UNIT} occurrences.`);
    const registered = unitConfig(unit.unitNumber);
    errorIf(errors, registered != null && text(unit.unitTitle) !== registered.title, `Unit ${unit.unitNumber} title must match the unit registry ("${registered?.title}").`);
    const occurrenceIds = new Set(occurrences.map(item => item.occurrenceId));
    errorIf(errors, occurrenceIds.size !== occurrences.length, 'An approved/live unit must have distinct occurrence IDs.');
    const vocabularyIds = occurrences.map(item => item.vocabularyId);
    errorIf(errors, new Set(vocabularyIds).size !== vocabularyIds.length, `An approved/live unit must contain ${EXPECTED_WORDS_PER_UNIT} distinct vocabulary targets.`);
    for (let setNumber = 1; setNumber <= 5; setNumber += 1) {
      const expected = occurrences.filter(occurrence => occurrence.setNumber === setNumber);
      errorIf(errors, expected.length !== 10, `Set ${setNumber} must contain exactly ten targets.`);
    }
    for (const item of items) {
      errorIf(errors, !['approved','live'].includes(item.status), `${text(item.term) || text(item.vocabularyId) || 'Item'} must be approved before the unit can be approved/live.`);
    }
    for (const occurrence of occurrences) {
      errorIf(errors, !['approved','live'].includes(occurrence.status), `${text(occurrence.occurrenceId) || 'Occurrence'} must be approved before the unit can be approved/live.`);
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
    errorIf(errors, !Number.isInteger(occurrence.positionInUnit) || occurrence.positionInUnit < 1 || occurrence.positionInUnit > EXPECTED_WORDS_PER_UNIT, `${label} has an invalid position.`);
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
        errorIf(errors, nonEmptyTextArray(context.acceptedAnswers).length === 0, `Production context ${context.contextId} needs an accepted answer.`);
      }
    }
  }

  for (const context of contexts) errors.push(...validateContext(context, strict));

  const activityIds = activities.map(activity => text(activity?.activityContentId)).filter(Boolean);
  errorIf(errors, new Set(activityIds).size !== activityIds.length, 'Unit activities must have distinct activity content IDs.');
  const itemIds = new Set(items.map(item => item.vocabularyId));
  for (const activity of activities) errors.push(...validateUnitActivity(activity, { strict, unitNumber:unit.unitNumber, itemIds }).errors);

  return { ok: errors.length === 0, errors };
}

export const VOCABULARY_CONTENT_STATUSES = Object.freeze([...STATUSES]);
export const VOCABULARY_CONTEXT_TYPES = Object.freeze([...CONTEXT_TYPES]);
export const VOCABULARY_UNIT_ACTIVITY_TYPES = Object.freeze([...UNIT_ACTIVITY_TYPES]);

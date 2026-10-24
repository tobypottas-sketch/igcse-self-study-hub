// Server-side derivation of the accepted answer(s) for the STAGE_CONTRACT v2 activities (Job 8). PURE: takes the rows the Edge Function
// has already loaded, returns the marking or null. The Edge Function only wires rows in and out, so this is what the tests exercise.
// Every derivation here is the SAME function the browser builder used to create the question (vocabulary-typed-forms.js,
// vocabulary-word-family.js): the answer is never taken from the client.
import { glossBlank, masteryPassageList, improveRecordsFor } from './vocabulary-typed-forms.js';
import { evaluateFamilyEligibility, familyMaskFromVariant, familySlotsForMask, FAMILY_STATUS } from './vocabulary-word-family.js';

function text(value) { return String(value ?? '').trim(); }
function strings(value) { return Array.isArray(value) ? value.map(text).filter(Boolean) : []; }

// Meaning Mastery: `contextRow` is the vocabulary_contexts row named by the attempt; the sentence and gloss come from the sense's masteryContexts.
export function glossInContextMarking({ item, sense, contextRow }) {
  const contextId = text(contextRow?.context_id ?? contextRow?.contextId);
  const masteryContext = (Array.isArray(sense?.masteryContexts) ? sense.masteryContexts : []).find(record => text(record?.contextId) === contextId);
  const blank = glossBlank({ item: { term: item?.term }, sense, masteryContext });
  return blank ? { acceptedAnswers: [blank.answer], distractors: [] } : null;
}

// Context Mastery (Job 9): the attempt names the passage's context row; the passage and its single answer come from the sense's
// masteryPassages, the SAME derivation the browser builder used. Marking is a single slot.
export function typeInPassageMarking({ item, sense, contextRow }) {
  const contextId = text(contextRow?.context_id ?? contextRow?.contextId);
  const passage = masteryPassageList({ term: item?.term }, sense).find(row => row.contextId === contextId);
  if (!passage) return null;
  return { acceptedAnswers: [passage.answer], slotAnswers: [[passage.answer]], distractors: [] };
}

// Precision Mastery: `activityRows` are the unit's live writing_set rows ({ activity_content_id, activity_data }); the pair is the
// attempt's activity record plus the sibling the variant (`q<index>`) names in the id-sorted list of that target's improve records.
export function upgradePassageMarking({ activityContentId, activityRows, vocabularyId, activityVariantId }) {
  const ordered = improveRecordsFor((activityRows ?? []).map(row => ({ activityContentId: row.activity_content_id ?? row.activityContentId, activityData: row.activity_data ?? row.activityData })), vocabularyId);
  const first = ordered.find(row => row.id === activityContentId);
  const match = /^q(\d{1,3})$/.exec(String(activityVariantId ?? ''));
  const second = match ? ordered[Number(match[1])] : undefined;
  if (!first || !second || first.id === second.id) return null;
  const slotAnswers = [strings(first.data.acceptedAnswers), strings(second.data.acceptedAnswers)];
  if (slotAnswers.some(slot => !slot.length)) return null;
  return { acceptedAnswers: slotAnswers.flat(), slotAnswers, distractors: [] };
}

// Item-backed activities. `item` carries the DB column names (term, word_family) or the client names (wordFamily).
export function itemStageMarking({ item, sense, questionType, activityVariantId }) {
  const term = text(item?.term);
  const lowerTerm = term.toLocaleLowerCase('en');
  const family = strings(item?.word_family ?? item?.wordFamily);
  if (questionType === 'word_family_identify') {
    const members = family.filter(form => form.toLocaleLowerCase('en') !== lowerTerm);
    return members.length ? { acceptedAnswers: members, distractors: [] } : null;
  }
  if (questionType === 'spot_the_error') {
    // The misspelled form is one of the author's recorded errors for this word. Any recorded error is a correct spot; the word itself is not.
    const errors = strings(sense?.spellingErrors).filter(form => form.toLocaleLowerCase('en') !== lowerTerm);
    return errors.length ? { acceptedAnswers: errors, distractors: [] } : null;
  }
  if (questionType === 'family_multi_form') {
    const familyItem = { term, wordFamily: family };
    if (evaluateFamilyEligibility(familyItem, sense).status !== FAMILY_STATUS.ELIGIBLE) return null;
    const mask = familyMaskFromVariant(activityVariantId);
    const slots = mask == null ? null : familySlotsForMask(familyItem, sense, mask);
    return slots ? { acceptedAnswers: slots.map(slot => slot.form), slotAnswers: slots.map(slot => [slot.form]), distractors: [] } : null;
  }
  return null;
}

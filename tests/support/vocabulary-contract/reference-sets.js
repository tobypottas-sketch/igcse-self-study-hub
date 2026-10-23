// Executable specification of Locked Decisions 1, 2 and 6 (Sets of 10, no incomplete Sets, complete families only).
// A reference model for the tests; it is NOT a production selector.
export const SET_SIZE = 10;

export function computeSets(serviceableIds = []) {
  const distinct = [...new Set(serviceableIds.map(String))];
  const setCount = Math.floor(distinct.length / SET_SIZE);
  const sets = Array.from({ length: setCount }, (_, i) => distinct.slice(i * SET_SIZE, (i + 1) * SET_SIZE));
  return { serviceableCount: distinct.length, setCount, sets, heldBack: distinct.slice(setCount * SET_SIZE) };
}

// A word is serviceable for a pathway only if it can run all five stages of that pathway.
export function servedAtAllStages(idsByStage = {}, stageOrder = ['recognise', 'match', 'apply', 'recall', 'mastery']) {
  const lists = stageOrder.map(stage => new Set((idsByStage[stage] ?? []).map(String)));
  if (lists.some(list => list.size === 0)) return [];
  return [...lists[0]].filter(id => lists.every(list => list.has(id)));
}

// LOCKED complete-family rule (Word Families Mastery eligibility). A family form is `{ form, partOfSpeech, authentic, authoredContext }`.
// Eligible when, counting only forms that are authentic AND have authored example/context support, the target is one of them and
// there are at least 3 such forms (including the target) across at least 2 distinct parts of speech.
// NOT required: noun + verb + adjective + adverb. Rare or unnatural forms must simply not be listed as authentic.
export const MIN_FAMILY_FORMS = 3;
export const MIN_FAMILY_PARTS_OF_SPEECH = 2;
export function familyCompleteForMastery(forms = [], targetForm = null) {
  const usable = (Array.isArray(forms) ? forms : []).filter(f => f && typeof f === 'object' && String(f.form ?? '').trim() && String(f.partOfSpeech ?? '').trim() && f.authentic === true && f.authoredContext === true);
  if (targetForm != null && !usable.some(f => String(f.form).toLowerCase() === String(targetForm).toLowerCase())) return false;
  return new Set(usable.map(f => String(f.form).toLowerCase())).size >= MIN_FAMILY_FORMS && new Set(usable.map(f => String(f.partOfSpeech).toLowerCase())).size >= MIN_FAMILY_PARTS_OF_SPEECH;
}

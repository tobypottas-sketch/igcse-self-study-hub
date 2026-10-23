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

// Interpretation (to confirm): Word Families Mastery needs one stem plus at least two other genuine forms, because the
// Mastery item has 2-3 gaps that each need a different form. Incomplete families stop at Recall (Locked Decision 6).
export const MIN_OTHER_FORMS_FOR_FAMILY_MASTERY = 2;
export function familyCompleteForMastery(wordFamily = []) {
  return new Set((Array.isArray(wordFamily) ? wordFamily : []).map(s => String(s).trim().toLowerCase()).filter(Boolean)).size >= MIN_OTHER_FORMS_FOR_FAMILY_MASTERY;
}

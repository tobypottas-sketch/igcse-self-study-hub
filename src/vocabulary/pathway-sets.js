// Production Sets-of-10 selector (STAGE_CONTRACT v2, Locked Decisions 1, 2 and 6). PURE: no DOM, storage, clock, randomness or network.
//
// A pathway's SERVICEABLE words (the words readiness says can run every stage of that pathway, in authored order) are cut into Sets:
//   setCount = floor(serviceable / 10); a Set is exactly 10 distinct words; the remainder is HELD BACK (never padded, never dropped).
// Membership is per pathway: Set 1 of Meaning need not equal Set 1 of Context. The selector never reorders: the caller supplies the
// authored order, so a Set's members only change when the unit's serviceable words change.
export const SET_SIZE = 10;
export const MAX_SETS = 12;                                     // sanity ceiling for a unit (a unit has ~50 words); the server enforces the same
export const SET_READINESS = Object.freeze({
  READY: 'ready',
  NONE_SERVICEABLE: 'no_serviceable_targets',
  TOO_FEW: 'fewer_than_ten_serviceable'
});

export function setIdFor(pathwayId, setNumber) { return `${pathwayId ?? 'pathway'}:set-${setNumber}`; }

// serviceableIds: occurrence ids, authored order. Duplicates are ignored (they never create a fake Set).
export function computePathwaySets(serviceableIds = [], { pathwayId = null } = {}) {
  const distinct = [...new Set((Array.isArray(serviceableIds) ? serviceableIds : []).map(String).filter(Boolean))];
  const setCount = Math.min(MAX_SETS, Math.floor(distinct.length / SET_SIZE));
  const sets = Array.from({ length: setCount }, (_, index) => distinct.slice(index * SET_SIZE, (index + 1) * SET_SIZE));
  const heldBack = distinct.slice(setCount * SET_SIZE);
  const setList = sets.map((members, index) => ({ setNumber: index + 1, setId: setIdFor(pathwayId, index + 1), pathwayId, members }));
  return {
    pathwayId,
    serviceableCount: distinct.length,
    setCount,
    sets,                                                       // arrays of occurrence ids, Set 1 first
    setList,                                                    // the same Sets with number / id / pathway
    heldBack,
    heldBackCount: heldBack.length,
    reason: setCount > 0 ? SET_READINESS.READY : distinct.length === 0 ? SET_READINESS.NONE_SERVICEABLE : SET_READINESS.TOO_FEW
  };
}

// Sets for one pathway of a unit from a readiness/coverage row ({ available, occurrenceIds }). An unavailable pathway offers no Set.
export function setsFromCoverage(pathwayId, coverageRow = null, authoredOrder = null) {
  if (!coverageRow || coverageRow.available === false) return computePathwaySets([], { pathwayId });
  let ids = Array.isArray(coverageRow.occurrenceIds) ? coverageRow.occurrenceIds.map(String) : [];
  if (Array.isArray(authoredOrder) && authoredOrder.length) {                // re-assert authored order if the caller has it
    const position = new Map(authoredOrder.map((id, index) => [String(id), index]));
    ids = [...ids].sort((a, b) => (position.get(a) ?? 1e9) - (position.get(b) ?? 1e9));
  }
  return computePathwaySets(ids, { pathwayId });
}

// The Set a word belongs to in a pathway (null when the word is held back or the pathway has no Sets).
export function setNumberOfWord(sets, occurrenceId) {
  const id = String(occurrenceId);
  const found = (sets?.setList ?? []).find(set => set.members.includes(id));
  return found ? found.setNumber : null;
}

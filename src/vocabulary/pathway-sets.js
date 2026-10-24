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

// Membership drift guard (Job 7). The server decides whether a Set mission counts (it advances only when the mission's ten words are the
// ten members held in public.vocabulary_set_members for that unit, pathway and Set; order ignored). The client builds Sets from the
// release's readiness. When a later release changes readiness without a matching membership migration the two disagree, and a mission
// would play to the end and never count. This compares ONE Set and returns:
//   'match'    - same ten words (order ignored)
//   'mismatch' - the server holds a different membership, or none, for a Set the client wants to run (fail safe: do not start it)
//   'unknown'  - the server membership could not be read at all (null/undefined): the server still enforces, so practice may proceed
export const MEMBERSHIP = Object.freeze({ MATCH: 'match', MISMATCH: 'mismatch', UNKNOWN: 'unknown' });
export function compareSetMembership({ pathwayId, setNumber, clientMembers = [], serverRows = null } = {}) {
  if (!Array.isArray(serverRows)) return { status: MEMBERSHIP.UNKNOWN, missing: [], extra: [] };
  const server = serverRows.filter(row => row?.pathway_id === pathwayId && Number(row?.set_number) === Number(setNumber)).map(row => String(row.occurrence_id));
  const client = [...new Set(clientMembers.map(String))];
  const serverSet = new Set(server);
  const clientSet = new Set(client);
  const missing = client.filter(id => !serverSet.has(id));       // wanted by the client, unknown to the server
  const extra = [...serverSet].filter(id => !clientSet.has(id)); // held by the server, not in the client's Set
  const status = server.length === SET_SIZE && missing.length === 0 && extra.length === 0 ? MEMBERSHIP.MATCH : MEMBERSHIP.MISMATCH;
  return { status, missing, extra };
}

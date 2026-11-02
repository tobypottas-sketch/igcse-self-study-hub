// Pure Set availability/completion chain shared by the student app (src/vocabulary re-exports it) and the Edge runtime.
// PURE: no DOM, storage, clock, randomness or network. It imports only the shared pathway contract so it loads in Deno without src/.
// Moved verbatim from src/vocabulary/{pathway-sets,set-progress,data}.js; behaviour must not change (tests/vocabulary-set-extraction-golden.test.js).
import { PATHWAY_IDS, PATHWAY_STAGE_IDS } from './vocabulary-pathway-contract.js';

const STAGE_ORDER = PATHWAY_STAGE_IDS;
const VOCABULARY_PATHWAYS = Object.freeze(PATHWAY_IDS.map(id => Object.freeze({ id })));

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

// Student runtime does not need to re-run the authoring/readiness evaluator. Published Set membership is already the server-held
// release decision and is the same authority the mission guard checks. Build the light-weight coverage shape the student UI needs
// directly from those rows. Pathways with no published Set are explicitly unavailable so missing coverage can never unlock everything.
export function coverageFromServerSetMembers(rows = [], occurrences = []) {
  const totalOccurrences = Array.isArray(occurrences) ? occurrences.length : 0;
  const authored = new Set((occurrences ?? []).map(row => String(row?.occurrence_id ?? row?.occurrenceId ?? '')).filter(Boolean));
  const grouped = new Map(VOCABULARY_PATHWAYS.map(pathway => [pathway.id, []]));
  for (const row of Array.isArray(rows) ? rows : []) {
    const pathwayId = String(row?.pathway_id ?? '');
    const occurrenceId = String(row?.occurrence_id ?? '');
    if (!grouped.has(pathwayId) || !authored.has(occurrenceId)) continue;
    grouped.get(pathwayId).push(row);
  }
  return Object.fromEntries(VOCABULARY_PATHWAYS.map(pathway => {
    const pathwayRows = grouped.get(pathway.id).slice().sort((a,b) => Number(a.set_number) - Number(b.set_number) || Number(a.position) - Number(b.position));
    const occurrenceIds = [...new Set(pathwayRows.map(row => String(row.occurrence_id)).filter(Boolean))];
    const setCount = new Set(pathwayRows.map(row => Number(row.set_number)).filter(Number.isFinite)).size;
    const available = setCount > 0 && occurrenceIds.length >= 10;
    return [pathway.id, {
      available,
      occurrenceIds:available ? occurrenceIds : [],
      totalOccurrences,
      setCount:available ? setCount : 0,
      heldBackOccurrenceIds:[],
      reason:available ? null : 'no_published_sets'
    }];
  }));
}

export function normalizeSetRow(row = {}) {
  const stage = STAGE_ORDER.includes(row.stage) ? row.stage : 'recognise';
  const phase = ['stage', 'consolidate', 'recovery', 'fresh'].includes(row.phase) ? row.phase : 'stage';
  const list = value => Array.isArray(value) ? value.map(String) : [];
  return {
    pathwayId: String(row.pathway_id ?? row.pathwayId ?? ''),
    unitNumber: Number(row.unit_number ?? row.unitNumber ?? 0) || null,
    setNumber: Number(row.set_number ?? row.setNumber ?? 0),
    stage,
    phase,
    status: row.status === 'maintain' ? 'maintain' : 'active',
    completedStages: list(row.completed_stages ?? row.completedStages).filter(id => STAGE_ORDER.includes(id)),
    weakTargetIds: list(row.weak_target_ids ?? row.weakTargetIds),
    advancedWithSupport: Array.isArray(row.advanced_with_support ?? row.advancedWithSupport) ? (row.advanced_with_support ?? row.advancedWithSupport) : [],
    supportFlags: Array.isArray(row.support_flags ?? row.supportFlags) ? (row.support_flags ?? row.supportFlags) : []
  };
}

// rows -> { [pathwayId]: { [setNumber]: normalizedRow } }
export function groupSetRows(rows = []) {
  const grouped = {};
  for (const raw of Array.isArray(rows) ? rows : []) {
    const row = normalizeSetRow(raw);
    if (!row.pathwayId || !(row.setNumber >= 1)) continue;
    (grouped[row.pathwayId] ??= {})[row.setNumber] = row;
  }
  return grouped;
}

// The Set a student is working on in a pathway and what the next mission is.
//   `sets`   = computePathwaySets(...) for the pathway,  `rowsForPathway` = { [setNumber]: row }
// Returns { available, firstPassComplete, setNumber, stage, phase, missionKind, members, weakTargetIds, completedStages, setCount, heldBackCount, askNextSet }.
export function activeSetStep({ sets, rowsForPathway = {} } = {}) {
  const setCount = sets?.setCount ?? 0;
  const base = { setCount, heldBackCount: sets?.heldBackCount ?? 0, reason: sets?.reason ?? null };
  if (setCount < 1) return { ...base, available: false, firstPassComplete: false, setNumber: null, stage: 'recognise', phase: 'stage', missionKind: null, members: [], weakTargetIds: [], completedStages: [], askNextSet: null };
  for (let number = 1; number <= setCount; number += 1) {
    const row = rowsForPathway?.[number] ?? null;
    if (row && row.status === 'maintain') continue;
    const phase = row?.phase ?? 'stage';
    return {
      ...base, available: true, firstPassComplete: false, setNumber: number, stage: row?.stage ?? 'recognise', phase,
      missionKind: phase === 'consolidate' ? 'consolidate' : phase === 'recovery' ? 'recovery' : 'stage',
      members: sets.sets[number - 1], weakTargetIds: row?.weakTargetIds ?? [], completedStages: row?.completedStages ?? [],
      // The server opens a new Set only when told which Set is next: that is the lowest Set number without a row.
      askNextSet: row ? null : number,
      supportFlags: row?.supportFlags ?? []
    };
  }
  return { ...base, available: true, firstPassComplete: true, setNumber: setCount, stage: 'mastery', phase: 'stage', missionKind: null, members: sets.sets[setCount - 1], weakTargetIds: [], completedStages: [...STAGE_ORDER], askNextSet: null };
}

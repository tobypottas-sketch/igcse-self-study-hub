// Client model of SERVER-HELD Sets-of-10 progression. The server owns the truth (public.vocabulary_pathway_sets); this module only
// reads that state and answers display / selection questions from it. It never decides a student's stage:
//   * the visible stage of a pathway is the stage of its ACTIVE Set (the lowest Set that is not yet in Maintain),
//   * the next mission's kind (stage / consolidate / recovery / fresh) comes from that Set's phase,
//   * hidden per-word evidence (mastery, successes, review) is not read here at all.
// PURE: no DOM, storage, clock, randomness or network.
import { STAGE_ORDER, MISSION_SIZE, composeFollowUp, applyMissionResult, newSetState } from './stage-progression.js';
import { setsFromCoverage, computePathwaySets } from './pathway-sets.js';
import { VOCABULARY_PATHWAYS, PATHWAY_STAGES } from './pathway-model.js';

const STAGE_LABEL = Object.freeze(Object.fromEntries(PATHWAY_STAGES.map(stage => [stage.id, stage.label])));

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

export function stageNumber(stageId) { return Math.max(0, STAGE_ORDER.indexOf(stageId)) + 1; }
export function stageLabel(stageId) { return STAGE_LABEL[stageId] ?? ''; }

// Card copy for the Set the student is on. Plain, no scores of other students, no leaderboards.
export function setMissionCopy(step) {
  if (!step?.available) return '';
  if (step.firstPassComplete) return 'Every Set is in Maintain';
  const label = stageLabel(step.stage);
  if (step.phase === 'consolidate') return `Follow-up mission: lock in ${label}`;
  if (step.phase === 'recovery') return `Recovery mission: rebuild ${label}`;
  if (step.phase === 'fresh') return `Fresh ${label} mission: you move on afterwards`;
  return `${label} mission: 10 questions, 8 or more to move on`;
}

// Per-pathway states in the SHAPE the unit screen already renders, but derived only from server-held Set state.
// `coverageByPathway` is the readiness coverage ({ available, occurrenceIds }); `occurrences` the unit's words in authored order.
export function buildSetPathwayStates({ occurrences = [], coverageByPathway = {}, setRows = [] } = {}) {
  const grouped = groupSetRows(setRows);
  const authored = occurrences.map(row => String(row.occurrenceId ?? row.occurrence_id));
  const result = {};
  for (const pathway of VOCABULARY_PATHWAYS) {
    const coverage = coverageByPathway?.[pathway.id] ?? null;
    const sets = setsFromCoverage(pathway.id, coverage ? coverage : { available: true, occurrenceIds: authored }, authored);
    const step = activeSetStep({ sets, rowsForPathway: grouped[pathway.id] ?? {} });
    const totalCount = Number.isFinite(Number(coverage?.totalOccurrences)) ? Number(coverage.totalOccurrences) : occurrences.length;
    if (!step.available) {
      result[pathway.id] = {
        currentStage: 'recognise', completedStages: [], needsPractice: false, mastered: false, available: false,
        coverageCount: sets.serviceableCount, totalCount, unavailableReason: coverage?.available === false ? (coverage.reason ?? 'no_serviceable_targets') : (sets.reason === 'ready' ? null : sets.reason),
        stageAttempts: 0, stageCleanSuccesses: 0, stageEvidence: null, set: null
      };
      continue;
    }
    const completedStages = step.firstPassComplete ? [...STAGE_ORDER] : step.completedStages;
    result[pathway.id] = {
      currentStage: step.stage,
      completedStages,
      needsPractice: !step.firstPassComplete && (step.phase === 'consolidate' || step.phase === 'recovery'),
      mastered: step.firstPassComplete,
      available: true,
      coverageCount: sets.serviceableCount,
      totalCount,
      unavailableReason: null,
      stageAttempts: 0,
      stageCleanSuccesses: 0,
      stageEvidence: null,
      set: {
        number: step.setNumber, count: step.setCount, heldBack: step.heldBackCount, phase: step.phase, missionKind: step.missionKind,
        firstPassComplete: step.firstPassComplete, weakTargetIds: step.weakTargetIds, supportFlags: step.supportFlags ?? [],
        advancedWithSupport: (grouped[pathway.id]?.[step.setNumber]?.advancedWithSupport ?? []),
        copy: setMissionCopy(step)
      }
    };
  }
  return result;
}

// What the visible state becomes once a mission with this server-derived result settles. USED ONLY to paint the completion screen at the
// moment a mission ends, before the server's settlement returns; the server's rows replace it as soon as they arrive.
export function projectSettlement({ step, missionId, score, missedTargetIds = [] } = {}) {
  if (!step?.available || step.firstPassComplete) return null;
  const state = {
    ...newSetState(), stage: step.stage, phase: step.phase === 'fresh' ? 'fresh' : step.phase, maintain: false,
    appliedMissionIds: [], history: [], advancedWithSupport: [], supportFlags: []
  };
  const kind = step.phase === 'consolidate' ? 'consolidate' : step.phase === 'recovery' ? 'recovery' : 'stage';
  const next = applyMissionResult(state, { missionId: String(missionId ?? 'projection'), stage: step.stage, kind, size: MISSION_SIZE, score, complete: true, missedTargetIds });
  return { stage: next.stage, phase: next.phase, maintain: next.maintain === true, advanced: next.maintain === true || next.stage !== step.stage, advancedWithSupport: next.advancedWithSupport.length > 0 };
}

// What happens next for the student once this mission settles (drives the completion screen and its Continue button).
//   kind: 'advance' (next stage) | 'consolidate' | 'recovery' | 'fresh' (same stage, follow-up) | 'set-complete' (Set -> Maintain, another Set follows)
//         | 'pathway-complete' (last Set -> Maintain). `projection` comes from projectSettlement().
export function describeNext({ step, projection, setCount = step?.setCount ?? 0 } = {}) {
  if (!step?.available || !projection) return null;
  if (projection.maintain) {
    return step.setNumber < setCount
      ? { kind: 'set-complete', setNumber: step.setNumber + 1, stage: 'recognise', phase: 'stage' }
      : { kind: 'pathway-complete', setNumber: step.setNumber, stage: 'mastery', phase: 'stage' };
  }
  if (projection.advanced) return { kind: 'advance', setNumber: step.setNumber, stage: projection.stage, phase: 'stage', withSupport: projection.advancedWithSupport === true };
  return { kind: projection.phase, setNumber: step.setNumber, stage: projection.stage, phase: projection.phase };
}

// The ten targets of the next mission, and the order they are asked in. A Set is exactly ten words, so every mission covers the whole Set;
// follow-up missions put the words the student missed first (STAGE_CONTRACT v2 composition).
export function missionTargetIds({ step, missionSeed = '' } = {}) {
  if (!step?.available || step.firstPassComplete) return [];
  if (step.missionKind === 'consolidate' || step.missionKind === 'recovery') {
    const composed = composeFollowUp({ outcome: step.missionKind, missedTargetIds: step.weakTargetIds, setTargetIds: step.members, missionSeed });
    const ids = [...new Set(composed?.slots?.map(slot => slot.targetId) ?? [])];
    if (ids.length === MISSION_SIZE) return ids;
  }
  return [...step.members];
}

// Per-word view of the same server-held state: a word shows the stage of the Set it belongs to. Words in finished Sets are Maintain
// (shown as Mastery with a tick), words in the Set being worked on show that Set's stage, words in later Sets or held back are not
// unlocked yet (`locked`). Used wherever a single word's stage is displayed or decides which activity families it may practise.
export function buildWordSetStates({ occurrences = [], coverageByPathway = {}, setRows = [] } = {}) {
  const grouped = groupSetRows(setRows);
  const authored = occurrences.map(row => String(row.occurrenceId ?? row.occurrence_id));
  const result = {};
  for (const pathway of VOCABULARY_PATHWAYS) {
    const coverage = coverageByPathway?.[pathway.id] ?? null;
    const sets = setsFromCoverage(pathway.id, coverage ? coverage : { available: true, occurrenceIds: authored }, authored);
    const step = activeSetStep({ sets, rowsForPathway: grouped[pathway.id] ?? {} });
    const perWord = {};
    for (const id of authored) perWord[id] = { currentStage: 'recognise', completedStages: [], mastered: false, needsPractice: false, locked: true, setNumber: null };
    sets.setList.forEach(set => {
      for (const id of set.members) {
        if (step.firstPassComplete || set.setNumber < step.setNumber) perWord[id] = { currentStage: 'mastery', completedStages: [...STAGE_ORDER], mastered: true, needsPractice: false, locked: false, setNumber: set.setNumber };
        else if (set.setNumber === step.setNumber) perWord[id] = { currentStage: step.stage, completedStages: step.completedStages, mastered: false, needsPractice: step.phase === 'consolidate' || step.phase === 'recovery', locked: false, setNumber: set.setNumber };
        else perWord[id] = { ...perWord[id], setNumber: set.setNumber };
      }
    });
    result[pathway.id] = perWord;
  }
  return result;
}

export { computePathwaySets };

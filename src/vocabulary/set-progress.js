// Client model of SERVER-HELD Sets-of-10 progression. The server owns the truth (public.vocabulary_pathway_sets); this module only
// reads that state and answers display / selection questions from it. It never decides a student's stage:
//   * the visible stage of a pathway is the stage of its ACTIVE Set (the lowest Set that is not yet in Maintain),
//   * the next mission's kind (stage / consolidate / recovery / fresh) comes from that Set's phase,
//   * hidden per-word evidence (mastery, successes, review) is not read here at all.
// PURE: no DOM, storage, clock, randomness or network.
import { STAGE_ORDER, MISSION_SIZE, composeFollowUp, applyMissionResult, newSetState } from './stage-progression.js';
import { setsFromCoverage, computePathwaySets } from './pathway-sets.js';
import { VOCABULARY_PATHWAYS, PATHWAY_STAGES } from './pathway-model.js';
import { normalizeSetRow, groupSetRows, activeSetStep } from '../../supabase/functions/_shared/vocabulary-pathway-sets.js';
export { normalizeSetRow, groupSetRows, activeSetStep };

const STAGE_LABEL = Object.freeze(Object.fromEntries(PATHWAY_STAGES.map(stage => [stage.id, stage.label])));


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

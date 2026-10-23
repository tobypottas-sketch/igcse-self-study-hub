// Visible stage progression for a pathway Set (STAGE_CONTRACT v2, Locked Decision 3). PURE: no DOM, storage, clock, randomness or network.
// The input is always a SERVER-DERIVED mission result; stars never gate advancement; the visible stage never moves backwards.
// Not decided here (see tests/vocabulary-contract-05): the finite escape from repeated Consolidate/Recovery and the teacher flag.
export const STAGE_ORDER = Object.freeze(['recognise', 'match', 'apply', 'recall', 'mastery']);
export const MISSION_SIZE = 10;
export const PASS_SCORE = 8;
export const CONSOLIDATE_MIN = 6;

// 'incomplete' (no outcome, cannot advance) | 'pass' (8-10) | 'consolidate' (6-7) | 'recovery' (0-5)
export function missionOutcome({ size = MISSION_SIZE, score, complete = true } = {}) {
  if (complete !== true || size !== MISSION_SIZE || !Number.isInteger(score) || score < 0 || score > size) return 'incomplete';
  if (score >= PASS_SCORE) return 'pass';
  if (score >= CONSOLIDATE_MIN) return 'consolidate';
  return 'recovery';
}

export function newSetState() {
  return { stage: STAGE_ORDER[0], maintain: false, appliedMissionIds: [], pending: null, history: [] };
}

// Returns a new state, or the SAME state object when the mission changes nothing (incomplete, already applied, unknown stage).
export function applyMissionResult(state = newSetState(), mission = {}) {
  const missionId = mission.missionId;
  if (typeof missionId !== 'string' || !missionId || !STAGE_ORDER.includes(mission.stage)) return state;
  if (state.appliedMissionIds.includes(missionId)) return state;                       // one mission advances at most once
  const outcome = missionOutcome(mission);
  if (outcome === 'incomplete') return state;
  const next = {
    ...state,
    appliedMissionIds: [...state.appliedMissionIds, missionId],
    history: [...state.history, { missionId, stage: mission.stage, outcome }]
  };
  if (state.maintain || mission.stage !== state.stage) return next;                    // replay of a passed stage: recorded, no movement
  if (outcome === 'pass') {
    const index = STAGE_ORDER.indexOf(state.stage);
    return index === STAGE_ORDER.length - 1 ? { ...next, maintain: true, pending: null } : { ...next, stage: STAGE_ORDER[index + 1], pending: null };
  }
  return { ...next, pending: outcome };                                                // consolidate | recovery: same stage, never regress
}

// State contract for the follow-up mission after a non-pass. Describes it; builds nothing.
export function followUpFor(outcome, missedTargetIds = []) {
  const focus = Array.isArray(missedTargetIds) ? [...missedTargetIds] : [];
  if (outcome === 'consolidate') return { kind: 'consolidate', sameStage: true, scaffolded: false, focus, freshFingerprints: true, canAdvance: true };
  if (outcome === 'recovery') return { kind: 'recovery', sameStage: true, scaffolded: true, focus, freshFingerprints: true, canAdvance: false };
  return null;
}

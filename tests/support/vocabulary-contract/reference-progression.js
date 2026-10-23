// Executable specification of the approved visible-progression model (Locked Decisions 3 and the stage ladder).
export const MISSION_SIZE = 10;
export const PASS_SCORE = 8;
export const CONSOLIDATE_MIN = 6;
export const STAGES = ['recognise', 'match', 'apply', 'recall', 'mastery'];

// A mission may only produce an outcome when it is a complete, full-size mission.
export function missionOutcome({ size = MISSION_SIZE, score, complete = true } = {}) {
  if (!complete || size !== MISSION_SIZE || !Number.isInteger(score) || score < 0 || score > size) return 'incomplete';
  if (score >= PASS_SCORE) return 'pass';
  if (score >= CONSOLIDATE_MIN) return 'consolidate';
  return 'recovery';
}

export function newSetState() { return { stage: 'recognise', maintain: false, appliedMissionIds: [], pending: null, history: [] }; }

// Applies one SERVER-DERIVED mission result to a Set. Stars are deliberately ignored.
export function applyMission(state, mission) {
  const next = { ...state, appliedMissionIds: [...state.appliedMissionIds], history: [...state.history] };
  if (state.appliedMissionIds.includes(mission.missionId)) return state;           // one mission advances at most once
  const outcome = missionOutcome(mission);
  next.appliedMissionIds.push(mission.missionId);
  next.history.push({ missionId: mission.missionId, stage: mission.stage, outcome });
  if (outcome === 'incomplete') { next.appliedMissionIds.pop(); next.history.pop(); return state; }
  if (state.maintain || mission.stage !== state.stage) return { ...next, pending: state.pending };   // replay of a passed stage: no movement
  if (outcome === 'pass') {
    const index = STAGES.indexOf(state.stage);
    if (index === STAGES.length - 1) return { ...next, maintain: true, pending: null };
    return { ...next, stage: STAGES[index + 1], pending: null };
  }
  return { ...next, pending: outcome };   // consolidate | recovery: same visible stage, never regress
}

// What the follow-up mission after a non-pass must look like (state contract only; no UI).
export function followUpFor(outcome, missedTargetIds = []) {
  if (outcome === 'consolidate') return { kind: 'consolidate', sameStage: true, scaffolded: false, focus: [...missedTargetIds], freshFingerprints: true, canAdvance: true };
  if (outcome === 'recovery') return { kind: 'recovery', sameStage: true, scaffolded: true, focus: [...missedTargetIds], freshFingerprints: true, canAdvance: false };
  return null;
}

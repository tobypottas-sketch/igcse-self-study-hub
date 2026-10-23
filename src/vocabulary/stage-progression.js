// Visible stage progression for a pathway Set (STAGE_CONTRACT v2, Locked Decision 3 + the finite escape lock). PURE: no DOM,
// storage, clock, randomness or network. Input is always a SERVER-DERIVED mission result. Stars never gate advancement and the
// visible stage never moves backwards.
//
// Per stage the learner can spend at most FOUR completed missions before moving on:
//   stage mission -> (6-7) Consolidate -> (fails) Recovery -> one fresh full stage mission -> advance, with support if still < 8.
//   stage mission -> (<=5) Recovery -> one fresh full stage mission -> advance, with support if still < 8.
// Recovery itself never advances. A weak fresh attempt advances anyway, marks the Set `advanced_with_support` and flags only the
// weak WORDS (never the student or the pathway). The flag informs; it never blocks progression.
export const STAGE_ORDER = Object.freeze(['recognise', 'match', 'apply', 'recall', 'mastery']);
export const MISSION_SIZE = 10;
export const PASS_SCORE = 8;
export const CONSOLIDATE_MIN = 6;
export const MAX_MISSIONS_PER_STAGE = 4;
export const MISSION_KINDS = Object.freeze(['stage', 'consolidate', 'recovery']);
export const PHASES = Object.freeze(['stage', 'consolidate', 'recovery', 'fresh']);
const EXPECTED_KIND = Object.freeze({ stage: 'stage', consolidate: 'consolidate', recovery: 'recovery', fresh: 'stage' });

// 'incomplete' (no outcome, cannot advance) | 'pass' (8-10) | 'consolidate' (6-7) | 'recovery' (0-5)
export function missionOutcome({ size = MISSION_SIZE, score, complete = true } = {}) {
  if (complete !== true || size !== MISSION_SIZE || !Number.isInteger(score) || score < 0 || score > size) return 'incomplete';
  if (score >= PASS_SCORE) return 'pass';
  if (score >= CONSOLIDATE_MIN) return 'consolidate';
  return 'recovery';
}

export function newSetState() {
  return { stage: STAGE_ORDER[0], phase: 'stage', maintain: false, appliedMissionIds: [], history: [], advancedWithSupport: [], supportFlags: [] };
}

// The kind of mission the learner must be given next at the current stage (null once the Set is in Maintain).
export function nextMissionKind(state) {
  if (state.maintain) return null;
  return state.phase === 'consolidate' ? 'consolidate' : state.phase === 'recovery' ? 'recovery' : 'stage';
}

function advance(state, extra = {}) {
  const index = STAGE_ORDER.indexOf(state.stage);
  return index === STAGE_ORDER.length - 1
    ? { ...state, ...extra, phase: 'stage', maintain: true }
    : { ...state, ...extra, stage: STAGE_ORDER[index + 1], phase: 'stage' };
}

// Returns a new state, or the SAME state object when the mission changes nothing (no id, unknown stage, incomplete, already applied).
// `mission` = { missionId, stage, kind = 'stage', size, score, complete, missedTargetIds? } (all server-derived).
export function applyMissionResult(state = newSetState(), mission = {}) {
  const { missionId } = mission;
  const kind = mission.kind ?? 'stage';
  if (typeof missionId !== 'string' || !missionId || !STAGE_ORDER.includes(mission.stage) || !MISSION_KINDS.includes(kind)) return state;
  if (state.appliedMissionIds.includes(missionId)) return state;                       // one mission settles at most once
  const outcome = missionOutcome(mission);
  if (outcome === 'incomplete') return state;
  const next = { ...state, appliedMissionIds: [...state.appliedMissionIds, missionId], history: [...state.history, { missionId, stage: mission.stage, kind, outcome }] };
  // A replay of a passed stage, a finished Set, or a mission of the wrong kind is recorded but moves nothing.
  if (state.maintain || mission.stage !== state.stage || kind !== EXPECTED_KIND[state.phase]) return next;

  if (state.phase === 'stage') {
    if (outcome === 'pass') return advance(next);
    return { ...next, phase: outcome === 'consolidate' ? 'consolidate' : 'recovery' };
  }
  if (state.phase === 'consolidate') return outcome === 'pass' ? advance(next) : { ...next, phase: 'recovery' };
  if (state.phase === 'recovery') return { ...next, phase: 'fresh' };                  // Recovery never advances
  // phase === 'fresh': one fresh full stage mission, then the learner moves on whatever the score.
  if (outcome === 'pass') return advance(next);
  const targetIds = Array.isArray(mission.missedTargetIds) ? [...new Set(mission.missedTargetIds.map(String))] : [];
  return advance(next, {
    advancedWithSupport: [...state.advancedWithSupport, { stage: state.stage, missionId }],
    supportFlags: [...state.supportFlags, { stage: state.stage, missionId, targetIds, reason: 'recovery_sequence_not_passed', blocksProgression: false }]
  });
}

// Deterministic, dependency-free ordering used to fill follow-up missions.
function hash(text) { let h = 2166136261; for (const c of String(text)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
const ordered = (ids, seed) => [...ids].sort((a, b) => hash(`${seed}:${a}`) - hash(`${seed}:${b}`) || String(a).localeCompare(String(b)));

// Composition of a Consolidate / Recovery mission. ALWAYS `size` graded questions (never a short mission).
//  - every missed target appears (weak words first); remaining slots come from the other words of the same Set;
//  - a target is repeated only if the Set cannot fill the mission, and then only with a different question identity;
//  - no slot may reuse the question fingerprint the learner has already seen for that target (`freshFingerprint`);
//  - Recovery is scaffolded and uses different question forms; neither follow-up changes the visible stage.
// Returns { kind, sameStage, scaffolded, canAdvance, size, slots:[{ targetId, weak, repeat, freshFingerprint, differentForm }] }.
export function composeFollowUp({ outcome, missedTargetIds = [], setTargetIds = [], size = MISSION_SIZE, missionSeed = '' } = {}) {
  if (outcome !== 'consolidate' && outcome !== 'recovery') return null;
  const set = [...new Set(setTargetIds.map(String))];
  const missed = [...new Set(missedTargetIds.map(String))].filter(id => set.includes(id)).slice(0, size);
  const others = ordered(set.filter(id => !missed.includes(id)), `${missionSeed}:fill`);
  const targets = [...missed, ...others].slice(0, size);
  const slots = targets.map(targetId => ({ targetId, weak: missed.includes(targetId), repeat: false }));
  for (let i = 0; slots.length < size && set.length > 0; i += 1) {             // only when the Set has fewer than `size` words
    const pool = missed.length ? missed : set; slots.push({ targetId: pool[i % pool.length], weak: missed.includes(pool[i % pool.length]), repeat: true });
  }
  return {
    kind: outcome, sameStage: true, scaffolded: outcome === 'recovery', canAdvance: outcome === 'consolidate', size: slots.length,
    slots: slots.map(slot => ({ ...slot, freshFingerprint: true, differentForm: outcome === 'recovery' || slot.repeat }))
  };
}

// Compact description of the follow-up (state contract only).
export function followUpFor(outcome, missedTargetIds = []) {
  const focus = Array.isArray(missedTargetIds) ? [...missedTargetIds] : [];
  if (outcome === 'consolidate') return { kind: 'consolidate', sameStage: true, scaffolded: false, focus, freshFingerprints: true, canAdvance: true, size: MISSION_SIZE };
  if (outcome === 'recovery') return { kind: 'recovery', sameStage: true, scaffolded: true, focus, freshFingerprints: true, canAdvance: false, size: MISSION_SIZE };
  return null;
}

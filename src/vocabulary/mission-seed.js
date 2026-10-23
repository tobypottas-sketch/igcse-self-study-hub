// Content-seed derivation for a mission. PURE. The mission seed is issued by the SERVER (public.start_vocabulary_mission) and exists only
// to drive reproducible content variation: H(missionSeed, occurrenceId, slot, activityType). It is never an input to grading, and the
// presentation nonce (option/tile order) is deliberately NOT part of it. The planner and builders derive question content from it when the app supplies a server mission seed.
function fnv(text, basis) { let h = basis >>> 0; for (const c of String(text)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
const clean = (name, v) => { const s = String(v ?? '').trim(); if (!s) throw new Error(`${name} is required to derive a content seed`); return s; };
export function deriveContentSeed({ missionSeed, occurrenceId, slot, activityType } = {}) {
  const parts = [clean('missionSeed', missionSeed), clean('occurrenceId', occurrenceId), clean('slot', slot), clean('activityType', activityType)];
  if (!Number.isInteger(Number(parts[2])) || Number(parts[2]) < 0) throw new Error('slot must be a non-negative integer');
  const text = parts.join('␟');
  return `cs_${fnv(text, 2166136261).toString(16).padStart(8, '0')}${fnv(text, 0x9e3779b1).toString(16).padStart(8, '0')}`;
}

// Presentation nonce for a MISSION: stable across resume/refresh of the same mission, different for every new mission (the server issues a new
// missionSeed). It is domain-separated from the content seed, so presentation order can never be mistaken for, or leak into, question identity.
export function derivePresentationNonce({ missionSeed, occurrenceId, slot } = {}) {
  const parts = [clean('missionSeed', missionSeed), clean('occurrenceId', occurrenceId), clean('slot', slot)];
  const text = ['presentation', ...parts].join('␟');
  return `pn_${fnv(text, 2166136261).toString(16).padStart(8, '0')}${fnv(text, 0x85ebca6b).toString(16).padStart(8, '0')}`;
}

// The order in which a mission asks its (already chosen) targets. Independent of the order they were supplied in, so the same mission
// reproduces the same sequence on any device; a new missionSeed gives a new sequence. Membership is never changed.
export function orderMissionTargets(targetIds = [], missionSeed) {
  const seed = clean('missionSeed', missionSeed);
  return [...new Set(targetIds.map(String))].sort().map(id => [fnv(`${seed}␟order␟${id}`, 2166136261), id]).sort((a, b) => a[0] - b[0] || a[1].localeCompare(b[1])).map(([, id]) => id);
}

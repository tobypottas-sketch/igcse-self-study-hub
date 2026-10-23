// Content-seed derivation for a mission. PURE. The mission seed is issued by the SERVER (public.start_vocabulary_mission) and exists only
// to drive reproducible content variation: H(missionSeed, occurrenceId, slot, activityType). It is never an input to grading, and the
// presentation nonce (option/tile order) is deliberately NOT part of it. Builders are not wired to it yet.
function fnv(text, basis) { let h = basis >>> 0; for (const c of String(text)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
const clean = (name, v) => { const s = String(v ?? '').trim(); if (!s) throw new Error(`${name} is required to derive a content seed`); return s; };
export function deriveContentSeed({ missionSeed, occurrenceId, slot, activityType } = {}) {
  const parts = [clean('missionSeed', missionSeed), clean('occurrenceId', occurrenceId), clean('slot', slot), clean('activityType', activityType)];
  if (!Number.isInteger(Number(parts[2])) || Number(parts[2]) < 0) throw new Error('slot must be a non-negative integer');
  const text = parts.join('␟');
  return `cs_${fnv(text, 2166136261).toString(16).padStart(8, '0')}${fnv(text, 0x9e3779b1).toString(16).padStart(8, '0')}`;
}

// Local cache of the OPEN mission for a slot. A UX convenience only (resume without a round trip, restore the exact "already seen"
// snapshot so the unanswered question regenerates identically): the server is authoritative, and a cache entry that disagrees with the
// server's open mission is discarded. Ids and counters only, never answers, notes or names.
export const MISSION_CACHE_MAX_AGE_MS = 12 * 60 * 60 * 1000;   // same horizon as the server (stale missions are abandoned after 12 hours)
const KEY = userKey => `vocab.mission.v1.${String(userKey || 'anon')}`;

export function slotKey({ unitNumber, kind, pathwayId = null, stageId = null } = {}) {
  return [unitNumber, kind, pathwayId ?? '', stageId ?? ''].join('|');
}
function readAll(userKey, storage) {
  try { const raw = JSON.parse(storage?.getItem(KEY(userKey)) || '{}'); return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}; } catch { return {}; }
}
function valid(entry) {
  return entry && typeof entry.missionId === 'string' && typeof entry.missionSeed === 'string' && Array.isArray(entry.targetIds) && Array.isArray(entry.completedTargetIds) && typeof entry.savedAt === 'number';
}
export function loadMission(userKey, slot, { storage = globalThis.localStorage, now = Date.now() } = {}) {
  const entry = readAll(userKey, storage)[slotKey(slot)];
  if (!valid(entry) || now - entry.savedAt > MISSION_CACHE_MAX_AGE_MS) return null;
  return entry;
}
export function saveMission(userKey, slot, entry, { storage = globalThis.localStorage, now = Date.now() } = {}) {
  try {
    const all = readAll(userKey, storage);
    for (const [key, value] of Object.entries(all)) if (!valid(value) || now - value.savedAt > MISSION_CACHE_MAX_AGE_MS) delete all[key];
    all[slotKey(slot)] = { missionId:entry.missionId, missionSeed:entry.missionSeed, familyId:entry.familyId ?? null, targetIds:[...entry.targetIds], completedTargetIds:[...(entry.completedTargetIds ?? [])], usedAtStart:entry.usedAtStart ?? {}, asks:entry.asks ?? {}, savedAt:now };
    storage?.setItem(KEY(userKey), JSON.stringify(all));
    return true;
  } catch { return false; }
}
export function clearMission(userKey, slot, { storage = globalThis.localStorage } = {}) {
  try { const all = readAll(userKey, storage); delete all[slotKey(slot)]; storage?.setItem(KEY(userKey), JSON.stringify(all)); } catch { /* storage unavailable */ }
}
// Records that a target of the open mission is finished (so a resume does not ask it again).
export function markTargetComplete(userKey, slot, occurrenceId, { storage = globalThis.localStorage, now = Date.now() } = {}) {
  const entry = loadMission(userKey, slot, { storage, now });
  if (!entry || entry.completedTargetIds.includes(occurrenceId)) return false;
  return saveMission(userKey, slot, { ...entry, completedTargetIds:[...entry.completedTargetIds, occurrenceId] }, { storage, now });
}
export const usedToObject = map => Object.fromEntries([...(map ?? new Map())].map(([id, list]) => [id, [...list]]));
export const usedFromObject = object => new Map(Object.entries(object && typeof object === 'object' ? object : {}).map(([id, list]) => [id, Array.isArray(list) ? list.filter(x => typeof x === 'string') : []]));

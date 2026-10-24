// Acquiring a mission's identity. The client never invents a mission id or seed:
//   - ask the server (start_vocabulary_mission): the open mission for the slot is RESUMED (same id, same seed); otherwise a NEW one is issued;
//   - `forceNew` (an explicit "start again", or a change of chosen activity family) abandons the open mission and issues another;
//   - the server wins: a cached mission that disagrees with the server's is discarded;
//   - if the server cannot be reached the outcome is explicit. A cached OPEN mission for this slot may be resumed (same id, so no second
//     mission appears); with no cache the result is `unavailable` and NOTHING is started. A failed RPC never creates a mission.
import { loadMission, clearMission } from './mission-cache.js';

export async function acquireMission({ start, userKey, slot, familyId = null, forceNew = false, storage = globalThis.localStorage, now = Date.now() } = {}) {
  if (typeof start !== 'function') throw new TypeError('acquireMission needs a start function.');
  const cached = loadMission(userKey, slot, { storage, now });
  const familyChanged = Boolean(cached) && (cached.familyId ?? null) !== (familyId ?? null);
  const newRequested = forceNew === true || familyChanged;
  let server;
  try {
    server = await start({ ...slot, forceNew:newRequested });
  } catch (error) {
    if (cached && !newRequested) return { status:'ready', source:'cache', resumed:true, missionId:cached.missionId, missionSeed:cached.missionSeed, extras:cached, warning:error?.message ?? 'offline' };
    return { status:'unavailable', error:error instanceof Error ? error : new Error(String(error)) };
  }
  if (cached && cached.missionId === server.missionId && !newRequested) {
    return { status:'ready', source:'server', resumed:server.resumed === true, missionId:server.missionId, missionSeed:server.missionSeed, extras:cached, server };
  }
  if (cached) clearMission(userKey, slot, { storage });       // server wins: the cached mission is not the server's open one
  // The server resumed an open mission this browser has no progress record for (storage cleared, another device or tab). Without that record
  // the app would re-ask questions already answered and write duplicate evidence into the mission, so that mission is abandoned and a fresh one issued.
  if (server.resumed === true && !newRequested) {
    try { server = await start({ ...slot, forceNew:true }); }
    catch (error) { return { status:'unavailable', error:error instanceof Error ? error : new Error(String(error)) }; }
    return { status:'ready', source:'server', resumed:false, missionId:server.missionId, missionSeed:server.missionSeed, extras:null, discardedCache:Boolean(cached), replacedUntrackedMission:true, server };
  }
  return { status:'ready', source:'server', resumed:false, missionId:server.missionId, missionSeed:server.missionSeed, extras:null, discardedCache:Boolean(cached), server };
}

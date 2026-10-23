// Reference model of mission identity (Part 8). Executable spec of the lifecycle the redesign must implement.
// missionId = identity of the attempt; missionSeed = content randomness fixed for that mission's lifetime.
let counter = 0;
const fresh = prefix => `${prefix}-${(counter += 1)}`;
export function startMission(store, { pathwayId, stageId }) { // "new mission"
  const m = { missionId: fresh('mission'), missionSeed: fresh('seed'), pathwayId, stageId, status: 'open' };
  store.current = m; store.history.push(m); return m;
}
export const newStore = () => ({ current: null, history: [] });
export function resumeMission(store) { return store.current?.status === 'open' ? store.current : null; }   // same id AND same seed
export function abandonMission(store) { if (store.current) store.current.status = 'abandoned'; }
export function completeMission(store) { if (store.current) store.current.status = 'completed'; }
export function refresh(store) { return JSON.parse(JSON.stringify(store)); } // persisted state survives a reload

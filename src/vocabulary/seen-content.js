// Remembers which question content a student has already met, so a new session or a higher stage prefers fresh
// questions. Browser storage only (ids, never answers or names); a convenience, never required, never sent anywhere.
// The builders already treat "used" ids as a soft preference and fall back when everything has been seen.
const KEY = userKey => `vocab.seenContent.v1.${String(userKey || 'anon')}`;
export const SEEN_PER_WORD = 16;

export function loadSeenContent(userKey, storage = globalThis.localStorage) {
  const map = new Map();
  try {
    const raw = JSON.parse(storage?.getItem(KEY(userKey)) || '{}');
    for (const [occurrenceId, ids] of Object.entries(raw && typeof raw === 'object' ? raw : {})) {
      if (Array.isArray(ids)) map.set(occurrenceId, ids.filter(id => typeof id === 'string').slice(-SEEN_PER_WORD));
    }
  } catch { /* unavailable or corrupt storage: start fresh */ }
  return map;
}

// Most recent last; re-seeing an item moves it to the end so the cap drops the oldest, not the newest.
export function mergeSeen(previous = [], additions = [], cap = SEEN_PER_WORD) {
  const result = [...previous];
  for (const id of additions) {
    const at = result.indexOf(id);
    if (at >= 0) result.splice(at, 1);
    result.push(id);
  }
  return result.slice(-cap);
}

export function saveSeenContent(userKey, occurrenceId, ids, storage = globalThis.localStorage) {
  try {
    const raw = JSON.parse(storage?.getItem(KEY(userKey)) || '{}');
    const all = raw && typeof raw === 'object' ? raw : {};
    all[occurrenceId] = mergeSeen(all[occurrenceId] ?? [], ids);
    storage?.setItem(KEY(userKey), JSON.stringify(all));
  } catch { /* storage may be unavailable */ }
}

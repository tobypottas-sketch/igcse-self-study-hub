// A cosmetic "already shown" flag per student, kept in this browser only. Achievements themselves are derived, never stored.
const keyFor = userKey => `vocab:achievements-seen:${userKey || 'anon'}`;

export function loadSeenAchievements(userKey, storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem?.(keyFor(userKey));
    return raw == null ? null : new Set(JSON.parse(raw));
  } catch { return null; }
}

export function saveSeenAchievements(userKey, ids, storage = globalThis.localStorage) {
  try { storage?.setItem?.(keyFor(userKey), JSON.stringify([...ids])); } catch { /* cosmetic only */ }
}

// Returns the achievements that are unlocked but not yet shown. With no record at all (first visit) everything already
// earned is treated as seen, so only future unlocks are announced.
export function newAchievements(list, userKey, storage) {
  const unlocked = list.filter(item => item.unlocked);
  const seen = loadSeenAchievements(userKey, storage);
  if (seen == null) { saveSeenAchievements(userKey, unlocked.map(item => item.id), storage); return []; }
  return unlocked.filter(item => !seen.has(item.id));
}

export function markAchievementsSeen(list, userKey, storage) {
  saveSeenAchievements(userKey, list.filter(item => item.unlocked).map(item => item.id), storage);
}

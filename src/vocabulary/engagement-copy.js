// Pure, client-only engagement copy. Nothing here is stored, scored or sent anywhere: it only describes the live mission.
export const STAR_THRESHOLDS = Object.freeze([5, 7, 9]);
export const STREAK_CHIP_FROM = 3;

const STREAK_NAMES = Object.freeze({ 5: 'strong run', 8: 'nearly perfect', 10: 'perfect run' });

export function streakMomentum(streak) {
  const n = Math.max(0, Math.floor(Number(streak) || 0));
  if (n < STREAK_CHIP_FROM) return null;
  return STREAK_NAMES[n] ? `${n} in a row — ${STREAK_NAMES[n]}` : `${n} in a row`;
}

// Stars the mission is currently on track for (same thresholds as the finish screen: 5 / 7 / 9 correct of a ten-activity mission).
export function starPipsFor(score, missionSize = 10) {
  if (Number(missionSize) !== 10) return null;
  const safe = Math.max(0, Math.floor(Number(score) || 0));
  const lit = STAR_THRESHOLDS.filter(threshold => safe >= threshold).length;
  return { lit, total: STAR_THRESHOLDS.length, thresholds: STAR_THRESHOLDS, label: lit === 0 ? 'No stars yet' : `${lit} of 3 stars on track` };
}

export function shouldCountListeningTime({ visible, audioPlaying, recentlyInteractive }) {
  if (!visible) return false;
  if (audioPlaying) return true;
  return Boolean(recentlyInteractive);
}

export function capListeningFlush(seconds) {
  const value = Math.max(0, Number(seconds) || 0);
  return Math.min(600, Math.floor(value));
}

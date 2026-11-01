// Optional sound cues. Off by default; the choice is a per-browser convenience only and is never sent anywhere.
// Cues are bundled local samples, preload only after the student turns sound on, and every playback failure is swallowed
// so sound can never affect marking, progress, saving or navigation.
export const SOUND_STORAGE_KEY = 'vocabulary-sound';

const CUE_ASSETS = Object.freeze({
  correct:new URL('./sounds/correct.wav', import.meta.url),
  incorrect:new URL('./sounds/incorrect.wav', import.meta.url),
  finish:new URL('./sounds/finish.wav', import.meta.url),
  'blitz-correct':new URL('./sounds/blitz-correct.wav', import.meta.url),
  'blitz-wrong':new URL('./sounds/blitz-wrong.wav', import.meta.url),
  'blitz-timeout':new URL('./sounds/blitz-timeout.wav', import.meta.url),
  'blitz-tier-2':new URL('./sounds/blitz-tier-2.wav', import.meta.url),
  'blitz-tier-3':new URL('./sounds/blitz-tier-3.wav', import.meta.url),
  'blitz-tier-4':new URL('./sounds/blitz-tier-4.wav', import.meta.url),
  'blitz-finish':new URL('./sounds/blitz-finish.wav', import.meta.url),
  'connections-solved':new URL('./sounds/connections-solved.wav', import.meta.url),
  'connections-wrong':new URL('./sounds/connections-wrong.wav', import.meta.url),
  'connections-finish':new URL('./sounds/connections-finish.wav', import.meta.url)
});

export function cueAsset(name) { return CUE_ASSETS[name] ?? null; }

const audioByClass = new WeakMap();
const activeByClass = new WeakMap();

export function soundEnabled(storage = globalThis.localStorage) {
  try { return storage?.getItem(SOUND_STORAGE_KEY) === 'on'; } catch { return false; }
}

function audioFor(name, AudioClass) {
  if (typeof AudioClass !== 'function') return null;
  const asset = cueAsset(name); if (!asset) return null;
  let cache = audioByClass.get(AudioClass);
  if (!cache) { cache = new Map(); audioByClass.set(AudioClass, cache); }
  let audio = cache.get(name);
  if (!audio) {
    audio = new AudioClass(asset.href);
    try { audio.preload = 'auto'; audio.volume = 0.72; audio.load?.(); } catch { /* preloading is best effort */ }
    cache.set(name, audio);
  }
  return audio;
}

export function preloadSoundCues({ AudioClass = globalThis.Audio } = {}) {
  try {
    if (typeof AudioClass !== 'function') return false;
    for (const name of Object.keys(CUE_ASSETS)) audioFor(name, AudioClass);
    return true;
  } catch { return false; }
}

export function setSoundEnabled(on, storage = globalThis.localStorage) {
  try { storage?.setItem(SOUND_STORAGE_KEY, on ? 'on' : 'off'); } catch { /* the choice just will not be remembered */ }
  if (on === true) preloadSoundCues();
  return on === true;
}

function stopActive(AudioClass) {
  const active = activeByClass.get(AudioClass);
  if (!active) return;
  try { active.pause?.(); } catch { /* best effort */ }
  try { active.currentTime = 0; } catch { /* media may not be seekable yet */ }
  activeByClass.delete(AudioClass);
}

export function playCue(name, { storage = globalThis.localStorage, AudioClass = globalThis.Audio } = {}) {
  try {
    if (!soundEnabled(storage) || !cueAsset(name) || typeof AudioClass !== 'function') return false;
    const audio = audioFor(name, AudioClass); if (!audio) return false;
    stopActive(AudioClass);
    try { audio.currentTime = 0; } catch { /* playback can still start from the beginning after preload */ }
    activeByClass.set(AudioClass, audio);
    const result = audio.play?.();
    if (result && typeof result.catch === 'function') void result.catch(() => {});
    return true;
  } catch { return false; }
}

export function renderSoundToggle(on) {
  return `<button type="button" class="vocab-sound-toggle" data-action="toggle-sound" aria-pressed="${on ? 'true' : 'false'}">Sound: ${on ? 'on' : 'off'}</button>`;
}

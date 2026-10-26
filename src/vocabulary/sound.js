// Optional sound cues (engagement Phase 3). Off by default; the choice is a per-browser convenience only and is never
// sent anywhere. Cues are short synthesised tones (no audio files), only play after the student has turned sound on,
// and every failure is swallowed so sound can never affect marking, progress or saving.
export const SOUND_STORAGE_KEY = 'vocabulary-sound';

const note = (frequency, offset, duration, gain, wave = 'sine', endFrequency = null) => ({ frequency, offset, duration, gain, wave, ...(endFrequency ? { endFrequency } : {}) });

// Sound recipes are deliberately data, not hidden oscillator code. That keeps the musical intent testable without pretending
// an automated test can decide whether a sound is pleasant. Normal study cues are warm/soft; Blitz is shorter and punchier.
const RECIPES = Object.freeze({
  correct:Object.freeze([
    note(392, 0, 0.075, 0.052, 'triangle', 440),
    note(659, 0.045, 0.14, 0.044, 'sine', 784)
  ]),
  incorrect:Object.freeze([
    note(220, 0, 0.145, 0.042, 'triangle', 155)
  ]),
  finish:Object.freeze([
    note(392, 0, 0.15, 0.046, 'triangle'),
    note(523, 0.105, 0.17, 0.048, 'triangle'),
    note(659, 0.215, 0.30, 0.052, 'sine', 784)
  ]),
  'blitz-wrong':Object.freeze([
    note(185, 0, 0.11, 0.052, 'triangle', 125)
  ]),
  'blitz-finish':Object.freeze([
    note(440, 0, 0.13, 0.048, 'triangle'),
    note(587, 0.09, 0.14, 0.052, 'triangle'),
    note(740, 0.18, 0.18, 0.052, 'sine'),
    note(880, 0.31, 0.24, 0.046, 'sine', 988)
  ])
});

function copyRecipe(recipe) { return recipe.map(voice => ({ ...voice })); }

export function cueRecipe(name, { streak = 0, multiplier = 1, personalBest = false } = {}) {
  if (name === 'blitz-correct') {
    // A bounded lift makes streaks feel hotter without turning repeated answers into an ever-rising squeal.
    const tier = streak >= 10 ? 3 : streak >= 6 ? 2 : streak >= 3 ? 1 : 0;
    const lift = Math.min(120, tier * 28 + Math.max(0, Number(multiplier) - 1) * 18);
    const recipe = [
      note(205, 0, 0.05, 0.048, 'triangle', 245),
      note(620 + lift, 0.022, 0.105, 0.052, 'sine', 700 + lift)
    ];
    if (tier > 0) recipe.push(note(Math.min(1120, 820 + tier * 55), 0.065, 0.085, 0.035, 'sine'));
    return recipe;
  }
  const base = RECIPES[name];
  if (!base) return [];
  const recipe = copyRecipe(base);
  if (name === 'blitz-finish' && personalBest) recipe.push(note(1100, 0.47, 0.18, 0.038, 'sine', 1240));
  return recipe;
}

let audio = null;
const activeVoices = new Set();

export function soundEnabled(storage = globalThis.localStorage) {
  try { return storage?.getItem(SOUND_STORAGE_KEY) === 'on'; } catch { return false; }
}

export function setSoundEnabled(on, storage = globalThis.localStorage) {
  try { storage?.setItem(SOUND_STORAGE_KEY, on ? 'on' : 'off'); } catch { /* the choice just will not be remembered */ }
  return on === true;
}

function stopActiveVoices() {
  for (const oscillator of activeVoices) {
    try { oscillator.stop?.(); } catch { /* it may already have ended */ }
    try { oscillator.disconnect?.(); } catch { /* cleanup is best effort */ }
  }
  activeVoices.clear();
}

export function playCue(name, { storage = globalThis.localStorage, AudioContextClass = globalThis.AudioContext ?? globalThis.webkitAudioContext, streak = 0, multiplier = 1, personalBest = false } = {}) {
  try {
    const recipe = cueRecipe(name, { streak, multiplier, personalBest });
    if (!soundEnabled(storage) || !recipe.length || typeof AudioContextClass !== 'function') return false;
    audio ??= new AudioContextClass();
    if (audio.state === 'suspended') void audio.resume?.();
    stopActiveVoices();
    const start = audio.currentTime;
    for (const voice of recipe) {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = voice.wave;
      if (typeof oscillator.frequency?.setValueAtTime === 'function') oscillator.frequency.setValueAtTime(voice.frequency, start + voice.offset);
      else if (oscillator.frequency) oscillator.frequency.value = voice.frequency;
      if (voice.endFrequency && typeof oscillator.frequency?.exponentialRampToValueAtTime === 'function') oscillator.frequency.exponentialRampToValueAtTime(voice.endFrequency, start + voice.offset + voice.duration);
      gain.gain.setValueAtTime(0.0001, start + voice.offset);
      gain.gain.exponentialRampToValueAtTime(voice.gain, start + voice.offset + Math.min(0.018, voice.duration / 3));
      gain.gain.exponentialRampToValueAtTime(0.0001, start + voice.offset + voice.duration);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.onended = () => { activeVoices.delete(oscillator); try { oscillator.disconnect?.(); gain.disconnect?.(); } catch { /* best effort */ } };
      activeVoices.add(oscillator);
      oscillator.start(start + voice.offset);
      oscillator.stop(start + voice.offset + voice.duration + 0.02);
    }
    return true;
  } catch { return false; }
}

export function renderSoundToggle(on) {
  return `<button type="button" class="vocab-sound-toggle" data-action="toggle-sound" aria-pressed="${on ? 'true' : 'false'}">Sound: ${on ? 'on' : 'off'}</button>`;
}

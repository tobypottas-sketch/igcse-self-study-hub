// Optional sound cues (engagement Phase 3). Off by default; the choice is a per-browser convenience only and is never
// sent anywhere. Cues are short synthesised tones (no audio files), only play after the student has turned sound on,
// and every failure is swallowed so sound can never affect marking, progress or saving.
export const SOUND_STORAGE_KEY = 'vocabulary-sound';

const CUES = Object.freeze({
  correct:[[660, 0, 0.09], [880, 0.08, 0.12]],
  finish:[[523, 0, 0.12], [659, 0.11, 0.12], [784, 0.22, 0.2]]
});

let audio = null;

export function soundEnabled(storage = globalThis.localStorage) {
  try { return storage?.getItem(SOUND_STORAGE_KEY) === 'on'; } catch { return false; }
}

export function setSoundEnabled(on, storage = globalThis.localStorage) {
  try { storage?.setItem(SOUND_STORAGE_KEY, on ? 'on' : 'off'); } catch { /* the choice just will not be remembered */ }
  return on === true;
}

export function playCue(name, { storage = globalThis.localStorage, AudioContextClass = globalThis.AudioContext ?? globalThis.webkitAudioContext } = {}) {
  try {
    if (!soundEnabled(storage) || !CUES[name] || typeof AudioContextClass !== 'function') return false;
    audio ??= new AudioContextClass();
    if (audio.state === 'suspended') void audio.resume?.();
    const start = audio.currentTime;
    for (const [frequency, offset, length] of CUES[name]) {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start + offset);
      gain.gain.exponentialRampToValueAtTime(0.08, start + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + offset + length);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start(start + offset);
      oscillator.stop(start + offset + length + 0.02);
    }
    return true;
  } catch { return false; }
}

export function renderSoundToggle(on) {
  return `<button type="button" class="vocab-sound-toggle" data-action="toggle-sound" aria-pressed="${on ? 'true' : 'false'}">Sound: ${on ? 'on' : 'off'}</button>`;
}

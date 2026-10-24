import test from 'node:test';
import assert from 'node:assert/strict';
import { SOUND_STORAGE_KEY, playCue, renderSoundToggle, setSoundEnabled, soundEnabled } from '../src/vocabulary/sound.js';

function memory() { const map = new Map(); return { getItem:key => map.get(key) ?? null, setItem:(key, value) => map.set(key, value) }; }
class FakeAudio {
  static created = 0; static tones = 0;
  constructor() { FakeAudio.created += 1; this.currentTime = 0; this.state = 'running'; this.destination = {}; }
  createOscillator() { FakeAudio.tones += 1; return { frequency:{}, connect() {}, start() {}, stop() {} }; }
  createGain() { return { gain:{ setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} }; }
}

test('sound is off by default and silent until switched on', () => {
  const storage = memory();
  assert.equal(soundEnabled(storage), false);
  assert.equal(playCue('correct', { storage, AudioContextClass:FakeAudio }), false);
  assert.equal(FakeAudio.created, 0);
});

test('switching on plays short cues and switching off silences them again', () => {
  const storage = memory();
  setSoundEnabled(true, storage);
  assert.equal(storage.getItem(SOUND_STORAGE_KEY), 'on');
  assert.equal(playCue('correct', { storage, AudioContextClass:FakeAudio }), true);
  assert.equal(playCue('finish', { storage, AudioContextClass:FakeAudio }), true);
  assert.equal(playCue('unknown', { storage, AudioContextClass:FakeAudio }), false);
  setSoundEnabled(false, storage);
  const tones = FakeAudio.tones;
  assert.equal(playCue('correct', { storage, AudioContextClass:FakeAudio }), false);
  assert.equal(FakeAudio.tones, tones);
});

test('blocked storage or missing audio never throws', () => {
  const broken = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.equal(soundEnabled(broken), false);
  assert.doesNotThrow(() => setSoundEnabled(true, broken));
  assert.equal(playCue('correct', { storage:memory(), AudioContextClass:undefined }), false);
});

test('toggle is a labelled pressed-state button', () => {
  assert.match(renderSoundToggle(false), /aria-pressed="false"[^>]*>Sound: off</);
  assert.match(renderSoundToggle(true), /aria-pressed="true"[^>]*>Sound: on</);
});

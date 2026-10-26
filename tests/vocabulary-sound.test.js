import test from 'node:test';
import assert from 'node:assert/strict';
import { SOUND_STORAGE_KEY, playCue, renderSoundToggle, setSoundEnabled, soundEnabled } from '../src/vocabulary/sound.js';

function memory() { const map = new Map(); return { getItem:key => map.get(key) ?? null, setItem:(key, value) => map.set(key, value) }; }
class FakeAudio {
  static created = 0; static played = 0; static paused = 0;
  constructor(src) { FakeAudio.created += 1; this.src = src; this.currentTime = 0; }
  load() {}
  play() { FakeAudio.played += 1; return Promise.resolve(); }
  pause() { FakeAudio.paused += 1; }
}

function resetFakeAudio() { FakeAudio.created = 0; FakeAudio.played = 0; FakeAudio.paused = 0; }

test('sound is off by default and silent until switched on', () => {
  resetFakeAudio();
  const storage = memory();
  assert.equal(soundEnabled(storage), false);
  assert.equal(playCue('correct', { storage, AudioClass:FakeAudio }), false);
  assert.equal(FakeAudio.created, 0);
});

test('switching on plays bundled cues and switching off silences them again', async () => {
  resetFakeAudio();
  const storage = memory();
  setSoundEnabled(true, storage);
  assert.equal(storage.getItem(SOUND_STORAGE_KEY), 'on');
  assert.equal(playCue('correct', { storage, AudioClass:FakeAudio }), true);
  assert.equal(playCue('finish', { storage, AudioClass:FakeAudio }), true);
  assert.equal(playCue('unknown', { storage, AudioClass:FakeAudio }), false);
  await Promise.resolve();
  assert.equal(FakeAudio.played, 2);
  setSoundEnabled(false, storage);
  const played = FakeAudio.played;
  assert.equal(playCue('correct', { storage, AudioClass:FakeAudio }), false);
  assert.equal(FakeAudio.played, played);
});

test('blocked storage or missing audio never throws', () => {
  const broken = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.equal(soundEnabled(broken), false);
  assert.doesNotThrow(() => setSoundEnabled(true, broken));
  assert.equal(playCue('correct', { storage:memory(), AudioClass:undefined }), false);
});

test('toggle is a labelled pressed-state button', () => {
  assert.match(renderSoundToggle(false), /aria-pressed="false"[^>]*>Sound: off</);
  assert.match(renderSoundToggle(true), /aria-pressed="true"[^>]*>Sound: on</);
});

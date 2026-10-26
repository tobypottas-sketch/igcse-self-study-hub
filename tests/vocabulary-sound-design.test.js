import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { cueAsset, playCue, soundEnabled, setSoundEnabled } from '../src/vocabulary/sound.js';

const memoryStorage = initial => {
  const values = new Map(Object.entries(initial ?? {}));
  return {
    getItem:key => values.get(key) ?? null,
    setItem:(key, value) => values.set(key, String(value))
  };
};

const expectedAssets = {
  correct:'correct.wav',
  incorrect:'incorrect.wav',
  finish:'finish.wav',
  'blitz-correct':'blitz-correct.wav',
  'blitz-wrong':'blitz-wrong.wav',
  'blitz-timeout':'blitz-timeout.wav'
};

test('Vocabulary cues resolve to bundled local WAV assets instead of oscillator recipes', () => {
  for (const [name, file] of Object.entries(expectedAssets)) {
    const asset = cueAsset(name);
    assert.ok(asset instanceof URL, `${name} has a local asset URL`);
    assert.match(asset.pathname, new RegExp(`/src/vocabulary/sounds/${file.replace('.', '\\.')}$`));
  }
  assert.equal(cueAsset('does-not-exist'), null, 'unknown cues stay silent');

  const source = fs.readFileSync(new URL('../src/vocabulary/sound.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /createOscillator|cueRecipe|RECIPES/, 'runtime oscillator recipes are no longer the primary sound design');
});

test('sound remains opt-in and sample playback failures cannot affect learning flow', async () => {
  const off = memoryStorage();
  const calls = [];
  class FakeAudio {
    constructor(src) { this.src = src; calls.push(['new', src]); }
    play() { calls.push(['play', this.src]); return Promise.resolve(); }
    pause() { calls.push(['pause', this.src]); }
  }

  assert.equal(soundEnabled(off), false);
  assert.equal(playCue('correct', { storage:off, AudioClass:FakeAudio }), false, 'muted sound does not construct audio');
  assert.deepEqual(calls, []);

  setSoundEnabled(true, off);
  assert.equal(soundEnabled(off), true);
  assert.equal(playCue('correct', { storage:off, AudioClass:FakeAudio }), true);
  await Promise.resolve();
  assert.ok(calls.some(([kind, src]) => kind === 'play' && src.endsWith('/src/vocabulary/sounds/correct.wav')));

  class RejectingAudio { play() { return Promise.reject(new Error('blocked')); } pause() {} }
  assert.doesNotThrow(() => playCue('incorrect', { storage:off, AudioClass:RejectingAudio }), 'playback rejection is swallowed');
  await Promise.resolve();
});

test('normal study gives restrained audio feedback for both correct and incorrect answers', () => {
  const source = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');
  assert.match(source, /playCue\(result\.correct \? 'correct' : 'incorrect'\)/);
  assert.match(source, /if \(on\) playCue\('correct'\)/, 'turning sound on still provides an immediate audition');
});

test('Word Blitz uses dedicated sample cues and a neutral time-up cue', () => {
  const source = fs.readFileSync(new URL('../src/vocabulary/games/games-controller.js', import.meta.url), 'utf8');
  assert.match(source, /playCue\(result\.correct \? 'blitz-correct' : 'blitz-wrong'/);
  assert.match(source, /playCue\('blitz-timeout'\)/);
  assert.doesNotMatch(source, /playCue\('blitz-finish'/, 'timeout is not disguised as a success sting');
});

test('Connections uses the shared feedback family for guesses and choice-mode answers', () => {
  const source = fs.readFileSync(new URL('../src/vocabulary/games/games-controller.js', import.meta.url), 'utf8');
  const feedbackCalls = source.match(/playCue\(r\.correct \? 'correct' : 'incorrect'\)/g) ?? [];
  assert.equal(feedbackCalls.length, 2, 'typed guesses and supported choices both receive right/wrong feedback');
});

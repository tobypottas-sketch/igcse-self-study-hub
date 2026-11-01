import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { cueAsset, playCue, soundEnabled, setSoundEnabled } from '../src/vocabulary/sound.js';
import { mountGames } from '../src/vocabulary/games/games-controller.js';
import { BLITZ } from '../src/vocabulary/games/blitz-engine.js';
import { createGameHistory } from '../src/vocabulary/games/games-history.js';
import unit1 from '../content/vocabulary/units/unit-01.js';

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
  'blitz-timeout':'blitz-timeout.wav',
  'blitz-tier-2':'blitz-tier-2.wav',
  'blitz-tier-3':'blitz-tier-3.wav',
  'blitz-tier-4':'blitz-tier-4.wav',
  'blitz-finish':'blitz-finish.wav',
  'connections-solved':'connections-solved.wav',
  'connections-wrong':'connections-wrong.wav',
  'connections-finish':'connections-finish.wav'
};

test('Vocabulary cues resolve to bundled local WAV assets instead of oscillator recipes', () => {
  for (const [name, file] of Object.entries(expectedAssets)) {
    const asset = cueAsset(name);
    assert.ok(asset instanceof URL, `${name} has a local asset URL`);
    assert.match(asset.pathname, new RegExp(`/src/vocabulary/sounds/${file.replace('.', '\\.')}$`));
    assert.ok(fs.existsSync(asset), `${file} is bundled in the repository`);
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

test('games receive sound as a harmless callback instead of importing storage-aware sound code', () => {
  const app = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');
  const source = fs.readFileSync(new URL('../src/vocabulary/games/games-controller.js', import.meta.url), 'utf8');
  assert.match(app, /onCue:playCue, onExit:/);
  assert.doesNotMatch(source, /from '\.\.\/sound\.js'/);
  assert.match(source, /onCue = \(\) => \{\}/);
});

for (const expiry of ['tick', 'pending answer']) {
  test(`Word Blitz uses answer cues and the accomplishment cue when time expires via ${expiry}`, t => {
    const cues = []; const listeners = new Map(); const timers = new Map(); const ticks = new Map();
    let time = 0; let timerId = 0;
    // Only the DOM surface used by answering is needed; rendering and the game engine stay real.
    const score = { textContent:'', classList:{ remove() {}, add() {} } };
    const options = Array.from({ length:4 }, () => ({ disabled:false, dataset:{} }));
    const root = {
      innerHTML:'',
      querySelector:selector => selector === '[data-blitz-score]' ? score : null,
      querySelectorAll:selector => selector === '.gm-option' ? options : [],
      contains:target => Boolean(target),
      addEventListener:(type, listener) => listeners.set(type, listener),
      removeEventListener:type => listeners.delete(type)
    };
    const game = mountGames(root, {
      content:unit1, game:'blitz', history:createGameHistory(), rng:() => 0.37,
      onCue:name => cues.push(name), now:() => time,
      setTimer:fn => { const id = ++timerId; timers.set(id, fn); return id; },
      clearTimer:id => timers.delete(id),
      setTick:fn => { const id = ++timerId; ticks.set(id, fn); return id; },
      clearTick:id => ticks.delete(id)
    });
    t.after(() => game.destroy());
    const click = (gameAct, index) => {
      const target = { dataset:{ gameAct, index }, closest() { return this; } };
      listeners.get('click')({ target });
    };
    const advance = () => {
      assert.equal(timers.size, 1, 'one answer advance is pending');
      const [id, fn] = timers.entries().next().value; timers.delete(id); fn();
    };

    click('blitz-start');
    assert.deepEqual(cues, [], 'starting does not play a completion cue');
    click('blitz-answer', game.blitz.state.question.answerIndex);
    assert.deepEqual(cues, ['blitz-correct']);
    advance();
    click('blitz-answer', (game.blitz.state.question.answerIndex + 1) % 4);
    assert.deepEqual(cues, ['blitz-correct', 'blitz-wrong']);
    if (expiry === 'tick') advance();

    time = BLITZ.durationMs;
    if (expiry === 'tick') {
      assert.equal(ticks.size, 1, 'the game clock is running');
      ticks.values().next().value();
    } else advance();

    assert.equal(game.blitz.state.status, 'over');
    assert.match(root.innerHTML, /data-game-act="blitz-again"/, 'the completion screen was rendered');
    assert.deepEqual(cues, ['blitz-correct', 'blitz-wrong', 'blitz-timeout'], 'time up plays the timeout cue first');
    assert.equal(timers.size, 1, 'the completion sting is scheduled a beat later'); { const [id, fn] = timers.entries().next().value; timers.delete(id); fn(); }
    assert.deepEqual(cues, ['blitz-correct', 'blitz-wrong', 'blitz-timeout', 'blitz-finish']);
    assert.equal(timers.size, 0, 'completion cancels answer timers');
    assert.equal(ticks.size, 0, 'completion stops the game clock');
  });
}

test('Connections uses its own cues for guesses and choice-mode answers', () => {
  const source = fs.readFileSync(new URL('../src/vocabulary/games/games-controller.js', import.meta.url), 'utf8');
  const feedbackCalls = source.match(/onCue\(r\.correct \? 'connections-solved' : 'connections-wrong'\)/g) ?? [];
  assert.equal(feedbackCalls.length, 2, 'typed guesses and supported choices both receive right/wrong feedback');
});

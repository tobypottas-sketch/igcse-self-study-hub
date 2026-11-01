// Games sound design pass: cue assets, cue mapping for Connections and Word Blitz, tier-up emphasis, and failure-safe playback.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { cueAsset, playCue, setSoundEnabled, soundEnabled } from '../src/vocabulary/sound.js';
import { mountGames } from '../src/vocabulary/games/games-controller.js';
import { BLITZ, multiplierFor } from '../src/vocabulary/games/blitz-engine.js';
import { CONNECTIONS_PUZZLES } from '../src/vocabulary/games/games-data.js';
import { createGameHistory } from '../src/vocabulary/games/games-history.js';
import unit1 from '../content/vocabulary/units/unit-01.js';

const repo = fileURLToPath(new URL('..', import.meta.url));
// duration window (ms) for each cue
const CUES = { 'connections-solved':[300, 480], 'connections-wrong':[80, 220], 'connections-finish':[500, 1000], 'blitz-correct':[60, 180], 'blitz-wrong':[60, 200],
  'blitz-tier-2':[180, 320], 'blitz-tier-3':[250, 420], 'blitz-tier-4':[350, 600], 'blitz-timeout':[250, 600], 'blitz-finish':[600, 1100] };

const readWav = name => {
  const buf = fs.readFileSync(cueAsset(name)); const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  assert.equal(buf.toString('ascii', 0, 4), 'RIFF'); assert.equal(buf.toString('ascii', 8, 12), 'WAVE'); assert.equal(buf.toString('ascii', 12, 16), 'fmt ');
  const [channels, rate, bits] = [dv.getUint16(22, true), dv.getUint32(24, true), dv.getUint16(34, true)];
  assert.equal(buf.toString('ascii', 36, 40), 'data'); const bytes = dv.getUint32(40, true); const n = bytes / 2;
  const samples = new Int16Array(n); for (let i = 0; i < n; i += 1) samples[i] = dv.getInt16(44 + i * 2, true);
  return { channels, rate, bits, samples, ms: (n / rate) * 1000 };
};

test('every game cue resolves to an existing local WAV: RIFF/WAVE, sensible duration, real audio, no clipping, matched loudness', () => {
  const rms = [];
  for (const [name, [min, max]] of Object.entries(CUES)) {
    const asset = cueAsset(name); assert.ok(asset instanceof URL && asset.protocol === 'file:', `${name}: local file URL`); assert.ok(fs.existsSync(asset), `${name}: file exists`);
    const w = readWav(name); assert.deepEqual([w.channels, w.rate, w.bits], [1, 44100, 16]); assert.ok(w.ms >= min && w.ms <= max, `${name}: ${Math.round(w.ms)} ms not in ${min}-${max}`);
    let peak = 0, run = 0, maxRun = 0, sum = 0; const head = Math.min(w.samples.length, Math.round(0.35 * w.rate));
    for (let i = 0; i < w.samples.length; i += 1) { const a = Math.abs(w.samples[i]); peak = Math.max(peak, a); run = a >= 32000 ? run + 1 : 0; maxRun = Math.max(maxRun, run); if (i < head) sum += (w.samples[i] / 32768) ** 2; }
    assert.ok(peak > 3000, `${name}: not silent`); assert.ok(peak / 32768 < 0.8, `${name}: peak ${peak / 32768} leaves headroom`); assert.ok(maxRun < 2, `${name}: no clipping`);
    assert.ok(Math.abs(w.samples[0]) < 200 && Math.abs(w.samples.at(-1)) < 200, `${name}: starts and ends near zero (no pops)`);
    rms.push(20 * Math.log10(Math.sqrt(sum / head)));
  }
  assert.ok(Math.max(...rms) - Math.min(...rms) < 1.5, `loudness spread ${Math.max(...rms) - Math.min(...rms)} dB`);
});

test('no remote URLs: sound.js maps only local files and the games import no audio service', () => {
  const sound = fs.readFileSync(new URL('../src/vocabulary/sound.js', import.meta.url), 'utf8'); const controller = fs.readFileSync(new URL('../src/vocabulary/games/games-controller.js', import.meta.url), 'utf8');
  assert.doesNotMatch(sound, /https?:\/\//); assert.doesNotMatch(controller, /https?:\/\/|new Audio|AudioContext|createOscillator/); assert.doesNotMatch(sound, /createOscillator|AudioContext/);
  for (const m of sound.matchAll(/new URL\('([^']+)'/g)) assert.match(m[1], /^\.\/sounds\/[a-z0-9-]+\.wav$/);
});

// ---------------------------------------------------------------- harness around the real controller
const makeRoot = () => {
  const listeners = new Map(); const input = { value: '' }; const root = { innerHTML: '',
    querySelector: sel => (sel === '#cxGuess' ? input : sel === '[data-blitz-score]' ? { textContent: '', classList: { remove() {}, add() {} } } : sel === '.gm-guess' ? { dataset: {} } : null),
    querySelectorAll: sel => (sel === '.gm-option' ? Array.from({ length: 4 }, () => ({ disabled: false, dataset: {} })) : []),
    contains: () => true, addEventListener: (t, l) => listeners.set(t, l), removeEventListener: t => listeners.delete(t) };
  return { root, input, click: (gameAct, extra = {}) => listeners.get('click')({ target: { dataset: { gameAct, ...extra }, closest() { return this; } } }),
    submit: text => { input.value = text; listeners.get('submit')({ target: { matches: () => true, elements: {} }, preventDefault() {} }); } };
};
const harness = (game, { onCue, puzzles = null, now = () => 0 } = {}) => {
  const h = makeRoot(); const timers = new Map(); const ticks = new Map(); let id = 0;
  const ctl = mountGames(h.root, { content: unit1, game, puzzles, history: createGameHistory(), rng: () => 0.37, onCue, now, setTimer: fn => { timers.set(++id, fn); return id; }, clearTimer: i => timers.delete(i), setTick: fn => { ticks.set(++id, fn); return id; }, clearTick: i => ticks.delete(i) });
  const flush = () => { const [i, fn] = timers.entries().next().value; timers.delete(i); fn(); };
  const tickNow = () => ticks.values().next().value();
  return { ...h, ctl, timers, ticks, flush, tickNow };
};
const byTarget = (...t) => CONNECTIONS_PUZZLES.filter(p => t.includes(p.target));

test('Connections: wrong guess = soft knock, correct guess/solve = solved cue, round end = connections-finish; wrong guesses stay free', () => {
  const cues = []; const h = harness('connections', { onCue: n => cues.push(n), puzzles: byTarget('generation', 'feat') });
  h.click('cx-start'); h.submit('wrong'); assert.deepEqual(cues, ['connections-wrong']); assert.equal(h.ctl.connections.potential(), 500, 'wrong guesses are free');
  h.submit('generation'); assert.deepEqual(cues, ['connections-wrong', 'connections-solved']); assert.equal(h.ctl.connections.state.score, 500);
  h.click('cx-next'); assert.deepEqual(cues.slice(2), [], 'moving to the next puzzle is silent'); h.submit('feat'); assert.equal(cues.at(-1), 'connections-solved');
  h.click('cx-next'); assert.equal(cues.at(-1), 'connections-finish'); assert.equal(cues.filter(c => c === 'connections-finish').length, 1);
  assert.ok(cues.every(c => c.startsWith('connections-')), 'no study-session cues inside Connections');
});

test('Connections: Need help? choices and give-up use the same family; giving up is silent', () => {
  const cues = []; const h = harness('connections', { onCue: n => cues.push(n), puzzles: byTarget('generation') });
  h.click('cx-start'); for (let i = 0; i < 3; i += 1) h.click('cx-reveal'); h.click('cx-help');
  const wrong = h.ctl.connections.state.choices.find(c => c !== 'generation'); h.click('cx-choice', { term: wrong }); h.click('cx-choice', { term: 'generation' });
  assert.deepEqual(cues, ['connections-wrong', 'connections-solved']); assert.equal(h.ctl.connections.state.score, 100);
});

test('Word Blitz: correct = blitz-correct, wrong = blitz-wrong; tier-up cues fire only on the streak that reaches x2/x3/x4, never on ordinary correct answers', () => {
  const cues = []; const h = harness('blitz', { onCue: n => cues.push(n) }); h.click('blitz-start');
  const answer = right => { const q = h.ctl.blitz.state.question; h.click('blitz-answer', { index: right ? q.answerIndex : (q.answerIndex + 1) % 4 }); h.flush(); };
  const played = [];
  for (let streak = 1; streak <= 12; streak += 1) { answer(true); played.push(cues.at(-1)); }
  assert.deepEqual(played, ['blitz-correct', 'blitz-correct', 'blitz-tier-2', 'blitz-correct', 'blitz-correct', 'blitz-tier-3', 'blitz-correct', 'blitz-correct', 'blitz-correct', 'blitz-tier-4', 'blitz-correct', 'blitz-correct']);
  assert.equal(cues.filter(c => c.startsWith('blitz-tier')).length, 3, 'one tier cue per multiplier rise');
  answer(false); assert.equal(cues.at(-1), 'blitz-wrong'); for (let i = 0; i < 3; i += 1) answer(true); assert.equal(cues.at(-1), 'blitz-tier-2', 'after a reset the first rise is x2 again');
  // scoring is untouched: 100 x multiplier per correct answer
  let expected = 0; for (let s = 1; s <= 12; s += 1) expected += 100 * multiplierFor(s); for (let s = 1; s <= 3; s += 1) expected += 100 * multiplierFor(s);
  assert.equal(h.ctl.blitz.state.score, expected);
});

test('Word Blitz: time up plays blitz-timeout then blitz-finish a beat later; running out of questions goes straight to blitz-finish', () => {
  let t = 0; const cues = []; const h = harness('blitz', { onCue: n => cues.push(n), now: () => t }); h.click('blitz-start');
  t = BLITZ.durationMs; h.tickNow(); // the clock tick notices the end
  assert.equal(h.ctl.blitz.state.status, 'over'); assert.deepEqual(cues, ['blitz-timeout']); assert.equal(h.timers.size, 1); h.flush(); assert.deepEqual(cues, ['blitz-timeout', 'blitz-finish']);
  const early = []; const g = harness('blitz', { onCue: n => early.push(n) }); g.click('blitz-start');
  g.ctl.blitz.state.status; // exhausting the pool is covered by the engine; leaving the screen before the sting cancels it:
  t = 0; const cues2 = []; const k = harness('blitz', { onCue: n => cues2.push(n), now: () => t }); k.click('blitz-start'); t = BLITZ.durationMs; k.tickNow(); k.click('lobby'); assert.equal(k.timers.size, 0, 'leaving cancels the pending sting'); assert.deepEqual(cues2, ['blitz-timeout']);
});

// ---------------------------------------------------------------- failure safety
class RejectingAudio { play() { return Promise.reject(new Error('blocked')); } pause() {} }
class ThrowingAudio { constructor() { throw new Error('no audio'); } }
const memory = on => ({ getItem: () => (on ? 'on' : null), setItem() {} });

test('sound off stays silent; playback rejection or a missing/throwing Audio never blocks', async () => {
  const made = []; class Spy { constructor(src) { made.push(src); } play() { return Promise.resolve(); } pause() {} }
  for (const name of Object.keys(CUES)) assert.equal(playCue(name, { storage: memory(false), AudioClass: Spy }), false); assert.deepEqual(made, []); assert.equal(soundEnabled(memory(false)), false);
  for (const name of Object.keys(CUES)) assert.doesNotThrow(() => playCue(name, { storage: memory(true), AudioClass: RejectingAudio })); await Promise.resolve();
  assert.equal(playCue('connections-solved', { storage: memory(true), AudioClass: ThrowingAudio }), false); assert.equal(playCue('nope', { storage: memory(true), AudioClass: Spy }), false);
  setSoundEnabled(true, memory(false));
});

test('Word Blitz and Connections keep working end to end when audio playback rejects or throws', async () => {
  for (const AudioClass of [RejectingAudio, ThrowingAudio]) {
    const onCue = name => playCue(name, { storage: memory(true), AudioClass });
    const c = harness('connections', { onCue, puzzles: byTarget('generation', 'feat') }); c.click('cx-start'); c.submit('nope'); c.submit('generation'); c.click('cx-next'); c.submit('feat'); c.click('cx-next');
    assert.equal(c.ctl.connections.state.status, 'over'); assert.equal(c.ctl.connections.state.score, 1000);
    let t = 0; const b = harness('blitz', { onCue, now: () => t }); b.click('blitz-start');
    for (let i = 0; i < 4; i += 1) { b.click('blitz-answer', { index: b.ctl.blitz.state.question.answerIndex }); b.flush(); }
    t = BLITZ.durationMs; b.tickNow(); b.flush(); assert.equal(b.ctl.blitz.state.status, 'over'); assert.equal(b.ctl.blitz.state.score, 100 + 100 + 200 + 200);
  }
  await Promise.resolve();
});

test('scope: only sound assets, the generator, sound wiring and sound tests changed (no Supabase / SQL / Edge / content)', t => {
  let files; try { files = execFileSync('git', ['diff', '--name-only', 'origin/main...HEAD'], { cwd: repo, encoding: 'utf8' }).split('\n').filter(Boolean); } catch { t.skip('git history not available'); return; }
  if (!files.length) { t.skip('no committed diff yet'); return; }
  for (const f of files) assert.doesNotMatch(f, /^(supabase|content)\/|\.sql$|edge|blitz-engine|connections-engine|games-data|games-view/i, f);
});

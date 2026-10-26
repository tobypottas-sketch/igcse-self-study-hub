import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sampleRate = 44100;
const soundsDir = path.join(root, 'src/vocabulary/sounds');
fs.mkdirSync(soundsDir, { recursive:true });

function rng(seed) {
  let value = seed >>> 0;
  return () => { value = (1664525 * value + 1013904223) >>> 0; return value / 0xffffffff; };
}
function envelope(t, attack = 0.008, decay = 6) {
  if (t < 0) return 0;
  const rise = Math.min(1, t / Math.max(attack, 1e-6));
  return rise * Math.exp(-decay * Math.max(0, t - attack));
}
function tone(t, frequency, { amp = 1, harmonics = [1, .25, .08], decay = 7, attack = .004 } = {}) {
  if (t < 0) return 0;
  const total = harmonics.reduce((sum, value) => sum + Math.abs(value), 0) || 1;
  const wave = harmonics.reduce((sum, value, index) => sum + value * Math.sin(2 * Math.PI * frequency * (index + 1) * t), 0) / total;
  return amp * envelope(t, attack, decay) * wave;
}
function delayedTone(t, start, frequency, options) { return t >= start ? tone(t - start, frequency, options) : 0; }
function makeNoise(random) { return (t, amp = 1, decay = 35, attack = .001) => t < 0 ? 0 : amp * envelope(t, attack, decay) * (random() * 2 - 1); }
function writeWav(file, duration, sample, peak = .7) {
  const count = Math.floor(sampleRate * duration);
  const values = new Float64Array(count);
  let max = 1e-9;
  for (let i = 0; i < count; i += 1) { values[i] = sample(i / sampleRate); max = Math.max(max, Math.abs(values[i])); }
  const dataBytes = count * 2;
  const buffer = Buffer.alloc(44 + dataBytes);
  buffer.write('RIFF', 0); buffer.writeUInt32LE(36 + dataBytes, 4); buffer.write('WAVE', 8);
  buffer.write('fmt ', 12); buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24); buffer.writeUInt32LE(sampleRate * 2, 28); buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36); buffer.writeUInt32LE(dataBytes, 40);
  const scale = peak / max;
  for (let i = 0; i < count; i += 1) buffer.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(values[i] * scale * 32767))), 44 + i * 2);
  fs.writeFileSync(path.join(soundsDir, file), buffer);
}

{
  const noise = makeNoise(rng(101));
  writeWav('correct.wav', .34, t => noise(t, .11, 55) + tone(t, 659.25, { amp:.75, harmonics:[1,.42,.16,.06], decay:10 }) + delayedTone(t, .075, 987.77, { amp:.60, harmonics:[1,.28,.10], decay:11 }), .72);
}
{
  const noise = makeNoise(rng(202));
  writeWav('incorrect.wav', .28, t => noise(t, .22, 45) + tone(t, 196 * (1 - .22 * Math.min(1, t / .18)), { amp:.75, harmonics:[1,.34,.12], decay:11, attack:.002 }), .64);
}
{
  const noise = makeNoise(rng(303));
  writeWav('finish.wav', .76, t => noise(t, .06, 80) + delayedTone(t, 0, 523.25, { amp:.52, harmonics:[1,.34,.15,.07], decay:5.8 }) + delayedTone(t, .115, 659.25, { amp:.52, harmonics:[1,.34,.15,.07], decay:5.8 }) + delayedTone(t, .235, 783.99, { amp:.60, harmonics:[1,.31,.13,.05], decay:5.2 }) + delayedTone(t, .37, 1046.5, { amp:.28, harmonics:[1,.18,.06], decay:6.5 }), .68);
}
{
  const noise = makeNoise(rng(404));
  writeWav('blitz-correct.wav', .18, t => noise(t, .28, 95) + delayedTone(t, .005, 740, { amp:.70, harmonics:[1,.20,.05], decay:18 }) + delayedTone(t, .035, 1046.5, { amp:.48, harmonics:[1,.15], decay:20 }), .70);
}
{
  const noise = makeNoise(rng(505));
  writeWav('blitz-wrong.wav', .19, t => noise(t, .25, 70) + tone(t, 164.8 * (1 - .18 * Math.min(1, t / .14)), { amp:.72, harmonics:[1,.25,.08], decay:17, attack:.001 }), .62);
}
{
  const noise = makeNoise(rng(606));
  writeWav('blitz-timeout.wav', .42, t => noise(t, .10, 65) + delayedTone(t, 0, 440, { amp:.55, harmonics:[1,.20,.05], decay:10 }) + delayedTone(t, .14, 329.63, { amp:.55, harmonics:[1,.20,.05], decay:10 }), .62);
}

function replaceExactly(file, before, after) {
  const full = path.join(root, file);
  const source = fs.readFileSync(full, 'utf8');
  const matches = source.split(before).length - 1;
  if (matches !== 1) throw new Error(`${file}: expected exactly one patch target, found ${matches}`);
  fs.writeFileSync(full, source.replace(before, after));
}

replaceExactly(
  'src/vocabulary/app.js',
  "const result = markVocabularyAttemptLocally(current, rawAnswer); if (result.correct) playCue('correct'); const shouldUpdate = updatesTargetMastery(current);",
  "const result = markVocabularyAttemptLocally(current, rawAnswer); playCue(result.correct ? 'correct' : 'incorrect'); const shouldUpdate = updatesTargetMastery(current);"
);

replaceExactly(
  'src/vocabulary/games/games-controller.js',
  "playCue('blitz-finish', { personalBest:isBest });",
  "playCue('blitz-timeout');"
);
replaceExactly(
  'src/vocabulary/games/games-controller.js',
  "if (!cx) return; const r = cx.guess(text); if (!r) return;\n    if (r.correct) showCx(true);",
  "if (!cx) return; const r = cx.guess(text); if (!r) return;\n    playCue(r.correct ? 'correct' : 'incorrect');\n    if (r.correct) showCx(true);"
);
replaceExactly(
  'src/vocabulary/games/games-controller.js',
  "else if (act === 'cx-choice') { const r = cx.pick(target.dataset.term); if (r) { showCx(true, r.correct ? null : '[data-cx-choices] .gm-choice:not([disabled])'); } }",
  "else if (act === 'cx-choice') { const r = cx.pick(target.dataset.term); if (r) { playCue(r.correct ? 'correct' : 'incorrect'); showCx(true, r.correct ? null : '[data-cx-choices] .gm-choice:not([disabled])'); } }"
);

console.log('Applied Vocabulary sound asset + wiring patch.');

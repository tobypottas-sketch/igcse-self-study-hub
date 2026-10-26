import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { cueRecipe } from '../src/vocabulary/sound.js';

const duration = recipe => Math.max(0, ...recipe.map(note => note.offset + note.duration));
const peak = recipe => Math.max(0, ...recipe.map(note => note.gain));
const frequencies = recipe => recipe.flatMap(note => [note.frequency, note.endFrequency ?? note.frequency]);

function assertSafe(recipe, maxDuration) {
  assert.ok(recipe.length > 0, 'cue has at least one voice');
  assert.ok(duration(recipe) <= maxDuration, `cue ends within ${maxDuration}s`);
  assert.ok(peak(recipe) <= 0.08, 'cue stays at a restrained gain');
  for (const hz of frequencies(recipe)) assert.ok(hz >= 90 && hz <= 1400, `frequency ${hz}Hz stays in a comfortable range`);
  for (const note of recipe) {
    assert.ok(['sine', 'triangle'].includes(note.wave), `wave ${note.wave} stays soft rather than buzzy`);
    assert.ok(note.duration > 0 && note.offset >= 0 && note.gain > 0, 'timings and gain are valid');
  }
}

test('normal feedback is playful but restrained: pop-chime correct, soft downward miss, richer finish', () => {
  const correct = cueRecipe('correct');
  const incorrect = cueRecipe('incorrect');
  const finish = cueRecipe('finish');
  assertSafe(correct, 0.22); assertSafe(incorrect, 0.18); assertSafe(finish, 0.72);
  assert.ok(correct.length >= 2, 'correct cue is layered rather than the old two plain beeps');
  assert.ok(correct.at(-1).frequency > correct[0].frequency, 'correct cue lifts upward');
  assert.ok((incorrect[0].endFrequency ?? incorrect[0].frequency) < incorrect[0].frequency, 'incorrect cue falls gently');
  const finishStarts = finish.map(note => note.frequency);
  assert.ok(finishStarts.length >= 3 && finishStarts.every((hz, i) => i === 0 || hz > finishStarts[i - 1]), 'finish is a rising success sting');
});

test('Word Blitz feedback is faster, distinct, and streak variation is bounded', () => {
  const base = cueRecipe('blitz-correct', { streak:1, multiplier:1 });
  const hot = cueRecipe('blitz-correct', { streak:20, multiplier:4 });
  const wrong = cueRecipe('blitz-wrong');
  assertSafe(base, 0.16); assertSafe(hot, 0.18); assertSafe(wrong, 0.14);
  assert.notDeepEqual(base, cueRecipe('correct'), 'Blitz does not reuse the normal activity sound');
  assert.ok(hot.length >= base.length, 'a strong streak can add a small accent');
  assert.ok(Math.max(...frequencies(hot)) <= 1200, 'streaks never become shrill');
  assert.ok((wrong[0].endFrequency ?? wrong[0].frequency) < wrong[0].frequency, 'wrong answer gives a quick downward thud');
});

test('Word Blitz finish uses one family and a personal best adds only a celebratory sparkle', () => {
  const finish = cueRecipe('blitz-finish');
  const best = cueRecipe('blitz-finish', { personalBest:true });
  assertSafe(finish, 0.8); assertSafe(best, 0.8);
  assert.equal(best.length, finish.length + 1, 'personal best adds one extra voice');
  assert.deepEqual(best.slice(0, finish.length), finish, 'base victory sting stays recognisable');
});

test('unknown cues are silent and every recipe is returned as a fresh copy', () => {
  assert.deepEqual(cueRecipe('does-not-exist'), []);
  const first = cueRecipe('correct'); first[0].frequency = 999;
  assert.notEqual(cueRecipe('correct')[0].frequency, 999, 'callers cannot mutate the canonical recipe');
});

test('Word Blitz controller uses the shared sound owner for answer and finish events only', () => {
  const source = fs.readFileSync(new URL('../src/vocabulary/games/games-controller.js', import.meta.url), 'utf8');
  assert.match(source, /import \{ playCue \} from '\.\.\/sound\.js';/);
  assert.match(source, /playCue\(result\.correct \? 'blitz-correct' : 'blitz-wrong'/);
  assert.match(source, /playCue\('blitz-finish', \{ personalBest:isBest \}\)/);
  assert.doesNotMatch(source, /setTime[\s\S]{0,500}playCue/, 'timer ticks do not add stressful audio');
});

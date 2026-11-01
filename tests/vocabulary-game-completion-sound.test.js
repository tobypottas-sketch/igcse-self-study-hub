import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('..', import.meta.url));
const controller = fs.readFileSync(path.join(repo, 'src/vocabulary/games/games-controller.js'), 'utf8');

test('Word Blitz ends with the timeout cue (time up) then the completion sting, or the sting alone when questions run out', () => {
  assert.match(controller, /const endBlitz = \(\) => \{[\s\S]*?onCue\('blitz-timeout'\)[\s\S]*?onCue\('blitz-finish'\)[\s\S]*?renderBlitzOver/);
});

test('Connections plays the round-finished cue only when advancing finishes the round', () => {
  assert.match(controller, /act === 'cx-next'[\s\S]*?cx\.next\(\);[\s\S]*?cx\.state\.status === 'over'[\s\S]*?onCue\('connections-finish'\)[\s\S]*?showCx\(\)/);
  assert.equal((controller.match(/onCue\('connections-finish'\)/g) ?? []).length, 1);
  assert.doesNotMatch(controller, /onCue\('finish'\)/, 'the study-session cues are not used inside the games');
});

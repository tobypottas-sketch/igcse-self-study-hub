import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('..', import.meta.url));
const controller = fs.readFileSync(path.join(repo, 'src/vocabulary/games/games-controller.js'), 'utf8');

test('Word Blitz ends with the shared accomplishment cue', () => {
  assert.match(controller, /const endBlitz = \(\) => \{[\s\S]*?onCue\('finish'\);[\s\S]*?renderBlitzOver/);
  assert.doesNotMatch(controller, /onCue\('blitz-timeout'\)/, 'the neutral timeout cue is not the end-of-run reward');
});

test('Connections plays the accomplishment cue only when advancing finishes the round', () => {
  assert.match(controller, /act === 'cx-next'[\s\S]*?cx\.next\(\);[\s\S]*?cx\.state\.status === 'over'[\s\S]*?onCue\('finish'\)[\s\S]*?showCx\(\)/);
  assert.equal((controller.match(/onCue\('finish'\)/g) ?? []).length, 2, 'only Blitz completion and Connections round completion use the finish cue in Games');
});

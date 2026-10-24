import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/vocabulary/pathway-question-progress.js', import.meta.url),'utf8');

test('question header progress is synchronised from the live session activity counter', () => {
  assert.match(source,/function syncSessionProgress\(root\)/);
  assert.match(source,/\.vocab-question-session-progress/);
  assert.match(source,/--study-progress/);
  assert.match(source,/aria-valuenow/);
});

test('timed practice does not show a misleading fixed 1 of 10 progress bar', () => {
  assert.match(source,/remaining/i);
  assert.match(source,/progress\.hidden\s*=\s*true/);
});

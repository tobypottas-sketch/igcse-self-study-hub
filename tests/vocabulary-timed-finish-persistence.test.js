import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');

test('timed expiry waits for authoritative persistence before rendering a completed session', () => {
  assert.match(app, /async function finishSessionWhenSaved\(\)/);
  const helper = app.match(/async function finishSessionWhenSaved\(\) \{([\s\S]*?)\n\}/);
  assert.ok(helper, 'guarded finish helper should exist');
  assert.match(helper[1], /await attempts\(\)\.settled\(\)/);
  assert.match(helper[1], /if \(attempts\(\)\.blocked && !await attempts\(\)\.retry\(\)\) \{[^}]*return;/);
  assert.match(helper[1], /finishSession\(\)/);
});

test('the timer never calls finishSession directly on expiry', () => {
  const clock = app.match(/function startClock\(\) \{([\s\S]*?)\n\}/);
  assert.ok(clock, 'startClock should exist');
  assert.doesNotMatch(clock[1], /\bfinishSession\(\)/);
  assert.match(clock[1], /finishSessionWhenSaved\(\)/);
});

test('answer submission after timed expiry uses the guarded finish path', () => {
  const answer = app.match(/function handleAnswer\(form, providedAnswer = null\) \{([\s\S]*?)\n\}/);
  assert.ok(answer, 'handleAnswer should exist');
  assert.doesNotMatch(answer[1], /isSessionComplete\(state\.session, new Date\(\)\)\) \{ finishSession\(\)/);
  assert.match(answer[1], /isSessionComplete\(state\.session, new Date\(\)\)\) \{ void finishSessionWhenSaved\(\); return; \}/);
});

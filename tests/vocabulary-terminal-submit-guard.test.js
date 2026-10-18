import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');

test('a completed vocabulary answer cannot be submitted again before Next', () => {
  assert.match(app, /if \(current\.answered\) return;/);
  assert.match(app, /current\.answered = true/);
});

test('the first incorrect attempt stays eligible for its supported retry', () => {
  const firstMiss = app.match(/if \(!result\.correct && !current\.retry\) \{([\s\S]*?)return; \}/);
  assert.ok(firstMiss, 'first-miss retry branch should exist');
  assert.doesNotMatch(firstMiss[1], /answered\s*=\s*true/);
});

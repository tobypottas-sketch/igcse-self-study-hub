import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');

// Behavioural coverage of the queue lives in vocabulary-attempt-persistence-recovery.test.js; these
// structural checks keep the live wiring honest.
test('a failed vocabulary save blocks later queued attempts from being submitted, but is recoverable', () => {
  assert.match(app, /createAttemptPersistence\(/);
  assert.match(app, /attempts\(\)\.enqueue\(/);
  assert.match(app, /onBlocked:showSyncWarning/);
});

test('Next does not wait for persistence; only a blocked backlog makes it retry first', () => {
  const helper = app.match(/async function advanceToNextQuestion\(\) \{([\s\S]*?)\n\}/);
  assert.ok(helper, 'next-question helper should exist');
  assert.doesNotMatch(helper[1], /settled\(\)/, 'no wait on the save queue per question');
  assert.match(helper[1], /attempts\(\)\.blocked && attempts\(\)\.pending >= MAX_UNSAVED_WHILE_BLOCKED && !await attempts\(\)\.retry\(\)\) return/);
  assert.ok(helper[1].indexOf('retry()') < helper[1].indexOf('nextQuestion()'));
  assert.match(app, /action === 'next-question'\) advanceToNextQuestion\(\)\.catch/);
});

test('authoritative unit reload retries but never discards an unsaved attempt', () => {
  const openUnit = app.match(/async function openUnit\(unitNumber\) \{([\s\S]*?)\n\}/);
  assert.ok(openUnit, 'openUnit should exist');
  assert.match(openUnit[1], /attempts\(\)\.retry\(\)/);
  assert.doesNotMatch(openUnit[1], /attempts\(\)\.reset\(/);
});

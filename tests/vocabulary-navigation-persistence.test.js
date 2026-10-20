import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');

test('leaving a vocabulary session renders cached unit state independently of queued persistence without refetching', () => {
  assert.match(app, /async function returnToCurrentUnit\(\)/);
  const helper = app.match(/async function returnToCurrentUnit\(\) \{([\s\S]*?)\n\}/);
  assert.ok(helper, 'return-to-unit helper should exist');
  assert.doesNotMatch(helper[1], /await attempts\(\)\.settled\(\)/);
  assert.match(helper[1], /renderCurrentUnit\(\)/);
  assert.doesNotMatch(helper[1], /if \(attempts\(\)\.blocked\) return/);
  assert.equal(helper[1].includes('openUnit('), false, 'returning to an already-open unit must not refetch the whole unit');
  assert.match(app, /action === 'leave-session' \|\| action === 'back-unit'\) returnToCurrentUnit\(\)\.catch/);
});

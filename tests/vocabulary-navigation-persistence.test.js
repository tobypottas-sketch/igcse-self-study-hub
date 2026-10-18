import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');

test('leaving a vocabulary session waits for queued persistence before reloading unit mastery', () => {
  assert.match(app, /async function returnToCurrentUnit\(\)/);
  const helper = app.match(/async function returnToCurrentUnit\(\) \{([\s\S]*?)\n\}/);
  assert.ok(helper, 'return-to-unit helper should exist');
  const waitIndex = helper[1].indexOf('await state.persistenceChain');
  const openIndex = helper[1].indexOf('await openUnit(state.currentUnitNumber)');
  assert.ok(waitIndex >= 0, 'navigation should await pending attempt persistence');
  assert.ok(openIndex > waitIndex, 'unit mastery should reload only after persistence settles');
  assert.match(app, /action === 'leave-session' \|\| action === 'back-unit'\) returnToCurrentUnit\(\)\.catch/);
});

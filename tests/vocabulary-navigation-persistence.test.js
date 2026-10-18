import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');

test('leaving a vocabulary session waits for queued persistence then renders cached unit state without refetching', () => {
  assert.match(app, /async function returnToCurrentUnit\(\)/);
  const helper = app.match(/async function returnToCurrentUnit\(\) \{([\s\S]*?)\n\}/);
  assert.ok(helper, 'return-to-unit helper should exist');
  const waitIndex = helper[1].indexOf('await state.persistenceChain');
  const renderIndex = helper[1].indexOf('renderCurrentUnit()');
  assert.ok(waitIndex >= 0, 'navigation should await pending attempt persistence');
  assert.ok(renderIndex > waitIndex, 'cached unit should render only after persistence settles');
  assert.equal(helper[1].includes('openUnit('), false, 'returning to an already-open unit must not refetch the whole unit');
  assert.match(app, /action === 'leave-session' \|\| action === 'back-unit'\) returnToCurrentUnit\(\)\.catch/);
});

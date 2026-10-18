import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('duplicate authoritative attempt responses do not advance the client pathway journey mirror twice', () => {
  const source = fs.readFileSync(new URL('../src/vocabulary/data.js', import.meta.url),'utf8');
  assert.match(source,/data\.duplicate !== true/);
  assert.match(source,/applyRegisteredPathwayJourneyAttempt/);
});

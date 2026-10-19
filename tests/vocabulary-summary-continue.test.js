import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');
const views = fs.readFileSync(new URL('../src/vocabulary/views.js', import.meta.url), 'utf8');

test('session summary Continue practising action is wired to a controller handler', () => {
  assert.match(views, /data-action="continue-practice"/);
  assert.match(app, /action === 'continue-practice'/);
});

test('Continue practising resumes the same practice context', () => {
  assert.match(app, /function continuePractice\(\)/);
  assert.match(app, /state\.pathwayId[\s\S]*startPathwaySession\(state\.pathwayId\)/);
  assert.match(app, /state\.mixedReview[\s\S]*startMixedReview\(\)/);
});

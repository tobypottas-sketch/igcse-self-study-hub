import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../src/vocabulary/teacher-app.js', import.meta.url), 'utf8');
const view = readFileSync(new URL('../src/vocabulary/teacher-views.js', import.meta.url), 'utf8');
const readiness = readFileSync(new URL('../src/vocabulary/pathway-readiness.js', import.meta.url), 'utf8');

test('the class chooser and overview no longer expose content-authoring readiness', () => {
  assert.doesNotMatch(app, /teacher-open-readiness|teacher-readiness-unit|Unit readiness|openReadiness\(/);
  assert.doesNotMatch(view, /teacher-open-readiness|Unit readiness/);
  assert.match(app, /teacher-open-class/);
  assert.match(app, /vocab-class-chooser__grid/);
  assert.match(view, /Recommend Hub Practice/);
  assert.match(view, /Create Teams Target List/);
  assert.match(view, /Preview student activities/);
});
test('the removal leaves pathway gating and coverage available to the student/teacher engines', () => {
  assert.match(app, /evaluateUnitReadiness\(\{ content \}\)/);
  assert.match(app, /registerPathwayCoverage\(key, coverageFromReadiness\(readiness.pathways\)\)/);
  assert.match(app, /await ensureReadiness\(unit.unitNumber\)/);
  assert.match(readiness, /computePathwaySets\(servedIds/);
  assert.match(readiness, /stageMinimum\(pathway.id, stage.id, expected\)/);
});

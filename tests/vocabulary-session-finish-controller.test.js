import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url),'utf8');
const finishSection = app.slice(app.indexOf('function finishSession()'),app.indexOf('function startActiveTime()'));

test('pathway finish is classified from authoritative post-save pathway state', () => {
  assert.match(app,/buildSessionFinishModel/);
  // Job 6: the finish screen is classified from the server-held Set progression (projected at once, then reconciled with the settled rows).
  assert.match(finishSection,/setFinishContext\(finished\)/);
  assert.match(app,/function serverSetProjection/);
  assert.match(app,/refreshSetRows\(\)/);
  assert.doesNotMatch(finishSection,/buildUnitPathwayStates|postPathwayState/);
  assert.match(finishSection,/startStage:state\.pathwayStage/);
  assert.match(finishSection,/preview:state\.preview/);
  assert.doesNotMatch(finishSection,/strengthened\s*[>=<]+\s*\d+[\s\S]*stage-complete/);
});

test('finish waits for persistence before it can render authoritative progression', () => {
  const waiting = finishSection.slice(finishSection.indexOf('async function finishSessionWhenSaved'));
  assert.ok(waiting.indexOf('await attempts().settled()') >= 0);
  assert.ok(waiting.indexOf('await attempts().settled()') < waiting.indexOf('finishSession();'));
  assert.match(waiting,/if \(attempts\(\)\.blocked/);
});

test('finish renderer receives pathway context and focus moves to the completion heading', () => {
  assert.match(finishSection,/pathwayId:state\.pathwayId/);
  assert.match(finishSection,/renderSessionSummary\(root, summaryArgs\)|renderSessionSummary\(root, \{/);
  assert.match(finishSection,/\[data-session-finish-heading\]/);
  assert.match(finishSection,/\.focus\?\.\(\)/);
});

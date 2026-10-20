import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url),'utf8');
const finishSection = app.slice(app.indexOf('function finishSession()'),app.indexOf('function startActiveTime()'));

test('pathway finish is classified from authoritative post-save pathway state', () => {
  assert.match(app,/buildSessionFinishModel/);
  assert.match(finishSection,/buildUnitPathwayStates\(\{ occurrences:state\.content\.occurrences, unitMastery:state\.unitMastery, globalMastery:state\.globalMastery \}\)/);
  assert.match(finishSection,/startStage:state\.pathwayStage/);
  assert.match(finishSection,/postPathwayState/);
  assert.match(finishSection,/preview:state\.preview/);
  assert.doesNotMatch(finishSection,/strengthened\s*[>=<]+\s*\d+[\s\S]*stage-complete/);
});

test('finish waits for persistence before it can render authoritative progression', () => {
  const waiting = finishSection.slice(finishSection.indexOf('async function finishSessionWhenSaved'));
  assert.ok(waiting.indexOf('await state.persistenceChain') >= 0);
  assert.ok(waiting.indexOf('await state.persistenceChain') < waiting.indexOf('finishSession();'));
  assert.match(waiting,/if \(state\.persistenceBlocked\)/);
});

test('finish renderer receives pathway context and focus moves to the completion heading', () => {
  assert.match(finishSection,/renderSessionSummary\(root, \{[^}]*pathwayId:state\.pathwayId, finishModel/s);
  assert.match(finishSection,/\[data-session-finish-heading\]/);
  assert.match(finishSection,/\.focus\?\.\(\)/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url),'utf8');

test('finish model is built only after the existing persistence chain resolves', () => {
  assert.match(app,/import\s*\{\s*buildSessionFinishModel\s*\}\s*from\s*['"]\.\/session-finish-model\.js['"]/);
  const finishWhenSaved = app.match(/async function finishSessionWhenSaved\(\) \{[\s\S]*?\n\}/)?.[0] ?? '';
  assert.match(finishWhenSaved,/await state\.persistenceChain/);
  assert.match(finishWhenSaved,/if \(state\.persistenceBlocked\)/);
  const awaitIndex = finishWhenSaved.indexOf('await state.persistenceChain');
  const finishIndex = finishWhenSaved.indexOf('finishSession(');
  assert.ok(awaitIndex >= 0 && finishIndex > awaitIndex,'finish must occur after persistence resolves');
});

test('pathway finish reads the latest pathway view model and passes a finish model to the renderer', () => {
  const finishSession = app.match(/function finishSession\(\) \{[\s\S]*?\n\}/)?.[0] ?? '';
  assert.match(finishSession,/buildUnitPathwayStates\(/);
  assert.match(finishSession,/buildSessionFinishModel\(/);
  assert.match(finishSession,/startStage:state\.pathwayStage/);
  assert.match(finishSession,/postPathwayState/);
  assert.match(finishSession,/renderSessionSummary\([^;]*finishModel/s);
});

test('non-pathway summaries keep a null finish model and pathway completion is never inferred from score', () => {
  const finishSession = app.match(/function finishSession\(\) \{[\s\S]*?\n\}/)?.[0] ?? '';
  assert.match(finishSession,/state\.pathwayId\s*\?/);
  assert.match(finishSession,/finishModel\s*=\s*state\.pathwayId/);
  assert.doesNotMatch(finishSession,/summary\.strengthened\s*[>=]+\s*\d+[\s\S]{0,80}(stage|master)/i);
});

test('result heading receives focus after the summary is rendered', () => {
  const finishSession = app.match(/function finishSession\(\) \{[\s\S]*?\n\}/)?.[0] ?? '';
  assert.match(finishSession,/\[data-session-finish-heading\]/);
  assert.match(finishSession,/\.focus\(\)/);
});

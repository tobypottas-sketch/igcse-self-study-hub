import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url),'utf8');

test('controller imports reward and authoritative completion helpers', () => {
  assert.match(source,/import \{ buildSessionRewardSummary \} from '\.\/session-reward\.js'/);
  assert.match(source,/import \{ deriveSessionCompletion \} from '\.\/session-completion\.js'/);
});

test('pathway session snapshots its authoritative starting state', () => {
  assert.match(source,/pathwayStartState\s*:\s*null/);
  assert.match(source,/state\.pathwayStartState\s*=\s*pathwayStates\?\.\[pathwayId\]\s*\?\?\s*null/);
});

test('completed attempt records first-attempt and corrected-retry outcome only in local session evidence', () => {
  assert.match(source,/firstAttemptCorrect\s*:\s*result\.correct\s*===\s*true/);
  assert.match(source,/correctedAfterRetry\s*:\s*result\.correct\s*===\s*true/);
  assert.doesNotMatch(source,/payload\s*=\s*\{[^}]*firstAttemptCorrect/s);
  assert.doesNotMatch(source,/payload\s*=\s*\{[^}]*correctedAfterRetry/s);
});

test('finish derives reward from the finished local session and completion from post-save pathway state', () => {
  assert.match(source,/buildSessionRewardSummary\(\{[\s\S]*completedAttempts\s*:\s*finished\.completedAttempts/);
  assert.match(source,/buildUnitPathwayStates\(\{[\s\S]*unitMastery\s*:\s*state\.unitMastery/);
  assert.match(source,/deriveSessionCompletion\(\{[\s\S]*beforePathwayState\s*:\s*state\.pathwayStartState[\s\S]*afterPathwayState/);
  assert.match(source,/renderSessionSummary\(root,\s*\{[\s\S]*pathwayId\s*:\s*state\.pathwayId[\s\S]*reward[\s\S]*completion/);
});

test('save gate still blocks completion until persistence has settled', () => {
  const match = source.match(/async function finishSessionWhenSaved\(\) \{([\s\S]*?)\n\}/);
  assert.ok(match,'finishSessionWhenSaved should exist');
  const body = match[1];
  assert.match(body,/await state\.persistenceChain/);
  assert.match(body,/if \(state\.persistenceBlocked\)/);
  assert.ok(body.indexOf('await state.persistenceChain') < body.indexOf('finishSession()'));
  assert.ok(body.indexOf('if (state.persistenceBlocked)') < body.indexOf('finishSession()'));
});

test('leaving or starting a non-pathway route clears the pathway-start snapshot', () => {
  assert.match(source,/function startMixedReview\([^)]*\)[\s\S]*state\.pathwayStartState\s*=\s*null/);
  assert.match(source,/function startSession\([^)]*\)[\s\S]*state\.pathwayStartState\s*=\s*null/);
  assert.match(source,/function returnToCurrentUnit\([^)]*\)[\s\S]*state\.pathwayStartState\s*=\s*null/);
});

test('no XP streak or permanent star persistence is introduced', () => {
  const persisted = source.match(/function persistVocabularyAttempt\([\s\S]*?\n\}/)?.[0] ?? '';
  assert.doesNotMatch(persisted,/\b(stars?|xp|streak)\b/i);
});

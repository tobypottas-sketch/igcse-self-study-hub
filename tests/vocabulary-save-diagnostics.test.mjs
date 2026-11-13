import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app=readFileSync(new URL('../src/vocabulary/app.js',import.meta.url),'utf8');
const edge=readFileSync(new URL('../supabase/functions/vocabulary-attempt-action/index.ts',import.meta.url),'utf8');

test('blocked persistence halts answer acceptance and Next until the same queued attempt is saved',()=>{
  const handle=app.match(/function handleAnswer\(form, providedAnswer = null\) \{([\s\S]*?)\n\}/)?.[1]??'';
  const next=app.match(/async function advanceToNextQuestion\(\) \{([\s\S]*?)\n\}/)?.[1]??'';
  assert.match(handle,/if \(attempts\(\)\.blocked\) \{ renderSyncWarning\(\); return; \}/);
  assert.match(next,/if \(attempts\(\)\.blocked && !await attempts\(\)\.retry\(\)\)/);
  assert.doesNotMatch(next,/reset\(|force:/);
});
test('warning displays the server rejection without unsafely injecting message HTML',()=>{
  assert.match(app,/state\.saveError = error instanceof Error \? error\.message/);
  assert.match(app,/detail\.textContent = `Save error:/);
  assert.match(app,/Stop answering new questions; keep this tab open/);
  assert.match(app,/function clearSyncWarning\(\) \{ state\.saveError = null/);
});
test('edge worker logs errors by account but not answer contents',()=>{
  assert.match(edge,/authenticatedUserId = callerData\.user\.id/);
  assert.match(edge,/vocabulary-attempt-action commit rejected/);
  assert.match(edge,/vocabulary-attempt-action rejected/);
  assert.match(edge,/reason:commitError\?\.message/);
  assert.doesNotMatch(edge,/console\.error\([^\n]*rawAnswer/);
});

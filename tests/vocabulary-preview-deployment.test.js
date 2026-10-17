import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const appSource = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');

test('browser vocabulary app never imports Supabase Edge Function shared modules', () => {
  assert.doesNotMatch(appSource, /supabase\/functions\/_shared/);
});

test('browser preview mastery engine exists at a Pages-safe public path', () => {
  const url = new URL('../src/vocabulary/preview-engine.js', import.meta.url);
  assert.equal(fs.existsSync(url), true);
});

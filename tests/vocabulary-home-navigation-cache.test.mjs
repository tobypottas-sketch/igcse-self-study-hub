import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../vocabulary.html', import.meta.url), 'utf8');
const source = await readFile(new URL('../src/vocabulary/home-navigation-cache.js', import.meta.url), 'utf8');

test('cache-first Home adapter loads before the Vocabulary router', () => {
  const cache = html.indexOf('src/vocabulary/home-navigation-cache.js');
  const router = html.indexOf('src/vocabulary/router.js');
  assert.ok(cache >= 0, 'cache-first navigation adapter must be loaded');
  assert.ok(router >= 0, 'Vocabulary router must still be loaded');
  assert.ok(cache < router, 'adapter must install its capture listener before the app router');
});

test('All units paints cached Home immediately without replacing the app refresh', () => {
  assert.match(source, /root\.innerHTML = cachedHome;/);
  assert.match(source, /Do not stop propagation/);
  assert.doesNotMatch(source, /fetch\s*\(/);
  assert.doesNotMatch(source, /supabase|loadVocabularyDashboard|loadVocabularyMissions/i);
});

test('unit re-entry is queued while the authoritative Home refresh is pending', () => {
  assert.match(source, /if \(!refreshPending\) return;/);
  assert.match(source, /event\.stopImmediatePropagation\(\)/);
  assert.match(source, /queuedUnit = Number\(unitCard\.dataset\.unit\)/);
  assert.match(source, /queueMicrotask\(\(\) => root\.querySelector/);
});

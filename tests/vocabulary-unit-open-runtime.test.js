import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const dataSource = await readFile(new URL('../src/vocabulary/data.js', import.meta.url), 'utf8');

test('student unit loading uses published server Set membership instead of client readiness evaluation', () => {
  assert.match(dataSource, /client\.from\('vocabulary_set_members'\)/);
  assert.match(dataSource, /coverageFromServerSetMembers/);
  assert.doesNotMatch(dataSource, /buildPathwayCoverage/);
});

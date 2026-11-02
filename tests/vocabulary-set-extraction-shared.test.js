// The Set availability/completion chain lives in supabase/functions/_shared so the Edge runtime can run the exact code the student
// app runs. The student modules only re-export it.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as shared from '../supabase/functions/_shared/vocabulary-pathway-sets.js';
import * as sets from '../src/vocabulary/pathway-sets.js';
import * as progress from '../src/vocabulary/set-progress.js';
import * as data from '../src/vocabulary/data.js';

const read = rel => fs.readFileSync(new URL(rel, import.meta.url), 'utf8');

test('student modules re-export the shared implementation (same function objects)', () => {
  for (const name of ['SET_SIZE', 'MAX_SETS', 'SET_READINESS', 'setIdFor', 'computePathwaySets', 'setsFromCoverage']) assert.strictEqual(sets[name], shared[name], name);
  for (const name of ['normalizeSetRow', 'groupSetRows', 'activeSetStep']) assert.strictEqual(progress[name], shared[name], name);
  assert.strictEqual(data.coverageFromServerSetMembers, shared.coverageFromServerSetMembers);
});

test('shared module exports exactly the planned surface', () => {
  assert.deepEqual(Object.keys(shared).sort(), [
    'MAX_SETS', 'SET_READINESS', 'SET_SIZE', 'activeSetStep', 'computePathwaySets', 'coverageFromServerSetMembers',
    'groupSetRows', 'normalizeSetRow', 'setIdFor', 'setsFromCoverage'
  ]);
});

test('shared module imports only the shared pathway contract (loads in Deno without src/)', () => {
  const imports = [...read('../supabase/functions/_shared/vocabulary-pathway-sets.js').matchAll(/^\s*import[^;]*from\s+'([^']+)'/gm)].map(m => m[1]);
  assert.deepEqual(imports, ['./vocabulary-pathway-contract.js']);
});

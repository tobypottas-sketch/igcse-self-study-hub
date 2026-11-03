import test from 'node:test';
import assert from 'node:assert/strict';
import { practiceListMeta } from '../src/vocabulary/weekly-practice-clarity.js';

test('inactive practice list uses neutral wording instead of gone quiet', () => {
  assert.deepEqual(practiceListMeta(24, 8), {
    heading: 'Not active recently (24)',
    note: 'Showing 8 of 24 students.'
  });
});

test('inactive practice list omits the truncation note when every student is visible', () => {
  assert.deepEqual(practiceListMeta(6, 6), {
    heading: 'Not active recently (6)',
    note: ''
  });
});

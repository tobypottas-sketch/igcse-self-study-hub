import test from 'node:test';
import assert from 'node:assert/strict';
import { validateUnit } from '../content/vocabulary/schema.js';

test('approved units must already satisfy live-unit completeness rules', () => {
  const result = validateUnit({
    unitNumber:1,
    unitTitle:'Sports and Free Time',
    status:'approved',
    items:[{ vocabularyId:'vocab_leisure', term:'leisure', status:'approved' }],
    occurrences:[{ occurrenceId:'u1_01_leisure', vocabularyId:'vocab_leisure', unitNumber:1, unitTitle:'Sports and Free Time', setNumber:1, positionInUnit:1, senseId:'leisure_1', contextIds:[], status:'approved' }],
    contexts:[]
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(error => /50|fifty|exactly/i.test(error)));
  assert.ok(result.errors.some(error => /meaning|part of speech|sense/i.test(error)));
});

test('draft units may remain incomplete while authoring', () => {
  const result = validateUnit({
    unitNumber:1,
    unitTitle:'Sports and Free Time',
    status:'draft',
    items:[{ vocabularyId:'vocab_leisure', term:'leisure', status:'draft' }],
    occurrences:[{ occurrenceId:'u1_01_leisure', vocabularyId:'vocab_leisure', unitNumber:1, unitTitle:'Sports and Free Time', setNumber:1, positionInUnit:1, senseId:'leisure_1', contextIds:[], status:'draft' }],
    contexts:[]
  });
  assert.equal(result.ok, true);
});

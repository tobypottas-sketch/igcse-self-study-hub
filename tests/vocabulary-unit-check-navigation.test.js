import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderVocabularyUnit } from '../src/vocabulary/views.js';

const controller = readFileSync(new URL('../src/vocabulary/unit-check-controller.js', import.meta.url), 'utf8');

test('unit overview exposes its number to the Unit Check controller for Units 8 and 9', () => {
  for (const unitNumber of [8, 9]) {
    const root = { innerHTML: '' };
    renderVocabularyUnit(root, { unitNumber, unitTitle: unitNumber === 8 ? 'Work' : 'Communication' });
    assert.match(root.innerHTML, new RegExp('data-unit-number="' + unitNumber + '"'));
    assert.match(root.innerHTML, new RegExp('data-unit-overview="(?:work|communication)"'));
  }
});

test('Unit Check controller reads the explicit unit number before its legacy badge fallback', () => {
  assert.match(controller, /querySelector\?\.\('\[data-unit-number\]'\)/);
  assert.match(controller, /const declared = Number\(shell\?\.getAttribute\?\.\('data-unit-number'\)/);
  assert.match(controller, /\.vocab-unit-id__badge/);
});

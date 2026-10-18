import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');

test('a failed vocabulary save blocks later queued attempts from being submitted', () => {
  assert.match(app, /persistenceBlocked\s*:\s*false/);
  assert.match(app, /if \(state\.persistenceBlocked\) return/);
  assert.match(app, /state\.persistenceBlocked\s*=\s*true/);
});

test('Next waits for persistence and does not advance while saving is blocked', () => {
  assert.match(app, /async function advanceToNextQuestion\(\)/);
  const helper = app.match(/async function advanceToNextQuestion\(\) \{([\s\S]*?)\n\}/);
  assert.ok(helper, 'guarded next-question helper should exist');
  assert.match(helper[1], /await state\.persistenceChain/);
  assert.match(helper[1], /if \(state\.persistenceBlocked\) return/);
  assert.match(helper[1], /nextQuestion\(\)/);
  assert.match(app, /action === 'next-question'\) advanceToNextQuestion\(\)\.catch/);
});

test('authoritative unit reload clears a previous persistence block', () => {
  const openUnit = app.match(/async function openUnit\(unitNumber\) \{([\s\S]*?)\n\}/);
  assert.ok(openUnit, 'openUnit should exist');
  assert.match(openUnit[1], /state\.persistenceBlocked\s*=\s*false/);
});

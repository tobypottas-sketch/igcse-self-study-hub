import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const listening = fs.readFileSync(new URL('../src/tracking/listening-wrapper.js', import.meta.url), 'utf8');

test('Listening fresh Exam attempts reset per-question tracked attempt counters', () => {
  const resetStart = listening.indexOf('function resetExamTracking()');
  assert.notEqual(resetStart, -1, 'resetExamTracking should exist');
  const resetEnd = listening.indexOf('\n}', resetStart) + 2;
  const resetBlock = listening.slice(resetStart, resetEnd);
  assert.match(resetBlock, /attempts\.(?:clear|delete)\s*\(/, 'fresh Exam reset should clear prior Listening attempt counters');
});

test('Listening section-use dedupe keeps Practice and Exam visits distinct', () => {
  assert.match(
    listening,
    /sectionGate\(`section:\$\{mode\}:\$\{sectionId\}`\)/,
    'section tracking should dedupe separately for Practice and Exam mode'
  );
});

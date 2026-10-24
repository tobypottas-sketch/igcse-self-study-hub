import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const listening = fs.readFileSync(new URL('../src/tracking/listening-wrapper.js', import.meta.url), 'utf8');
const essay = fs.readFileSync(new URL('../src/tracking/essay-writing-wrapper.js', import.meta.url), 'utf8');

test('Listening fresh Exam reset clears Exam section-use dedupe keys', () => {
  const resetStart = listening.indexOf('function resetExamTracking()');
  assert.notEqual(resetStart, -1, 'resetExamTracking should exist');
  const resetEnd = listening.indexOf('\n}', resetStart) + 2;
  const resetBlock = listening.slice(resetStart, resetEnd);
  assert.match(
    resetBlock,
    /sectionGate\.(?:clearPrefix|resetMode|clearExam|clear)\s*\(/,
    'fresh Exam reset should allow Exam sections to be tracked again'
  );
});

test('Essay stage-use dedupe keeps Practice and Exam visits distinct', () => {
  assert.match(
    essay,
    /visitedStages\.has\(`\$\{currentEssayMode\(win\)\}:\$\{stage\}`\)|const\s+visitKey\s*=\s*`\$\{currentEssayMode\(win\)\}:\$\{stage\}`/,
    'Essay stage tracking should dedupe separately per mode'
  );
});

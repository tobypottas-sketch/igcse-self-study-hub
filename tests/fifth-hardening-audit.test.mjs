import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const listeningWrapper = fs.readFileSync(new URL('../src/tracking/listening-wrapper.js', import.meta.url), 'utf8');

test('Listening same-mode clicks do not clear exam answer dedupe state', () => {
  assert.match(
    listeningWrapper,
    /safeWrapAfter\(win, 'setMode',[\s\S]*shouldResetExamTrackingAfterReset\(state, result\)[\s\S]*resetExamTracking\(\)/
  );
  assert.doesNotMatch(
    listeningWrapper,
    /safeWrapAfter\(win, 'setMode', \(_args, result\) => \{ if \(result !== false\) resetExamTracking\(\); \}\);/
  );
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const reading = fs.readFileSync(new URL('../src/tracking/reading-wrapper.js', import.meta.url), 'utf8');
const essay = fs.readFileSync(new URL('../src/tracking/essay-writing-wrapper.js', import.meta.url), 'utf8');

test('Reading free-text tracking is debounced instead of counting each keystroke as an attempt', () => {
  assert.match(reading, /READING_TEXT_INPUT_DEBOUNCE_MS/, 'expected an explicit Reading text-input debounce');
  assert.match(reading, /queueReadingAnswerTracking/, 'expected queued Reading text tracking');
  assert.match(reading, /short_answers|notes/, 'expected text-like Reading exercise types to be identified');
});

test('Reading new Exam attempts reset their tracked attempt counters', () => {
  assert.match(reading, /attempts\.keys\(\)/, 'resetExamTracking should inspect attempt counters');
  assert.match(reading, /attempts\.delete\(key\)/, 'resetExamTracking should clear prior Exam attempt counters');
});

test('Essay tracking records Practice or Exam mode on all major event paths', () => {
  assert.match(essay, /let trackedWindow\s*=\s*null/, 'expected tracked Essay iframe window');
  assert.match(essay, /function currentEssayMode\s*\(/, 'expected a shared Essay mode helper');
  assert.match(essay, /event_type:\s*'app_open'[\s\S]{0,180}mode:/, 'app_open should include mode');
  assert.match(essay, /event_type:\s*'active_time'[\s\S]{0,180}mode:/, 'active_time should include mode');
  assert.match(essay, /event_type:\s*'section_use'[\s\S]{0,220}mode:/, 'section_use should include mode');
});

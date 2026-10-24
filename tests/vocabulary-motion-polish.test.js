import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../vocabulary-study-art.css', import.meta.url),'utf8');

test('answer feedback does not replay the whole question-card entrance animation', () => {
  assert.match(css,/\.vocab-question-card\.study-enter:has\(\.study-feedback\)\{animation:none!important\}/);
});

test('answer feedback uses calm local motion instead of a horizontal error shake', () => {
  assert.match(css,/--study-motion-feedback:420ms/);
  assert.match(css,/\.study-feedback\.study-error\{animation:study-feedback-retry/);
  assert.match(css,/@keyframes study-feedback-retry\{[^}]*translateY\(4px\)/);
  assert.doesNotMatch(css,/@keyframes study-feedback-retry\{[^}]*translateX/);
  assert.match(css,/@keyframes study-feedback-success\{[^}]*translateY\(4px\)/);
});

test('completion celebration uses restrained session, stage and mastery motion and hides the placeholder', () => {
  assert.match(css,/--study-motion-celebrate:720ms/);
  assert.match(css,/data-finish-variant=\"session\"/);
  assert.match(css,/data-finish-variant=\"stage-complete\"/);
  assert.match(css,/data-finish-variant=\"mastered\"/);
  assert.match(css,/\.vocab-celebration\{visibility:hidden\}/);
  assert.match(css,/\.vocab-completion-art__image\{[^}]*animation:study-trophy-settle var\(--study-motion-celebrate\)/);
  assert.match(css,/\.vocab-summary-grid>div\{[^}]*animation:study-result-reveal/);
});

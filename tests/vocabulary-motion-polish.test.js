import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const views = readFileSync(new URL('../src/vocabulary/views.js', import.meta.url),'utf8');
const css = readFileSync(new URL('../vocabulary-study-app.css', import.meta.url),'utf8');

test('answer feedback does not replay the whole question-card entrance animation', () => {
  assert.match(views,/const questionMotionClass = feedback \|\| retry \? '' : ' study-enter';/);
  assert.match(views,/class="vocab-question-card\$\{questionMotionClass\}"/);
});

test('answer feedback uses calm local motion instead of a horizontal error shake', () => {
  assert.match(css,/--study-motion-feedback:420ms/);
  assert.doesNotMatch(css,/@keyframes study-error\{[^}]*translateX/);
  assert.match(css,/@keyframes study-error\{[^}]*translateY\(4px\)/);
  assert.match(css,/@keyframes study-success\{[^}]*translateY\(4px\)/);
});

test('completion celebration is rendered immediately and lasts about two seconds', () => {
  assert.match(css,/--study-motion-celebrate:2000ms/);
  assert.match(views,/achievementArtwork\('completion'\)/);
  assert.match(views,/data-study-completion-art="trophy"/);
  assert.doesNotMatch(views,/class="vocab-celebration study-milestone"/);
});

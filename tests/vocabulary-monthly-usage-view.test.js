import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const views = await readFile(new URL('../src/vocabulary/teacher-views.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../vocabulary-teacher.css', import.meta.url), 'utf8');

test('teacher overview renders a full-width monthly usage panel from habits data', () => {
  assert.match(views, /function monthlyUsagePanel\(/);
  assert.match(views, />Monthly usage</);
  assert.match(views, /active this month/);
  assert.match(views, /Activity only — not evidence of mastery\./);
  assert.match(views, /data-monthly-usage/);
  assert.match(views, /data-active-students=/);
});

test('monthly usage bars are accessible and responsive', () => {
  assert.match(views, /aria-label=/);
  assert.match(views, /role="img"/);
  assert.match(css, /\.vocab-monthly-usage/);
  assert.match(css, /\.vocab-monthly-usage__bars/);
  assert.match(css, /@media\(max-width:620px\)/);
});

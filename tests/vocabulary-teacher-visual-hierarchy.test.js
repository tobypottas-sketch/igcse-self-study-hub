import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../vocabulary-teacher-polish.css', import.meta.url), 'utf8');
const html = await readFile(new URL('../vocabulary.html', import.meta.url), 'utf8');

test('teacher overview polish is scoped to the screen that contains monthly usage', () => {
  assert.match(css, /body:has\(\.vocab-monthly-usage\) \.vocab-shell--teacher/);
  assert.match(css, /\.vocab-teacher-pathways-panel/);
  assert.match(css, /\.vocab-matrix tbody tr:hover/);
  assert.match(css, /\.vocab-teacher-grid--three > \.vocab-teacher-panel:nth-child\(1\)/);
  assert.match(css, /\.vocab-teacher-grid--three > \.vocab-teacher-panel:nth-child\(2\)/);
  assert.match(css, /\.vocab-teacher-grid--three > \.vocab-teacher-panel:nth-child\(3\)/);
});

test('teacher overview polish reduces border density and preserves responsive hierarchy', () => {
  assert.match(css, /border-color:transparent/);
  assert.match(css, /box-shadow:0 12px 34px/);
  assert.match(css, /\.vocab-matrix th,body:has\(\.vocab-monthly-usage\) \.vocab-shell--teacher \.vocab-matrix td/);
  assert.match(css, /@media\(max-width:620px\)/);
});

test('teacher polish stylesheet is versioned so visual changes are not hidden by cache', () => {
  assert.match(html, /vocabulary-teacher-polish\.css\?v=teacher-hierarchy-v1/);
});

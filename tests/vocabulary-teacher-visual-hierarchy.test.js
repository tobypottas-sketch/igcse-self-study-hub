import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const views = await readFile(new URL('../src/vocabulary/teacher-views.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../vocabulary-teacher-polish.css', import.meta.url), 'utf8');
const html = await readFile(new URL('../vocabulary.html', import.meta.url), 'utf8');

test('teacher overview exposes presentation-only hierarchy hooks', () => {
  assert.match(views, /vocab-teacher-grid--focus/);
  assert.match(views, /vocab-teacher-panel--attention/);
  assert.match(views, /vocab-teacher-grid--diagnostics/);
  assert.match(views, /vocab-teacher-panel--skills/);
  assert.match(views, /vocab-teacher-panel--errors/);
  assert.match(views, /vocab-teacher-panel--words/);
});

test('teacher polish softens pathways and creates distinct diagnostic cards', () => {
  assert.match(css, /\.vocab-shell--teacher \.vocab-teacher-grid--focus/);
  assert.match(css, /\.vocab-shell--teacher \.vocab-teacher-pathways-panel/);
  assert.match(css, /\.vocab-shell--teacher \.vocab-matrix tbody tr:hover/);
  assert.match(css, /\.vocab-shell--teacher \.vocab-teacher-panel--skills/);
  assert.match(css, /\.vocab-shell--teacher \.vocab-teacher-panel--errors/);
  assert.match(css, /\.vocab-shell--teacher \.vocab-teacher-panel--words/);
  assert.match(css, /@media\(max-width:620px\)/);
});

test('teacher polish stylesheet is versioned so visual changes are not hidden by cache', () => {
  assert.match(html, /vocabulary-teacher-polish\.css\?v=teacher-hierarchy-v1/);
});

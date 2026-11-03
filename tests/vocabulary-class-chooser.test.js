import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const teacherApp = await readFile(new URL('../src/vocabulary/teacher-app.js', import.meta.url), 'utf8');
const teacherCss = await readFile(new URL('../vocabulary-teacher.css', import.meta.url), 'utf8');

test('class chooser has dedicated scoped structure without changing its navigation contract', () => {
  assert.match(teacherApp, /class="vocab-shell vocab-class-chooser"/);
  assert.match(teacherApp, /class="vocab-class-chooser__grid"/);
  assert.match(teacherApp, /class="vocab-class-card" data-action="teacher-open-class" data-class-id=/);
  assert.match(teacherApp, /class="vocab-class-card__count"/);
  assert.match(teacherApp, /class="vocab-class-card__cta">Open analytics →<\/span>/);
  assert.match(teacherApp, /<svg[^>]+aria-hidden="true"[^>]+focusable="false"/);
});

test('class chooser styles stay scoped and use the approved 3 / 2 / 1 responsive grid', () => {
  assert.match(teacherCss, /\.vocab-class-chooser \.vocab-class-chooser__grid\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(teacherCss, /@media\(max-width:900px\)\{\.vocab-class-chooser \.vocab-class-chooser__grid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)\}\}/);
  assert.match(teacherCss, /@media\(max-width:620px\)\{\.vocab-class-chooser \.vocab-class-chooser__grid\{grid-template-columns:1fr\}/);
  assert.doesNotMatch(teacherCss, /(?:^|\n)\.vocab-unit-card\{/);
});

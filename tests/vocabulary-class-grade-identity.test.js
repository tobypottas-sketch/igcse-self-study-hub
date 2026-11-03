import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../src/vocabulary/teacher-app.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../vocabulary-class-illustrations.css', import.meta.url), 'utf8');
const html = await readFile(new URL('../vocabulary.html', import.meta.url), 'utf8');

test('class chooser assigns a visual identity from the class grade', () => {
  assert.match(app, /function classGradeVariant/);
  assert.match(app, /data-grade-variant=\\"\$\{escapeHtml\(classGradeVariant\(row\.className\)\)\}\\"/);
  assert.doesNotMatch(app, /vocab-class-card__icon/);
});

test('grade artwork is selected by grade rather than card position', () => {
  assert.match(css, /data-grade-variant=\\"g9\\"/);
  assert.match(css, /data-grade-variant=\\"g10\\"/);
  assert.match(css, /data-grade-variant=\\"g11\\"/);
  assert.doesNotMatch(css, /nth-child\(3n\+/);
});

test('grade card polish is cache-versioned', () => {
  assert.match(html, /vocabulary-class-illustrations\.css\?v=grade-identity-v1/);
});

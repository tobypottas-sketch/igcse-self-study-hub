import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const enhancer = await readFile(new URL('../src/vocabulary/class-grade-identity.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../vocabulary-class-illustrations.css', import.meta.url), 'utf8');
const html = await readFile(new URL('../vocabulary.html', import.meta.url), 'utf8');

test('class chooser assigns a visual identity from the class grade and removes the repeated mini icon', () => {
  assert.match(enhancer, /function classGradeVariant/);
  assert.match(enhancer, /card\.dataset\.gradeVariant = classGradeVariant\(title\?\.textContent/);
  assert.match(enhancer, /querySelector\('\.vocab-class-card__icon'\)\?\.remove\(\)/);
});

test('grade artwork is selected by grade rather than card position', () => {
  assert.match(css, /data-grade-variant="g9"/);
  assert.match(css, /data-grade-variant="g10"/);
  assert.match(css, /data-grade-variant="g11"/);
  assert.doesNotMatch(css, /nth-child\(3n\+/);
});

test('grade card assets are cache-versioned and enhancer is loaded', () => {
  assert.match(html, /vocabulary-class-illustrations\.css\?v=grade-identity-v1/);
  assert.match(html, /class-grade-identity\.js\?v=grade-identity-v1/);
});

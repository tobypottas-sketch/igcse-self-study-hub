import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const home = readFileSync(new URL('../src/views/home.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const cambridgeLogo = new URL('../assets/cambridge-assessment-english.webp', import.meta.url);

test('home clearly identifies Cambridge IGCSE ESL 0511 course', () => {
  assert.match(home, /Cambridge IGCSE English as a Second Language/);
  assert.match(home, />0511</);
  assert.match(home, /course-identity/);
  assert.match(css, /\.course-identity/);
  assert.match(css, /\.course-code/);
});

test('Cambridge course mark is a known local asset rather than a hot-link', () => {
  assert.equal(existsSync(cambridgeLogo), true);
  assert.match(home, /\.\/assets\/cambridge-assessment-english\.webp/);
  assert.doesNotMatch(home, /raw\.githubusercontent\.com.*cambridge/i);
});

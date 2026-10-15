import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const home = readFileSync(new URL('../src/views/home.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

test('home clearly identifies Cambridge IGCSE ESL 0511 course', () => {
  assert.match(home, /Cambridge IGCSE English as a Second Language/);
  assert.match(home, />0511</);
  assert.match(home, /course-identity/);
  assert.match(css, /\.course-identity/);
  assert.match(css, /\.course-code/);
});

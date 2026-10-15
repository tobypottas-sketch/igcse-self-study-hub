import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const home = await readFile(new URL('../src/views/home.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');

test('home renders the polished student hero and study-tools structure', () => {
  assert.match(home, /class="home-hero"/);
  assert.match(home, /iGCSE Self-Study Hub/);
  assert.match(home, /Choose a skill and continue your independent practice\./);
  assert.match(home, /class="study-tools"/);
  assert.match(home, /Open practice →/);
});

test('home polish uses the EH-inspired navy teal blue visual language', () => {
  assert.match(css, /--hub-navy:\s*#173852/i);
  assert.match(css, /--hub-teal:\s*#137e80/i);
  assert.match(css, /--hub-blue:\s*#2e73d6/i);
  assert.match(css, /\.home-hero\s*\{/);
  assert.match(css, /linear-gradient\(/);
  assert.match(css, /\.app-card__icon\s*\{/);
});

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
  assert.match(css, /--hub-navy:\s*var\(--c-ink\)/i);
  assert.match(css, /--hub-teal:\s*var\(--c-teal\)/i);
  assert.match(css, /--hub-blue:\s*var\(--c-blue\)/i);
  assert.match(css, /\.home-hero\s*\{/);
  assert.match(css, /linear-gradient\(/);
  assert.match(css, /\.app-card__icon\s*\{/);
});

test('shared theme tokens define the brand palette once and are loaded first', async () => {
  const fsm = await import('node:fs');
  const theme = fsm.readFileSync(new URL('../theme.css', import.meta.url), 'utf8');
  assert.match(theme, /--c-ink:\s*#173852/i);
  assert.match(theme, /--c-teal:\s*#137e80/i);
  assert.match(theme, /--c-blue:\s*#2e73d6/i);
  for (const page of ['../index.html', '../vocabulary.html']) {
    const html = fsm.readFileSync(new URL(page, import.meta.url), 'utf8');
    const links = [...html.matchAll(/rel="stylesheet" href="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(links[0], 'theme.css', `${page} must load theme.css first`);
  }
  const html = fsm.readFileSync(new URL('../vocabulary.html', import.meta.url), 'utf8');
  const links = [...html.matchAll(/rel="stylesheet" href="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(links.at(-1), 'vocabulary-a11y.css', 'accessibility layer loads last');
});

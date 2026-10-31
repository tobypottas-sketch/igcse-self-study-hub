import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../vocabulary-games.css', import.meta.url), 'utf8');

test('Word Blitz uses the compact prompt and answer spacing', () => {
  assert.match(css, /\[data-blitz-q\]\{display:grid;gap:10px\}/);
  assert.match(css, /\.gm-prompt\{[^}]*min-height:120px;[^}]*padding:14px 16px/);
  assert.match(css, /\.gm-option\{[^}]*min-height:84px;/);
  assert.match(css, /\.gm-shell--blitz \.gm-prompt\{min-height:140px;padding:18px 22px\}/);
  assert.match(css, /\.gm-shell--blitz \.gm-option\{min-height:94px;padding:12px 20px\}/);
});

test('Connections keeps its existing game-specific layout rules', () => {
  assert.match(css, /\.gm-guess\{display:grid;grid-template-columns:minmax\(0,1fr\) auto;gap:10px\}/);
});

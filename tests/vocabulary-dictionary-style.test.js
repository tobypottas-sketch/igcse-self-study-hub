import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('dictionary context row is vertically centred with a fixed label column', () => {
  const css = fs.readFileSync(new URL('../vocabulary-extra.css', import.meta.url), 'utf8');
  assert.match(css, /\.vocab-dictionary-entry__context\{[^}]*grid-template-columns:minmax\(118px,auto\) minmax\(0,1fr\)[^}]*align-items:center/s);
  assert.match(css, /\.vocab-dictionary-entry__context span\{[^}]*display:flex[^}]*align-items:center[^}]*min-height:24px[^}]*padding-top:0/s);
  assert.match(css, /\.vocab-dictionary-entry__context p\{[^}]*display:flex[^}]*align-items:center[^}]*min-height:24px/s);
});

test('dictionary hierarchy gives word class and definition distinct editorial styling', () => {
  const css = fs.readFileSync(new URL('../vocabulary-extra.css', import.meta.url), 'utf8');
  assert.match(css, /\.vocab-dictionary-entry__pos\{[^}]*background:#f4efff[^}]*color:#6650a4[^}]*border:1px solid #d9cff4/s);
  assert.match(css, /\.vocab-dictionary-entry__definition\{[^}]*font-style:italic[^}]*color:#4b6074/s);
  assert.match(css, /\.vocab-dictionary-entry__term\{[^}]*text-decoration-line:underline[^}]*text-decoration-color:#b7dfe2/s);
});

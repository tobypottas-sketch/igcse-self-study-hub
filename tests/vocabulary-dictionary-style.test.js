import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('dictionary context row uses a fixed label column and shared typographic baseline', () => {
  const css = fs.readFileSync(new URL('../vocabulary-extra.css', import.meta.url), 'utf8');
  assert.match(css, /\.vocab-dictionary-entry__context\{[^}]*grid-template-columns:minmax\(118px,auto\) minmax\(0,1fr\)[^}]*align-items:baseline/s);
  assert.match(css, /\.vocab-dictionary-entry__context span\{[^}]*line-height:1\.4/s);
  assert.match(css, /\.vocab-dictionary-entry__context p\{[^}]*line-height:1\.4/s);
  assert.doesNotMatch(css, /\.vocab-dictionary-entry__context span\{[^}]*min-height:/s);
  assert.doesNotMatch(css, /\.vocab-dictionary-entry__context p\{[^}]*min-height:/s);
});

test('dictionary hierarchy gives word class and definition distinct editorial styling', () => {
  const css = fs.readFileSync(new URL('../vocabulary-extra.css', import.meta.url), 'utf8');
  assert.match(css, /\.vocab-dictionary-entry__pos\{[^}]*background:var\(--c-violet-soft\)[^}]*color:var\(--c-violet\)[^}]*border:1px solid var\(--c-violet-line\)/s);
  assert.match(css, /\.vocab-dictionary-entry__definition\{[^}]*font-style:italic[^}]*color:var\(--c-muted\)/s);
  assert.match(css, /\.vocab-dictionary-entry__term\{[^}]*text-decoration-line:underline[^}]*text-decoration-color:var\(--c-teal-line\)/s);
});

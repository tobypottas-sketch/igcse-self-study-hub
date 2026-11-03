import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../vocabulary-teacher-polish.css', import.meta.url), 'utf8');

test('class pathway headers and cells are centered while the student column stays left aligned', () => {
  assert.match(css, /\.vocab-matrix thead th:not\(:first-child\),[^\{]*\.vocab-matrix tbody td\s*\{\s*text-align:center/);
  assert.match(css, /\.vocab-matrix thead th:first-child,[^\{]*\.vocab-matrix tbody th\s*\{\s*text-align:left/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../vocabulary.html', import.meta.url), 'utf8');

test('monthly usage stylesheet is cache-busted so empty-state fixes load immediately', () => {
  assert.match(html, /vocabulary-monthly-usage\.css\?v=empty-state-v2/);
});

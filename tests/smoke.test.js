import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);

test('hub shell exposes app root and boot function', async () => {
  const html = await readFile(new URL('index.html', root), 'utf8');
  const app = await import(new URL('src/app.js', root));
  assert.match(html, /id=["']app["']/);
  assert.equal(typeof app.bootApp, 'function');
});

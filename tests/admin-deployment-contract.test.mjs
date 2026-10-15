import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('admin account and class functions retain JWT and server-side admin gates in source', async () => {
  const [accounts, classes] = await Promise.all([
    readFile(new URL('../supabase/functions/admin-provision-user/index.ts', import.meta.url), 'utf8'),
    readFile(new URL('../supabase/functions/admin-class-action/index.ts', import.meta.url), 'utf8')
  ]);
  for (const source of [accounts, classes]) {
    assert.match(source, /Authorization/);
    assert.match(source, /auth\.getUser\(\)/);
    assert.match(source, /role !== 'admin'/);
    assert.match(source, /active/);
  }
});

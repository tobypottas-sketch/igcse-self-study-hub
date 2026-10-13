import test from 'node:test';
import assert from 'node:assert/strict';
import { getSupabaseConfig } from '../src/config.js';

test('hub configuration points only at the dedicated self-study project', () => {
  const config = getSupabaseConfig();
  assert.equal(config.url, 'https://grjshlamooglytsajoun.supabase.co');
  assert.match(config.publishableKey, /^sb_publishable_/);
  assert.doesNotMatch(config.url, /qntshqwgekvluaiglyie/);
});

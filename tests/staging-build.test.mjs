import assert from 'node:assert/strict';
import test from 'node:test';
import { stagingSettings } from '../scripts/build-staging.mjs';

const example = {
  HUB_STAGING_SUPABASE_REF:'aaaaaaaaaaaaaaaaaaaa',
  HUB_STAGING_PUBLISHABLE_KEY:'sb_publishable_fixture',
  HUB_STAGING_SITE_URL:'https://example.pages.dev/'
};

test('isolated HTTPS and loopback settings keep both optional features off by default', () => {
  const result = stagingSettings(example);
  assert.equal(result.site.href,'https://example.pages.dev/');
  assert.equal(result.microsoft,false);
  assert.equal(result.timing,false);
  assert.equal(stagingSettings({...example,HUB_STAGING_SITE_URL:'http://127.0.0.1:4173/qa/'}).site.pathname,'/qa/');
});

test('rejects production targets, secret key format and ambiguous redirects', () => {
  for (const env of [
    {HUB_STAGING_SUPABASE_REF:'grjshlamooglytsajoun'},
    {HUB_STAGING_PUBLISHABLE_KEY:'sb_secret_fixture'},
    {HUB_STAGING_SITE_URL:'https://tobypottas-sketch.github.io/igcse-self-study-hub/'},
    {HUB_STAGING_SITE_URL:'https://example.pages.dev/?return=production'},
    {HUB_STAGING_SITE_URL:'http://example.pages.dev/'},
    {HUB_STAGING_SITE_URL:'https://example.pages.dev/subpath'}
  ]) assert.throws(()=>stagingSettings({...example,...env}));
});

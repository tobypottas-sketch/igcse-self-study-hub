import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { handleMatchRequest } from '../supabase/functions/eh-match/handler.js';

const KEY = 'k'.repeat(40);
const U = n => `00000000-0000-4000-8000-0000000000${String(n).padStart(2, '0')}`;
const PROFILES = [
  { id: U(1), display_name: 'Fake One', school_email: '001234@school.example', role: 'student', active: true },
  { id: U(2), display_name: 'Fake Two', school_email: '005678@school.example', role: 'student', active: true },
  { id: U(3), display_name: 'Inactive', school_email: '009999@school.example', role: 'student', active: false },
  { id: U(4), display_name: 'Staff', school_email: '008888@school.example', role: 'teacher', active: true },
  { id: U(5), display_name: 'Boss', school_email: '007777@school.example', role: 'admin', active: true }
];

function req({ method = 'POST', key = KEY, body = { action: 'match', numbers: ['1234'] }, raw } = {}) {
  const headers = { 'content-type': 'application/json' };
  if (key !== null) headers['x-eh-service-key'] = key;
  return new Request('https://example.test/eh-match', { method, headers, body: method === 'GET' ? undefined : (raw ?? JSON.stringify(body)) });
}
const deps = (over = {}) => ({ env: { EH_SERVICE_KEY: KEY }, loadStudentProfiles: async () => PROFILES, ...over });
const json = async r => JSON.parse(await r.text());

test('non-POST returns 405', async () => {
  assert.equal((await handleMatchRequest(req({ method: 'GET' }), deps())).status, 405);
});

test('missing service key returns 401 with the neutral body', async () => {
  const r = await handleMatchRequest(req({ key: null }), deps());
  assert.equal(r.status, 401);
  assert.deepEqual(await json(r), { ok: false, error: 'unauthorized' });
});

test('wrong service key returns 401 with the neutral body', async () => {
  const r = await handleMatchRequest(req({ key: 'x'.repeat(40) }), deps());
  assert.equal(r.status, 401);
  assert.deepEqual(await json(r), { ok: false, error: 'unauthorized' });
});

test('wrong key of a different length returns 401 without throwing', async () => {
  assert.equal((await handleMatchRequest(req({ key: 'short' }), deps())).status, 401);
  assert.equal((await handleMatchRequest(req({ key: 'y'.repeat(500) }), deps())).status, 401);
});

test('secret shorter than 32 characters returns 503 and never authorises', async () => {
  const r = await handleMatchRequest(req({ key: 'abc' }), deps({ env: { EH_SERVICE_KEY: 'abc' } }));
  assert.equal(r.status, 503);
});

test('missing secret returns 503', async () => {
  assert.equal((await handleMatchRequest(req(), deps({ env: {} }))).status, 503);
});

test('invalid JSON returns 400 bad_request', async () => {
  const r = await handleMatchRequest(req({ raw: '{nope' }), deps());
  assert.equal(r.status, 400);
  assert.deepEqual(await json(r), { ok: false, error: 'bad_request' });
});

test('unknown action returns 400', async () => {
  assert.equal((await handleMatchRequest(req({ body: { action: 'dump', numbers: ['1234'] } }), deps())).status, 400);
});

test('numbers not an array, empty, more than 500, duplicate, non-canonical or non-string return 400', async () => {
  const many = Array.from({ length: 501 }, (_, i) => String(100000 + i));
  const bad = ['1234', [], many, ['1234', '1234'], ['001234'], ['12'], [1234], ['abcd'], [null]];
  for (const numbers of bad) {
    assert.equal((await handleMatchRequest(req({ body: { action: 'match', numbers } }), deps())).status, 400, JSON.stringify(numbers).slice(0, 30));
  }
});

test('valid request returns 200 with every requested number as a key', async () => {
  const r = await handleMatchRequest(req({ body: { action: 'match', numbers: ['1234', '4321'] } }), deps());
  assert.equal(r.status, 200);
  const body = await json(r);
  assert.equal(body.ok, true);
  assert.deepEqual(Object.keys(body.results).sort(), ['1234', '4321']);
  assert.deepEqual(body.results['1234'], [{ profileId: U(1), displayName: 'Fake One' }]);
  assert.deepEqual(body.results['4321'], []);
});

test('response body never contains an email or school_email string', async () => {
  const text = await (await handleMatchRequest(req({ body: { action: 'match', numbers: ['1234', '5678'] } }), deps())).text();
  assert.ok(!text.includes('@'));
  assert.ok(!text.includes('school'));
  assert.ok(!text.includes('role'));
});

test('inactive profiles are excluded', async () => {
  const body = await json(await handleMatchRequest(req({ body: { action: 'match', numbers: ['9999'] } }), deps()));
  assert.deepEqual(body.results['9999'], []);
});

test('teacher and admin profiles are excluded even with a numeric email', async () => {
  const body = await json(await handleMatchRequest(req({ body: { action: 'match', numbers: ['8888', '7777'] } }), deps()));
  assert.deepEqual(body.results, { 8888: [], 7777: [] });
});

test('loader failure returns 503 unavailable with no detail text', async () => {
  const r = await handleMatchRequest(req(), deps({ loadStudentProfiles: async () => { throw new Error('secret detail 001234'); } }));
  assert.equal(r.status, 503);
  const text = await r.text();
  assert.deepEqual(JSON.parse(text), { ok: false, error: 'unavailable' });
  assert.ok(!text.includes('001234'));
});

test('no console output is produced on any path', async () => {
  const calls = [];
  const saved = {};
  for (const m of ['log', 'info', 'warn', 'error', 'debug']) { saved[m] = console[m]; console[m] = (...a) => calls.push(a); }
  try {
    await handleMatchRequest(req(), deps());
    await handleMatchRequest(req({ key: null }), deps());
    await handleMatchRequest(req({ raw: '{' }), deps());
    await handleMatchRequest(req(), deps({ loadStudentProfiles: async () => { throw new Error('x'); } }));
  } finally { for (const m of Object.keys(saved)) console[m] = saved[m]; }
  assert.deepEqual(calls, []);
});

test('key comparison uses timingSafeEqual', () => {
  const src = fs.readFileSync(new URL('../supabase/functions/eh-match/handler.js', import.meta.url), 'utf8');
  assert.match(src, /timingSafeEqual/);
});

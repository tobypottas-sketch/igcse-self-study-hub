// H3: eh-summary request handling + shared service auth. Synthetic fixtures only; the data loader is injected (the real one is H4).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { handleSummaryRequest, MAX_STUDENTS } from '../supabase/functions/eh-summary/handler.js';
import { handleMatchRequest } from '../supabase/functions/eh-match/handler.js';
import { authorizeServiceRequest, MIN_SECRET_LENGTH } from '../supabase/functions/_shared/eh-service-auth.js';

const KEY = 'k'.repeat(40);
const U = n => `00000000-0000-4000-8000-0000000000${String(n).padStart(2, '0')}`;
const NOW = '2026-11-02T03:00:00Z';
const occId = n => `u1_w${String(n).padStart(3, '0')}`;
const members = pathway => Array.from({ length: 50 }, (_, i) => ({ unit_number: 1, pathway_id: pathway, set_number: Math.floor(i / 10) + 1, position: (i % 10) + 1, occurrence_id: occId(i + 1) }));
const occurrences = Array.from({ length: 50 }, (_, i) => ({ occurrence_id: occId(i + 1), unit_number: 1, position_in_unit: i + 1, status: 'live', active: true }));
const maintained = pathway => [1, 2, 3, 4, 5].map(n => ({ unit_number: 1, pathway_id: pathway, set_number: n, stage: 'mastery', phase: 'stage', status: 'maintain', updated_at: '2026-10-20T04:00:00Z' }));

const PROFILES = [
  { id: U(1), role: 'student', active: true, school_email: '001234@school.example', display_name: 'Fake One' },
  { id: U(2), role: 'student', active: false, school_email: '005678@school.example', display_name: 'Fake Two' },
  { id: U(3), role: 'teacher', active: true, school_email: 'teacher@school.example', display_name: 'Fake Teacher' },
  { id: U(4), role: 'admin', active: true, school_email: 'admin@school.example', display_name: 'Fake Admin' }
];
const DATA = {
  profiles: PROFILES,
  members: [...members('meaning'), ...members('context')],
  occurrences,
  byStudent: {
    [U(1)]: { setRows: [...maintained('meaning'), ...maintained('context')], unitChecks: [{ unit_number: 1, attempt_number: 1, score: 8, max_score: 10, completed_at: '2026-10-10T04:00:00Z', form_id: 'A' }], merits: [{ merit_number: 1, awarded_at: '2026-10-02T04:00:00Z', awarded_by: U(3) }], events: [{ event_type: 'exercise_result', pathway_id: 'meaning', occurred_at: '2026-10-30T04:00:00Z' }] }
  }
};

function req({ method = 'POST', key = KEY, body = { action: 'summary', schemaVersion: 1, students: [U(1)] }, raw } = {}) {
  const headers = { 'content-type': 'application/json' };
  if (key !== null) headers['x-eh-service-key'] = key;
  return new Request('https://example.test/eh-summary', { method, headers, body: method === 'GET' ? undefined : (raw ?? JSON.stringify(body)) });
}
const deps = (over = {}) => ({ env: { EH_SERVICE_KEY: KEY }, loadSummaryData: async () => DATA, now: () => NOW, ...over });
const json = async r => JSON.parse(await r.text());
const body = (over = {}) => ({ action: 'summary', schemaVersion: 1, students: [U(1)], ...over });

// ---- transport and auth (mirrors eh-match) -------------------------------------------------------------------------------
test('non-POST returns 405', async () => {
  assert.equal((await handleSummaryRequest(req({ method: 'GET' }), deps())).status, 405);
});

test('missing or wrong service key returns 401 with the neutral body', async () => {
  for (const key of [null, 'x'.repeat(40), 'short', 'y'.repeat(500)]) {
    const r = await handleSummaryRequest(req({ key }), deps());
    assert.equal(r.status, 401);
    assert.deepEqual(await json(r), { ok: false, error: 'unauthorized' });
  }
});

test('a secret shorter than 32 characters, or a missing secret, returns 503 and never authorises', async () => {
  assert.equal((await handleSummaryRequest(req({ key: 'abc' }), deps({ env: { EH_SERVICE_KEY: 'abc' } }))).status, 503);
  assert.equal((await handleSummaryRequest(req(), deps({ env: {} }))).status, 503);
  assert.equal((await handleSummaryRequest(req(), deps({ env: undefined }))).status, 503);
});

test('auth never reaches the loader when unauthorised', async () => {
  let called = 0;
  await handleSummaryRequest(req({ key: null }), deps({ loadSummaryData: async () => { called += 1; return DATA; } }));
  await handleSummaryRequest(req({ key: 'x'.repeat(40) }), deps({ loadSummaryData: async () => { called += 1; return DATA; } }));
  assert.equal(called, 0);
});

test('shared auth helper behaves identically to eh-match for the same key cases', async () => {
  const cases = [
    { key: KEY, env: { EH_SERVICE_KEY: KEY } }, { key: null, env: { EH_SERVICE_KEY: KEY } }, { key: 'x'.repeat(40), env: { EH_SERVICE_KEY: KEY } },
    { key: 'short', env: { EH_SERVICE_KEY: KEY } }, { key: 'y'.repeat(500), env: { EH_SERVICE_KEY: KEY } }, { key: 'abc', env: { EH_SERVICE_KEY: 'abc' } },
    { key: KEY, env: {} }, { key: KEY, env: undefined }, { key: KEY, env: { EH_SERVICE_KEY: 12345 } }, { key: '', env: { EH_SERVICE_KEY: KEY } }
  ];
  for (const { key, env } of cases) {
    const match = await handleMatchRequest(req({ key, body: { action: 'match', numbers: ['1234'] } }), { env, loadStudentProfiles: async () => [] });
    const summary = await handleSummaryRequest(req({ key }), deps({ env }));
    const auth = authorizeServiceRequest(req({ key }), env);
    const authStatus = auth === null ? 200 : auth.status;
    assert.equal(summary.status, match.status, JSON.stringify({ key: key?.length ?? null, env: env ? Object.keys(env) : env }));
    assert.equal(authStatus, summary.status);
  }
  assert.equal(MIN_SECRET_LENGTH, 32);
});

test('key comparison uses timingSafeEqual in the shared helper', () => {
  assert.match(fs.readFileSync(new URL('../supabase/functions/_shared/eh-service-auth.js', import.meta.url), 'utf8'), /timingSafeEqual/);
});

// ---- request validation --------------------------------------------------------------------------------------------------
test('invalid JSON, wrong action or wrong schemaVersion return 400 bad_request', async () => {
  const r = await handleSummaryRequest(req({ raw: '{nope' }), deps());
  assert.equal(r.status, 400);
  assert.deepEqual(await json(r), { ok: false, error: 'bad_request' });
  for (const b of [body({ action: 'dump' }), body({ action: undefined }), body({ schemaVersion: 2 }), body({ schemaVersion: '1' }), body({ schemaVersion: undefined }), null, 'x', []]) {
    assert.equal((await handleSummaryRequest(req({ body: b }), deps())).status, 400, JSON.stringify(b)?.slice(0, 40));
  }
});

test('students must be 1..50 distinct uuid strings', async () => {
  const many = n => Array.from({ length: n }, (_, i) => `00000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`);
  assert.equal(MAX_STUDENTS, 50);
  const bad = ['x', [], many(51), [U(1), U(1)], [U(1), U(1).toUpperCase()], ['not-a-uuid'], [1], [null], [U(1), 'x'], [`${U(1)} `], ['00000000-0000-4000-8000-00000000000g']];
  for (const students of bad) assert.equal((await handleSummaryRequest(req({ body: body({ students }) }), deps())).status, 400, JSON.stringify(students).slice(0, 40));
  assert.equal((await handleSummaryRequest(req({ body: body({ students: many(50) }) }), deps())).status, 200);
  assert.equal((await handleSummaryRequest(req({ body: body({ students: undefined }) }), deps())).status, 400);
});

test('since must be a real YYYY-MM-DD date when sent', async () => {
  for (const since of ['2026-13-01', '2026-02-30', '20260901', 'yesterday', 5, null, '2026-09-01T00:00:00Z']) {
    assert.equal((await handleSummaryRequest(req({ body: body({ since }) }), deps())).status, 400, String(since));
  }
  assert.equal((await handleSummaryRequest(req({ body: body({ since: '2026-09-01' }) }), deps())).status, 200);
});

test('uppercase uuids are accepted and normalised to lower case for lookup and in the reply', async () => {
  const r = await json(await handleSummaryRequest(req({ body: body({ students: [U(1).toUpperCase()] }) }), deps()));
  assert.equal(r.results[0].hubStudentId, U(1));
  assert.equal(r.results[0].status, 'ok');
});

// ---- results -------------------------------------------------------------------------------------------------------------
test('every requested student gets one result, in request order', async () => {
  const r = await json(await handleSummaryRequest(req({ body: body({ students: [U(4), U(1), U(9), U(2), U(3)] }) }), deps()));
  assert.equal(r.ok, true);
  assert.equal(r.schemaVersion, 1);
  assert.equal(r.generatedAt, NOW);
  assert.deepEqual(r.results.map(x => [x.hubStudentId, x.status]), [[U(4), 'not_found'], [U(1), 'ok'], [U(9), 'not_found'], [U(2), 'inactive'], [U(3), 'not_found']]);
});

test('unknown, teacher and admin ids are not_found; inactive students are inactive; neither carries evidence', async () => {
  const r = await json(await handleSummaryRequest(req({ body: body({ students: [U(9), U(3), U(4), U(2)] }) }), deps()));
  for (const item of r.results) assert.deepEqual(Object.keys(item).sort(), ['hubStudentId', 'status']);
});

test('an ok student carries the H2 summary for that student only', async () => {
  const r = await json(await handleSummaryRequest(req({ body: body({ since: '2026-09-01' }) }), deps()));
  const item = r.results[0];
  assert.equal(item.status, 'ok');
  assert.deepEqual(item.activation, { requiredPairs: 2, completedPairs: 2, activated: true });
  assert.deepEqual(item.pairs.map(p => `${p.unit}:${p.pathway}:${p.state}`), ['1:meaning:mastered', '1:context:mastered']);
  assert.deepEqual(item.unitChecks, [{ unit: 1, attempt: 1, score: 8, max: 10, completedOn: '2026-10-10' }]);
  assert.deepEqual(item.merits, { count: 1, latestAwardedOn: '2026-10-02' });
  assert.deepEqual(item.engagement, { lastActiveOn: '2026-10-30', activeDays8w: 2, activeWeeks8w: 2 });
});

test('an active student the loader has no rows for is ok with an empty, not-activated summary', async () => {
  const r = await json(await handleSummaryRequest(req(), deps({ loadSummaryData: async () => ({ ...DATA, byStudent: {} }) })));
  assert.equal(r.results[0].status, 'ok');
  assert.deepEqual(r.results[0].activation, { requiredPairs: 2, completedPairs: 0, activated: false });
  assert.deepEqual(r.results[0].pairs, []);
});

test('the loader receives only the validated lower-case ids and since', async () => {
  const calls = [];
  await handleSummaryRequest(req({ body: body({ students: [U(1).toUpperCase(), U(2)], since: '2026-09-01' }) }), deps({ loadSummaryData: async arg => { calls.push(arg); return DATA; } }));
  assert.deepEqual(calls, [{ ids: [U(1), U(2)], since: '2026-09-01' }]);
  calls.length = 0;
  await handleSummaryRequest(req(), deps({ loadSummaryData: async arg => { calls.push(arg); return DATA; } }));
  assert.deepEqual(calls, [{ ids: [U(1)], since: undefined }]);
});

test('now defaults to the real clock when no clock is injected', async () => {
  const r = await json(await handleSummaryRequest(req(), { env: { EH_SERVICE_KEY: KEY }, loadSummaryData: async () => DATA }));
  assert.ok(Number.isFinite(Date.parse(r.generatedAt)));
});

// ---- privacy and failure -------------------------------------------------------------------------------------------------
test('the response never contains an email, display name, form id, awarded_by or any id except the requested ones', async () => {
  const text = await (await handleSummaryRequest(req({ body: body({ students: [U(1), U(2), U(3), U(4)], since: '2026-09-01' }) }), deps())).text();
  assert.ok(!text.includes('@'));
  assert.ok(!text.match(/email|display|Fake|school|form_id|awarded_by|role|teacher|admin|"active"/i));
  const ids = new Set(text.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g));
  assert.deepEqual([...ids].sort(), [U(1), U(2), U(3), U(4)].sort());
});

test('loader failure returns 503 unavailable with no detail text', async () => {
  const r = await handleSummaryRequest(req(), deps({ loadSummaryData: async () => { throw new Error(`secret detail ${U(1)} 001234@school.example`); } }));
  assert.equal(r.status, 503);
  const text = await r.text();
  assert.deepEqual(JSON.parse(text), { ok: false, error: 'unavailable' });
  assert.ok(!text.includes('001234') && !text.includes(U(1)));
});

test('a malformed loader result or a derivation failure returns 503 unavailable', async () => {
  for (const loadSummaryData of [async () => null, async () => 'x', async () => ({ profiles: 5 }), async () => ({ profiles: PROFILES, byStudent: { [U(1)]: { setRows: [{ get unit_number() { throw new Error('boom'); } }] } }, members: [{ get unit_number() { throw new Error('boom'); } }], occurrences })]) {
    const r = await handleSummaryRequest(req(), deps({ loadSummaryData }));
    assert.equal(r.status, 503);
    assert.deepEqual(await json(r), { ok: false, error: 'unavailable' });
  }
});

test('replies are never cached', async () => {
  const r = await handleSummaryRequest(req(), deps());
  assert.match(r.headers.get('cache-control') ?? '', /no-store/);
  assert.match(r.headers.get('content-type') ?? '', /application\/json/);
});

test('no console output is produced on any path', async () => {
  const calls = [];
  const saved = {};
  for (const m of ['log', 'info', 'warn', 'error', 'debug']) { saved[m] = console[m]; console[m] = (...a) => calls.push(a); }
  try {
    await handleSummaryRequest(req(), deps());
    await handleSummaryRequest(req({ key: null }), deps());
    await handleSummaryRequest(req({ raw: '{' }), deps());
    await handleSummaryRequest(req({ body: body({ students: [] }) }), deps());
    await handleSummaryRequest(req(), deps({ loadSummaryData: async () => { throw new Error('x'); } }));
  } finally { for (const m of Object.keys(saved)) console[m] = saved[m]; }
  assert.deepEqual(calls, []);
});

test('the handler and helper do no database or network I/O themselves', () => {
  for (const rel of ['../supabase/functions/eh-summary/handler.js', '../supabase/functions/_shared/eh-service-auth.js']) {
    const src = fs.readFileSync(new URL(rel, import.meta.url), 'utf8');
    assert.doesNotMatch(src, /createClient|fetch\(|Deno\.|process\.env|console\.|\.from\(/);
  }
});

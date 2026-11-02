// H4: the real eh-summary data loader and Edge entry point. The Supabase client is replaced by a small in-memory emulator that
// applies the same filters/paging/column selection a PostgREST query would, so the tests prove WHICH columns and filters are used.
// Synthetic data only.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createSummaryLoader } from '../supabase/functions/eh-summary/loader.js';
import { handleSummaryRequest } from '../supabase/functions/eh-summary/handler.js';
import { LIVE_OCCURRENCE_FILTER } from '../supabase/functions/eh-summary/pathway-state.js';

const KEY = 'k'.repeat(40);
const U = n => `00000000-0000-4000-8000-0000000000${String(n).padStart(2, '0')}`;
const NOW = '2026-11-02T03:00:00Z';
const occId = (unit, n) => `u${unit}_w${String(n).padStart(3, '0')}`;

// ---- emulator ------------------------------------------------------------------------------------------------------------
function emulator(tables, { failTable = null } = {}) {
  const calls = [];
  function from(table) {
    const call = { table, select: null, eq: [], in: [], gte: [], notNull: [], order: [], range: null };
    calls.push(call);
    const builder = {
      select(cols) { call.select = cols; return builder; },
      eq(col, val) { call.eq.push([col, val]); return builder; },
      in(col, vals) { call.in.push([col, vals]); return builder; },
      gte(col, val) { call.gte.push([col, val]); return builder; },
      not(col, op, val) { if (op === 'is' && val === null) call.notNull.push(col); else throw new Error('unsupported not'); return builder; },
      order(col) { call.order.push(col); return builder; },
      range(a, b) { call.range = [a, b]; return builder; },
      then(resolve, reject) { return Promise.resolve(run()).then(resolve, reject); }
    };
    const value = (row, col) => col.includes('->>') ? row.metadata?.[col.split('->>')[1]] : row[col];
    function run() {
      if (failTable === table) return { data: null, error: { message: 'boom secret detail 001234@school.example' } };
      let rows = (tables[table] ?? []).filter(row => {
        for (const [c, v] of call.eq) if (row[c] !== v) return false;
        for (const [c, vs] of call.in) if (!vs.includes(row[c])) return false;
        for (const [c, v] of call.gte) if (!(Date.parse(row[c]) >= Date.parse(v))) return false;
        for (const c of call.notNull) if (value(row, c) === null || value(row, c) === undefined) return false;
        return true;
      });
      for (const col of [...call.order].reverse()) rows = [...rows].sort((a, b) => (a[col] > b[col] ? 1 : a[col] < b[col] ? -1 : 0));
      if (call.range) rows = rows.slice(call.range[0], call.range[1] + 1);
      const cols = call.select.split(',').map(c => c.trim());
      return { data: rows.map(row => Object.fromEntries(cols.map(c => c.includes(':') ? [c.split(':')[0], value(row, c.split(':')[1])] : [c, row[c]]))), error: null };
    }
    return builder;
  }
  return { from, calls };
}

const members = (unit, pathway, sets) => Array.from({ length: sets * 10 }, (_, i) => ({ unit_number: unit, pathway_id: pathway, set_number: Math.floor(i / 10) + 1, position: (i % 10) + 1, occurrence_id: occId(unit, i + 1), created_by: 'x' }));
const occ = (unit, count, over = {}) => Array.from({ length: count }, (_, i) => ({ occurrence_id: occId(unit, i + 1), unit_number: unit, position_in_unit: i + 1, status: 'live', active: true, vocabulary_id: 'v', unit_title: 'Secret Title', ...over }));
const maintain = (student, unit, pathway, n) => ({ student_id: student, unit_number: unit, pathway_id: pathway, set_number: n, stage: 'mastery', phase: 'stage', status: 'maintain', completed_stages: ['x'], weak_target_ids: ['SECRET-TARGET'], history: ['SECRET-HISTORY'], support_flags: [], updated_at: '2026-10-20T04:00:00Z', completed_at: '2026-10-20T04:00:00Z' });

function fixtures() {
  return {
    profiles: [
      { id: U(1), role: 'student', active: true, school_email: '001234@school.example', display_name: 'Fake One', notes: 'PRIVATE NOTE' },
      { id: U(2), role: 'student', active: true, school_email: '005678@school.example', display_name: 'Fake Two' },
      { id: U(3), role: 'student', active: false, school_email: '009999@school.example', display_name: 'Fake Inactive' },
      { id: U(4), role: 'teacher', active: true, school_email: 'teacher@school.example', display_name: 'Fake Teacher' }
    ],
    vocabulary_set_members: [...members(1, 'meaning', 5), ...members(1, 'context', 5), ...members(2, 'meaning', 5), ...members(9, 'meaning', 5)],
    vocabulary_unit_occurrences: [...occ(1, 50), ...occ(2, 50), ...occ(2, 5, { occurrence_id: 'u2_draft', status: 'draft' }), ...occ(1, 1, { occurrence_id: 'u1_inactive', active: false }), ...occ(9, 50)],
    vocabulary_pathway_sets: [
      ...[1, 2, 3, 4, 5].map(n => maintain(U(1), 1, 'meaning', n)), ...[1, 2, 3, 4, 5].map(n => maintain(U(1), 1, 'context', n)),
      ...[1, 2, 3].map(n => maintain(U(2), 2, 'meaning', n)),
      ...[1, 2, 3, 4, 5].map(n => maintain(U(3), 9, 'meaning', n)), ...[1, 2, 3, 4, 5].map(n => maintain(U(4), 9, 'meaning', n))
    ],
    vocabulary_unit_check_attempts: [
      { student_id: U(1), unit_number: 1, form_id: 'A', attempt_number: 1, score: 8, max_score: 10, completed_at: '2026-10-10T04:00:00Z', answers: ['SECRET-ANSWER'] },
      { student_id: U(2), unit_number: 2, form_id: 'B', attempt_number: 1, score: 5, max_score: 10, completed_at: '2026-10-11T04:00:00Z' }
    ],
    vocabulary_merit_awards: [
      { student_id: U(1), merit_number: 1, awarded_by: U(4), awarded_at: '2026-10-02T04:00:00Z' },
      { student_id: U(1), merit_number: 2, awarded_by: U(4), awarded_at: '2026-10-25T04:00:00Z' },
      { student_id: U(2), merit_number: 1, awarded_by: U(4), awarded_at: '2026-09-02T04:00:00Z' }
    ],
    activity_events: [
      { id: 'e1', user_id: U(1), app_key: 'vocabulary_paraphrase', event_type: 'exercise_result', occurred_at: '2026-10-30T04:00:00Z', activity_id: 'session_complete:adaptive:meaning', score: 7, metadata: { pathway_id: 'meaning', answer: 'SECRET-ANSWER', note: 'PRIVATE NOTE', occurrence_id: 'u1_w001' } },
      { id: 'e2', user_id: U(1), app_key: 'vocabulary_paraphrase', event_type: 'exercise_result', occurred_at: '2026-10-29T04:00:00Z', metadata: { review_only: true } },
      { id: 'e3', user_id: U(1), app_key: 'vocabulary_paraphrase', event_type: 'app_open', occurred_at: '2026-10-28T04:00:00Z', metadata: { pathway_id: 'meaning' } },
      { id: 'e4', user_id: U(1), app_key: 'other_app', event_type: 'exercise_result', occurred_at: '2026-10-27T04:00:00Z', metadata: { pathway_id: 'meaning' } },
      { id: 'e5', user_id: U(1), app_key: 'vocabulary_paraphrase', event_type: 'exercise_result', occurred_at: '2026-08-01T04:00:00Z', metadata: { pathway_id: 'meaning' } },
      { id: 'e6', user_id: U(2), app_key: 'vocabulary_paraphrase', event_type: 'exercise_result', occurred_at: '2026-10-31T04:00:00Z', metadata: { pathway_id: 'context' } }
    ]
  };
}
const SINCE = '2026-09-01';
const callsFor = (calls, table) => calls.filter(c => c.table === table);

// ---- loader --------------------------------------------------------------------------------------------------------------
test('profiles: selects only id, role, active for the requested ids and returns only those fields', async () => {
  const db = emulator(fixtures());
  const data = await createSummaryLoader(db)({ ids: [U(1), U(2), U(3), U(4), U(9)], since: SINCE });
  const [call] = callsFor(db.calls, 'profiles');
  assert.equal(call.select, 'id, role, active');
  assert.deepEqual(call.in, [['id', [U(1), U(2), U(3), U(4), U(9)]]]);
  assert.deepEqual(data.profiles.map(p => Object.keys(p).sort()), data.profiles.map(() => ['active', 'id', 'role']));
  assert.deepEqual(data.profiles.map(p => p.id).sort(), [U(1), U(2), U(3), U(4)]);
});

test('occurrences: the query enforces the exported live+active filter and only for the students\' units', async () => {
  const db = emulator(fixtures());
  const data = await createSummaryLoader(db)({ ids: [U(1), U(2)], since: SINCE });
  const [call] = callsFor(db.calls, 'vocabulary_unit_occurrences');
  assert.deepEqual(call.eq, [['status', LIVE_OCCURRENCE_FILTER.status], ['active', LIVE_OCCURRENCE_FILTER.active]]);
  assert.deepEqual(call.eq, [['status', 'live'], ['active', true]]);
  assert.equal(call.select, 'occurrence_id, unit_number, position_in_unit, status, active');
  assert.deepEqual(call.in, [['unit_number', [1, 2]]]);
  assert.ok(data.occurrences.every(row => row.status === 'live' && row.active === true));
  assert.ok(!data.occurrences.some(row => row.occurrence_id === 'u2_draft' || row.occurrence_id === 'u1_inactive'));
  assert.ok(!data.occurrences.some(row => row.unit_number === 9));
  assert.ok(!JSON.stringify(data.occurrences).includes('Secret Title'));
});

test('static: the loader takes the live/active filter from pathway-state.js and writes no filter literals of its own', () => {
  const src = fs.readFileSync(new URL('../supabase/functions/eh-summary/loader.js', import.meta.url), 'utf8');
  assert.match(src, /import \{[^}]*LIVE_OCCURRENCE_FILTER[^}]*\} from '\.\/pathway-state\.js'/);
  assert.doesNotMatch(src, /'live'|"live"|\.eq\(\s*'active'\s*,\s*true/);
  assert.match(src, /LIVE_OCCURRENCE_FILTER\.status/);
  assert.match(src, /LIVE_OCCURRENCE_FILTER\.active/);
});

test('members: supplies the Set membership rows of the students\' units with the planned columns only', async () => {
  const db = emulator(fixtures());
  const data = await createSummaryLoader(db)({ ids: [U(1)], since: SINCE });
  const [call] = callsFor(db.calls, 'vocabulary_set_members');
  assert.equal(call.select, 'unit_number, pathway_id, set_number, position, occurrence_id');
  assert.deepEqual(call.in, [['unit_number', [1]]]);
  assert.equal(data.members.length, 100);
  assert.ok(data.members.every(row => row.unit_number === 1));
  assert.ok(!JSON.stringify(data.members).includes('created_by'));
});

test('students are isolated: Set rows, Unit Checks, merits and events map to the right student and carry no student id', async () => {
  const db = emulator(fixtures());
  const data = await createSummaryLoader(db)({ ids: [U(1), U(2)], since: SINCE });
  assert.deepEqual(Object.keys(data.byStudent).sort(), [U(1), U(2)]);
  const one = data.byStudent[U(1)];
  const two = data.byStudent[U(2)];
  assert.equal(one.setRows.length, 10);
  assert.ok(one.setRows.every(r => r.unit_number === 1));
  assert.equal(two.setRows.length, 3);
  assert.ok(two.setRows.every(r => r.unit_number === 2));
  assert.deepEqual(one.unitChecks, [{ unit_number: 1, attempt_number: 1, score: 8, max_score: 10, completed_at: '2026-10-10T04:00:00Z' }]);
  assert.deepEqual(two.unitChecks, [{ unit_number: 2, attempt_number: 1, score: 5, max_score: 10, completed_at: '2026-10-11T04:00:00Z' }]);
  assert.deepEqual(one.merits, [{ awarded_at: '2026-10-02T04:00:00Z' }, { awarded_at: '2026-10-25T04:00:00Z' }]);
  assert.deepEqual(two.merits, [{ awarded_at: '2026-09-02T04:00:00Z' }]);
  for (const row of [...one.setRows, ...one.unitChecks, ...one.merits, ...two.setRows]) assert.ok(!('student_id' in row) && !('user_id' in row));
});

test('Set rows, Unit Checks and merits are selected with the minimum columns', async () => {
  const db = emulator(fixtures());
  await createSummaryLoader(db)({ ids: [U(1)], since: SINCE });
  assert.equal(callsFor(db.calls, 'vocabulary_pathway_sets')[0].select, 'student_id, unit_number, pathway_id, set_number, stage, phase, status, updated_at');
  assert.equal(callsFor(db.calls, 'vocabulary_unit_check_attempts')[0].select, 'student_id, unit_number, attempt_number, score, max_score, completed_at');
  assert.equal(callsFor(db.calls, 'vocabulary_merit_awards')[0].select, 'student_id, awarded_at');
  for (const table of ['vocabulary_pathway_sets', 'vocabulary_unit_check_attempts', 'vocabulary_merit_awards']) assert.deepEqual(callsFor(db.calls, table)[0].in, [['student_id', [U(1)]]]);
});

test('events: flattened to exactly { event_type, occurred_at, pathway_id }; payload and metadata never reach the result', async () => {
  const db = emulator(fixtures());
  const data = await createSummaryLoader(db)({ ids: [U(1), U(2)], since: SINCE });
  const [call] = callsFor(db.calls, 'activity_events');
  assert.equal(call.select, 'id, user_id, event_type, occurred_at, pathway_id:metadata->>pathway_id');
  assert.deepEqual(call.eq, [['app_key', 'vocabulary_paraphrase'], ['event_type', 'exercise_result']]);
  assert.deepEqual(call.notNull, ['metadata->>pathway_id']);
  assert.deepEqual(data.byStudent[U(1)].events, [{ event_type: 'exercise_result', occurred_at: '2026-10-30T04:00:00Z', pathway_id: 'meaning' }]);
  assert.deepEqual(data.byStudent[U(2)].events, [{ event_type: 'exercise_result', occurred_at: '2026-10-31T04:00:00Z', pathway_id: 'context' }]);
  const text = JSON.stringify(data);
  assert.ok(!text.match(/SECRET|PRIVATE|metadata|activity_id|"id":"e|user_id|school|Fake|answer/));
  for (const events of Object.values(data.byStudent).map(s => s.events)) for (const e of events) assert.deepEqual(Object.keys(e).sort(), ['event_type', 'occurred_at', 'pathway_id']);
});

test('since is applied to event loading as the start of that Asia/Shanghai day', async () => {
  const db = emulator(fixtures());
  const data = await createSummaryLoader(db)({ ids: [U(1)], since: '2026-10-29' });
  const [call] = callsFor(db.calls, 'activity_events');
  assert.deepEqual(call.gte, [['occurred_at', '2026-10-29T00:00:00+08:00']]);
  assert.equal(data.byStudent[U(1)].events.length, 1);
  const wide = await createSummaryLoader(emulator(fixtures()))({ ids: [U(1)], since: '2026-07-01' });
  assert.equal(wide.byStudent[U(1)].events.length, 2);          // includes the August event once the window is wide enough
});

test('without since, events are not loaded and are left unknown (engagement is then omitted by the summary)', async () => {
  const db = emulator(fixtures());
  const data = await createSummaryLoader(db)({ ids: [U(1)], since: undefined });
  assert.equal(callsFor(db.calls, 'activity_events').length, 0);
  assert.ok(!('events' in data.byStudent[U(1)]));
});

test('only active student profiles have evidence read', async () => {
  const db = emulator(fixtures());
  const data = await createSummaryLoader(db)({ ids: [U(1), U(3), U(4), U(9)], since: SINCE });
  assert.deepEqual(Object.keys(data.byStudent), [U(1)]);
  for (const table of ['vocabulary_pathway_sets', 'vocabulary_unit_check_attempts', 'vocabulary_merit_awards']) assert.deepEqual(callsFor(db.calls, table)[0].in, [['student_id', [U(1)]]]);
  assert.deepEqual(callsFor(db.calls, 'activity_events')[0].in, [['user_id', [U(1)]]]);
});

test('no active students: nothing but the profile query runs', async () => {
  const db = emulator(fixtures());
  const data = await createSummaryLoader(db)({ ids: [U(3), U(4), U(9)], since: SINCE });
  assert.deepEqual(db.calls.map(c => c.table), ['profiles']);
  assert.deepEqual(data.byStudent, {});
  assert.deepEqual(data.members, []);
  assert.deepEqual(data.occurrences, []);
});

test('paging: every row is read across pages in a stable order, and a runaway table fails closed', async () => {
  const many = Array.from({ length: 25 }, (_, i) => ({ student_id: U(1), merit_number: i + 1, awarded_by: U(4), awarded_at: `2026-10-${String(1 + (i % 28)).padStart(2, '0')}T04:00:00Z` }));
  const base = { ...fixtures(), vocabulary_merit_awards: many };
  const data = await createSummaryLoader(emulator(base), { pageSize: 10 })({ ids: [U(1)], since: SINCE });
  assert.equal(data.byStudent[U(1)].merits.length, 25);
  const db = emulator(base);
  await createSummaryLoader(db, { pageSize: 10 })({ ids: [U(1)], since: SINCE });
  assert.ok(callsFor(db.calls, 'vocabulary_merit_awards').every(c => c.order.length >= 1));
  await assert.rejects(createSummaryLoader(emulator(base), { pageSize: 1, maxPages: 3 })({ ids: [U(1)], since: SINCE }));
});

test('a database error on any table rejects with no row contents in the error', async () => {
  for (const table of ['profiles', 'vocabulary_set_members', 'vocabulary_unit_occurrences', 'vocabulary_pathway_sets', 'vocabulary_unit_check_attempts', 'vocabulary_merit_awards', 'activity_events']) {
    await assert.rejects(createSummaryLoader(emulator(fixtures(), { failTable: table }))({ ids: [U(1)], since: SINCE }), err => !String(err.message).includes('001234') && !String(err.message).includes('secret'), table);
  }
});

// ---- through the H3 handler ----------------------------------------------------------------------------------------------
const request = body => new Request('https://example.test/eh-summary', { method: 'POST', headers: { 'content-type': 'application/json', 'x-eh-service-key': KEY }, body: JSON.stringify({ action: 'summary', schemaVersion: 1, ...body }) });
const run = (body, db = emulator(fixtures())) => handleSummaryRequest(request(body), { env: { EH_SERVICE_KEY: KEY }, loadSummaryData: createSummaryLoader(db), now: () => NOW });

test('end to end: activation, pairs, Unit Checks, merits and engagement come out for the right students', async () => {
  const r = await (await run({ students: [U(1), U(2)], since: SINCE })).json();
  const [a, b] = r.results;
  assert.equal(a.status, 'ok');
  assert.deepEqual(a.activation, { requiredPairs: 2, completedPairs: 2, activated: true });
  assert.deepEqual(a.pairs.map(p => `${p.unit}:${p.pathway}:${p.state}`), ['1:meaning:mastered', '1:context:mastered']);
  assert.deepEqual(a.merits, { count: 2, latestAwardedOn: '2026-10-25' });
  assert.deepEqual(a.engagement, { lastActiveOn: '2026-10-30', activeDays8w: 2, activeWeeks8w: 2 });
  assert.deepEqual(b.pairs.map(p => `${p.unit}:${p.pathway}:${p.state}`), ['2:meaning:in_progress']);
  assert.equal(b.activation.activated, false);
});

test('uppercase uuids are normalised before the loader and results are keyed lower case', async () => {
  const db = emulator(fixtures());
  const r = await (await run({ students: [U(1).toUpperCase()], since: SINCE }, db)).json();
  assert.equal(r.results[0].hubStudentId, U(1));
  assert.equal(r.results[0].status, 'ok');
  assert.deepEqual(callsFor(db.calls, 'profiles')[0].in, [['id', [U(1)]]]);
});

test('an active student with no evidence rows is ok with an empty, not-activated summary', async () => {
  const empty = { ...fixtures(), vocabulary_pathway_sets: [], vocabulary_unit_check_attempts: [], vocabulary_merit_awards: [], activity_events: [] };
  const r = await (await run({ students: [U(1)], since: SINCE }, emulator(empty))).json();
  assert.equal(r.results[0].status, 'ok');
  assert.deepEqual(r.results[0].activation, { requiredPairs: 2, completedPairs: 0, activated: false });
  assert.deepEqual(r.results[0].pairs, []);
  assert.deepEqual(r.results[0].merits, { count: 0 });
  assert.deepEqual(r.results[0].engagement, { activeDays8w: 0, activeWeeks8w: 0 });
  assert.ok(!('unitChecks' in r.results[0]));
});

test('without since the engagement window counts are not reported', async () => {
  const r = await (await run({ students: [U(1)] })).json();
  assert.ok(!('engagement' in r.results[0]));
});

test('a database failure is a neutral 503 through the handler with no detail', async () => {
  for (const failTable of ['profiles', 'activity_events', 'vocabulary_set_members']) {
    const res = await run({ students: [U(1)], since: SINCE }, emulator(fixtures(), { failTable }));
    assert.equal(res.status, 503);
    const text = await res.text();
    assert.deepEqual(JSON.parse(text), { ok: false, error: 'unavailable' });
    assert.ok(!text.includes('001234') && !text.includes('secret'));
  }
});

test('the full reply never carries identity, answers, notes, titles, form ids, awarded_by, payloads or foreign ids', async () => {
  const text = await (await run({ students: [U(1), U(2), U(3), U(4)], since: SINCE })).text();
  assert.ok(!text.includes('@'));
  assert.ok(!text.match(/SECRET|PRIVATE|Secret Title|Fake|school|email|display|form_id|awarded_by|answer|metadata|role|teacher|"active":/i));
  const ids = new Set(text.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g));
  assert.deepEqual([...ids].sort(), [U(1), U(2), U(3), U(4)].sort());
});

// ---- entry point and runtime ---------------------------------------------------------------------------------------------
test('index.ts only wires the handler to the loader, the service key and a service-role client; it holds no queries', () => {
  const src = fs.readFileSync(new URL('../supabase/functions/eh-summary/index.ts', import.meta.url), 'utf8');
  assert.match(src, /from '\.\/handler\.js'/);
  assert.match(src, /from '\.\/loader\.js'/);
  assert.match(src, /EH_SERVICE_KEY: Deno\.env\.get\('EH_SERVICE_KEY'\)/);
  assert.match(src, /SUPABASE_SECRET_KEYS/);
  assert.match(src, /Deno\.serve/);
  assert.doesNotMatch(src, /\.from\(|\.select\(|console\./);
  assert.doesNotMatch(src, /x-eh-service-key|timingSafeEqual/i);          // auth stays in H3
});

test('no forbidden column or table is named in the loader or entry point, and nothing is logged', () => {
  for (const rel of ['loader.js', 'index.ts']) {
    const src = fs.readFileSync(new URL(`../supabase/functions/eh-summary/${rel}`, import.meta.url), 'utf8');
    assert.doesNotMatch(src, /contextual_evidence|school_email|display_name|form_id|awarded_by|completed_stages|weak_target_ids|history|vocabulary_global_mastery|vocabulary_unit_mastery|vocabulary_missions|learning_interventions|console\./, rel);
  }
});

test('the shared auth module only needs node:crypto', () => {
  const src = fs.readFileSync(new URL('../supabase/functions/_shared/eh-service-auth.js', import.meta.url), 'utf8');
  const imports = [...src.matchAll(/^\s*import[^;]*from\s+'([^']+)'/gm)].map(m => m[1]);
  assert.deepEqual(imports, ['node:crypto']);
});

const DENO = process.env.DENO_BIN || (spawnSync('deno', ['--version']).status === 0 ? 'deno' : null);
test('shared auth and the handler load and make the same decisions under a real Deno runtime', { skip: DENO ? false : 'deno not installed (set DENO_BIN to run this check)' }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eh-deno-'));
  const script = path.join(dir, 'check.mjs');
  const root = path.resolve(new URL('..', import.meta.url).pathname);
  fs.writeFileSync(script, `
import { authorizeServiceRequest, MIN_SECRET_LENGTH } from 'file://${root}/supabase/functions/_shared/eh-service-auth.js';
import { handleSummaryRequest } from 'file://${root}/supabase/functions/eh-summary/handler.js';
const KEY = 'k'.repeat(40);
const mk = key => new Request('https://x.test/', { method: 'POST', headers: key === null ? {} : { 'x-eh-service-key': key }, body: '{}' });
const r = await handleSummaryRequest(new Request('https://x.test/', { method: 'POST', headers: { 'x-eh-service-key': KEY, 'content-type': 'application/json' }, body: JSON.stringify({ action: 'summary', schemaVersion: 1, students: ['${U(1)}'] }) }), { env: { EH_SERVICE_KEY: KEY }, loadSummaryData: async () => ({ profiles: [{ id: '${U(1)}', role: 'student', active: true }], members: [], occurrences: [], byStudent: {} }) });
console.log(JSON.stringify({ min: MIN_SECRET_LENGTH, ok: authorizeServiceRequest(mk(KEY), { EH_SERVICE_KEY: KEY }), wrong: authorizeServiceRequest(mk('x'.repeat(40)), { EH_SERVICE_KEY: KEY }).status, missing: authorizeServiceRequest(mk(null), { EH_SERVICE_KEY: KEY }).status, short: authorizeServiceRequest(mk('abc'), { EH_SERVICE_KEY: 'abc' }).status, handler: r.status, student: (await r.json()).results[0].status }));
`);
  const out = spawnSync(DENO, ['run', '--no-prompt', `--allow-read=${root},${dir}`, script], { encoding: 'utf8' });
  assert.equal(out.status, 0, out.stderr);
  assert.deepEqual(JSON.parse(out.stdout.trim().split('\n').pop()), { min: 32, ok: null, wrong: 401, missing: 401, short: 503, handler: 200, student: 'ok' });
});

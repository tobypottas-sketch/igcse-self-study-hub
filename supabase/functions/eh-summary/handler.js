// Request handling for eh-summary. Pure apart from the injected loader and clock; never logs; no database or network access.
//
// POST { action:'summary', schemaVersion:1, students:[<hub profile uuid>...], since?:'YYYY-MM-DD' }
//   -> { ok:true, schemaVersion:1, generatedAt, results:[{ hubStudentId, status:'ok'|'not_found'|'inactive', ...summary }] }
// `loadSummaryData({ ids, since })` is supplied by the Edge wiring (H4) and returns
//   { profiles:[{ id, role, active }], members, occurrences, byStudent:{ [id]:{ setRows, unitChecks, merits, events } } }.
// Only id, role and active are read from a profile; nothing else about a profile can reach the reply. Every result is built from
// deriveSummary's whitelisted output.
import { authorizeServiceRequest } from '../_shared/eh-service-auth.js';
import { deriveSummary } from './derive.js';

export const MAX_STUDENTS = 50;
export const SCHEMA_VERSION = 1;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function reply(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}

function validStudents(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_STUDENTS) return null;
  const ids = [];
  const seen = new Set();
  for (const item of value) {
    if (typeof item !== 'string' || !UUID.test(item)) return null;
    const id = item.toLowerCase();
    if (seen.has(id)) return null;
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

function validSince(value) {
  if (value === undefined) return { ok: true, since: undefined };
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return { ok: false };
  const ms = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(ms) && new Date(ms).toISOString().slice(0, 10) === value ? { ok: true, since: value } : { ok: false };
}

export async function handleSummaryRequest(req, deps) {
  try {
    if (req.method !== 'POST') return reply(405, { ok: false, error: 'method_not_allowed' });
    const denied = authorizeServiceRequest(req, deps?.env);
    if (denied) return reply(denied.status, denied.body);

    let body;
    try { body = await req.json(); } catch { return reply(400, { ok: false, error: 'bad_request' }); }
    if (!body || typeof body !== 'object' || body.action !== 'summary' || body.schemaVersion !== SCHEMA_VERSION) return reply(400, { ok: false, error: 'bad_request' });
    const ids = validStudents(body.students);
    const since = validSince(body.since);
    if (!ids || !since.ok) return reply(400, { ok: false, error: 'bad_request' });

    const data = await deps.loadSummaryData({ ids, since: since.since });
    if (!data || typeof data !== 'object' || !Array.isArray(data.profiles)) throw new Error('bad loader result');
    const profiles = new Map();
    for (const profile of data.profiles) if (profile && typeof profile.id === 'string') profiles.set(profile.id.toLowerCase(), profile);

    const now = typeof deps.now === 'function' ? deps.now() : new Date().toISOString();
    const results = ids.map(id => {
      const profile = profiles.get(id);
      if (!profile || profile.role !== 'student') return { hubStudentId: id, status: 'not_found' };
      if (profile.active !== true) return { hubStudentId: id, status: 'inactive' };
      const rows = data.byStudent?.[id] ?? {};
      const summary = deriveSummary({
        members: data.members, occurrences: data.occurrences,
        setRows: rows.setRows, unitChecks: rows.unitChecks, merits: rows.merits, events: rows.events,
        now, since: since.since
      });
      return { hubStudentId: id, status: 'ok', ...summary };
    });
    return reply(200, { ok: true, schemaVersion: SCHEMA_VERSION, generatedAt: now, results });
  } catch {
    return reply(503, { ok: false, error: 'unavailable' });
  }
}

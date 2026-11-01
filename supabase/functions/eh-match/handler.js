// Request handling for eh-match. Pure apart from the injected loader; never logs.
import { createHash, timingSafeEqual } from 'node:crypto';
import { buildMatchResults, canonicalStudentNumber } from './match.js';

export const MIN_SECRET_LENGTH = 32;
export const MAX_NUMBERS = 500;

function reply(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}

const digest = value => createHash('sha256').update(String(value)).digest();

function keyMatches(provided, expected) {
  return timingSafeEqual(digest(provided ?? ''), digest(expected));
}

function validNumbers(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_NUMBERS) return null;
  const seen = new Set();
  for (const item of value) {
    if (typeof item !== 'string' || canonicalStudentNumber(item) !== item || seen.has(item)) return null;
    seen.add(item);
  }
  return value;
}

export async function handleMatchRequest(req, deps) {
  try {
    if (req.method !== 'POST') return reply(405, { ok: false, error: 'method_not_allowed' });
    const secret = deps?.env?.EH_SERVICE_KEY;
    if (typeof secret !== 'string' || secret.length < MIN_SECRET_LENGTH) return reply(503, { ok: false, error: 'unavailable' });
    if (!keyMatches(req.headers.get('x-eh-service-key'), secret)) return reply(401, { ok: false, error: 'unauthorized' });

    let body;
    try { body = await req.json(); } catch { return reply(400, { ok: false, error: 'bad_request' }); }
    if (!body || body.action !== 'match') return reply(400, { ok: false, error: 'bad_request' });
    const numbers = validNumbers(body.numbers);
    if (!numbers) return reply(400, { ok: false, error: 'bad_request' });

    const profiles = (await deps.loadStudentProfiles()).filter(p => p && p.role === 'student' && p.active === true);
    return reply(200, { ok: true, results: buildMatchResults(numbers, profiles) });
  } catch {
    return reply(503, { ok: false, error: 'unavailable' });
  }
}

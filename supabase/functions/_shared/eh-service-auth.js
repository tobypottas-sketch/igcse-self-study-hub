// Shared-secret check for server-to-server Evidence Hub calls. Pure: no I/O, no logging, no secrets in any result.
// Same decision order and neutral bodies as eh-match: a missing or short secret is a misconfiguration (503, never authorises),
// a missing or wrong key is 401. The caller sends the key in the x-eh-service-key header.
import { createHash, timingSafeEqual } from 'node:crypto';

export const MIN_SECRET_LENGTH = 32;
export const SERVICE_KEY_HEADER = 'x-eh-service-key';

const digest = value => createHash('sha256').update(String(value)).digest();

function keyMatches(provided, expected) {
  return timingSafeEqual(digest(provided ?? ''), digest(expected));
}

// -> null when the request is authorised, otherwise { status, body } for the caller to send.
export function authorizeServiceRequest(req, env) {
  const secret = env?.EH_SERVICE_KEY;
  if (typeof secret !== 'string' || secret.length < MIN_SECRET_LENGTH) return { status: 503, body: { ok: false, error: 'unavailable' } };
  if (!keyMatches(req.headers.get(SERVICE_KEY_HEADER), secret)) return { status: 401, body: { ok: false, error: 'unauthorized' } };
  return null;
}

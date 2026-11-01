export const RETURN_TARGET_KEY = 'igcse-hub.return-target';
export const RETURN_TARGET_TTL_MS = 15 * 60 * 1000;

const TARGET_TOKEN = 'vocabulary';
const TARGET_PATH = 'vocabulary.html';

export function storeVocabularyReturnTarget(storage, now = Date.now()) {
  try {
    storage.setItem(RETURN_TARGET_KEY, JSON.stringify({ target: TARGET_TOKEN, storedAt: now }));
    return true;
  } catch {
    return false;
  }
}

export function clearReturnTarget(storage) {
  try { storage.removeItem(RETURN_TARGET_KEY); } catch { /* storage unavailable: nothing to clear */ }
}

export function takeReturnPath(storage, now = Date.now()) {
  let raw = null;
  try { raw = storage.getItem(RETURN_TARGET_KEY); } catch { return null; }
  clearReturnTarget(storage);
  if (typeof raw !== 'string') return null;
  let value;
  try { value = JSON.parse(raw); } catch { return null; }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const keys = Object.keys(value);
  if (keys.length !== 2 || !keys.includes('target') || !keys.includes('storedAt')) return null;
  if (value.target !== TARGET_TOKEN) return null;
  if (typeof value.storedAt !== 'number' || !Number.isFinite(value.storedAt)) return null;
  const age = now - value.storedAt;
  if (age < 0 || age > RETURN_TARGET_TTL_MS) return null;
  return TARGET_PATH;
}

export function redirectToHubSignIn(storage, location, now = Date.now()) {
  storeVocabularyReturnTarget(storage, now);
  location.replace('./');
}

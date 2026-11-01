// Pure matching logic for the eh-match function. No I/O, no imports.
// The canonical rule is mirrored by the Evidence Hub (02_BACKEND_NODE_API/src/vocabulary-links/canonical.js);
// both repos pin it with the same fixture table.

export const MAX_CANDIDATES = 5;

export function canonicalStudentNumber(raw) {
  let text;
  if (typeof raw === 'string') text = raw;
  else if (typeof raw === 'number' && Number.isInteger(raw)) text = String(raw);
  else return null;
  text = text.trim();
  if (!/^[0-9]+$/.test(text)) return null;
  const stripped = text.replace(/^0+/, '');
  if (stripped.length < 3 || stripped.length > 6) return null;
  return stripped;
}

export function deriveHubNumber(email) {
  if (typeof email !== 'string') return null;
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return canonicalStudentNumber(parts[0]);
}

// profiles: already filtered to active students by the caller. Returns every requested number as a key.
export function buildMatchResults(numbers, profiles) {
  const wanted = new Set(numbers);
  const byNumber = new Map();
  for (const profile of Array.isArray(profiles) ? profiles : []) {
    const number = deriveHubNumber(profile?.school_email);
    if (!number || !wanted.has(number)) continue;
    if (typeof profile.id !== 'string' || typeof profile.display_name !== 'string') continue;
    if (!byNumber.has(number)) byNumber.set(number, []);
    byNumber.get(number).push({ profileId: profile.id, displayName: profile.display_name });
  }
  const results = {};
  for (const number of numbers) {
    const list = (byNumber.get(number) ?? []).sort((a, b) => (a.profileId < b.profileId ? -1 : a.profileId > b.profileId ? 1 : 0));
    results[number] = list.slice(0, MAX_CANDIDATES);
  }
  return results;
}

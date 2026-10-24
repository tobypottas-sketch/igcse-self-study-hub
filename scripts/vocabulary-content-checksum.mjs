// Job 9 (Part 12): canonical-content checksum + version guard.
//
// The Unit 1 release (content/vocabulary/releases/unit-01.js) is built from the canonical JavaScript sources under content/vocabulary/units/.
// Every derived artefact (Set membership SQL, the review sheets) must come from that release. This script fingerprints the release:
//   * contentChecksum   - sha256 of the canonical JSON of everything a student can be served (items, occurrences, contexts, activities)
//   * membershipChecksum - sha256 of the ordered Set membership the app computes from it
// The committed lock file records both. tests/vocabulary-content-drift.test.js fails when the release changes but the lock (and therefore the
// generated migration, which carries the same membership checksum in its header) was not regenerated. Re-run with --write to accept a change.
import crypto from 'node:crypto';
import fs from 'node:fs';
import unit1 from '../content/vocabulary/releases/unit-01.js';
import { membershipRows } from './generate-set-membership-sql.mjs';

export const LOCK_FILE = new URL('../content/vocabulary/units/unit-01.content-lock.json', import.meta.url);
export const CONTENT_VERSION = 'unit-01/job9';

// Stable JSON: object keys sorted, arrays kept in authored order (order is meaningful: Sets are consecutive blocks of 10).
export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().filter(key => value[key] !== undefined).map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
const sha = text => crypto.createHash('sha256').update(text).digest('hex');

export function releaseFingerprint(release = unit1) {
  const content = { items: release.items, occurrences: release.occurrences, contexts: release.contexts, activities: release.activities };
  const members = membershipRows([release]).map(row => `${row.unit}|${row.pathway}|${row.set}|${row.position}|${row.occurrenceId}`).join('\n');
  return { version: CONTENT_VERSION, contentChecksum: sha(canonicalJson(content)), membershipChecksum: sha(members), words: release.occurrences.length, memberRows: membershipRows([release]).length };
}
export function readLock() { return JSON.parse(fs.readFileSync(LOCK_FILE, 'utf8')); }

if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file://').href) {
  const fingerprint = releaseFingerprint();
  if (process.argv.includes('--write')) { fs.writeFileSync(LOCK_FILE, `${JSON.stringify(fingerprint, null, 2)}\n`); console.log('lock written', fingerprint); }
  else console.log(JSON.stringify(fingerprint, null, 2));
}

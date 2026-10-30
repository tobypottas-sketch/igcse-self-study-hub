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
import { membershipRows, membershipChecksum, CONTENT_VERSION, RELEASES, releaseFor } from './generate-set-membership-sql.mjs';
import { lockFileFor, contentVersionFor, padUnit } from './vocabulary-releases.mjs';

// One lock file per released unit (units/unit-NN.content-lock.json). LOCK_FILE / CONTENT_VERSION stay as Unit 1's.
export const LOCK_FILE = lockFileFor(1);
export { CONTENT_VERSION, lockFileFor };
const unit1 = releaseFor(1);

// Stable JSON: object keys sorted, arrays kept in authored order (order is meaningful: Sets are consecutive blocks of 10).
export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().filter(key => value[key] !== undefined).map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
const sha = text => crypto.createHash('sha256').update(text).digest('hex');

export function releaseFingerprint(release = unit1) {
  const version = contentVersionFor(release.unitNumber);
  const content = { items: release.items, occurrences: release.occurrences, contexts: release.contexts, activities: release.activities };
  return { version, contentChecksum: sha(canonicalJson(content)), membershipChecksum: membershipChecksum(membershipRows([release])), words: release.occurrences.length, memberRows: membershipRows([release]).length };
}
export function readLock(unitNumber = 1) { return JSON.parse(fs.readFileSync(lockFileFor(unitNumber), 'utf8')); }

if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file://').href) {
  // Default: Unit 1 (unchanged). --unit N: one released unit. --all: every released unit, each to its own lock file.
  const flag = process.argv.indexOf('--unit');
  const targets = process.argv.includes('--all') ? RELEASES : flag > 0 ? [releaseFor(Number(process.argv[flag + 1]))] : [unit1];
  if (targets.some(release => !release)) { console.error('That unit has no release (content/vocabulary/releases/unit-NN.js).'); process.exit(1); }
  for (const release of targets) {
    const fingerprint = releaseFingerprint(release);
    if (process.argv.includes('--write')) { fs.writeFileSync(lockFileFor(release.unitNumber), `${JSON.stringify(fingerprint, null, 2)}\n`); console.log(`lock written (unit ${padUnit(release.unitNumber)})`, fingerprint); }
    else console.log(JSON.stringify(fingerprint, null, 2));
  }
}

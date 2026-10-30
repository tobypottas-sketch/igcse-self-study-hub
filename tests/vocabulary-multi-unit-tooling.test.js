// Multi-unit content tooling: released units are discovered from releases/unit-NN.js, each gets its own sync SQL, membership and lock;
// Unit 1 output is unchanged; a draft is never treated as released. The "Unit 2" here is SYNTHETIC (a relabelled clone of Unit 1 in a temp dir).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import unit1 from '../content/vocabulary/releases/unit-01.js';
import { loadReleases, releaseNumbers, lockFileFor, contentVersionFor, syncChunkNameFor } from '../scripts/vocabulary-releases.mjs';
import { releaseFingerprint, readLock } from '../scripts/vocabulary-content-checksum.mjs';
import { membershipRows, membershipChecksum } from '../scripts/generate-set-membership-sql.mjs';
import { generatedChunks, outFile } from '../scripts/generate-unit1-sync-sql.mjs';

const REAL = new URL('../content/vocabulary/releases/', import.meta.url).pathname;
// Relabel Unit 1 as unit n: unit number/title, and every id string (vocab_, u1_, ...) gets an x<n>_ prefix so ids stay internally consistent.
const relabel = (json, n) => json.replaceAll('"unitNumber":1', `"unitNumber":${n}`).replaceAll('"unitTitle":"Sports and Free Time"', '"unitTitle":"Digital Life"')
  .replace(/"((?:vocab_|u1_)[^"]*)"/g, (_, v) => `"x${n}_${v}"`);
function tempReleases(extra = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vocab-releases-'));
  fs.writeFileSync(path.join(dir, 'unit-01.js'), `export { default } from ${JSON.stringify(path.join(REAL, 'unit-01.js'))};\n`);
  for (const [name, source] of Object.entries(extra)) fs.writeFileSync(path.join(dir, name), source);
  return dir;
}
const synthetic = n => `export default ${relabel(JSON.stringify(unit1), n)};\n`;

test('the real repo discovers Unit 1 only, and its generated output equals the committed lock and chunk files', async () => {
  assert.deepEqual(releaseNumbers(REAL), [1]);
  const releases = await loadReleases(REAL);
  assert.equal(releases.length, 1);
  assert.equal(releases[0].release, unit1);
  const lock = readLock(1);
  assert.deepEqual(releaseFingerprint(unit1), { version: lock.version, contentChecksum: lock.contentChecksum, membershipChecksum: lock.membershipChecksum, words: lock.words, memberRows: lock.memberRows });
  assert.equal(lock.version, 'unit-01/job9');
  for (const { number, text } of generatedChunks(1)) assert.equal(text, fs.readFileSync(outFile(number), 'utf8'), `Unit 1 chunk ${number} must be unchanged`);
  assert.match(outFile(1).pathname, /job9-unit-01-sync-chunk-1\.sql$/);
});

test('each unit gets its own lock file, version and chunk names (Unit 1 keeps its legacy names)', () => {
  assert.match(lockFileFor(1).pathname, /units\/unit-01\.content-lock\.json$/);
  assert.match(lockFileFor(2).pathname, /units\/unit-02\.content-lock\.json$/);
  assert.notEqual(lockFileFor(1).href, lockFileFor(2).href);
  assert.equal(contentVersionFor(1), 'unit-01/job9');
  assert.equal(contentVersionFor(2), 'unit-02/v1');
  assert.equal(syncChunkNameFor(1, 3), 'job9-unit-01-sync-chunk-3.sql');
  assert.equal(syncChunkNameFor(2, 3), 'unit-02-sync-chunk-3.sql');
});

test('a release file for Unit 2 is discovered as soon as it exists, and is handled independently of Unit 1', async () => {
  const dir = tempReleases({ 'unit-02.js': synthetic(2) });
  const releases = await loadReleases(dir);
  assert.deepEqual(releases.map(r => r.unitNumber), [1, 2]);
  const two = releases[1].release;
  assert.equal(two.unitNumber, 2);
  // separate fingerprints/versions; Unit 1's is untouched by Unit 2 existing
  const f1 = releaseFingerprint(unit1), f2 = releaseFingerprint(two);
  assert.equal(f1.version, 'unit-01/job9');
  assert.equal(f2.version, 'unit-02/v1');
  assert.notEqual(f1.contentChecksum, f2.contentChecksum);
  assert.notEqual(f1.membershipChecksum, f2.membershipChecksum);
  assert.equal(f2.words, f1.words);
  // membership rows are per unit and carry their own unit number
  const rows2 = membershipRows([two]);
  assert.ok(rows2.length > 0 && rows2.every(row => row.unit === 2));
  assert.equal(membershipChecksum(membershipRows([unit1])), f1.membershipChecksum);
  assert.equal(membershipRows([unit1, two]).length, membershipRows([unit1]).length + rows2.length);
  // its own sync SQL, built from its own release file, with its own header and no Unit 1 text
  const chunks = generatedChunks(2, dir);
  assert.ok(chunks.length >= 1);
  assert.match(chunks[0].text, /^-- Unit 2 content sync, part 1 of \d+\./);
  assert.ok(!chunks.some(chunk => /Unit 1 content sync|'u1_01_leisure|'vocab_leisure/.test(chunk.text)));
  assert.ok(chunks.every(chunk => chunk.text.includes('x2_vocab_')));
  assert.notEqual(outFile(1, 2).href, outFile(1, 1).href);
});

test('drafts are not released: only releases/unit-NN.js is scanned, and a non-live or mismatched release is refused', async () => {
  const dir = tempReleases({ 'unit-02-draft.js': synthetic(2), 'notes.js': 'export default {}' });
  assert.deepEqual(releaseNumbers(dir), [1]);                          // a *-draft file is invisible
  assert.deepEqual((await loadReleases(dir)).map(r => r.unitNumber), [1]);
  await assert.rejects(loadReleases(tempReleases({ 'unit-02.js': synthetic(2).replace('"status":"live"', '"status":"draft"') })), /not a live release/);
  await assert.rejects(loadReleases(tempReleases({ 'unit-03.js': synthetic(2) })), /file number and the unit number must match/);
  // the real draft stays out of the real release folder
  assert.ok(!fs.existsSync(path.join(REAL, 'unit-02.js')));
});

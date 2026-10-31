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

test('the real repo discovers Units 1, 2, 3, 4, 5 and 6, and each unit’s generated output equals its committed lock and chunk files', async () => {
  assert.deepEqual(releaseNumbers(REAL), [1, 2, 3, 4, 5, 6]);
  const releases = await loadReleases(REAL);
  assert.equal(releases.length, 6);
  assert.equal(releases[0].release, unit1);
  const lock = readLock(1);
  assert.deepEqual(releaseFingerprint(unit1), { version: lock.version, contentChecksum: lock.contentChecksum, membershipChecksum: lock.membershipChecksum, words: lock.words, memberRows: lock.memberRows });
  assert.equal(lock.version, 'unit-01/job9');
  for (const { number, text } of generatedChunks(1)) assert.equal(text, fs.readFileSync(outFile(number), 'utf8'), `Unit 1 chunk ${number} must be unchanged`);
  assert.match(outFile(1).pathname, /job9-unit-01-sync-chunk-1\.sql$/);
  const unit2 = releases[1].release;
  const lock2 = readLock(2);
  assert.deepEqual(releaseFingerprint(unit2), { version: lock2.version, contentChecksum: lock2.contentChecksum, membershipChecksum: lock2.membershipChecksum, words: lock2.words, memberRows: lock2.memberRows });
  assert.equal(lock2.version, 'unit-02/v1');
  assert.equal(lock2.words, 50);
  for (const { number, text } of generatedChunks(2)) assert.equal(text, fs.readFileSync(outFile(number, 2), 'utf8'), `Unit 2 chunk ${number} must match the committed file`);
  const unit3 = releases[2].release;
  const lock3 = readLock(3);
  assert.deepEqual(releaseFingerprint(unit3), { version: lock3.version, contentChecksum: lock3.contentChecksum, membershipChecksum: lock3.membershipChecksum, words: lock3.words, memberRows: lock3.memberRows });
  assert.equal(lock3.version, 'unit-03/v1');
  assert.equal(lock3.words, 50);
  for (const { number, text } of generatedChunks(3)) assert.equal(text, fs.readFileSync(outFile(number, 3), 'utf8'), `Unit 3 chunk ${number} must match the committed file`);
  const unit4 = releases[3].release;
  const lock4 = readLock(4);
  assert.deepEqual(releaseFingerprint(unit4), { version: lock4.version, contentChecksum: lock4.contentChecksum, membershipChecksum: lock4.membershipChecksum, words: lock4.words, memberRows: lock4.memberRows });
  assert.equal(lock4.version, 'unit-04/v1');
  assert.equal(lock4.words, 50);
  for (const { number, text } of generatedChunks(4)) assert.equal(text, fs.readFileSync(outFile(number, 4), 'utf8'), `Unit 4 chunk ${number} must match the committed file`);
  const unit5 = releases[4].release;
  const lock5 = readLock(5);
  assert.deepEqual(releaseFingerprint(unit5), { version: lock5.version, contentChecksum: lock5.contentChecksum, membershipChecksum: lock5.membershipChecksum, words: lock5.words, memberRows: lock5.memberRows });
  assert.equal(lock5.version, 'unit-05/v1');
  assert.equal(lock5.words, 50);
  for (const { number, text } of generatedChunks(5)) assert.equal(text, fs.readFileSync(outFile(number, 5), 'utf8'), `Unit 5 chunk ${number} must match the committed file`);
  const unit6 = releases[5].release;
  const lock6 = readLock(6);
  assert.deepEqual(releaseFingerprint(unit6), { version: lock6.version, contentChecksum: lock6.contentChecksum, membershipChecksum: lock6.membershipChecksum, words: lock6.words, memberRows: lock6.memberRows });
  assert.equal(lock6.version, 'unit-06/v1');
  assert.equal(lock6.words, 50);
  assert.equal(lock6.memberRows, 250);
  for (const { number, text } of generatedChunks(6)) assert.equal(text, fs.readFileSync(outFile(number, 6), 'utf8'), `Unit 6 chunk ${number} must match the committed file`);
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
  await assert.rejects(loadReleases(tempReleases({ 'unit-05.js': synthetic(2) })), /file number and the unit number must match/);
  // the real Unit 2 release exists and is live; no draft file sits in the real release folder
  assert.ok(fs.existsSync(path.join(REAL, 'unit-02.js')));
  assert.ok(!fs.readdirSync(REAL).some(name => /draft/.test(name)));
});

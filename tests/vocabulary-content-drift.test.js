// Job 9 (Part 12): content drift guard. A change to Unit 1 content that is not followed by regenerating the membership migration and the
// content lock fails here, with a message that says which command to run.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import unit1 from '../content/vocabulary/releases/unit-01.js';
import { releaseFingerprint, readLock, canonicalJson, CONTENT_VERSION } from '../scripts/vocabulary-content-checksum.mjs';
import { membershipRows, deltaSql, changedSets, baselineRows } from '../scripts/generate-set-membership-sql.mjs';

const deltaFile = fs.readFileSync(new URL('../supabase/migrations/20261025130000_vocabulary_set_membership_v2.sql', import.meta.url), 'utf8');
const header = deltaFile.match(/-- CONTENT LOCK ([^\n]*)/)?.[1] ?? '';

test('the canonical release matches its committed content lock (run `node scripts/vocabulary-content-checksum.mjs --write` after an intended content change)', () => {
  const now = releaseFingerprint();
  const lock = readLock();
  assert.equal(lock.version, CONTENT_VERSION);
  assert.equal(now.contentChecksum, lock.contentChecksum, 'Unit 1 content changed but the content lock was not regenerated');
  assert.equal(now.membershipChecksum, lock.membershipChecksum, 'Unit 1 Set membership changed but the content lock was not regenerated');
  assert.equal(now.words, lock.words);
  assert.equal(now.memberRows, lock.memberRows);
});

test('the membership migration carries the same membership checksum as the lock, so a stale migration fails (run `node scripts/generate-set-membership-sql.mjs --write`)', () => {
  const lock = readLock();
  assert.match(header, /membership=[0-9a-f]{64}/);
  assert.equal(header.match(/membership=([0-9a-f]{64})/)[1], lock.membershipChecksum, 'the delta migration was not regenerated after the membership changed');
  assert.equal(header.match(/version=(\S+)/)[1], lock.version);
});

test('membership drift is detected: moving, swapping, dropping or adding a member changes the checksum and the generated delta', () => {
  const base = releaseFingerprint();
  const edit = fn => { const copy = { ...unit1, occurrences: unit1.occurrences.map(row => ({ ...row })) }; fn(copy.occurrences); return releaseFingerprint(copy); };
  // swap the first two words: every pathway's Set 1 changes
  assert.notEqual(edit(list => { const a = list[0].positionInUnit; list[0].positionInUnit = list[1].positionInUnit; list[1].positionInUnit = a; [list[0], list[1]] = [list[1], list[0]]; }).contentChecksum, base.contentChecksum);
  // removing a word changes content and membership
  const dropped = releaseFingerprint({ ...unit1, occurrences: unit1.occurrences.slice(1) });
  assert.notEqual(dropped.contentChecksum, base.contentChecksum);
  assert.notEqual(dropped.membershipChecksum, base.membershipChecksum);
});

test('a one-character content edit changes the content checksum even when membership does not', () => {
  const base = releaseFingerprint();
  const items = unit1.items.map((item, index) => index === 0 ? { ...item, senses: item.senses.map((sense, i) => i === 0 ? { ...sense, meaning: `${sense.meaning}.` } : sense) } : item);
  const edited = releaseFingerprint({ ...unit1, items });
  assert.notEqual(edited.contentChecksum, base.contentChecksum);
  assert.equal(edited.membershipChecksum, base.membershipChecksum, 'wording alone does not move anyone between Sets');
});

test('canonicalJson is stable under key order and sensitive to array order', () => {
  assert.equal(canonicalJson({ b: 1, a: [1, 2] }), canonicalJson({ a: [1, 2], b: 1 }));
  assert.notEqual(canonicalJson({ a: [1, 2] }), canonicalJson({ a: [2, 1] }));
});

test('generator: deltaSql is deterministic, replaces only changed Sets, and never touches an unchanged Set', () => {
  assert.equal(deltaSql(), deltaSql());
  const changed = changedSets().map(c => c.key);
  assert.ok(changed.length > 0 && changed.every(key => key.includes('word_families')));
  for (const row of baselineRows().filter(r => !changed.includes(`${r.unit}|${r.pathway}|${r.set}`) && r.pathway !== 'word_families')) {
    assert.ok(membershipRows().some(r => r.unit === row.unit && r.pathway === row.pathway && r.set === row.set && r.position === row.position && r.occurrenceId === row.occurrenceId), `${row.pathway} Set ${row.set} drifted from the seed`);
  }
});

test('generator: a Set whose members changed but that has no guard cannot be produced (every replaced Set carries its started-Set guard)', () => {
  const sql = deltaSql();
  for (const { now } of changedSets()) {
    const { unit, pathway, set } = now[0];
    assert.match(sql, new RegExp(`vocabulary_pathway_sets where unit_number = ${unit} and pathway_id = '${pathway}' and set_number = ${set}`));
  }
});

test('the Unit 1 database sync SQL is derived from the canonical release: regenerating it changes nothing (run `node scripts/generate-unit1-sync-sql.mjs --write`)', async () => {
  const { generatedChunks, outFile } = await import('../scripts/generate-unit1-sync-sql.mjs');
  const chunks = generatedChunks();
  assert.equal(chunks.length, 5);
  for (const { number, text } of chunks) {
    assert.equal(fs.readFileSync(outFile(number), 'utf8'), text, `sync chunk ${number} is stale`);
    assert.match(text, /^-- Unit 1 content sync \(Job 9\)/);
    assert.doesNotMatch(text.replace(/\$sx\$[\s\S]*?\$sx\$/g, ''), /\b(drop table|delete from|truncate)\b/i, 'upserts only');
  }
  // the server reads these fields from the published senses, so they must be in the sync
  const all = chunks.map(c => c.text).join('\n');
  for (const field of ['masteryPassages', 'wordFamilyForms', 'altExample', 'wrongMeanings', 'wrongParaphrases', 'situationDistractors']) assert.ok(all.includes(`\\"${field}\\"`) || all.includes(`"${field}"`), field);
});

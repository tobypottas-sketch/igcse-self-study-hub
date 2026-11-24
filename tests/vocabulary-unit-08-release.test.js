// Unit 8 (Work) release packaging: the live release, its lock, its generated SQL and its isolation from Units 1–7.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import approved from '../content/vocabulary/units/unit-08.js';
import unit1 from '../content/vocabulary/releases/unit-01.js';
import unit2 from '../content/vocabulary/releases/unit-02.js';
import unit3 from '../content/vocabulary/releases/unit-03.js';
import unit4 from '../content/vocabulary/releases/unit-04.js';
import unit5 from '../content/vocabulary/releases/unit-05.js';
import unit6 from '../content/vocabulary/releases/unit-06.js';
import unit7 from '../content/vocabulary/releases/unit-07.js';
import unit8 from '../content/vocabulary/releases/unit-08.js';
import { membershipRows, membershipChecksum, membershipSql } from '../scripts/generate-set-membership-sql.mjs';
import { releaseFingerprint, readLock } from '../scripts/vocabulary-content-checksum.mjs';
import { generatedChunks, outFile } from '../scripts/generate-unit1-sync-sql.mjs';
import { releaseNumbers, contentVersionFor } from '../scripts/vocabulary-releases.mjs';
import { releasePlannerContent } from '../content/vocabulary/readiness-report.js';
import { evaluateUnitReadiness } from '../src/vocabulary/pathway-readiness.js';

const read = name => fs.readFileSync(new URL(`../docs/vocabulary-content-updates/${name}`, import.meta.url), 'utf8');
const exists = path => fs.existsSync(new URL(`../${path}`, import.meta.url));
const overlap = (a, b) => [...new Set(a)].filter(value => new Set(b).has(value));
const earlier = [unit1, unit2, unit3, unit4, unit5, unit6, unit7];
const ISOLATED = {
  availability: ['vocab_availability_8', 'u8_02_availability_8', [unit2, unit5, unit7]],
  facilities: ['vocab_facilities_8', 'u8_10_facilities_8', [unit5]],
  feature: ['vocab_feature_8', 'u8_11_feature_8', [unit2]],
  ingredients: ['vocab_ingredients_8', 'u8_14_ingredients_8', [unit3]],
  landscape: ['vocab_landscape_8', 'u8_20_landscape_8', [unit4]],
  responsible: ['vocab_responsible_8', 'u8_30_responsible_8', [unit7]],
  significant: ['vocab_significant_8', 'u8_32_significant_8', [unit1]],
  specialise: ['vocab_specialise_8', 'u8_34_specialise_8', [unit5]],
  engineer: ['vocab_engineer_8', 'u8_42_engineer_8', [unit4]]
};
const stripId = id => id.replace(/^u8_\d+_/, '');
const PATHWAYS = ['meaning', 'context', 'word_families', 'paraphrasing', 'precision_use', 'spelling_recall'];
const held = ['creative'];

test('one authoritative Unit 8 source: approved unit-08.js exists, the draft is gone, and the release promotes it unchanged', () => {
  assert.ok(exists('content/vocabulary/units/unit-08.js'));
  assert.ok(!exists('content/vocabulary/units/unit-08-draft.js'), 'no conflicting draft source');
  assert.ok(exists('content/vocabulary/releases/unit-08.js'));
  assert.equal(approved.status, 'approved');
  assert.equal(unit8.status, 'live');
  assert.deepEqual(unit8.items.map(item => item.term), approved.items.map(item => item.term));
  assert.deepEqual(unit8.occurrences.map(row => row.occurrenceId), approved.occurrences.map(row => row.occurrenceId));
  assert.equal(unit8.contexts.length, approved.contexts.length);
  assert.equal(unit8.activities.length, approved.activities.length);
});

test('Unit 8 is a live release of exactly 50 targets with the audited record counts', () => {
  assert.equal(unit8.unitNumber, 8);
  assert.equal(unit8.unitTitle, 'Work');
  assert.equal(unit8.items.length, 50);
  assert.equal(new Set(unit8.items.map(item => item.term)).size, 50);
  assert.equal(new Set(unit8.items.map(item => item.vocabularyId)).size, 50);
  assert.equal(unit8.occurrences.length, 50);
  assert.equal(new Set(unit8.occurrences.map(o => o.occurrenceId)).size, 50);
  assert.deepEqual(unit8.occurrences.map(o => o.positionInUnit), Array.from({ length: 50 }, (_, i) => i + 1));
  assert.equal(unit8.items[0].term, 'architecture');
  assert.equal(unit8.items[3].term, 'complicated');
  assert.equal(unit8.items[49].term, 'wellbeing');
  assert.equal(unit8.contexts.length, 300);
  assert.equal(new Set(unit8.contexts.map(c => c.contextId)).size, 300);
  assert.equal(unit8.activities.length, 296);
  assert.equal(new Set(unit8.activities.map(a => a.activityContentId)).size, 296);
  const types = {};
  for (const activity of unit8.activities) { const key = activity.activityData.taskType ?? activity.contentType; types[key] = (types[key] ?? 0) + 1; }
  assert.deepEqual(types, { phrase_set: 50, idea_set: 50, improve_vocabulary: 100, word_family: 96 });
  assert.ok([unit8.items, unit8.occurrences, unit8.contexts, unit8.activities].every(rows => rows.every(row => row.status === 'live')));
  assert.ok(unit8.occurrences.every(occurrence => occurrence.unitNumber === 8));
});

test('exactly 32 genuine Word Families with 3 items each; none is padded', () => {
  const families = unit8.items.filter(item => (item.senses[0].wordFamilyForms ?? []).length >= 3).map(item => item.term);
  assert.equal(families.length, 32);
  const items = unit8.activities.filter(a => a.activityData.taskType === 'word_family');
  assert.equal(items.length, 96);
  for (const term of families) assert.equal(items.filter(a => a.activityData.primaryEvidenceTargetId === unit8.items.find(i => i.term === term).vocabularyId).length, 3, term);
});

test('nothing is shared with Units 1–7; the nine overlapping lexical targets have their own Unit 8 rows and the earlier rows are untouched', () => {
  for (const other of earlier) {
    assert.deepEqual(overlap(unit8.items.map(i => i.vocabularyId), other.items.map(i => i.vocabularyId)), []);
    assert.deepEqual(overlap(unit8.occurrences.map(o => o.occurrenceId), other.occurrences.map(o => o.occurrenceId)), []);
    assert.deepEqual(overlap(unit8.contexts.map(c => c.contextId ?? c.id), other.contexts.map(c => c.contextId ?? c.id)), []);
    assert.deepEqual(overlap(unit8.activities.map(a => a.activityContentId), other.activities.map(a => a.activityContentId)), []);
  }
  assert.deepEqual(unit8.items.filter(item => /_8$/.test(item.vocabularyId)).map(item => item.term), Object.keys(ISOLATED));
  for (const [term, [vocabularyId, occurrenceId, originals]] of Object.entries(ISOLATED)) {
    const item = unit8.items.find(row => row.term === term);
    assert.equal(item.vocabularyId, vocabularyId, term);
    assert.ok(unit8.occurrences.some(o => o.occurrenceId === occurrenceId && o.vocabularyId === vocabularyId), term);
    for (const original of originals) assert.ok(original.items.some(row => row.term === term && row.vocabularyId !== vocabularyId), `${term}: earlier original still present`);
    assert.deepEqual(item.senses[0].spellingErrors, originals[0].items.find(row => row.term === term).senses[0].spellingErrors, `${term} shares the reviewed spelling list`);
  }
});

test('Units 1–7 are unchanged: each release still equals its committed lock', () => {
  for (const [number, release] of [[1, unit1], [2, unit2], [3, unit3], [4, unit4], [5, unit5], [6, unit6], [7, unit7]]) {
    const lock = readLock(number);
    assert.deepEqual(releaseFingerprint(release), { version: lock.version, contentChecksum: lock.contentChecksum, membershipChecksum: lock.membershipChecksum, words: lock.words, memberRows: lock.memberRows }, `Unit ${number}`);
  }
});

test('all six pathways are live; nothing is held back except the Word Family whole-set-of-10 remainder', () => {
  assert.ok(!Object.keys(unit8).some(key => /unitCheck|game/i.test(key)));
  assert.ok(!unit8.activities.some(activity => /unit_check|game|connection/i.test(activity.contentType)));
  const readiness = evaluateUnitReadiness({ content: releasePlannerContent(unit8) });
  const by = key => Object.fromEntries(Object.values(readiness.pathways).map(p => [p.pathwayId, p[key]]));
  assert.deepEqual(by('live'), Object.fromEntries(PATHWAYS.map(id => [id, true])));
  assert.deepEqual(by('servedCount'), { meaning: 50, context: 50, word_families: 31, paraphrasing: 50, precision_use: 50, spelling_recall: 50 });
  assert.deepEqual(by('playableSetCount'), { meaning: 5, context: 5, word_families: 3, paraphrasing: 5, precision_use: 5, spelling_recall: 5 });
  assert.deepEqual(by('heldBackCount'), { meaning: 0, context: 0, word_families: 1, paraphrasing: 0, precision_use: 0, spelling_recall: 0 });
  assert.deepEqual(readiness.pathways.word_families.heldBackOccurrenceIds.map(stripId), held);
  assert.deepEqual(unit8.items.filter(item => item.partOfSpeech === 'adverb'), []);
});

test('Set membership covers Unit 8 occurrences only, in 28 whole Sets of ten, and the committed SQL matches it', () => {
  const rows = membershipRows([unit8]);
  const occurrenceIds = new Set(unit8.occurrences.map(o => o.occurrenceId));
  assert.equal(rows.length, 280);
  assert.ok(rows.every(row => row.unit === 8 && occurrenceIds.has(row.occurrenceId)));
  assert.equal(new Set(rows.map(row => `${row.pathway}|${row.occurrenceId}`)).size, rows.length, 'no duplicate (pathway, occurrence)');
  assert.equal(new Set(rows.map(row => `${row.pathway}|${row.set}|${row.position}`)).size, rows.length, 'no duplicate positions');
  const sets = new Map();
  for (const row of rows) sets.set(`${row.pathway}/${row.set}`, (sets.get(`${row.pathway}/${row.set}`) ?? 0) + 1);
  assert.equal(sets.size, 28);
  assert.ok([...sets.values()].every(count => count === 10));
  const perPathway = {};
  for (const row of rows) perPathway[row.pathway] = (perPathway[row.pathway] ?? 0) + 1;
  assert.deepEqual(perPathway, { meaning: 50, context: 50, word_families: 30, paraphrasing: 50, precision_use: 50, spelling_recall: 50 });
  const heldRows = pathway => rows.filter(row => row.pathway === pathway).map(row => stripId(row.occurrenceId));
  assert.ok(held.every(term => !heldRows('word_families').includes(term)));
  const sql = read('unit-08-set-membership.sql');
  assert.ok(sql.includes(membershipSql(rows)));
  assert.ok(sql.includes(`membership checksum ${membershipChecksum(rows)}`));
  assert.ok(!/u[1-7]_/.test(sql));
  assert.ok(!/^\s*(delete from|truncate|drop |update )/im.test(sql));
});

test('the lock matches the release, release discovery and tooling know Units 1–8, and generation is deterministic and byte-identical to the committed SQL', () => {
  const lock = readLock(8);
  assert.equal(lock.version, 'unit-08/v1');
  assert.equal(contentVersionFor(8), 'unit-08/v1');
  assert.equal(lock.words, 50);
  assert.equal(lock.memberRows, 280);
  assert.deepEqual(releaseFingerprint(unit8), { version: lock.version, contentChecksum: lock.contentChecksum, membershipChecksum: lock.membershipChecksum, words: lock.words, memberRows: lock.memberRows });
  assert.deepEqual(releaseNumbers(), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const first = generatedChunks(8);
  const second = generatedChunks(8);
  assert.equal(first.length, 5);
  assert.deepEqual(first.map(c => c.text), second.map(c => c.text), 'two generations are byte-identical');
  for (const { number, text } of first) assert.equal(text, fs.readFileSync(outFile(number, 8), 'utf8'), `chunk ${number} must match the committed file`);
  assert.equal(membershipChecksum(membershipRows([unit8])), lock.membershipChecksum);
});

test('the Unit 8 sync SQL only upserts Unit 8 rows: no earlier-unit id, no delete, the _8 ids present, British spelling intact', () => {
  const all = [1, 2, 3, 4, 5].map(n => read(`unit-08-sync-chunk-${n}.sql`)).join('\n');
  for (const n of [1, 2, 3, 4, 5]) {
    const sql = read(`unit-08-sync-chunk-${n}.sql`);
    assert.ok(!/'u[1-7]_/.test(sql), `chunk ${n}`);
    assert.ok(!/^\s*(delete from|truncate|drop )/im.test(sql), `chunk ${n}`);
  }
  for (const [, [vocabularyId, occurrenceId]] of Object.entries(ISOLATED)) {
    assert.ok(all.includes(`'${vocabularyId}'`), vocabularyId);
    assert.ok(all.includes(`'${occurrenceId}'`), occurrenceId);
  }
  assert.ok(!/'vocab_(availability|facilities|feature|ingredients|landscape|responsible|significant|specialise|engineer)'/.test(all), 'no earlier-unit lexical id appears in the Unit 8 SQL');
  // The shared reviewed spelling list for specialise deliberately contains the American "specialize" as a wrong spelling, so spelling lists are excluded.
  const noSpelling = value => value.replace(/"spellingErrors":\[[^\]]*\]/g, '').replace(/'\[(?:"[a-z' -]+",?)+\]'/g, '');
  const text = noSpelling(JSON.stringify(unit8));
  assert.ok(/specialise/.test(text) && /publicise/.test(text));
  assert.ok(!/organize|specialize|publicize|specialized|recognize/i.test(text + noSpelling(all)));
});

test('this packaging adds no Supabase, Edge Function, Unit Check or Games artefact for Unit 8', () => {
  for (const path of ['content/vocabulary/units/unit-08-unit-check.js', 'content/vocabulary/units/unit-08-games.js']) assert.ok(!exists(path), path);
  const migrations = fs.existsSync(new URL('../supabase/migrations/', import.meta.url)) ? fs.readdirSync(new URL('../supabase/migrations/', import.meta.url)) : [];
  assert.ok(!migrations.some(name => /unit[-_]?0?8/i.test(name)), 'no Unit 8 migration');
});

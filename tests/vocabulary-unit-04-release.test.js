// Unit 4 (Transport) release packaging: the live release, its lock, its generated SQL and its isolation from Units 1, 2 and 3.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import unit1 from '../content/vocabulary/releases/unit-01.js';
import unit2 from '../content/vocabulary/releases/unit-02.js';
import unit3 from '../content/vocabulary/releases/unit-03.js';
import unit4 from '../content/vocabulary/releases/unit-04.js';
import { membershipRows, membershipChecksum, membershipSql } from '../scripts/generate-set-membership-sql.mjs';
import { releaseFingerprint, readLock } from '../scripts/vocabulary-content-checksum.mjs';
import { generatedChunks, outFile } from '../scripts/generate-unit1-sync-sql.mjs';
import { releasePlannerContent } from '../content/vocabulary/readiness-report.js';
import { evaluateUnitReadiness } from '../src/vocabulary/pathway-readiness.js';

const read = name => fs.readFileSync(new URL(`../docs/vocabulary-content-updates/${name}`, import.meta.url), 'utf8');
const overlap = (a, b) => [...new Set(a)].filter(value => new Set(b).has(value));
const ISOLATED = { demand: ['vocab_demand_4', 'u4_22_demand_4', unit1], advertisement: ['vocab_advertisement_4', 'u4_25_advertisement_4', unit3], equipment: ['vocab_equipment_4', 'u4_27_equipment_4', unit2], participant: ['vocab_participant_4', 'u4_30_participant_4', unit3] };

test('Unit 4 is a live release of exactly 50 targets with the audited record counts', () => {
  assert.equal(unit4.status, 'live');
  assert.equal(unit4.unitNumber, 4);
  assert.equal(unit4.items.length, 50);
  assert.equal(new Set(unit4.items.map(item => item.term)).size, 50);
  assert.equal(new Set(unit4.items.map(item => item.vocabularyId)).size, 50);
  assert.equal(unit4.occurrences.length, 50);
  assert.equal(new Set(unit4.occurrences.map(o => o.occurrenceId)).size, 50);
  assert.equal(unit4.contexts.length, 300);
  assert.equal(new Set(unit4.contexts.map(c => c.contextId)).size, 300);
  assert.equal(unit4.activities.length, 260);
  assert.equal(new Set(unit4.activities.map(a => a.activityContentId)).size, 260);
  const types = {};
  for (const activity of unit4.activities) { const key = activity.activityData.taskType ?? activity.contentType; types[key] = (types[key] ?? 0) + 1; }
  assert.deepEqual(types, { phrase_set: 50, idea_set: 50, improve_vocabulary: 100, word_family: 60 });
  assert.ok([unit4.items, unit4.occurrences, unit4.contexts, unit4.activities].every(rows => rows.every(row => row.status === 'live')));
  assert.ok(unit4.occurrences.every(occurrence => occurrence.unitNumber === 4));
});

test('exactly 20 Word Families with 3 items each, including the five recently accepted families', () => {
  const families = unit4.items.filter(item => (item.senses[0].wordFamilyForms ?? []).length >= 3).map(item => item.term);
  assert.equal(families.length, 20);
  for (const term of ['fatality', 'regulation', 'enforcement', 'legislation', 'statistics']) assert.ok(families.includes(term), term);
  const items = unit4.activities.filter(a => a.activityData.taskType === 'word_family');
  assert.equal(items.length, 60);
  for (const term of families) assert.equal(items.filter(a => a.activityData.primaryEvidenceTargetId === unit4.items.find(i => i.term === term).vocabularyId).length, 3, term);
});

test('nothing is shared with Units 1, 2 or 3; the four duplicate lexical targets have their own Unit 4 rows', () => {
  for (const other of [unit1, unit2, unit3]) {
    assert.deepEqual(overlap(unit4.items.map(i => i.vocabularyId), other.items.map(i => i.vocabularyId)), []);
    assert.deepEqual(overlap(unit4.occurrences.map(o => o.occurrenceId), other.occurrences.map(o => o.occurrenceId)), []);
    assert.deepEqual(overlap(unit4.contexts.map(c => c.contextId ?? c.id), other.contexts.map(c => c.contextId ?? c.id)), []);
    assert.deepEqual(overlap(unit4.activities.map(a => a.activityContentId), other.activities.map(a => a.activityContentId)), []);
  }
  for (const [term, [vocabularyId, occurrenceId, earlier]] of Object.entries(ISOLATED)) {
    const item = unit4.items.find(row => row.term === term);
    assert.equal(item.vocabularyId, vocabularyId, term);
    assert.ok(unit4.occurrences.some(o => o.occurrenceId === occurrenceId && o.vocabularyId === vocabularyId), term);
    assert.notEqual(vocabularyId, earlier.items.find(row => row.term === term).vocabularyId, term);
  }
});

test('Units 1, 2 and 3 are unchanged: each release still equals its committed lock', () => {
  for (const [number, release] of [[1, unit1], [2, unit2], [3, unit3]]) {
    const lock = readLock(number);
    assert.deepEqual(releaseFingerprint(release), { version: lock.version, contentChecksum: lock.contentChecksum, membershipChecksum: lock.membershipChecksum, words: lock.words, memberRows: lock.memberRows }, `Unit ${number}`);
  }
});

test('Unit 4 carries no Unit Check or Games content, and all six pathways are live with the documented held-back words', () => {
  assert.ok(!Object.keys(unit4).some(key => /unitCheck|game/i.test(key)));
  assert.ok(!unit4.activities.some(activity => /unit_check|game|connection/i.test(activity.contentType)));
  const readiness = evaluateUnitReadiness({ content: releasePlannerContent(unit4) });
  assert.ok(Object.values(readiness.pathways).every(pathway => pathway.playableSetCount > 0), 'all six pathways are live');
  const held = Object.fromEntries(Object.values(readiness.pathways).map(p => [p.pathwayId, p.heldBackCount]));
  assert.deepEqual(held, { meaning: 9, context: 9, word_families: 0, paraphrasing: 0, precision_use: 0, spelling_recall: 0 });
  const heldTerms = ids => ids.map(id => unit4.items.find(i => i.vocabularyId === unit4.occurrences.find(o => o.occurrenceId === id).vocabularyId).term);
  const expected = ['offences', 'provisional', 'enforcement', 'statistics', 'safety', 'sustainability', 'legislation', 'introduce', 'innovative'];
  assert.deepEqual(heldTerms(readiness.pathways.meaning.heldBackOccurrenceIds), expected);
  assert.deepEqual(heldTerms(readiness.pathways.context.heldBackOccurrenceIds), expected);
  // efficiently (the lone adverb) is still limited in Meaning Match and Context Recognise/Apply/Recall, with no special-casing.
  const efficiently = unit4.occurrences.find(o => o.occurrenceId === 'u4_21_efficiently').occurrenceId;
  const failed = (pathwayId) => ['recognise', 'match', 'apply', 'recall', 'mastery'].filter(stage => (readiness.pathways[pathwayId].stageFailures[stage] ?? []).some(f => f.occurrenceId === efficiently));
  assert.deepEqual(failed('meaning'), ['match']);
  assert.deepEqual(failed('context'), ['recognise', 'apply', 'recall']);
});

test('Set membership covers Unit 4 occurrences only, in 25 whole Sets of ten, and the committed SQL matches it', () => {
  const rows = membershipRows([unit4]);
  const occurrenceIds = new Set(unit4.occurrences.map(o => o.occurrenceId));
  assert.equal(rows.length, 250);
  assert.ok(rows.every(row => row.unit === 4 && occurrenceIds.has(row.occurrenceId)));
  assert.equal(new Set(rows.map(row => `${row.pathway}|${row.occurrenceId}`)).size, rows.length, 'no duplicate (pathway, occurrence)');
  assert.equal(new Set(rows.map(row => `${row.pathway}|${row.set}|${row.position}`)).size, rows.length, 'no duplicate positions');
  const sets = new Map();
  for (const row of rows) sets.set(`${row.pathway}/${row.set}`, (sets.get(`${row.pathway}/${row.set}`) ?? 0) + 1);
  assert.equal(sets.size, 25);
  assert.ok([...sets.values()].every(count => count === 10));
  const perPathway = {};
  for (const row of rows) perPathway[row.pathway] = (perPathway[row.pathway] ?? 0) + 1;
  assert.deepEqual(perPathway, { meaning: 40, context: 40, word_families: 20, paraphrasing: 50, precision_use: 50, spelling_recall: 50 });
  const sql = read('unit-04-set-membership.sql');
  assert.ok(sql.includes(membershipSql(rows)));
  assert.ok(sql.includes(`membership checksum ${membershipChecksum(rows)}`));
});

test('the lock matches the release, and generation is deterministic and byte-identical to the committed SQL', () => {
  const lock = readLock(4);
  assert.equal(lock.version, 'unit-04/v1');
  assert.equal(lock.words, 50);
  assert.equal(lock.memberRows, 250);
  assert.deepEqual(releaseFingerprint(unit4), { version: lock.version, contentChecksum: lock.contentChecksum, membershipChecksum: lock.membershipChecksum, words: lock.words, memberRows: lock.memberRows });
  const first = generatedChunks(4);
  const second = generatedChunks(4);
  assert.equal(first.length, 5);
  assert.deepEqual(first.map(c => c.text), second.map(c => c.text), 'two generations are byte-identical');
  for (const { number, text } of first) assert.equal(text, fs.readFileSync(outFile(number, 4), 'utf8'), `chunk ${number} must match the committed file`);
  assert.equal(membershipSql(membershipRows([unit4])), membershipSql(membershipRows([unit4])));
  assert.equal(membershipChecksum(membershipRows([unit4])), lock.membershipChecksum);
});

test('the Unit 4 sync SQL never touches an earlier-unit row, and British spelling is intact', () => {
  for (let n = 1; n <= 5; n += 1) {
    const sql = read(`unit-04-sync-chunk-${n}.sql`);
    assert.ok(!/'vocab_(demand|advertisement|equipment|participant)'/.test(sql), `chunk ${n}`);
    assert.ok(!/'u[123]_/.test(sql), `chunk ${n}`);
    assert.ok(!/^\s*(delete from|truncate|drop )/im.test(sql), `chunk ${n}`);
  }
  const text = JSON.stringify(unit4);
  assert.ok(/organisation/.test(text) && /storeys/.test(text) && /offences/.test(text));
  assert.ok(!/\b(organization|organized|offenses?|storys?)\b/i.test(JSON.stringify(unit4.contexts) + JSON.stringify(unit4.activities)));
});

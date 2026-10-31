// Unit 6 (Learning and Study Skills) release packaging: the live release, its lock, its generated SQL and its isolation from Units 1–5.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import approved from '../content/vocabulary/units/unit-06.js';
import unit1 from '../content/vocabulary/releases/unit-01.js';
import unit2 from '../content/vocabulary/releases/unit-02.js';
import unit3 from '../content/vocabulary/releases/unit-03.js';
import unit4 from '../content/vocabulary/releases/unit-04.js';
import unit5 from '../content/vocabulary/releases/unit-05.js';
import unit6 from '../content/vocabulary/releases/unit-06.js';
import { membershipRows, membershipChecksum, membershipSql } from '../scripts/generate-set-membership-sql.mjs';
import { releaseFingerprint, readLock } from '../scripts/vocabulary-content-checksum.mjs';
import { generatedChunks, outFile } from '../scripts/generate-unit1-sync-sql.mjs';
import { releaseNumbers, contentVersionFor } from '../scripts/vocabulary-releases.mjs';
import { releasePlannerContent } from '../content/vocabulary/readiness-report.js';
import { evaluateUnitReadiness } from '../src/vocabulary/pathway-readiness.js';

const read = name => fs.readFileSync(new URL(`../docs/vocabulary-content-updates/${name}`, import.meta.url), 'utf8');
const exists = path => fs.existsSync(new URL(`../${path}`, import.meta.url));
const overlap = (a, b) => [...new Set(a)].filter(value => new Set(b).has(value));
const earlier = [unit1, unit2, unit3, unit4, unit5];
const ISOLATED = {
  evaluate: ['vocab_evaluate_6', 'u6_12_evaluate_6', [unit3, unit5]],
  struggle: ['vocab_struggle_6', 'u6_31_struggle_6', [unit1]],
  pressure: ['vocab_pressure_6', 'u6_40_pressure_6', [unit3]],
  achievement: ['vocab_achievement_6', 'u6_46_achievement_6', [unit1]]
};
const stripId = id => id.replace(/^u6_\d+_/, '');
const PATHWAYS = ['meaning', 'context', 'word_families', 'paraphrasing', 'precision_use', 'spelling_recall'];
const held = ['retain', 'summarise', 'coordination', 'cognitive', 'achievement_6', 'outcome', 'focus', 'memorise', 'insight'];

test('one authoritative Unit 6 source: approved unit-06.js exists, the draft is gone, and the release promotes it unchanged', () => {
  assert.ok(exists('content/vocabulary/units/unit-06.js'));
  assert.ok(!exists('content/vocabulary/units/unit-06-draft.js'), 'no conflicting draft source');
  assert.ok(exists('content/vocabulary/releases/unit-06.js'));
  assert.equal(approved.status, 'approved');
  assert.equal(unit6.status, 'live');
  assert.deepEqual(unit6.items.map(item => item.term), approved.items.map(item => item.term));
  assert.deepEqual(unit6.occurrences.map(row => row.occurrenceId), approved.occurrences.map(row => row.occurrenceId));
  assert.equal(unit6.contexts.length, approved.contexts.length);
  assert.equal(unit6.activities.length, approved.activities.length);
});

test('Unit 6 is a live release of exactly 50 targets with the audited record counts', () => {
  assert.equal(unit6.unitNumber, 6);
  assert.equal(unit6.unitTitle, 'Learning and Study Skills');
  assert.equal(unit6.items.length, 50);
  assert.equal(new Set(unit6.items.map(item => item.term)).size, 50);
  assert.equal(new Set(unit6.items.map(item => item.vocabularyId)).size, 50);
  assert.equal(unit6.occurrences.length, 50);
  assert.equal(new Set(unit6.occurrences.map(o => o.occurrenceId)).size, 50);
  assert.deepEqual(unit6.occurrences.map(o => o.positionInUnit), Array.from({ length: 50 }, (_, i) => i + 1));
  assert.equal(unit6.items[0].term, 'absorb');
  assert.equal(unit6.items[3].term, 'dramatically');
  assert.equal(unit6.items[49].term, 'insight');
  assert.equal(unit6.contexts.length, 300);
  assert.equal(new Set(unit6.contexts.map(c => c.contextId)).size, 300);
  assert.equal(unit6.activities.length, 266);
  assert.equal(new Set(unit6.activities.map(a => a.activityContentId)).size, 266);
  const types = {};
  for (const activity of unit6.activities) { const key = activity.activityData.taskType ?? activity.contentType; types[key] = (types[key] ?? 0) + 1; }
  assert.deepEqual(types, { phrase_set: 50, idea_set: 50, improve_vocabulary: 100, word_family: 66 });
  assert.ok([unit6.items, unit6.occurrences, unit6.contexts, unit6.activities].every(rows => rows.every(row => row.status === 'live')));
  assert.ok(unit6.occurrences.every(occurrence => occurrence.unitNumber === 6));
});

test('exactly 22 genuine Word Families with 3 items each; none is padded', () => {
  const families = unit6.items.filter(item => (item.senses[0].wordFamilyForms ?? []).length >= 3).map(item => item.term);
  assert.equal(families.length, 22);
  const items = unit6.activities.filter(a => a.activityData.taskType === 'word_family');
  assert.equal(items.length, 66);
  for (const term of families) assert.equal(items.filter(a => a.activityData.primaryEvidenceTargetId === unit6.items.find(i => i.term === term).vocabularyId).length, 3, term);
});

test('nothing is shared with Units 1–5; the four duplicate lexical targets have their own Unit 6 rows and the earlier rows are untouched', () => {
  for (const other of earlier) {
    assert.deepEqual(overlap(unit6.items.map(i => i.vocabularyId), other.items.map(i => i.vocabularyId)), []);
    assert.deepEqual(overlap(unit6.occurrences.map(o => o.occurrenceId), other.occurrences.map(o => o.occurrenceId)), []);
    assert.deepEqual(overlap(unit6.contexts.map(c => c.contextId ?? c.id), other.contexts.map(c => c.contextId ?? c.id)), []);
    assert.deepEqual(overlap(unit6.activities.map(a => a.activityContentId), other.activities.map(a => a.activityContentId)), []);
  }
  assert.deepEqual(unit6.items.filter(item => /_6$/.test(item.vocabularyId)).map(item => item.term), Object.keys(ISOLATED));
  for (const [term, [vocabularyId, occurrenceId, originals]] of Object.entries(ISOLATED)) {
    const item = unit6.items.find(row => row.term === term);
    assert.equal(item.vocabularyId, vocabularyId, term);
    assert.ok(unit6.occurrences.some(o => o.occurrenceId === occurrenceId && o.vocabularyId === vocabularyId), term);
    for (const original of originals) assert.ok(original.items.some(row => row.term === term && row.vocabularyId !== vocabularyId), `${term}: earlier original still present`);
    assert.deepEqual(item.senses[0].spellingErrors, originals[0].items.find(row => row.term === term).senses[0].spellingErrors, `${term} shares the reviewed spelling list`);
  }
});

test('Units 1–5 are unchanged: each release still equals its committed lock', () => {
  for (const [number, release] of [[1, unit1], [2, unit2], [3, unit3], [4, unit4], [5, unit5]]) {
    const lock = readLock(number);
    assert.deepEqual(releaseFingerprint(release), { version: lock.version, contentChecksum: lock.contentChecksum, membershipChecksum: lock.membershipChecksum, words: lock.words, memberRows: lock.memberRows }, `Unit ${number}`);
  }
});

test('all six pathways are live; dramatically is the only structural exclusion and the whole-set-of-10 holdbacks are exact', () => {
  assert.ok(!Object.keys(unit6).some(key => /unitCheck|game/i.test(key)));
  assert.ok(!unit6.activities.some(activity => /unit_check|game|connection/i.test(activity.contentType)));
  const readiness = evaluateUnitReadiness({ content: releasePlannerContent(unit6) });
  const by = key => Object.fromEntries(Object.values(readiness.pathways).map(p => [p.pathwayId, p[key]]));
  assert.deepEqual(by('live'), Object.fromEntries(PATHWAYS.map(id => [id, true])));
  assert.deepEqual(by('servedCount'), { meaning: 49, context: 49, word_families: 22, paraphrasing: 50, precision_use: 50, spelling_recall: 50 });
  assert.deepEqual(by('playableSetCount'), { meaning: 4, context: 4, word_families: 2, paraphrasing: 5, precision_use: 5, spelling_recall: 5 });
  assert.deepEqual(by('heldBackCount'), { meaning: 9, context: 9, word_families: 2, paraphrasing: 0, precision_use: 0, spelling_recall: 0 });
  for (const id of ['meaning', 'context']) assert.deepEqual(readiness.pathways[id].heldBackOccurrenceIds.map(stripId), held, id);
  assert.deepEqual(readiness.pathways.word_families.heldBackOccurrenceIds.map(stripId), ['achievement_6', 'memorise']);
  for (const id of ['meaning', 'context']) assert.ok(!readiness.pathways[id].setMembers.flat().some(x => /dramatically/.test(x)), id);
  // The only adverb cannot enter the same-part-of-speech stages; no adverbs were added.
  assert.deepEqual(unit6.items.filter(item => item.partOfSpeech === 'adverb').map(item => item.term), ['dramatically']);
});

test('Set membership covers Unit 6 occurrences only, in 25 whole Sets of ten, and the committed SQL matches it', () => {
  const rows = membershipRows([unit6]);
  const occurrenceIds = new Set(unit6.occurrences.map(o => o.occurrenceId));
  assert.equal(rows.length, 250);
  assert.ok(rows.every(row => row.unit === 6 && occurrenceIds.has(row.occurrenceId)));
  assert.equal(new Set(rows.map(row => `${row.pathway}|${row.occurrenceId}`)).size, rows.length, 'no duplicate (pathway, occurrence)');
  assert.equal(new Set(rows.map(row => `${row.pathway}|${row.set}|${row.position}`)).size, rows.length, 'no duplicate positions');
  const sets = new Map();
  for (const row of rows) sets.set(`${row.pathway}/${row.set}`, (sets.get(`${row.pathway}/${row.set}`) ?? 0) + 1);
  assert.equal(sets.size, 25);
  assert.ok([...sets.values()].every(count => count === 10));
  const perPathway = {};
  for (const row of rows) perPathway[row.pathway] = (perPathway[row.pathway] ?? 0) + 1;
  assert.deepEqual(perPathway, { meaning: 40, context: 40, word_families: 20, paraphrasing: 50, precision_use: 50, spelling_recall: 50 });
  const heldRows = pathway => rows.filter(row => row.pathway === pathway).map(row => stripId(row.occurrenceId));
  for (const id of ['meaning', 'context']) assert.ok(held.every(term => !heldRows(id).includes(term)), id);
  assert.ok(!heldRows('word_families').includes('achievement_6') && !heldRows('word_families').includes('memorise'));
  const sql = read('unit-06-set-membership.sql');
  assert.ok(sql.includes(membershipSql(rows)));
  assert.ok(sql.includes(`membership checksum ${membershipChecksum(rows)}`));
  assert.ok(!/u[1-5]_/.test(sql));
  assert.ok(!/^\s*(delete from|truncate|drop |update )/im.test(sql));
});

test('the lock matches the release, release discovery and tooling know Units 1–6, and generation is deterministic and byte-identical to the committed SQL', () => {
  const lock = readLock(6);
  assert.equal(lock.version, 'unit-06/v1');
  assert.equal(contentVersionFor(6), 'unit-06/v1');
  assert.equal(lock.words, 50);
  assert.equal(lock.memberRows, 250);
  assert.deepEqual(releaseFingerprint(unit6), { version: lock.version, contentChecksum: lock.contentChecksum, membershipChecksum: lock.membershipChecksum, words: lock.words, memberRows: lock.memberRows });
  assert.deepEqual(releaseNumbers(), [1, 2, 3, 4, 5, 6]);
  const first = generatedChunks(6);
  const second = generatedChunks(6);
  assert.equal(first.length, 5);
  assert.deepEqual(first.map(c => c.text), second.map(c => c.text), 'two generations are byte-identical');
  for (const { number, text } of first) assert.equal(text, fs.readFileSync(outFile(number, 6), 'utf8'), `chunk ${number} must match the committed file`);
  assert.equal(membershipChecksum(membershipRows([unit6])), lock.membershipChecksum);
});

test('the Unit 6 sync SQL only upserts Unit 6 rows: no earlier-unit id, no delete, the _6 ids present, British spelling intact', () => {
  const all = [1, 2, 3, 4, 5].map(n => read(`unit-06-sync-chunk-${n}.sql`)).join('\n');
  for (const n of [1, 2, 3, 4, 5]) {
    const sql = read(`unit-06-sync-chunk-${n}.sql`);
    assert.ok(!/'u[1-5]_/.test(sql), `chunk ${n}`);
    assert.ok(!/^\s*(delete from|truncate|drop )/im.test(sql), `chunk ${n}`);
  }
  for (const [, [vocabularyId, occurrenceId]] of Object.entries(ISOLATED)) {
    assert.ok(all.includes(`'${vocabularyId}'`), vocabularyId);
    assert.ok(all.includes(`'${occurrenceId}'`), occurrenceId);
  }
  assert.ok(!/'vocab_(evaluate|struggle|pressure|achievement|evaluate_5)'/.test(all), 'no earlier-unit lexical id appears in the Unit 6 SQL');
  const text = JSON.stringify(unit6);
  assert.ok(/prioritise/.test(text) && /summarise/.test(text) && /memorise/.test(text));
  assert.ok(!/prioritize|summarize|memorize/i.test(text + all));
});

test('this packaging adds no Supabase, Edge Function, Unit Check or Games artefact for Unit 6', () => {
  for (const path of ['content/vocabulary/units/unit-06-unit-check.js', 'content/vocabulary/units/unit-06-games.js']) assert.ok(!exists(path), path);
  const migrations = fs.existsSync(new URL('../supabase/migrations/', import.meta.url)) ? fs.readdirSync(new URL('../supabase/migrations/', import.meta.url)) : [];
  assert.ok(!migrations.some(name => /unit[-_]?0?6/i.test(name)), 'no Unit 6 migration');
});

// Unit 9 (Communication) release packaging: the live release, its lock, its generated SQL and its isolation from Units 1–8.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import approved from '../content/vocabulary/units/unit-09.js';
import unit1 from '../content/vocabulary/releases/unit-01.js';
import unit2 from '../content/vocabulary/releases/unit-02.js';
import unit3 from '../content/vocabulary/releases/unit-03.js';
import unit4 from '../content/vocabulary/releases/unit-04.js';
import unit5 from '../content/vocabulary/releases/unit-05.js';
import unit6 from '../content/vocabulary/releases/unit-06.js';
import unit7 from '../content/vocabulary/releases/unit-07.js';
import unit8 from '../content/vocabulary/releases/unit-08.js';
import unit9 from '../content/vocabulary/releases/unit-09.js';
import { membershipRows, membershipChecksum, membershipSql } from '../scripts/generate-set-membership-sql.mjs';
import { releaseFingerprint, readLock } from '../scripts/vocabulary-content-checksum.mjs';
import { generatedChunks, outFile } from '../scripts/generate-unit1-sync-sql.mjs';
import { releaseNumbers, contentVersionFor } from '../scripts/vocabulary-releases.mjs';
import { releasePlannerContent } from '../content/vocabulary/readiness-report.js';
import { evaluateUnitReadiness } from '../src/vocabulary/pathway-readiness.js';

const read = name => fs.readFileSync(new URL(`../docs/vocabulary-content-updates/${name}`, import.meta.url), 'utf8');
const exists = path => fs.existsSync(new URL(`../${path}`, import.meta.url));
const overlap = (a, b) => [...new Set(a)].filter(value => new Set(b).has(value));
const earlier = [unit1, unit2, unit3, unit4, unit5, unit6, unit7, unit8];
const ISOLATED = {
  effective: ['vocab_effective_9', 'u9_04_effective_9', [unit6]],
  demonstrate: ['vocab_demonstrate_9', 'u9_06_demonstrate_9', [unit7]],
  launched: ['vocab_launched_9', 'u9_07_launched_9', [unit8]],
  passive: ['vocab_passive_9', 'u9_08_passive_9', [unit6]],
  interactive: ['vocab_interactive_9', 'u9_09_interactive_9', [unit2]],
  generation: ['vocab_generation_9', 'u9_23_generation_9', [unit1]],
  recommend: ['vocab_recommend_9', 'u9_41_recommend_9', [unit1]],
  solution: ['vocab_solution_9', 'u9_42_solution_9', [unit1]],
  evaluate: ['vocab_evaluate_9', 'u9_47_evaluate_9', [unit3, unit5, unit6, unit7]],
  relevant: ['vocab_relevant_9', 'u9_48_relevant_9', [unit2, unit7]]
};
const stripId = id => id.replace(/^u9_\d+_/, '');
const PATHWAYS = ['meaning', 'context', 'word_families', 'paraphrasing', 'precision_use', 'spelling_recall'];
const held = ['solution_9', 'introduction', 'conclusion', 'audience', 'purpose', 'evaluate_9', 'relevant_9', 'constructive', 'research'];

test('one authoritative Unit 9 source: approved unit-09.js exists, the draft is gone, and the release promotes it unchanged', () => {
  assert.ok(exists('content/vocabulary/units/unit-09.js'));
  assert.ok(!exists('content/vocabulary/units/unit-09-draft.js'), 'no conflicting draft source');
  assert.ok(exists('content/vocabulary/releases/unit-09.js'));
  assert.equal(approved.status, 'approved');
  assert.equal(unit9.status, 'live');
  assert.deepEqual(unit9.items.map(item => item.term), approved.items.map(item => item.term));
  assert.deepEqual(unit9.occurrences.map(row => row.occurrenceId), approved.occurrences.map(row => row.occurrenceId));
  assert.equal(unit9.contexts.length, approved.contexts.length);
  assert.equal(unit9.activities.length, approved.activities.length);
});

test('Unit 9 is a live release of exactly 50 targets with the audited record counts', () => {
  assert.equal(unit9.unitNumber, 9);
  assert.equal(unit9.unitTitle, 'Communication');
  assert.equal(unit9.items.length, 50);
  assert.equal(new Set(unit9.items.map(item => item.term)).size, 50);
  assert.equal(new Set(unit9.items.map(item => item.vocabularyId)).size, 50);
  assert.equal(unit9.occurrences.length, 50);
  assert.equal(new Set(unit9.occurrences.map(o => o.occurrenceId)).size, 50);
  assert.deepEqual(unit9.occurrences.map(o => o.positionInUnit), Array.from({ length: 50 }, (_, i) => i + 1));
  assert.equal(unit9.items[0].term, 'communication');
  assert.equal(unit9.items[3].term, 'effective');
  assert.equal(unit9.items[49].term, 'research');
  assert.equal(unit9.contexts.length, 300);
  assert.equal(new Set(unit9.contexts.map(c => c.contextId)).size, 300);
  assert.equal(unit9.activities.length, 260);
  assert.equal(new Set(unit9.activities.map(a => a.activityContentId)).size, 260);
  const types = {};
  for (const activity of unit9.activities) { const key = activity.activityData.taskType ?? activity.contentType; types[key] = (types[key] ?? 0) + 1; }
  assert.deepEqual(types, { phrase_set: 50, idea_set: 50, improve_vocabulary: 100, word_family: 60 });
  assert.ok([unit9.items, unit9.occurrences, unit9.contexts, unit9.activities].every(rows => rows.every(row => row.status === 'live')));
  assert.ok(unit9.occurrences.every(occurrence => occurrence.unitNumber === 9));
});

test('exactly 20 genuine Word Families with 3 items each; none is padded', () => {
  const families = unit9.items.filter(item => (item.senses[0].wordFamilyForms ?? []).length >= 3).map(item => item.term);
  assert.equal(families.length, 20);
  const items = unit9.activities.filter(a => a.activityData.taskType === 'word_family');
  assert.equal(items.length, 60);
  for (const term of families) assert.equal(items.filter(a => a.activityData.primaryEvidenceTargetId === unit9.items.find(i => i.term === term).vocabularyId).length, 3, term);
});

test('nothing is shared with Units 1–8; the ten overlapping lexical targets have their own Unit 9 rows and the earlier rows are untouched', () => {
  for (const other of earlier) {
    assert.deepEqual(overlap(unit9.items.map(i => i.vocabularyId), other.items.map(i => i.vocabularyId)), []);
    assert.deepEqual(overlap(unit9.occurrences.map(o => o.occurrenceId), other.occurrences.map(o => o.occurrenceId)), []);
    assert.deepEqual(overlap(unit9.contexts.map(c => c.contextId ?? c.id), other.contexts.map(c => c.contextId ?? c.id)), []);
    assert.deepEqual(overlap(unit9.activities.map(a => a.activityContentId), other.activities.map(a => a.activityContentId)), []);
  }
  assert.deepEqual(unit9.items.filter(item => /_9$/.test(item.vocabularyId)).map(item => item.term), Object.keys(ISOLATED));
  for (const [term, [vocabularyId, occurrenceId, originals]] of Object.entries(ISOLATED)) {
    const item = unit9.items.find(row => row.term === term);
    assert.equal(item.vocabularyId, vocabularyId, term);
    assert.ok(unit9.occurrences.some(o => o.occurrenceId === occurrenceId && o.vocabularyId === vocabularyId), term);
    for (const original of originals) assert.ok(original.items.some(row => row.term === term && row.vocabularyId !== vocabularyId), `${term}: earlier original still present`);
    assert.deepEqual(item.senses[0].spellingErrors, originals[0].items.find(row => row.term === term).senses[0].spellingErrors, `${term} shares the reviewed spelling list`);
  }
});

test('Units 1–8 are unchanged: each release still equals its committed lock', () => {
  for (const [number, release] of [[1, unit1], [2, unit2], [3, unit3], [4, unit4], [5, unit5], [6, unit6], [7, unit7], [8, unit8]]) {
    const lock = readLock(number);
    assert.deepEqual(releaseFingerprint(release), { version: lock.version, contentChecksum: lock.contentChecksum, membershipChecksum: lock.membershipChecksum, words: lock.words, memberRows: lock.memberRows }, `Unit ${number}`);
  }
});

test('all six pathways are live; only the whole-set-of-10 remainder is held back (unlike is the only preposition, so Meaning and Context serve 49)', () => {
  assert.ok(!Object.keys(unit9).some(key => /unitCheck|game/i.test(key)));
  assert.ok(!unit9.activities.some(activity => /unit_check|game|connection/i.test(activity.contentType)));
  const readiness = evaluateUnitReadiness({ content: releasePlannerContent(unit9) });
  const by = key => Object.fromEntries(Object.values(readiness.pathways).map(p => [p.pathwayId, p[key]]));
  assert.deepEqual(by('live'), Object.fromEntries(PATHWAYS.map(id => [id, true])));
  assert.deepEqual(by('servedCount'), { meaning: 49, context: 49, word_families: 20, paraphrasing: 50, precision_use: 50, spelling_recall: 50 });
  assert.deepEqual(by('playableSetCount'), { meaning: 4, context: 4, word_families: 2, paraphrasing: 5, precision_use: 5, spelling_recall: 5 });
  assert.deepEqual(by('heldBackCount'), { meaning: 9, context: 9, word_families: 0, paraphrasing: 0, precision_use: 0, spelling_recall: 0 });
  assert.deepEqual(readiness.pathways.word_families.heldBackOccurrenceIds, []);
  for (const id of ['meaning', 'context']) assert.deepEqual(readiness.pathways[id].heldBackOccurrenceIds.map(stripId), held);
  assert.deepEqual(unit9.items.filter(item => item.partOfSpeech === 'preposition').map(item => item.term), ['unlike']);
});

test('Set membership covers Unit 9 occurrences only, in 25 whole Sets of ten, and the committed SQL matches it', () => {
  const rows = membershipRows([unit9]);
  const occurrenceIds = new Set(unit9.occurrences.map(o => o.occurrenceId));
  assert.equal(rows.length, 250);
  assert.ok(rows.every(row => row.unit === 9 && occurrenceIds.has(row.occurrenceId)));
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
  for (const id of ['meaning', 'context']) assert.ok(held.every(term => !heldRows(id).includes(term)));
  const sql = read('unit-09-set-membership.sql');
  assert.ok(sql.includes(membershipSql(rows)));
  assert.ok(sql.includes(`membership checksum ${membershipChecksum(rows)}`));
  assert.ok(!/u[1-8]_/.test(sql));
  assert.ok(!/^\s*(delete from|truncate|drop |update )/im.test(sql));
});

test('the lock matches the release, release discovery and tooling know Units 1–9, and generation is deterministic and byte-identical to the committed SQL', () => {
  const lock = readLock(9);
  assert.equal(lock.version, 'unit-09/v1');
  assert.equal(contentVersionFor(9), 'unit-09/v1');
  assert.equal(lock.words, 50);
  assert.equal(lock.memberRows, 250);
  assert.deepEqual(releaseFingerprint(unit9), { version: lock.version, contentChecksum: lock.contentChecksum, membershipChecksum: lock.membershipChecksum, words: lock.words, memberRows: lock.memberRows });
  assert.deepEqual(releaseNumbers(), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const first = generatedChunks(9);
  const second = generatedChunks(9);
  assert.equal(first.length, 5);
  assert.deepEqual(first.map(c => c.text), second.map(c => c.text), 'two generations are byte-identical');
  for (const { number, text } of first) assert.equal(text, fs.readFileSync(outFile(number, 9), 'utf8'), `chunk ${number} must match the committed file`);
  assert.equal(membershipChecksum(membershipRows([unit9])), lock.membershipChecksum);
});

test('the Unit 9 sync SQL only upserts Unit 9 rows: no earlier-unit id, no delete, the _9 ids present, British spelling intact', () => {
  const all = [1, 2, 3, 4, 5].map(n => read(`unit-09-sync-chunk-${n}.sql`)).join('\n');
  for (const n of [1, 2, 3, 4, 5]) {
    const sql = read(`unit-09-sync-chunk-${n}.sql`);
    assert.ok(!/'u[1-8]_/.test(sql), `chunk ${n}`);
    assert.ok(!/^\s*(delete from|truncate|drop )/im.test(sql), `chunk ${n}`);
  }
  for (const [, [vocabularyId, occurrenceId]] of Object.entries(ISOLATED)) {
    assert.ok(all.includes(`'${vocabularyId}'`), vocabularyId);
    assert.ok(all.includes(`'${occurrenceId}'`), occurrenceId);
  }
  assert.ok(!/'vocab_(effective|demonstrate|launched|passive|interactive|generation|recommend|solution|evaluate|relevant)'/.test(all), 'no earlier-unit lexical id appears in the Unit 9 SQL');
  // Reviewed spelling lists deliberately contain wrong spellings, so they are excluded.
  const noSpelling = value => value.replace(/"spellingErrors":\[[^\]]*\]/g, '').replace(/'\[(?:"[a-z' -]+",?)+\]'/g, '');
  const text = noSpelling(JSON.stringify(unit9));
  assert.ok(/signalling/.test(text));
  assert.ok(!/\bsignaling\b|organize|recognize|summarize|emphasize|criticize/i.test(text + noSpelling(all)));
});

test('this packaging adds no Supabase migration for Unit 9', () => {
  const migrations = fs.existsSync(new URL('../supabase/migrations/', import.meta.url)) ? fs.readdirSync(new URL('../supabase/migrations/', import.meta.url)) : [];
  assert.ok(!migrations.some(name => /unit[-_]?0?9/i.test(name)), 'no Unit 9 migration');
});

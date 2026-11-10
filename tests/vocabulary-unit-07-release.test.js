// Unit 7 (Interviews) release packaging: the live release, its lock, its generated SQL and its isolation from Units 1–6.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import approved from '../content/vocabulary/units/unit-07.js';
import unit1 from '../content/vocabulary/releases/unit-01.js';
import unit2 from '../content/vocabulary/releases/unit-02.js';
import unit3 from '../content/vocabulary/releases/unit-03.js';
import unit4 from '../content/vocabulary/releases/unit-04.js';
import unit5 from '../content/vocabulary/releases/unit-05.js';
import unit6 from '../content/vocabulary/releases/unit-06.js';
import unit7 from '../content/vocabulary/releases/unit-07.js';
import { membershipRows, membershipChecksum, membershipSql } from '../scripts/generate-set-membership-sql.mjs';
import { releaseFingerprint, readLock } from '../scripts/vocabulary-content-checksum.mjs';
import { generatedChunks, outFile } from '../scripts/generate-unit1-sync-sql.mjs';
import { releaseNumbers, contentVersionFor } from '../scripts/vocabulary-releases.mjs';
import { releasePlannerContent } from '../content/vocabulary/readiness-report.js';
import { evaluateUnitReadiness } from '../src/vocabulary/pathway-readiness.js';

const read = name => fs.readFileSync(new URL(`../docs/vocabulary-content-updates/${name}`, import.meta.url), 'utf8');
const exists = path => fs.existsSync(new URL(`../${path}`, import.meta.url));
const overlap = (a, b) => [...new Set(a)].filter(value => new Set(b).has(value));
const earlier = [unit1, unit2, unit3, unit4, unit5, unit6];
const ISOLATED = {
  availability: ['vocab_availability_7', 'u7_16_availability_7', [unit2, unit5]],
  strategy: ['vocab_strategy_7', 'u7_19_strategy_7', [unit6]],
  respond: ['vocab_respond_7', 'u7_24_respond_7', [unit6]],
  relevant: ['vocab_relevant_7', 'u7_25_relevant_7', [unit2]],
  qualification: ['vocab_qualification_7', 'u7_33_qualification_7', [unit5]],
  confidence: ['vocab_confidence_7', 'u7_35_confidence_7', [unit6]],
  anxious: ['vocab_anxious_7', 'u7_36_anxious_7', [unit4]],
  technique: ['vocab_technique_7', 'u7_38_technique_7', [unit6]],
  evaluate: ['vocab_evaluate_7', 'u7_39_evaluate_7', [unit3, unit5, unit6]],
  criteria: ['vocab_criteria_7', 'u7_48_criteria_7', [unit1]]
};
const stripId = id => id.replace(/^u7_\d+_/, '');
const PATHWAYS = ['meaning', 'context', 'word_families', 'paraphrasing', 'precision_use', 'spelling_recall'];
const held = ['organise', 'distribute', 'responsible', 'visual', 'accurate'];

test('one authoritative Unit 7 source: approved unit-07.js exists, the draft is gone, and the release promotes it unchanged', () => {
  assert.ok(exists('content/vocabulary/units/unit-07.js'));
  assert.ok(!exists('content/vocabulary/units/unit-07-draft.js'), 'no conflicting draft source');
  assert.ok(exists('content/vocabulary/releases/unit-07.js'));
  assert.equal(approved.status, 'approved');
  assert.equal(unit7.status, 'live');
  assert.deepEqual(unit7.items.map(item => item.term), approved.items.map(item => item.term));
  assert.deepEqual(unit7.occurrences.map(row => row.occurrenceId), approved.occurrences.map(row => row.occurrenceId));
  assert.equal(unit7.contexts.length, approved.contexts.length);
  assert.equal(unit7.activities.length, approved.activities.length);
});

test('Unit 7 is a live release of exactly 50 targets with the audited record counts', () => {
  assert.equal(unit7.unitNumber, 7);
  assert.equal(unit7.unitTitle, 'Interviews');
  assert.equal(unit7.items.length, 50);
  assert.equal(new Set(unit7.items.map(item => item.term)).size, 50);
  assert.equal(new Set(unit7.items.map(item => item.vocabularyId)).size, 50);
  assert.equal(unit7.occurrences.length, 50);
  assert.equal(new Set(unit7.occurrences.map(o => o.occurrenceId)).size, 50);
  assert.deepEqual(unit7.occurrences.map(o => o.positionInUnit), Array.from({ length: 50 }, (_, i) => i + 1));
  assert.equal(unit7.items[0].term, 'applicant');
  assert.equal(unit7.items[3].term, 'summary');
  assert.equal(unit7.items[49].term, 'punctuation');
  assert.equal(unit7.contexts.length, 300);
  assert.equal(new Set(unit7.contexts.map(c => c.contextId)).size, 300);
  assert.equal(unit7.activities.length, 275);
  assert.equal(new Set(unit7.activities.map(a => a.activityContentId)).size, 275);
  const types = {};
  for (const activity of unit7.activities) { const key = activity.activityData.taskType ?? activity.contentType; types[key] = (types[key] ?? 0) + 1; }
  assert.deepEqual(types, { phrase_set: 50, idea_set: 50, improve_vocabulary: 100, word_family: 75 });
  assert.ok([unit7.items, unit7.occurrences, unit7.contexts, unit7.activities].every(rows => rows.every(row => row.status === 'live')));
  assert.ok(unit7.occurrences.every(occurrence => occurrence.unitNumber === 7));
});

test('exactly 25 genuine Word Families with 3 items each; none is padded', () => {
  const families = unit7.items.filter(item => (item.senses[0].wordFamilyForms ?? []).length >= 3).map(item => item.term);
  assert.equal(families.length, 25);
  const items = unit7.activities.filter(a => a.activityData.taskType === 'word_family');
  assert.equal(items.length, 75);
  for (const term of families) assert.equal(items.filter(a => a.activityData.primaryEvidenceTargetId === unit7.items.find(i => i.term === term).vocabularyId).length, 3, term);
});

test('nothing is shared with Units 1–6; the ten overlapping lexical targets have their own Unit 7 rows and the earlier rows are untouched', () => {
  for (const other of earlier) {
    assert.deepEqual(overlap(unit7.items.map(i => i.vocabularyId), other.items.map(i => i.vocabularyId)), []);
    assert.deepEqual(overlap(unit7.occurrences.map(o => o.occurrenceId), other.occurrences.map(o => o.occurrenceId)), []);
    assert.deepEqual(overlap(unit7.contexts.map(c => c.contextId ?? c.id), other.contexts.map(c => c.contextId ?? c.id)), []);
    assert.deepEqual(overlap(unit7.activities.map(a => a.activityContentId), other.activities.map(a => a.activityContentId)), []);
  }
  assert.deepEqual(unit7.items.filter(item => /_7$/.test(item.vocabularyId)).map(item => item.term), Object.keys(ISOLATED));
  for (const [term, [vocabularyId, occurrenceId, originals]] of Object.entries(ISOLATED)) {
    const item = unit7.items.find(row => row.term === term);
    assert.equal(item.vocabularyId, vocabularyId, term);
    assert.ok(unit7.occurrences.some(o => o.occurrenceId === occurrenceId && o.vocabularyId === vocabularyId), term);
    for (const original of originals) assert.ok(original.items.some(row => row.term === term && row.vocabularyId !== vocabularyId), `${term}: earlier original still present`);
    assert.deepEqual(item.senses[0].spellingErrors, originals[0].items.find(row => row.term === term).senses[0].spellingErrors, `${term} shares the reviewed spelling list`);
  }
});

test('Units 1–6 are unchanged: each release still equals its committed lock', () => {
  for (const [number, release] of [[1, unit1], [2, unit2], [3, unit3], [4, unit4], [5, unit5], [6, unit6]]) {
    const lock = readLock(number);
    assert.deepEqual(releaseFingerprint(release), { version: lock.version, contentChecksum: lock.contentChecksum, membershipChecksum: lock.membershipChecksum, words: lock.words, memberRows: lock.memberRows }, `Unit ${number}`);
  }
});

test('all six pathways are live; nothing is held back except the Word Family whole-set-of-10 remainder', () => {
  assert.ok(!Object.keys(unit7).some(key => /unitCheck|game/i.test(key)));
  assert.ok(!unit7.activities.some(activity => /unit_check|game|connection/i.test(activity.contentType)));
  const readiness = evaluateUnitReadiness({ content: releasePlannerContent(unit7) });
  const by = key => Object.fromEntries(Object.values(readiness.pathways).map(p => [p.pathwayId, p[key]]));
  assert.deepEqual(by('live'), Object.fromEntries(PATHWAYS.map(id => [id, true])));
  assert.deepEqual(by('servedCount'), { meaning: 50, context: 50, word_families: 25, paraphrasing: 50, precision_use: 50, spelling_recall: 50 });
  assert.deepEqual(by('playableSetCount'), { meaning: 5, context: 5, word_families: 2, paraphrasing: 5, precision_use: 5, spelling_recall: 5 });
  assert.deepEqual(by('heldBackCount'), { meaning: 0, context: 0, word_families: 5, paraphrasing: 0, precision_use: 0, spelling_recall: 0 });
  assert.deepEqual(readiness.pathways.word_families.heldBackOccurrenceIds.map(stripId), held);
  assert.deepEqual(unit7.items.filter(item => item.partOfSpeech === 'adverb'), []);
});

test('Set membership covers Unit 7 occurrences only, in 27 whole Sets of ten, and the committed SQL matches it', () => {
  const rows = membershipRows([unit7]);
  const occurrenceIds = new Set(unit7.occurrences.map(o => o.occurrenceId));
  assert.equal(rows.length, 270);
  assert.ok(rows.every(row => row.unit === 7 && occurrenceIds.has(row.occurrenceId)));
  assert.equal(new Set(rows.map(row => `${row.pathway}|${row.occurrenceId}`)).size, rows.length, 'no duplicate (pathway, occurrence)');
  assert.equal(new Set(rows.map(row => `${row.pathway}|${row.set}|${row.position}`)).size, rows.length, 'no duplicate positions');
  const sets = new Map();
  for (const row of rows) sets.set(`${row.pathway}/${row.set}`, (sets.get(`${row.pathway}/${row.set}`) ?? 0) + 1);
  assert.equal(sets.size, 27);
  assert.ok([...sets.values()].every(count => count === 10));
  const perPathway = {};
  for (const row of rows) perPathway[row.pathway] = (perPathway[row.pathway] ?? 0) + 1;
  assert.deepEqual(perPathway, { meaning: 50, context: 50, word_families: 20, paraphrasing: 50, precision_use: 50, spelling_recall: 50 });
  const heldRows = pathway => rows.filter(row => row.pathway === pathway).map(row => stripId(row.occurrenceId));
  assert.ok(held.every(term => !heldRows('word_families').includes(term)));
  const sql = read('unit-07-set-membership.sql');
  assert.ok(sql.includes(membershipSql(rows)));
  assert.ok(sql.includes(`membership checksum ${membershipChecksum(rows)}`));
  assert.ok(!/u[1-6]_/.test(sql));
  assert.ok(!/^\s*(delete from|truncate|drop |update )/im.test(sql));
});

test('the lock matches the release, release discovery and tooling know Units 1–6, and generation is deterministic and byte-identical to the committed SQL', () => {
  const lock = readLock(7);
  assert.equal(lock.version, 'unit-07/v1');
  assert.equal(contentVersionFor(7), 'unit-07/v1');
  assert.equal(lock.words, 50);
  assert.equal(lock.memberRows, 270);
  assert.deepEqual(releaseFingerprint(unit7), { version: lock.version, contentChecksum: lock.contentChecksum, membershipChecksum: lock.membershipChecksum, words: lock.words, memberRows: lock.memberRows });
  assert.deepEqual(releaseNumbers(), [1, 2, 3, 4, 5, 6, 7]);
  const first = generatedChunks(7);
  const second = generatedChunks(7);
  assert.equal(first.length, 5);
  assert.deepEqual(first.map(c => c.text), second.map(c => c.text), 'two generations are byte-identical');
  for (const { number, text } of first) assert.equal(text, fs.readFileSync(outFile(number, 7), 'utf8'), `chunk ${number} must match the committed file`);
  assert.equal(membershipChecksum(membershipRows([unit7])), lock.membershipChecksum);
});

test('the Unit 7 sync SQL only upserts Unit 7 rows: no earlier-unit id, no delete, the _7 ids present, British spelling intact', () => {
  const all = [1, 2, 3, 4, 5].map(n => read(`unit-07-sync-chunk-${n}.sql`)).join('\n');
  for (const n of [1, 2, 3, 4, 5]) {
    const sql = read(`unit-07-sync-chunk-${n}.sql`);
    assert.ok(!/'u[1-6]_/.test(sql), `chunk ${n}`);
    assert.ok(!/^\s*(delete from|truncate|drop )/im.test(sql), `chunk ${n}`);
  }
  for (const [, [vocabularyId, occurrenceId]] of Object.entries(ISOLATED)) {
    assert.ok(all.includes(`'${vocabularyId}'`), vocabularyId);
    assert.ok(all.includes(`'${occurrenceId}'`), occurrenceId);
  }
  assert.ok(!/'vocab_(availability|strategy|respond|relevant|qualification|confidence|anxious|technique|evaluate|criteria)'/.test(all), 'no earlier-unit lexical id appears in the Unit 7 SQL');
  const text = JSON.stringify(unit7);
  assert.ok(/organise/.test(text) && /proofread/.test(text));
  assert.ok(!/organize|summarize|memorize|prioritize|recognize/i.test(text + all));
});

test('this packaging adds no Supabase, Edge Function, Unit Check or Games artefact for Unit 7', () => {
  for (const path of ['content/vocabulary/units/unit-07-unit-check.js', 'content/vocabulary/units/unit-07-games.js']) assert.ok(!exists(path), path);
  const migrations = fs.existsSync(new URL('../supabase/migrations/', import.meta.url)) ? fs.readdirSync(new URL('../supabase/migrations/', import.meta.url)) : [];
  assert.ok(!migrations.some(name => /unit[-_]?0?7/i.test(name)), 'no Unit 7 migration');
});

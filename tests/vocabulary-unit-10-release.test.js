// Unit 10 (Education) release packaging: the live release, its lock, its generated SQL and its isolation from Units 1–9.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import approved from '../content/vocabulary/units/unit-10.js';
import unit1 from '../content/vocabulary/releases/unit-01.js';
import unit2 from '../content/vocabulary/releases/unit-02.js';
import unit3 from '../content/vocabulary/releases/unit-03.js';
import unit4 from '../content/vocabulary/releases/unit-04.js';
import unit5 from '../content/vocabulary/releases/unit-05.js';
import unit6 from '../content/vocabulary/releases/unit-06.js';
import unit7 from '../content/vocabulary/releases/unit-07.js';
import unit8 from '../content/vocabulary/releases/unit-08.js';
import unit9 from '../content/vocabulary/releases/unit-09.js';
import unit10 from '../content/vocabulary/releases/unit-10.js';
import { membershipRows, membershipChecksum, membershipSql } from '../scripts/generate-set-membership-sql.mjs';
import { releaseFingerprint, readLock } from '../scripts/vocabulary-content-checksum.mjs';
import { generatedChunks, outFile } from '../scripts/generate-unit1-sync-sql.mjs';
import { releaseNumbers, contentVersionFor } from '../scripts/vocabulary-releases.mjs';
import { releasePlannerContent } from '../content/vocabulary/readiness-report.js';
import { evaluateUnitReadiness } from '../src/vocabulary/pathway-readiness.js';

const read = name => fs.readFileSync(new URL(`../docs/vocabulary-content-updates/${name}`, import.meta.url), 'utf8');
const exists = path => fs.existsSync(new URL(`../${path}`, import.meta.url));
const overlap = (a, b) => [...new Set(a)].filter(value => new Set(b).has(value));
const earlier = [unit1, unit2, unit3, unit4, unit5, unit6, unit7, unit8, unit9];
const ISOLATED = {
  academic: ['vocab_academic_10', 'u10_04_academic_10', [unit6]],
  reflect: ['vocab_reflect_10', 'u10_12_reflect_10', [unit6]],
  contribute: ['vocab_contribute_10', 'u10_14_contribute_10', [unit7]],
  employment: ['vocab_employment_10', 'u10_18_employment_10', [unit8]],
  assignment: ['vocab_assignment_10', 'u10_27_assignment_10', [unit8]],
  confidence: ['vocab_confidence_10', 'u10_41_confidence_10', [unit6, unit7]],
  challenge: ['vocab_challenge_10', 'u10_42_challenge_10', [unit1]],
  research: ['vocab_research_10', 'u10_43_research_10', [unit9]],
  evaluate: ['vocab_evaluate_10', 'u10_44_evaluate_10', [unit3, unit5, unit6, unit7, unit9]],
  communicate: ['vocab_communicate_10', 'u10_45_communicate_10', [unit2]],
  preference: ['vocab_preference_10', 'u10_46_preference_10', [unit1]],
  achievement: ['vocab_achievement_10', 'u10_47_achievement_10', [unit1, unit6]],
  qualification: ['vocab_qualification_10', 'u10_48_qualification_10', [unit5, unit7]]
};
const stripId = id => id.replace(/^u10_\d+_/, '');
const PATHWAYS = ['meaning', 'context', 'word_families', 'paraphrasing', 'precision_use', 'spelling_recall'];
// The 0511 Unit 10 list has 48 words, so only four whole Sets of ten fit; the eight repeated words placed last (41–48) are the remainder.
const REMAINDER = ['confidence_10', 'challenge_10', 'research_10', 'evaluate_10', 'communicate_10', 'preference_10', 'achievement_10', 'qualification_10'];

test('one authoritative Unit 10 source: approved unit-10.js exists, the draft is gone, and the release promotes it unchanged', () => {
  assert.ok(exists('content/vocabulary/units/unit-10.js'));
  assert.ok(!exists('content/vocabulary/units/unit-10-draft.js'), 'no conflicting draft source');
  assert.ok(exists('content/vocabulary/releases/unit-10.js'));
  assert.equal(approved.status, 'approved');
  assert.equal(unit10.status, 'live');
  assert.deepEqual(unit10.items.map(item => item.term), approved.items.map(item => item.term));
  assert.deepEqual(unit10.occurrences.map(row => row.occurrenceId), approved.occurrences.map(row => row.occurrenceId));
  assert.equal(unit10.contexts.length, approved.contexts.length);
  assert.equal(unit10.activities.length, approved.activities.length);
});

test('Unit 10 is a live release of exactly 48 targets (the supplied 0511 list) with the audited record counts', () => {
  assert.equal(unit10.unitNumber, 10);
  assert.equal(unit10.unitTitle, 'Education');
  assert.equal(unit10.items.length, 48);
  assert.equal(new Set(unit10.items.map(item => item.term)).size, 48);
  assert.equal(new Set(unit10.items.map(item => item.vocabularyId)).size, 48);
  assert.equal(unit10.occurrences.length, 48);
  assert.equal(new Set(unit10.occurrences.map(o => o.occurrenceId)).size, 48);
  assert.deepEqual(unit10.occurrences.map(o => o.positionInUnit), Array.from({ length: 48 }, (_, i) => i + 1));
  assert.equal(unit10.items[0].term, 'education');
  assert.equal(unit10.items[3].term, 'academic');
  assert.equal(unit10.items[47].term, 'qualification');
  assert.equal(unit10.contexts.length, 288);
  assert.equal(new Set(unit10.contexts.map(c => c.contextId)).size, 288);
  assert.equal(unit10.activities.length, 270);
  assert.equal(new Set(unit10.activities.map(a => a.activityContentId)).size, 270);
  const types = {};
  for (const activity of unit10.activities) { const key = activity.activityData.taskType ?? activity.contentType; types[key] = (types[key] ?? 0) + 1; }
  assert.deepEqual(types, { phrase_set: 48, idea_set: 48, improve_vocabulary: 96, word_family: 78 });
  assert.ok([unit10.items, unit10.occurrences, unit10.contexts, unit10.activities].every(rows => rows.every(row => row.status === 'live')));
  assert.ok(unit10.occurrences.every(occurrence => occurrence.unitNumber === 10));
});

test('exactly 26 genuine Word Families with 3 items each; none is padded', () => {
  const families = unit10.items.filter(item => (item.senses[0].wordFamilyForms ?? []).length >= 3).map(item => item.term);
  assert.equal(families.length, 26);
  const items = unit10.activities.filter(a => a.activityData.taskType === 'word_family');
  assert.equal(items.length, 78);
  for (const term of families) assert.equal(items.filter(a => a.activityData.primaryEvidenceTargetId === unit10.items.find(i => i.term === term).vocabularyId).length, 3, term);
});

test('nothing is shared with Units 1–9; the thirteen overlapping lexical targets have their own Unit 10 rows and the earlier rows are untouched', () => {
  for (const other of earlier) {
    assert.deepEqual(overlap(unit10.items.map(i => i.vocabularyId), other.items.map(i => i.vocabularyId)), []);
    assert.deepEqual(overlap(unit10.occurrences.map(o => o.occurrenceId), other.occurrences.map(o => o.occurrenceId)), []);
    assert.deepEqual(overlap(unit10.contexts.map(c => c.contextId ?? c.id), other.contexts.map(c => c.contextId ?? c.id)), []);
    assert.deepEqual(overlap(unit10.activities.map(a => a.activityContentId), other.activities.map(a => a.activityContentId)), []);
  }
  assert.deepEqual(unit10.items.filter(item => /_10$/.test(item.vocabularyId)).map(item => item.term), Object.keys(ISOLATED));
  for (const [term, [vocabularyId, occurrenceId, originals]] of Object.entries(ISOLATED)) {
    const item = unit10.items.find(row => row.term === term);
    assert.equal(item.vocabularyId, vocabularyId, term);
    assert.ok(unit10.occurrences.some(o => o.occurrenceId === occurrenceId && o.vocabularyId === vocabularyId), term);
    for (const original of originals) assert.ok(original.items.some(row => row.term === term && row.vocabularyId !== vocabularyId), `${term}: earlier original still present`);
    assert.deepEqual(item.senses[0].spellingErrors, originals[0].items.find(row => row.term === term).senses[0].spellingErrors, `${term} shares the reviewed spelling list`);
  }
});

test('Units 1–9 are unchanged: each release still equals its committed lock', () => {
  for (const [number, release] of [[1, unit1], [2, unit2], [3, unit3], [4, unit4], [5, unit5], [6, unit6], [7, unit7], [8, unit8], [9, unit9]]) {
    const lock = readLock(number);
    assert.deepEqual(releaseFingerprint(release), { version: lock.version, contentChecksum: lock.contentChecksum, membershipChecksum: lock.membershipChecksum, words: lock.words, memberRows: lock.memberRows }, `Unit ${number}`);
  }
});

test('all six pathways are live; only the whole-set-of-10 remainder is held back (accurately and effectively are the only adverbs, so Meaning and Context cannot serve them)', () => {
  assert.ok(!Object.keys(unit10).some(key => /unitCheck|game/i.test(key)));
  assert.ok(!unit10.activities.some(activity => /unit_check|game|connection/i.test(activity.contentType)));
  const readiness = evaluateUnitReadiness({ content: releasePlannerContent(unit10) });
  const by = key => Object.fromEntries(Object.values(readiness.pathways).map(p => [p.pathwayId, p[key]]));
  assert.deepEqual(by('live'), Object.fromEntries(PATHWAYS.map(id => [id, true])));
  assert.deepEqual(by('servedCount'), { meaning: 46, context: 45, word_families: 26, paraphrasing: 48, precision_use: 48, spelling_recall: 48 });
  assert.deepEqual(by('playableSetCount'), { meaning: 4, context: 4, word_families: 2, paraphrasing: 4, precision_use: 4, spelling_recall: 4 });
  assert.deepEqual(by('heldBackCount'), { meaning: 6, context: 5, word_families: 6, paraphrasing: 8, precision_use: 8, spelling_recall: 8 });
  for (const id of ['paraphrasing', 'precision_use', 'spelling_recall']) assert.deepEqual(readiness.pathways[id].heldBackOccurrenceIds.map(stripId), REMAINDER);
  assert.deepEqual(readiness.pathways.meaning.heldBackOccurrenceIds.map(stripId), REMAINDER.slice(2));
  assert.deepEqual(readiness.pathways.context.heldBackOccurrenceIds.map(stripId), REMAINDER.slice(3));
  assert.deepEqual(readiness.pathways.word_families.heldBackOccurrenceIds.map(stripId), ['confidence_10', 'challenge_10', ...REMAINDER.slice(4)]);
  assert.deepEqual(unit10.items.filter(item => item.partOfSpeech === 'adverb').map(item => item.term), ['accurately', 'effectively']);
});

test('Set membership covers Unit 10 occurrences only, in 22 whole Sets of ten, and the committed SQL matches it', () => {
  const rows = membershipRows([unit10]);
  const occurrenceIds = new Set(unit10.occurrences.map(o => o.occurrenceId));
  assert.equal(rows.length, 220);
  assert.ok(rows.every(row => row.unit === 10 && occurrenceIds.has(row.occurrenceId)));
  assert.equal(new Set(rows.map(row => `${row.pathway}|${row.occurrenceId}`)).size, rows.length, 'no duplicate (pathway, occurrence)');
  assert.equal(new Set(rows.map(row => `${row.pathway}|${row.set}|${row.position}`)).size, rows.length, 'no duplicate positions');
  const sets = new Map();
  for (const row of rows) sets.set(`${row.pathway}/${row.set}`, (sets.get(`${row.pathway}/${row.set}`) ?? 0) + 1);
  assert.equal(sets.size, 22);
  assert.ok([...sets.values()].every(count => count === 10));
  const perPathway = {};
  for (const row of rows) perPathway[row.pathway] = (perPathway[row.pathway] ?? 0) + 1;
  assert.deepEqual(perPathway, { meaning: 40, context: 40, word_families: 20, paraphrasing: 40, precision_use: 40, spelling_recall: 40 });
  const heldRows = pathway => rows.filter(row => row.pathway === pathway).map(row => stripId(row.occurrenceId));
  const readiness = evaluateUnitReadiness({ content: releasePlannerContent(unit10) });
  for (const id of PATHWAYS) assert.ok(readiness.pathways[id].heldBackOccurrenceIds.map(stripId).every(term => !heldRows(id).includes(term)), id);
  const sql = read('unit-10-set-membership.sql');
  assert.ok(sql.includes(membershipSql(rows)));
  assert.ok(sql.includes(`membership checksum ${membershipChecksum(rows)}`));
  assert.ok(!/u[1-9]_/.test(sql));
  assert.ok(!/^\s*(delete from|truncate|drop |update )/im.test(sql));
});

test('the lock matches the release, release discovery and tooling know Units 1–10, and generation is deterministic and byte-identical to the committed SQL', () => {
  const lock = readLock(10);
  assert.equal(lock.version, 'unit-10/v1');
  assert.equal(contentVersionFor(10), 'unit-10/v1');
  assert.equal(lock.words, 48);
  assert.equal(lock.memberRows, 220);
  assert.deepEqual(releaseFingerprint(unit10), { version: lock.version, contentChecksum: lock.contentChecksum, membershipChecksum: lock.membershipChecksum, words: lock.words, memberRows: lock.memberRows });
  assert.deepEqual(releaseNumbers(), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const first = generatedChunks(10);
  const second = generatedChunks(10);
  assert.equal(first.length, 5);
  assert.deepEqual(first.map(c => c.text), second.map(c => c.text), 'two generations are byte-identical');
  for (const { number, text } of first) assert.equal(text, fs.readFileSync(outFile(number, 10), 'utf8'), `chunk ${number} must match the committed file`);
  assert.equal(membershipChecksum(membershipRows([unit10])), lock.membershipChecksum);
});

test('the Unit 10 sync SQL only upserts Unit 10 rows: no earlier-unit id, no delete, the _10 ids present, British spelling intact', () => {
  const all = [1, 2, 3, 4, 5].map(n => read(`unit-10-sync-chunk-${n}.sql`)).join('\n');
  for (const n of [1, 2, 3, 4, 5]) {
    const sql = read(`unit-10-sync-chunk-${n}.sql`);
    assert.ok(!/'u[1-9]_/.test(sql), `chunk ${n}`);
    assert.ok(!/^\s*(delete from|truncate|drop )/im.test(sql), `chunk ${n}`);
  }
  for (const [, [vocabularyId, occurrenceId]] of Object.entries(ISOLATED)) {
    assert.ok(all.includes(`'${vocabularyId}'`), vocabularyId);
    assert.ok(all.includes(`'${occurrenceId}'`), occurrenceId);
  }
  assert.ok(!/'vocab_(academic|reflect|contribute|employment|assignment|confidence|challenge|research|evaluate|communicate|preference|achievement|qualification)'/.test(all), 'no earlier-unit lexical id appears in the Unit 10 SQL');
  // Reviewed spelling lists deliberately contain wrong spellings, so they are excluded.
  const noSpelling = value => value.replace(/"spellingErrors":\[[^\]]*\]/g, '').replace(/'\[(?:"[a-z' -]+",?)+\]'/g, '');
  const text = noSpelling(JSON.stringify(unit10));
  assert.ok(/\bpractis(e|ing)\b/.test(text));
  assert.ok(!/\bpracticing\b|organize|recognize|summarize|emphasize|criticize/i.test(text + noSpelling(all)));
});

test('this packaging adds no Supabase migration for Unit 10', () => {
  const migrations = fs.existsSync(new URL('../supabase/migrations/', import.meta.url)) ? fs.readdirSync(new URL('../supabase/migrations/', import.meta.url)) : [];
  assert.ok(!migrations.some(name => /unit[-_]?10/i.test(name)), 'no Unit 10 migration');
});

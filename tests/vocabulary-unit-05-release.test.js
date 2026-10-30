// Unit 5 (Holidays) release packaging: the live release, its lock, its generated SQL and its isolation from Units 1–4.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import approved from '../content/vocabulary/units/unit-05.js';
import unit1 from '../content/vocabulary/releases/unit-01.js';
import unit2 from '../content/vocabulary/releases/unit-02.js';
import unit3 from '../content/vocabulary/releases/unit-03.js';
import unit4 from '../content/vocabulary/releases/unit-04.js';
import unit5 from '../content/vocabulary/releases/unit-05.js';
import { membershipRows, membershipChecksum, membershipSql } from '../scripts/generate-set-membership-sql.mjs';
import { releaseFingerprint, readLock } from '../scripts/vocabulary-content-checksum.mjs';
import { generatedChunks, outFile } from '../scripts/generate-unit1-sync-sql.mjs';
import { releaseNumbers, contentVersionFor } from '../scripts/vocabulary-releases.mjs';
import { releasePlannerContent } from '../content/vocabulary/readiness-report.js';
import { evaluateUnitReadiness } from '../src/vocabulary/pathway-readiness.js';

const read = name => fs.readFileSync(new URL(`../docs/vocabulary-content-updates/${name}`, import.meta.url), 'utf8');
const exists = path => fs.existsSync(new URL(`../${path}`, import.meta.url));
const overlap = (a, b) => [...new Set(a)].filter(value => new Set(b).has(value));
const earlier = [unit1, unit2, unit3, unit4];
const ISOLATED = {
  breathtaking: ['vocab_breathtaking_5', 'u5_11_breathtaking_5', [unit4]],
  recommendation: ['vocab_recommendation_5', 'u5_37_recommendation_5', [unit3]],
  destination: ['vocab_destination_5', 'u5_39_destination_5', [unit4]],
  availability: ['vocab_availability_5', 'u5_40_availability_5', [unit2]],
  equipment: ['vocab_equipment_5', 'u5_42_equipment_5', [unit2, unit4]],
  evaluate: ['vocab_evaluate_5', 'u5_47_evaluate_5', [unit3]]
};
const FAMILIES = ['snorkelling', 'attractions', 'adventurous', 'spectacular', 'popular', 'preservation', 'exploring', 'observation', 'relaxation', 'recommendation', 'reservation', 'availability', 'specialise', 'qualification', 'location', 'equipment'];

test('one authoritative Unit 5 source: approved unit-05.js exists, the draft is gone, and the release promotes it unchanged', () => {
  assert.ok(exists('content/vocabulary/units/unit-05.js'));
  assert.ok(!exists('content/vocabulary/units/unit-05-draft.js'), 'no conflicting draft source');
  assert.ok(exists('content/vocabulary/releases/unit-05.js'));
  assert.equal(approved.status, 'approved');
  assert.equal(unit5.status, 'live');
  assert.deepEqual(unit5.items.map(item => item.term), approved.items.map(item => item.term));
  assert.deepEqual(unit5.occurrences.map(row => row.occurrenceId), approved.occurrences.map(row => row.occurrenceId));
  assert.equal(unit5.contexts.length, approved.contexts.length);
  assert.equal(unit5.activities.length, approved.activities.length);
});

test('Unit 5 is a live release of exactly 50 targets with the audited record counts', () => {
  assert.equal(unit5.unitNumber, 5);
  assert.equal(unit5.unitTitle, 'Holidays');
  assert.equal(unit5.items.length, 50);
  assert.equal(new Set(unit5.items.map(item => item.term)).size, 50);
  assert.equal(new Set(unit5.items.map(item => item.vocabularyId)).size, 50);
  assert.equal(unit5.occurrences.length, 50);
  assert.equal(new Set(unit5.occurrences.map(o => o.occurrenceId)).size, 50);
  assert.deepEqual(unit5.occurrences.map(o => o.positionInUnit), Array.from({ length: 50 }, (_, i) => i + 1));
  assert.equal(unit5.items[0].term, 'aerial tourism');
  assert.equal(unit5.items[49].term, 'excursion');
  assert.equal(unit5.contexts.length, 300);
  assert.equal(new Set(unit5.contexts.map(c => c.contextId)).size, 300);
  assert.equal(unit5.activities.length, 248);
  assert.equal(new Set(unit5.activities.map(a => a.activityContentId)).size, 248);
  const types = {};
  for (const activity of unit5.activities) { const key = activity.activityData.taskType ?? activity.contentType; types[key] = (types[key] ?? 0) + 1; }
  assert.deepEqual(types, { phrase_set: 50, idea_set: 50, improve_vocabulary: 100, word_family: 48 });
  assert.ok([unit5.items, unit5.occurrences, unit5.contexts, unit5.activities].every(rows => rows.every(row => row.status === 'live')));
  assert.ok(unit5.occurrences.every(occurrence => occurrence.unitNumber === 5));
});

test('exactly 16 genuine Word Families with 3 items each; none is padded', () => {
  const families = unit5.items.filter(item => (item.senses[0].wordFamilyForms ?? []).length >= 3).map(item => item.term);
  assert.deepEqual(families, FAMILIES.slice().sort((a, b) => unit5.items.findIndex(i => i.term === a) - unit5.items.findIndex(i => i.term === b)));
  const items = unit5.activities.filter(a => a.activityData.taskType === 'word_family');
  assert.equal(items.length, 48);
  for (const term of families) assert.equal(items.filter(a => a.activityData.primaryEvidenceTargetId === unit5.items.find(i => i.term === term).vocabularyId).length, 3, term);
});

test('nothing is shared with Units 1–4; the six duplicate lexical targets have their own Unit 5 rows and the earlier rows are untouched', () => {
  for (const other of earlier) {
    assert.deepEqual(overlap(unit5.items.map(i => i.vocabularyId), other.items.map(i => i.vocabularyId)), []);
    assert.deepEqual(overlap(unit5.occurrences.map(o => o.occurrenceId), other.occurrences.map(o => o.occurrenceId)), []);
    assert.deepEqual(overlap(unit5.contexts.map(c => c.contextId ?? c.id), other.contexts.map(c => c.contextId ?? c.id)), []);
    assert.deepEqual(overlap(unit5.activities.map(a => a.activityContentId), other.activities.map(a => a.activityContentId)), []);
  }
  assert.deepEqual(unit5.items.filter(item => /_5$/.test(item.vocabularyId)).map(item => item.term), Object.keys(ISOLATED));
  for (const [term, [vocabularyId, occurrenceId, originals]] of Object.entries(ISOLATED)) {
    const item = unit5.items.find(row => row.term === term);
    assert.equal(item.vocabularyId, vocabularyId, term);
    assert.ok(unit5.occurrences.some(o => o.occurrenceId === occurrenceId && o.vocabularyId === vocabularyId), term);
    for (const original of originals) assert.ok(original.items.some(row => row.term === term && row.vocabularyId !== vocabularyId), `${term}: earlier original still present`);
    assert.deepEqual(item.senses[0].spellingErrors, originals[0].items.find(row => row.term === term).senses[0].spellingErrors, `${term} shares the reviewed spelling list`);
  }
  for (const activity of unit5.activities.filter(a => a.activityData.taskType === 'word_family' && /equipment|recommendation|availability/.test(a.activityContentId))) {
    assert.ok(/_5$/.test(activity.activityData.linkedVocabularyIds[0]), activity.activityContentId);
  }
});

test('Units 1–4 are unchanged: each release still equals its committed lock', () => {
  for (const [number, release] of [[1, unit1], [2, unit2], [3, unit3], [4, unit4]]) {
    const lock = readLock(number);
    assert.deepEqual(releaseFingerprint(release), { version: lock.version, contentChecksum: lock.contentChecksum, membershipChecksum: lock.membershipChecksum, words: lock.words, memberRows: lock.memberRows }, `Unit ${number}`);
  }
});

test('Unit 5 carries no Unit Check or Games content; five pathways are live and Word Families is held back honestly (16 words, below its minimum)', () => {
  assert.ok(!Object.keys(unit5).some(key => /unitCheck|game/i.test(key)));
  assert.ok(!unit5.activities.some(activity => /unit_check|game|connection/i.test(activity.contentType)));
  const readiness = evaluateUnitReadiness({ content: releasePlannerContent(unit5) });
  const live = Object.fromEntries(Object.values(readiness.pathways).map(p => [p.pathwayId, p.live]));
  assert.deepEqual(live, { meaning: true, context: true, word_families: false, paraphrasing: true, precision_use: true, spelling_recall: true });
  assert.equal(readiness.pathways.word_families.servedCount, 16, 'Word Families is not padded');
  assert.deepEqual(Object.fromEntries(Object.values(readiness.pathways).map(p => [p.pathwayId, p.servedCount])), { meaning: 47, context: 47, word_families: 16, paraphrasing: 50, precision_use: 50, spelling_recall: 50 });
  assert.deepEqual(Object.fromEntries(Object.values(readiness.pathways).map(p => [p.pathwayId, p.playableSetCount])), { meaning: 4, context: 4, word_families: 0, paraphrasing: 5, precision_use: 5, spelling_recall: 5 });
  const held = Object.fromEntries(Object.values(readiness.pathways).map(p => [p.pathwayId, p.heldBackCount]));
  assert.deepEqual(held, { meaning: 7, context: 7, word_families: 6, paraphrasing: 0, precision_use: 0, spelling_recall: 0 });
  // The only three verbs cannot enter the same-part-of-speech stages; no verbs were added.
  assert.deepEqual(unit5.items.filter(item => item.partOfSpeech === 'verb').map(item => item.term), ['obtain', 'specialise', 'evaluate']);
  const stageFailed = (pathwayId, term) => ['recognise', 'match', 'apply', 'recall', 'mastery'].filter(stage => (readiness.pathways[pathwayId].stageFailures[stage] ?? []).some(f => f.occurrenceId === unit5.occurrences.find(o => o.vocabularyId === unit5.items.find(i => i.term === term).vocabularyId).occurrenceId));
  for (const verb of ['obtain', 'specialise', 'evaluate']) {
    assert.deepEqual(stageFailed('meaning', verb), ['match'], verb);
    assert.deepEqual(stageFailed('context', verb), ['recognise', 'apply', 'recall'], verb);
  }
});

test('Set membership covers Unit 5 occurrences only, in 23 whole Sets of ten (Word Families emits none), and the committed SQL matches it', () => {
  const rows = membershipRows([unit5]);
  const occurrenceIds = new Set(unit5.occurrences.map(o => o.occurrenceId));
  assert.equal(rows.length, 230);
  assert.ok(rows.every(row => row.unit === 5 && occurrenceIds.has(row.occurrenceId)));
  assert.equal(new Set(rows.map(row => `${row.pathway}|${row.occurrenceId}`)).size, rows.length, 'no duplicate (pathway, occurrence)');
  assert.equal(new Set(rows.map(row => `${row.pathway}|${row.set}|${row.position}`)).size, rows.length, 'no duplicate positions');
  const sets = new Map();
  for (const row of rows) sets.set(`${row.pathway}/${row.set}`, (sets.get(`${row.pathway}/${row.set}`) ?? 0) + 1);
  assert.equal(sets.size, 23);
  assert.ok([...sets.values()].every(count => count === 10));
  const perPathway = {};
  for (const row of rows) perPathway[row.pathway] = (perPathway[row.pathway] ?? 0) + 1;
  assert.deepEqual(perPathway, { meaning: 40, context: 40, paraphrasing: 50, precision_use: 50, spelling_recall: 50 });
  const sql = read('unit-05-set-membership.sql');
  assert.ok(sql.includes(membershipSql(rows)));
  assert.ok(sql.includes(`membership checksum ${membershipChecksum(rows)}`));
  assert.ok(!/word_families/.test(sql), 'no Word Families membership is emitted while the pathway is held back');
  assert.ok(!/u[1-4]_/.test(sql));
  assert.ok(!/^\s*(delete from|truncate|drop |update )/im.test(sql));
});

test('the lock matches the release, release discovery and tooling know Units 1–5, and generation is deterministic and byte-identical to the committed SQL', () => {
  const lock = readLock(5);
  assert.equal(lock.version, 'unit-05/v1');
  assert.equal(contentVersionFor(5), 'unit-05/v1');
  assert.equal(lock.words, 50);
  assert.equal(lock.memberRows, 230);
  assert.deepEqual(releaseFingerprint(unit5), { version: lock.version, contentChecksum: lock.contentChecksum, membershipChecksum: lock.membershipChecksum, words: lock.words, memberRows: lock.memberRows });
  assert.deepEqual(releaseNumbers(), [1, 2, 3, 4, 5]);
  const first = generatedChunks(5);
  const second = generatedChunks(5);
  assert.equal(first.length, 5);
  assert.deepEqual(first.map(c => c.text), second.map(c => c.text), 'two generations are byte-identical');
  for (const { number, text } of first) assert.equal(text, fs.readFileSync(outFile(number, 5), 'utf8'), `chunk ${number} must match the committed file`);
  assert.equal(releaseFingerprint(unit5).contentChecksum, releaseFingerprint(unit5).contentChecksum);
  assert.equal(membershipChecksum(membershipRows([unit5])), lock.membershipChecksum);
});

test('the Unit 5 sync SQL only upserts Unit 5 rows: no earlier-unit id, no delete, the _5 ids present, British spelling intact', () => {
  const all = [1, 2, 3, 4, 5].map(n => read(`unit-05-sync-chunk-${n}.sql`)).join('\n');
  for (const n of [1, 2, 3, 4, 5]) {
    const sql = read(`unit-05-sync-chunk-${n}.sql`);
    assert.ok(!/'u[1-4]_/.test(sql), `chunk ${n}`);
    assert.ok(!/^\s*(delete from|truncate|drop )/im.test(sql), `chunk ${n}`);
  }
  for (const [, [vocabularyId, occurrenceId]] of Object.entries(ISOLATED)) {
    assert.ok(all.includes(`'${vocabularyId}'`), vocabularyId);
    assert.ok(all.includes(`'${occurrenceId}'`), occurrenceId);
  }
  assert.ok(!/'vocab_(breathtaking|recommendation|destination|availability|equipment|evaluate|equipment_4|breathtaking_4)'/.test(all), 'no earlier-unit lexical id appears in the Unit 5 SQL');
  const text = JSON.stringify(unit5);
  assert.ok(/specialise/.test(text) && /licence/.test(text) && /snorkelling/.test(text));
  assert.ok(!/\b(specialize|organized|neighbors|traveling)\b/i.test(JSON.stringify(unit5.contexts) + JSON.stringify(unit5.activities)));
});

test('this packaging adds no Supabase, Edge Function, artwork, Unit Check or Games artefact for Unit 5', () => {
  assert.ok(!exists('assets/vocabulary/units/unit-05.png'));
  for (const path of ['content/vocabulary/units/unit-05-unit-check.js', 'content/vocabulary/units/unit-05-games.js']) assert.ok(!exists(path), path);
  const migrations = fs.existsSync(new URL('../supabase/migrations/', import.meta.url)) ? fs.readdirSync(new URL('../supabase/migrations/', import.meta.url)) : [];
  assert.ok(!migrations.some(name => /unit[-_]?0?5/i.test(name)), 'no Unit 5 migration');
});

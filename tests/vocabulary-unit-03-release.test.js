// Unit 3 (Food) release packaging: the live release, its lock, its generated SQL and its isolation from Units 1 and 2.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import unit1 from '../content/vocabulary/releases/unit-01.js';
import unit2 from '../content/vocabulary/releases/unit-02.js';
import unit3 from '../content/vocabulary/releases/unit-03.js';
import { membershipRows, membershipChecksum, membershipSql } from '../scripts/generate-set-membership-sql.mjs';
import { releasePlannerContent } from '../content/vocabulary/readiness-report.js';
import { evaluateUnitReadiness } from '../src/vocabulary/pathway-readiness.js';

const read = name => fs.readFileSync(new URL(`../docs/vocabulary-content-updates/${name}`, import.meta.url), 'utf8');
const overlap = (a, b) => [...new Set(a)].filter(value => new Set(b).has(value));

test('Unit 3 is a live release of exactly 50 targets with the audited record counts', () => {
  assert.equal(unit3.status, 'live');
  assert.equal(unit3.unitNumber, 3);
  assert.equal(unit3.items.length, 50);
  assert.equal(new Set(unit3.items.map(item => item.term)).size, 50);
  assert.equal(unit3.occurrences.length, 50);
  assert.equal(unit3.contexts.length, 300);
  assert.equal(unit3.activities.length, 296);
  const types = {};
  for (const activity of unit3.activities) { const key = activity.activityData.taskType ?? activity.contentType; types[key] = (types[key] ?? 0) + 1; }
  assert.deepEqual(types, { phrase_set: 50, idea_set: 50, improve_vocabulary: 100, word_family: 96 });
  assert.ok([unit3.items, unit3.occurrences, unit3.contexts, unit3.activities].every(rows => rows.every(row => row.status === 'live')));
  assert.ok(unit3.occurrences.every(occurrence => occurrence.unitNumber === 3));
});

test('nothing is shared with Units 1 or 2; reasonable has its own Unit 3 row', () => {
  for (const other of [unit1, unit2]) {
    assert.deepEqual(overlap(unit3.items.map(i => i.vocabularyId), other.items.map(i => i.vocabularyId)), []);
    assert.deepEqual(overlap(unit3.occurrences.map(o => o.occurrenceId), other.occurrences.map(o => o.occurrenceId)), []);
    assert.deepEqual(overlap(unit3.contexts.map(c => c.contextId ?? c.id), other.contexts.map(c => c.contextId ?? c.id)), []);
    assert.deepEqual(overlap(unit3.activities.map(a => a.activityContentId), other.activities.map(a => a.activityContentId)), []);
  }
  assert.ok(unit3.items.some(item => item.vocabularyId === 'vocab_reasonable_3' && item.term === 'reasonable'));
  assert.ok(unit3.occurrences.some(o => o.occurrenceId === 'u3_33_reasonable_3' && o.vocabularyId === 'vocab_reasonable_3'));
  assert.ok(!unit3.items.some(item => item.vocabularyId === 'vocab_reasonable'));
});

test('Unit 3 carries no Unit Check or Games content, and all six pathways are live with the documented held-back words', () => {
  assert.ok(!Object.keys(unit3).some(key => /unitCheck|game/i.test(key)));
  assert.ok(!unit3.activities.some(activity => /unit_check|game|connection/i.test(activity.contentType)));
  const readiness = evaluateUnitReadiness({ content: releasePlannerContent(unit3) });
  assert.ok(Object.values(readiness.pathways).every(pathway => pathway.playableSetCount > 0), 'all six pathways are live');
  const held = Object.fromEntries(Object.values(readiness.pathways).map(p => [p.pathwayId, p.heldBackCount]));
  assert.deepEqual(held, { meaning: 8, context: 8, word_families: 2, paraphrasing: 0, precision_use: 0, spelling_recall: 0 });
});

test('Set membership covers Unit 3 occurrences only, in 26 whole Sets of ten, and the committed SQL matches it', () => {
  const rows = membershipRows([unit3]);
  const occurrenceIds = new Set(unit3.occurrences.map(o => o.occurrenceId));
  assert.equal(rows.length, 260);
  assert.ok(rows.every(row => row.unit === 3 && occurrenceIds.has(row.occurrenceId)));
  assert.equal(new Set(rows.map(row => `${row.pathway}|${row.occurrenceId}`)).size, rows.length, 'no duplicate (pathway, occurrence)');
  assert.equal(new Set(rows.map(row => `${row.pathway}|${row.set}|${row.position}`)).size, rows.length, 'no duplicate positions');
  const sets = new Map();
  for (const row of rows) sets.set(`${row.pathway}/${row.set}`, (sets.get(`${row.pathway}/${row.set}`) ?? 0) + 1);
  assert.equal(sets.size, 26);
  assert.ok([...sets.values()].every(count => count === 10));
  const perPathway = {};
  for (const row of rows) perPathway[row.pathway] = (perPathway[row.pathway] ?? 0) + 1;
  assert.deepEqual(perPathway, { meaning: 40, context: 40, word_families: 30, paraphrasing: 50, precision_use: 50, spelling_recall: 50 });
  const sql = read('unit-03-set-membership.sql');
  assert.ok(sql.includes(membershipSql(rows)));
  assert.ok(sql.includes(`membership checksum ${membershipChecksum(rows)}`));
});

test('the Unit 3 sync SQL never touches a Unit 1 or Unit 2 row', () => {
  for (let n = 1; n <= 5; n += 1) {
    const sql = read(`unit-03-sync-chunk-${n}.sql`);
    assert.ok(!/'vocab_reasonable'/.test(sql), `chunk ${n}`);
    assert.ok(!/'u[12]_/.test(sql), `chunk ${n}`);
    assert.ok(!/^\s*(delete from|truncate|drop )/im.test(sql), `chunk ${n}`);
  }
});

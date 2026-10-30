// Unit 2 (Digital Life) release packaging: the live release, its lock, its generated SQL and its isolation from Unit 1.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import unit1 from '../content/vocabulary/releases/unit-01.js';
import unit2 from '../content/vocabulary/releases/unit-02.js';
import { membershipRows, membershipChecksum, membershipSql } from '../scripts/generate-set-membership-sql.mjs';
import { releasePlannerContent } from '../content/vocabulary/readiness-report.js';
import { evaluateUnitReadiness } from '../src/vocabulary/pathway-readiness.js';

const read = name => fs.readFileSync(new URL(`../docs/vocabulary-content-updates/${name}`, import.meta.url), 'utf8');

test('Unit 2 is a live release of exactly 50 targets with Unit 2 occurrences only', () => {
  assert.equal(unit2.status, 'live');
  assert.equal(unit2.unitNumber, 2);
  assert.equal(unit2.items.length, 50);
  assert.equal(unit2.occurrences.length, 50);
  assert.ok([unit2.items, unit2.occurrences, unit2.contexts, unit2.activities].every(rows => rows.every(row => row.status === 'live')));
  assert.ok(unit2.occurrences.every(occurrence => occurrence.unitNumber === 2));
});

test('nothing is shared with Unit 1: ids, occurrences, contexts and activities are all distinct; afford has its own Unit 2 row', () => {
  const ids = rows => new Set(rows);
  const overlap = (a, b) => [...a].filter(value => b.has(value));
  assert.deepEqual(overlap(ids(unit2.items.map(i => i.vocabularyId)), ids(unit1.items.map(i => i.vocabularyId))), []);
  assert.deepEqual(overlap(ids(unit2.occurrences.map(o => o.occurrenceId)), ids(unit1.occurrences.map(o => o.occurrenceId))), []);
  assert.deepEqual(overlap(ids(unit2.contexts.map(c => c.contextId ?? c.id)), ids(unit1.contexts.map(c => c.contextId ?? c.id))), []);
  assert.deepEqual(overlap(ids(unit2.activities.map(a => a.activityContentId)), ids(unit1.activities.map(a => a.activityContentId))), []);
  assert.ok(unit2.items.some(item => item.vocabularyId === 'vocab_afford_2' && item.term === 'afford'));
  assert.ok(unit2.occurrences.some(o => o.occurrenceId === 'u2_08_afford_2' && o.vocabularyId === 'vocab_afford_2'));
  assert.ok(!unit2.items.some(item => item.vocabularyId === 'vocab_afford'));
  assert.equal(new Set(unit2.items.map(item => item.term)).size, 50);
});

test('Unit 2 carries no Unit Check or Games content, and that does not stop any pathway going live', () => {
  assert.ok(!Object.keys(unit2).some(key => /unitCheck|game/i.test(key)));
  assert.ok(!unit2.activities.some(activity => /unit_check|game|connection/i.test(activity.contentType)));
  const readiness = evaluateUnitReadiness({ content: releasePlannerContent(unit2) });
  assert.deepEqual(Object.values(readiness.pathways).map(p => p.pathwayId).sort(), ['context', 'meaning', 'paraphrasing', 'precision_use', 'spelling_recall', 'word_families']);
  assert.ok(Object.values(readiness.pathways).every(pathway => pathway.playableSetCount > 0), 'all six pathways are live');
});

test('Set membership covers Unit 2 occurrences only, in whole Sets of ten, and the committed SQL matches it', () => {
  const rows = membershipRows([unit2]);
  const occurrenceIds = new Set(unit2.occurrences.map(o => o.occurrenceId));
  assert.equal(rows.length, 260);
  assert.ok(rows.every(row => row.unit === 2 && occurrenceIds.has(row.occurrenceId)));
  const sets = new Map();
  for (const row of rows) sets.set(`${row.pathway}/${row.set}`, (sets.get(`${row.pathway}/${row.set}`) ?? 0) + 1);
  assert.ok([...sets.values()].every(count => count === 10));
  const perPathway = {};
  for (const row of rows) perPathway[row.pathway] = (perPathway[row.pathway] ?? 0) + 1;
  assert.deepEqual(perPathway, { meaning: 40, context: 40, word_families: 30, paraphrasing: 50, precision_use: 50, spelling_recall: 50 });
  const sql = read('unit-02-set-membership.sql');
  assert.ok(sql.includes(membershipSql(rows)));
  assert.ok(sql.includes(`membership checksum ${membershipChecksum(rows)}`));
});

test('the Unit 2 sync SQL never touches a Unit 1 row', () => {
  for (let n = 1; n <= 5; n += 1) {
    const sql = read(`unit-02-sync-chunk-${n}.sql`);
    assert.ok(!/'vocab_afford'/.test(sql), `chunk ${n}`);
    assert.ok(!/'u1_/.test(sql), `chunk ${n}`);
    assert.ok(!/^\s*(delete from|truncate|drop )/im.test(sql), `chunk ${n}`);
  }
});

// Execution-helper split of Unit 5 sync chunk 1: the source is untouched and the pieces rebuild it exactly.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { buildPieces, reconstruct, parseSource } from '../scripts/split-unit5-chunk1.mjs';

const dir = new URL('../docs/vocabulary-content-updates/', import.meta.url);
const read = name => fs.readFileSync(new URL(name, dir), 'utf8');
const source = read('unit-05-sync-chunk-1.sql');
const ids = ['1a', '1b', '1c', '1d'];
const pieces = ids.map(id => ({ id, text: read(`unit-05-sync-chunk-${id}.sql`) }));

test('the canonical chunk 1 is unchanged', () => {
  assert.equal(Buffer.byteLength(source), 196164);
  assert.equal(crypto.createHash('sha256').update(source).digest('hex'), '5460aa10172f084768e34ae5097ed823512133d5456bb4a9245769c42e612d6f');
});

test('the committed pieces equal a fresh split and rebuild the source byte for byte', () => {
  assert.deepEqual(pieces, buildPieces(source));
  assert.equal(reconstruct(pieces), source);
});

test('every row appears exactly once, in order, unaltered; each piece is a complete begin/commit unit with whole statements', () => {
  const { rows } = parseSource(source);
  const split = pieces.slice(1).flatMap(piece => piece.text.split('\n').filter(line => line.startsWith("('u5_")).map(line => line.replace(/,$/, '')));
  assert.deepEqual(split, rows.map(line => line.replace(/,$/, '')));
  for (const piece of pieces) {
    const lines = piece.text.split('\n');
    assert.equal(lines.filter(l => l === 'begin;').length, 1);
    assert.equal(lines.filter(l => l === 'commit;').length, 1);
    assert.equal(lines.at(-2), 'commit;');
    const inserts = lines.filter(l => l.startsWith('insert into ')).length;
    assert.equal(inserts, lines.filter(l => l.startsWith('on conflict ')).length, `${piece.id}: each insert has its on conflict tail`);
    assert.ok(Buffer.byteLength(piece.text) < 60000, `${piece.id} stays within the connector size`);
    assert.ok(!/\b(delete from|truncate|drop )/i.test(piece.text.split('\n').filter(l => !l.startsWith("('")).join('\n')));
  }
  for (const piece of pieces.slice(1)) {
    const lines = piece.text.split('\n');
    const last = lines.findIndex(l => l.startsWith('on conflict ')) - 1;
    assert.ok(lines[last].endsWith("'live')"), `${piece.id}: last row closes the VALUES list without a trailing comma`);
  }
});

test('chunks 2–5 and the membership SQL are not touched by the split', () => {
  const expected = { 'unit-05-sync-chunk-2.sql': '369c87d71e4de18b', 'unit-05-sync-chunk-3.sql': 'e2035a53721d36e0', 'unit-05-sync-chunk-4.sql': 'e2e0e1a8ca4d4070', 'unit-05-sync-chunk-5.sql': '4b75459b15b3f7c1', 'unit-05-set-membership.sql': '36047eb39c28bb09' };
  for (const [name, prefix] of Object.entries(expected)) assert.ok(crypto.createHash('sha256').update(read(name)).digest('hex').startsWith(prefix), name);
});

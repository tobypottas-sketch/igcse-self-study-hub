// Execution helper: splits docs/vocabulary-content-updates/unit-05-sync-chunk-1.sql into size-limited pieces
// (1a..1d) for connectors with a request-size limit, and verifies that the pieces rebuild the original exactly.
// The original chunk stays canonical; the pieces only add a helper comment line, begin; and commit; wrappers, and
// repeat the activities INSERT header / ON CONFLICT tail around whole rows. Row tuples are never altered.
// Usage: node scripts/split-unit5-chunk1.mjs [--write]   (no flag = verify only)
import fs from 'node:fs';
import crypto from 'node:crypto';

const dir = new URL('../docs/vocabulary-content-updates/', import.meta.url);
const SOURCE = 'unit-05-sync-chunk-1.sql';
const NAMES = ['1a', '1b', '1c', '1d'];
const sha = text => crypto.createHash('sha256').update(text).digest('hex');
const fileName = id => `unit-05-sync-chunk-${id}.sql`;

export function parseSource(text) {
  const lines = text.split('\n'); // text ends with '\n', so the last element is ''
  assertEqual(lines.pop(), '', 'source ends with a newline');
  const first = lines.findIndex(line => line === 'insert into public.vocabulary_unit_activities');
  const tailStart = lines.findIndex((line, i) => i > first && line.startsWith('on conflict (activity_content_id)'));
  assertEqual(lines[2], 'begin;', 'begin');
  assertEqual(lines.at(-1), 'commit;', 'commit');
  const rowStart = first + 3;
  const rows = lines.slice(rowStart, tailStart);
  assert(rows.every((row, i) => row.startsWith("('u5_") && row.endsWith(i === rows.length - 1 ? "'live')" : "'live'),")), 'every activity row is one whole line');
  return { head: lines.slice(0, first), activityHeader: lines.slice(first, rowStart), rows, tail: lines.slice(tailStart, -1) };
}

export function buildPieces(text) {
  const { head, activityHeader, rows, tail } = parseSource(text);
  const size = Math.ceil(rows.length / 3);
  const groups = [0, 1, 2].map(i => rows.slice(i * size, (i + 1) * size));
  const note = (id, what) => `-- Unit 5 sync chunk ${id} of 1d: execution helper split from unit-05-sync-chunk-1.sql (${what}). Run 1a, 1b, 1c, 1d in order.`;
  const pieces = [{ id: '1a', lines: [note('1a', 'items, occurrences, contexts'), ...head.slice(0, 2), 'begin;', ...head.slice(3), 'commit;'] }];
  groups.forEach((group, i) => {
    const last = i === groups.length - 1;
    const body = group.map((row, n) => (n === group.length - 1 && !last ? row.replace(/,$/, '') : row));
    pieces.push({ id: NAMES[i + 1], lines: [note(NAMES[i + 1], `activities rows ${groups.slice(0, i).reduce((s, g) => s + g.length, 0) + 1}-${groups.slice(0, i + 1).reduce((s, g) => s + g.length, 0)} of ${rows.length}`), 'begin;', ...activityHeader, ...body, ...tail, 'commit;'] });
  });
  return pieces.map(piece => ({ id: piece.id, text: piece.lines.join('\n') + '\n' }));
}

// Strips the wrappers only and re-joins the payloads in order; must equal the source byte for byte.
export function reconstruct(pieces) {
  const body = piece => piece.text.split('\n').slice(0, -1);
  const a = body(pieces[0]); // note, comment x2, begin;, items..contexts, commit;
  const out = [...a.slice(1, 3), 'begin;', ...a.slice(4, -1)];
  const activityPieces = pieces.slice(1).map(body);
  const header = activityPieces[0].slice(2, 5);
  out.push(...header);
  activityPieces.forEach((lines, i) => {
    const rows = lines.slice(5, lines.findIndex(line => line.startsWith('on conflict (activity_content_id)')));
    const restored = rows.map((row, n) => (n === rows.length - 1 && i < activityPieces.length - 1 ? `${row},` : row));
    out.push(...restored);
  });
  const lastPiece = activityPieces.at(-1);
  out.push(...lastPiece.slice(lastPiece.findIndex(line => line.startsWith('on conflict (activity_content_id)')), -1), 'commit;');
  return out.join('\n') + '\n';
}

function assert(ok, message) { if (!ok) throw new Error(`split check failed: ${message}`); }
function assertEqual(a, b, message) { assert(a === b, `${message} (got ${JSON.stringify(a)})`); }

if (import.meta.url === `file://${process.argv[1]}`) {
  const source = fs.readFileSync(new URL(SOURCE, dir), 'utf8');
  const pieces = buildPieces(source);
  if (process.argv.includes('--write')) for (const piece of pieces) fs.writeFileSync(new URL(fileName(piece.id), dir), piece.text);
  const onDisk = pieces.map(piece => ({ id: piece.id, text: fs.readFileSync(new URL(fileName(piece.id), dir), 'utf8') }));
  assert(onDisk.every((piece, i) => piece.text === pieces[i].text), 'committed pieces match a fresh split');
  const rebuilt = reconstruct(onDisk);
  console.log(`source        ${Buffer.byteLength(source)} bytes  sha256 ${sha(source)}`);
  console.log(`reconstructed ${Buffer.byteLength(rebuilt)} bytes  sha256 ${sha(rebuilt)}`);
  for (const piece of onDisk) console.log(`${fileName(piece.id)}  ${Buffer.byteLength(piece.text)} bytes  ${(piece.text.match(/^(insert into) /gm) ?? []).length} insert statement(s)  ${(piece.text.match(/^\('/gm) ?? []).length} rows`);
  assert(rebuilt === source, 'reconstruction is byte-identical');
  console.log('OK: byte-identical');
}

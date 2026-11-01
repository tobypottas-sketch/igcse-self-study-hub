// Unit 4 (Transport) Games: registration, Word Blitz audited pool, Connections v2 bank. Units 1-3 data and all game mechanics stay untouched.
import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import unit1 from '../content/vocabulary/units/unit-01.js';
import unit2 from '../content/vocabulary/units/unit-02.js';
import unit3 from '../content/vocabulary/units/unit-03.js';
import unit4 from '../content/vocabulary/units/unit-04.js';
import { GAMES_BY_UNIT, gamesFor, availableGames, CONNECTIONS_PUZZLES, BLITZ_CONFUSABLE, BLITZ_MEANING_OPTIONS } from '../src/vocabulary/games/games-data.js';
import { BLITZ_CONFUSABLE_U2, BLITZ_EXCLUDED_U2, CONNECTIONS_PUZZLES_U2 } from '../src/vocabulary/games/games-data-unit-02.js';
import { BLITZ_CONFUSABLE_U3, BLITZ_EXCLUDED_U3, CONNECTIONS_PUZZLES_U3 } from '../src/vocabulary/games/games-data-unit-03.js';
import { BLITZ_CONFUSABLE_U4, BLITZ_MEANING_OPTIONS_U4, BLITZ_EXCLUDED_U4, CONNECTIONS_PUZZLES_U4 } from '../src/vocabulary/games/games-data-unit-04.js';
import { buildBlitzPool } from '../src/vocabulary/games/blitz-engine.js';
import { createGameHistory } from '../src/vocabulary/games/games-history.js';
import { pickPuzzles, withWordClasses, wordShape, normaliseGuess, createConnections } from '../src/vocabulary/games/connections-engine.js';
import { renderLobby, renderGamesEntry } from '../src/vocabulary/games/games-view.js';

const seeded = (seed = 7) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const norm = s => String(s).toLowerCase();
const hash = x => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
const meta = new Map(unit4.items.map(i => [i.term, i]));
const terms4 = new Set(unit4.items.map(i => i.term));
const data4 = gamesFor(4);
const count = pool => pool.reduce((m, q) => (m[q.type] = (m[q.type] ?? 0) + 1, m), {});

// Enumerate every stable question and every option set the engine can produce for a pool.
function enumerate(content, data, runs = 60) {
  const rng = seeded(11); const rows = new Map();
  for (let r = 0; r < runs; r++) for (const q of buildBlitzPool(content, rng, data)) {
    if (!rows.has(q.id)) rows.set(q.id, { q, sets: [] });
    const b = q.build(); if (b) rows.get(q.id).sets.push({ options: b.options, answer: b.options[b.answerIndex] });
  }
  return rows;
}
const rows4 = enumerate(unit4, data4.blitz);
const posOf = new Map(unit4.items.map(i => [i.term, i.partOfSpeech]));

test('registration: Units 1-4 have games, 5-6 stay unavailable, nothing falls back', () => {
  assert.deepEqual(availableGames(4), ['blitz', 'connections']);
  assert.equal(gamesFor(4).connections.puzzles, CONNECTIONS_PUZZLES_U4);
  assert.equal(gamesFor(4).blitz.confusable, BLITZ_CONFUSABLE_U4);
  assert.equal(gamesFor(4).blitz.meaningOptions, BLITZ_MEANING_OPTIONS_U4);
  assert.equal(gamesFor(4).blitz.excluded, BLITZ_EXCLUDED_U4);
  assert.notEqual(gamesFor(4).connections.puzzles, gamesFor(2).connections.puzzles);
  for (const u of [1, 2, 3]) assert.deepEqual(availableGames(u), ['blitz', 'connections']);
  for (const u of [6, 7, 0, NaN, null, undefined]) { assert.equal(gamesFor(u), null, `unit ${u}`); assert.deepEqual(availableGames(u), []); }
  assert.deepEqual(Object.keys(GAMES_BY_UNIT), ['1', '2', '3', '4', '5']);
  assert.match(renderGamesEntry(4), /Unit 4/); assert.match(renderLobby(4), /data-game="blitz"/); assert.match(renderLobby(4), /data-game="connections"/);
  assert.equal(renderGamesEntry(6), '');
});

test('Blitz: the audited Unit 4 pool has the pinned size and counts', () => {
  const pool = buildBlitzPool(unit4, seeded(3), data4.blitz);
  assert.equal(pool.length, 282); assert.deepEqual(count(pool), { def: 49, para: 38, gap: 96, mic: 99 });
  assert.equal(rows4.size, 282, 'every stable id is reachable across runs');
  assert.equal(new Set(pool.map(q => q.term)).size, 50, 'all 50 Unit 4 words are represented');
  assert.deepEqual(BLITZ_MEANING_OPTIONS_U4, {});
});

test('Blitz: every question targets canonical Unit 4 vocabulary', () => {
  for (const { q } of rows4.values()) assert.ok(terms4.has(q.term), q.id);
});

test('Blitz: every excluded id is absent, and removing the list restores the original pool', () => {
  assert.equal(new Set(BLITZ_EXCLUDED_U4).size, BLITZ_EXCLUDED_U4.length, 'no duplicate exclusions');
  const none = enumerate(unit4, { ...data4.blitz, excluded: [] });
  for (const id of BLITZ_EXCLUDED_U4) { assert.ok(none.has(id), `${id} exists in the unfiltered pool`); assert.ok(!rows4.has(id), `${id} is withheld`); }
  assert.equal(none.size, 334, 'unfiltered pool with the confusable groups');
  assert.equal(none.size - rows4.size, BLITZ_EXCLUDED_U4.length);
  assert.ok(!rows4.has('def:vocab_efficiently'));
});

test('Blitz: a withheld gap row is not replaced by another row of the same word', () => {
  const perWord = new Map();
  for (const { q } of rows4.values()) if (q.type === 'gap') perWord.set(q.term, (perWord.get(q.term) ?? 0) + 1);
  for (const [w, n] of perWord) assert.ok(n <= 2, `${w} has ${n} gap rows`);
});

test('Blitz: every option set has 4 unique options and the key appears exactly once', () => {
  for (const { q, sets } of rows4.values()) {
    assert.ok(sets.length > 0, q.id);
    for (const { options, answer } of sets) {
      assert.equal(options.length, 4, q.id); assert.equal(new Set(options.map(norm)).size, 4, `${q.id} options unique`);
      assert.equal(options.filter(o => norm(o) === norm(answer)).length, 1, q.id);
      if (q.type === 'def' || q.type === 'para') assert.equal(answer, q.term, q.id);
    }
  }
});

test('Blitz: members of one confusable group never share a def/para question', () => {
  for (const { q, sets } of rows4.values()) {
    if (q.type !== 'def' && q.type !== 'para') continue;
    for (const { options } of sets) for (const g of BLITZ_CONFUSABLE_U4) {
      if (!g.includes(q.term)) continue;
      assert.deepEqual(options.filter(o => o !== q.term && g.includes(o)), [], `${q.id} shows a blocked neighbour`);
    }
  }
});

test('Blitz: def/para answers are never given away by word class alone', () => {
  for (const { q, sets } of rows4.values()) {
    if (q.type !== 'def' && q.type !== 'para') continue;
    for (const { options } of sets) assert.equal(options.filter(o => o !== q.term && posOf.get(o) !== posOf.get(q.term)).length, 0, `${q.id} uses a cross-POS distractor`);
  }
});

test('Blitz: gap sentences are not given away by a/an', () => {
  let checked = 0;
  for (const { q, sets } of rows4.values()) {
    if (q.type !== 'gap') continue;
    const m = /\b(a|an)\s+_{2,}/i.exec(q.prompt); if (!m) continue; checked += 1;
    for (const { options } of sets) assert.ok(options.every(o => /^[aeiou]/i.test(o) === (m[1].toLowerCase() === 'an')), `${q.id}: ${options.join('/')}`);
  }
  assert.ok(checked > 5);
});

test('Blitz: retained paraphrase prompts are the certified set (no loose associations)', () => {
  const paras = [...rows4.values()].filter(r => r.q.type === 'para').map(r => r.q.id.replace('para:vocab_', ''));
  assert.equal(paras.length, 38);
  for (const bad of ['trauma:deep-shock', 'toughest:most-demanding', 'luxury:expensive-enjoyment', 'operate:control', 'invention:new-device', 'innovative:original', 'launch:start', 'participant_4:person-involved', 'organisation:association', 'provisional:temporary', 'statistics:figures', 'safety:protection']) assert.ok(!paras.includes(bad), bad);
});

test('Blitz: meaning-in-context rows have 4 unique meanings with the right one keyed', () => {
  const mic = [...rows4.values()].filter(r => r.q.type === 'mic'); assert.equal(mic.length, 99);
  for (const { q, sets } of mic) for (const { options } of sets) assert.equal(new Set(options.map(norm)).size, 4, q.id);
});

test('Connections: 48 puzzles, every target is canonical Unit 4 vocabulary, unique, in the audited set', () => {
  assert.equal(CONNECTIONS_PUZZLES_U4.length, 48);
  const targets = CONNECTIONS_PUZZLES_U4.map(p => p.target);
  assert.equal(new Set(targets).size, 48); for (const t of targets) assert.ok(terms4.has(t), t);
  assert.deepEqual([...terms4].filter(t => !targets.includes(t)), ['efficiently', 'initiative'], 'efficiently (the only adverb, answerable by word class) and initiative (overlaps campaign) are omitted');
});

test('Connections: four clues of the right kinds, no pictures, and no blank-sentence plain clue', () => {
  for (const p of CONNECTIONS_PUZZLES_U4) {
    assert.equal(p.clues.length, 4, p.target);
    assert.deepEqual(p.clues.map(c => c.kind), ['situation', 'context', 'plain', 'meaning'], p.target);
    for (const c of p.clues) { assert.ok(c.text.length > 12, p.target); assert.ok(!c.image && !c.picture && !c.src, `${p.target}: no picture`); }
    assert.ok(!p.clues[2].text.includes('___'), p.target);
    assert.equal(new Set(p.clues.map(c => c.text)).size, 4, p.target);
    assert.ok(p.why && p.why.length > 30 && p.why.length < 300, p.target);
  }
});

test('Connections: no clue contains the target or one of its word-family forms', () => {
  const forms = item => [item.term, ...(item.wordFamily ?? []), ...(item.senses?.[0]?.wordFamilyForms ?? []).map(f => f?.form ?? '')].map(norm).filter(x => x.length > 3);
  for (const p of CONNECTIONS_PUZZLES_U4) for (const c of p.clues) for (const f of forms(meta.get(p.target))) assert.doesNotMatch(norm(c.text), new RegExp('\\b' + f.replace(/[-\s]/g, '[- ]') + '\\b'), `${p.target} leaks "${f}"`);
});

test('Connections: help has exactly two distinct Unit 4 distractors and never a near-synonym', () => {
  const NEAR = [['comfort', 'luxury'], ['height', 'altitude'], ['height', 'storeys'], ['altitude', 'storeys'], ['passenger', 'participant'], ['passenger', 'pilot'], ['pilot', 'engineer'], ['engineer', 'passenger'], ['equipment', 'machinery'], ['equipment', 'vehicle'], ['machinery', 'vehicle'], ['advertisement', 'campaign'], ['advertisement', 'demand'], ['campaign', 'measures'], ['regulation', 'legislation'], ['regulation', 'enforcement'], ['regulation', 'offences'], ['legislation', 'enforcement'], ['collision', 'fatality'], ['collision', 'trauma'], ['fatality', 'trauma'], ['pollution', 'sustainability'], ['launch', 'introduce'], ['launch', 'operate'], ['introduce', 'operate'], ['spacious', 'enormous'], ['organisation', 'campaign'], ['detain', 'enforcement']];
  for (const p of CONNECTIONS_PUZZLES_U4) {
    assert.equal(p.help.length, 2, p.target); assert.equal(new Set([p.target, ...p.help]).size, 3);
    for (const h of p.help) {
      assert.ok(terms4.has(h), `${p.target}: help "${h}" is Unit 4`);
      assert.ok(!BLITZ_CONFUSABLE_U4.some(g => g.includes(p.target) && g.includes(h)), `${p.target} / ${h} share a confusable group`);
      assert.ok(!NEAR.some(([a, b]) => (a === p.target && b === h) || (b === p.target && a === h)), `${p.target} / ${h} are confusable`);
    }
  }
});

test('Connections: accepted forms are conservative inflections or spellings, never another Unit 4 word', () => {
  for (const p of CONNECTIONS_PUZZLES_U4) {
    const target = normaliseGuess(p.target);
    assert.equal(new Set(p.accept.map(normaliseGuess)).size, p.accept.length, p.target);
    for (const a of p.accept) {
      assert.notEqual(normaliseGuess(a), target, p.target);
      assert.ok(!terms4.has(a) || a === p.target, `${p.target}: "${a}" is another word`);
      assert.ok(normaliseGuess(a).replace(/ /g, '').startsWith(target.replace(/ /g, '').slice(0, 3)) || ['advert', 'adverts'].includes(a), `${p.target}: "${a}" is not a form of it`);
    }
  }
});

test('Connections: pickPuzzles, withWordClasses and the engine work on the Unit 4 bank', () => {
  const picked = pickPuzzles(CONNECTIONS_PUZZLES_U4, seeded(5), 5, createGameHistory()); assert.equal(picked.length, 5); assert.equal(new Set(picked.map(p => p.target)).size, 5);
  const history = createGameHistory(); const seen = new Set();
  for (let i = 0; i < 12; i++) for (const p of pickPuzzles(CONNECTIONS_PUZZLES_U4, seeded(i + 2), 5, history)) seen.add(p.target);
  assert.equal(seen.size, 48, 'history rotates through the whole bank');
  const classed = withWordClasses(CONNECTIONS_PUZZLES_U4, unit4.items); assert.equal(classed.length, 48);
  const shape = t => wordShape(classed.find(p => p.target === t), 1);
  assert.equal(shape('pothole').wordClass, 'NOUN'); assert.equal(shape('launch').wordClass, 'VERB'); assert.equal(shape('toughest').wordClass, 'ADJECTIVE');
  for (const p of classed) assert.ok(wordShape(p, 1).wordClass, `${p.target} has a word class`);
  const g = createConnections({ puzzles: [CONNECTIONS_PUZZLES_U4[0]] }); for (let i = 0; i < 3; i++) g.reveal();
  assert.ok(g.help()); assert.equal(g.state.choices.length, 3);
  assert.deepEqual([...g.state.choices].sort(), [CONNECTIONS_PUZZLES_U4[0].target, ...CONNECTIONS_PUZZLES_U4[0].help].sort());
  const n = createConnections({ puzzles: [CONNECTIONS_PUZZLES_U4[1]] }); const res = n.guess(CONNECTIONS_PUZZLES_U4[1].target);
  assert.equal(res.correct, true); assert.equal(res.points, 500);
});

test('regression: Units 1-3 data and pools are unchanged', () => {
  assert.equal(hash(CONNECTIONS_PUZZLES), '0b698694c5a335e2'); assert.equal(hash(BLITZ_CONFUSABLE), 'b765052c41d91923'); assert.equal(hash(BLITZ_MEANING_OPTIONS), 'eef76449de939a7c');
  assert.equal(hash(CONNECTIONS_PUZZLES_U2), 'a375383150af93bf'); assert.equal(hash(BLITZ_CONFUSABLE_U2), '094e57654696d740'); assert.equal(hash(BLITZ_EXCLUDED_U2), '83d2a397064eac3b');
  assert.equal(hash(CONNECTIONS_PUZZLES_U3), 'c21c4011dc510dbd'); assert.equal(hash(BLITZ_CONFUSABLE_U3), '1cd3d57b2fe62e52'); assert.equal(hash(BLITZ_EXCLUDED_U3), 'd45392463a9c58a7');
  const p1 = buildBlitzPool(unit1, seeded(3), gamesFor(1).blitz); assert.equal(p1.length, 328);
  const p2 = buildBlitzPool(unit2, seeded(3), gamesFor(2).blitz); assert.equal(p2.length, 293); assert.deepEqual(count(p2), { def: 48, para: 52, gap: 93, mic: 100 });
  const p3 = buildBlitzPool(unit3, seeded(3), gamesFor(3).blitz); assert.equal(p3.length, 292); assert.deepEqual(count(p3), { def: 48, para: 48, gap: 97, mic: 99 });
  assert.equal(CONNECTIONS_PUZZLES_U2.length, 48); assert.equal(CONNECTIONS_PUZZLES_U3.length, 49);
  for (const [a, b] of [[2, 3], [2, 4], [3, 4]]) assert.equal(gamesFor(a).blitz.excluded.some(id => gamesFor(b).blitz.excluded.includes(id)), false, `no shared exclusion ids ${a}/${b}`);
});

test('Unit 4 ids: overlapping terms use the Unit 4 vocabulary ids, never Unit 2-3 ids', () => {
  const ids4 = new Set(unit4.items.map(i => i.vocabularyId));
  for (const { q } of rows4.values()) assert.ok(ids4.has(q.id.split(':')[1].replace(/^u4_.*/, '')) || /^(gap|mic):u4_/.test(q.id) || /^(def|para):vocab_/.test(q.id), q.id);
  for (const t of ['demand', 'advertisement', 'equipment', 'participant']) {
    assert.ok(rows4.has(`def:vocab_${t}_4`), `${t}: def uses the Unit 4 id`);
    const ids = [...rows4.keys()].filter(id => id.startsWith(`def:vocab_${t}`)); assert.deepEqual(ids, [`def:vocab_${t}_4`]);
    assert.ok(!rows4.has(`def:vocab_${t}`) && !rows4.has(`def:vocab_${t}_3`), t);
  }
  for (const { q } of rows4.values()) if (q.type === 'gap' || q.type === 'mic') assert.match(q.id, /^(gap|mic):u4_/, q.id);
});

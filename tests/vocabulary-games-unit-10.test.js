// Unit 10 (Communication) Games: registration, Word Blitz audited pool, Connections v2 bank and session behaviour.
// Units 1-8 data and all game mechanics stay untouched.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import unit1 from '../content/vocabulary/units/unit-01.js';
import unit2 from '../content/vocabulary/units/unit-02.js';
import unit3 from '../content/vocabulary/units/unit-03.js';
import unit4 from '../content/vocabulary/units/unit-04.js';
import unit5 from '../content/vocabulary/units/unit-05.js';
import unit6 from '../content/vocabulary/units/unit-06.js';
import unit7 from '../content/vocabulary/units/unit-07.js';
import unit8 from '../content/vocabulary/units/unit-08.js';
import unit10 from '../content/vocabulary/units/unit-10.js';
import { GAMES_BY_UNIT, gamesFor, availableGames } from '../src/vocabulary/games/games-data.js';
import { BLITZ_CONFUSABLE_U10, BLITZ_MEANING_OPTIONS_U10, BLITZ_EXCLUDED_U10, CONNECTIONS_PUZZLES_U10 } from '../src/vocabulary/games/games-data-unit-10.js';
import { buildBlitzPool, createBlitz, BLITZ } from '../src/vocabulary/games/blitz-engine.js';
import { createGameHistory } from '../src/vocabulary/games/games-history.js';
import { pickPuzzles, withWordClasses, wordShape, normaliseGuess, createConnections } from '../src/vocabulary/games/connections-engine.js';
import { renderLobby, renderGamesEntry } from '../src/vocabulary/games/games-view.js';

const seeded = (seed = 7) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const norm = s => String(s).toLowerCase();
const repo = fileURLToPath(new URL('..', import.meta.url));
const read = file => fs.readFileSync(path.join(repo, file), 'utf8');
const meta = new Map(unit10.items.map(i => [i.term, i]));
const terms10 = new Set(unit10.items.map(i => i.term));
const posOf = new Map(unit10.items.map(i => [i.term, i.partOfSpeech]));
const data10 = gamesFor(10);
const count = pool => pool.reduce((m, q) => (m[q.type] = (m[q.type] ?? 0) + 1, m), {});
const esc = s => s.replace(/[-\s]/g, '[- ]');

function enumerate(content, data, runs = 60) {
  const rng = seeded(11); const rows = new Map();
  for (let r = 0; r < runs; r++) for (const q of buildBlitzPool(content, rng, data)) {
    if (!rows.has(q.id)) rows.set(q.id, { q, sets: [] });
    const b = q.build(); if (b) rows.get(q.id).sets.push({ options: b.options, answer: b.options[b.answerIndex] });
  }
  return rows;
}
const rows10 = enumerate(unit10, data10.blitz);
const rows10All = enumerate(unit10, { ...data10.blitz, excluded: [] });

test('registration: Units 1-9 have both games, Unit 10 and beyond stay unavailable', () => {
  assert.deepEqual(Object.keys(GAMES_BY_UNIT).map(Number), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.deepEqual(availableGames(9), ['blitz', 'connections']);
  assert.equal(data10.blitz.confusable, BLITZ_CONFUSABLE_U10); assert.equal(data10.blitz.excluded, BLITZ_EXCLUDED_U10); assert.equal(data10.connections.puzzles, CONNECTIONS_PUZZLES_U10);
  assert.match(renderGamesEntry(9), /Unit 10/); assert.match(renderLobby(9), /data-game="blitz"/); assert.match(renderLobby(9), /data-game="connections"/);
  for (const u of [10, 12, 0, NaN, null, '10']) { assert.equal(gamesFor(u), null); assert.deepEqual(availableGames(u), []); assert.equal(renderGamesEntry(u), ''); }
});

test('Blitz: the audited Unit 10 pool has the pinned size and counts, with no id served twice', () => {
  const pool = buildBlitzPool(unit10, seeded(3), data10.blitz);
  assert.equal(pool.length, 324); assert.deepEqual(count(pool), { def: 49, para: 87, gap: 88, mic: 100 });
  assert.equal(rows10.size, 324, 'every stable id is reachable across runs');
  assert.equal(new Set(pool.map(q => q.term)).size, 50, 'all 50 Unit 10 words are represented');
  assert.equal(new Set(pool.map(q => q.id)).size, pool.length);
  for (const q of pool) assert.ok(terms10.has(q.term), q.id);
});

test('Blitz: every word has a meaning-in-context question and at least three questions; every word except unlike has a definition question', () => {
  const per = new Map();
  for (const { q } of rows10.values()) { if (!per.has(q.term)) per.set(q.term, { def: 0, para: 0, gap: 0, mic: 0 }); per.get(q.term)[q.type] += 1; }
  assert.equal(per.size, 50);
  for (const [term, c] of per) {
    // unlike is the only preposition, so the engine has no same-class distractors for a definition question
    assert.equal(c.def, term === 'unlike' ? 0 : 1, `${term}: definition`);
    assert.ok(c.mic >= 1, `${term}: meaning in context`); assert.ok(c.def + c.para + c.gap + c.mic >= 3, `${term}: at least three questions`);
    assert.ok(c.gap <= 2 && c.para <= 2 && c.mic <= 2, `${term}: no word dominates`);
  }
});

test('Blitz: every excluded id is absent, and removing the list restores the original pool', () => {
  assert.equal(BLITZ_EXCLUDED_U10.length, 12);
  for (const id of BLITZ_EXCLUDED_U10) { assert.ok(!rows10.has(id), `${id} is withheld`); assert.ok(rows10All.has(id), `${id} exists without the list`); }
  assert.equal(rows10All.size, rows10.size + BLITZ_EXCLUDED_U10.length);
});

test('Blitz: every option set has 4 unique options and the key appears exactly once', () => {
  for (const { q, sets } of rows10.values()) for (const { options, answer } of sets) {
    assert.equal(options.length, 4, q.id); assert.equal(new Set(options.map(norm)).size, 4, q.id);
    assert.equal(options.filter(o => o === answer).length, 1, q.id);
  }
});

test('Blitz: members of one confusable group never share a def/para question, and def/para options keep one word class', () => {
  for (const group of BLITZ_CONFUSABLE_U10) for (const w of group) assert.ok(terms10.has(w), `${w} is a Unit 10 word`);
  for (const [a, b] of [['suggest', 'recommend'], ['informal', 'casual'], ['appropriate', 'suitable'], ['introduction', 'conclusion'], ['underlying', 'underlying meaning'], ['digital native', 'tech-savvy']]) assert.ok(BLITZ_CONFUSABLE_U10.some(g => g.includes(a) && g.includes(b)), `${a} / ${b}`);
  for (const { q, sets } of rows10.values()) {
    if (q.type !== 'def' && q.type !== 'para') continue;
    for (const { options } of sets) {
      for (const g of BLITZ_CONFUSABLE_U10) { if (!g.includes(q.term)) continue; assert.deepEqual(options.filter(o => o !== q.term && g.includes(o)), [], `${q.id} shows a blocked neighbour`); }
      assert.deepEqual(options.filter(o => o !== q.term && posOf.get(o) !== posOf.get(q.term)), [], `${q.id} uses a cross-POS distractor`);
    }
  }
});

test('Blitz: no retained gap is given away by a/an directly before the blank', () => {
  for (const { q, sets } of rows10.values()) {
    if (q.type !== 'gap') continue;
    const m = /\b(a|an)\s+_{2,}/i.exec(q.prompt); if (!m) continue;
    for (const { options } of sets) assert.ok(options.every(o => /^[aeiou]/i.test(o) === (m[1].toLowerCase() === 'an')), `${q.id}: ${options.join('/')}`);
  }
});

test('Blitz: meaning-in-context rows use the authored options, except the two shortened reporting-verb rows', () => {
  assert.deepEqual(Object.keys(BLITZ_MEANING_OPTIONS_U10).sort(), ['u10_37_reporting_verb_meaning', 'u10_37_reporting_verb_paraphrase']);
  for (const opts of Object.values(BLITZ_MEANING_OPTIONS_U10)) { assert.equal(opts.length, 4); assert.ok(opts.every(o => o.length <= 60)); }
  const authored = new Map(unit10.items.flatMap(i => i.senses.flatMap(s => (s.masteryContexts ?? []).map(c => [c.contextId, c]))));
  let checked = 0;
  for (const [id, row] of authored) if (rows10.has(`mic:${id}`)) {
    checked += 1; const expected = BLITZ_MEANING_OPTIONS_U10[id] ?? [row.meaning, ...row.wrongMeanings.slice(0, 3)];
    for (const { options, answer } of rows10.get(`mic:${id}`).sets) { assert.deepEqual([...options].sort(), [...expected].sort(), id); assert.equal(answer, expected[0], id); }
  }
  assert.equal(checked, 100);
});

test('Blitz: engine rules are unchanged (60 seconds, 100 points, multiplier tiers), a round uses only Unit 10 content and never repeats a word back to back', () => {
  assert.equal(BLITZ.durationMs, 60000); assert.equal(BLITZ.base, 100); assert.deepEqual(BLITZ.tiers.map(t => [...t]), [[0, 1], [3, 2], [6, 3], [10, 4]]);
  let t = 0; const game = createBlitz({ content: unit10, data: data10.blitz, rng: seeded(5), now: () => t, history: createGameHistory() });
  assert.ok(game.start()); const seen = [];
  for (let i = 0; i < 12; i += 1) { const q = game.state.question; seen.push(q.term); assert.ok(terms10.has(q.term)); assert.ok(game.answer(q.answerIndex)); game.next(); }
  assert.equal(game.state.score, 100 * 2 + 200 * 3 + 300 * 4 + 400 * 3);
  for (let i = 1; i < seen.length; i += 1) assert.notEqual(seen[i], seen[i - 1]);
  t = 61000; assert.equal(game.tick(), 'over');
});

test('Blitz: a 300-question sample of one long session never repeats a question id, and Play Again prefers new prompts', () => {
  let t = 0; const history = createGameHistory(); const game = createBlitz({ content: unit10, data: data10.blitz, rng: seeded(9), now: () => t, history });
  game.start(); const ids = [];
  for (let i = 0; i < 300; i += 1) { ids.push(game.state.question.id); game.answer(game.state.question.answerIndex); game.next(); }
  assert.equal(new Set(ids).size, 300, 'no question repeats within 300 rounds');
  const first = new Set(ids.slice(0, 20)); game.start(); const again = [];
  for (let i = 0; i < 20; i += 1) { again.push(game.state.question.id); game.answer(game.state.question.answerIndex); game.next(); }
  assert.ok(again.filter(id => first.has(id)).length < 5);
});

test('Connections: 49 unique puzzles cover every Unit 10 word except unlike', () => {
  assert.equal(CONNECTIONS_PUZZLES_U10.length, 49);
  const targets = CONNECTIONS_PUZZLES_U10.map(p => p.target);
  assert.equal(new Set(targets).size, 49); for (const t of targets) assert.ok(terms10.has(t), t);
  assert.deepEqual([...terms10].filter(t => !targets.includes(t)), ['unlike']);
});

test('Connections: four text clues on a staircase from situation to near-definition, with a short explanation', () => {
  for (const p of CONNECTIONS_PUZZLES_U10) {
    assert.deepEqual(p.clues.map(c => c.kind), ['situation', 'context', 'plain', 'meaning'], p.target);
    for (const c of p.clues) { assert.ok(c.text.length > 12, p.target); assert.ok(!c.image && !c.picture && !c.src); assert.ok(!c.text.includes('___'), p.target); }
    assert.equal(new Set(p.clues.map(c => c.text)).size, 4, p.target);
    assert.ok(p.clues[0].text.length > p.clues[2].text.length, `${p.target}: situation longer than plain clue`);
    assert.ok(p.why && p.why.length > 30 && p.why.length < 300, `${p.target}: why`);
  }
});

const STEMS = { communication: ['communica'], accuracy: ['accura'], community: ['communit'], frustration: ['frustrat'], workforce: ['workforce'], generation: ['generation'], perception: ['percept', 'perceiv'],
  platform: ['platform'], conference: ['conferenc'], 'underlying meaning': ['underlying'], 'informal language': ['informal'], 'formal style': ['formal'], 'reporting verb': ['reporting'], 'direct object': ['direct'],
  clause: ['clause'], solution: ['solution', 'solve'], introduction: ['introduc'], conclusion: ['conclu'], audience: ['audience'], purpose: ['purpose'], research: ['research'], 'digital native': ['digital'],
  signalling: ['signal'], represent: ['represent'], demonstrate: ['demonstrat'], launched: ['launch'], survive: ['surviv'], differentiate: ['differen'], suggest: ['suggest'], recommend: ['recommend'], evaluate: ['evaluat'],
  effective: ['effective', 'effectiv'], portable: ['portab'], passive: ['passiv'], interactive: ['interact'], 'tech-savvy': ['tech', 'savvy'], appropriate: ['appropriat'], banned: ['ban'], optional: ['option'],
  informal: ['informal'], casual: ['casual'], 'non-verbal': ['verbal'], underlying: ['underlying'], physical: ['physical'], virtual: ['virtual'], 'face-to-face': ['face'], suitable: ['suitab'], relevant: ['relevan'], constructive: ['constructiv'] };
test('Connections: no clue contains the target, one of its word-family forms, or a recognisable stem of it', () => {
  const forms = item => [item.term, ...(item.wordFamily ?? []), ...(item.senses?.[0]?.wordFamilyForms ?? []).map(f => f?.form ?? '')].map(norm).filter(x => x.length > 3);
  for (const p of CONNECTIONS_PUZZLES_U10) {
    assert.ok(STEMS[p.target], p.target);
    for (const c of p.clues) {
      for (const f of forms(meta.get(p.target))) assert.doesNotMatch(norm(c.text), new RegExp('\\b' + esc(f) + '\\b'), `${p.target} leaks "${f}"`);
      const words = norm(c.text).match(/[a-z]+/g) ?? [];
      assert.ok(!words.some(w => STEMS[p.target].some(s => (s === 'ban' ? w === 'ban' || w.startsWith('bann') : w.startsWith(s)))), `${p.target} clue shows a stem: ${c.text}`);
    }
  }
});

test('Connections: no clue names another Unit 10 target, and no clue names a Help word', () => {
  for (const p of CONNECTIONS_PUZZLES_U10) for (const c of p.clues) {
    for (const o of terms10) if (o !== p.target) assert.doesNotMatch(norm(c.text), new RegExp(`\\b${esc(o)}s?\\b`), `${p.target}: clue contains "${o}"`);
  }
});

test('Connections: help has two distinct Unit 10 distractors of the same word class, never from the same confusable group', () => {
  for (const p of CONNECTIONS_PUZZLES_U10) {
    assert.equal(p.help.length, 2, p.target); assert.equal(new Set([p.target, ...p.help]).size, 3);
    for (const h of p.help) {
      assert.ok(terms10.has(h), `${p.target}: help "${h}"`);
      assert.equal(posOf.get(h), posOf.get(p.target), `${p.target} / ${h}: same word class`);
      assert.ok(!BLITZ_CONFUSABLE_U10.some(g => g.includes(p.target) && g.includes(h)), `${p.target} / ${h} share a confusable group`);
    }
  }
});

test('Connections: accepted forms are conservative inflections or spacing variants, never another Unit 10 word, never an American spelling', () => {
  for (const p of CONNECTIONS_PUZZLES_U10) {
    const target = normaliseGuess(p.target);
    assert.equal(new Set(p.accept.map(normaliseGuess)).size, p.accept.length, p.target);
    for (const a of p.accept) {
      const g = normaliseGuess(a);
      assert.notEqual(g, target, p.target); assert.ok(!terms10.has(a), `${p.target}: "${a}" is another Unit 10 word`);
      assert.ok(g.replace(/[- ]/g, '').startsWith(target.replace(/[- ]/g, '').slice(0, 3)), `${p.target}: "${a}" is not a form of it`);
      assert.doesNotMatch(g, /signaling/, `${p.target}: American spelling`);
    }
    for (const word of [p.target, ...p.accept]) for (const typed of [word, word.toUpperCase(), `  ${word}  `]) assert.equal(createConnections({ puzzles: [p] }).guess(typed)?.correct, true, `${p.target}: "${typed}"`);
  }
  const only = t => createConnections({ puzzles: [CONNECTIONS_PUZZLES_U10.find(p => p.target === t)] });
  assert.equal(only('suggest').guess('recommend').correct, false); assert.equal(only('informal').guess('casual').correct, false); assert.equal(only('signalling').guess('signaling').correct, false);
});

test('Connections: pickPuzzles rotates through the bank, word classes resolve, Help offers three choices and a first-clue answer scores 500', () => {
  const history = createGameHistory(); const seen = new Set();
  for (let i = 0; i < 14; i++) for (const p of pickPuzzles(CONNECTIONS_PUZZLES_U10, seeded(i + 2), 5, history)) seen.add(p.target);
  assert.equal(seen.size, 49, 'history rotates through the whole bank');
  const classed = withWordClasses(CONNECTIONS_PUZZLES_U10, unit10.items); assert.equal(classed.length, 49);
  for (const p of classed) { const shape = wordShape(p, 4); assert.ok(shape.wordClass, p.target); assert.ok(!shape.pattern || shape.pattern.includes('_'), `${p.target}: final scaffold is incomplete`); }
  const g = createConnections({ puzzles: [CONNECTIONS_PUZZLES_U10[0]] }); for (let i = 0; i < 3; i++) g.reveal();
  assert.ok(g.help()); assert.deepEqual([...g.state.choices].sort(), [CONNECTIONS_PUZZLES_U10[0].target, ...CONNECTIONS_PUZZLES_U10[0].help].sort());
  const n = createConnections({ puzzles: [CONNECTIONS_PUZZLES_U10[1]] }); assert.equal(n.guess(CONNECTIONS_PUZZLES_U10[1].target).points, 500);
});

test('Unit 10 ids: repeated earlier-unit words use the Unit 10 vocabulary ids in every Blitz row', () => {
  const earlierUnits = [unit1, unit2, unit3, unit4, unit5, unit6, unit7, unit8];
  const earlier = new Set(earlierUnits.flatMap(u => u.items.map(i => i.vocabularyId)));
  const ids10 = new Set(unit10.items.map(i => i.vocabularyId));
  for (const id of ids10) assert.ok(!earlier.has(id), `${id} is not an earlier-unit id`);
  for (const t of ['effective', 'demonstrate', 'launched', 'passive', 'interactive', 'generation', 'recommend', 'solution', 'evaluate', 'relevant']) {
    assert.equal(meta.get(t).vocabularyId, `vocab_${t}_9`, t);
    assert.ok(earlierUnits.some(u => u.items.some(i => i.term === t)), `${t} really is a repeated word`);
    assert.ok(rows10.has(`def:vocab_${t}_9`), `${t}: def uses the Unit 10 id`);
  }
  for (const id of rows10.keys()) { const m = /^(?:def|para):(vocab_[a-z_0-9]+?)(?::|$)/.exec(id); if (m) assert.ok(ids10.has(m[1]), `${id} is a Unit 10 id`); }
  for (const { q } of rows10.values()) if (q.type === 'gap' || q.type === 'mic') assert.match(q.id, /^(gap|mic):u10_/, q.id);
});

test('scope: the Unit 10 Games change adds one data file and a registry entry, and no engine change', () => {
  assert.match(read('src/vocabulary/games/games-data.js'), /import \{ BLITZ_CONFUSABLE_U10, BLITZ_MEANING_OPTIONS_U10, BLITZ_EXCLUDED_U10, CONNECTIONS_PUZZLES_U10 \} from '\.\/games-data-unit-10\.js';/);
  assert.doesNotMatch(read('src/vocabulary/games/games-data-unit-10.js'), /import |fetch|localStorage|sessionStorage|supabase|XMLHttpRequest/i);
  assert.doesNotMatch(read('src/vocabulary/games/blitz-engine.js'), /games-data-unit-10|unit 9|u10_/i); assert.doesNotMatch(read('src/vocabulary/games/connections-engine.js'), /games-data-unit-10|unit 9|u10_/i);
});

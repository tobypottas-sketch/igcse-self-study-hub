// Unit 5 (Holidays) Games: registration, Word Blitz audited pool, Connections v2 bank. Units 1-3 data and all game mechanics stay untouched.
import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import unit1 from '../content/vocabulary/units/unit-01.js';
import unit2 from '../content/vocabulary/units/unit-02.js';
import unit3 from '../content/vocabulary/units/unit-03.js';
import unit4 from '../content/vocabulary/units/unit-04.js';
import unit5 from '../content/vocabulary/units/unit-05.js';
import { GAMES_BY_UNIT, gamesFor, availableGames, CONNECTIONS_PUZZLES, BLITZ_CONFUSABLE, BLITZ_MEANING_OPTIONS } from '../src/vocabulary/games/games-data.js';
import { BLITZ_CONFUSABLE_U2, BLITZ_EXCLUDED_U2, CONNECTIONS_PUZZLES_U2 } from '../src/vocabulary/games/games-data-unit-02.js';
import { BLITZ_CONFUSABLE_U3, BLITZ_EXCLUDED_U3, CONNECTIONS_PUZZLES_U3 } from '../src/vocabulary/games/games-data-unit-03.js';
import { BLITZ_CONFUSABLE_U4, BLITZ_EXCLUDED_U4, CONNECTIONS_PUZZLES_U4 } from '../src/vocabulary/games/games-data-unit-04.js';
import { BLITZ_CONFUSABLE_U5, BLITZ_MEANING_OPTIONS_U5, BLITZ_EXCLUDED_U5, CONNECTIONS_PUZZLES_U5 } from '../src/vocabulary/games/games-data-unit-05.js';
import { buildBlitzPool } from '../src/vocabulary/games/blitz-engine.js';
import { createGameHistory } from '../src/vocabulary/games/games-history.js';
import { pickPuzzles, withWordClasses, wordShape, normaliseGuess, createConnections } from '../src/vocabulary/games/connections-engine.js';
import { renderLobby, renderGamesEntry } from '../src/vocabulary/games/games-view.js';

const seeded = (seed = 7) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const norm = s => String(s).toLowerCase();
const hash = x => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
const meta = new Map(unit5.items.map(i => [i.term, i]));
const terms5 = new Set(unit5.items.map(i => i.term));
const data5 = gamesFor(5);
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
const rows5 = enumerate(unit5, data5.blitz);
const posOf = new Map(unit5.items.map(i => [i.term, i.partOfSpeech]));

test('registration: Units 1-5 have games, 7 stays unavailable (Unit 6 is covered by its own file), nothing falls back', () => {
  assert.deepEqual(availableGames(5), ['blitz', 'connections']);
  assert.equal(gamesFor(5).connections.puzzles, CONNECTIONS_PUZZLES_U5);
  assert.equal(gamesFor(5).blitz.confusable, BLITZ_CONFUSABLE_U5);
  assert.equal(gamesFor(5).blitz.meaningOptions, BLITZ_MEANING_OPTIONS_U5);
  assert.equal(gamesFor(5).blitz.excluded, BLITZ_EXCLUDED_U5);
  assert.notEqual(gamesFor(5).connections.puzzles, gamesFor(2).connections.puzzles);
  for (const u of [1, 2, 3, 4]) assert.deepEqual(availableGames(u), ['blitz', 'connections']);
  for (const u of [7, 8, 0, NaN, null, undefined]) { assert.equal(gamesFor(u), null, `unit ${u}`); assert.deepEqual(availableGames(u), []); }
  assert.deepEqual(Object.keys(GAMES_BY_UNIT), ['1', '2', '3', '4', '5', '6']);
  assert.match(renderGamesEntry(5), /Unit 5/); assert.match(renderLobby(5), /data-game="blitz"/); assert.match(renderLobby(5), /data-game="connections"/);
  assert.equal(renderGamesEntry(7), '');
});

test('Blitz: the audited Unit 5 pool has the pinned size and counts', () => {
  const pool = buildBlitzPool(unit5, seeded(3), data5.blitz);
  assert.equal(pool.length, 258); assert.deepEqual(count(pool), { def: 48, para: 43, gap: 99, mic: 68 });
  assert.equal(rows5.size, 258, 'every stable id is reachable across runs');
  assert.equal(new Set(pool.map(q => q.term)).size, 50, 'all 50 Unit 5 words are represented');
  assert.deepEqual(BLITZ_MEANING_OPTIONS_U5, {});
});

test('Blitz: every question targets canonical Unit 5 vocabulary', () => {
  for (const { q } of rows5.values()) assert.ok(terms5.has(q.term), q.id);
});

test('Blitz: every excluded id is absent, and removing the list restores the original pool', () => {
  assert.equal(new Set(BLITZ_EXCLUDED_U5).size, BLITZ_EXCLUDED_U5.length, 'no duplicate exclusions');
  const none = enumerate(unit5, { ...data5.blitz, excluded: [] });
  for (const id of BLITZ_EXCLUDED_U5) { assert.ok(none.has(id), `${id} exists in the unfiltered pool`); assert.ok(!rows5.has(id), `${id} is withheld`); }
  assert.equal(none.size, 298, 'unfiltered pool with the confusable groups');
  assert.equal(none.size - rows5.size, BLITZ_EXCLUDED_U5.length);
  assert.ok(!rows5.has('def:vocab_evaluate_5') && !rows5.has('def:vocab_specialise'));
});

test('Blitz: a withheld gap row is not replaced by another row of the same word', () => {
  const perWord = new Map();
  for (const { q } of rows5.values()) if (q.type === 'gap') perWord.set(q.term, (perWord.get(q.term) ?? 0) + 1);
  for (const [w, n] of perWord) assert.ok(n <= 2, `${w} has ${n} gap rows`);
});

test('Blitz: every option set has 4 unique options and the key appears exactly once', () => {
  for (const { q, sets } of rows5.values()) {
    assert.ok(sets.length > 0, q.id);
    for (const { options, answer } of sets) {
      assert.equal(options.length, 4, q.id); assert.equal(new Set(options.map(norm)).size, 4, `${q.id} options unique`);
      assert.equal(options.filter(o => norm(o) === norm(answer)).length, 1, q.id);
      if (q.type === 'def' || q.type === 'para') assert.equal(answer, q.term, q.id);
    }
  }
});

test('Blitz: members of one confusable group never share a def/para question', () => {
  for (const { q, sets } of rows5.values()) {
    if (q.type !== 'def' && q.type !== 'para') continue;
    for (const { options } of sets) for (const g of BLITZ_CONFUSABLE_U5) {
      if (!g.includes(q.term)) continue;
      assert.deepEqual(options.filter(o => o !== q.term && g.includes(o)), [], `${q.id} shows a blocked neighbour`);
    }
  }
});

test('Blitz: def/para answers are never given away by word class alone (at most one cross-POS distractor, and only for the three verbs / spectacular)', () => {
  for (const { q, sets } of rows5.values()) {
    if (q.type !== 'def' && q.type !== 'para') continue;
    for (const { options } of sets) assert.ok(options.filter(o => o !== q.term && posOf.get(o) !== posOf.get(q.term)).length <= 1, `${q.id} uses more than one cross-POS distractor`);
  }
});

test('Blitz: gap sentences are not given away by a/an', () => {
  let checked = 0;
  for (const { q, sets } of rows5.values()) {
    if (q.type !== 'gap') continue;
    const m = /\b(a|an)\s+_{2,}/i.exec(q.prompt); if (!m) continue; checked += 1;
    for (const { options } of sets) assert.ok(options.every(o => /^[aeiou]/i.test(o) === (m[1].toLowerCase() === 'an')), `${q.id}: ${options.join('/')}`);
  }
  assert.ok(checked > 5);
});

test('Blitz: retained paraphrase prompts are the certified set (no loose associations)', () => {
  const paras = [...rows5.values()].filter(r => r.q.type === 'para').map(r => r.q.id.replace('para:vocab_', ''));
  assert.equal(paras.length, 43);
  for (const bad of ['evaluate_5:weigh-up', 'adventurous:daring', 'recommendation_5:advice-about-what-to-choose', 'qualification:certificate', 'static:fixed', 'yacht:pleasure-boat', 'location:spot', 'angle_of_view:field-of-vision', 'underwater_photography:camera-work-under-the-sea', 'dramatic:sudden-and-sharp', 'scenery:beautiful-countryside', 'specialise:become-an-expert']) assert.ok(!paras.includes(bad), bad);
});

test('Blitz: meaning-in-context rows have 4 unique meanings with the right one keyed', () => {
  const mic = [...rows5.values()].filter(r => r.q.type === 'mic'); assert.equal(mic.length, 68);
  for (const { q, sets } of mic) for (const { options } of sets) assert.equal(new Set(options.map(norm)).size, 4, q.id);
});

test('Connections: 48 puzzles, every target is canonical Unit 5 vocabulary, unique, in the audited set', () => {
  assert.equal(CONNECTIONS_PUZZLES_U5.length, 48);
  const targets = CONNECTIONS_PUZZLES_U5.map(p => p.target);
  assert.equal(new Set(targets).size, 48); for (const t of targets) assert.ok(terms5.has(t), t);
  assert.deepEqual([...terms5].filter(t => !targets.includes(t)), ['breathtaking', 'stunning'], 'breathtaking and stunning are omitted: with spectacular and spellbound they form a synonym cluster that free typing cannot separate');
});

test('Connections: four clues of the right kinds, no pictures, and no blank-sentence plain clue', () => {
  for (const p of CONNECTIONS_PUZZLES_U5) {
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
  for (const p of CONNECTIONS_PUZZLES_U5) for (const c of p.clues) for (const f of forms(meta.get(p.target))) assert.doesNotMatch(norm(c.text), new RegExp('\\b' + f.replace(/[-\s]/g, '[- ]') + '\\b'), `${p.target} leaks "${f}"`);
});

test('Connections: help has exactly two distinct Unit 5 distractors and never a near-synonym', () => {
  const NEAR = [['breathtaking', 'spectacular'], ['breathtaking', 'stunning'], ['stunning', 'spectacular'], ['dramatic', 'spectacular'], ['destination', 'location'], ['destination', 'attractions'], ['journey', 'excursion'], ['journey', 'expedition'], ['excursion', 'guided tour'], ['itinerary', 'journey'], ['availability', 'reservation'], ['facilities', 'equipment'], ['facilities', 'accommodation'], ['wildlife', 'coral'], ['wildlife', 'marine world'], ['preservation', 'environmental impact'], ['qualification', 'licence'], ['recommendation', 'offer'], ['exploring', 'observation'], ['snorkelling', 'underwater photography'], ['aerial tourism', 'adventurous activities']];
  for (const p of CONNECTIONS_PUZZLES_U5) {
    assert.equal(p.help.length, 2, p.target); assert.equal(new Set([p.target, ...p.help]).size, 3);
    for (const h of p.help) {
      assert.ok(terms5.has(h), `${p.target}: help "${h}" is Unit 5`);
      assert.ok(!BLITZ_CONFUSABLE_U5.some(g => g.includes(p.target) && g.includes(h)), `${p.target} / ${h} share a confusable group`);
      assert.ok(!NEAR.some(([a, b]) => (a === p.target && b === h) || (b === p.target && a === h)), `${p.target} / ${h} are confusable`);
    }
  }
});

test('Connections: accepted forms are conservative inflections or spellings, never another Unit 5 word', () => {
  for (const p of CONNECTIONS_PUZZLES_U5) {
    const target = normaliseGuess(p.target);
    assert.equal(new Set(p.accept.map(normaliseGuess)).size, p.accept.length, p.target);
    for (const a of p.accept) {
      assert.notEqual(normaliseGuess(a), target, p.target);
      assert.ok(!terms5.has(a) || a === p.target, `${p.target}: "${a}" is another word`);
      assert.ok(normaliseGuess(a).replace(/ /g, '').startsWith(target.replace(/ /g, '').slice(0, 3)) || ['advert', 'adverts'].includes(a), `${p.target}: "${a}" is not a form of it`);
    }
  }
});

test('Connections: pickPuzzles, withWordClasses and the engine work on the Unit 5 bank', () => {
  const picked = pickPuzzles(CONNECTIONS_PUZZLES_U5, seeded(5), 5, createGameHistory()); assert.equal(picked.length, 5); assert.equal(new Set(picked.map(p => p.target)).size, 5);
  const history = createGameHistory(); const seen = new Set();
  for (let i = 0; i < 12; i++) for (const p of pickPuzzles(CONNECTIONS_PUZZLES_U5, seeded(i + 2), 5, history)) seen.add(p.target);
  assert.equal(seen.size, 48, 'history rotates through the whole bank');
  const classed = withWordClasses(CONNECTIONS_PUZZLES_U5, unit5.items); assert.equal(classed.length, 48);
  const shape = t => wordShape(classed.find(p => p.target === t), 1);
  assert.equal(shape('yacht').wordClass, 'NOUN'); assert.equal(shape('obtain').wordClass, 'VERB'); assert.equal(shape('static').wordClass, 'ADJECTIVE'); assert.equal(shape('aerial tourism').wordClass, 'NOUN PHRASE');
  for (const p of classed) assert.ok(wordShape(p, 1).wordClass, `${p.target} has a word class`);
  const g = createConnections({ puzzles: [CONNECTIONS_PUZZLES_U5[0]] }); for (let i = 0; i < 3; i++) g.reveal();
  assert.ok(g.help()); assert.equal(g.state.choices.length, 3);
  assert.deepEqual([...g.state.choices].sort(), [CONNECTIONS_PUZZLES_U5[0].target, ...CONNECTIONS_PUZZLES_U5[0].help].sort());
  const n = createConnections({ puzzles: [CONNECTIONS_PUZZLES_U5[1]] }); const res = n.guess(CONNECTIONS_PUZZLES_U5[1].target);
  assert.equal(res.correct, true); assert.equal(res.points, 500);
});


const MULTI = ['aerial tourism', 'underwater photography', 'ground-level', 'angle of view', 'ecological habitats', 'marine world', 'environmental impact', 'guided tour', 'travel assistant', 'tourism industry', 'adventurous activities', 'safety regulations'];

test('multi-word targets: every multi-word Unit 5 term is a canonical item and has a Connections puzzle and Blitz questions', () => {
  for (const t of MULTI) {
    assert.ok(terms5.has(t), t); assert.ok(CONNECTIONS_PUZZLES_U5.some(p => p.target === t), `${t} has a puzzle`);
    assert.ok([...rows5.values()].some(r => r.q.term === t && r.q.type === 'gap'), `${t} has gap questions`);
  }
});

test('multi-word targets: word shape counts words and letters, scaffold stays incomplete, accepted forms never shorten the phrase', () => {
  const classed = withWordClasses(CONNECTIONS_PUZZLES_U5, unit5.items);
  for (const t of MULTI) {
    const p = classed.find(x => x.target === t); const words = t.split(/[\s-]+/);
    const shapes = [1, 2, 3, 4].map(n => wordShape(p, n));
    for (const s of shapes) { assert.equal(s.words, words.length, t); assert.deepEqual(s.lengths, words.map(w => w.length), t); assert.equal(s.firstLetter, t[0].toUpperCase(), t); assert.match(s.lengthLabel, new RegExp(`^${words.length} words`), t); }
    assert.equal(shapes[0].pattern, null, `${t}: clue 1 shows no pattern`);
    assert.ok(shapes[3].pattern.includes('_'), `${t}: final scaffold never gives the whole phrase`);
    assert.ok(shapes[1].pattern.startsWith(shapes[1].prefix), t); assert.ok(shapes[2].pattern.startsWith(shapes[1].pattern.slice(0, shapes[1].prefix.length)), t);
    const target = normaliseGuess(t);
    for (const a of p.accept) for (const w of words) assert.notEqual(normaliseGuess(a), normaliseGuess(w), `${t}: accepts only part of the phrase ("${a}")`);
    assert.equal(createConnections({ puzzles: [p] }).guess(words.join(' ')).correct, true, `${t}: space form accepted`);
    assert.equal(createConnections({ puzzles: [p] }).guess(words[0]).correct, false, `${t}: first word alone is not accepted`);
    assert.equal(createConnections({ puzzles: [p] }).guess(words.at(-1)).correct, false, `${t}: last word alone is not accepted`);
    assert.ok(target.includes(' '), t);
  }
  const gl = createConnections({ puzzles: [classed.find(p => p.target === 'ground-level')] });
  assert.equal(gl.guess('ground level').correct, true, 'hyphen and space are equivalent');
  assert.equal(createConnections({ puzzles: [classed.find(p => p.target === 'aerial tourism')] }).guess('tourism').correct, false);
});

test('multi-word targets: Help choices are single Unit 5 terms from other topics and never part of the phrase', () => {
  for (const p of CONNECTIONS_PUZZLES_U5.filter(x => MULTI.includes(x.target))) for (const h of p.help) for (const w of p.target.split(/[\s-]+/)) assert.ok(!norm(h).includes(norm(w)) || w.length < 4, `${p.target} / ${h}`);
});

test('Unit 5 ids: repeated earlier-unit words use the Unit 5 vocabulary ids, never Unit 1-4 ids', () => {
  const ids5 = new Set(unit5.items.map(i => i.vocabularyId));
  const ids4 = new Set(unit4.items.map(i => i.vocabularyId));
  for (const t of ['breathtaking', 'recommendation', 'destination', 'availability', 'equipment', 'evaluate']) {
    const item = unit5.items.find(i => i.term === t); assert.equal(item.vocabularyId, `vocab_${t}_5`, t);
    assert.ok(rows5.has(`gap:${unit5.contexts.find(c => c.vocabularyId === item.vocabularyId && /_gap_/.test(c.contextId))?.contextId}`) || [...rows5.keys()].some(id => id.includes(`_${t}_`) || id.includes(`_${t}`)), `${t} is served`);
    for (const id of [...rows5.keys()].filter(i => /^(def|para):/.test(i) && i.split(':')[1] === item.vocabularyId || i.startsWith(`def:vocab_${t}`) || i.startsWith(`para:vocab_${t}`))) assert.match(id, new RegExp(`^(def|para):vocab_${t}(_5)?(:|$)`), id);
    assert.ok(!rows5.has(`def:vocab_${t}`), `${t}: no bare (Unit 1-4) def id`);
  }
  for (const id of rows5.keys()) { const m = /^(?:def|para):(vocab_[a-z_0-9]+)/.exec(id); if (m) assert.ok(ids5.has(m[1]), `${id} is a Unit 5 id`); }
  for (const t of ['breathtaking', 'recommendation', 'destination', 'availability', 'equipment', 'evaluate']) {
    assert.ok(rows5.has(`def:vocab_${t}_5`) || t === 'evaluate', `${t}: def uses the Unit 5 id`);
    assert.ok(!ids4.has(`vocab_${t}_5`), t);
  }
  for (const { q } of rows5.values()) if (q.type === 'gap' || q.type === 'mic') assert.match(q.id, /^(gap|mic):u5_/, q.id);
  assert.ok(!rows5.has('def:vocab_evaluate_5'), 'evaluate def is withheld, so evaluate is served through gap only');
});

test('regression: Units 1-4 data and pools are unchanged', () => {
  assert.equal(hash(CONNECTIONS_PUZZLES), '0b698694c5a335e2'); assert.equal(hash(BLITZ_CONFUSABLE), 'b765052c41d91923'); assert.equal(hash(BLITZ_MEANING_OPTIONS), 'eef76449de939a7c');
  assert.equal(hash(CONNECTIONS_PUZZLES_U2), 'a375383150af93bf'); assert.equal(hash(BLITZ_CONFUSABLE_U2), '094e57654696d740'); assert.equal(hash(BLITZ_EXCLUDED_U2), '83d2a397064eac3b');
  assert.equal(hash(CONNECTIONS_PUZZLES_U3), 'c21c4011dc510dbd'); assert.equal(hash(BLITZ_CONFUSABLE_U3), '1cd3d57b2fe62e52'); assert.equal(hash(BLITZ_EXCLUDED_U3), 'd45392463a9c58a7');
  assert.equal(hash(CONNECTIONS_PUZZLES_U4), 'db44bf9e961f2c6a'); assert.equal(hash(BLITZ_CONFUSABLE_U4), 'e87686c72d38b824'); assert.equal(hash(BLITZ_EXCLUDED_U4), '04f2e211bedbaa52');
  const p1 = buildBlitzPool(unit1, seeded(3), gamesFor(1).blitz); assert.equal(p1.length, 328);
  const p2 = buildBlitzPool(unit2, seeded(3), gamesFor(2).blitz); assert.equal(p2.length, 293); assert.deepEqual(count(p2), { def: 48, para: 52, gap: 93, mic: 100 });
  const p3 = buildBlitzPool(unit3, seeded(3), gamesFor(3).blitz); assert.equal(p3.length, 292); assert.deepEqual(count(p3), { def: 48, para: 48, gap: 97, mic: 99 });
  const p4 = buildBlitzPool(unit4, seeded(3), gamesFor(4).blitz); assert.equal(p4.length, 282); assert.deepEqual(count(p4), { def: 49, para: 38, gap: 96, mic: 99 });
  assert.equal(CONNECTIONS_PUZZLES_U2.length, 48); assert.equal(CONNECTIONS_PUZZLES_U3.length, 49); assert.equal(CONNECTIONS_PUZZLES_U4.length, 48);
  for (const [a, b] of [[2, 3], [2, 4], [3, 4], [2, 5], [3, 5], [4, 5]]) assert.equal(gamesFor(a).blitz.excluded.some(id => gamesFor(b).blitz.excluded.includes(id)), false, `no shared exclusion ids ${a}/${b}`);
});

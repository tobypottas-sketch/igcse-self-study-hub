// Unit 2 (Digital Life) Games: registration, Word Blitz data, Connections v2 bank. Unit 1 data and all game mechanics stay untouched.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import unit1 from '../content/vocabulary/units/unit-01.js';
import unit2 from '../content/vocabulary/units/unit-02.js';
import { GAMES_BY_UNIT, gamesFor, availableGames, CONNECTIONS_PUZZLES, BLITZ_CONFUSABLE, BLITZ_MEANING_OPTIONS } from '../src/vocabulary/games/games-data.js';
import { BLITZ_CONFUSABLE_U2, BLITZ_EXCLUDED_U2, CONNECTIONS_PUZZLES_U2 } from '../src/vocabulary/games/games-data-unit-02.js';
import { buildBlitzPool, createBlitz } from '../src/vocabulary/games/blitz-engine.js';
import { pickPuzzles, withWordClasses, wordShape, acceptedForms, createConnections, normaliseGuess, CONNECTIONS } from '../src/vocabulary/games/connections-engine.js';
import { createGameHistory } from '../src/vocabulary/games/games-history.js';
import { renderLobby, renderConnectionsPlay } from '../src/vocabulary/games/games-view.js';

const seeded = (seed = 7) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const norm = s => String(s).toLowerCase();
const terms2 = new Set(unit2.items.map(i => norm(i.term)));
const hash = x => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
const root = p => fs.readFileSync(fileURLToPath(new URL('../' + p, import.meta.url)), 'utf8');
const data2 = gamesFor(2);

test('registration: Unit 1 stays Unit 1, Unit 2 is Unit 2, later units borrow nothing', () => {
  assert.equal(gamesFor(1).connections.puzzles, CONNECTIONS_PUZZLES);
  assert.equal(gamesFor(2).connections.puzzles, CONNECTIONS_PUZZLES_U2);
  assert.equal(gamesFor(2).blitz.confusable, BLITZ_CONFUSABLE_U2);
  assert.notEqual(gamesFor(2).connections.puzzles, gamesFor(1).connections.puzzles);
  assert.deepEqual(availableGames(1), ['blitz', 'connections']);
  assert.deepEqual(availableGames(2), ['blitz', 'connections']);
  for (const unit of [5, 6, 7, 0, NaN, null, undefined]) { assert.equal(gamesFor(unit), null, `unit ${unit}`); assert.deepEqual(availableGames(unit), []); }
  assert.deepEqual(Object.keys(GAMES_BY_UNIT), ['1', '2', '3', '4']);
});

test('Unit 1 game data is byte-for-byte what it was before Unit 2 was added', () => {
  assert.equal(hash(CONNECTIONS_PUZZLES), '0b698694c5a335e2');
  assert.equal(hash(BLITZ_CONFUSABLE), 'b765052c41d91923');
  assert.equal(hash(BLITZ_MEANING_OPTIONS), 'eef76449de939a7c');
});

test('Blitz: Unit 2 data is non-empty, every term is a Unit 2 word, groups have no duplicates and meet the engine minimums', () => {
  assert.ok(BLITZ_CONFUSABLE_U2.length >= 10);
  const seen = new Set();
  for (const group of BLITZ_CONFUSABLE_U2) {
    assert.ok(Array.isArray(group) && group.length >= 2, 'a group has at least two words');
    assert.equal(new Set(group).size, group.length, `no duplicate inside ${group}`);
    for (const t of group) { assert.ok(terms2.has(t), `${t} is a Unit 2 word`); assert.equal(t, t.toLowerCase()); seen.add(t); }
  }
  assert.ok(seen.size >= 30, `${seen.size} words are in a confusable group`);
  assert.ok(!BLITZ_CONFUSABLE_U2.flat().some(t => unit1.items.some(i => norm(i.term) === t) && !terms2.has(t)));
});

test('Blitz: the Unit 2 pool is built from Unit 2 words only, every question has 4 distinct options and one answer, and no option shares a confusable group', () => {
  const pool = buildBlitzPool(unit2, seeded(3), data2.blitz);
  assert.ok(pool.length > 250, `pool ${pool.length}`);
  const clusterOf = t => new Set(BLITZ_CONFUSABLE_U2.filter(g => g.includes(t)).flat());
  const covered = new Set();
  for (let round = 0; round < 40; round++) for (const q of buildBlitzPool(unit2, seeded(round + 1), data2.blitz)) {
    assert.ok(terms2.has(norm(q.term)), `${q.term} is Unit 2`); covered.add(norm(q.term));
    const b = q.build(); if (!b) continue;
    assert.equal(b.options.length, 4); assert.equal(new Set(b.options.map(norm)).size, 4, `${q.type}:${q.term} has distinct options`);
    if (q.type === 'def' || q.type === 'para') {
      const cluster = clusterOf(norm(q.term));
      for (const o of b.options) if (norm(o) !== norm(q.term) && terms2.has(norm(o))) assert.ok(!cluster.has(norm(o)), `${q.term} must not be offered with ${o}`);
    }
  }
  assert.equal(covered.size, unit2.items.length, 'every Unit 2 word appears in at least one Blitz question');
  for (const q of buildBlitzPool(unit2, seeded(9), data2.blitz)) for (const o of q.build()?.options ?? []) assert.ok(!/\bunit 1\b/i.test(o));
});

test('Blitz: a game on Unit 2 plays with the existing 60 second, 100-point, streak-multiplier rules', () => {
  let t = 0; const game = createBlitz({ content: unit2, rng: seeded(5), now: () => t, history: createGameHistory(), data: data2.blitz });
  game.start(); assert.equal(game.state.status, 'playing'); assert.equal(game.state.durationMs, 60000);
  const scores = [];
  for (let i = 0; i < 4; i++) { const q = game.state.question; assert.equal(q.options.length, 4); assert.ok(terms2.has(norm(q.term))); const r = game.answer(q.answerIndex); scores.push(r.points); game.next?.(); }
  assert.deepEqual(scores, [100, 100, 200, 200], 'streak 3 reaches x2 exactly as in Unit 1');
  t = 60001; assert.equal(game.tick(), 'over');
});

test('Blitz: Unit 1 still builds exactly as before (same pool size for the same seed)', () => {
  const a = buildBlitzPool(unit1, seeded(11), gamesFor(1).blitz).length, b = buildBlitzPool(unit1, seeded(11), { confusable: CONNECTIONS_PUZZLES && BLITZ_CONFUSABLE, meaningOptions: BLITZ_MEANING_OPTIONS }).length;
  assert.equal(a, b); assert.ok(a > 100);
});

const meta = new Map(unit2.items.map(i => [norm(i.term), i]));
test('Connections: the bank is non-empty, targets are unique Unit 2 words, and no picture fields exist', () => {
  assert.ok(CONNECTIONS_PUZZLES_U2.length >= 45, `${CONNECTIONS_PUZZLES_U2.length} puzzles`);
  assert.equal(new Set(CONNECTIONS_PUZZLES_U2.map(p => p.target)).size, CONNECTIONS_PUZZLES_U2.length);
  for (const p of CONNECTIONS_PUZZLES_U2) {
    assert.ok(terms2.has(p.target), `${p.target} is a Unit 2 word`);
    assert.doesNotMatch(JSON.stringify(p), /"(image|img|picture|pic|src|url|emoji|icon)"/i, p.target);
  }
});

test('Connections: four clues in the situation / context / plain / meaning order, each text-only and non-empty', () => {
  for (const p of CONNECTIONS_PUZZLES_U2) {
    assert.deepEqual(p.clues.map(c => c.kind), ['situation', 'context', 'plain', 'meaning'], p.target);
    assert.equal(p.clues.length, CONNECTIONS.clues);
    for (const c of p.clues) { assert.equal(typeof c.text, 'string'); assert.ok(c.text.length >= 12 && c.text.length <= 190, `${p.target}: clue length ${c.text.length}`); assert.deepEqual(Object.keys(c).sort(), ['kind', 'text']); }
    assert.equal(new Set(p.clues.map(c => c.text)).size, 4, `${p.target}: four different clues`);
    assert.ok(p.why && p.why.length > 30 && p.why.length < 260, p.target);
  }
});

test('Connections: no clue contains the target or one of its word-family forms', () => {
  const forms = item => [item.term, ...(item.wordFamily ?? []), ...(item.senses?.[0]?.wordFamilyForms ?? []).map(f => f?.form ?? '')].map(norm).filter(x => x.length > 3);
  for (const p of CONNECTIONS_PUZZLES_U2) for (const c of p.clues) for (const f of forms(meta.get(p.target))) assert.doesNotMatch(norm(c.text), new RegExp('\\b' + f.replace(/[-\s]/g, '[- ]') + '\\b'), `${p.target} leaks "${f}"`);
});

test('Connections: help has exactly two Unit 2 distractors, never the target and never a near-synonym of it', () => {
  const NEAR = [['availability', 'access'], ['device', 'equipment'], ['device', 'accessory'], ['essential', 'critical'], ['impressive', 'professional'], ['affordable', 'competitive'], ['communicate', 'admit'], ['professional', 'high-performance'], ['feature', 'function'], ['entertainment', 'streaming'], ['removable', 'adjustable'], ['concentrate', 'multi-task'], ['educational', 'informed']];
  for (const p of CONNECTIONS_PUZZLES_U2) {
    assert.equal(p.help.length, 2, p.target); assert.equal(new Set(p.help).size, 2);
    for (const h of p.help) {
      assert.notEqual(h, p.target); assert.ok(terms2.has(h), `${p.target}: help "${h}" is Unit 2`);
      assert.ok(!NEAR.some(([a, b]) => (a === p.target && b === h) || (b === p.target && a === h)), `${p.target} / ${h} are confusable`);
    }
  }
});

test('Connections: accepted forms are genuine inflections or spellings and never another Unit 2 word', () => {
  for (const p of CONNECTIONS_PUZZLES_U2) {
    const target = normaliseGuess(p.target);
    assert.equal(new Set(p.accept.map(normaliseGuess)).size, p.accept.length, `${p.target}: no duplicate accepted forms`);
    for (const a of p.accept) {
      assert.notEqual(normaliseGuess(a), target, `${p.target}: "${a}" duplicates the target`);
      assert.ok(!terms2.has(norm(a)), `${p.target}: "${a}" is another Unit 2 word`);
      assert.ok(normaliseGuess(a).replace(/ /g, '').startsWith(target.replace(/ /g, '').slice(0, Math.max(3, target.replace(/ /g, '').length - 3))), `${p.target}: "${a}" is not a form of the target`);
    }
    assert.ok(acceptedForms(p).has(target));
  }
  const mt = CONNECTIONS_PUZZLES_U2.find(p => p.target === 'multi-task');
  for (const typed of ['multi-task', 'multi task', 'multitask', 'Multi-Tasking']) assert.ok(acceptedForms(mt).has(normaliseGuess(typed)), typed);
  assert.ok(acceptedForms(CONNECTIONS_PUZZLES_U2.find(p => p.target === 'high-performance')).has(normaliseGuess('high performance')));
});

test('Connections: Unit 2 works through pickPuzzles and withWordClasses resolves every Unit 2 target to its own part of speech', () => {
  const picked = pickPuzzles(CONNECTIONS_PUZZLES_U2, seeded(4), 5, createGameHistory()); assert.equal(picked.length, 5);
  assert.equal(new Set(picked.map(p => p.target)).size, 5); for (const p of picked) assert.ok(terms2.has(p.target));
  const history = createGameHistory(); const seen = new Set();
  for (let i = 0; i < 10; i++) for (const p of pickPuzzles(CONNECTIONS_PUZZLES_U2, seeded(i + 2), 5, history)) seen.add(p.target);
  assert.equal(seen.size, CONNECTIONS_PUZZLES_U2.length, 'history rotates through the whole bank');
  const classed = withWordClasses(CONNECTIONS_PUZZLES_U2, unit2.items);
  const shape = t => wordShape(classed.find(p => p.target === t), 1);
  assert.equal(shape('afford').wordClass, 'VERB'); assert.equal(shape('digital').wordClass, 'ADJECTIVE'); assert.equal(shape('remotely').wordClass, 'ADVERB');
  assert.equal(shape('device').wordClass, 'NOUN'); assert.equal(shape('current affairs').wordClass, 'NOUN PHRASE'); assert.equal(shape('high-performance').wordClass, 'ADJECTIVE');
  for (const p of classed) assert.ok(wordShape(p, 1).wordClass, `${p.target} has a word class`);
});

test('Connections: scaffold depends only on the clue stage and the target, never on what is typed', () => {
  const classed = withWordClasses(CONNECTIONS_PUZZLES_U2, unit2.items);
  for (const p of classed) {
    const letters = p.target.replace(/[^a-z]/g, '').length; const shapes = [1, 2, 3, 4].map(n => wordShape(p, n));
    assert.deepEqual(shapes.map(s => s.letters), [letters, letters, letters, letters], p.target);
    for (const n of [1, 2, 3, 4]) assert.deepEqual(wordShape({ ...p }, n), wordShape(p, n), `${p.target} stage ${n} deterministic`);
    assert.equal(shapes[0].firstLetter, p.target[0].toUpperCase());
    assert.ok(shapes[3].pattern.includes('_'), `${p.target}: the final scaffold never gives the whole word`);
  }
  const g = createConnections({ puzzles: classed.slice(0, 2) }); const before = JSON.stringify(wordShape(g.puzzle(), g.state.revealed));
  g.guess('zzz'); g.guess('ab'); assert.equal(JSON.stringify(wordShape(g.puzzle(), g.state.revealed)), before);
});

test('Connections: wrong guesses are free; scoring is 500/400/300/200, help 100, reveal 0 (engine unchanged)', () => {
  for (const [clues, points] of [[1, 500], [2, 400], [3, 300], [4, 200]]) {
    const g = createConnections({ puzzles: [CONNECTIONS_PUZZLES_U2[0]] });
    for (let i = 1; i < clues; i++) g.reveal();
    assert.equal(g.guess('wrong guess').correct, false); assert.equal(g.guess('another wrong one').correct, false); assert.equal(g.state.score, 0);
    assert.deepEqual(g.guess(CONNECTIONS_PUZZLES_U2[0].target), { correct: true, points });
  }
  const g = createConnections({ puzzles: [CONNECTIONS_PUZZLES_U2[3]] }); for (let i = 0; i < 3; i++) g.reveal();
  assert.ok(g.help()); assert.equal(g.state.choices.length, 3); assert.deepEqual([...g.state.choices].sort(), [CONNECTIONS_PUZZLES_U2[3].target, ...CONNECTIONS_PUZZLES_U2[3].help].sort());
  const wrong = g.state.choices.find(c => c !== CONNECTIONS_PUZZLES_U2[3].target); assert.equal(g.pick(wrong).correct, false);
  assert.deepEqual(g.pick(CONNECTIONS_PUZZLES_U2[3].target), { correct: true, points: 100 });
  const r = createConnections({ puzzles: [CONNECTIONS_PUZZLES_U2[5]] }); for (let i = 0; i < 3; i++) r.reveal(); assert.ok(r.giveUp()); assert.equal(r.state.score, 0);
});

test('views: the Unit 2 lobby offers both games and the Connections screen speaks of Unit 2 words only', () => {
  const lobby = renderLobby(2);
  assert.match(lobby, /data-game="blitz"/); assert.match(lobby, /data-game="connections"/); assert.doesNotMatch(lobby, /data-games-unavailable|Unit 1/);
  const play = renderConnectionsPlay(createConnections({ puzzles: withWordClasses(CONNECTIONS_PUZZLES_U2, unit2.items).slice(0, 2) }), 2);
  assert.match(play, /Unit 2 word/); assert.doesNotMatch(play, /Unit 1/);
});

test('no Unit 1 word leaks into Unit 2 (unless it is a Unit 2 word too)', () => {
  const only1 = new Set(unit1.items.map(i => norm(i.term)).filter(t => !terms2.has(t)));
  for (const p of CONNECTIONS_PUZZLES_U2) { assert.ok(!only1.has(p.target)); for (const h of p.help) assert.ok(!only1.has(h)); }
  for (const g of BLITZ_CONFUSABLE_U2) for (const t of g) assert.ok(!only1.has(t));
});

test('scope: the Unit 2 Games change touches no sound, scoring, timer, Supabase, SQL or Unit Check code', () => {
  const code = root('src/vocabulary/games/games-data-unit-02.js').replace(/\/\/.*$/gm, '');
  assert.doesNotMatch(code, /import |supabase|fetch\(|localStorage|sessionStorage|indexedDB|Audio|\.wav|\.mp3/i);
  for (const f of ['blitz-engine', 'connections-engine', 'games-view', 'games-controller', 'games-history']) assert.doesNotMatch(root(`src/vocabulary/games/${f}.js`), /games-data-unit-02/);
});

// ---- Semantic-safety guards (corrective audit of the Unit 2 Blitz pool and Connections bank) ----
const enumerate = (data, content = unit2) => { const byId = new Map(); for (let seed = 1; seed <= 60; seed += 1) for (const q of buildBlitzPool(content, seeded(seed), data)) if (!byId.has(q.id)) byId.set(q.id, q); return [...byId.values()]; };
const livePool = enumerate(data2.blitz);

test('Blitz audit: the Unit 2 pool can be enumerated and its size and type counts are pinned', () => {
  const counts = livePool.reduce((c, q) => ({ ...c, [q.type]: (c[q.type] ?? 0) + 1 }), {});
  assert.deepEqual(counts, { def: 48, para: 52, gap: 93, mic: 100 });
  assert.equal(livePool.length, 293);
});

test('Blitz audit: every excluded id is real, and no excluded question is ever served', () => {
  const unfiltered = enumerate({ ...data2.blitz, excluded: [] }).map(q => q.id); const live = new Set(livePool.map(q => q.id));
  assert.ok(BLITZ_EXCLUDED_U2.length >= 40); assert.equal(new Set(BLITZ_EXCLUDED_U2).size, BLITZ_EXCLUDED_U2.length);
  for (const id of BLITZ_EXCLUDED_U2) { assert.ok(unfiltered.includes(id), `${id} no longer exists in the canonical pool (stale exclusion)`); assert.ok(!live.has(id), `${id} must not be served`); }
  assert.equal(unfiltered.length - BLITZ_EXCLUDED_U2.length, livePool.length, 'withholding a gap row never lets another row slip in');
});

test('Blitz audit regression: "Another way to say… two-way" with "interactive" can never be served', () => {
  assert.ok(!livePool.some(q => q.type === 'para' && norm(q.prompt) === 'two-way'));
  assert.ok(!livePool.some(q => q.term === 'interactive' && q.type === 'para'), 'interactive has no paraphrase prompt at all');
  for (let seed = 1; seed <= 80; seed += 1) for (const q of buildBlitzPool(unit2, seeded(seed), data2.blitz)) assert.ok(!(norm(q.prompt) === 'two-way' || norm(q.prompt) === 'hands-on'), 'no loose paraphrase for interactive');
  assert.ok(BLITZ_EXCLUDED_U2.includes('para:vocab_interactive:two-way'));
});

test('Blitz audit: loose paraphrases stay out of "Another way to say…" (broader/narrower, association, collocation)', () => {
  const served = new Set(livePool.filter(q => q.type === 'para').map(q => `${q.term}|${norm(q.prompt)}`));
  for (const bad of ['relevant|related', 'relevant|connected', 'digital|electronic', 'professional|expert', 'informed|aware', 'widespread|common', 'regional|local', 'percentage|proportion', 'culture|customs and traditions', 'availability|supply', 'communicate|exchange ideas', 'remote control|controller', 'impression|general feeling', 'admit|confess']) assert.ok(!served.has(bad), bad);
  for (const good of ['afford|have enough money for', 'removable|detachable', 'genuine|real', 'overcome|get past', 'multi-task|do several things at once']) assert.ok(served.has(good), good);
});

test('Blitz audit: every served question has 4 unique options and exactly one keyed answer', () => {
  for (let round = 0; round < 25; round += 1) for (const q of buildBlitzPool(unit2, seeded(round + 100), data2.blitz)) {
    const b = q.build(); assert.ok(b, q.id); assert.equal(b.options.length, 4, q.id);
    assert.equal(new Set(b.options.map(norm)).size, 4, `${q.id} has duplicate options`);
    assert.equal(b.options.filter(o => norm(o) === norm(b.options[b.answerIndex])).length, 1, `${q.id}: keyed answer appears once`);
    if (q.type === 'def' || q.type === 'para') assert.equal(b.options[b.answerIndex], q.term, q.id);
  }
});

test('Blitz audit: no confusable pair is ever shown together in a def/para question, and the adverbs are never answered by word class alone', () => {
  const pos = new Map(unit2.items.map(i => [i.term, i.partOfSpeech])); const group = t => new Set(BLITZ_CONFUSABLE_U2.filter(g => g.includes(t)).flat());
  for (let round = 0; round < 40; round += 1) for (const q of buildBlitzPool(unit2, seeded(round + 200), data2.blitz)) {
    if (q.type !== 'def' && q.type !== 'para') continue; const b = q.build();
    for (const o of b.options) if (o !== q.term) assert.ok(!group(q.term).has(o), `${q.id}: ${o} is a near-neighbour of ${q.term}`);
    const cross = b.options.filter(o => o !== q.term && pos.get(o) !== pos.get(q.term)).length;
    assert.ok(cross <= 1, `${q.id}: ${cross} distractors come from a different word class`);
  }
  assert.ok(!livePool.some(q => (q.type === 'def' || q.type === 'para') && (q.term === 'apparently' || q.term === 'supposedly')), 'apparently / supposedly are tested only by gap and meaning-in-context questions');
});

test('Blitz audit: a/an cannot give a gap answer away (at least two options fit the article)', () => {
  for (const q of livePool.filter(x => x.type === 'gap')) {
    const options = q.build().options; const an = /\ban ____/i.test(q.prompt), a = /\ba ____/i.test(q.prompt);
    const vowel = o => /^[aeiou]/i.test(o);
    if (an) assert.ok(options.filter(vowel).length >= 2, `${q.id}: "an ____" leaves ${options.filter(vowel).length} option(s)`);
    if (a) assert.ok(options.filter(o => !vowel(o)).length >= 2, `${q.id}: "a ____" leaves ${options.filter(o => !vowel(o)).length} option(s)`);
  }
});

test('Blitz audit: the engine option is generic and inert without data; Unit 1 serves exactly what it served before', () => {
  const none = buildBlitzPool(unit2, seeded(1), { confusable: [], meaningOptions: {} }).map(q => q.id);
  const some = buildBlitzPool(unit2, seeded(1), { confusable: [], meaningOptions: {}, excluded: [none[0]] }).map(q => q.id);
  assert.ok(!some.includes(none[0])); assert.equal(some.length, none.length - 1);
  assert.equal(gamesFor(1).blitz.excluded, undefined);
  const pool = buildBlitzPool(unit1, () => 0.5, gamesFor(1).blitz); const sig = pool.map(q => q.id + '|' + q.prompt).sort();
  assert.equal(pool.length, 328); assert.equal(hash(sig), 'c9975726638400c9');
});

test('Connections audit: apparently and supposedly are deliberately not puzzles (their meanings overlap in everyday use); both stay in Blitz gap/meaning questions', () => {
  const targets = CONNECTIONS_PUZZLES_U2.map(p => p.target); assert.ok(!targets.includes('apparently')); assert.ok(!targets.includes('supposedly'));
  assert.equal(CONNECTIONS_PUZZLES_U2.length, 48);
  for (const t of ['apparently', 'supposedly']) assert.ok(livePool.some(q => q.term === t && (q.type === 'gap' || q.type === 'mic')));
});

test('Connections audit: feature/function and fixture/accessory clues keep their locked distinctions', () => {
  const clues = t => CONNECTIONS_PUZZLES_U2.find(p => p.target === t).clues.map(c => norm(c.text)).join(' ');
  assert.doesNotMatch(clues('feature'), /\b(purpose|job|designed to do|is for)\b/); assert.doesNotMatch(clues('function'), /\b(noticeable|stands out|persuade you to buy)\b/);
  assert.match(clues('fixture'), /building/); assert.match(clues('accessory'), /add/); assert.doesNotMatch(clues('accessory'), /\bbuilding\b/);
  assert.doesNotMatch(clues('essential'), /\b(critical|crucial)\b/);
});

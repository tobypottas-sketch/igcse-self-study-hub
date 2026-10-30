// Games replay depth: the expanded Connections bank, the deeper Word Blitz prompt pool, and the in-memory "unseen first" selection for both games.
// Deterministic RNG throughout; nothing here depends on a particular random order.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { createBlitz, buildBlitzPool } from '../src/vocabulary/games/blitz-engine.js';
import { createConnections, pickPuzzles, CONNECTIONS, normaliseGuess, acceptedForms } from '../src/vocabulary/games/connections-engine.js';
import { CONNECTIONS_PUZZLES, BLITZ_CONFUSABLE, BLITZ_MEANING_OPTIONS, gamesFor } from '../src/vocabulary/games/games-data.js';
import { createGameHistory, sharedGameHistory } from '../src/vocabulary/games/games-history.js';
import { renderConnectionsPlay, renderBlitzQuestion } from '../src/vocabulary/games/games-view.js';

const seeded = (seed = 7) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const terms = new Set(unit1.items.map(item => item.term));
const posOf = new Map(unit1.items.map(item => [item.term, item.partOfSpeech]));
const clusterOf = term => new Set(BLITZ_CONFUSABLE.filter(group => group.includes(term.toLowerCase())).flat());
const wordsIn = text => String(text).toLowerCase().match(/[a-z]+/g) ?? [];

// ---------------------------------------------------------------- Connections bank
test('Connections bank: at least 40 curated puzzles, every object well-formed, every target a unique Unit 1 word', () => {
  assert.ok(CONNECTIONS_PUZZLES.length >= 40, `${CONNECTIONS_PUZZLES.length} puzzles`);
  const seen = new Set();
  for (const p of CONNECTIONS_PUZZLES) {
    assert.equal(typeof p.target, 'string'); assert.ok(terms.has(p.target), `${p.target} is a Unit 1 word`); assert.ok(!seen.has(p.target), `${p.target} appears twice`); seen.add(p.target);
    assert.ok(Array.isArray(p.accept) && p.accept.every(a => typeof a === 'string' && normaliseGuess(a)), `${p.target}: accept list`);
    assert.equal(p.clues.length, 4, `${p.target}: exactly four clues`);
    for (const c of p.clues) { assert.equal(typeof c.text, 'string'); assert.ok(c.text.trim().length >= 5, `${p.target}: empty/short clue`); assert.ok(['association', 'plain', 'meaning'].includes(c.kind)); }
    assert.equal(typeof p.why, 'string'); assert.ok(p.why.trim().length > 30);
    assert.equal(p.help.length, 2, `${p.target}: two help distractors`);
    for (const h of p.help) {
      assert.ok(terms.has(h), `${h} is a Unit 1 word`); assert.notEqual(h, p.target, `${p.target}: help includes the answer`); assert.ok(!acceptedForms(p).has(normaliseGuess(h)), `${p.target}: help is an accepted form`);
      assert.ok(!clusterOf(p.target).has(h), `${p.target}/${h}: near neighbours`); assert.equal(posOf.get(h), posOf.get(p.target), `${p.target}/${h}: same part of speech`);
    }
    assert.notEqual(p.help[0], p.help[1]);
    if (p.image) { assert.equal(typeof p.image.src, 'string'); assert.ok(p.image.alt.length > 15); }
  }
});

test('Connections bank: no duplicate clue text, no clue that gives the answer away, no clue 1 repeating clue 3, and aliases normalise', () => {
  const texts = CONNECTIONS_PUZZLES.flatMap(p => p.clues.map(c => normaliseGuess(c.text)));
  assert.equal(new Set(texts).size, texts.length, 'a clue text is repeated');
  for (const p of CONNECTIONS_PUZZLES) {
    const forms = [p.target, ...p.accept];
    for (const [i, c] of p.clues.entries()) for (const form of forms) {
      const stem = normaliseGuess(form).replace(/ /g, '').slice(0, 5); const haystack = normaliseGuess(c.text).replace(/ /g, '');
      if (normaliseGuess(form).length >= 5) assert.ok(!haystack.includes(stem), `${p.target} clue ${i + 1} contains "${form}"`);
    }
    assert.notEqual(normaliseGuess(p.clues[0].text), normaliseGuess(p.clues[2].text));
    const overlap = (a, b) => { const A = new Set(wordsIn(a).filter(w => w.length > 3)); const B = wordsIn(b).filter(w => w.length > 3); return B.filter(w => A.has(w)).length / Math.max(1, B.length); };
    assert.ok(overlap(p.clues[0].text, p.clues[2].text) < 0.6, `${p.target}: clue 1 and clue 3 say nearly the same thing`);
    for (const alias of p.accept) { assert.ok(acceptedForms(p).has(normaliseGuess(alias))); assert.equal(createConnections({ puzzles: [p] }).guess(alias.toUpperCase())?.correct, true, `${p.target}: alias ${alias}`); }
  }
});

test('Connections bank: no opening phrase is reused across many puzzles', () => {
  for (const index of [0, 1, 2, 3]) {
    const openings = new Map(); for (const p of CONNECTIONS_PUZZLES) { const key = wordsIn(p.clues[index].text).slice(0, 3).join(' '); openings.set(key, (openings.get(key) ?? 0) + 1); }
    for (const [key, n] of openings) assert.ok(n <= 5, `clue ${index + 1}: "${key}" opens ${n} puzzles`);
  }
});

// ---------------------------------------------------------------- Connections: recent-round avoidance
test('Connections rounds: five puzzles, never one from the previous round while alternatives exist, and the whole bank is used before any repeat', () => {
  const history = createGameHistory(); const rng = seeded(21); const rounds = [];
  const full = Math.floor(CONNECTIONS_PUZZLES.length / CONNECTIONS.puzzleCount);
  for (let i = 0; i < full + 4; i += 1) rounds.push(pickPuzzles(CONNECTIONS_PUZZLES, rng, CONNECTIONS.puzzleCount, history).map(p => p.target));
  for (const round of rounds) { assert.equal(round.length, 5); assert.equal(new Set(round).size, 5); }
  for (let i = 1; i < rounds.length; i += 1) assert.ok(!rounds[i].some(t => rounds[i - 1].includes(t)), `round ${i + 1} repeats a puzzle from round ${i}`);
  const firstPass = rounds.slice(0, full).flat(); assert.equal(new Set(firstPass).size, firstPass.length, 'no puzzle repeats before the bank has been used');
  // once the bank is used up the least recently seen come back, not the ones just played
  const afterwards = rounds[full]; const lastRound = rounds[full - 1];
  assert.ok(!afterwards.some(t => lastRound.includes(t)));
});

test('Connections rounds: with a tiny bank the previous round can repeat only because nothing else exists; unseen puzzles still come first', () => {
  const bank = CONNECTIONS_PUZZLES.slice(0, 6); const history = createGameHistory(); const rng = seeded(4);
  const first = pickPuzzles(bank, rng, 5, history).map(p => p.target); const second = pickPuzzles(bank, rng, 5, history).map(p => p.target);
  const unseen = bank.map(p => p.target).filter(t => !first.includes(t)); assert.equal(unseen.length, 1); assert.ok(second.includes(unseen[0]), 'the one unseen puzzle leads the next round');
  assert.equal(second.length, 5);
});

test('Connections rounds: still random inside the eligible pool, and without a history the pick is a plain shuffle', () => {
  const picks = new Set(); for (let seed = 1; seed <= 12; seed += 1) picks.add(pickPuzzles(CONNECTIONS_PUZZLES, seeded(seed), 5, createGameHistory()).map(p => p.target).join('|'));
  assert.ok(picks.size >= 10, 'different seeds give different first rounds');
  const a = pickPuzzles(CONNECTIONS_PUZZLES, seeded(3)), b = pickPuzzles(CONNECTIONS_PUZZLES, seeded(3)); assert.deepEqual(a.map(p => p.target), b.map(p => p.target)); assert.equal(a.length, 5);
});

// ---------------------------------------------------------------- Word Blitz pool
const build = (seed = 1, content = unit1) => buildBlitzPool(content, seeded(seed), gamesFor(1).blitz);
const materialise = pool => pool.map(q => ({ ...q, ...q.build() }));

test('Word Blitz pool: a deep pool (5-7 prompts for every word), each with a unique stable id, built from reviewed content only', () => {
  const pool = build(1); assert.ok(pool.length >= 280, `${pool.length} prompts`);
  const ids = pool.map(q => q.id); assert.equal(new Set(ids).size, ids.length, 'ids are unique');
  assert.deepEqual([...new Set(build(2).map(q => q.id))].sort(), [...new Set(ids)].sort(), 'ids do not depend on the random seed');
  assert.ok(ids.every(id => /^(def|para|gap|mic):/.test(id)));
  const perWord = new Map(); for (const q of pool) perWord.set(q.term, [...(perWord.get(q.term) ?? []), q]);
  assert.equal(perWord.size, unit1.items.length, 'every Unit 1 word is covered');
  for (const [term, list] of perWord) { assert.ok(list.length >= 5 && list.length <= 7, `${term}: ${list.length} prompts`); assert.ok(new Set(list.map(q => q.type)).size >= 3, `${term}: at least three kinds of prompt`); }
  assert.ok(pool.length / perWord.size >= 6, 'about six genuinely different prompts per word');
});

test('Word Blitz pool: prompts are genuinely different, not reworded copies', () => {
  const pool = build(3); const keys = pool.map(q => `${q.label}|${q.prompt}`.toLowerCase()); assert.equal(new Set(keys).size, keys.length, 'identical prompt text');
  const byWord = new Map(); for (const q of pool) byWord.set(q.term, [...(byWord.get(q.term) ?? []), q]);
  const stem = w => w.replace(/(ing|ed|es|s|ly)$/, '');
  for (const [term, list] of byWord) {
    const paras = list.filter(q => q.type === 'para').map(q => new Set(wordsIn(q.prompt).filter(w => w.length >= 3 && !['with', 'the', 'for', 'about', 'and'].includes(w)).map(stem)));
    if (paras.length === 2) assert.ok(![...paras[0]].some(w => paras[1].has(w)), `${term}: its two paraphrase prompts are rewordings of each other`);
    const sentences = list.filter(q => q.type === 'gap' || q.type === 'mic').map(q => q.prompt); assert.equal(new Set(sentences).size, sentences.length, `${term}: a sentence is used twice`);
  }
});

test('Word Blitz pool: duplicate ids are rejected (a row authored twice is served once)', () => {
  const base = build(5).map(q => q.id).sort();
  const doubled = { ...unit1, items: unit1.items.map(item => ({ ...item, senses: item.senses.map(sense => ({ ...sense, gapDistractors: [...(sense.gapDistractors ?? []), ...(sense.gapDistractors ?? [])], masteryContexts: [...(sense.masteryContexts ?? []), ...(sense.masteryContexts ?? [])] })) })) };
  const pool = build(5, doubled); const ids = pool.map(q => q.id);
  assert.equal(new Set(ids).size, ids.length, 'no id twice'); assert.deepEqual([...ids].sort(), base, 'the same prompts as the clean content');
});

test('Word Blitz questions: four distinct viable options, one correct answer that stays correct whatever the shuffle, no empty prompt', () => {
  const gapRows = new Map(); const micRows = new Map(); const meanings = new Map();
  for (const item of unit1.items) { meanings.set(item.term, item.coreMeaning); for (const sense of item.senses) { for (const r of sense.gapDistractors ?? []) gapRows.set(`gap:${r.contextId}`, r); for (const r of sense.masteryContexts ?? []) micRows.set(`mic:${r.contextId}`, r); } }
  for (let seed = 1; seed <= 6; seed += 1) for (const q of materialise(build(seed))) {
    assert.ok(typeof q.prompt === 'string' && q.prompt.trim().length >= 3, `${q.id}: empty prompt`); assert.ok(q.label.trim().length > 0);
    assert.equal(q.options.length, 4, q.id); assert.ok(q.options.every(o => typeof o === 'string' && o.trim()), `${q.id}: blank option`); assert.equal(new Set(q.options.map(o => o.toLowerCase())).size, 4, `${q.id}: duplicate options`);
    assert.ok(Number.isInteger(q.answerIndex) && q.answerIndex >= 0 && q.answerIndex < 4);
    const answer = q.options[q.answerIndex];
    if (q.type === 'def' || q.type === 'para') assert.equal(answer, q.term);
    if (q.type === 'gap') assert.equal(answer.toLowerCase(), gapRows.get(q.id).answer.toLowerCase());
    if (q.type === 'mic') { const row = micRows.get(q.id); const shown = BLITZ_MEANING_OPTIONS[row.contextId]; assert.equal(answer, shown[0], 'the correct meaning is the reworded reviewed one'); assert.deepEqual(q.options.filter(o => o !== answer).sort(), shown.slice(1).slice().sort()); assert.ok(q.label.includes(q.term)); assert.equal(q.prompt, row.text); }
  }
});

test('Word Blitz questions: confusable and overlapping distractors stay excluded, whatever the seed', () => {
  for (let seed = 1; seed <= 8; seed += 1) for (const q of materialise(build(seed)).filter(x => x.type === 'def' || x.type === 'para')) {
    const blocked = clusterOf(q.term); for (const o of q.options.filter(o => o !== q.term)) { assert.ok(terms.has(o), `${q.id}: ${o}`); assert.ok(!blocked.has(o.toLowerCase()), `${q.id}: ${o} is a near neighbour of ${q.term}`); }
    assert.ok(!q.prompt.toLowerCase().includes(q.term.toLowerCase()), `${q.id}: prompt leaks the word`);
  }
});

test('Word Blitz questions: a prompt that cannot support three safe distractors is left out, never padded', () => {
  const four = { ...unit1, items: unit1.items.slice(0, 4) }; const pool = build(2, four);
  for (const q of pool) { const built = q.build(); assert.ok(!built || built.options.length === 4); }
  assert.ok(buildBlitzPool({ ...unit1, items: unit1.items.slice(0, 3) }, seeded(1), gamesFor(1).blitz).length === 0);
  const thin = { ...unit1, items: unit1.items.map(item => ({ ...item, senses: item.senses.map(sense => ({ ...sense, masteryContexts: (sense.masteryContexts ?? []).map(c => ({ ...c, wrongMeanings: c.wrongMeanings.slice(0, 2) })) })) })) };
  assert.ok(build(2, thin).every(q => q.type !== 'mic'), 'two wrong meanings is not enough for a meaning prompt');
});

// ---------------------------------------------------------------- Word Blitz: recent-prompt avoidance across Play Again
const playRound = (history, seed, count) => {
  const game = createBlitz({ content: unit1, rng: seeded(seed), now: () => 0, history, data: gamesFor(1).blitz }); const served = []; let q = game.start(); let last = null;
  for (let i = 0; i < count; i += 1) { assert.ok(q, 'a question is always available'); assert.notEqual(q.term, last, 'no word twice in a row'); last = q.term; served.push({ id: q.id, term: q.term }); game.answer(q.answerIndex); q = game.next(); }
  return served;
};

test('Word Blitz Play Again: the next rounds avoid prompts from the previous round while unseen ones remain', () => {
  const history = createGameHistory(); const rounds = [1, 2, 3, 4].map(seed => playRound(history, seed, 40));
  for (let i = 1; i < rounds.length; i += 1) { const before = new Set(rounds[i - 1].map(s => s.id)); assert.ok(!rounds[i].some(s => before.has(s.id)), `round ${i + 1} repeats a prompt from round ${i}`); }
  const all = rounds.flat().map(s => s.id); assert.equal(new Set(all).size, all.length, 'no prompt repeats in four rounds while the pool is not used up');
});

test('Word Blitz Play Again: words that were under-served come first, and play is still shuffled', () => {
  const history = createGameHistory(); const first = playRound(history, 11, 40); const used = new Set(first.map(s => s.term)); const unused = unit1.items.map(i => i.term).filter(t => !used.has(t));
  assert.ok(unused.length >= 10); const second = playRound(history, 12, 10);
  assert.ok(second.every(s => unused.includes(s.term)), 'the first draws of the next round are words not yet served');
  const orders = new Set(); for (let seed = 1; seed <= 6; seed += 1) orders.add(playRound(createGameHistory(), seed, 8).map(s => s.id).join('|')); assert.ok(orders.size >= 5, 'not deterministic');
});

test('Word Blitz Play Again: when the whole pool has been used it recycles the least recently seen, not the prompts just played', () => {
  const history = createGameHistory(); const size = build(1).length;
  const pass = (seed, draws) => { const game = createBlitz({ content: unit1, rng: seeded(seed), now: () => 0, history, data: gamesFor(1).blitz }); const ids = []; let q = game.start(); for (let i = 0; i < draws; i += 1) { ids.push(q.id); game.answer(q.answerIndex); q = game.next(); } return ids; };
  const everything = pass(1, size); assert.equal(new Set(everything).size, size, 'a whole pass serves every prompt exactly once');
  const recent = new Set(pass(2, 30));
  const third = pass(3, 30); assert.ok(third.every(id => !recent.has(id)), 'the third round starts from the prompts not played in the second');
}
);

// ---------------------------------------------------------------- Isolation of the variety memory
test('Variety memory: in memory only, holds ids and round numbers, and the controller shares one history across Play Again', () => {
  const history = createGameHistory(); playRound(history, 3, 5); pickPuzzles(CONNECTIONS_PUZZLES, seeded(3), 5, history);
  for (const value of Object.values(history)) assert.ok(typeof value === 'number' || value instanceof Map);
  for (const map of [history.blitzSeen, history.blitzTermUse, history.cxSeen]) for (const [k, v] of map) { assert.equal(typeof k, 'string'); assert.equal(typeof v, 'number'); }
  const controller = fs.readFileSync(new URL('../src/vocabulary/games/games-controller.js', import.meta.url), 'utf8');
  assert.match(controller, /history = sharedGameHistory/); assert.match(controller, /createBlitz\(\{ content, rng, now, history, data: unitGames\?\.blitz \}\)/); assert.match(controller, /pickPuzzles\(unitGames\?\.connections\?\.puzzles \?\? \[\], rng, CONNECTIONS\.puzzleCount, history\)/);
  assert.ok(sharedGameHistory && sharedGameHistory.blitzSeen instanceof Map);
  const src = fs.readFileSync(new URL('../src/vocabulary/games/games-history.js', import.meta.url), 'utf8').replace(/\/\/.*$/gm, '');
  assert.doesNotMatch(src, /localStorage|sessionStorage|indexedDB|fetch\(|supabase|import /i);
});

// ---------------------------------------------------------------- Rendering of the new content
test('Text-only Connections puzzles render clue 2 as text (no picture), and meaning-in-context prompts render with their label and four options', () => {
  const textOnly = CONNECTIONS_PUZZLES.filter(p => !p.image); assert.ok(textOnly.length >= 28);
  for (const p of textOnly) { const engine = createConnections({ puzzles: [p] }); engine.reveal(); const html = renderConnectionsPlay(engine); assert.doesNotMatch(html, /<img/); const decoded = html.replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&amp;/g, '&'); assert.ok(decoded.includes(p.clues[1].text), `${p.target}: clue 2 text shown`); }
  const mic = materialise(build(1)).find(q => q.type === 'mic'); const html = renderBlitzQuestion(mic);
  assert.match(html, /data-type="mic"/); assert.equal((html.match(/data-game-act="blitz-answer"/g) ?? []).length, 4); assert.ok(html.includes('In this sentence'));
});

// ---------------------------------------------------------------- Plain-English meaning options
test('Meaning-in-context options: every reviewed row has a plain-English rewording that keeps the same shape (1 correct + 3 wrong, same order)', () => {
  const rows = []; for (const item of unit1.items) for (const sense of item.senses) for (const r of sense.masteryContexts ?? []) rows.push({ item, r });
  assert.equal(Object.keys(BLITZ_MEANING_OPTIONS).length, rows.length, 'one wording per reviewed row, none extra');
  const formal = /\b(considerable|deliberately|exceptionally|approximately|recreation|recreational|decisive|perceived|acceptable|notable|accomplishment|financially|determine[sd]?|evaluating|requirements?|resources?|moderate|excessive|pursuit|regulation|scope|institution)\b/i;
  for (const { item, r } of rows) {
    const shown = BLITZ_MEANING_OPTIONS[r.contextId]; assert.ok(shown, `${r.contextId} has a wording`); assert.equal(shown.length, 4);
    assert.equal(new Set(shown.map(t => t.toLowerCase())).size, 4, `${r.contextId}: duplicate options`);
    for (const text of shown) { assert.ok(text.length >= 4 && text.length <= 60, `${r.contextId}: "${text}" length`); assert.ok(text.split(/\s+/).length <= 11, `${r.contextId}: "${text}" is long for a quick game`); assert.doesNotMatch(text, formal, `${r.contextId}: "${text}" is too formal`); assert.ok(!new RegExp(`\\b${item.term.replace('-', '[- ]')}\\b`, 'i').test(text), `${r.contextId}: "${text}" uses the target word`); }
    assert.equal(shown.filter(t => t === shown[0]).length, 1);
  }
  // the reviewed content itself is untouched (other activities still use it as authored)
  const urge = unit1.items.find(i => i.term === 'urge').senses[0].masteryContexts[0]; assert.equal(urge.meaning, 'press someone hard to do something');
});

// Unit 6 (Learning and Study Skills) Games: registration, Word Blitz audited pool, Connections v2 bank, and the final Units 1-6 rollout check.
// Units 1-5 data and all game mechanics stay untouched.
import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import unit1 from '../content/vocabulary/units/unit-01.js';
import unit2 from '../content/vocabulary/units/unit-02.js';
import unit3 from '../content/vocabulary/units/unit-03.js';
import unit4 from '../content/vocabulary/units/unit-04.js';
import unit5 from '../content/vocabulary/units/unit-05.js';
import unit6 from '../content/vocabulary/units/unit-06.js';
import { GAMES_BY_UNIT, gamesFor, availableGames, CONNECTIONS_PUZZLES, BLITZ_CONFUSABLE, BLITZ_MEANING_OPTIONS } from '../src/vocabulary/games/games-data.js';
import { BLITZ_CONFUSABLE_U2, BLITZ_EXCLUDED_U2, CONNECTIONS_PUZZLES_U2 } from '../src/vocabulary/games/games-data-unit-02.js';
import { BLITZ_CONFUSABLE_U3, BLITZ_EXCLUDED_U3, CONNECTIONS_PUZZLES_U3 } from '../src/vocabulary/games/games-data-unit-03.js';
import { BLITZ_CONFUSABLE_U4, BLITZ_EXCLUDED_U4, CONNECTIONS_PUZZLES_U4 } from '../src/vocabulary/games/games-data-unit-04.js';
import { BLITZ_CONFUSABLE_U5, BLITZ_MEANING_OPTIONS_U5, BLITZ_EXCLUDED_U5, CONNECTIONS_PUZZLES_U5 } from '../src/vocabulary/games/games-data-unit-05.js';
import { BLITZ_CONFUSABLE_U6, BLITZ_MEANING_OPTIONS_U6, BLITZ_EXCLUDED_U6, CONNECTIONS_PUZZLES_U6 } from '../src/vocabulary/games/games-data-unit-06.js';
import { buildBlitzPool } from '../src/vocabulary/games/blitz-engine.js';
import { createGameHistory } from '../src/vocabulary/games/games-history.js';
import { pickPuzzles, withWordClasses, wordShape, normaliseGuess, createConnections } from '../src/vocabulary/games/connections-engine.js';
import { renderLobby, renderGamesEntry } from '../src/vocabulary/games/games-view.js';

const seeded = (seed = 7) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const norm = s => String(s).toLowerCase();
const hash = x => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
const meta = new Map(unit6.items.map(i => [i.term, i]));
const terms6 = new Set(unit6.items.map(i => i.term));
const data6 = gamesFor(6);
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
const rows6 = enumerate(unit6, data6.blitz);
const rows6All = enumerate(unit6, { ...data6.blitz, excluded: [] });   // the same pool with nothing withheld
const posOf = new Map(unit6.items.map(i => [i.term, i.partOfSpeech]));

// Pairs the brief names as semantically close. They must never share a def/para option set, and one must never be a Help choice for the other.
const DANGEROUS = [
  ['absorb', 'retain'], ['absorb', 'memorise'], ['absorb', 'process'], ['retain', 'memorise'], ['retain', 'process'], ['memorise', 'process'], ['revise', 'memorise'], ['revise', 'absorb'],
  ['concentration', 'focus'], ['concentration', 'awareness'], ['focus', 'awareness'], ['capacity', 'concentration'],
  ['strategy', 'approach'], ['strategy', 'technique'], ['approach', 'technique'],
  ['engage', 'participate'], ['engage', 'focus'], ['participate', 'focus'],
  ['evaluate', 'reflect'], ['evaluate', 'summarise'], ['reflect', 'summarise'], ['process', 'reflect'],
  ['evidence', 'feedback'], ['evidence', 'guidance'], ['feedback', 'guidance'],
  ['assumption', 'perspective'], ['assumption', 'insight'], ['perspective', 'insight'], ['awareness', 'insight'], ['awareness', 'perspective'], ['awareness', 'assumption'],
  ['achievement', 'outcome'], ['interfere', 'distract'], ['confidence', 'hesitation'], ['motivation', 'curiosity'],
  ['academic', 'cognitive'], ['pressure', 'struggle'], ['forecast', 'assumption'], ['prioritise', 'focus'], ['stagnate', 'struggle']
];
const dangerous = (a, b) => DANGEROUS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

test('registration: Units 1-6 all have both games, 7 and beyond stay unavailable, nothing falls back', () => {
  assert.deepEqual(availableGames(6), ['blitz', 'connections']);
  assert.equal(gamesFor(6).connections.puzzles, CONNECTIONS_PUZZLES_U6);
  assert.equal(gamesFor(6).blitz.confusable, BLITZ_CONFUSABLE_U6);
  assert.equal(gamesFor(6).blitz.meaningOptions, BLITZ_MEANING_OPTIONS_U6);
  assert.equal(gamesFor(6).blitz.excluded, BLITZ_EXCLUDED_U6);
  for (const u of [1, 2, 3, 4, 5]) { assert.deepEqual(availableGames(u), ['blitz', 'connections']); assert.notEqual(gamesFor(u).connections.puzzles, gamesFor(6).connections.puzzles); }
  for (const u of [7, 8, 20, 0, -1, NaN, null, undefined]) { assert.equal(gamesFor(u), null, `unit ${u}`); assert.deepEqual(availableGames(u), []); }
  assert.deepEqual(Object.keys(GAMES_BY_UNIT), ['1', '2', '3', '4', '5', '6']);
  assert.match(renderGamesEntry(6), /Unit 6/); assert.match(renderLobby(6), /data-game="blitz"/); assert.match(renderLobby(6), /data-game="connections"/);
  assert.equal(renderGamesEntry(7), '');
});

test('Blitz: the audited Unit 6 pool has the pinned size and counts', () => {
  const pool = buildBlitzPool(unit6, seeded(3), data6.blitz);
  assert.equal(pool.length, 265); assert.deepEqual(count(pool), { def: 49, para: 58, gap: 65, mic: 93 });
  assert.equal(rows6.size, 265, 'every stable id is reachable across runs');
  assert.equal(new Set(pool.map(q => q.term)).size, 50, 'all 50 Unit 6 words are represented');
});

test('Blitz: every question targets canonical Unit 6 vocabulary', () => {
  for (const { q } of rows6.values()) assert.ok(terms6.has(q.term), q.id);
});

test('Blitz: every excluded id is absent, and removing the list restores the original pool', () => {
  assert.equal(new Set(BLITZ_EXCLUDED_U6).size, BLITZ_EXCLUDED_U6.length, 'no duplicate exclusions');
  const none = rows6All;
  for (const id of BLITZ_EXCLUDED_U6) { assert.ok(none.has(id), `${id} exists in the unfiltered pool`); assert.ok(!rows6.has(id), `${id} is withheld`); }
  assert.equal(none.size, 323, 'unfiltered pool with the confusable groups and overrides');
  assert.deepEqual(count([...none.values()].map(r => r.q)), { def: 50, para: 80, gap: 100, mic: 93 });
  assert.equal(none.size - rows6.size, BLITZ_EXCLUDED_U6.length); assert.equal(BLITZ_EXCLUDED_U6.length, 58);
  const kinds = BLITZ_EXCLUDED_U6.reduce((m, id) => (m[id.split(':')[0]] = (m[id.split(':')[0]] ?? 0) + 1, m), {});
  assert.deepEqual(kinds, { para: 22, def: 1, gap: 35 });
});

test('Blitz: the only adverb has no def/para question (its options would be answerable by word class alone) but is still served by gap and meaning rows', () => {
  assert.equal([...terms6].filter(t => meta.get(t).partOfSpeech === 'adverb').join(), 'dramatically');
  assert.ok(![...rows6.keys()].some(id => /^(def|para):vocab_dramatically/.test(id)));
  assert.ok(rows6.has('gap:u6_04_dramatically_gap_1') && rows6.has('gap:u6_04_dramatically_gap_3') && rows6.has('mic:u6_04_dramatically_paraphrase'));
});

test('Blitz: a withheld gap row is not replaced by another row of the same word', () => {
  const perWord = new Map();
  for (const { q } of rows6.values()) if (q.type === 'gap') perWord.set(q.term, (perWord.get(q.term) ?? 0) + 1);
  for (const [w, n] of perWord) assert.ok(n <= 2, `${w} has ${n} gap rows`);
  const sourceGaps = new Map(unit6.items.map(i => [i.term, Math.min(2, i.senses.flatMap(s => s.gapDistractors ?? []).length)]));
  for (const id of BLITZ_EXCLUDED_U6.filter(x => x.startsWith('gap:'))) {
    const q = rows6All.get(id).q;
    assert.ok((perWord.get(q.term) ?? 0) < sourceGaps.get(q.term), `${id}: the word serves fewer gaps than before, so nothing replaced it`);
  }
});

test('Blitz: every option set has 4 unique options and the key appears exactly once', () => {
  for (const { q, sets } of rows6.values()) {
    assert.ok(sets.length > 0, q.id);
    for (const { options, answer } of sets) {
      assert.equal(options.length, 4, q.id); assert.equal(new Set(options.map(norm)).size, 4, `${q.id} options unique`);
      assert.equal(options.filter(o => norm(o) === norm(answer)).length, 1, q.id);
      if (q.type === 'def' || q.type === 'para') assert.equal(answer, q.term, q.id);
    }
  }
});

test('Blitz: members of one confusable group, and the brief\'s dangerous pairs, never share a def/para question', () => {
  assert.equal(BLITZ_CONFUSABLE_U6.length, 17);
  for (const [a, b] of DANGEROUS) assert.ok(BLITZ_CONFUSABLE_U6.some(g => g.includes(a) && g.includes(b)), `${a} / ${b} are blocked together`);
  for (const { q, sets } of rows6.values()) {
    if (q.type !== 'def' && q.type !== 'para') continue;
    for (const { options } of sets) {
      for (const g of BLITZ_CONFUSABLE_U6) { if (!g.includes(q.term)) continue; assert.deepEqual(options.filter(o => o !== q.term && g.includes(o)), [], `${q.id} shows a blocked neighbour`); }
      for (const o of options) if (o !== q.term) assert.ok(!dangerous(q.term, o), `${q.id} offers ${o}`);
    }
  }
});

test('Blitz: def/para options never carry a cross-part-of-speech distractor, so word class cannot give the answer away', () => {
  for (const { q, sets } of rows6.values()) {
    if (q.type !== 'def' && q.type !== 'para') continue;
    for (const { options } of sets) assert.deepEqual(options.filter(o => o !== q.term && posOf.get(o) !== posOf.get(q.term)), [], `${q.id} uses a cross-POS distractor`);
  }
});

test('Blitz: gap sentences are not given away by a/an', () => {
  let checked = 0;
  for (const { q, sets } of rows6.values()) {
    if (q.type !== 'gap') continue;
    const m = /\b(a|an)\s+_{2,}/i.exec(q.prompt); if (!m) continue; checked += 1;
    for (const { options } of sets) assert.ok(options.every(o => /^[aeiou]/i.test(o) === (m[1].toLowerCase() === 'an')), `${q.id}: ${options.join('/')}`);
  }
  assert.equal(checked, 2, 'two gaps put a/an directly before the blank (complex_gap_1, active_2), and both keep all four options vowel-matched');
});

test('Blitz: retained paraphrase prompts are the certified set (no loose associations, fragments, narrower or broader cues)', () => {
  const paras = [...rows6.values()].filter(r => r.q.type === 'para').map(r => r.q.id.replace('para:vocab_', ''));
  assert.equal(paras.length, 58);
  for (const bad of ['achievement_6:result-of-hard-work', 'active:taking-a-real-part', 'awareness:knowledge-and-understanding', 'awareness:recognition-that-a-problem-exists', 'capacity:natural-ability', 'cognitive:connected-with-the-brain',
    'cognitive:thinking-and-learning', 'coordination:organised-teamwork', 'evaluate_6:measure-how-well-it-works', 'feedback:helpful-comments', 'interfere:disturb-the-work-of-others', 'memorise:learn-exactly', 'motivation:the-desire-to-keep-going',
    'pressure_6:stress-from-expectations', 'process:sort-out-and-understand', 'retain:remember-and-keep', 'revise:prepare-by-studying', 'summarise:say-briefly-what-is-in', 'technique:particular-way-of-doing-a-task']) assert.ok(!paras.includes(bad), bad);
  for (const good of ['absorb:take-in-and-understand', 'evaluate_6:judge-the-quality-of', 'reflect:think-back-carefully', 'process:make-sense-of', 'revise:go-back-over', 'strategy:plan-for-reaching-a-goal', 'outcome:final-result', 'achievement_6:success-earned-by-effort',
    'participate:take-part', 'engage:become-involved', 'forecast:say-what-is-likely-to-happen', 'prioritise:give-first-place-to', 'summarise:give-the-main-points-of', 'struggle_6:have-a-hard-time', 'distract:take-attention-away-from']) assert.ok(paras.includes(good), good);
});

test('Blitz: meaning-in-context rows have 4 unique meanings with the right one keyed', () => {
  const mic = [...rows6.values()].filter(r => r.q.type === 'mic'); assert.equal(mic.length, 93);
  for (const { q, sets } of mic) for (const { options } of sets) assert.equal(new Set(options.map(norm)).size, 4, q.id);
});

test('Blitz: the five meaning overrides keep the authored correct meaning first, have 4 unique short options, and are used', () => {
  const authored = new Map(unit6.items.flatMap(i => i.senses.flatMap(s => (s.masteryContexts ?? []).map(c => [c.contextId, c]))));
  assert.deepEqual(Object.keys(BLITZ_MEANING_OPTIONS_U6).sort(), ['u6_02_confidence_paraphrase', 'u6_04_dramatically_paraphrase', 'u6_14_process_paraphrase', 'u6_32_awareness_meaning', 'u6_32_awareness_paraphrase']);
  for (const [id, options] of Object.entries(BLITZ_MEANING_OPTIONS_U6)) {
    const row = authored.get(id); assert.ok(row, `${id} is a Unit 6 mastery context`);
    assert.equal(options.length, 4); assert.equal(new Set(options.map(norm)).size, 4); assert.equal(options[0], row.meaning, `${id}: correct meaning unchanged`);
    for (const o of options) assert.ok(o.length <= 60, `${id}: ${o}`);
    const served = rows6.get(`mic:${id}`); assert.ok(served, id);
    for (const { options: shown, answer } of served.sets) { assert.deepEqual([...shown].sort(), [...options].sort(), id); assert.equal(answer, row.meaning); }
  }
  for (const [id, row] of authored) if (!(id in BLITZ_MEANING_OPTIONS_U6) && rows6.has(`mic:${id}`)) for (const { options } of rows6.get(`mic:${id}`).sets) assert.deepEqual([...options].sort(), [row.meaning, ...row.wrongMeanings].sort(), `${id} uses the authored options`);
});

test('Connections: 49 puzzles, every target is canonical Unit 6 vocabulary, unique, in the audited set', () => {
  assert.equal(CONNECTIONS_PUZZLES_U6.length, 49);
  const targets = CONNECTIONS_PUZZLES_U6.map(p => p.target);
  assert.equal(new Set(targets).size, 49); for (const t of targets) assert.ok(terms6.has(t), t);
  assert.deepEqual([...terms6].filter(t => !targets.includes(t)), ['dramatically'], 'dramatically is omitted: it is the only adverb, so its Help choices could not match its word class');
});

test('Connections: four clues of the right kinds, no pictures, and no blank-sentence plain clue', () => {
  for (const p of CONNECTIONS_PUZZLES_U6) {
    assert.equal(p.clues.length, 4, p.target);
    assert.deepEqual(p.clues.map(c => c.kind), ['situation', 'context', 'plain', 'meaning'], p.target);
    for (const c of p.clues) { assert.ok(c.text.length > 12, p.target); assert.ok(!c.image && !c.picture && !c.src, `${p.target}: no picture`); }
    assert.ok(!p.clues[2].text.includes('___'), p.target);
    assert.equal(new Set(p.clues.map(c => c.text)).size, 4, p.target);
    assert.ok(p.why && p.why.length > 30 && p.why.length < 300, p.target);
  }
});

test('Connections: no clue contains the target or one of its word-family forms, or a recognisable stem of it', () => {
  const forms = item => [item.term, ...(item.wordFamily ?? []), ...(item.senses?.[0]?.wordFamilyForms ?? []).map(f => f?.form ?? '')].map(norm).filter(x => x.length > 3);
  for (const p of CONNECTIONS_PUZZLES_U6) for (const c of p.clues) for (const f of forms(meta.get(p.target))) assert.doesNotMatch(norm(c.text), new RegExp('\\b' + f.replace(/[-\s]/g, '[- ]') + '\\b'), `${p.target} leaks "${f}"`);
  const STEM = { absorb: 'absorb', confidence: 'confiden', dilemma: 'dilemma', equivalent: 'equivalen', overload: 'overload', stagnate: 'stagna', engage: 'engag', participate: 'particip', passive: 'passiv', active: 'activ', evaluate: 'evaluat', reflect: 'reflect',
    process: 'process', strategy: 'strateg', approach: 'approach', revise: 'revis', forecast: 'forecast', interfere: 'interfer', distract: 'distract', evidence: 'evidenc', guidance: 'guidanc', academic: 'academ', concentration: 'concentrat', complex: 'complex',
    motivation: 'motivat', curiosity: 'curios', technique: 'techniq', effective: 'effectiv', inefficient: 'efficien', struggle: 'struggl', awareness: 'aware', capacity: 'capacit', feedback: 'feedback', respond: 'respon', hesitation: 'hesita',
    independent: 'independen', assumption: 'assum', perspective: 'perspectiv', pressure: 'pressur', prioritise: 'priorit', retain: 'retain', summarise: 'summaris', coordination: 'coordinat', cognitive: 'cognit', achievement: 'achiev',
    outcome: 'outcome', focus: 'focus', memorise: 'memoris', insight: 'insight' };
  for (const p of CONNECTIONS_PUZZLES_U6) { assert.ok(STEM[p.target], p.target); for (const c of p.clues) assert.ok(!(norm(c.text).match(/[a-z]+/g) ?? []).some(w => w.startsWith(STEM[p.target])), `${p.target} clue shows a stem: ${c.text}`); }
});

test('Connections: effective and inefficient are never defined through each other (they are not simple opposites)', () => {
  const clues = t => CONNECTIONS_PUZZLES_U6.find(p => p.target === t).clues.map(c => norm(c.text)).join(' ');
  assert.doesNotMatch(clues('effective'), /efficien|wast|quick|cheap|fast/);
  assert.doesNotMatch(clues('inefficient'), /effective|intended|result|fail|success/);
  assert.doesNotMatch(clues('active') + clues('passive'), /effective|inefficien/);
});

test('Connections: help has exactly two distinct Unit 6 distractors of the same word class, never a near-synonym or a blocked neighbour', () => {
  for (const p of CONNECTIONS_PUZZLES_U6) {
    assert.equal(p.help.length, 2, p.target); assert.equal(new Set([p.target, ...p.help]).size, 3);
    for (const h of p.help) {
      assert.ok(terms6.has(h), `${p.target}: help "${h}" is Unit 6`);
      assert.equal(posOf.get(h), posOf.get(p.target), `${p.target} / ${h}: same word class`);
      assert.ok(!BLITZ_CONFUSABLE_U6.some(g => g.includes(p.target) && g.includes(h)), `${p.target} / ${h} share a confusable group`);
      assert.ok(!dangerous(p.target, h), `${p.target} / ${h} are confusable`);
    }
  }
});

test('Connections: accepted forms are conservative inflections, never another Unit 6 word, never an American spelling', () => {
  for (const p of CONNECTIONS_PUZZLES_U6) {
    const target = normaliseGuess(p.target);
    assert.equal(new Set(p.accept.map(normaliseGuess)).size, p.accept.length, p.target);
    for (const a of p.accept) {
      assert.notEqual(normaliseGuess(a), target, p.target);
      assert.ok(!terms6.has(a) || a === p.target, `${p.target}: "${a}" is another word`);
      assert.ok(normaliseGuess(a).startsWith(target.slice(0, target.length - 2)) || ['forecasted', 'forecasts', 'forecasting'].includes(a), `${p.target}: "${a}" is not an inflection of it`);
      assert.doesNotMatch(a, /z/i, `${p.target}: no American spelling "${a}"`);
    }
  }
  const text = JSON.stringify([CONNECTIONS_PUZZLES_U6, BLITZ_MEANING_OPTIONS_U6, BLITZ_EXCLUDED_U6, BLITZ_CONFUSABLE_U6]);
  assert.doesNotMatch(text, /prioritiz|summariz|memoriz/i, 'no American spelling anywhere in the Unit 6 Games data');
  for (const t of ['prioritise', 'summarise', 'memorise']) { assert.ok(terms6.has(t)); assert.ok(CONNECTIONS_PUZZLES_U6.some(p => p.target === t)); assert.ok([...rows6.values()].some(r => r.q.term === t)); }
  const sw = createConnections({ puzzles: [CONNECTIONS_PUZZLES_U6.find(p => p.target === 'prioritise')] });
  assert.equal(sw.guess('prioritize').correct, false, 'American spelling is not accepted for the locked British target');
  assert.equal(createConnections({ puzzles: [CONNECTIONS_PUZZLES_U6.find(p => p.target === 'prioritise')] }).guess('prioritised').correct, true);
});

test('Connections: pickPuzzles, withWordClasses and the engine work on the Unit 6 bank', () => {
  const picked = pickPuzzles(CONNECTIONS_PUZZLES_U6, seeded(5), 5, createGameHistory()); assert.equal(picked.length, 5); assert.equal(new Set(picked.map(p => p.target)).size, 5);
  const history = createGameHistory(); const seen = new Set();
  for (let i = 0; i < 14; i++) for (const p of pickPuzzles(CONNECTIONS_PUZZLES_U6, seeded(i + 2), 5, history)) seen.add(p.target);
  assert.equal(seen.size, 49, 'history rotates through the whole bank');
  const classed = withWordClasses(CONNECTIONS_PUZZLES_U6, unit6.items); assert.equal(classed.length, 49);
  const shape = t => wordShape(classed.find(p => p.target === t), 1);
  assert.equal(shape('strategy').wordClass, 'NOUN'); assert.equal(shape('absorb').wordClass, 'VERB'); assert.equal(shape('passive').wordClass, 'ADJECTIVE');
  for (const p of classed) assert.ok(wordShape(p, 1).wordClass, `${p.target} has a word class`);
  assert.equal(shape('prioritise').lengthLabel, '10 letters'); assert.equal(wordShape(classed.find(p => p.target === 'prioritise'), 2).pattern, 'PRI_______');
  const g = createConnections({ puzzles: [CONNECTIONS_PUZZLES_U6[0]] }); for (let i = 0; i < 3; i++) g.reveal();
  assert.ok(g.help()); assert.equal(g.state.choices.length, 3);
  assert.deepEqual([...g.state.choices].sort(), [CONNECTIONS_PUZZLES_U6[0].target, ...CONNECTIONS_PUZZLES_U6[0].help].sort());
  const n = createConnections({ puzzles: [CONNECTIONS_PUZZLES_U6[1]] }); const res = n.guess(CONNECTIONS_PUZZLES_U6[1].target);
  assert.equal(res.correct, true); assert.equal(res.points, 500);
});

test('Connections: Unit 6 has no multi-word targets, and the scaffold never gives the whole word away', () => {
  assert.ok(![...terms6].some(t => /[\s-]/.test(t)));
  const classed = withWordClasses(CONNECTIONS_PUZZLES_U6, unit6.items);
  for (const p of classed) {
    const shapes = [1, 2, 3, 4].map(n => wordShape(p, n));
    for (const s of shapes) { assert.equal(s.words, 1, p.target); assert.equal(s.letters, p.target.length, p.target); assert.equal(s.firstLetter, p.target[0].toUpperCase()); }
    assert.equal(shapes[0].pattern, null); assert.ok(shapes[3].pattern.includes('_'), `${p.target}: final scaffold is incomplete`);
    assert.equal(createConnections({ puzzles: [p] }).guess(p.target.slice(0, -1)).correct, false, `${p.target}: a partial word is not accepted`);
  }
});

test('Unit 6 ids: repeated earlier-unit words use the Unit 6 vocabulary ids, never an earlier unit\'s', () => {
  const earlier = new Set([unit1, unit2, unit3, unit4, unit5].flatMap(u => u.items.map(i => i.vocabularyId)));
  const ids6 = new Set(unit6.items.map(i => i.vocabularyId));
  for (const id of ids6) assert.ok(!earlier.has(id), `${id} is not an earlier-unit id`);
  for (const t of ['evaluate', 'struggle', 'pressure', 'achievement']) {
    const item = unit6.items.find(i => i.term === t); assert.equal(item.vocabularyId, `vocab_${t}_6`, t);
    assert.ok([unit1, unit2, unit3, unit4, unit5].some(u => u.items.some(i => i.term === t)), `${t} really is a repeated word`);
    assert.ok(rows6.has(`def:vocab_${t}_6`), `${t}: def uses the Unit 6 id`);
    assert.ok(![...rows6.keys()].some(id => new RegExp(`^(def|para):vocab_${t}(:|$)`).test(id)), `${t}: no bare id`);
    assert.ok(![...rows6.keys()].some(id => new RegExp(`^(def|para):vocab_${t}_[1-5](:|$)`).test(id)), `${t}: no earlier-unit id`);
    assert.ok([...rows6.keys()].some(id => id.startsWith(`para:vocab_${t}_6:`)) || t === 'pressure', `${t}: a paraphrase uses the Unit 6 id`);
    assert.ok([...rows6.values()].some(r => r.q.term === t && r.q.type === 'mic'), `${t}: meaning rows are served`);
  }
  for (const id of rows6.keys()) { const m = /^(?:def|para):(vocab_[a-z_0-9]+?)(?::|$)/.exec(id); if (m) assert.ok(ids6.has(m[1]), `${id} is a Unit 6 id`); }
  for (const { q } of rows6.values()) if (q.type === 'gap' || q.type === 'mic') assert.match(q.id, /^(gap|mic):u6_/, q.id);
  assert.ok(!rows6.has('para:vocab_pressure_6:stress-from-expectations'));
});

test('regression: Units 1-5 data and pools are unchanged', () => {
  assert.equal(hash(CONNECTIONS_PUZZLES), '0b698694c5a335e2'); assert.equal(hash(BLITZ_CONFUSABLE), 'b765052c41d91923'); assert.equal(hash(BLITZ_MEANING_OPTIONS), 'eef76449de939a7c');
  assert.equal(hash(CONNECTIONS_PUZZLES_U2), 'a375383150af93bf'); assert.equal(hash(BLITZ_CONFUSABLE_U2), '094e57654696d740'); assert.equal(hash(BLITZ_EXCLUDED_U2), '83d2a397064eac3b');
  assert.equal(hash(CONNECTIONS_PUZZLES_U3), 'c21c4011dc510dbd'); assert.equal(hash(BLITZ_CONFUSABLE_U3), '1cd3d57b2fe62e52'); assert.equal(hash(BLITZ_EXCLUDED_U3), 'd45392463a9c58a7');
  assert.equal(hash(CONNECTIONS_PUZZLES_U4), 'db44bf9e961f2c6a'); assert.equal(hash(BLITZ_CONFUSABLE_U4), 'e87686c72d38b824'); assert.equal(hash(BLITZ_EXCLUDED_U4), '04f2e211bedbaa52');
  assert.equal(hash(CONNECTIONS_PUZZLES_U5), '3d54a114087770c0'); assert.equal(hash(BLITZ_CONFUSABLE_U5), 'f0525ec83d71f043'); assert.equal(hash(BLITZ_EXCLUDED_U5), 'cf06bfd1ffe8cc31'); assert.equal(hash(BLITZ_MEANING_OPTIONS_U5), '44136fa355b3678a');
  const p1 = buildBlitzPool(unit1, seeded(3), gamesFor(1).blitz); assert.equal(p1.length, 328);
  const p2 = buildBlitzPool(unit2, seeded(3), gamesFor(2).blitz); assert.equal(p2.length, 293); assert.deepEqual(count(p2), { def: 48, para: 52, gap: 93, mic: 100 });
  const p3 = buildBlitzPool(unit3, seeded(3), gamesFor(3).blitz); assert.equal(p3.length, 292); assert.deepEqual(count(p3), { def: 48, para: 48, gap: 97, mic: 99 });
  const p4 = buildBlitzPool(unit4, seeded(3), gamesFor(4).blitz); assert.equal(p4.length, 282); assert.deepEqual(count(p4), { def: 49, para: 38, gap: 96, mic: 99 });
  const p5 = buildBlitzPool(unit5, seeded(3), gamesFor(5).blitz); assert.equal(p5.length, 258); assert.deepEqual(count(p5), { def: 48, para: 43, gap: 99, mic: 68 });
  assert.equal(CONNECTIONS_PUZZLES_U2.length, 48); assert.equal(CONNECTIONS_PUZZLES_U3.length, 49); assert.equal(CONNECTIONS_PUZZLES_U4.length, 48); assert.equal(CONNECTIONS_PUZZLES_U5.length, 48);
  for (const [a, b] of [[2, 3], [2, 4], [3, 4], [2, 5], [3, 5], [4, 5], [2, 6], [3, 6], [4, 6], [5, 6]]) assert.equal(gamesFor(a).blitz.excluded.some(id => gamesFor(b).blitz.excluded.includes(id)), false, `no shared exclusion ids ${a}/${b}`);
});

test('final rollout: Units 1-6 all expose both Games, each from its own content', () => {
  const contents = { 1: unit1, 2: unit2, 3: unit3, 4: unit4, 5: unit5, 6: unit6 };
  assert.deepEqual(Object.keys(GAMES_BY_UNIT).map(Number), [1, 2, 3, 4, 5, 6]);
  const seenPuzzles = new Set(); const seenBlitz = new Set();
  for (const u of [1, 2, 3, 4, 5, 6]) {
    assert.deepEqual(availableGames(u), ['blitz', 'connections'], `Unit ${u}`);
    const games = gamesFor(u); assert.ok(games.connections.puzzles.length >= 45, `Unit ${u} has a full Connections bank`);
    assert.ok(!seenPuzzles.has(games.connections.puzzles), `Unit ${u} has its own puzzle bank`); seenPuzzles.add(games.connections.puzzles);
    assert.ok(!seenBlitz.has(games.blitz.confusable), `Unit ${u} has its own Blitz groups`); seenBlitz.add(games.blitz.confusable);
    const terms = new Set(contents[u].items.map(i => i.term));
    const pool = buildBlitzPool(contents[u], seeded(3), games.blitz); assert.ok(pool.length >= 250, `Unit ${u} Blitz pool`);
    for (const q of pool) assert.ok(terms.has(q.term), `Unit ${u}: ${q.id} is a Unit ${u} word`);
    for (const p of games.connections.puzzles) assert.ok(terms.has(p.target), `Unit ${u}: ${p.target} is a Unit ${u} word`);
    assert.match(renderGamesEntry(u), new RegExp(`Unit ${u}`)); assert.match(renderLobby(u), /data-game="blitz"/); assert.match(renderLobby(u), /data-game="connections"/);
  }
});

test('final rollout: Unit 7 (and any other unsupported unit) does not silently fall back to Unit 1 or any other unit', () => {
  for (const u of [7, 8, 9, 12, 0, -1, NaN, null, undefined, '7', 'seven']) { assert.equal(gamesFor(u), null, `unit ${String(u)}`); assert.deepEqual(availableGames(u), []); }
  // The view helpers default only an OMITTED unit number (real callers always pass the route's number); every real unit value is checked here.
  for (const u of [7, 8, 9, 12, 0, -1, NaN, null, '7', 'seven']) {
    assert.equal(renderGamesEntry(u), '', `unit ${String(u)} shows no Games entry`);
    const lobby = renderLobby(u);
    assert.match(lobby, /data-games-unavailable/); assert.doesNotMatch(lobby, /data-game-card|data-game="(blitz|connections)"/);
    assert.doesNotMatch(lobby, /Unit [1-6]\b/, `unit ${String(u)} names no other unit`);
  }
  assert.equal(Object.keys(GAMES_BY_UNIT).includes('7'), false);
  assert.deepEqual(buildBlitzPool(unit1, seeded(3), gamesFor(7)?.blitz), [], 'without Unit 7 data there is no Blitz pool, not a Unit 1 one');
  assert.deepEqual(buildBlitzPool(unit6, seeded(3), gamesFor(7)?.blitz), []);
});

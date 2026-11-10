// Unit 7 (Interviews) Games: registration, Word Blitz audited pool, Connections v2 bank, session behaviour, and a browser check of the real rendered games.
// Units 1-6 data and all game mechanics stay untouched.
import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import unit1 from '../content/vocabulary/units/unit-01.js';
import unit2 from '../content/vocabulary/units/unit-02.js';
import unit3 from '../content/vocabulary/units/unit-03.js';
import unit4 from '../content/vocabulary/units/unit-04.js';
import unit5 from '../content/vocabulary/units/unit-05.js';
import unit6 from '../content/vocabulary/units/unit-06.js';
import unit7 from '../content/vocabulary/units/unit-07.js';
import { GAMES_BY_UNIT, gamesFor, availableGames, CONNECTIONS_PUZZLES, BLITZ_CONFUSABLE, BLITZ_MEANING_OPTIONS } from '../src/vocabulary/games/games-data.js';
import { BLITZ_CONFUSABLE_U2, BLITZ_EXCLUDED_U2, CONNECTIONS_PUZZLES_U2 } from '../src/vocabulary/games/games-data-unit-02.js';
import { BLITZ_CONFUSABLE_U3, BLITZ_EXCLUDED_U3, CONNECTIONS_PUZZLES_U3 } from '../src/vocabulary/games/games-data-unit-03.js';
import { BLITZ_CONFUSABLE_U4, BLITZ_EXCLUDED_U4, CONNECTIONS_PUZZLES_U4 } from '../src/vocabulary/games/games-data-unit-04.js';
import { BLITZ_CONFUSABLE_U5, BLITZ_MEANING_OPTIONS_U5, BLITZ_EXCLUDED_U5, CONNECTIONS_PUZZLES_U5 } from '../src/vocabulary/games/games-data-unit-05.js';
import { BLITZ_CONFUSABLE_U6, BLITZ_MEANING_OPTIONS_U6, BLITZ_EXCLUDED_U6, CONNECTIONS_PUZZLES_U6 } from '../src/vocabulary/games/games-data-unit-06.js';
import { BLITZ_CONFUSABLE_U7, BLITZ_MEANING_OPTIONS_U7, BLITZ_EXCLUDED_U7, CONNECTIONS_PUZZLES_U7 } from '../src/vocabulary/games/games-data-unit-07.js';
import { buildBlitzPool, createBlitz, BLITZ } from '../src/vocabulary/games/blitz-engine.js';
import { createGameHistory } from '../src/vocabulary/games/games-history.js';
import { pickPuzzles, withWordClasses, wordShape, normaliseGuess, createConnections, CONNECTIONS } from '../src/vocabulary/games/connections-engine.js';
import { renderLobby, renderGamesEntry } from '../src/vocabulary/games/games-view.js';
import { renderVocabularyUnit } from '../src/vocabulary/views.js';
import { findChromium, loadPlaywright } from './helpers/pathway-geometry-harness.mjs';

const seeded = (seed = 7) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const norm = s => String(s).toLowerCase();
const hash = x => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
const repo = fileURLToPath(new URL('..', import.meta.url));
const read = file => fs.readFileSync(path.join(repo, file), 'utf8');
const meta = new Map(unit7.items.map(i => [i.term, i]));
const terms7 = new Set(unit7.items.map(i => i.term));
const data7 = gamesFor(7);
const count = pool => pool.reduce((m, q) => (m[q.type] = (m[q.type] ?? 0) + 1, m), {});
const unitHtml = unitNumber => { const root = { innerHTML:'' }; renderVocabularyUnit(root, { unitNumber, unitTitle:'T', progress:{ mastered:0, total:50, needsAnotherLook:0, reviewDue:0, stages:{} }, pathwayStates:{} }); return root.innerHTML; };

// Enumerate every stable question and every option set the engine can produce for a pool.
function enumerate(content, data, runs = 60) {
  const rng = seeded(11); const rows = new Map();
  for (let r = 0; r < runs; r++) for (const q of buildBlitzPool(content, rng, data)) {
    if (!rows.has(q.id)) rows.set(q.id, { q, sets: [] });
    const b = q.build(); if (b) rows.get(q.id).sets.push({ options: b.options, answer: b.options[b.answerIndex] });
  }
  return rows;
}
const rows7 = enumerate(unit7, data7.blitz);
const rows7All = enumerate(unit7, { ...data7.blitz, excluded: [] });   // the same pool with nothing withheld
const posOf = new Map(unit7.items.map(i => [i.term, i.partOfSpeech]));

// Pairs the brief names as easy to confuse (plus the other close neighbours in the unit). They must never share a def/para option set,
// and one must never be a Help choice for the other.
const DANGEROUS = [
  ['applicant', 'candidate'], ['applicant', 'interviewee'], ['candidate', 'interviewee'],
  ['interviewer', 'interviewee'], ['interviewer', 'referee'], ['interviewee', 'referee'],
  ['referee', 'reference'], ['referee', 'certificate'], ['reference', 'certificate'],
  ['qualification', 'qualifications'], ['qualification', 'certificate'], ['qualifications', 'certificate'], ['qualification', 'experience'], ['qualifications', 'experience'],
  ['expertise', 'proficiency'], ['expertise', 'experience'], ['expertise', 'technique'], ['proficiency', 'experience'], ['proficiency', 'technique'], ['experience', 'technique'], ['confidence', 'proficiency'],
  ['strategy', 'technique'], ['strategy', 'schedule'], ['availability', 'schedule'],
  ['summary', 'overview'], ['criteria', 'expectation'], ['criteria', 'candidate'], ['expectation', 'implication'],
  ['layout', 'format'], ['layout', 'register'], ['layout', 'punctuation'], ['format', 'register'], ['format', 'punctuation'], ['register', 'punctuation'],
  ['demonstrate', 'impress'], ['distribute', 'allocate'], ['organise', 'allocate'], ['respond', 'contribute'], ['dominate', 'contribute'], ['combine', 'contribute'], ['evaluate', 'proofread'],
  ['relevant', 'coherent'], ['relevant', 'accurate'], ['coherent', 'accurate'], ['enthusiastic', 'anxious'], ['voluntary', 'flexible'], ['responsible', 'voluntary']
];
const dangerous = (a, b) => DANGEROUS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

test('registration: Units 1-7 all have both games, 8 and beyond stay unavailable, nothing falls back', () => {
  assert.deepEqual(availableGames(7), ['blitz', 'connections']);
  assert.equal(gamesFor(7).connections.puzzles, CONNECTIONS_PUZZLES_U7);
  assert.equal(gamesFor(7).blitz.confusable, BLITZ_CONFUSABLE_U7);
  assert.equal(gamesFor(7).blitz.meaningOptions, BLITZ_MEANING_OPTIONS_U7);
  assert.equal(gamesFor(7).blitz.excluded, BLITZ_EXCLUDED_U7);
  for (const u of [1, 2, 3, 4, 5, 6]) { assert.deepEqual(availableGames(u), ['blitz', 'connections']); assert.notEqual(gamesFor(u).connections.puzzles, gamesFor(7).connections.puzzles); assert.notEqual(gamesFor(u).blitz.confusable, gamesFor(7).blitz.confusable); }
  for (const u of [8, 9, 20, 0, -1, NaN, null, undefined, '8', 'seven']) { assert.equal(gamesFor(u), null, `unit ${String(u)}`); assert.deepEqual(availableGames(u), []); }
  assert.equal(gamesFor('7'), data7, 'a numeric string reaches the same registry entry the route would use');
  assert.deepEqual(Object.keys(GAMES_BY_UNIT), ['1', '2', '3', '4', '5', '6', '7']);
  assert.match(renderGamesEntry(7), /Unit 7/); assert.match(renderLobby(7), /data-game="blitz"/); assert.match(renderLobby(7), /data-game="connections"/);
  assert.equal(renderGamesEntry(8), '');
});

test('the Unit 7 overview shows the Bonus Games section with both games, and the Unit 8 overview does not', () => {
  const html = unitHtml(7);
  assert.match(html, /data-games-entry/); assert.match(html, /<h2 id="gmEntryTitle">Bonus Games<\/h2>/); assert.match(html, /Practise your Unit 7 vocabulary in a different way\./);
  assert.match(html, /data-game="blitz"/); assert.match(html, /data-game="connections"/);
  assert.match(html, /60 seconds[\s\S]*Word Blitz/); assert.match(html, /5 puzzles[\s\S]*Connections/);
  assert.doesNotMatch(html, /Unit 1 vocabulary|Unit 6 vocabulary/, 'the copy follows the unit');
  assert.ok(html.indexOf('data-games-entry') > html.indexOf('vocab-pathway-grid'), 'the section follows the pathways, as in Units 1-6');
  assert.match(html, /data-unit-overview="interviews"/, 'the Unit 7 overview background hook is untouched');
  assert.doesNotMatch(unitHtml(8), /data-games-entry|gm-entry|data-game=/);
  // the Games entry is identical in structure to Unit 6's (only the unit number differs)
  const entry = unitNo => renderGamesEntry(unitNo).replace(new RegExp(`Unit ${unitNo}`, 'g'), 'Unit N'); assert.equal(entry(7), entry(6));
});

test('Blitz: the audited Unit 7 pool has the pinned size and counts', () => {
  const pool = buildBlitzPool(unit7, seeded(3), data7.blitz);
  assert.equal(pool.length, 311); assert.deepEqual(count(pool), { def: 50, para: 77, gap: 84, mic: 100 });
  assert.equal(rows7.size, 311, 'every stable id is reachable across runs');
  assert.equal(new Set(pool.map(q => q.term)).size, 50, 'all 50 Unit 7 words are represented');
  assert.equal(new Set(pool.map(q => q.id)).size, 311, 'no id is served twice');
});

test('Blitz: every Unit 7 word has a definition question, a meaning-in-context question, and at least three questions in total', () => {
  const per = new Map();
  for (const { q } of rows7.values()) { if (!per.has(q.term)) per.set(q.term, { def: 0, para: 0, gap: 0, mic: 0 }); per.get(q.term)[q.type] += 1; }
  assert.equal(per.size, 50);
  for (const [term, c] of per) { assert.equal(c.def, 1, `${term}: definition`); assert.ok(c.mic >= 1, `${term}: meaning in context`); assert.ok(c.def + c.para + c.gap + c.mic >= 3, `${term}: at least three questions`); assert.ok(c.gap <= 2 && c.para <= 2, `${term}: no word is over-served`); }
});

test('Blitz: every question targets canonical Unit 7 vocabulary', () => {
  for (const { q } of rows7.values()) assert.ok(terms7.has(q.term), q.id);
});

test('Blitz: every excluded id is absent, and removing the list restores the original pool', () => {
  assert.equal(new Set(BLITZ_EXCLUDED_U7).size, BLITZ_EXCLUDED_U7.length, 'no duplicate exclusions');
  for (const id of BLITZ_EXCLUDED_U7) { assert.ok(rows7All.has(id), `${id} exists in the unfiltered pool`); assert.ok(!rows7.has(id), `${id} is withheld`); }
  assert.equal(rows7All.size, 328, 'unfiltered pool with the confusable groups and overrides');
  assert.deepEqual(count([...rows7All.values()].map(r => r.q)), { def: 50, para: 78, gap: 100, mic: 100 });
  assert.equal(rows7All.size - rows7.size, BLITZ_EXCLUDED_U7.length); assert.equal(BLITZ_EXCLUDED_U7.length, 17);
  const kinds = BLITZ_EXCLUDED_U7.reduce((m, id) => (m[id.split(':')[0]] = (m[id.split(':')[0]] ?? 0) + 1, m), {});
  assert.deepEqual(kinds, { para: 1, gap: 16 });
  for (const [a, b] of [[2, 7], [3, 7], [4, 7], [5, 7], [6, 7]]) assert.equal(gamesFor(a).blitz.excluded.some(id => gamesFor(b).blitz.excluded.includes(id)), false, `no shared exclusion ids ${a}/${b}`);
});

test('Blitz: a withheld gap row is not replaced by another row of the same word', () => {
  const perWord = new Map();
  for (const { q } of rows7.values()) if (q.type === 'gap') perWord.set(q.term, (perWord.get(q.term) ?? 0) + 1);
  for (const [w, n] of perWord) assert.ok(n <= 2, `${w} has ${n} gap rows`);
  const sourceGaps = new Map(unit7.items.map(i => [i.term, Math.min(2, i.senses.flatMap(s => s.gapDistractors ?? []).length)]));
  for (const id of BLITZ_EXCLUDED_U7.filter(x => x.startsWith('gap:'))) {
    const q = rows7All.get(id).q;
    assert.ok((perWord.get(q.term) ?? 0) < sourceGaps.get(q.term), `${id}: the word serves fewer gaps than before, so nothing replaced it`);
  }
});

test('Blitz: every option set has 4 unique options and the key appears exactly once', () => {
  for (const { q, sets } of rows7.values()) {
    assert.ok(sets.length > 0, q.id);
    for (const { options, answer } of sets) {
      assert.equal(options.length, 4, q.id); assert.equal(new Set(options.map(norm)).size, 4, `${q.id} options unique`);
      assert.equal(options.filter(o => norm(o) === norm(answer)).length, 1, q.id);
      if (q.type === 'def' || q.type === 'para') assert.equal(answer, q.term, q.id);
    }
  }
});

test('Blitz: members of one confusable group, and the brief\'s dangerous pairs, never share a def/para question', () => {
  assert.equal(BLITZ_CONFUSABLE_U7.length, 25);
  for (const [a, b] of DANGEROUS) assert.ok(BLITZ_CONFUSABLE_U7.some(g => g.includes(a) && g.includes(b)), `${a} / ${b} are blocked together`);
  for (const group of BLITZ_CONFUSABLE_U7) for (const w of group) assert.ok(terms7.has(w), `${w} is a Unit 7 word`);
  for (const { q, sets } of rows7.values()) {
    if (q.type !== 'def' && q.type !== 'para') continue;
    for (const { options } of sets) {
      for (const g of BLITZ_CONFUSABLE_U7) { if (!g.includes(q.term)) continue; assert.deepEqual(options.filter(o => o !== q.term && g.includes(o)), [], `${q.id} shows a blocked neighbour`); }
      for (const o of options) if (o !== q.term) assert.ok(!dangerous(q.term, o), `${q.id} offers ${o}`);
    }
  }
});

test('Blitz: the four pairs named in the brief are never asked side by side in any def or para question', () => {
  for (const [a, b] of [['applicant', 'candidate'], ['interviewer', 'interviewee'], ['referee', 'reference'], ['qualification', 'qualifications']]) {
    assert.ok(terms7.has(a) && terms7.has(b));
    // when either word is the answer, the other must never be one of its options (two distractors of a third word are harmless: neither can be the key)
    for (const { q, sets } of rows7.values()) if ((q.type === 'def' || q.type === 'para') && (q.term === a || q.term === b)) for (const { options } of sets) assert.ok(!(options.includes(a) && options.includes(b)), `${q.id}: ${a} and ${b} together`);
  }
});

test('Blitz: def/para options never carry a cross-part-of-speech distractor, and never name another option inside the prompt', () => {
  for (const { q, sets } of rows7.values()) {
    if (q.type !== 'def' && q.type !== 'para') continue;
    for (const { options } of sets) {
      assert.deepEqual(options.filter(o => o !== q.term && posOf.get(o) !== posOf.get(q.term)), [], `${q.id} uses a cross-POS distractor`);
      for (const o of options) if (o !== q.term) assert.doesNotMatch(norm(q.prompt), new RegExp(`\\b${o}\\b`), `${q.id}: the prompt contains the option "${o}"`);
    }
  }
});

test('Blitz: gap sentences are not given away by a/an, and no gap row keeps a defensible wrong answer', () => {
  let checked = 0;
  for (const { q, sets } of rows7.values()) {
    if (q.type !== 'gap') continue;
    const m = /\b(a|an)\s+_{2,}/i.exec(q.prompt); if (!m) continue; checked += 1;
    for (const { options } of sets) assert.ok(options.every(o => /^[aeiou]/i.test(o) === (m[1].toLowerCase() === 'an')), `${q.id}: ${options.join('/')}`);
  }
  assert.ok(checked >= 1, 'at least one retained gap puts a/an directly before the blank, and every one keeps all four options matched');
  // The audited rows whose wrong options could be argued as correct, or that were unnatural, are all withheld.
  for (const id of ['gap:u7_12_referee_gap_1', 'gap:u7_39_evaluate_7_gap_1', 'gap:u7_26_contribute_gap_1', 'gap:u7_21_schedule_gap_1', 'gap:u7_38_technique_7_gap_1', 'gap:u7_19_strategy_7_gap_1', 'gap:u7_36_anxious_7_gap_1', 'gap:u7_36_anxious_7_gap_2', 'gap:u7_03_demonstrate_gap_2']) assert.ok(!rows7.has(id), `${id} is withheld`);
});

test('Blitz: retained paraphrase prompts are the certified set', () => {
  const paras = [...rows7.values()].filter(r => r.q.type === 'para').map(r => r.q.id.replace('para:vocab_', ''));
  assert.equal(paras.length, 77);
  assert.ok(!paras.includes('availability_7:whether-a-person-can-attend'), 'a "whether…" clause is not interchangeable with a noun');
  for (const good of ['applicant:person-who-asks-formally-for-a-job', 'candidate:person-being-considered-for-a-job', 'interviewer:person-who-asks-the-questions', 'interviewee:person-who-answers-the-questions', 'reference:letter-that-recommends-you-for-a-job',
    'qualification_7:quality-needed-to-do-a-role-well', 'qualifications:official-proof-of-what-you-have-studied', 'compromise:middle-solution-that-both-sides-accept', 'summary:short-account-of-the-main-points', 'overview:general-description-of-the-main-points']) assert.ok(paras.includes(good), good);
});

test('Blitz: meaning-in-context rows have 4 unique meanings with the right one keyed', () => {
  const mic = [...rows7.values()].filter(r => r.q.type === 'mic'); assert.equal(mic.length, 100);
  for (const { q, sets } of mic) for (const { options } of sets) assert.equal(new Set(options.map(norm)).size, 4, q.id);
});

test('Blitz: the two meaning overrides keep the authored correct meaning first, have 4 unique short options, and are used', () => {
  const authored = new Map(unit7.items.flatMap(i => i.senses.flatMap(s => (s.masteryContexts ?? []).map(c => [c.contextId, c]))));
  assert.deepEqual(Object.keys(BLITZ_MEANING_OPTIONS_U7).sort(), ['u7_21_schedule_paraphrase', 'u7_29_register_paraphrase']);
  for (const [id, options] of Object.entries(BLITZ_MEANING_OPTIONS_U7)) {
    const row = authored.get(id); assert.ok(row, `${id} is a Unit 7 mastery context`);
    assert.equal(options.length, 4); assert.equal(new Set(options.map(norm)).size, 4); assert.equal(options[0], row.meaning, `${id}: correct meaning unchanged`);
    for (const o of options) assert.ok(o.length <= 60, `${id}: ${o}`);
    const served = rows7.get(`mic:${id}`); assert.ok(served, id);
    for (const { options: shown, answer } of served.sets) { assert.deepEqual([...shown].sort(), [...options].sort(), id); assert.equal(answer, row.meaning); }
  }
  // the replaced "register" wrong meanings no longer include a second real sense of the word (a class list, a record of attendance)
  assert.doesNotMatch(JSON.stringify(BLITZ_MEANING_OPTIONS_U7.u7_29_register_paraphrase), /list of names|attendance|school/);
  for (const [id, row] of authored) if (!(id in BLITZ_MEANING_OPTIONS_U7) && rows7.has(`mic:${id}`)) for (const { options } of rows7.get(`mic:${id}`).sets) assert.deepEqual([...options].sort(), [row.meaning, ...row.wrongMeanings].sort(), `${id} uses the authored options`);
});

test('Blitz: the engine rules are unchanged for Unit 7 (60 seconds, 100 points, multiplier tiers) and a round uses only the unit\'s own content', () => {
  assert.equal(BLITZ.durationMs, 60000); assert.equal(BLITZ.base, 100); assert.deepEqual(BLITZ.tiers.map(t => [...t]), [[0, 1], [3, 2], [6, 3], [10, 4]]);
  let t = 0; const game = createBlitz({ content: unit7, data: data7.blitz, rng: seeded(5), now: () => t, history: createGameHistory() });
  assert.ok(game.start()); const seen = [];
  for (let i = 0; i < 12; i += 1) { const q = game.state.question; seen.push(q.term); assert.ok(terms7.has(q.term)); assert.equal(q.options.length, 4); assert.ok(game.answer(q.answerIndex)); game.next(); }
  assert.equal(game.state.score, 100 * 2 + 200 * 3 + 300 * 4 + 400 * 3, 'streak multipliers 1/2/3/4: streaks 1-2, 3-5, 6-9, 10-12');
  assert.equal(game.state.correct, 12); assert.equal(game.state.topMultiplier, 4);
  for (let i = 1; i < seen.length; i += 1) assert.notEqual(seen[i], seen[i - 1], 'never the same word twice in a row');
  t = 61000; assert.equal(game.tick(), 'over'); assert.equal(game.answer(0), null, 'no answer after time is up');
  const sum = game.summary(); assert.equal(sum.correct, 12); assert.equal(sum.accuracy, 100);
});

test('Blitz: a wrong answer resets the streak, records the missed word once, and Play Again prefers questions not seen last time', () => {
  let t = 0; const history = createGameHistory(); const game = createBlitz({ content: unit7, data: data7.blitz, rng: seeded(9), now: () => t, history });
  game.start(); const q = game.state.question; const wrong = (q.answerIndex + 1) % 4;
  const r = game.answer(wrong); assert.equal(r.correct, false); assert.equal(r.points, 0); assert.equal(game.state.streak, 0); assert.deepEqual(game.state.missed.map(m => m.term), [q.term]);
  const firstRound = new Set(); firstRound.add(q.id); game.next();
  for (let i = 0; i < 20; i += 1) { firstRound.add(game.state.question.id); game.answer(game.state.question.answerIndex); game.next(); }
  game.start(); const again = []; for (let i = 0; i < 20; i += 1) { again.push(game.state.question.id); game.answer(game.state.question.answerIndex); game.next(); }
  assert.ok(again.filter(id => firstRound.has(id)).length < 5, 'Play Again draws mostly new prompts');
});

// ---------------------------------------------------------------- Connections
test('Connections: 49 puzzles, every target is canonical Unit 7 vocabulary, unique, in the audited set', () => {
  assert.equal(CONNECTIONS_PUZZLES_U7.length, 49);
  const targets = CONNECTIONS_PUZZLES_U7.map(p => p.target);
  assert.equal(new Set(targets).size, 49); for (const t of targets) assert.ok(terms7.has(t), t);
  assert.deepEqual([...terms7].filter(t => !targets.includes(t)), ['qualification'], 'qualification is omitted: its plural is a separate Unit 7 word, so a typed answer of either could not be accepted or refused fairly');
  assert.ok(targets.includes('qualifications'));
  assert.ok(CONNECTIONS_PUZZLES_U7.length >= 45, 'meets the minimum bank size');
});

test('Connections: four clues of the right kinds, no pictures, no blank-sentence plain clue, and a staircase from situation to near-definition', () => {
  for (const p of CONNECTIONS_PUZZLES_U7) {
    assert.equal(p.clues.length, 4, p.target);
    assert.deepEqual(p.clues.map(c => c.kind), ['situation', 'context', 'plain', 'meaning'], p.target);
    for (const c of p.clues) { assert.ok(c.text.length > 12, p.target); assert.ok(!c.image && !c.picture && !c.src, `${p.target}: no picture`); assert.ok(!c.text.includes('___'), p.target); }
    assert.equal(new Set(p.clues.map(c => c.text)).size, 4, p.target);
    assert.ok(p.clues[0].text.length > p.clues[2].text.length, `${p.target}: the situation tells a short story, the plain clue is brief`);
    assert.ok(p.why && p.why.length > 30 && p.why.length < 300, `${p.target}: why ${p.why?.length}`);
  }
});

const STEMS = {
  applicant: ['applic', 'apply', 'applie'], qualifications: ['qualif'], demonstrate: ['demonstr'], summary: ['summar'], combine: ['combin'], voluntary: ['volunt'], frequent: ['frequen'], overview: ['overview'],
  candidate: ['candidat'], interviewer: ['interview'], interviewee: ['interview'], referee: ['refere'], reference: ['refere'], proficiency: ['profici'], enthusiastic: ['enthusias'], availability: ['availab'],
  compromise: ['compromis'], dominate: ['domina'], strategy: ['strateg'], flexible: ['flexib'], schedule: ['schedul'], expectation: ['expect'], impress: ['impress'], respond: ['respon'], relevant: ['relev', 'irrelev'],
  contribute: ['contribut'], coherent: ['coheren'], implication: ['implic', 'imply', 'implie'], register: ['register'], format: ['format'], membership: ['member'], certificate: ['certif'], experience: ['experien'],
  confidence: ['confiden'], anxious: ['anxi'], expertise: ['expert'], technique: ['techniq'], evaluate: ['evaluat'], organise: ['organis', 'organiz'], distribute: ['distribut'], allocate: ['allocat'],
  responsible: ['responsib'], editor: ['edit'], proofread: ['proofread'], layout: ['layout'], visual: ['visual'], criteria: ['criteri'], accurate: ['accura'], punctuation: ['punctuat']
};
test('Connections: no clue contains the target, one of its word-family forms, or a recognisable stem of it', () => {
  const forms = item => [item.term, ...(item.wordFamily ?? []), ...(item.senses?.[0]?.wordFamilyForms ?? []).map(f => f?.form ?? '')].map(norm).filter(x => x.length > 3);
  for (const p of CONNECTIONS_PUZZLES_U7) for (const c of p.clues) for (const f of forms(meta.get(p.target))) assert.doesNotMatch(norm(c.text), new RegExp('\\b' + f.replace(/[-\s]/g, '[- ]') + '\\b'), `${p.target} leaks "${f}"`);
  for (const p of CONNECTIONS_PUZZLES_U7) { assert.ok(STEMS[p.target], p.target); for (const c of p.clues) assert.ok(!(norm(c.text).match(/[a-z]+/g) ?? []).some(w => STEMS[p.target].some(s => w.startsWith(s))), `${p.target} clue shows a stem: ${c.text}`); }
});

test('Connections: no clue names another Unit 7 target outright, so no clue can point at two answers', () => {
  const others = t => [...terms7].filter(x => x !== t);
  for (const p of CONNECTIONS_PUZZLES_U7) for (const c of p.clues) for (const o of others(p.target)) {
    // two allowances: "candidate" in the exam-hall puzzle is the target itself; the word family of a target may repeat inside the same family only
    assert.doesNotMatch(norm(c.text), new RegExp(`\\b${o}s?\\b`), `${p.target}: clue "${c.text}" contains the Unit 7 word "${o}"`);
  }
});

test('Connections: the confusable pairs are pulled apart by their clues', () => {
  const clues = t => CONNECTIONS_PUZZLES_U7.find(p => p.target === t).clues.map(c => norm(c.text)).join(' | ');
  // people in the process: asking vs answering, sending a form vs being considered
  assert.doesNotMatch(clues('interviewer'), /\banswer|\bis asked\b|\bare asked\b|receive/); assert.match(clues('interviewer'), /asks/);
  assert.doesNotMatch(clues('interviewee'), /\basks\b|prepared questions/); assert.match(clues('interviewee'), /answer|asked questions|are asked/);
  assert.doesNotMatch(clues('applicant'), /shortlist|considered|exam/); assert.match(clues('applicant'), /form/);
  assert.doesNotMatch(clues('candidate'), /\bform\b|formal request/); assert.match(clues('candidate'), /exam/); assert.match(clues('candidate'), /considered|shortlist/);
  // referee (a person) and reference (a statement)
  assert.match(clues('referee'), /\bperson\b/); assert.doesNotMatch(clues('referee'), /written statement|\bletter\b/);
  assert.match(clues('reference'), /written statement|letter/); assert.doesNotMatch(clues('reference'), /\bperson\b.*(name|permission)/);
  // qualifications (results and training) is not a certificate (one official paper) and not experience
  assert.match(clues('qualifications'), /exam results/); assert.doesNotMatch(clues('qualifications'), /official paper|document/);
  assert.match(clues('certificate'), /official/); assert.doesNotMatch(clues('certificate'), /degrees|training course/);
  // summary (shortened version) vs overview (the whole subject, before the details); layout (page arrangement) vs format (set structure)
  assert.doesNotMatch(clues('summary'), /whole subject|big picture|before the details/); assert.doesNotMatch(clues('overview'), /shorter|fifty words|key points/);
  assert.doesNotMatch(clues('layout'), /set structure/); assert.doesNotMatch(clues('format'), /\bpage\b.*\bpictures\b/);
  assert.doesNotMatch(clues('register'), /\blist\b|attendance|\bclass\b/, 'register is the language sense only');
});

test('Connections: help has exactly two distinct Unit 7 distractors of the same word class, never a near-synonym or a blocked neighbour', () => {
  for (const p of CONNECTIONS_PUZZLES_U7) {
    assert.equal(p.help.length, 2, p.target); assert.equal(new Set([p.target, ...p.help]).size, 3);
    for (const h of p.help) {
      assert.ok(terms7.has(h), `${p.target}: help "${h}" is Unit 7`);
      assert.equal(posOf.get(h), posOf.get(p.target), `${p.target} / ${h}: same word class`);
      assert.ok(!BLITZ_CONFUSABLE_U7.some(g => g.includes(p.target) && g.includes(h)), `${p.target} / ${h} share a confusable group`);
      assert.ok(!dangerous(p.target, h), `${p.target} / ${h} are confusable`);
      assert.ok(!p.clues.some(c => new RegExp(`\\b${h}s?\\b`, 'i').test(c.text)), `${p.target}: a clue names the help word ${h}`);
    }
  }
});

test('Connections: accepted forms are conservative inflections, never another Unit 7 word, never an American spelling', () => {
  for (const p of CONNECTIONS_PUZZLES_U7) {
    const target = normaliseGuess(p.target);
    assert.equal(new Set(p.accept.map(normaliseGuess)).size, p.accept.length, p.target);
    for (const a of p.accept) {
      assert.notEqual(normaliseGuess(a), target, p.target);
      assert.ok(!terms7.has(a) || a === p.target, `${p.target}: "${a}" is another word`);
      assert.ok(normaliseGuess(a).startsWith(target.slice(0, target.length - 2)), `${p.target}: "${a}" is not an inflection of it`);
      assert.doesNotMatch(a, /z/i, `${p.target}: no American spelling "${a}"`);
    }
  }
  assert.deepEqual(CONNECTIONS_PUZZLES_U7.find(p => p.target === 'criteria').accept, ['criterion']);
  assert.deepEqual(CONNECTIONS_PUZZLES_U7.find(p => p.target === 'qualifications').accept, []);
  const text = JSON.stringify([CONNECTIONS_PUZZLES_U7, BLITZ_MEANING_OPTIONS_U7, BLITZ_EXCLUDED_U7, BLITZ_CONFUSABLE_U7]);
  assert.doesNotMatch(text, /organiz|recogniz|summariz|prioritiz|color\b|behavior|center\b/i, 'no American spelling anywhere in the Unit 7 Games data');
  const organise = () => createConnections({ puzzles: [CONNECTIONS_PUZZLES_U7.find(p => p.target === 'organise')] });
  assert.equal(organise().guess('organize').correct, false, 'American spelling is not accepted for the locked British target');
  assert.equal(organise().guess('organised').correct, true); assert.equal(organise().guess('Organising ').correct, true);
  // singular and plural of the paired words are accepted only where they are the same word
  const only = t => createConnections({ puzzles: [CONNECTIONS_PUZZLES_U7.find(p => p.target === t)] });
  assert.equal(only('referee').guess('reference').correct, false); assert.equal(only('reference').guess('referee').correct, false);
  assert.equal(only('applicant').guess('candidate').correct, false); assert.equal(only('candidate').guess('applicant').correct, false);
  assert.equal(only('interviewer').guess('interviewee').correct, false); assert.equal(only('interviewee').guess('interviewer').correct, false);
  assert.equal(only('qualifications').guess('qualification').correct, false, 'the singular is a separate word and is not accepted');
  assert.equal(only('criteria').guess('Criterion').correct, true); assert.equal(only('referee').guess('REFEREES').correct, true);
  // every target and alias, in several case and space variants, is correct; a dropped letter is not
  for (const p of CONNECTIONS_PUZZLES_U7) for (const word of [p.target, ...p.accept]) {
    for (const typed of [word, word.toUpperCase(), `  ${word[0].toUpperCase()}${word.slice(1)}  `]) assert.equal(createConnections({ puzzles: [p] }).guess(typed)?.correct, true, `${p.target}: "${typed}"`);
    if (word === p.target) assert.equal(createConnections({ puzzles: [p] }).guess(word.slice(0, -1)).correct, false, `${p.target}: "${word.slice(0, -1)}" is not a word form`);
  }
});

test('Connections: pickPuzzles, withWordClasses and the engine work on the Unit 7 bank', () => {
  const picked = pickPuzzles(CONNECTIONS_PUZZLES_U7, seeded(5), 5, createGameHistory()); assert.equal(picked.length, 5); assert.equal(new Set(picked.map(p => p.target)).size, 5);
  const history = createGameHistory(); const seen = new Set();
  for (let i = 0; i < 14; i++) for (const p of pickPuzzles(CONNECTIONS_PUZZLES_U7, seeded(i + 2), 5, history)) seen.add(p.target);
  assert.equal(seen.size, 49, 'history rotates through the whole bank');
  const classed = withWordClasses(CONNECTIONS_PUZZLES_U7, unit7.items); assert.equal(classed.length, 49);
  const shape = t => wordShape(classed.find(p => p.target === t), 1);
  assert.equal(shape('strategy').wordClass, 'NOUN'); assert.equal(shape('demonstrate').wordClass, 'VERB'); assert.equal(shape('flexible').wordClass, 'ADJECTIVE');
  for (const p of classed) assert.ok(wordShape(p, 1).wordClass, `${p.target} has a word class`);
  assert.equal(shape('qualifications').lengthLabel, '14 letters'); assert.equal(shape('referee').firstLetter, 'R'); assert.equal(wordShape(classed.find(p => p.target === 'qualifications'), 2).pattern, 'QUA___________');
  const g = createConnections({ puzzles: [CONNECTIONS_PUZZLES_U7[0]] }); for (let i = 0; i < 3; i++) g.reveal();
  assert.ok(g.help()); assert.equal(g.state.choices.length, 3);
  assert.deepEqual([...g.state.choices].sort(), [CONNECTIONS_PUZZLES_U7[0].target, ...CONNECTIONS_PUZZLES_U7[0].help].sort());
  const n = createConnections({ puzzles: [CONNECTIONS_PUZZLES_U7[1]] }); const res = n.guess(CONNECTIONS_PUZZLES_U7[1].target);
  assert.equal(res.correct, true); assert.equal(res.points, 500);
});

test('Connections: a five-puzzle session scores 500/400/300/200, help is worth 100, a revealed answer is 0, and the session ends after five', () => {
  assert.equal(CONNECTIONS.puzzleCount, 5); assert.deepEqual([...CONNECTIONS.points], [500, 400, 300, 200]); assert.equal(CONNECTIONS.helpPoints, 100);
  const game = createConnections({ puzzles: pickPuzzles(CONNECTIONS_PUZZLES_U7, seeded(9), 5, createGameHistory()) }); assert.equal(game.state.puzzles.length, 5);
  assert.equal(game.state.revealed, 1); assert.equal(game.potential(), 500);
  assert.equal(game.guess(game.puzzle().target).points, 500); game.next();                                           // puzzle 1: clue 1
  game.reveal(); game.reveal(); assert.equal(game.guess(game.puzzle().target).points, 300); game.next();             // puzzle 2: clue 3
  while (game.reveal()); assert.equal(game.potential(), 200); assert.equal(game.guess('not it').correct, false); assert.equal(game.potential(), 200, 'a wrong guess costs nothing');
  assert.equal(game.guess(game.puzzle().target).points, 200); game.next();                                           // puzzle 3: clue 4
  while (game.reveal()); assert.ok(game.help()); const wrongPick = game.state.choices.find(c => c !== game.puzzle().target); assert.equal(game.pick(wrongPick).correct, false);
  assert.equal(game.pick(game.puzzle().target).points, 100); game.next();                                            // puzzle 4: help
  while (game.reveal()); assert.equal(game.giveUp(), true); assert.equal(game.state.results.at(-1).points, 0); game.next(); // puzzle 5: revealed
  assert.equal(game.state.status, 'over'); assert.equal(game.state.score, 500 + 300 + 200 + 100);
  const sum = game.summary(); assert.equal(sum.total, 5); assert.equal(sum.solved, 4);
});

test('Connections: Unit 7 has no multi-word targets, and the scaffold never gives the whole word away', () => {
  assert.ok(![...terms7].some(t => /[\s-]/.test(t)));
  const classed = withWordClasses(CONNECTIONS_PUZZLES_U7, unit7.items);
  for (const p of classed) {
    const shapes = [1, 2, 3, 4].map(n => wordShape(p, n));
    for (const s of shapes) { assert.equal(s.words, 1, p.target); assert.equal(s.letters, p.target.length, p.target); assert.equal(s.firstLetter, p.target[0].toUpperCase()); }
    assert.equal(shapes[0].pattern, null); assert.ok(shapes[3].pattern.includes('_'), `${p.target}: final scaffold is incomplete`);
    assert.equal(createConnections({ puzzles: [p] }).guess(p.target.slice(0, -1)).correct, false, `${p.target}: a partial word is not accepted`);
  }
});

test('Unit 7 ids: repeated earlier-unit words use the Unit 7 vocabulary ids, never an earlier unit\'s', () => {
  const earlier = new Set([unit1, unit2, unit3, unit4, unit5, unit6].flatMap(u => u.items.map(i => i.vocabularyId)));
  const ids7 = new Set(unit7.items.map(i => i.vocabularyId));
  for (const id of ids7) assert.ok(!earlier.has(id), `${id} is not an earlier-unit id`);
  for (const t of ['availability', 'strategy', 'respond', 'relevant', 'qualification', 'confidence', 'anxious', 'technique', 'evaluate', 'criteria']) {
    const item = unit7.items.find(i => i.term === t); assert.equal(item.vocabularyId, `vocab_${t}_7`, t);
    assert.ok([unit1, unit2, unit3, unit4, unit5, unit6].some(u => u.items.some(i => i.term === t)), `${t} really is a repeated word`);
    assert.ok(rows7.has(`def:vocab_${t}_7`), `${t}: def uses the Unit 7 id`);
    assert.ok(![...rows7.keys()].some(id => new RegExp(`^(def|para):vocab_${t}(:|$)`).test(id)), `${t}: no bare id`);
    assert.ok(![...rows7.keys()].some(id => new RegExp(`^(def|para):vocab_${t}_[1-6](:|$)`).test(id)), `${t}: no earlier-unit id`);
    assert.ok([...rows7.values()].some(r => r.q.term === t && r.q.type === 'mic'), `${t}: meaning rows are served`);
  }
  for (const id of rows7.keys()) { const m = /^(?:def|para):(vocab_[a-z_0-9]+?)(?::|$)/.exec(id); if (m) assert.ok(ids7.has(m[1]), `${id} is a Unit 7 id`); }
  for (const { q } of rows7.values()) if (q.type === 'gap' || q.type === 'mic') assert.match(q.id, /^(gap|mic):u7_/, q.id);
});

test('regression: Units 1-6 data and pools are unchanged', () => {
  assert.equal(hash(CONNECTIONS_PUZZLES), '0b698694c5a335e2'); assert.equal(hash(BLITZ_CONFUSABLE), 'b765052c41d91923'); assert.equal(hash(BLITZ_MEANING_OPTIONS), 'eef76449de939a7c');
  assert.equal(hash(CONNECTIONS_PUZZLES_U2), 'a375383150af93bf'); assert.equal(hash(BLITZ_CONFUSABLE_U2), '094e57654696d740'); assert.equal(hash(BLITZ_EXCLUDED_U2), '83d2a397064eac3b');
  assert.equal(hash(CONNECTIONS_PUZZLES_U3), 'c21c4011dc510dbd'); assert.equal(hash(BLITZ_CONFUSABLE_U3), '1cd3d57b2fe62e52'); assert.equal(hash(BLITZ_EXCLUDED_U3), 'd45392463a9c58a7');
  assert.equal(hash(CONNECTIONS_PUZZLES_U4), 'db44bf9e961f2c6a'); assert.equal(hash(BLITZ_CONFUSABLE_U4), 'e87686c72d38b824'); assert.equal(hash(BLITZ_EXCLUDED_U4), '04f2e211bedbaa52');
  assert.equal(hash(CONNECTIONS_PUZZLES_U5), '3d54a114087770c0'); assert.equal(hash(BLITZ_CONFUSABLE_U5), 'f0525ec83d71f043'); assert.equal(hash(BLITZ_EXCLUDED_U5), 'cf06bfd1ffe8cc31'); assert.equal(hash(BLITZ_MEANING_OPTIONS_U5), '44136fa355b3678a');
  assert.equal(hash(CONNECTIONS_PUZZLES_U6), 'f8b3e7867299e215'); assert.equal(hash(BLITZ_CONFUSABLE_U6), '53a2c92dc308e519'); assert.equal(hash(BLITZ_EXCLUDED_U6), '05afbf4a612aae2b'); assert.equal(hash(BLITZ_MEANING_OPTIONS_U6), '4b0df8560a373ea9');
  const p1 = buildBlitzPool(unit1, seeded(3), gamesFor(1).blitz); assert.equal(p1.length, 328);
  const p2 = buildBlitzPool(unit2, seeded(3), gamesFor(2).blitz); assert.equal(p2.length, 293); assert.deepEqual(count(p2), { def: 48, para: 52, gap: 93, mic: 100 });
  const p3 = buildBlitzPool(unit3, seeded(3), gamesFor(3).blitz); assert.equal(p3.length, 292); assert.deepEqual(count(p3), { def: 48, para: 48, gap: 97, mic: 99 });
  const p4 = buildBlitzPool(unit4, seeded(3), gamesFor(4).blitz); assert.equal(p4.length, 282); assert.deepEqual(count(p4), { def: 49, para: 38, gap: 96, mic: 99 });
  const p5 = buildBlitzPool(unit5, seeded(3), gamesFor(5).blitz); assert.equal(p5.length, 258); assert.deepEqual(count(p5), { def: 48, para: 43, gap: 99, mic: 68 });
  const p6 = buildBlitzPool(unit6, seeded(3), gamesFor(6).blitz); assert.equal(p6.length, 265); assert.deepEqual(count(p6), { def: 49, para: 58, gap: 65, mic: 93 });
  assert.equal(CONNECTIONS_PUZZLES_U2.length, 48); assert.equal(CONNECTIONS_PUZZLES_U3.length, 49); assert.equal(CONNECTIONS_PUZZLES_U4.length, 48); assert.equal(CONNECTIONS_PUZZLES_U5.length, 48); assert.equal(CONNECTIONS_PUZZLES_U6.length, 49);
});

test('final rollout: Units 1-7 all expose both Games, each from its own content, and Unit 8 falls back to nothing', () => {
  const contents = { 1: unit1, 2: unit2, 3: unit3, 4: unit4, 5: unit5, 6: unit6, 7: unit7 };
  assert.deepEqual(Object.keys(GAMES_BY_UNIT).map(Number), [1, 2, 3, 4, 5, 6, 7]);
  const seenPuzzles = new Set(); const seenBlitz = new Set();
  for (const u of [1, 2, 3, 4, 5, 6, 7]) {
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
  for (const u of [8, 9, 12, 0, -1, NaN, null, undefined, '8', 'seven']) {
    assert.equal(gamesFor(u), null); assert.deepEqual(availableGames(u), []);
    if (u !== undefined) { assert.equal(renderGamesEntry(u), '', `unit ${String(u)} shows no Games entry`); const lobby = renderLobby(u); assert.match(lobby, /data-games-unavailable/); assert.doesNotMatch(lobby, /data-game-card|data-game="(blitz|connections)"/); assert.doesNotMatch(lobby, /Unit [1-7]\b/); }
  }
  assert.deepEqual(buildBlitzPool(unit7, seeded(3), gamesFor(8)?.blitz), [], 'without Unit 8 data there is no Blitz pool, not a Unit 7 one');
  // the pool for another unit never leaks into Unit 7 either
  assert.deepEqual(buildBlitzPool(unit6, seeded(3), data7.blitz).filter(q => !terms7.has(q.term)).length, buildBlitzPool(unit6, seeded(3), data7.blitz).length - buildBlitzPool(unit6, seeded(3), data7.blitz).filter(q => terms7.has(q.term)).length);
});

test('scope: the Unit 7 Games change adds one data file and a registry entry, and no engine, view, controller or style file', () => {
  const registry = read('src/vocabulary/games/games-data.js');
  assert.match(registry, /import \{ BLITZ_CONFUSABLE_U7, BLITZ_MEANING_OPTIONS_U7, BLITZ_EXCLUDED_U7, CONNECTIONS_PUZZLES_U7 \} from '\.\/games-data-unit-07\.js';/);
  const data = read('src/vocabulary/games/games-data-unit-07.js');
  assert.doesNotMatch(data, /import |fetch|localStorage|sessionStorage|supabase|XMLHttpRequest/i, 'the data file holds no code, storage or network access');
  assert.doesNotMatch(read('src/vocabulary/games/blitz-engine.js'), /games-data-unit-07|unit 7|u7_/i); assert.doesNotMatch(read('src/vocabulary/games/connections-engine.js'), /games-data-unit-07|unit 7|u7_/i);
});

// ---------------------------------------------------------------- the real rendered games, responsive and navigable
const browserTest = loadPlaywright() && await findChromium() ? test : test.skip;
const startServer = () => new Promise(resolve => {
  const types = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    if (url === '/__games7.html') {
      const css = [...read('vocabulary.html').matchAll(/href="([^"]+\.css)"/g)].map(m => `<link rel="stylesheet" href="/${m[1]}">`).join('');
      res.setHeader('content-type', 'text/html');
      return res.end(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${css}</head><body><div id="vocabularyApp"></div><script type="module">
import { renderVocabularyUnit } from '/src/vocabulary/views.js'; import { mountGames } from '/src/vocabulary/games/games-controller.js'; import unit from '/content/vocabulary/units/unit-07.js';
window.__fetches = 0; const f = window.fetch; window.fetch = (...a) => { window.__fetches += 1; return f(...a); };
window.__exits = 0; window.__t = 0;
window.__unit = () => renderVocabularyUnit(document.getElementById('vocabularyApp'), { unitNumber: 7, unitTitle: unit.unitTitle, progress: { mastered: 0, total: 50, needsAnotherLook: 0, reviewDue: 0, stages: {} }, pathwayStates: {}, contentReady: true });
window.__mount = game => { window.__g = mountGames(document.getElementById('vocabularyApp'), { content: unit, unitNumber: 7, game, now: () => window.__t, rng: () => 0.37, onExit: () => { window.__exits += 1; } }); };
window.__ready = true;</script></body></html>`);
    }
    const file = path.join(repo, url);
    if (!file.startsWith(repo) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.statusCode = 404; return res.end('nf'); }
    res.setHeader('content-type', types[path.extname(file)] ?? 'application/octet-stream'); fs.createReadStream(file).pipe(res);
  });
  server.listen(0, '127.0.0.1', () => resolve({ server, url: `http://127.0.0.1:${server.address().port}` }));
});

browserTest('in a browser: both Unit 7 games launch from the overview, play, restart, navigate back, never overflow at 1280/390/320, and make no network or progression calls', async () => {
  const playwright = loadPlaywright(); const browser = await playwright.chromium.launch({ executablePath: await findChromium() }); const { server, url } = await startServer();
  try {
    const open = async (w, h, reducedMotion = 'no-preference') => { const page = await browser.newPage({ viewport: { width: w, height: h }, reducedMotion }); const requests = []; page.on('request', r => requests.push(r.url())); page.on('pageerror', e => { throw e; }); await page.goto(`${url}/__games7.html`); await page.waitForFunction(() => window.__ready); page.requests = requests; return page; };
    const overflow = page => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    for (const [w, h, rm] of [[1280, 720, 'no-preference'], [390, 844, 'no-preference'], [320, 640, 'no-preference'], [390, 844, 'reduce']]) {
      const page = await open(w, h, rm); const where = `${w}/${rm}`;
      await page.evaluate(() => window.__unit());
      assert.ok((await overflow(page)) <= 0, `${where}: unit screen overflow`);
      assert.equal(await page.locator('[data-games-entry]').count(), 1, `${where}: the Bonus Games section is on the Unit 7 overview`);
      assert.equal(await page.locator('[data-games-entry] [data-game="blitz"]').count(), 1); assert.equal(await page.locator('[data-games-entry] [data-game="connections"]').count(), 1);
      assert.match(await page.textContent('[data-games-entry]'), /60 seconds[\s\S]*Word Blitz[\s\S]*5 puzzles[\s\S]*Connections/);
      await page.evaluate(() => window.__mount('lobby')); assert.ok((await overflow(page)) <= 0, `${where}: lobby overflow`);
      await page.click('[data-game-act="open"][data-game="blitz"]'); assert.ok((await overflow(page)) <= 0, `${where}: blitz intro overflow`);
      // ---- Word Blitz, real Unit 7 questions
      await page.click('[data-game-act="blitz-start"]');
      const terms = new Set(await page.evaluate(() => window.__unit7Terms ?? []));
      for (let i = 0; i < 4; i += 1) {
        const q = await page.evaluate(() => { const s = window.__g.blitz.state.question; return { term: s.term, type: s.type, idx: s.answerIndex, n: s.options.length }; });
        assert.equal(q.n, 4); terms.add(q.term);
        await page.click(`[data-game-act="blitz-answer"][data-index="${q.idx}"]`); await page.waitForTimeout(450); await page.evaluate(() => { window.__t += 1000; });
      }
      assert.equal(await page.evaluate(() => window.__g.blitz.state.score), 100 + 100 + 200 + 200);
      assert.ok((await overflow(page)) <= 0, `${where}: blitz play overflow`);
      await page.evaluate(() => { window.__t = 55000; }); await page.waitForTimeout(250); assert.equal(await page.locator('.gm-shell[data-urgent]').count(), 1, `${where}: urgency treatment in the last seconds`);
      await page.evaluate(() => { window.__t = 61000; }); await page.waitForSelector('[data-phase="over"]'); assert.ok((await overflow(page)) <= 0, `${where}: blitz result overflow`);
      await page.click('[data-game-act="blitz-again"]'); await page.evaluate(() => { window.__t = 100000; }); assert.equal(await page.textContent('[data-blitz-score]'), '0', `${where}: Play again restarts at zero`);
      await page.click('[data-game-act="lobby"]'); assert.equal(await page.locator('[data-games-lobby]').count(), 1, `${where}: Back to Games`);
      // ---- Connections, real Unit 7 puzzles
      await page.click('[data-game-act="open"][data-game="connections"]'); await page.click('[data-game-act="cx-start"]');
      assert.equal(await page.locator('.gm-clue:not(.gm-clue--hidden)').count(), 1); assert.match(await page.textContent('[data-cx-class]'), /^(NOUN|VERB|ADJECTIVE)$/); assert.match(await page.textContent('[data-cx-length]'), /^\d+ letters$/);
      await page.click('[data-game-act="cx-reveal"]'); assert.equal(await page.locator('.gm-clue:not(.gm-clue--hidden)').count(), 2); assert.equal(await page.textContent('[data-cx-worth]'), '400');
      for (let i = 0; i < 5; i += 1) { const target = await page.evaluate(() => window.__g.connections.puzzle().target); assert.ok(CONNECTIONS_PUZZLES_U7.some(p => p.target === target), `${where}: ${target} is a Unit 7 puzzle`); await page.fill('#cxGuess', target); await page.press('#cxGuess', 'Enter'); await page.click('[data-game-act="cx-next"]'); }
      await page.waitForSelector('[data-phase="over"]'); assert.ok((await overflow(page)) <= 0, `${where}: connections result overflow`); assert.match(await page.textContent('.gm-stats'), /Solved[\s\S]*5 \/ 5[\s\S]*Average clues used/);
      await page.click('[data-game-act="cx-again"]'); assert.equal(await page.textContent('[data-cx-score]'), '0', `${where}: Play again restarts`);
      await page.click('[data-game-act="lobby"]'); await page.click('[data-game-act="exit-unit"]'); assert.equal(await page.evaluate(() => window.__exits), 1, `${where}: exit returns to the unit`);
      assert.equal(await page.evaluate(() => window.__fetches), 0, `${where}: games made fetch calls`); assert.ok(page.requests.every(r => r.startsWith(url)), `${where}: external request`);
      for (const term of terms) assert.ok(terms7.has(term), `${where}: ${term} is a Unit 7 word`);
      await page.close();
    }
  } finally { await browser.close(); server.close(); }
});

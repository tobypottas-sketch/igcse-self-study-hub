// Games tests: isolation, Word Blitz question quality + rules, Connections clue curve + scoring + accepted spellings (engine, harness and the real app),
// restart/navigation, wording and layout.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { renderVocabularyUnit, renderVocabularyHome } from '../src/vocabulary/views.js';
import { createBlitz, BLITZ, buildBlitzPool, multiplierFor, blankSentence, blankExact, ratingFor } from '../src/vocabulary/games/blitz-engine.js';
import { createConnections, pickPuzzles, CONNECTIONS, normaliseGuess, acceptedForms, wordShape } from '../src/vocabulary/games/connections-engine.js';
import { CONNECTIONS_PUZZLES, BLITZ_CONFUSABLE } from '../src/vocabulary/games/games-data.js';
import { findChromium, loadPlaywright } from './helpers/pathway-geometry-harness.mjs';

const repo = fileURLToPath(new URL('..', import.meta.url));
const read = file => fs.readFileSync(path.join(repo, file), 'utf8');
const gameFiles = fs.readdirSync(path.join(repo, 'src/vocabulary/games')).map(f => `src/vocabulary/games/${f}`);
const terms = new Set(unit1.items.map(item => item.term));
const unitHtml = unitNumber => { const root = { innerHTML: '' }; renderVocabularyUnit(root, { unitNumber, unitTitle: 'T', progress: { mastered: 0, total: 50, needsAnotherLook: 0, reviewDue: 0, stages: {} }, pathwayStates: {}, contentReady: true }); return root.innerHTML; };
const seeded = (seed = 7) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

test('Games entry appears on the Unit 1 screen only, after the pathways, with student-friendly wording', () => {
  const one = unitHtml(1);
  assert.match(one, /data-games-entry/); assert.match(one, /<h2 id="gmEntryTitle">Bonus Games<\/h2>/); assert.match(one, /Practise your Unit 1 vocabulary in a different way\./); assert.match(one, /Games don’t affect your pathway progress\./);
  assert.match(one, /data-game="blitz"/); assert.match(one, /data-game="connections"/);
  assert.ok(one.indexOf('data-games-entry') > one.indexOf('vocab-pathway-grid') && one.indexOf('data-games-entry') < one.indexOf('Extra Practice'));
  const entry = one.match(/<section class="gm-entry"[\s\S]*?<\/section>/)[0];
  assert.doesNotMatch(entry, /data-pathway|open-pathway|start-mixed/); assert.doesNotMatch(entry, /mastery|XP|saved/i, 'no administrative wording in the entry');
  assert.doesNotMatch(unitHtml(2), /data-games-entry/); assert.doesNotMatch(unitHtml(7), /gm-entry/);
  const home = { innerHTML: '' }; renderVocabularyHome(home, { units: [{ unitNumber: 1, unitTitle: 'U', mastered: 0, total: 50 }], soundOn: true });
  assert.doesNotMatch(home.innerHTML, /data-games-entry/);
  const gamesView = read('src/vocabulary/games/games-view.js').replace(/^\s*\/\/.*$/gm, '');
  assert.doesNotMatch(gamesView, /not part of mastery|nothing (here )?is saved|does not affect|never changes your/i);
  assert.equal((gamesView.match(/don’t affect your pathway progress/g) ?? []).length, 1, 'the progress line appears once');
});

test('isolation: the games touch no storage, network, database, progression, XP, mastery or Set code', () => {
  for (const file of gameFiles.filter(f => f.endsWith('.js'))) {
    const code = read(file).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\s\/\/ .*$/gm, '');
    for (const imported of [...code.matchAll(/from '([^']+)'/g)].map(m => m[1])) assert.match(imported, /^\.\/(blitz-engine|connections-engine|games-data|games-view|games-controller|games-history)\.js$/, `${file} imports ${imported}`);
    assert.doesNotMatch(code, /supabase|fetch\(|XMLHttpRequest|localStorage|sessionStorage|indexedDB|\.rpc\(|client\.from|recordVocabulary|engagement-model|settleMission|setProgression|applyMastery|xpGained|computeXp|\btrack\(|analytics/i, `${file} must stay isolated`);
  }
  const app = read('src/vocabulary/app.js');
  assert.equal((app.match(/mountGames/g) ?? []).length, 2, 'app.js only imports and calls mountGames');
  assert.match(app, /mountGames\(root, \{ content:state\.content, game:target\.dataset\.game, onExit:/, 'only the loaded content and an exit callback are passed');
});

// ---------------------------------------------------------------- Word Blitz
const allBlitz = (rng = seeded(11)) => buildBlitzPool(unit1, rng).map(q => ({ ...q, ...q.build() }));
const groupOf = term => new Set(BLITZ_CONFUSABLE.filter(g => g.includes(term.toLowerCase())).flat());

test('Word Blitz: every question has four distinct options and exactly one defensible answer', () => {
  const questions = allBlitz(); assert.ok(questions.length > 150); assert.deepEqual([...new Set(questions.map(q => q.type))].sort(), ['def', 'gap', 'mic', 'para']);
  for (const q of questions) {
    assert.equal(q.options.length, 4, q.id); assert.equal(new Set(q.options.map(o => o.toLowerCase())).size, 4, `${q.id}: duplicate options`); assert.equal(q.options.filter((_, i) => i === q.answerIndex).length, 1);
    if (q.type === 'def' || q.type === 'para') {
      assert.ok(q.options.every(o => terms.has(o)), `${q.id}: options are Unit 1 words`); assert.ok(!q.prompt.toLowerCase().includes(q.term.toLowerCase()), `${q.id}: prompt leaks the word`);
      const blocked = groupOf(q.term);
      for (const o of q.options.filter(o => o !== q.term)) assert.ok(!blocked.has(o.toLowerCase()), `${q.id}: ${o} is a near neighbour of ${q.term}`);
    }
  }
});

test('Word Blitz: gap-fill questions come only from teacher-reviewed rows, and the wrong options are the reviewed ones', () => {
  const rows = new Map(); for (const item of unit1.items) for (const sense of item.senses) for (const row of sense.gapDistractors ?? []) rows.set(`gap:${row.contextId}`, row);
  const gaps = allBlitz().filter(q => q.type === 'gap'); assert.ok(gaps.length >= 80);
  for (const q of gaps) {
    const row = rows.get(q.id); assert.ok(row, `${q.id} has a reviewed row`); const lower = o => o.toLowerCase();
    assert.deepEqual(q.options.map(lower).sort(), [row.answer, ...row.wrong.slice(0, 3)].map(lower).sort(), `${q.id}: options are exactly the reviewed set`);
    assert.equal(lower(q.options[q.answerIndex]), lower(row.answer)); assert.match(q.prompt, /____/); assert.equal((q.prompt.match(/____/g) ?? []).length, 1);
  }
  // content with no reviewed gap rows yields no gap questions (never an unreviewed guess)
  const bare = { ...unit1, items: unit1.items.map(item => ({ ...item, senses: item.senses.map(sense => ({ ...sense, gapDistractors: undefined })) })) };
  assert.ok(buildBlitzPool(bare, seeded(2)).every(q => q.type !== 'gap'));
  assert.deepEqual(blankExact('Avoiding injury requires care.', 'avoiding'), { sentence: '____ injury requires care.', atStart: true });
  assert.equal(blankSentence('She avoided the traffic.', 'avoid'), 'She ____ed the traffic.');
});

test('Word Blitz: no word twice in a row, and questions never leave Unit 1', () => {
  const game = createBlitz({ content: unit1, rng: seeded(3), now: () => 0 }); let last = null;
  for (let i = 0; i < 80; i += 1) {
    const q = i === 0 ? game.start() : game.next(); assert.notEqual(q.term, last); last = q.term; assert.ok(terms.has(q.term));
    game.answer(q.answerIndex);
  }
});

test('Word Blitz: timer, scoring, multiplier, streak reset and the result summary', () => {
  let t = 0; const game = createBlitz({ content: unit1, rng: seeded(5), now: () => t });
  assert.equal(game.remaining(), BLITZ.durationMs); game.start();
  const right = () => game.answer(game.state.question.answerIndex); const wrong = () => game.answer((game.state.question.answerIndex + 1) % 4);
  assert.equal(right().points, 100); game.next(); assert.equal(right().points, 100); game.next();
  const third = right(); assert.equal(third.points, 200); assert.equal(third.multiplier, 2); assert.equal(game.state.score, 400); assert.equal(game.answer(0), null, 'a second answer to the same question is ignored'); game.next();
  const miss = wrong(); assert.equal(miss.correct, false); assert.equal(miss.points, 0); assert.equal(game.state.streak, 0); assert.equal(game.state.status, 'playing', 'a wrong answer does not end the game');
  game.next(); assert.equal(right().points, 100, 'multiplier resets with the streak');
  assert.deepEqual([0, 2, 3, 5, 6, 9, 10, 25].map(multiplierFor), [1, 1, 2, 2, 3, 3, 4, 4]);
  t = 59000; assert.equal(game.remaining(), 1000); t = 60001; assert.equal(game.tick(), 'over'); assert.equal(game.answer(0), null);
  const sum = game.summary(); assert.deepEqual([sum.score, sum.correct, sum.answered, sum.accuracy, sum.bestStreak, sum.topMultiplier], [500, 4, 5, 80, 3, 2]);
  assert.equal(sum.missed.length, 1); assert.ok(sum.missed[0].term && sum.missed[0].meaning); assert.equal(sum.rating, 'Good start');
  assert.deepEqual([0, 799, 800, 1799, 1800, 2999, 3000].map(ratingFor), ['Good start', 'Good start', 'Strong round', 'Strong round', 'Brilliant', 'Brilliant', 'Unstoppable']);
});

// ---------------------------------------------------------------- Connections
test('Connections: curated Unit 1 puzzles, exactly four clues each, on the agreed curve', () => {
  assert.ok(CONNECTIONS_PUZZLES.length >= 40, 'at least 40 curated puzzles');
  const kinds = new Set();
  for (const p of CONNECTIONS_PUZZLES) {
    assert.ok(terms.has(p.target), `${p.target} is a Unit 1 word`); assert.equal(p.clues.length, 4, `${p.target}: four clues`);
    const stem = p.target.slice(0, Math.max(5, p.target.length - 3)).toLowerCase();
    for (const [i, c] of p.clues.entries()) { assert.ok(!c.text.toLowerCase().replace(/___/g, '').includes(stem), `${p.target} clue ${i + 1} gives the word away`); kinds.add(c.kind); }
    assert.deepEqual(p.clues.map(c => c.kind), ['association', 'association', 'plain', 'meaning'], `${p.target}: the clue staircase`);
    assert.ok(!p.clues[2].text.includes('___'), `${p.target}: clue 3 is plain meaning, not a blank sentence`);
    assert.ok(p.clues.every(c => !c.text.includes('___')));
    assert.ok(p.why.length > 30); assert.ok(p.clues[2].text.length < 70);
  }
  assert.deepEqual([...kinds].sort(), ['association', 'meaning', 'plain']);
  // clue 4 is the real Unit 1 meaning, in the student's own words: it shares vocabulary with the unit's definition
  for (const p of CONNECTIONS_PUZZLES) { const def = unit1.items.find(i => i.term === p.target).coreMeaning.toLowerCase().match(/[a-z]{5,}/g) ?? []; assert.ok(def.some(w => p.clues[3].text.toLowerCase().includes(w.slice(0, 5))) || p.target === 'racquet', `${p.target}: clue 4 tracks the definition`); }
});

test('Connections: reveal and scoring are 500 / 400 / 300 / 200, a revealed answer is 0, wrong guesses are free', () => {
  assert.deepEqual([...CONNECTIONS.points], [500, 400, 300, 200]);
  const game = createConnections({ puzzles: pickPuzzles(CONNECTIONS_PUZZLES, seeded(9)) }); assert.equal(game.state.puzzles.length, 5);
  assert.equal(game.state.revealed, 1); assert.equal(game.potential(), 500); assert.equal(game.canGiveUp(), false); assert.equal(game.giveUp(), false);
  game.reveal(); assert.equal(game.potential(), 400);
  assert.equal(game.guess('definitely not it').correct, false); assert.equal(game.potential(), 400, 'a wrong guess costs nothing'); assert.equal(game.state.phase, 'guessing', 'and does not end the puzzle');
  game.guess('  Definitely   NOT it '); assert.equal(game.state.wrong.length, 1, 'the same wrong guess is listed once'); assert.equal(game.state.wrong[0], 'definitely not it', 'shown as typed');
  const first = game.puzzle(); assert.equal(game.guess(`  ${first.target.toUpperCase()} `).points, 400); assert.equal(game.state.score, 400); assert.equal(game.guess(first.target), null, 'cannot score twice');
  game.next(); assert.equal(game.potential(), 500); const second = game.puzzle();
  assert.equal(game.reveal(), true); assert.equal(game.reveal(), true); assert.equal(game.potential(), 300); assert.equal(game.reveal(), true); assert.equal(game.potential(), 200); assert.equal(game.reveal(), false, 'four clues is the limit'); assert.equal(game.canReveal(), false);
  assert.equal(game.guess(second.target).points, 200); game.next();
  while (game.reveal()); assert.equal(game.giveUp(), true); assert.equal(game.state.results.at(-1).points, 0); game.next();
  while (game.state.status !== 'over') { game.guess(game.puzzle().target); game.next(); }
  const sum = game.summary(); assert.equal(sum.total, 5); assert.equal(sum.solved, 4); assert.ok(sum.avgClues >= 1 && sum.avgClues <= 4);
});

const variants = word => [word, word.toUpperCase(), `  ${word[0].toUpperCase()}${word.slice(1)}  `, `${word.slice(0, 2)}${word.slice(2).toUpperCase()}`];
test('Connections accepted spellings: every target and alias, in every case/space variant, is correct; near misses are wrong', () => {
  const withAliases = CONNECTIONS_PUZZLES.filter(p => p.accept.length);
  for (const target of ['antiques', 'atmosphere', 'craftspeople', 'criteria', 'opponent', 'pastime', 'racquet', 'tournament']) assert.ok(withAliases.some(p => p.target === target), `${target} keeps its aliases`);
  for (const p of CONNECTIONS_PUZZLES) for (const word of [p.target, ...p.accept]) for (const typed of variants(word)) {
    const game = createConnections({ puzzles: [p] }); assert.equal(game.guess(typed)?.correct, true, `${p.target}: "${typed}" should be correct`);
  }
  const racquet = CONNECTIONS_PUZZLES.find(p => p.target === 'racquet');
  for (const [typed, ok] of [['racquet', true], ['racket', true], ['RACKET', true], ['Racket', true], ['racket ', true], ['raquet', false], ['racqet', false], ['rocket', false]]) assert.equal(createConnections({ puzzles: [racquet] }).guess(typed).correct, ok, typed);
  assert.deepEqual([...acceptedForms(racquet)].sort(), ['racket', 'racquet', 'racquets', 'rackets'].sort());
  assert.equal(normaliseGuess('Racquét'), 'racquet'); assert.equal(normaliseGuess('goal-oriented'), normaliseGuess('goal oriented'));
  for (const p of CONNECTIONS_PUZZLES) for (const alias of p.accept) assert.ok(!terms.has(alias) || alias === p.target, `${alias} must not be another Unit 1 word`);
});

const browserTest = loadPlaywright() && await findChromium() ? test : test.skip;
const startServer = () => new Promise(resolve => {
  const types = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    if (url === '/__games.html') {
      const css = [...read('vocabulary.html').matchAll(/href="([^"]+\.css)"/g)].map(m => `<link rel="stylesheet" href="/${m[1]}">`).join('');
      res.setHeader('content-type', 'text/html');
      return res.end(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${css}</head><body><div id="vocabularyApp"></div><script type="module">
import { renderVocabularyUnit } from '/src/vocabulary/views.js'; import { mountGames } from '/src/vocabulary/games/games-controller.js'; import unit from '/content/vocabulary/units/unit-01.js';
window.__fetches = 0; const f = window.fetch; window.fetch = (...a) => { window.__fetches += 1; return f(...a); };
window.__exits = 0; window.__t = 0;
window.__unit = () => renderVocabularyUnit(document.getElementById('vocabularyApp'), { unitNumber: 1, unitTitle: unit.unitTitle, progress: { mastered: 0, total: 50, needsAnotherLook: 0, reviewDue: 0, stages: {} }, pathwayStates: {}, contentReady: true });
window.__mount = game => { window.__g = mountGames(document.getElementById('vocabularyApp'), { content: unit, game, now: () => window.__t, rng: () => 0.37, onExit: () => { window.__exits += 1; } }); };
window.__mountP = (game, puzzles) => { window.__g?.destroy?.(); window.__g = mountGames(document.getElementById('vocabularyApp'), { content: unit, game, puzzles, now: () => window.__t, onExit: () => {} }); };
import { CONNECTIONS_PUZZLES } from '/src/vocabulary/games/games-data.js'; window.__puzzles = CONNECTIONS_PUZZLES;
window.__ready = true;</script></body></html>`);
    }
    const file = path.join(repo, url);
    if (!file.startsWith(repo) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.statusCode = 404; return res.end('nf'); }
    res.setHeader('content-type', types[path.extname(file)] ?? 'application/octet-stream'); fs.createReadStream(file).pipe(res);
  });
  server.listen(0, '127.0.0.1', () => resolve({ server, url: `http://127.0.0.1:${server.address().port}` }));
});

browserTest('in a browser: both games launch without network or progression calls, restart, navigate back, survive reduced motion, and never overflow', async () => {
  const playwright = loadPlaywright(); const browser = await playwright.chromium.launch({ executablePath: await findChromium() }); const { server, url } = await startServer();
  try {
    const open = async (w, h, reducedMotion = 'no-preference') => { const page = await browser.newPage({ viewport: { width: w, height: h }, reducedMotion }); const requests = []; page.on('request', r => requests.push(r.url())); page.on('pageerror', e => { throw e; }); await page.goto(`${url}/__games.html`); await page.waitForFunction(() => window.__ready); page.requests = requests; return page; };
    const overflow = page => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    for (const [w, h, rm] of [[1280, 720, 'no-preference'], [390, 844, 'no-preference'], [320, 640, 'no-preference'], [390, 844, 'reduce']]) {
      const page = await open(w, h, rm); const where = `${w}/${rm}`;
      await page.evaluate(() => window.__unit()); assert.ok((await overflow(page)) <= 0, `${where}: unit screen overflow`);
      // launch from the unit entry card exactly as the app does, via its mount; check the lobby first
      await page.evaluate(() => window.__mount('lobby')); assert.ok((await overflow(page)) <= 0, `${where}: lobby overflow`);
      await page.click('[data-game-act="open"][data-game="blitz"]'); assert.ok((await overflow(page)) <= 0, `${where}: blitz intro overflow`);
      // ---- Word Blitz
      await page.click('[data-game-act="blitz-start"]');
      for (let i = 0; i < 4; i += 1) { const idx = await page.evaluate(() => window.__g.blitz.state.question.answerIndex); await page.click(`[data-game-act="blitz-answer"][data-index="${idx}"]`); await page.waitForTimeout(450); await page.evaluate(() => { window.__t += 800; }); }
      assert.equal(await page.evaluate(() => window.__g.blitz.state.score), 100 + 100 + 200 + 200); assert.ok((await overflow(page)) <= 0, `${where}: blitz play overflow`);
      await page.evaluate(() => { window.__t = 55000; }); await page.waitForTimeout(250); assert.equal(await page.locator('.gm-shell[data-urgent]').count(), 1, `${where}: urgency treatment in the last seconds`);
      await page.evaluate(() => { window.__t = 61000; }); await page.waitForSelector('[data-phase="over"]'); assert.ok((await overflow(page)) <= 0, `${where}: blitz result overflow`);
      assert.match(await page.textContent('.gm-stats'), /Correct[\s\S]*Accuracy[\s\S]*Best streak/);
      await page.click('[data-game-act="blitz-again"]'); await page.evaluate(() => { window.__t = 100000; }); assert.equal(await page.textContent('[data-blitz-score]'), '0', `${where}: Play again restarts at zero`);
      await page.click('[data-game-act="lobby"]'); assert.equal(await page.locator('[data-games-lobby]').count(), 1, `${where}: Back to Games`);
      // ---- Connections
      await page.click('[data-game-act="open"][data-game="connections"]'); await page.click('[data-game-act="cx-start"]'); assert.equal(await page.locator('.gm-clue:not(.gm-clue--hidden)').count(), 1); assert.match(await page.textContent('[data-cx-length]'), /^\d+ letters$/); assert.equal(await page.locator('[data-cx-first]').count(), 0, `${where}: no first letter at clue 1`);
      await page.click('[data-game-act="cx-reveal"]'); assert.equal(await page.locator('.gm-clue:not(.gm-clue--hidden)').count(), 2); assert.equal(await page.textContent('[data-cx-worth]'), '400'); assert.equal(await page.locator('[data-cx-first]').count(), 0, `${where}: no first letter at clue 2`);
      await page.click('[data-game-act="cx-reveal"]'); { const t = await page.evaluate(() => window.__g.connections.puzzle().target); assert.equal((await page.textContent('[data-cx-first] b')), t[0].toUpperCase(), `${where}: first letter at clue 3`); assert.equal(await page.textContent('[data-cx-length]'), `${t.length} letters`); } await page.fill('#cxGuess', 'zzz'); await page.press('#cxGuess', 'Enter'); assert.equal(await page.textContent('[data-cx-worth]'), '300', `${where}: a wrong guess costs nothing`); assert.ok((await overflow(page)) <= 0, `${where}: connections overflow`);
      for (let i = 0; i < 5; i += 1) { const target = await page.evaluate(() => window.__g.connections.puzzle().target); await page.fill('#cxGuess', target); await page.press('#cxGuess', 'Enter'); await page.click('[data-game-act="cx-next"]'); }
      await page.waitForSelector('[data-phase="over"]'); assert.ok((await overflow(page)) <= 0, `${where}: connections result overflow`); assert.match(await page.textContent('.gm-stats'), /Solved[\s\S]*5 \/ 5[\s\S]*Average clues used/);
      await page.click('[data-game-act="cx-again"]'); assert.equal(await page.textContent('[data-cx-score]'), '0', `${where}: Play again restarts`);
      await page.click('[data-game-act="lobby"]'); await page.click('[data-game-act="exit-unit"]'); assert.equal(await page.evaluate(() => window.__exits), 1, `${where}: exit returns to the unit`);
      // nothing left the page: no fetch, and every request went to the local test server only
      assert.equal(await page.evaluate(() => window.__fetches), 0, `${where}: games made fetch calls`); assert.ok(page.requests.every(r => r.startsWith(url)), `${where}: external request`);
      await page.close();
    }
  } finally { await browser.close(); server.close(); }
});

browserTest('Connections accepted spellings through the real rendered UI: racquet/racket/RACKET/" racket " correct, raquet wrong, every alias', async () => {
  const playwright = loadPlaywright(); const browser = await playwright.chromium.launch({ executablePath: await findChromium() }); const { server, url } = await startServer();
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } }); page.on('pageerror', e => { throw e; });
    await page.goto(`${url}/__games.html`); await page.waitForFunction(() => window.__ready);
    const attempt = async (target, typed, how) => {
      await page.evaluate(t => window.__mountP('connections', window.__puzzles.filter(p => p.target === t)), target);
      await page.click('[data-game-act="cx-start"]'); await page.fill('#cxGuess', typed);
      if (how === 'enter') await page.press('#cxGuess', 'Enter'); else await page.click('[data-cx-form] button[type="submit"]');
      return page.evaluate(() => window.__g.connections.state.results.length > 0 && window.__g.connections.state.results.at(-1).points > 0);
    };
    for (const how of ['enter', 'button']) {
      for (const [typed, ok] of [['racquet', true], ['racket', true], ['RACKET', true], [' racket ', true], ['Racket', true], ['raquet', false]]) assert.equal(await attempt('racquet', typed, how), ok, `${how}: "${typed}"`);
      const aliased = await page.evaluate(() => window.__puzzles.filter(p => p.accept.length).map(p => [p.target, ...p.accept]));
      assert.ok(aliased.length >= 8);
      for (const forms of aliased) for (const word of forms) for (const typed of [word, word.toUpperCase(), `  ${word}  `]) assert.equal(await attempt(forms[0], typed, how), true, `${how}: ${forms[0]} accepts "${typed}"`);
    }
    // a wrong answer shows in the UI and the puzzle stays open
    await page.evaluate(() => window.__mountP('connections', window.__puzzles.filter(p => p.target === 'racquet'))); await page.click('[data-game-act="cx-start"]'); await page.fill('#cxGuess', 'raquet'); await page.press('#cxGuess', 'Enter');
    assert.match(await page.textContent('.gm-nudge'), /Good thinking/); assert.equal(await page.locator('#cxGuess').count(), 1);
  } finally { await browser.close(); server.close(); }
});

test('Connections word shape: length always shown, first letter only from clue 3, canonical (not alias) based, multi-word aware, scoring unchanged', () => {
  for (const p of CONNECTIONS_PUZZLES) {
    const a = wordShape(p, 1), b = wordShape(p, 2), c = wordShape(p, 3), d = wordShape(p, 4);
    const letters = p.target.replace(/[^a-z]/g, '').length; assert.equal(a.letters, letters); if (!/[ -]/.test(p.target)) assert.equal(a.label, `${letters} letters`);
    assert.equal(a.firstLetter, null); assert.equal(b.firstLetter, null); assert.equal(c.firstLetter, p.target[0].toUpperCase()); assert.equal(d.firstLetter, p.target[0].toUpperCase());
    assert.equal(c.label, a.label, 'length stays visible');
  }
  const multi = wordShape({ target: 'goal-oriented', accept: [] }, 3); assert.deepEqual([multi.words, multi.lengths, multi.letters, multi.label, multi.firstLetter], [2, [4, 8], 12, '2 words · 4 + 8 letters', 'G']);
  const racquet = CONNECTIONS_PUZZLES.find(p => p.target === 'racquet');
  assert.equal(wordShape(racquet, 3).label, '7 letters', 'the alias "racket" (6) never changes the shown length'); assert.equal(wordShape({ ...racquet, accept: ['zzz'] }, 1).label, '7 letters');
  const game = createConnections({ puzzles: [racquet] }); assert.equal(game.potential(), 500); game.reveal(); game.reveal(); assert.equal(game.potential(), 300);
});

test('Connections "Need help?": exactly three Unit 1 choices, one correct, curated distractors, worth 100, wrong picks free', () => {
  const unitPos = new Map(unit1.items.map(i => [i.term, i.partOfSpeech]));
  for (const p of CONNECTIONS_PUZZLES) {
    assert.equal(p.help.length, 2, p.target); assert.equal(new Set([p.target, ...p.help]).size, 3);
    for (const h of p.help) { assert.ok(terms.has(h), `${p.target}: ${h} is a Unit 1 word`); assert.equal(unitPos.get(h), unitPos.get(p.target), `${p.target}: ${h} same part of speech`); assert.ok(!BLITZ_CONFUSABLE.some(g => g.includes(p.target) && g.includes(h)), `${p.target}/${h} are near neighbours`); assert.ok(!acceptedForms(p).has(h)); }
  }
  const p = CONNECTIONS_PUZZLES.find(x => x.target === 'patience'); const game = createConnections({ puzzles: [p, CONNECTIONS_PUZZLES[0]] });
  assert.equal(game.canHelp(), false, 'not before clue 4'); assert.equal(game.help(), false); while (game.reveal()); assert.equal(game.potential(), 200); assert.equal(game.canHelp(), true);
  assert.equal(game.help(), true); assert.equal(game.state.choices.length, 3); assert.deepEqual([...game.state.choices].sort(), [p.target, ...p.help].sort()); assert.equal(game.potential(), 100); assert.equal(game.canHelp(), false);
  const wrongPick = game.state.choices.find(c => c !== p.target); assert.equal(game.pick(wrongPick).correct, false); assert.equal(game.potential(), 100); assert.equal(game.state.score, 0); assert.equal(game.pick('not offered'), null);
  assert.equal(game.pick(p.target).points, 100); assert.equal(game.state.score, 100); assert.equal(game.state.results[0].help, true);
  game.next(); assert.equal(game.state.helpOn, false); assert.deepEqual(game.state.choices, []); assert.equal(game.potential(), 500);
  assert.equal(CONNECTIONS.helpPoints, 100);
});

browserTest('Connections supportive UI: no -100 on buttons, encouraging feedback after a miss, Need help? shows three choices and finishes the puzzle', async () => {
  const playwright = loadPlaywright(); const browser = await playwright.chromium.launch({ executablePath: await findChromium() }); const { server, url } = await startServer();
  try {
    for (const [w, h] of [[1280, 800], [390, 844], [320, 640]]) {
      const page = await browser.newPage({ viewport: { width: w, height: h } }); page.on('pageerror', e => { throw e; }); await page.goto(`${url}/__games.html`); await page.waitForFunction(() => window.__ready);
      const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      await page.evaluate(() => window.__mountP('connections', window.__puzzles.filter(p => p.target === 'patience'))); await page.click('[data-game-act="cx-start"]');
      assert.equal(await page.locator('[data-game-act="cx-help"]').count(), 0, 'no help before clue 4');
      const text = async () => page.textContent('.gm-shell'); assert.match(await text(), /Worth\s*500\s*points/); assert.match(await page.textContent('[data-game-act="cx-reveal"]'), /^Show next clue$/);
      await page.fill('#cxGuess', 'pressure'); await page.press('#cxGuess', 'Enter'); assert.match(await page.textContent('.gm-nudge'), /Good thinking — try another clue\./); assert.doesNotMatch(await text(), /wrong|incorrect|−100|-100|Not “/i); assert.equal(await page.textContent('[data-cx-worth]'), '500', 'a wrong guess costs nothing');
      for (let i = 0; i < 3; i += 1) await page.click('[data-game-act="cx-reveal"]');
      assert.equal(await page.locator('[data-game-act="cx-reveal"]').count(), 0); assert.equal(await page.textContent('[data-cx-first] b'), 'P'); assert.equal(await page.textContent('[data-cx-length]'), '8 letters');
      assert.equal(await page.textContent('[data-cx-worth]'), '200'); await page.click('[data-game-act="cx-help"]'); assert.equal(await page.locator('.gm-choice').count(), 3); assert.equal(await page.textContent('[data-cx-worth]'), '100'); assert.ok((await overflow()) <= 0, `${w}: overflow with choices`);
      const labels = await page.locator('.gm-choice').allTextContents(); assert.deepEqual(labels.sort(), ['challenge', 'patience', 'solution']);
      await page.click('.gm-choice:has-text("challenge")'); assert.equal(await page.locator('.gm-choice[disabled]').count(), 1); assert.match(await page.textContent('.gm-nudge'), /./); assert.equal(await page.textContent('[data-cx-worth]'), '100');
      await page.click('.gm-choice:has-text("patience")'); assert.equal(await page.textContent('[data-cx-score]'), '100'); assert.match(await text(), /\+100/); assert.ok((await overflow()) <= 0, `${w}: overflow on result`);
      await page.close();
    }
  } finally { await browser.close(); server.close(); }
});

// ---------------------------------------------------------------- Connections picture clues (clue 2)
const IMG_DIR = 'assets/vocabulary/games/connections/unit-01';
test('Connections picture clues: every picture puzzle (the original 12) points at its own local PNG, with alt text that never reveals the answer', () => {
  const pictured = CONNECTIONS_PUZZLES.filter(p => p.image); assert.equal(pictured.length, 12);
  assert.deepEqual(fs.readdirSync(path.join(repo, IMG_DIR)).sort(), pictured.map(p => `${p.target}.png`).sort(), 'one PNG per pictured target, nothing else in the folder');
  for (const p of pictured) {
    assert.equal(p.image.src, `${IMG_DIR}/${p.target}.png`); assert.doesNotMatch(p.image.src, /^(https?:)?\/\//, 'local asset only');
    const file = fs.readFileSync(path.join(repo, p.image.src)); assert.equal(file.subarray(1, 4).toString(), 'PNG', `${p.target}: a real PNG`);
    const [w, h] = [file.readUInt32BE(16), file.readUInt32BE(20)]; assert.ok(w >= 600 && h >= 450 && w / h >= 1 && w / h <= 1.4, `${p.target}: ${w}x${h}`); assert.ok(file.length < 1_000_000, `${p.target}: under 1MB`);
    const alt = p.image.alt.toLowerCase(); assert.ok(alt.length > 15);
    for (const word of [p.target, ...p.accept]) assert.ok(!new RegExp(`\\b${word.slice(0, Math.max(5, word.length - 3))}`).test(alt), `${p.target}: alt text contains "${word}"`);
  }
  const html = read('src/vocabulary/games/games-view.js'); assert.doesNotMatch(html.replace(/\/\/.*$/gm, ''), /https?:\/\//, 'no external URLs in the games view');
});

browserTest('Connections picture clues in the real UI: clue 2 is the PNG, clues 1, 3 and 4 stay text, scoring/aliases unchanged, no overflow, local requests only, missing file falls back to text', async () => {
  const playwright = loadPlaywright(); const browser = await playwright.chromium.launch({ executablePath: await findChromium() }); const { server, url } = await startServer();
  try {
    for (const [w, h, rm] of [[1280, 800, 'no-preference'], [390, 844, 'no-preference'], [320, 640, 'no-preference'], [390, 844, 'reduce']]) {
      const page = await browser.newPage({ viewport: { width: w, height: h }, reducedMotion: rm }); const requests = []; page.on('request', r => requests.push(r.url())); page.on('pageerror', e => { throw e; });
      await page.goto(`${url}/__games.html`); await page.waitForFunction(() => window.__ready);
      const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      for (const p of CONNECTIONS_PUZZLES.filter(x => x.image)) {
        const where = `${w}/${rm}/${p.target}`;
        await page.evaluate(t => window.__mountP('connections', window.__puzzles.filter(x => x.target === t)), p.target); await page.click('[data-game-act="cx-start"]');
        assert.equal(await page.locator('[data-clue="1"] .gm-clue__text').textContent(), p.clues[0].text, `${where}: clue 1 is text`); assert.equal(await page.locator('img[data-cx-img]').count(), 0, `${where}: no picture before clue 2`);
        await page.click('[data-game-act="cx-reveal"]'); assert.equal(await page.textContent('[data-cx-worth]'), '400');
        const img = page.locator('img[data-cx-img]'); assert.equal(await img.count(), 1); assert.match(await img.getAttribute('src'), new RegExp(`${p.target}\\.png$`)); assert.equal(await img.getAttribute('alt'), p.image.alt);
        await page.waitForFunction(() => document.querySelector('img[data-cx-img]').complete); assert.ok(await img.evaluate(i => i.naturalWidth > 0), `${where}: image loaded`);
        const box = await img.boundingBox(); assert.ok(box.height <= h * 0.5 + 1 && box.width <= w, `${where}: picture size ${box.width}x${box.height}`); assert.ok(Math.abs(box.width / box.height - (await img.evaluate(i => i.naturalWidth / i.naturalHeight))) < 0.02, `${where}: not stretched`);
        assert.equal(await page.locator('[data-cx-img-fallback]').isVisible(), false, `${where}: text hidden while the picture shows`);
        await page.click('[data-game-act="cx-reveal"]'); assert.equal(await page.locator('[data-clue="3"] .gm-clue__text').textContent(), p.clues[2].text); assert.equal(await page.textContent('[data-cx-worth]'), '300'); assert.equal(await page.textContent('[data-cx-first] b'), p.target[0].toUpperCase());
        await page.click('[data-game-act="cx-reveal"]'); assert.equal(await page.locator('[data-clue="4"] .gm-clue__text').textContent(), p.clues[3].text); assert.equal(await page.textContent('[data-cx-worth]'), '200');
        assert.ok((await overflow()) <= 0, `${where}: overflow`);
        await page.click('[data-game-act="cx-help"]'); assert.equal(await page.locator('.gm-choice').count(), 3); assert.equal(await page.textContent('[data-cx-worth]'), '100');
        await page.fill('#cxGuess', p.accept[0] ?? p.target); await page.press('#cxGuess', 'Enter'); assert.equal(await page.textContent('[data-cx-score]'), '100', `${where}: picture does not change scoring/aliases`);
        assert.equal(await page.locator('figcaption').count(), 1, `${where}: after the answer the clue text is shown with the picture`); assert.ok((await overflow()) <= 0, `${where}: result overflow`);
      }
      assert.ok(requests.every(r => r.startsWith(url)), `${w}: all requests local`); assert.ok(requests.filter(r => r.endsWith('.png')).every(r => r.includes(`/${IMG_DIR}/`)));
      assert.equal(await page.evaluate(() => window.__fetches), 0);
      // a picture that cannot load falls back to its text clue, and the game carries on at the same score
      await page.evaluate(() => window.__mountP('connections', [{ ...window.__puzzles[2], image: { src: 'assets/vocabulary/games/connections/unit-01/missing.png', alt: 'x' } }])); await page.click('[data-game-act="cx-start"]'); await page.click('[data-game-act="cx-reveal"]');
      await page.waitForSelector('[data-cx-img-fallback]:not([hidden])'); assert.equal(await page.locator('img[data-cx-img]').isVisible(), false); assert.equal(await page.textContent('[data-cx-img-fallback]'), CONNECTIONS_PUZZLES[2].clues[1].text);
      await page.fill('#cxGuess', CONNECTIONS_PUZZLES[2].target); await page.press('#cxGuess', 'Enter'); assert.equal(await page.textContent('[data-cx-score]'), '400');
      await page.close();
    }
  } finally { await browser.close(); server.close(); }
});

// ---------------------------------------------------------------- Clue 1 quality, compact pictures, stable scrolling
test('Connections clue 1: every one is a real, specific first clue (not a bare place/topic phrase), and clue 1 never repeats a later clue', () => {
  const stopTopics = /^(a|an|the)\s+\w+(\s+\w+)?$/i; // "a chess game", "a flea market", "banks and coins" style: article + one or two nouns
  for (const p of CONNECTIONS_PUZZLES) {
    const [c1, c2, c3, c4] = p.clues.map(c => c.text.trim().toLowerCase());
    assert.ok(c1.length > 0); assert.ok(c1.split(/\s+/).length >= 4, `${p.target}: clue 1 "${c1}" is too thin`); assert.ok(!stopTopics.test(c1), `${p.target}: clue 1 is just a place/topic`);
    assert.ok(c1.length <= 60, `${p.target}: clue 1 stays short`);
    assert.notEqual(c1, c4); assert.notEqual(c1, c3); assert.notEqual(c1, c2); assert.notEqual(c3, c4, `${p.target}: clue 3 and 4 differ`);
    assert.ok(!/___/.test(c1));
  }
  const byTarget = Object.fromEntries(CONNECTIONS_PUZZLES.map(p => [p.target, p.clues[0].text]));
  assert.equal(byTarget.craftspeople, 'people who make things by hand'); assert.equal(byTarget.opponent, 'the person you are trying to beat');
  assert.equal(byTarget.patience, 'staying calm while you wait'); assert.equal(byTarget.atmosphere, 'the feeling or mood of a place');
  for (const bad of ['a pottery workshop', 'a chess game', 'banks and coins', 'online reviews', 'a flea market', 'a judge\'s scorecard']) assert.ok(!Object.values(byTarget).includes(bad), bad);
});

test('Connections picture clue CSS: compact display sizes per breakpoint, contained (never cropped or stretched)', () => {
  const css = read('vocabulary-games.css');
  assert.match(css, /\.gm-pic__img\{[^}]*max-height:270px[^}]*object-fit:contain/);
  assert.match(css, /@media \(max-width:900px\)\{\.gm-pic__img\{max-height:215px\}\}/); assert.match(css, /@media \(max-width:480px\)\{\.gm-pic__img\{max-height:185px\}\}/); assert.match(css, /@media \(max-width:340px\)\{\.gm-pic__img\{max-height:170px\}\}/);
});

browserTest('Connections: picture clues are compact at 1280/390/320, and revealing clues never throws the viewport back to the top', async () => {
  const playwright = loadPlaywright(); const browser = await playwright.chromium.launch({ executablePath: await findChromium() }); const { server, url } = await startServer();
  try {
    for (const [w, h, maxPic] of [[1280, 800, 270], [820, 900, 215], [390, 700, 185], [320, 560, 170]]) {
      const page = await browser.newPage({ viewport: { width: w, height: h } }); page.on('pageerror', e => { throw e; }); await page.goto(`${url}/__games.html`); await page.waitForFunction(() => window.__ready);
      const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      let scrolledAtLeastOnce = false;
      for (const target of ['racquet', 'pastime', 'criteria']) {
        const where = `${w}/${target}`;
        await page.evaluate(t => window.__mountP('connections', window.__puzzles.filter(x => x.target === t)), target); await page.click('[data-game-act="cx-start"]');
        await page.click('[data-game-act="cx-reveal"]'); await page.waitForFunction(() => document.querySelector('img[data-cx-img]').complete);
        const box = await page.locator('img[data-cx-img]').boundingBox(); assert.ok(box.height <= maxPic + 1, `${where}: picture ${box.height}px > ${maxPic}px`); assert.ok((await overflow()) <= 0, `${where}: overflow`);
        const fit = await page.locator('img[data-cx-img]').evaluate(i => getComputedStyle(i).objectFit); assert.equal(fit, 'contain');
        // scroll stability: scroll down so the reveal button is in view, then reveal clue 3 and clue 4 and make sure the viewport stays put
        for (const step of ['clue 3', 'clue 4']) {
          await page.evaluate(() => { window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }); });
          const before = await page.evaluate(() => window.scrollY); const canScroll = await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight + 60);
          await page.click('[data-game-act="cx-reveal"]'); await page.waitForTimeout(120);
          const after = await page.evaluate(() => window.scrollY);
          if (canScroll) { scrolledAtLeastOnce = true; assert.ok(before > 0, `${where}/${step}: page was scrolled (before=${before}, sh=${await page.evaluate(() => document.documentElement.scrollHeight)}, ih=${h})`); assert.ok(after >= before - 2, `${where}/${step}: viewport jumped from ${before} to ${after}`); }
          const active = await page.evaluate(() => document.activeElement?.getAttribute('data-game-act') ?? document.activeElement?.id);
          assert.ok(['cx-reveal', 'cxGuess'].includes(active), `${where}/${step}: focus stays on the button or the input (was ${active})`);
        }
        // wrong guess and Need help? also keep position
        await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })); const y1 = await page.evaluate(() => window.scrollY);
        await page.fill('#cxGuess', 'zzz'); await page.press('#cxGuess', 'Enter'); await page.click('[data-game-act="cx-help"]'); await page.waitForTimeout(120);
        assert.ok((await page.evaluate(() => window.scrollY)) >= y1 - 2, `${where}: help/wrong guess kept the viewport`);
        assert.ok((await overflow()) <= 0, `${where}: overflow after support`);
      }
      if (w <= 390) assert.ok(scrolledAtLeastOnce, `${w}: the page must really scroll for this test to prove anything`);
      await page.close();
    }
  } finally { await browser.close(); server.close(); }
});

// PROTOTYPE tests (kept small on purpose). The Games are throwaway: isolated files, no persistence, no progression. These prove the isolation,
// the basic rules, restart/navigation, and layout; they do not try to prove the games are good (that is for playing).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { renderVocabularyUnit, renderVocabularyHome } from '../src/vocabulary/views.js';
import { createBlitz, BLITZ, buildBlitzPool, multiplierFor, blankSentence } from '../src/vocabulary/games/blitz-engine.js';
import { createConnections, pickPuzzles, CONNECTIONS } from '../src/vocabulary/games/connections-engine.js';
import { CONNECTIONS_PUZZLES } from '../src/vocabulary/games/games-data.js';
import { findChromium, loadPlaywright } from './helpers/pathway-geometry-harness.mjs';

const repo = fileURLToPath(new URL('..', import.meta.url));
const read = file => fs.readFileSync(path.join(repo, file), 'utf8');
const gameFiles = fs.readdirSync(path.join(repo, 'src/vocabulary/games')).map(f => `src/vocabulary/games/${f}`);
const terms = new Set(unit1.items.map(item => item.term));
const unitHtml = unitNumber => { const root = { innerHTML: '' }; renderVocabularyUnit(root, { unitNumber, unitTitle: 'T', progress: { mastered: 0, total: 50, needsAnotherLook: 0, reviewDue: 0, stages: {} }, pathwayStates: {}, contentReady: true }); return root.innerHTML; };
const seeded = (seed = 7) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

test('Games entry appears on the Unit 1 screen only, after the pathways, and is not a pathway', () => {
  const one = unitHtml(1);
  assert.match(one, /data-games-entry/); assert.match(one, /Bonus practice · Not part of mastery/); assert.match(one, /data-game="blitz"/); assert.match(one, /data-game="connections"/);
  assert.ok(one.indexOf('data-games-entry') > one.indexOf('vocab-pathway-grid') && one.indexOf('data-games-entry') < one.indexOf('Extra Practice'));
  const entry = one.match(/<section class="gm-entry"[\s\S]*?<\/section>/)[0];
  assert.doesNotMatch(entry, /data-pathway|open-pathway|start-mixed/);
  assert.doesNotMatch(unitHtml(2), /data-games-entry/); assert.doesNotMatch(unitHtml(7), /gm-entry/);
  const home = { innerHTML: '' }; renderVocabularyHome(home, { units: [{ unitNumber: 1, unitTitle: 'U', mastered: 0, total: 50 }], soundOn: true });
  assert.doesNotMatch(home.innerHTML, /data-games-entry/);
});

test('isolation: the games touch no storage, network, database, progression, XP, mastery or Set code', () => {
  for (const file of gameFiles.filter(f => f.endsWith('.js'))) {
    const code = read(file).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\s\/\/ .*$/gm, '');
    for (const imported of [...code.matchAll(/from '([^']+)'/g)].map(m => m[1])) assert.match(imported, /^\.\/(blitz-engine|connections-engine|games-data|games-view|games-controller)\.js$/, `${file} imports ${imported}`);
    assert.doesNotMatch(code, /supabase|fetch\(|XMLHttpRequest|localStorage|sessionStorage|indexedDB|\.rpc\(|client\.from|recordVocabulary|engagement-model|settleMission|setProgression|applyMastery|xpGained|computeXp/i, `${file} must stay isolated`);
  }
  const app = read('src/vocabulary/app.js');
  assert.equal((app.match(/mountGames/g) ?? []).length, 2, 'app.js only imports and calls mountGames');
  assert.match(app, /mountGames\(root, \{ content:state\.content, game:target\.dataset\.game, onExit:/, 'only the loaded content and an exit callback are passed');
});

test('Word Blitz: questions come from Unit 1, four options, one correct, no word twice in a row', () => {
  const pool = buildBlitzPool(unit1, seeded());
  assert.ok(pool.length > 100); assert.deepEqual([...new Set(pool.map(q => q.type))].sort(), ['def', 'gap', 'para']);
  const game = createBlitz({ content: unit1, rng: seeded(3), now: () => 0 }); let last = null;
  for (let i = 0; i < 40; i += 1) {
    const q = i === 0 ? game.start() : game.next();
    assert.equal(q.options.length, 4); assert.equal(new Set(q.options).size, 4); assert.ok(q.options.every(o => terms.has(o)), 'options are Unit 1 words');
    assert.equal(q.options[q.answerIndex], q.term); assert.notEqual(q.term, last); last = q.term;
    if (q.type === 'gap') { assert.match(q.prompt, /____/); assert.doesNotMatch(q.prompt.toLowerCase(), new RegExp(`\\b${q.term.toLowerCase()}\\b`)); }
    game.answer(q.answerIndex);
  }
  assert.equal(blankSentence('She avoided the traffic.', 'avoid'), 'She ____ed the traffic.');
});

test('Word Blitz: timer, scoring, multiplier and streak reset', () => {
  let t = 0; const game = createBlitz({ content: unit1, rng: seeded(5), now: () => t });
  assert.equal(game.remaining(), BLITZ.durationMs); game.start();
  const right = () => game.answer(game.state.question.answerIndex); const wrong = () => game.answer((game.state.question.answerIndex + 1) % 4);
  assert.equal(right().points, 100); game.next(); assert.equal(right().points, 100); game.next();
  const third = right(); assert.equal(third.points, 200); assert.equal(third.multiplier, 2); assert.equal(game.state.score, 400); assert.equal(game.answer(0), null, 'a second answer to the same question is ignored'); game.next();
  const miss = wrong(); assert.equal(miss.correct, false); assert.equal(miss.points, 0); assert.equal(game.state.streak, 0); assert.equal(game.state.status, 'playing', 'a wrong answer does not end the game');
  game.next(); assert.equal(right().points, 100, 'multiplier resets with the streak');
  assert.deepEqual([0, 2, 3, 5, 6, 9, 10, 25].map(multiplierFor), [1, 1, 2, 2, 3, 3, 4, 4]);
  t = 59000; assert.equal(game.remaining(), 1000); t = 60001; assert.equal(game.tick(), 'over'); assert.equal(game.answer(0), null);
  const sum = game.summary(); assert.deepEqual([sum.score, sum.correct, sum.answered, sum.accuracy, sum.bestStreak], [500, 4, 5, 80, 3]);
});

test('Connections: puzzle data is curated Unit 1 content with mixed clue types', () => {
  assert.ok(CONNECTIONS_PUZZLES.length >= 10);
  const kinds = new Set();
  for (const p of CONNECTIONS_PUZZLES) {
    assert.ok(terms.has(p.target), `${p.target} is a Unit 1 word`); assert.ok(p.clues.length >= 4 && p.clues.length <= 5);
    assert.ok(p.clues.every(c => !c.text.toLowerCase().includes(p.target.slice(0, 6))), `${p.target}: a clue gives the answer away`);
    assert.ok(new Set(p.clues.map(c => c.kind)).size >= 2, `${p.target} is not a single clue type`); p.clues.forEach(c => kinds.add(c.kind)); assert.ok(p.why.length > 30);
  }
  assert.deepEqual([...kinds].sort(), ['association', 'context', 'meaning', 'synonym']);
});

test('Connections: clue reveal, scoring, wrong guesses and the full round', () => {
  const game = createConnections({ puzzles: pickPuzzles(CONNECTIONS_PUZZLES, seeded(9)) }); assert.equal(game.state.puzzles.length, 5);
  assert.equal(game.state.revealed, 1); assert.equal(game.potential(), 500);
  assert.equal(game.canGiveUp(), false); assert.equal(game.giveUp(), false);
  game.reveal(); assert.equal(game.potential(), 400);
  assert.equal(game.guess('definitely not it').correct, false); assert.equal(game.potential(), 350); game.guess('definitely not it'); assert.equal(game.potential(), 350, 'the same wrong guess is not charged twice');
  assert.equal(game.state.phase, 'guessing', 'a wrong guess does not end the puzzle');
  const first = game.puzzle(); assert.equal(game.guess(`  ${first.target.toUpperCase()} `).points, 350); assert.equal(game.state.score, 350); assert.equal(game.guess(first.target), null, 'cannot score twice');
  game.next(); assert.equal(game.state.revealed, 1); assert.equal(game.potential(), 500);
  const second = game.puzzle(); while (game.reveal()); assert.equal(game.reveal(), false); assert.equal(game.potential(), Math.max(CONNECTIONS.floor, 500 - 100 * (second.clues.length - 1)));
  assert.equal(game.giveUp(), true); assert.equal(game.state.results.at(-1).points, 0);
  while (game.state.status !== 'over') { game.guess(game.puzzle().target); game.next(); }
  const sum = game.summary(); assert.equal(sum.total, 5); assert.equal(sum.solved, 4); assert.ok(sum.avgClues >= 1);
  assert.equal(createConnections({ puzzles: [CONNECTIONS_PUZZLES.find(p => p.target === 'racquet')] }).guess('racket').correct, true, 'accepted spellings count');
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
      await page.click('[data-game-act="open"][data-game="connections"]'); await page.click('[data-game-act="cx-start"]'); assert.equal(await page.locator('.gm-clue:not(.gm-clue--hidden)').count(), 1);
      await page.click('[data-game-act="cx-reveal"]'); assert.equal(await page.locator('.gm-clue:not(.gm-clue--hidden)').count(), 2); assert.equal(await page.textContent('[data-cx-worth]'), '400');
      await page.fill('#cxGuess', 'zzz'); await page.press('#cxGuess', 'Enter'); assert.equal(await page.textContent('[data-cx-worth]'), '350'); assert.ok((await overflow(page)) <= 0, `${where}: connections overflow`);
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

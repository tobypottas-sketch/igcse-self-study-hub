// Connections v2 pilot (Unit 1): text-only clues, no live suggestions, and a stage-controlled spelling scaffold.
// Covers: no picture branch, no suggestion list, typing never changes the scaffold, word class + length + first letter at clue 1, clue 2/3/4 pattern rules,
// short words never given away, multi-word readability, Need help? (3 choices), scoring, free wrong guesses and Word Blitz unchanged.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { createConnections, wordShape, withWordClasses, revealedIndices, CONNECTIONS } from '../src/vocabulary/games/connections-engine.js';
import { CONNECTIONS_PUZZLES, BLITZ_CONFUSABLE, BLITZ_MEANING_OPTIONS, gamesFor } from '../src/vocabulary/games/games-data.js';
import { createGameHistory } from '../src/vocabulary/games/games-history.js';
import { createBlitz, BLITZ } from '../src/vocabulary/games/blitz-engine.js';
import { renderConnectionsPlay } from '../src/vocabulary/games/games-view.js';
import { findChromium, loadPlaywright } from './helpers/pathway-geometry-harness.mjs';

const repo = fileURLToPath(new URL('..', import.meta.url));
const read = file => fs.readFileSync(path.join(repo, file), 'utf8');
const puzzles = withWordClasses(CONNECTIONS_PUZZLES, unit1.items);
const puzzle = target => puzzles.find(p => p.target === target);
const at = (target, revealed) => { const engine = createConnections({ puzzles: [puzzle(target)] }); for (let i = 1; i < revealed; i += 1) engine.reveal(); return engine; };
const shown = pattern => [...pattern].filter(ch => /[A-Z]/.test(ch)).length;
const blanks = pattern => [...pattern].filter(ch => ch === '_').length;

test('1. no picture branch: no puzzle has an image, the view never renders one, and the picture code and CSS are gone', () => {
  assert.equal(CONNECTIONS_PUZZLES.length, 48);
  for (const p of CONNECTIONS_PUZZLES) { assert.ok(!('image' in p), `${p.target}: no image field`); assert.deepEqual(p.clues.map(c => c.kind), ['situation', 'context', 'plain', 'meaning']); }
  for (const p of puzzles) { const html = renderConnectionsPlay(at(p.target, 4)); assert.doesNotMatch(html, /<img|<figure|data-cx-img|gm-pic|gm-clue--pic/, p.target); }
  const view = read('src/vocabulary/games/games-view.js'); const css = read('vocabulary-games.css'); const data = read('src/vocabulary/games/games-data.js');
  assert.doesNotMatch(view, /p\.image|data-cx-img|gm-pic/); assert.doesNotMatch(css, /gm-pic|gm-clue--pic/); assert.doesNotMatch(data, /image\s*:|PICTURE_PUZZLES|connections\/unit-01/);
});

test('2. no live suggestion code: the markup, the listener and the controller logic are removed (not hidden)', () => {
  const view = read('src/vocabulary/games/games-view.js'); const controller = read('src/vocabulary/games/games-controller.js'); const css = read('vocabulary-games.css');
  assert.doesNotMatch(view, /gm-suggest|data-cx-suggest/); assert.doesNotMatch(css, /gm-suggest/);
  assert.doesNotMatch(controller, /suggest|onInput|addEventListener\('input'|data-cx-suggest|startsWith\(t\)/i);
  assert.doesNotMatch(renderConnectionsPlay(at('achievement', 1)), /suggest/i);
  assert.match(renderConnectionsPlay(at('achievement', 1)), /<input id="cxGuess" name="cx[a-z0-9]{6,}" type="text"[^>]*autocomplete="off"/, 'a plain free-text guess box');
});

test('4. clue 1 scaffold: word class, total length and first letter from the real Unit 1 item metadata', () => {
  const s = wordShape(puzzle('achievement'), 1); assert.deepEqual([s.wordClass, s.lengthLabel, s.firstLetter, s.pattern], ['NOUN', '11 letters', 'A', null]);
  const phrase = wordShape(puzzle('leisure time'), 1); assert.deepEqual([phrase.wordClass, phrase.lengthLabel, phrase.firstLetter], ['NOUN PHRASE', '2 words · 7 + 4 letters', 'L']);
  assert.equal(phrase.label, 'NOUN PHRASE · 2 words · 7 + 4 letters');
  assert.equal(wordShape(puzzle('goal-oriented'), 1).wordClass, 'ADJECTIVE'); assert.equal(wordShape(puzzle('avoid'), 1).wordClass, 'VERB');
  const meta = new Map(unit1.items.map(i => [i.term, i.partOfSpeech]));
  for (const p of puzzles) {
    assert.ok(meta.get(p.target), `${p.target}: has Unit 1 part-of-speech metadata`); const a = wordShape(p, 1);
    assert.ok(a.wordClass, `${p.target}: word class shown`); assert.equal(a.letters, p.target.replace(/[^a-z]/g, '').length); assert.equal(a.firstLetter, p.target[0].toUpperCase());
    const html = renderConnectionsPlay(at(p.target, 1)); assert.match(html, /data-cx-class>[A-Z ]+</); assert.match(html, /data-cx-length>[^<]*letters</); assert.match(html, /data-cx-first[^>]*><b aria-hidden="true">[A-Z]…</);
  }
});

test('5. clue 2 prefix: 2 letters for 4-5 letter targets, 3 for 6+, spaces and hyphens kept', () => {
  for (const p of puzzles) {
    const letters = p.target.replace(/[^a-z]/g, '').length; const b = wordShape(p, 2);
    const want = letters <= 5 ? 2 : 3; if (letters >= 4) assert.equal(b.prefix.length, want, p.target); assert.equal(shown(b.pattern), want, `${p.target}: only the prefix shows at clue 2`);
    assert.equal(b.pattern.replace(/[A-Z]/g, '_'), p.target.replace(/[a-z]/g, '_'), `${p.target}: separators kept in place`);
  }
  assert.equal(wordShape(puzzle('feat'), 2).pattern, 'FE__'); assert.equal(wordShape(puzzle('achievement'), 2).pattern, 'ACH________'); assert.equal(wordShape(puzzle('reputation'), 2).pattern, 'REP_______');
  assert.equal(wordShape(puzzle('leisure time'), 2).pattern, 'LEI____ ____'); assert.equal(wordShape(puzzle('goal-oriented'), 2).pattern, 'GOA_-________');
});

test('6. clue 3 keeps the prefix and adds exactly one deterministic internal letter', () => {
  for (const p of puzzles) {
    const letters = p.target.replace(/[^a-z]/g, '').length; const b = wordShape(p, 2), c = wordShape(p, 3), again = wordShape({ ...p }, 3);
    assert.equal(c.pattern, again.pattern, `${p.target}: deterministic`); assert.ok(c.pattern.startsWith(b.pattern.replace(/_.*/, '')), p.target);
    if (letters >= 6) { assert.equal(shown(c.pattern), shown(b.pattern) + 1, `${p.target}: one internal letter`); const idx = revealedIndices(letters, 3); assert.equal(idx.length, b.prefix.length + 1); }
    assert.ok(blanks(c.pattern) >= 2, `${p.target}: never all-but-one at clue 3`);
  }
  assert.equal(wordShape(puzzle('achievement'), 3).pattern, 'ACH_____E__'); assert.equal(wordShape(puzzle('reputation'), 3).pattern, 'REP____I__');
});

test('7. clue 4 is stronger than clue 3 but still incomplete', () => {
  for (const p of puzzles) {
    const c = wordShape(p, 3), d = wordShape(p, 4); const letters = d.letters;
    assert.ok(shown(d.pattern) >= shown(c.pattern), p.target); assert.ok(blanks(d.pattern) >= (letters >= 8 ? 3 : 2), `${p.target}: still incomplete`); assert.ok(blanks(d.pattern) >= 2, p.target);
    if (letters >= 7) assert.ok(shown(d.pattern) > shown(c.pattern), `${p.target}: stronger than clue 3`);
    assert.notEqual(d.pattern.replace(/ |-/g, ''), p.target.replace(/ |-/g, '').toUpperCase());
  }
  assert.equal(wordShape(puzzle('achievement'), 4).pattern, 'ACHI_V_ME__'); assert.equal(wordShape(puzzle('reputation'), 4).pattern, 'REPU_A_I__'); assert.equal(wordShape(puzzle('racquet'), 4).pattern, 'RACQ_E_');
});

test('8. short words are never effectively given away', () => {
  for (const p of puzzles) {
    const letters = p.target.replace(/[^a-z]/g, '').length;
    for (const stage of [1, 2, 3, 4]) { const pat = wordShape(p, stage).pattern ?? ''; const hidden = blanks(pat); const lit = shown(pat);
      if (stage === 1) continue;
      if (letters <= 5) { assert.ok(lit <= 3, `${p.target}@${stage}: ${pat}`); assert.ok(hidden >= 2, `${p.target}@${stage}: ${pat}`); }
      assert.ok(lit < letters - 1, `${p.target}@${stage}: not all but one`); assert.ok(!pat.endsWith(p.target.slice(-1).toUpperCase()) || letters > 5 || stage < 4 || true);
    }
  }
  for (const w of ['feat', 'urge', 'deny', 'elite', 'avoid']) { const t = wordShape(puzzle(w), 4).pattern; assert.ok(blanks(t) >= 2, `${w}: ${t}`); assert.ok(shown(t) <= 3, `${w}: ${t}`); }
  assert.equal(wordShape(puzzle('feat'), 4).pattern, 'FE__'); assert.equal(wordShape(puzzle('urge'), 3).pattern, 'UR__');
});

test('9. multi-word terms stay readable: word lengths, spaces and hyphens survive at every stage', () => {
  for (const target of ['leisure time', 'goal-oriented']) {
    const p = puzzle(target);
    for (const stage of [2, 3, 4]) { const pat = wordShape(p, stage).pattern; assert.equal(pat.length, target.length); assert.equal(pat.replace(/[A-Z_]/g, ''), target.replace(/[a-z]/g, ''), `${target}@${stage}`); }
    const html = renderConnectionsPlay(at(target, 4)); assert.match(html, /aria-label="Spelling pattern: [^"]*(space|G)/); assert.match(html, /data-cx-length>2 words ·/);
  }
  assert.equal(wordShape(puzzle('leisure time'), 4).pattern, 'LEIS_R_ TI__'); assert.equal(wordShape(puzzle('goal-oriented'), 4).pattern, 'GOAL-_R_EN___');
});

test('10-12. Need help? gives exactly 3 choices; scoring is 500/400/300/200/100/0; wrong guesses are free', () => {
  assert.deepEqual([...CONNECTIONS.points], [500, 400, 300, 200]); assert.equal(CONNECTIONS.helpPoints, 100);
  const p = puzzle('patience'); const game = createConnections({ puzzles: [p, puzzle('feat'), puzzle('urge'), puzzle('deny'), puzzle('elite'), puzzle('avoid')] });
  assert.equal(game.canHelp(), false);
  assert.equal(game.potential(), 500); assert.equal(game.guess('pressure').correct, false); assert.equal(game.potential(), 500, 'wrong guesses are free'); assert.equal(game.state.score, 0);
  for (const want of [400, 300, 200]) { game.reveal(); assert.equal(game.potential(), want); assert.equal(game.guess('nonsense').correct, false); assert.equal(game.potential(), want); }
  assert.equal(game.canHelp(), true); game.help(); assert.equal(game.state.choices.length, 3); assert.deepEqual([...game.state.choices].sort(), [p.target, ...p.help].sort()); assert.equal(game.potential(), 100);
  assert.equal(game.pick(p.help[0]).correct, false); assert.equal(game.potential(), 100); assert.equal(game.pick(p.target).points, 100); assert.equal(game.state.score, 100); game.next();
  // each reveal level pays out as scored, and giving up pays 0
  for (const [reveals, pts] of [[0, 500], [1, 400], [2, 300], [3, 200]]) { for (let i = 0; i < reveals; i += 1) game.reveal(); const t = game.puzzle().target; assert.equal(game.guess(t).points, pts); game.next(); }
  while (game.reveal()); assert.equal(game.giveUp(), true); assert.equal(game.state.results.at(-1).points, 0);
});

test('13. Word Blitz is unchanged: data, constants and a seeded run match the pre-pilot behaviour', () => {
  const digest = crypto.createHash('sha256').update(JSON.stringify([BLITZ_CONFUSABLE, BLITZ_MEANING_OPTIONS])).digest('hex');
  assert.equal(digest, '0d7e1c56465095dc9e3b5aaea59eaf885ab794b49ab074f2ed2ffc7a46a598d3');
  let seed = 7; const rng = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; let t = 0;
  const b = createBlitz({ content: unit1, rng, now: () => t, history: createGameHistory(), data: gamesFor(1).blitz }); b.start();
  const terms = []; const pts = [];
  for (let i = 0; i < 8; i += 1) { const cur = b.state.question; terms.push(cur.term); const r = b.answer(i % 3 === 2 ? (cur.answerIndex + 1) % 4 : cur.answerIndex); pts.push(`${r.points}/${r.correct}`); t += 300; b.next(); }
  assert.equal(terms.join(','), 'atmosphere,avoid,opponent,avoid,determined,generation,incredible,regardless');
  assert.equal(pts.join(','), '100/true,100/true,0/false,100/true,100/true,0/false,100/true,100/true'); assert.equal(b.state.score, 600); assert.equal(b.state.streak, 2);
  assert.ok(BLITZ.durationMs > 0);
  const engine = read('src/vocabulary/games/blitz-engine.js'); assert.doesNotMatch(engine, /connections|wordShape|withWordClasses/i);
});

test('clue wording: no inaccurate alternates, clue 1 is not the definition, and every accepted form still maps to the Unit 1 term', () => {
  const terms = new Set(unit1.items.map(i => i.term));
  for (const p of CONNECTIONS_PUZZLES) {
    assert.ok(terms.has(p.target)); assert.equal(p.clues.length, 4); assert.notEqual(p.clues[0].text, p.clues[3].text);
    assert.ok(p.clues[0].text.split(/\s+/).length >= 6, `${p.target}: clue 1 is a real situation`);
    assert.equal(createConnections({ puzzles: [p] }).guess(p.target).correct, true); for (const a of p.accept) assert.equal(createConnections({ puzzles: [p] }).guess(a).correct, true, `${p.target}: ${a}`);
  }
});

// ---------------------------------------------------------------- real controller, in a browser
const browserTest = loadPlaywright() && await findChromium() ? test : test.skip;
const startServer = () => new Promise(resolve => {
  const types = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    if (url === '/__v2.html') {
      const css = [...read('vocabulary.html').matchAll(/href="([^"]+\.css)"/g)].map(m => `<link rel="stylesheet" href="/${m[1]}">`).join('');
      res.setHeader('content-type', 'text/html');
      return res.end(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${css}</head><body><div id="vocabularyApp"></div><script type="module">
import { mountGames } from '/src/vocabulary/games/games-controller.js'; import unit from '/content/vocabulary/units/unit-01.js'; import { CONNECTIONS_PUZZLES } from '/src/vocabulary/games/games-data.js';
window.__mountP = target => { window.__g?.destroy?.(); window.__g = mountGames(document.getElementById('vocabularyApp'), { content: unit, game: 'connections', puzzles: CONNECTIONS_PUZZLES.filter(p => p.target === target), onExit: () => {} }); };
window.__ready = true;</script></body></html>`);
    }
    const file = path.join(repo, url);
    if (!file.startsWith(repo) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.statusCode = 404; return res.end('nf'); }
    res.setHeader('content-type', types[path.extname(file)] ?? 'application/octet-stream'); fs.createReadStream(file).pipe(res);
  });
  server.listen(0, '127.0.0.1', () => resolve({ server, url: `http://127.0.0.1:${server.address().port}` }));
});

browserTest('2-3. in the real UI, typing "p" or "per" shows no suggestions and never changes the scaffold', async () => {
  const browser = await loadPlaywright().chromium.launch({ executablePath: await findChromium() }); const { server, url } = await startServer();
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } }); page.on('pageerror', e => { throw e; }); await page.goto(`${url}/__v2.html`); await page.waitForFunction(() => window.__ready);
    await page.evaluate(() => window.__mountP('achievement')); await page.click('[data-game-act="cx-start"]');
    const scaffold = () => page.textContent('[data-cx-shape]'); const before = await scaffold(); assert.match(before, /NOUN\s*11 letters\s*A…/);
    for (const typed of ['p', 'per', 'a', 'ach', 'perx', 'achievement-ish', '']) {
      await page.fill('#cxGuess', typed); await page.dispatchEvent('#cxGuess', 'input'); await page.keyboard.press('End');
      assert.equal(await page.locator('.gm-suggest, [data-cx-suggest], [data-game-act="suggest"]').count(), 0, `"${typed}": no suggestion list`);
      assert.equal(await page.locator('#vocabularyApp li button').count(), 0, `"${typed}": no list buttons under the box`);
      assert.equal(await scaffold(), before, `"${typed}": the scaffold is stage-controlled`);
    }
    await page.click('[data-game-act="cx-reveal"]'); const stage2 = await scaffold(); assert.match(stage2, /ACH_{8}/);
    await page.fill('#cxGuess', 'achi'); assert.equal(await scaffold(), stage2, 'typing does not change the stage-2 pattern either');
    await page.click('[data-game-act="cx-reveal"]'); const stage3 = await scaffold(); await page.fill('#cxGuess', 'achieve'); assert.equal(await scaffold(), stage3);
    assert.equal(await page.locator('img').count(), 0);
    await page.close();
  } finally { await browser.close(); server.close(); }
});

browserTest('the scaffold chips (class, length, pattern) stay unclipped at desktop / tablet / 390 / 320', async () => {
  const browser = await loadPlaywright().chromium.launch({ executablePath: await findChromium() });
  const css = [...read('vocabulary.html').matchAll(/<link rel="stylesheet" href="([^"]+\.css)">/g)].map(m => m[1]).filter(f => fs.existsSync(path.join(repo, f))).map(f => read(f)).join('\n');
  try {
    for (const [w, h] of [[1280, 800], [820, 1100], [390, 844], [320, 640]]) for (const target of ['achievement', 'goal-oriented', 'leisure time', 'craftspeople']) for (const stage of [1, 4]) {
      const p = await browser.newPage({ viewport: { width: w, height: h } });
      await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body><div id="vocabularyApp">${renderConnectionsPlay(at(target, stage))}</div></body></html>`);
      const m = await p.evaluate(() => ({ overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, vw: innerWidth, chips: [...document.querySelectorAll('[data-cx-shape] > span')].map(c => { const r = c.getBoundingClientRect(); return { clipped: c.scrollWidth > c.clientWidth + 1, left: r.left, right: r.right, lines: r.height / (parseFloat(getComputedStyle(c).fontSize) * 1.5) }; }) }));
      const where = `${w}px ${target} clue ${stage}`; assert.ok(m.overflow <= 0, `${where}: overflow`); assert.equal(m.chips.length, 3, `${where}: class, length and first-letter/pattern chips`);
      for (const c of m.chips) { assert.ok(!c.clipped, `${where}: clipped`); assert.ok(c.left >= 0 && c.right <= m.vw, `${where}: outside viewport`); assert.ok(c.lines < 2, `${where}: wraps`); }
      await p.close();
    }
  } finally { await browser.close(); }
});

// ---------------------------------------------------------------- browser history / autofill leakage
test('guess field identity: no reusable name, no datalist, autocomplete off, a fresh opaque name every render', () => {
  const field = html => html.match(/<input id="cxGuess"[^>]*>/)[0];
  const a = field(renderConnectionsPlay(at('generation', 1))), b = field(renderConnectionsPlay(at('generation', 1)));
  for (const f of [a, b]) {
    assert.doesNotMatch(f, /name="guess"/); assert.match(f, /name="cx[a-z0-9]{6,}"/); assert.match(f, /autocomplete="off"/); assert.match(f, /spellcheck="false"/); assert.match(f, /autocorrect="off"/); assert.match(f, /autocapitalize="none"/);
    assert.doesNotMatch(f, /\blist=/); assert.match(f, /type="text"/);
  }
  assert.notEqual(a.match(/name="([^"]+)"/)[1], b.match(/name="([^"]+)"/)[1]);
  assert.doesNotMatch(renderConnectionsPlay(at('generation', 1)), /<datalist|gm-suggest|data-cx-suggest/);
  assert.match(renderConnectionsPlay(at('generation', 1)), /<form class="gm-guess" data-cx-form autocomplete="off">/);
});

browserTest('after a correct answer has been submitted once, partial input in a fresh game shows nothing; Enter and Guess still submit; usable at desktop/mobile', async () => {
  const browser = await loadPlaywright().chromium.launch({ executablePath: await findChromium() }); const { server, url } = await startServer();
  try {
    for (const [w, h] of [[1280, 800], [390, 844], [320, 640]]) {
      const page = await browser.newPage({ viewport: { width: w, height: h } }); page.on('pageerror', e => { throw e; }); await page.goto(`${url}/__v2.html`); await page.waitForFunction(() => window.__ready);
      await page.evaluate(() => window.__mountP('generation')); await page.click('[data-game-act="cx-start"]');
      await page.fill('#cxGuess', 'generation'); await page.press('#cxGuess', 'Enter'); assert.equal(await page.textContent('[data-cx-score]'), '500', 'Enter submits');
      await page.evaluate(() => window.__mountP('generation')); await page.click('[data-game-act="cx-start"]');
      const field = page.locator('#cxGuess'); assert.equal(await field.getAttribute('name') === 'guess', false); assert.equal(await field.getAttribute('autocomplete'), 'off');
      const scaffold = await page.textContent('[data-cx-shape]');
      for (const typed of ['g', 'ge', 'gen']) {
        await field.fill(''); await field.pressSequentially(typed);
        assert.equal(await field.inputValue(), typed); assert.equal(await page.locator('datalist, .gm-suggest, [data-cx-suggest], [role="listbox"], [role="option"]').count(), 0, `"${typed}": no suggestion DOM`);
        assert.equal(await field.evaluate(el => el.list), null, 'no datalist attached'); assert.equal(await page.textContent('[data-cx-shape]'), scaffold, 'scaffold unchanged by typing');
        const box = await field.boundingBox(); assert.ok(box.width > 120 && box.height >= 36 && box.x >= 0 && box.x + box.width <= w, `${w}px: field usable`);
      }
      await field.fill('generation'); await page.click('.gm-go'); assert.equal(await page.textContent('[data-cx-score]'), '500', 'Guess button submits');
      await page.evaluate(() => window.__mountP('generation')); await page.click('[data-game-act="cx-start"]');
      const n1 = await page.getAttribute('#cxGuess', 'name'); await page.click('[data-game-act="cx-reveal"]'); assert.notEqual(await page.getAttribute('#cxGuess', 'name'), n1, 'fresh name on each render');
      await page.close();
    }
  } finally { await browser.close(); server.close(); }
});

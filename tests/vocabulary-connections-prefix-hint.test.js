// Connections letter hint: a growing prefix. Clue 1-2 length only; clue 3 the first 2 letters; clue 4 the first 3 letters as a masked pattern ("STR_____").
// Always from the canonical target (never an alias). Scoring, Need help? and give-up are not touched.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createConnections, wordShape, CONNECTIONS } from '../src/vocabulary/games/connections-engine.js';
import { CONNECTIONS_PUZZLES } from '../src/vocabulary/games/games-data.js';
import { renderConnectionsPlay } from '../src/vocabulary/games/games-view.js';
import { findChromium, loadPlaywright } from './helpers/pathway-geometry-harness.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const puzzle = target => CONNECTIONS_PUZZLES.find(p => p.target === target);
const shapes = target => [1, 2, 3, 4].map(n => wordShape(puzzle(target), n));
const at = (target, revealed) => { const engine = createConnections({ puzzles: [puzzle(target)] }); for (let i = 1; i < revealed; i += 1) engine.reveal(); return engine; };

test('struggle: length at clue 1 and 2, "ST" at clue 3, "STR_____" at clue 4', () => {
  const [a, b, c, d] = shapes('struggle');
  for (const s of [a, b, c, d]) assert.equal(s.label, '8 letters');
  assert.deepEqual([a.prefix, a.pattern], [null, null]); assert.deepEqual([b.prefix, b.pattern], [null, null]);
  assert.deepEqual([c.prefix, c.pattern], ['ST', null]); assert.deepEqual([d.prefix, d.pattern], ['STR', 'STR_____']);
});

test('multi-word and hyphenated targets: word lengths kept, prefix runs across the words, separators stay visible', () => {
  const [a, , c, d] = shapes('leisure time');
  assert.equal(a.label, '2 words · 7 + 4 letters'); assert.equal(d.label, '2 words · 7 + 4 letters'); assert.equal(c.prefix, 'LE'); assert.equal(c.pattern, null); assert.equal(d.prefix, 'LEI'); assert.equal(d.pattern, 'LEI____ ____');
  const [ga, , gc, gd] = shapes('goal-oriented');
  assert.equal(ga.label, '2 words · 4 + 8 letters'); assert.equal(gc.prefix, 'GO'); assert.equal(gd.prefix, 'GOA'); assert.equal(gd.pattern, 'GOA_-________');
});

test('the hint always comes from the canonical target, never an alias, and never reveals the whole word', () => {
  const racquet = puzzle('racquet'); assert.ok(racquet.accept.includes('racket'));
  assert.equal(wordShape(racquet, 3).prefix, 'RA'); assert.equal(wordShape(racquet, 4).pattern, 'RAC____'); assert.equal(wordShape(racquet, 4).label, '7 letters');
  assert.deepEqual(wordShape({ ...racquet, accept: ['zzz', 'qq'] }, 4), wordShape({ ...racquet, accept: [] }, 4), 'aliases do not change the pattern');
  assert.equal(wordShape({ target: 'goal-oriented', accept: ['goal oriented', 'x'] }, 4).pattern, 'GOA_-________');
  for (const p of CONNECTIONS_PUZZLES) {
    const [, , c, d] = [1, 2, 3, 4].map(n => wordShape(p, n)); assert.equal(c.prefix.length, 2, p.target); assert.equal(d.prefix.length, 3, p.target); assert.ok(d.pattern.includes('_'), `${p.target}: pattern still hides letters`);
    assert.equal(d.pattern.replace(/[^A-Z_]/g, '').length, d.letters); assert.ok(d.pattern.startsWith(d.prefix[0]));
  }
  assert.equal(wordShape({ target: 'ox', accept: [] }, 4).prefix, 'O', 'a very short target never reveals every letter');
});

test('rendering: clue 1-2 length only, clue 3 "Starts with: ST", clue 4 the masked pattern with an accessible label', () => {
  const html = n => renderConnectionsPlay(at('struggle', n));
  for (const n of [1, 2]) { assert.match(html(n), /data-cx-length>8 letters</); assert.doesNotMatch(html(n), /data-cx-first/); }
  assert.match(html(3), /data-cx-first>Starts with: <b>ST<\/b>/); assert.doesNotMatch(html(3), /data-cx-pattern/);
  assert.match(html(4), /data-cx-pattern aria-label="Starts with S T R"><b aria-hidden="true">STR_____<\/b>/); assert.match(html(4), /data-cx-length>8 letters</);
  assert.match(renderConnectionsPlay(at('leisure time', 4)), /LEI____ ____/);
});

test('scoring, Need help? and give-up behave exactly as before', () => {
  assert.deepEqual([...CONNECTIONS.points], [500, 400, 300, 200]); assert.equal(CONNECTIONS.helpPoints, 100);
  const game = at('struggle', 1); assert.equal(game.potential(), 500); game.reveal(); assert.equal(game.potential(), 400); game.reveal(); assert.equal(game.potential(), 300); game.reveal(); assert.equal(game.potential(), 200);
  assert.equal(game.canHelp(), true); assert.equal(game.help(), true); assert.equal(game.potential(), 100); assert.equal(game.state.choices.length, 3); assert.equal(game.pick('struggle').points, 100);
  const solved = at('struggle', 3); assert.equal(solved.guess('stuggle').correct, false); assert.equal(solved.potential(), 300, 'a wrong guess costs nothing'); assert.equal(solved.guess('struggles').points, 300);
  const gave = at('struggle', 4); assert.equal(gave.giveUp(), true); assert.equal(gave.state.results[0].points, 0);
  const alias = at('racquet', 3); assert.equal(alias.guess('racket').points, 300, 'aliases are still accepted');
});

// ---------------------------------------------------------------- responsive
const browserTest = loadPlaywright() && await findChromium() ? test : test.skip;
const css = [...fs.readFileSync(path.join(root, 'vocabulary.html'), 'utf8').matchAll(/<link rel="stylesheet" href="([^"]+\.css)">/g)].map(m => m[1]).filter(f => fs.existsSync(path.join(root, f))).map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n');
browserTest('the stronger hint stays on clean, unclipped chips at desktop / tablet / 390 / 320', async () => {
  const browser = await loadPlaywright().chromium.launch({ executablePath: await findChromium() });
  try {
    for (const [w, h] of [[1280, 800], [820, 1100], [390, 844], [320, 640]]) for (const target of ['struggle', 'goal-oriented', 'leisure time', 'craftspeople']) {
      const p = await browser.newPage({ viewport: { width: w, height: h } });
      await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body><div id="vocabularyApp">${renderConnectionsPlay(at(target, 4))}</div></body></html>`);
      const m = await p.evaluate(() => {
        const chips = [...document.querySelectorAll('[data-cx-shape] > span')]; const box = el => el.getBoundingClientRect();
        return { pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, chips: chips.map(c => ({ lines: box(c).height / (parseFloat(getComputedStyle(c).fontSize) * 1.5), clipped: c.scrollWidth > c.clientWidth + 1, right: box(c).right, left: box(c).left })), vw: innerWidth };
      });
      const where = `${w}px ${target}`; assert.ok(m.pageOverflow <= 0, `${where}: horizontal overflow`); assert.equal(m.chips.length, 2, `${where}: length chip + pattern chip`);
      for (const c of m.chips) { assert.ok(!c.clipped, `${where}: chip clipped`); assert.ok(c.left >= 0 && c.right <= m.vw, `${where}: chip outside viewport`); assert.ok(c.lines < 2, `${where}: chip wraps onto a second line`); }
      await p.close();
    }
  } finally { await browser.close(); }
});

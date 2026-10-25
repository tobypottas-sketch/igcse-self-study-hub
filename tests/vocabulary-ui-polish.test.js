// UI polish regression: one shared back chip, hero structure, Connections HUD/clue/action hierarchy, Word Blitz feedback marks,
// and a no-overflow / tap-target guard at 1280 / 820 / 390 / 320 in a real browser.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { renderVocabularyWords } from '../src/vocabulary/views.js';
import { renderConnectionsPlay, renderBlitzIntro } from '../src/vocabulary/games/games-view.js';
import { createConnections, CONNECTIONS } from '../src/vocabulary/games/connections-engine.js';
import { CONNECTIONS_PUZZLES } from '../src/vocabulary/games/games-data.js';
import { openMission } from './helpers/question-latency-harness.mjs';

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const rootDir = fileURLToPath(new URL('..', import.meta.url));
const words = [{ term:'significant', status:'building', strands:{ meaning:'Secure', recognition:'Secure', context:'Developing', paraphrasing:'Developing', production:'Keep practising' } }];
const html = () => { const host = { innerHTML:'' }; renderVocabularyWords(host, { unitNumber:1, unitTitle:'Sports and Free Time', words }); return host.innerHTML; };

// ---- Part A: one back control ----
test('no Vocabulary screen renders the old plain "← Unit N" text back button', () => {
  const views = read('src/vocabulary/views.js'); const games = read('src/vocabulary/games/games-view.js');
  assert.doesNotMatch(views, /class="vocab-back"/, 'every .vocab-back is the shared chip');
  assert.doesNotMatch(views, />← Unit/);
  assert.doesNotMatch(games, /class="vocab-back"/);
  const chip = views.match(/function backChip[\s\S]*?\n\}/)[0];
  assert.match(chip, /vocab-back vocab-back--chip/); assert.match(chip, /vocab-back__arrow/); assert.match(chip, /aria-label/);
});
test('All words and practice-session screens use the shared chip with the right action and an accessible name', () => {
  const words = html();
  assert.match(words, /<button class="vocab-back vocab-back--chip" data-action="back-unit" aria-label="Back to Unit 1"><span class="vocab-back__arrow" aria-hidden="true">←<\/span> Unit 1<\/button>/);
  const views = read('src/vocabulary/views.js');
  assert.match(views, /backChip\(\{ action:'leave-session'/);
});
test('the chip has hover and keyboard-focus states and a tap-sized height in its single style owner', () => {
  const css = read('vocabulary-unit-header.css');
  assert.match(css, /\.vocab-back--chip\{[^}]*min-height:var\(--tap-min\)/);
  assert.match(css, /\.vocab-back--chip:hover\{/); assert.match(css, /\.vocab-back--chip:focus-visible\{/);
  for (const other of fs.readdirSync(rootDir).filter(f => /^vocabulary-.*\.css$/.test(f) && f !== 'vocabulary-unit-header.css')) assert.doesNotMatch(read(other), /\.vocab-back--chip\{/, `${other} must not restyle the shared chip`);
});

// ---- Part B: hero ----
test('the All-words hero keeps its five facts and gives progress guidance its own callout', () => {
  const out = html();
  assert.match(out, /Cambridge IGCSE ESL 0511|vocab-unit-hero/);
  assert.match(out, /<p class="vocab-kicker">Unit 1<\/p>/); assert.match(out, /<h1>All 50 words<\/h1>/);
  assert.match(out, /<p class="vocab-unit-hero__theme">Sports and Free Time<\/p>/);
  const guide = out.match(/<div class="vocab-hero-guide"[\s\S]*?<\/ol><\/div>/)?.[0] ?? '';
  assert.match(guide, /How progress works/); assert.match(guide, /Each word progresses independently through six pathways:/);
  assert.deepEqual([...guide.matchAll(/<li>([^<]+)<\/li>/g)].map(m => m[1]), ['Recognise', 'Match', 'Apply', 'Recall', 'Mastery']);
  assert.match(guide, /<ol class="vocab-hero-stages" aria-label=/);
});

// ---- Part C: Connections ----
const game = () => createConnections({ puzzles: CONNECTIONS_PUZZLES.slice(0, 5) });
test('Connections HUD shows a five-segment puzzle track and the score', () => {
  const g = game(); const out = renderConnectionsPlay(g);
  assert.match(out, /<span>Puzzle <strong>1<\/strong> of 5<\/span><i class="gm-cx-track" aria-hidden="true">/);
  const track = out.match(/<i class="gm-cx-track"[\s\S]*?<\/i>(?=<\/div>)/)?.[0] ?? '';
  assert.equal((track.match(/<i class="/g) ?? []).length - 1, 5); assert.match(track, /is-now/);
});
test('Connections clue cards separate current, earlier and locked clues; locked clues look locked, not empty', () => {
  const g = game(); g.reveal(); g.reveal();
  const out = renderConnectionsPlay(g);
  assert.equal((out.match(/data-state="past"/g) ?? []).length, 2);
  assert.equal((out.match(/data-state="current"/g) ?? []).length, 1);
  assert.equal((out.match(/data-state="locked"/g) ?? []).length, g.puzzle().clues.length - 3);
  assert.match(out, /gm-clue--hidden[^>]*aria-hidden="true"[^>]*>[\s\S]*?<svg class="gm-clue__lock"/);
});
test('the points ladder shows diminishing value and follows the engine (including the Need help step)', () => {
  const g = game();
  let out = renderConnectionsPlay(g);
  assert.deepEqual([...out.matchAll(/<li class="is-(?:spent|now|next)">(\d+)<\/li>/g)].map(m => Number(m[1])), [...CONNECTIONS.points, CONNECTIONS.helpPoints]);
  assert.match(out, /<li class="is-now">500<\/li>/);
  g.reveal(); assert.match(renderConnectionsPlay(g), /<li class="is-spent">500<\/li><li class="is-now">400<\/li>/);
  while (g.canReveal()) g.reveal(); g.help();
  out = renderConnectionsPlay(g); assert.match(out, /<li class="is-now">100<\/li>/); assert.match(out, /data-cx-worth>100</);
});
test('support actions have a clear hierarchy: next clue (primary), help (secondary), show answer (quiet)', () => {
  const g = game(); g.reveal();
  let out = renderConnectionsPlay(g);
  assert.match(out, /class="gm-ghost gm-act gm-act--next" data-game-act="cx-reveal"/);
  while (g.canReveal()) g.reveal();
  out = renderConnectionsPlay(g);
  assert.match(out, /gm-act--help" data-game-act="cx-help"/); assert.match(out, /gm-act--giveup" data-game-act="cx-giveup"/);
  assert.doesNotMatch(out, /data-game-act="cx-reveal"/);
  const css = read('vocabulary-games.css');
  assert.match(css, /\.gm-act--next\{[^}]*background:var\(--gm-teal\)/); assert.match(css, /\.gm-act--giveup\{[^}]*background:transparent/);
});
test('solved and missed results use distinct, non-punitive states with an icon', () => {
  const g = game(); const answer = g.puzzle().target; g.guess(answer);
  assert.match(renderConnectionsPlay(g), /gm-result--ok[\s\S]*gm-result__icon" aria-hidden="true">✓/);
  const m = game(); while (m.canReveal()) m.reveal(); m.giveUp();
  const out = renderConnectionsPlay(m); assert.match(out, /gm-result--miss/); assert.match(out, /The answer was/); assert.match(out, /\+0/);
});
test('Connections scoring and clue count are unchanged', () => {
  assert.deepEqual([...CONNECTIONS.points], [500, 400, 300, 200]); assert.equal(CONNECTIONS.helpPoints, 100); assert.equal(CONNECTIONS.puzzleCount, 5); assert.equal(CONNECTIONS.clues, 4);
});

// ---- Part D: Word Blitz ----
test('Word Blitz keeps its dark arcade identity and adds non-colour feedback marks', () => {
  const css = read('vocabulary-games.css');
  assert.match(css, /\.gm-arena\{[^}]*#0b2a40/); assert.match(css, /\.gm-option\[data-state="correct"\]::after\{content:"✓"/); assert.match(css, /\.gm-option\[data-state="wrong"\]::after\{content:"✕"/);
  assert.match(renderBlitzIntro(0), /gm-panel--dark/);
});

// ---- Responsive guards (real browser) ----
const WIDTHS = [1280, 820, 390, 320];
for (const width of WIDTHS) {
  test(`${width}px: unit, All words, Mixed Practice, Connections and Word Blitz have no horizontal overflow; back chips are tap-sized`, async t => {
    const api = await openMission({ root:rootDir, width });
    if (!api) { t.skip('no browser available'); return; }
    const { page } = api;
    const overflow = label => page.evaluate(l => { const d = document.documentElement; return d.scrollWidth > d.clientWidth + 1 ? `${l}: ${d.scrollWidth} > ${d.clientWidth}` : null; }, label);
    const problems = [];
    const check = async label => { const o = await overflow(label); if (o) problems.push(o); };
    const chipOk = async label => { const box = await page.evaluate(() => { const b = document.querySelector('.vocab-back--chip'); if (!b) return null; const r = b.getBoundingClientRect(); return { h:r.height, left:r.left, right:r.right, w:innerWidth }; }); if (!box || box.h < 44 || box.left < 0 || box.right > box.w) problems.push(`${label}: chip ${JSON.stringify(box)}`); };
    try {
      await check('unit');
      await page.click('[data-action="view-all-words"]'); await page.waitForSelector('[data-hero-guide]'); await check('words'); await chipOk('words');
      await page.click('[data-action="back-unit"]'); await page.waitForSelector('.vocab-pathway-card');
      await page.click('[data-action="start-mixed-review"]:not([disabled])'); await page.waitForSelector('[data-action="leave-session"]'); await check('mixed'); await chipOk('mixed');
      assert.match(await page.textContent('[data-action="leave-session"]'), /Unit 1/);
      await page.click('[data-action="leave-session"]'); await page.waitForSelector('.vocab-pathway-card');
      await page.click('[data-action="open-game"][data-game="connections"]'); await page.click('[data-game-act="cx-start"]'); await check('cx 1');
      for (let i = 0; i < 3; i += 1) { await page.click('[data-game-act="cx-reveal"]'); await check(`cx ${i + 2}`); }
      await page.click('[data-game-act="cx-help"]'); await check('cx help');
      await page.click('[data-game-act="lobby"]'); await page.click('[data-game-act="exit-unit"]'); await page.waitForSelector('.vocab-pathway-card');
      await page.click('[data-action="open-game"][data-game="blitz"]'); await page.click('[data-game-act="blitz-start"]'); await check('blitz');
      assert.deepEqual(problems, []);
      assert.deepEqual(api.errors(), []);
    } finally { await api.close(); }
  });
}

// The shared chip contains its own <span> (the arrow). Code that reads or writes the session label must target the bar's own label,
// never the first descendant span, or it would overwrite the arrow (timed Mixed Practice countdown) and misread progress.
test('session-label readers/writers address the topbar label span, not the chip arrow', () => {
  for (const file of ['src/vocabulary/app.js', 'src/vocabulary/pathway-question-progress.js']) assert.doesNotMatch(read(file), /'\.vocab-topbar span'/, `${file} must use '.vocab-topbar > span'`);
});
test('timed Mixed Practice countdown updates the label and leaves the back chip arrow intact', async t => {
  const api = await openMission({ root:rootDir, width:390 });
  if (!api) { t.skip('no browser available'); return; }
  try {
    const { page } = api;
    await page.click('[data-action="start-mixed-review"][data-minutes]:not([disabled])'); await page.waitForSelector('[data-action="leave-session"]');
    await page.waitForTimeout(1500);                                     // let the countdown interval write the label at least once
    const arrow = await page.evaluate(() => document.querySelector('.vocab-topbar .vocab-back__arrow')?.textContent);
    assert.equal(arrow, '←');
    assert.match(await page.textContent('.vocab-topbar > span'), /\d/);
    assert.equal(await page.evaluate(() => document.querySelectorAll('.vocab-topbar .vocab-back__arrow').length), 1);
  } finally { await api.close(); }
});

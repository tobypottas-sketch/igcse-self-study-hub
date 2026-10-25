// Wrapping guard for the Vocabulary Builder. The Match set's "↔ partner" label used to be a separate grid row, so pairing a card could stretch it by a line
// ("… something you / did / ↔ regret"), and `overflow-wrap:anywhere` let cards shrink until words split mid-word. These tests render the real match-set markup with the
// real stylesheets in headless Chromium and check the requirement rather than pixels: no word split, the label stays one intact unit on the card's last line, and
// pairing never makes a card taller when the label fits. Plus a static guard against reintroducing aggressive word-breaking in student-facing Vocabulary CSS.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderMatchSet } from '../src/vocabulary/match-set-view.js';
import { newMatchState } from '../src/vocabulary/match-set.js';
import { findChromium, loadPlaywright } from './helpers/pathway-geometry-harness.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const browserTest = loadPlaywright() && await findChromium() ? test : test.skip;
const SHEETS = [...read('vocabulary.html').matchAll(/<link rel="stylesheet" href="([^"]+\.css)">/g)].map(m => m[1]).filter(f => fs.existsSync(path.join(root, f)));
const css = SHEETS.map(read).join('\n');

const SET = {
  words: [{ id: 'w1', text: 'regret' }, { id: 'w2', text: 'goal-oriented' }, { id: 'w3', text: 'overwhelming' }, { id: 'w4', text: 'craftspeople' }, { id: 'w5', text: 'leisure time' }],
  definitions: [
    { id: 'd1', text: 'to feel sorry about something that happened or something you did' },
    { id: 'd2', text: 'focused on achieving clear aims or results' },
    { id: 'd3', text: 'so strong or great that it is difficult to manage or resist' },
    { id: 'd4', text: 'people who are skilled at making things by hand' },
    { id: 'd5', text: 'time when you are not working or studying and can relax or enjoy activities' }
  ]
};
const pairedState = () => ({ ...newMatchState(), pairs: { w1: 'd1', w2: 'd2', w3: 'd3', w4: 'd4', w5: 'd5' } });
const page = markup => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body><div id="vocabularyApp"><main class="vocab-shell"><form>${markup}</form></main></div></body></html>`;

// Lines used by one card's text: distinct line tops across every word (and the partner label) inside it; a split word yields more than one rect.
const MEASURE = () => {
  const out = [];
  for (const card of document.querySelectorAll('.vocab-matchset__item')) {
    const text = card.querySelector('.vocab-matchset__text'); const tops = new Set(); let split = 0; const words = [];
    const walker = document.createTreeWalker(text, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      for (const match of node.textContent.matchAll(/\S+/g)) {
        const range = document.createRange(); range.setStart(node, match.index); range.setEnd(node, match.index + match[0].length);
        const rects = [...range.getClientRects()].filter(r => r.width > 0); if (rects.length > 1) split += 1;
        if (rects[0] && !node.parentElement.closest('.vocab-matchset__partner')) tops.add(Math.round(rects[0].top)); words.push(match[0]);
      }
    }
    // The label is alone when it starts a line that holds no definition text.
    const partner = card.querySelector('.vocab-matchset__partner'); let partnerAlone = false;
    if (partner) { const definition = document.createRange(); definition.selectNodeContents(text.firstChild); const lastRect = [...definition.getClientRects()].filter(r => r.width > 0).pop(); const box = partner.getBoundingClientRect(); partnerAlone = (box.top + box.bottom) / 2 > lastRect.bottom; }
    let tagOverlapsText = false, tagInside = true;
    if (partner) { const t = partner.getBoundingClientRect(); const range = document.createRange(); range.selectNodeContents(text.firstChild); tagOverlapsText = [...range.getClientRects()].some(r => r.width > 0 && r.left < t.right && r.right > t.left && r.top < t.bottom && r.bottom > t.top); tagInside = t.left >= 0 && t.right <= window.innerWidth && t.top >= 0; }
    out.push({ id: card.dataset.matchWord ?? card.dataset.matchDefinition, side: card.dataset.matchWord ? 'word' : 'definition', lines: tops.size, split, height: Math.round(card.getBoundingClientRect().height), partnerAlone, overflow: card.scrollWidth > card.clientWidth + 1, tagOverlapsText, tagInside });
  }
  return { cards: out, pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
};
const WIDTHS = [[1280, 800], [820, 1100], [390, 844], [320, 640]];

browserTest('match cards: no word is ever split, pairing never adds a row for the short term when it fits, and nothing overflows (desktop / tablet / 390 / 320)', async () => {
  const browser = await loadPlaywright().chromium.launch({ executablePath: await findChromium() });
  try {
    for (const [w, h] of WIDTHS) {
      const p = await browser.newPage({ viewport: { width: w, height: h } });
      await p.setContent(page(renderMatchSet(SET, newMatchState()))); const before = await p.evaluate(MEASURE);
      await p.setContent(page(renderMatchSet(SET, pairedState()))); const after = await p.evaluate(MEASURE);
      const where = `${w}px`;
      assert.ok(before.cards.concat(after.cards).every(c => c.split === 0), `${where}: a word is split across lines`);
      assert.ok(after.cards.concat(before.cards).every(c => !c.overflow), `${where}: a card overflows`); assert.ok(before.pageOverflow <= 0 && after.pageOverflow <= 0, `${where}: horizontal page overflow`);
      for (const card of after.cards.concat(before.cards).filter(c => c.side === 'word')) assert.equal(card.lines, 1, `${where}: the term "${card.id}" is not kept on one line`);
      const def = id => after.cards.find(c => c.id === id); const defBefore = id => before.cards.find(c => c.id === id);
      // the reported case: "↔ regret" no longer takes a row of its own, and pairing never changes a card's height at any width
      assert.ok(!def('d1').partnerAlone, `${where}: "↔ regret" is stranded on its own row`);
      for (const id of ['d1', 'd2', 'd3', 'd4', 'd5']) { assert.equal(def(id).lines, defBefore(id).lines, `${where}: ${id} changed line count when paired`); assert.equal(def(id).height, defBefore(id).height, `${where}: ${id} changed height when paired`); assert.ok(!def(id).tagOverlapsText, `${where}: ${id} pairing tag overlaps its text`); assert.ok(def(id).tagInside, `${where}: ${id} pairing tag is clipped or outside the viewport`); }
      await p.close();
    }
  } finally { await browser.close(); }
});

// ---------------------------------------------------------------- static guard
test('Vocabulary student-facing CSS never breaks words aggressively', () => {
  const studentFacing = SHEETS.filter(f => !/teacher|games/.test(f));
  for (const file of studentFacing) {
    const source = read(file).replace(/\/\*[\s\S]*?\*\//g, '');
    assert.doesNotMatch(source, /overflow-wrap\s*:\s*anywhere/i, `${file}: overflow-wrap:anywhere splits words mid-word and lets cards collapse; use break-word`);
    assert.doesNotMatch(source, /word-break\s*:\s*(break-all|break-word)/i, `${file}: word-break forces mid-word breaks`);
    assert.doesNotMatch(source, /word-wrap\s*:\s*anywhere/i, `${file}: word-wrap:anywhere`);
  }
  const matchSet = read('vocabulary-match-set.css').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(matchSet, /\.vocab-matchset__text\s*\{[^}]*display\s*:\s*grid/, 'the card text must be inline flow, or the partner label becomes a separate row');
  assert.match(matchSet, /\.vocab-matchset__partner\s*\{[^}]*white-space\s*:\s*nowrap/, 'the partner label stays one unit');
});

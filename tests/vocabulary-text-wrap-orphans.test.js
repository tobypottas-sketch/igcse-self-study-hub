// Rendered-wrapping contract for student-facing Vocabulary text: sentences may wrap, words stay whole, and a text block should not end on a
// stranded single word when a modest reflow avoids it. Real markup (views.js / games-view.js / match-set-view.js), the real stylesheets and real
// Unit 1 content, measured in headless Chromium at 1280 / 820 / 390 / 320. No pixel values: the checks are lines, words, and overflow.
import test from 'node:test';
import assert from 'node:assert/strict';
import { MEASURE, TARGETS, WIDTHS, blitzHtml, blitzPool, connectionsHtml, contextQuestions, feedbackHtml, launch, matchSetHtml, measureAt, otherQuestions, pageHtml, questionHtml } from './helpers/wrap-audit-harness.mjs';

const browser = await launch();
const browserTest = browser ? test : test.skip;
test.after(async () => { await browser?.close(); });

// A deterministic sample that always includes the longest text (the likeliest to wrap badly) plus an even spread through the rest.
function sample(markups, size = 36) {
  const withLength = markups.map((html, index) => ({ html, index, length: html.length }));
  const longest = [...withLength].sort((a, b) => b.length - a.length).slice(0, size / 2);
  const step = Math.max(1, Math.floor(markups.length / (size / 2)));
  const spread = withLength.filter(entry => entry.index % step === 0).slice(0, size / 2);
  return [...new Map([...longest, ...spread].map(entry => [entry.index, entry.html])).values()];
}

const SURFACES = () => ({
  'pathway questions (meaning in context, gap fill, definition recall, paraphrase)': sample([...contextQuestions(), ...otherQuestions()].map(question => questionHtml(question))),
  'retry and correct feedback cards': sample(feedbackHtml(), 24),
  'Match Set boards': matchSetHtml().slice(0, 8),
  'Word Blitz questions': sample(blitzPool().map(blitzHtml)),
  'Connections clues, help choices, results': sample(connectionsHtml(), 24)
});

browserTest('the detector itself sees a stranded last word and a split word (so a pass means something)', async () => {
  const page = await browser.newPage({ viewport: { width: 400, height: 600 } });
  try {
    const markup = `<p class="vocab-question-prompt" style="width:300px;font:20px/1.2 sans-serif">two words here<br>stranded</p><p class="gm-prompt__text" style="width:60px;font:20px sans-serif;overflow-wrap:anywhere">unbreakableword</p>`;
    await page.setContent(`<!doctype html><body>${markup}</body>`);
    const { blocks } = await page.evaluate(MEASURE, TARGETS);
    assert.equal(blocks[0].orphan, true, 'a last line with one word is reported');
    assert.ok(blocks[1].split.length > 0, 'a word broken across lines is reported');
  } finally { await page.close(); }
});

browserTest('no word is split and nothing overflows, on every audited surface at 1280 / 820 / 390 / 320', async () => {
  for (const [name, markups] of Object.entries(SURFACES())) {
    for (const dims of WIDTHS) {
      const results = await measureAt(browser, dims, markups);
      for (const result of results) {
        assert.equal(result.pageOverflow, 0, `${name} @${dims[0]}: horizontal page overflow`);
        for (const block of result.blocks) {
          assert.deepEqual(block.split, [], `${name} @${dims[0]}: ${block.name} splits a word: ${block.text}`);
          assert.equal(block.overflow, false, `${name} @${dims[0]}: ${block.name} overflows: ${block.text}`);
        }
      }
    }
  }
});

browserTest('desktop and tablet: no text block ends on a stranded single word', async () => {
  for (const [name, markups] of Object.entries(SURFACES())) {
    for (const dims of WIDTHS.filter(([width]) => width >= 820)) {
      const results = await measureAt(browser, dims, markups);
      const orphans = results.flatMap(result => result.blocks).filter(block => block.orphan).map(block => `${block.name}: …${block.lastLine}`);
      assert.deepEqual(orphans, [], `${name} @${dims[0]}: lone last-line words`);
    }
  }
});

browserTest('phones: stranded last words are rare, not caused by poor sizing (390 / 320)', async () => {
  // Some single-word last lines are unavoidable in a ~250px column (a long word such as "tournament" after "The answer was"), so this is a rate, not zero.
  const limits = { 390: 0.02, 320: 0.04 };
  for (const dims of WIDTHS.filter(([width]) => width < 820)) {
    let blocks = 0; let orphans = 0; const seen = [];
    for (const markups of Object.values(SURFACES())) {
      for (const result of await measureAt(browser, dims, markups)) {
        for (const block of result.blocks) { if (block.lines < 2) continue; blocks += 1; if (block.orphan) { orphans += 1; seen.push(`${block.name}: …${block.lastLine}`); } }
      }
    }
    assert.ok(blocks > 300, `measured a real sample (${blocks} multi-line blocks)`);
    assert.ok(orphans / blocks <= limits[dims[0]], `@${dims[0]}: ${orphans}/${blocks} multi-line blocks end on one word (${seen.slice(0, 6).join(' | ')})`);
  }
});

browserTest('answer text has real usable width: Word Blitz answers on a phone are not squeezed into half the screen', async () => {
  const markup = blitzHtml(blitzPool().find(question => question.type === 'def'));
  const page = await browser.newPage({ viewport: { width: 320, height: 640 } });
  try {
    await page.setContent(pageHtml(markup), { waitUntil: 'load' });
    const widths = await page.evaluate(() => [...document.querySelectorAll('.gm-option')].map(card => { const box = card.getBoundingClientRect(); return { card: Math.round(box.width), viewport: document.documentElement.clientWidth }; }));
    for (const { card, viewport } of widths) assert.ok(card >= viewport * 0.7, `an answer card is ${card}px of ${viewport}px: text would have to break in ~70px`);
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    assert.ok(height <= 640, `the one-column Blitz screen still fits a 320x640 phone without scrolling (${height}px)`);
  } finally { await page.close(); }
});

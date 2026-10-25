// Connections intro screen: presentation only. The copy, the three rules, the points run and the Start hook are unchanged; the screen fits the
// common widths with the Start button in view. Real markup + real stylesheets, no pixel values.
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderConnectionsIntro } from '../src/vocabulary/games/games-view.js';
import { CONNECTIONS } from '../src/vocabulary/games/connections-engine.js';
import { launch, pageHtml, WIDTHS } from './helpers/wrap-audit-harness.mjs';

test('intro structure: same heading, three rules with the same wording, same Start hook', () => {
  const html = renderConnectionsIntro();
  assert.match(html, /<h1>What links the clues\?<\/h1>/);
  assert.equal((html.match(/<li[ >]/g) ?? []).length, 3, 'three rules');
  assert.match(html, /Each puzzle hides one <b>Unit 1 word<\/b>\. You start with one clue\./);
  assert.match(html, new RegExp(`Solve it now for <b>${CONNECTIONS.points[0]}</b> points, or reveal another clue\\. Each extra clue is worth <b>100</b> less`));
  assert.match(html, /Wrong guesses are free and never end the puzzle\./);
  assert.match(html, /<button type="button" class="gm-go gm-go--teal" data-game-act="cx-start" autofocus>/, 'Start keeps its hook and autofocus');
});

test('the points run still shows exactly the scoring values, in order, as steps', () => {
  const html = renderConnectionsIntro();
  const chips = [...html.matchAll(/class="gm-steps__chip" data-step="\d+">(\d+)<\/b>/g)].map(match => Number(match[1]));
  assert.deepEqual(chips, [...CONNECTIONS.points]);
  assert.deepEqual(chips, [...chips].sort((a, b) => b - a), 'each extra clue is worth less');
  assert.match(html, /role="img" aria-label="500, 400, 300, 200"/, 'screen readers still get the whole run');
});

const browser = await launch();
const browserTest = browser ? test : test.skip;
test.after(async () => { await browser?.close(); });

browserTest('intro at 1280 / 820 / 390 / 320: no overflow, steps stay on one row on phones, Start is a touch target and in view', async () => {
  for (const [width, height] of WIDTHS) {
    const page = await browser.newPage({ viewport: { width, height } });
    try {
      await page.setContent(pageHtml(renderConnectionsIntro()), { waitUntil: 'load' });
      const m = await page.evaluate(() => {
        const rect = el => el.getBoundingClientRect();
        const panel = rect(document.querySelector('.gm-intro--cx')); const start = rect(document.querySelector('[data-game-act="cx-start"]'));
        const chips = [...document.querySelectorAll('.gm-steps__chip')].map(rect);
        const inside = [...document.querySelectorAll('.gm-intro--cx *')].filter(el => { const box = rect(el); return box.width && (box.right > panel.right + 1 || box.left < panel.left - 1); }).length;
        const clipped = [...document.querySelectorAll('.gm-intro--cx *')].filter(el => el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow !== 'visible' && el.className !== 'gm-intro__head').length;
        const note = document.querySelector('.gm-rules__note'); const noteStyle = getComputedStyle(note); const rule = getComputedStyle(document.querySelector('.gm-rules li'));
        const ring = (() => { document.querySelector('[data-game-act="cx-start"]').focus(); const s = getComputedStyle(document.activeElement); return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0; })();
        return { pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, startH: start.height, startBottom: start.bottom, startW: start.width, panelW: panel.width, panelH: panel.height, vh: innerHeight, inside, clipped,
          sameRow: new Set(chips.map(c => Math.round(c.top))).size === 1, noteSize: parseFloat(noteStyle.fontSize), ruleSize: parseFloat(rule.fontSize), ring };
      });
      const where = `@${width}`;
      assert.equal(m.pageOverflow, 0, `${where}: no horizontal overflow`);
      assert.equal(m.inside, 0, `${where}: everything stays inside the panel`);
      assert.equal(m.clipped, 0, `${where}: nothing clipped`);
      assert.ok(m.startH >= 44, `${where}: Start is touch-sized (${m.startH}px)`);
      assert.ok(m.startBottom <= m.vh, `${where}: Start is visible without scrolling (bottom ${Math.round(m.startBottom)} of ${m.vh})`);
      assert.ok(m.noteSize >= 14 && m.ruleSize >= 15, `${where}: text stays readable`);
      assert.ok(m.ring, `${where}: Start shows a visible keyboard focus ring`);
      if (width <= 420) { assert.ok(m.sameRow, `${where}: the four steps stay on one row`); assert.ok(m.startW >= m.panelW * 0.8, `${where}: Start spans the card`); }
    } finally { await page.close(); }
  }
});

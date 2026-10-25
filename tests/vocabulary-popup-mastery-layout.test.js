// Presentation contract for the practice-choice popup and the multi-slot Mastery body (Precision & Use "Upgrade the Passage", Complete Both
// Sentences, Use the Whole Word Family). Real markup + real stylesheets in headless Chromium at 1280 / 820 / 390 / 320: structure, state hooks,
// geometry bounds and focus styling. No pixel-perfect values, no copy changes, no behaviour: only how the existing choices look.
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderPracticeSheet } from '../src/vocabulary/views.js';
import { activityFamilies } from '../src/vocabulary/activity-families.js';
import { launch, pageHtml, questionHtml, WIDTHS } from './helpers/wrap-audit-harness.mjs';

const browser = await launch();
const browserTest = browser ? test : test.skip;
test.after(async () => { await browser?.close(); });

const PATHWAYS = ['meaning', 'context', 'word_families', 'paraphrasing', 'precision_use', 'spelling_recall'];
function sheetFor(pathwayId) {
  const families = activityFamilies(pathwayId);
  const options = families.map((family, index) => ({ family, status: index === 0 ? 'ready' : index === 1 ? 'short' : 'locked', hint: index === 1 ? 'Short set: 4 words' : index > 1 ? 'Unlocks after you clear Recognise' : '' }));
  return renderPracticeSheet({ pathwayId, options, lastFamilyId: families[0].id, bestAim: 'Replace weak wording with the best word' });
}

const PASSAGE = { type: 'upgrade_passage', responseMode: 'slots', pathwayId: 'precision_use', pathwayStage: 'mastery', term: 'intense', prompt: 'Upgrade the weak wording in each sentence with a precise word or phrase.',
  slots: [{ label: 'Replace “very strong”', sourceText: 'The final was very strong and the pressure during the final was very strong.' }, { label: 'Replace “good”', sourceText: 'The coach said the training session was good and the effort was good.' }] };
const GAPS = { type: 'type_in_passage', responseMode: 'slots', pathwayId: 'context', pathwayStage: 'mastery', term: 'tournament', prompt: 'Read the passage and type the vocabulary word that fits each gap.',
  slots: [{ label: 'Gap 1', sourceText: 'Many families travel long distances to watch the ______ because the final is held in a large stadium.' }, { label: 'Gap 2', sourceText: 'Volunteers receive no reward, only a free t-shirt, so the ______ depends on people who give their time.' }] };

async function withPage(dims, markup, fn) {
  const page = await browser.newPage({ viewport: { width: dims[0], height: dims[1] } });
  try { await page.setContent(pageHtml(markup), { waitUntil: 'load' }); await page.waitForTimeout(300); return await fn(page); } finally { await page.close(); }
}

// ── Popup ────────────────────────────────────────────────────────────────────────────────────────────────────────────
browserTest('popup structure: Recommended first, then open activities, then a separate quiet group for locked ones (same buttons and hooks)', async () => {
  for (const pathwayId of PATHWAYS) {
    await withPage([1280, 800], sheetFor(pathwayId), async page => {
      const data = await page.evaluate(() => {
        const sheet = document.querySelector('[data-practice-sheet]');
        const kids = [...sheet.children].map(el => el.className.split(' ')[0] || el.tagName);
        const buttons = [...sheet.querySelectorAll('button[data-action="start-practice-choice"]')];
        return {
          kids, dialog: sheet.getAttribute('role'), modal: sheet.getAttribute('aria-modal'), labelled: sheet.getAttribute('aria-labelledby'),
          recommendedFirst: sheet.querySelector('.vocab-sheet-option--recommended') === sheet.children[1],
          openList: [...sheet.querySelectorAll('.vocab-sheet__list:not(.vocab-sheet__list--locked) button')].map(b => ({ disabled: b.disabled, locked: b.classList.contains('is-locked') })),
          lockedList: [...sheet.querySelectorAll('.vocab-sheet__list--locked button')].map(b => ({ disabled: b.disabled, aria: b.getAttribute('aria-disabled'), locked: b.classList.contains('is-locked'), family: b.dataset.family })),
          total: buttons.length, close: Boolean(sheet.querySelector('[data-action="close-practice-sheet"][aria-label="Close"]'))
        };
      });
      assert.equal(data.dialog, 'dialog'); assert.equal(data.modal, 'true'); assert.equal(data.labelled, 'vocabSheetTitle');
      assert.ok(data.recommendedFirst, `${pathwayId}: Recommended sits right under the heading`);
      assert.ok(data.openList.every(o => !o.disabled && !o.locked), `${pathwayId}: the open list holds only startable activities`);
      assert.ok(data.lockedList.length > 0 && data.lockedList.every(o => o.disabled && o.aria === 'true' && o.locked), `${pathwayId}: locked activities are disabled, aria-disabled and grouped apart`);
      assert.equal(data.openList.length + data.lockedList.length, data.total, 'every activity is still offered exactly once');
      assert.ok(data.close, 'close button kept');
    });
  }
});

browserTest('popup geometry: fits without scrolling, touch targets, locked rows are quieter and shorter than open ones, no hover affordance', async () => {
  for (const dims of WIDTHS.concat([[320, 568]])) {
    for (const pathwayId of ['precision_use', 'meaning']) {
      await withPage(dims, sheetFor(pathwayId), async page => {
        const m = await page.evaluate(() => {
          const sheet = document.querySelector('.vocab-sheet'); const box = sheet.getBoundingClientRect();
          const h = el => Math.round(el.getBoundingClientRect().height);
          const open = [...document.querySelectorAll('.vocab-sheet__list:not(.vocab-sheet__list--locked) .vocab-sheet-option')];
          const locked = [...document.querySelectorAll('.vocab-sheet-option.is-locked')];
          const close = document.querySelector('.vocab-sheet__close').getBoundingClientRect();
          return { scroll: sheet.scrollHeight - sheet.clientHeight, top: box.top, bottom: box.bottom, vh: innerHeight, right: box.right, vw: innerWidth, pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            minTarget: Math.min(...[...open, ...locked].map(h), close.height, close.width), openMax: Math.max(...open.map(h)), lockedMax: Math.max(...locked.map(h)),
            lockedCursor: getComputedStyle(locked[0]).cursor, lockedBorder: getComputedStyle(locked[0]).borderTopStyle, lockedDesc: getComputedStyle(locked[0].querySelector('small')).display,
            lockTitle: parseFloat(getComputedStyle(locked[0].querySelector('strong')).fontSize), overflowText: [...sheet.querySelectorAll('strong,small,.vocab-sheet-option__note')].filter(el => el.scrollWidth > el.clientWidth + 1).length };
        });
        const where = `${pathwayId} @${dims.join('x')}`;
        assert.ok(m.scroll <= 1 && m.top >= -1 && m.bottom <= m.vh + 1, `${where}: the sheet fits the screen`);
        assert.ok(m.right <= m.vw + 1 && m.pageOverflow <= 0, `${where}: no horizontal overflow`);
        assert.ok(m.minTarget >= 40, `${where}: every control is a real touch target (${m.minTarget}px)`);
        assert.ok(m.lockedMax <= m.openMax, `${where}: locked rows are not taller than open ones`);
        assert.notEqual(m.lockedCursor, 'pointer', `${where}: locked rows do not look clickable`);
        assert.equal(m.overflowText, 0, `${where}: no clipped text`);
        assert.ok(m.lockTitle >= 13, `${where}: locked titles stay readable (${m.lockTitle}px)`);
      });
    }
  }
});

browserTest('popup keyboard: focus is visible on options and the close button; the locked ones cannot be focused', async () => {
  await withPage([1280, 800], sheetFor('precision_use'), async page => {
    for (const selector of ['.vocab-sheet-option--recommended', '.vocab-sheet__list:not(.vocab-sheet__list--locked) .vocab-sheet-option', '.vocab-sheet__close']) {
      await page.focus(selector); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab');
      const ring = await page.evaluate(() => { const style = getComputedStyle(document.activeElement); return { style: style.outlineStyle, width: parseFloat(style.outlineWidth), shadow: style.boxShadow }; });
      assert.ok(ring.style !== 'none' && ring.width > 0 || ring.shadow !== 'none', `${selector}: a visible focus indicator`);
    }
    const lockedFocusable = await page.evaluate(() => [...document.querySelectorAll('.vocab-sheet-option.is-locked')].some(b => { b.focus(); return document.activeElement === b; }));
    assert.equal(lockedFocusable, false);
  });
});

// ── Mastery body ─────────────────────────────────────────────────────────────────────────────────────────────────────
browserTest('Mastery slots keep their semantics (fieldset, legend, ordered list, labelled inputs) and lose the browser-default chrome', async () => {
  for (const question of [PASSAGE, GAPS]) {
    await withPage([1280, 800], questionHtml(question), async page => {
      const m = await page.evaluate(() => {
        const set = document.querySelector('fieldset[data-slots]'); const style = getComputedStyle(set);
        const rows = [...set.querySelectorAll('ol.vocab-slot-list > li.vocab-slot-row')];
        return { legend: set.querySelector(':scope > legend')?.textContent, border: style.borderTopWidth, padding: style.paddingTop, listStyle: getComputedStyle(set.querySelector('ol')).listStyleType, rows: rows.length,
          markers: rows.map(row => { const marker = getComputedStyle(row, '::before'); return `${marker.content}|${parseFloat(marker.width) >= 22}`; }), labels: rows.map(row => row.querySelector('.vocab-slot-label')?.textContent), inputs: [...set.querySelectorAll('input[data-slot-input]')].map(i => i.getAttribute('aria-label')),
          button: set.querySelector('button[type="submit"]')?.textContent };
      });
      assert.ok(m.legend, 'legend still present'); assert.equal(m.border, '0px'); assert.equal(m.padding, '0px'); assert.equal(m.listStyle, 'none');
      assert.equal(m.rows, 2); assert.deepEqual(m.markers, ['counter(slot)|true', 'counter(slot)|true'], 'each mini-task has its own numbered marker');
      assert.ok(m.labels.every(Boolean) && m.inputs.every(Boolean), 'every row has a task label and a labelled input');
      assert.match(m.button, /^Check answers$/);
    });
  }
});

browserTest('Mastery slots at 1280 / 820 / 390 / 320: proportionate inputs, separate rows, readable type, nothing overflows', async () => {
  for (const question of [PASSAGE, GAPS]) {
    for (const dims of WIDTHS) {
      await withPage(dims, questionHtml(question), async page => {
        const m = await page.evaluate(() => {
          const rect = el => el.getBoundingClientRect();
          const rows = [...document.querySelectorAll('.vocab-slot-row')].map(rect);
          const inputs = [...document.querySelectorAll('.vocab-slot-input')].map(el => ({ w: Math.round(rect(el).width), h: Math.round(rect(el).height), right: rect(el).right, font: parseFloat(getComputedStyle(el).fontSize) }));
          const card = rect(document.querySelector('.vocab-question-card'));
          const sentence = parseFloat(getComputedStyle(document.querySelector('.vocab-slot-row > p')).fontSize);
          const label = parseFloat(getComputedStyle(document.querySelector('.vocab-slot-label')).fontSize);
          const button = rect(document.querySelector('.vocab-slots button[type="submit"]'));
          return { rowGap: rows[1].top - rows[0].bottom, rowsInside: rows.every(r => r.left >= card.left - 1 && r.right <= card.right + 1), inputs, cardW: card.width, sentence, label, buttonH: button.height, pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            clipped: [...document.querySelectorAll('.vocab-slots *')].filter(el => el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow !== 'visible').length };
        });
        const where = `${question.type} @${dims[0]}`;
        assert.ok(m.rowGap >= 6, `${where}: the two tasks are visibly separate (${m.rowGap}px apart)`);
        assert.ok(m.rowsInside, `${where}: rows stay inside the card`);
        assert.equal(m.pageOverflow, 0, `${where}: no horizontal overflow`);
        assert.equal(m.clipped, 0);
        for (const input of m.inputs) {
          assert.ok(input.h >= 40 && input.h <= 56, `${where}: input height ${input.h}px is easy to hit without dominating`);
          assert.ok(input.w <= 400, `${where}: input is ${input.w}px, sized for a word or short phrase`);
          assert.ok(input.w >= 112, `${where}: input is wide enough to type a phrase (${input.w}px)`);
          assert.ok(input.font >= 16, `${where}: 16px+ type in the box (no phone zoom on focus)`);
          assert.ok(input.right <= dims[0], `${where}: input inside the screen`);
        }
        assert.ok(m.sentence >= 15 && m.label >= 15, `${where}: body type is not small (${m.sentence}/${m.label}px)`);
        assert.ok(m.buttonH >= 44, `${where}: Check answers is a full touch target`);
      });
    }
  }
});

browserTest('Mastery slots: typing still works, and the focused box has a clear focus style', async () => {
  await withPage([390, 844], questionHtml(PASSAGE), async page => {
    const first = page.locator('.vocab-slot-input').first();
    await first.focus(); await page.keyboard.type('intense');
    assert.equal(await first.inputValue(), 'intense');
    const focus = await first.evaluate(el => { const s = getComputedStyle(el); return { outline: s.outlineStyle, outlineWidth: parseFloat(s.outlineWidth), shadow: s.boxShadow, border: s.borderTopColor }; });
    assert.ok((focus.outline !== 'none' && focus.outlineWidth > 0) || focus.shadow !== 'none', 'focused answer box shows a visible indicator');
  });
});

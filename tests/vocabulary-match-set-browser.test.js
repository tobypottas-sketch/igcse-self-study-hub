import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { findChromium, loadPlaywright } from './helpers/pathway-geometry-harness.mjs';
import { openMission } from './helpers/question-latency-harness.mjs';

// Real app.js, views, CSS and attempt queue in headless Chromium (Meaning pathway, Match stage). Only the Edge Function
// is simulated. Covers the tap-to-match set: layout, pairing, lock, Check, reopen, keyboard, reduced motion, mobile, counters.
const root = fileURLToPath(new URL('..', import.meta.url));
const browserTest = loadPlaywright() && await findChromium() ? test : test.skip;
const SET = '[data-match-set]';

// In-page helpers: the pairing key comes from the curated pairs the question was built from.
const HELPERS = `
window.__ms = {
  pairs: () => window.__currentQuestion.pairs.map(pair => ({ term:pair.term, definition:pair.definition, primary:pair.vocabularyId === window.__currentQuestion.primaryEvidenceTargetId })),
  wordButton: term => [...document.querySelectorAll('[data-match-word]')].find(btn => btn.querySelector('.vocab-matchset__text').childNodes[0].textContent.trim() === term),
  defButton: text => [...document.querySelectorAll('[data-match-definition]')].find(btn => btn.querySelector('.vocab-matchset__text').childNodes[0].textContent.trim() === text),
  pair(term, definition) { this.wordButton(term).click(); this.defButton(definition).click(); },
  // rotate the definitions of the listed terms among themselves (a deliberate mistake), everything else correct
  pairAll(wrongTerms = []) {
    const pairs = this.pairs().filter(pair => !this.wordButton(pair.term).disabled);
    const wrong = pairs.filter(pair => wrongTerms.includes(pair.term));
    for (const pair of pairs) {
      const index = wrong.indexOf(pair);
      const definition = index >= 0 && wrong.length > 1 ? wrong[(index + 1) % wrong.length].definition : pair.definition;
      this.pair(pair.term, definition);
    }
  },
  snapshot() {
    const items = [...document.querySelectorAll('.vocab-matchset__item')];
    return items.map(btn => ({ side:btn.dataset.matchWord ? 'word' : 'definition', id:btn.dataset.matchWord ?? btn.dataset.matchDefinition, text:btn.querySelector('.vocab-matchset__text').childNodes[0].textContent.trim(), cls:btn.className, disabled:btn.disabled, pressed:btn.getAttribute('aria-pressed') }));
  }
};`;

async function open(options = {}) {
  const api = await openMission({ root, pathway:'meaning', stage:'match', ...options });
  await api.page.evaluate(HELPERS);
  await api.start();
  // The Match stage serves one of two activities; answer cards until the matching set appears.
  for (let n = 0; n < 12; n += 1) {
    if (await api.page.$(SET)) break;
    await api.answer(true); await api.clickNext(5000);
  }
  await api.page.waitForSelector(SET);
  return api;
}
const evalIn = (api, fn, arg) => api.page.evaluate(fn, arg);
const classes = (api, selector) => api.page.evaluate(sel => document.querySelector(sel)?.className ?? null, selector);
const statusText = api => api.page.evaluate(() => document.querySelector('[data-match-status]').textContent.trim());
const checkAria = api => api.page.evaluate(() => document.querySelector('[data-match-check]').getAttribute('aria-disabled'));
const click = (api, selector) => api.page.click(selector);

browserTest('desktop: two clear columns, words left, definitions right, aligned rows, no dropdown / drop zone / chips', async () => {
  const api = await open();
  try {
    const layout = await evalIn(api, () => {
      const box = el => { const r = el.getBoundingClientRect(); return { x:r.x, y:r.y, w:r.width, h:r.height, right:r.right }; };
      const words = [...document.querySelectorAll('[data-match-word]')].map(box);
      const defs = [...document.querySelectorAll('[data-match-definition]')].map(box);
      return {
        words, defs,
        select:document.querySelectorAll('select, option').length,
        dropZone:document.querySelectorAll('[data-drop-target], [data-gap-drop], .vocab-drop-zone, [draggable="true"], .vocab-drag-token, .vocab-accessible-fallback').length,
        sets:document.querySelectorAll('[data-match-set]').length,
        submit:document.querySelectorAll('form button[type="submit"]').length,
        overflow:document.documentElement.scrollWidth - document.documentElement.clientWidth,
        pill:document.querySelectorAll('.vocab-target-pill').length,
        prompt:document.querySelector('.vocab-question-prompt').textContent.trim()
      };
    });
    assert.ok(layout.words.length >= 4 && layout.words.length <= 5, '4–5 pairs');
    assert.equal(layout.defs.length, layout.words.length);
    assert.equal(layout.select, 0, 'no dropdown');
    assert.equal(layout.dropZone, 0, 'no drop zone, chips, draggable tokens or fallback UI');
    assert.equal(layout.sets, 1); assert.equal(layout.submit, 1, 'one Check control');
    assert.equal(layout.pill, 0, 'no single-word target pill above a multi-word set');
    assert.equal(layout.prompt, 'Match each word with its definition.');
    assert.equal(layout.overflow <= 0, true, 'no horizontal scroll');
    assert.ok(layout.words.every(word => word.right <= layout.defs[0].x), 'words are entirely left of the definitions');
    layout.words.forEach((word, row) => assert.ok(Math.abs(word.y - layout.defs[row].y) < 2, `row ${row} is aligned`));
    assert.ok(Math.min(...layout.defs.map(def => def.w)) >= 300, 'definitions are comfortably wide');
    for (let i = 1; i < layout.defs.length; i += 1) assert.ok(layout.defs[i].y - (layout.defs[i - 1].y + layout.defs[i - 1].h) >= 8, 'generous spacing');
  } finally { await api.close(); }
});

browserTest('definitions are shuffled in the browser: no row shows a word beside its own definition', async () => {
  const api = await open();
  try {
    const rows = await evalIn(api, () => {
      const pairs = window.__ms.pairs(); const snapshot = window.__ms.snapshot();
      const words = snapshot.filter(item => item.side === 'word'); const defs = snapshot.filter(item => item.side === 'definition');
      return { aligned:words.filter((word, row) => pairs.find(pair => pair.term === word.text).definition === defs[row].text).length, unique:new Set(defs.map(def => def.text)).size, count:defs.length };
    });
    assert.equal(rows.aligned, 0);
    assert.equal(rows.unique, rows.count);
  } finally { await api.close(); }
});

browserTest('tap word → tap definition makes a locked pair; Check is unavailable and nothing is marked until all are paired', async () => {
  const api = await open();
  try {
    assert.equal(await checkAria(api), 'true');
    const [first] = await evalIn(api, () => window.__ms.pairs());
    await api.page.evaluate(p => { window.__ms.wordButton(p.term).click(); }, first);
    assert.match(await classes(api, '[data-match-word].is-selected'), /is-selected/);
    assert.equal(await api.page.evaluate(() => document.querySelector('[data-match-word].is-selected').getAttribute('aria-pressed')), 'true');
    assert.match(await statusText(api), /Now choose its definition/);
    await api.page.evaluate(p => { window.__ms.defButton(p.definition).click(); }, first);
    const paired = await evalIn(api, () => window.__ms.snapshot().filter(item => /is-paired/.test(item.cls)));
    assert.equal(paired.length, 2, 'both sides of the pair are marked');
    assert.equal(new Set(paired.map(item => item.cls.match(/tone-\d/)[0])).size, 1, 'both share one accent tone');
    assert.equal(await api.page.evaluate(() => document.querySelectorAll('.vocab-matchset__partner').length), 1, 'the definition names its partner');
    assert.equal(await evalIn(api, () => document.querySelectorAll('.is-settled, .is-ticked, .is-shake').length), 0, 'no correctness shown while pairing');
    assert.equal(await checkAria(api), 'true', 'Check still unavailable');
    // Check pressed early marks nothing and sends nothing
    await api.page.click('[data-match-check]', { force:true });
    assert.match(await statusText(api), /Pair every word/);
    assert.equal((await api.net()).length, 0);
    assert.equal(await evalIn(api, () => document.querySelectorAll('.is-settled').length), 0);
  } finally { await api.close(); }
});

browserTest('a paired item is not reused; a pair can be changed before Check', async () => {
  const api = await open();
  try {
    const [a, b] = await evalIn(api, () => window.__ms.pairs());
    await api.page.evaluate(([x, y]) => { window.__ms.pair(x.term, y.definition); }, [a, b]);   // a ↔ b's definition (wrong, on purpose)
    // b selected, then the definition already in use: it must not end up paired with two words
    await api.page.evaluate(([, y]) => { window.__ms.wordButton(y.term).click(); window.__ms.defButton(y.definition).click(); }, [a, b]);
    const usage = await evalIn(api, () => { const defs = window.__ms.snapshot().filter(i => i.side === 'definition' && /is-paired/.test(i.cls)); return defs.length; });
    assert.ok(usage <= 1);
    const pairedDefinitions = await evalIn(api, () => document.querySelectorAll('[data-match-definition].is-paired').length);
    const pairedWords = await evalIn(api, () => document.querySelectorAll('[data-match-word].is-paired').length);
    assert.equal(pairedDefinitions, pairedWords, 'always whole pairs');
    // change a's pair: tap the paired word, then its own definition
    await api.page.evaluate(([x]) => { window.__ms.pair(x.term, x.definition); }, [a]);
    const partner = await evalIn(api, term => { const word = window.__ms.wordButton(term); return word.classList.contains('is-paired'); }, a.term);
    assert.equal(partner, true);
  } finally { await api.close(); }
});

browserTest('all correct: Check settles every pair with a tick, locks them, shows Next; one attempt, one counted activity', async () => {
  const api = await open();
  try {
    const labelBefore = await evalIn(api, () => document.querySelector('.vocab-question-session-progress span')?.textContent.trim());
    await evalIn(api, () => window.__ms.pairAll([]));
    assert.equal(await checkAria(api), 'false');
    await click(api, '[data-match-check]');
    await api.page.waitForSelector('[data-action="next-question"]');
    const done = await evalIn(api, () => ({ settled:document.querySelectorAll('.is-settled').length, ticked:document.querySelectorAll('.is-ticked').length, items:document.querySelectorAll('.vocab-matchset__item').length, disabled:[...document.querySelectorAll('.vocab-matchset__item')].filter(i => i.disabled).length, status:document.querySelector('[data-match-status]').textContent.trim(), check:document.querySelectorAll('[data-match-check]').length }));
    assert.equal(done.settled, done.items); assert.equal(done.disabled, done.items, 'read-only once finished'); assert.equal(done.check, 0);
    assert.match(done.status, /All \d matches are correct/);
    await api.page.waitForFunction(() => window.__net.length === 1, null, { timeout:4000 });
    const net = await api.net();
    assert.equal(net.length, 1, 'one attempt for the whole set');
    const next = await api.clickNext(5000);
    assert.equal(next.reason, 'question');
    assert.ok(next.ms < 100, `Next stays instant (${next.ms}ms)`);
    const labelAfter = await evalIn(api, () => document.querySelector('.vocab-question-session-progress span')?.textContent.trim());
    const position = label => Number(String(label).split('/')[0]);
    assert.equal(position(labelAfter), position(labelBefore) + 1, `the mission counter moved by one (${labelBefore} → ${labelAfter})`);
  } finally { await api.close(); }
});

browserTest('a wrong set: correct pairs tick and stay locked, wrong pairs shake once and reopen, rematch works, retry is the existing supported retry', async () => {
  const api = await open();
  try {
    const terms = await evalIn(api, () => window.__ms.pairs().filter(p => p.primary || true).map(p => p.term));
    const primary = await evalIn(api, () => window.__ms.pairs().find(p => p.primary).term);
    const other = terms.find(t => t !== primary);
    await evalIn(api, ([x, y]) => window.__ms.pairAll([x, y]), [primary, other]);
    await click(api, '[data-match-check]');
    await api.page.waitForSelector('.is-shake');
    const after = await evalIn(api, () => {
      const items = window.__ms.snapshot();
      const style = el => { const s = getComputedStyle(el); return { name:s.animationName, dur:s.animationDuration, iter:s.animationIterationCount }; };
      return {
        settled:items.filter(i => /is-settled/.test(i.cls)).length, settledDisabled:items.filter(i => /is-settled/.test(i.cls) && i.disabled).length,
        reopened:items.filter(i => !/is-settled/.test(i.cls) && !i.disabled).length, paired:items.filter(i => /is-paired/.test(i.cls)).length,
        shake:style(document.querySelector('.is-shake')), tick:style(document.querySelector('.is-ticked')),
        borderRed:getComputedStyle(document.querySelector('.is-shake')).borderTopColor,
        status:document.querySelector('[data-match-status]').textContent.trim(), total:items.length,
        feedback:document.querySelector('.vocab-feedback')?.dataset?.studyFeedback ?? null, next:Boolean(document.querySelector('[data-action="next-question"]'))
      };
    });
    assert.equal(after.settled, 2 * (after.total / 2 - 2), 'only the correct pairs settled');
    assert.equal(after.settledDisabled, after.settled, 'correct pairs are locked');
    assert.equal(after.reopened, 4, 'the two wrong pairs reopened on both sides');
    assert.equal(after.paired, 0, 'no unchecked pair is left in place');
    assert.equal(after.shake.name, 'vocab-ms-shake'); assert.equal(after.shake.dur, '0.24s'); assert.equal(after.shake.iter, '1');
    assert.equal(after.tick.name, 'vocab-ms-tick'); assert.equal(after.tick.dur, '0.22s');
    assert.notEqual(after.borderRed, 'rgb(220, 38, 38)', 'no aggressive red error styling');
    assert.match(after.status, /matched correctly/);
    assert.equal(after.next, false, 'the set is not finished');
    assert.equal(after.feedback, 'retry', 'first-attempt miss uses the existing supported-retry state');
    // rematch the reopened pairs
    await evalIn(api, () => window.__ms.pairAll([]));
    await click(api, '[data-match-check]');
    await api.page.waitForSelector('[data-action="next-question"]');
    await api.page.waitForFunction(() => window.__net.length === 2, null, { timeout:4000 });
    const net = await api.net();
    assert.equal(net.length, 2, 'first attempt + supported retry, never one per pair');
    assert.equal(new Set(net.map(call => call.attemptId)).size, 2);
    const payloads = await api.page.evaluate(() => [...window.__server.committed.values()].map(b => ({ f:b.firstAttempt, r:b.retryUsed, t:b.questionType })));
    assert.deepEqual(payloads.map(p => [p.f, p.r]), [[true, false], [false, true]]);
  } finally { await api.close(); }
});

browserTest('animation: pairing snap is 200ms; none of the motion uses more than 250ms', async () => {
  const api = await open();
  try {
    const [a] = await evalIn(api, () => window.__ms.pairs());
    await evalIn(api, p => window.__ms.pair(p.term, p.definition), a);
    const snap = await evalIn(api, () => { const s = getComputedStyle(document.querySelector('.is-snap')); return { name:s.animationName, dur:parseFloat(s.animationDuration) * 1000 }; });
    assert.equal(snap.name, 'vocab-ms-snap');
    assert.ok(snap.dur >= 150 && snap.dur <= 250, `snap ${snap.dur}ms`);
  } finally { await api.close(); }
});

browserTest('reduced motion: no animation or transition anywhere in the set; state changes are instant', async () => {
  const api = await open({ reducedMotion:true });
  try {
    const [primary] = await evalIn(api, () => window.__ms.pairs().filter(p => p.primary));
    await evalIn(api, p => window.__ms.pair(p.term, p.definition), primary);
    const snap = await evalIn(api, () => { const s = getComputedStyle(document.querySelector('.is-snap')); return { name:s.animationName, tr:s.transitionDuration, transform:s.transform }; });
    assert.equal(snap.name, 'none'); assert.equal(snap.tr, '0s'); assert.equal(snap.transform, 'none');
    const other = await evalIn(api, () => window.__ms.pairs().find(p => !p.primary).term);
    await evalIn(api, ([x, y]) => window.__ms.pairAll([x, y]), [primary.term, other]);
    await click(api, '[data-match-check]');
    await api.page.waitForSelector('.is-shake');
    const motion = await evalIn(api, () => [...document.querySelectorAll('.vocab-matchset__item')].map(el => { const s = getComputedStyle(el); return s.animationName === 'none' && s.transitionDuration === '0s'; }));
    assert.ok(motion.every(Boolean), 'every item is static, including the reopened and settled ones');
    assert.equal(await evalIn(api, () => document.querySelectorAll('.is-settled').length > 0), true, 'state still changed immediately');
  } finally { await api.close(); }
});

browserTest('keyboard only: Tab/Enter/Space pair, arrows move, Check by keyboard, focus is kept', async () => {
  const api = await open();
  try {
    const pairs = await evalIn(api, () => window.__ms.pairs());
    await api.page.evaluate(() => document.querySelector('[data-match-word]').focus());
    // first word → move right to the first definition and pair them (whatever they are: pairing is allowed in any combination)
    await api.page.keyboard.press('Enter');
    assert.equal(await evalIn(api, () => document.activeElement.getAttribute('aria-pressed')), 'true', 'Enter selects and keeps focus');
    await api.page.keyboard.press('ArrowRight');
    assert.equal(await evalIn(api, () => document.activeElement.hasAttribute('data-match-definition')), true, 'ArrowRight moves into the definitions');
    await api.page.keyboard.press('Space');
    assert.equal(await evalIn(api, () => document.querySelectorAll('.is-paired').length), 2, 'Space completes the pair');
    assert.equal(await evalIn(api, () => document.activeElement.hasAttribute('data-match-definition')), true, 'focus stays put after repaint');
    await api.page.keyboard.press('ArrowDown');
    assert.equal(await evalIn(api, () => document.activeElement.hasAttribute('data-match-definition')), true);
    await api.page.keyboard.press('ArrowLeft');
    assert.equal(await evalIn(api, () => document.activeElement.hasAttribute('data-match-word')), true);
    // finish the set by keyboard: select by Enter on each remaining word / definition in order
    const remaining = pairs.length - 1;
    for (let n = 0; n < remaining; n += 1) {
      await evalIn(api, () => document.querySelector('[data-match-word]:not(.is-paired):not(:disabled)').focus());
      await api.page.keyboard.press('Enter');
      await evalIn(api, () => document.querySelector('[data-match-definition]:not(.is-paired):not(:disabled)').focus());
      await api.page.keyboard.press('Enter');
    }
    assert.equal(await checkAria(api), 'false');
    await api.page.focus('[data-match-check]');
    await api.page.keyboard.press('Enter');
    await api.page.waitForFunction(() => document.querySelector('.is-settled, .is-shake'), null, { timeout:4000 });
    assert.equal(await evalIn(api, () => document.querySelector('[data-match-status]').getAttribute('role')), 'status');
    assert.equal(await evalIn(api, () => [...document.querySelectorAll('.vocab-matchset__item')].every(el => el.tagName === 'BUTTON')), true, 'every control is a real button');
  } finally { await api.close(); }
});

browserTest('mobile 390px: compact stacked pairing, no horizontal scroll, large tap targets, tap-to-match works', async () => {
  const api = await open({ width:390, height:844 });
  try {
    const layout = await evalIn(api, () => {
      const box = el => { const r = el.getBoundingClientRect(); return { x:r.x, y:r.y, w:r.width, h:r.height, right:r.right, bottom:r.bottom }; };
      const words = [...document.querySelectorAll('[data-match-word]')].map(box); const defs = [...document.querySelectorAll('[data-match-definition]')].map(box);
      return { words, defs, overflow:document.documentElement.scrollWidth - document.documentElement.clientWidth, select:document.querySelectorAll('select').length, dropZone:document.querySelectorAll('[data-drop-target], .vocab-drop-zone, [draggable="true"]').length };
    });
    assert.ok(layout.overflow <= 0, 'no horizontal scroll');
    assert.equal(layout.select, 0); assert.equal(layout.dropZone, 0);
    assert.ok(Math.max(...layout.words.map(w => w.bottom)) <= Math.min(...layout.defs.map(d => d.y)) + 1, 'words sit above the definitions (stacked)');
    assert.ok(layout.defs.every(def => def.w >= 280), 'definitions use the full width');
    assert.ok([...layout.words, ...layout.defs].every(el => el.h >= 44), 'tap targets are at least 44px tall');
    assert.ok([...layout.words, ...layout.defs].every(el => el.x >= 0 && el.right <= 390), 'nothing is cut off');
    await evalIn(api, () => window.__ms.pairAll([]));
    assert.equal(await checkAria(api), 'false');
    await click(api, '[data-match-check]');
    await api.page.waitForSelector('[data-action="next-question"]');
    assert.equal(await evalIn(api, () => document.querySelectorAll('.is-settled').length), layout.words.length * 2);
  } finally { await api.close(); }
});

browserTest('a failed save keeps the same attempt id and the set is never double-recorded', async () => {
  const api = await open({ server:{ latency:50, failures:['network'] } });
  try {
    await evalIn(api, () => window.__ms.pairAll([]));
    await click(api, '[data-match-check]');
    await api.page.waitForSelector('[data-action="next-question"]');
    await api.page.waitForFunction(() => window.__server.committed.size === 1, null, { timeout:6000 });
    const net = await api.net();
    assert.equal(net.length, 2, 'one transient failure, one automatic retry');
    assert.equal(new Set(net.map(call => call.attemptId)).size, 1);
    assert.equal(await api.serverCommitted(), 1);
    assert.deepEqual(api.errors(), []);
  } finally { await api.close(); }
});

// ── Meaning → Apply: a contextual situation task, never the word/definition set ──────────────────────
async function openApply(options = {}) {
  const api = await openMission({ root, pathway:'meaning', stage:'apply', ...options });
  await api.start();
  await api.page.waitForSelector('[data-choice-answer]');
  return api;
}
const applyUi = api => api.page.evaluate(() => ({
  type:window.__currentQuestion.type, prompt:window.__currentQuestion.prompt,
  set:document.querySelectorAll('[data-match-set],[data-match-word],[data-match-definition]').length,
  select:document.querySelectorAll('select').length,
  drop:document.querySelectorAll('[data-drop-target],[data-gap-drop],[data-drag-gap-value],.vocab-drop-zone,.vocab-drag-token,[draggable="true"],.vocab-accessible-fallback').length,
  choices:document.querySelectorAll('[data-choice-answer]').length,
  hScroll:document.documentElement.scrollWidth > document.documentElement.clientWidth
}));

browserTest('Apply (desktop): a situation with four answer cards: no set, no select, no drop zone, no chips', async () => {
  const api = await openApply();
  try {
    const ui = await applyUi(api);
    assert.ok(['drag_word_definition', 'drag_definition_word', 'which_situation_fits'].includes(ui.type), ui.type);
    assert.equal(ui.set, 0); assert.equal(ui.select, 0); assert.equal(ui.drop, 0);
    assert.ok(ui.choices >= 3);
    assert.match(ui.prompt.split('\n').slice(1).join(' '), /\w{3,}\s+\w{3,}\s+\w{3,}/, 'a real situation sentence is shown');
    await api.answer(true);
    await api.page.waitForSelector('[data-action="next-question"]');
    await api.page.waitForFunction(() => window.__net.length === 1, null, { timeout:4000 });
    const payload = await api.page.evaluate(() => [...window.__server.committed.values()][0]);
    assert.equal(payload.questionType, ui.type);
    await api.page.waitForFunction(() => window.__server.committed.size === 1, null, { timeout:6000 });
    assert.equal(await api.serverCommitted(), 1, 'one visible activity = one attempt');
    assert.deepEqual(api.errors(), []);
  } finally { await api.close(); }
});

browserTest('Apply (390px phone): the situation and answer cards fit, no horizontal scroll, still no set or dropdown', async () => {
  const api = await openApply({ width:390, height:780 });
  try {
    const ui = await applyUi(api);
    assert.equal(ui.hScroll, false); assert.equal(ui.set, 0); assert.equal(ui.select, 0); assert.equal(ui.drop, 0);
    const fits = await api.page.evaluate(() => [...document.querySelectorAll('[data-choice-answer]')].every(btn => { const r = btn.getBoundingClientRect(); return r.right <= window.innerWidth && r.height >= 40; }));
    assert.equal(fits, true, 'answer cards stay inside the viewport and are touch-sized');
    await api.answer(true);
    await api.page.waitForSelector('[data-action="next-question"]');
  } finally { await api.close(); }
});

browserTest('Apply (keyboard + reduced motion): answer cards are focusable buttons answered with Enter; one attempt is saved', async () => {
  const api = await openApply({ reducedMotion:true });
  try {
    const index = await api.page.evaluate(() => { const q = window.__currentQuestion; const ok = q.markingReference.acceptedAnswers[0]; return [...document.querySelectorAll('[data-choice-answer]')].findIndex(btn => btn.dataset.choiceAnswer === ok); });
    assert.ok(index >= 0);
    await api.page.focus('[data-choice-answer]');
    for (let n = 0; n < index; n += 1) await api.page.keyboard.press('Tab');
    assert.equal(await api.page.evaluate(() => document.activeElement.tagName), 'BUTTON');
    await api.page.keyboard.press('Enter');
    await api.page.waitForSelector('[data-action="next-question"]');
    await api.page.waitForFunction(() => window.__net.length === 1, null, { timeout:4000 });
    await api.page.waitForFunction(() => window.__server.committed.size === 1, null, { timeout:6000 });
    assert.equal(await api.serverCommitted(), 1);
    const reduced = await api.page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
    assert.equal(reduced, true);
  } finally { await api.close(); }
});

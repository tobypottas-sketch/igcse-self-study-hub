import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { findChromium, loadPlaywright } from './helpers/pathway-geometry-harness.mjs';
import { openMission } from './helpers/question-latency-harness.mjs';

// Real app.js, views, CSS and attempt queue in headless Chromium (Spelling & Recall → Apply: "Rebuild the word").
// Only the Edge Function is simulated.
const root = fileURLToPath(new URL('..', import.meta.url));
const browserTest = loadPlaywright() && await findChromium() ? test : test.skip;
const MESSAGE = 'Choose at least one letter before checking your answer.';

async function openRebuild(options = {}) {
  const api = await openMission({ root, pathway:'spelling_recall', stage:'apply', ...options });
  await api.start();
  await api.page.waitForSelector('[data-tile-answer]');
  return api;
}
const validation = api => api.page.evaluate(() => {
  const el = document.querySelector('[data-tile-validation]');
  if (!el) return null;
  const box = el.getBoundingClientRect();
  return { text:el.textContent.trim(), role:el.getAttribute('role'), visible:box.width > 0 && box.height > 0, inForm:Boolean(el.closest('[data-form="vocabulary-answer"]')) };
});
const counters = api => api.page.evaluate(() => ({ net:window.__net.length, committed:window.__server.committed.size, answered:Boolean(document.querySelector('[data-action="next-question"]')), feedback:document.querySelectorAll('[data-study-feedback]').length }));
const check = api => api.page.click('form[data-form="vocabulary-answer"] button[type="submit"]');

browserTest('the served tiles are never in the solved order (real browser, repeated missions)', async () => {
  for (let run = 0; run < 4; run += 1) {
    const api = await openRebuild();
    try {
      const state = await api.page.evaluate(() => ({ tiles:[...document.querySelectorAll('[data-tile-answer]')].map(btn => btn.dataset.tileAnswer), answer:window.__currentQuestion.markingReference.acceptedAnswers[0].replace(/\s+/g, ''), type:window.__currentQuestion.type }));
      assert.equal(state.type, 'spelling_rebuild');
      assert.notEqual(state.tiles.join(''), state.answer);
      assert.deepEqual([...state.tiles].sort(), Array.from(state.answer).sort());
    } finally { await api.close(); }
  }
});

browserTest('empty Check answer is validation only: inline alert, zero attempts, nothing counted, no retry', async () => {
  const api = await openRebuild();
  try {
    const before = await counters(api);
    assert.deepEqual(await validation(api), { text:'', role:'alert', visible:false, inForm:true }, 'the alert region exists but is empty and takes no space');
    await check(api);
    await api.page.waitForTimeout(300);
    const shown = await validation(api);
    assert.equal(shown.text, MESSAGE);
    assert.equal(shown.role, 'alert');
    assert.equal(shown.visible, true);
    assert.deepEqual(await counters(api), before, 'no attempt, no feedback, no next-question state');
    assert.equal(await api.page.evaluate(() => /Retry|supported/i.test(document.querySelector('[data-form="vocabulary-answer"]').textContent)), false);
    assert.equal(await api.page.evaluate(() => document.querySelector('[data-action="clear-tile-answer"]') != null), true, 'the form is still the same question');
    // a second empty check stays a single validation message (no stacking)
    await check(api);
    assert.equal(await api.page.evaluate(() => document.querySelectorAll('[data-tile-validation]').length), 1);
    assert.equal((await validation(api)).text, MESSAGE);
    assert.equal(await api.serverCommitted(), 0);
    assert.deepEqual(api.errors(), []);
  } finally { await api.close(); }
});

browserTest('choosing the first tile clears the warning at once; a real answer is still marked as before', async () => {
  const api = await openRebuild();
  try {
    await check(api);
    assert.equal((await validation(api)).text, MESSAGE);
    // dialogs must never be used
    let dialogs = 0; api.page.on('dialog', async dialog => { dialogs += 1; await dialog.dismiss(); });
    const answer = await api.page.evaluate(() => window.__currentQuestion.markingReference.acceptedAnswers[0].replace(/\s+/g, ''));
    await api.page.evaluate(letter => { [...document.querySelectorAll('[data-tile-answer]:not(:disabled)')].find(btn => btn.dataset.tileAnswer === letter).click(); }, answer[0]);
    const cleared = await validation(api);
    assert.equal(cleared.text, ''); assert.equal(cleared.visible, false);
    assert.equal((await counters(api)).net, 0, 'selecting a tile submits nothing');
    // finish the word correctly
    for (const letter of answer.slice(1)) await api.page.evaluate(value => { [...document.querySelectorAll('[data-tile-answer]:not(:disabled)')].find(btn => btn.dataset.tileAnswer === value).click(); }, letter);
    await check(api);
    await api.page.waitForSelector('[data-action="next-question"]');
    await api.page.waitForFunction(() => window.__server.committed.size === 1, null, { timeout:6000 });
    const payload = await api.page.evaluate(() => [...window.__server.committed.values()][0]);
    assert.equal(payload.questionType, 'spelling_rebuild');
    assert.equal(payload.rawAnswer.replace(/\s+/g, ''), answer);
    assert.equal(payload.firstAttempt, true); assert.equal(payload.retryUsed, false);
    assert.equal(await api.serverCommitted(), 1);
    assert.equal(dialogs, 0);
  } finally { await api.close(); }
});

browserTest('a wrong answer still gives the supported retry, and an empty check on the retry is also validation only', async () => {
  const api = await openRebuild();
  try {
    const answer = await api.page.evaluate(() => window.__currentQuestion.markingReference.acceptedAnswers[0].replace(/\s+/g, ''));
    // build a deliberately wrong word from the same letters (rotate by one)
    const wrong = answer.slice(1) + answer[0];
    for (const letter of wrong) await api.page.evaluate(value => { [...document.querySelectorAll('[data-tile-answer]:not(:disabled)')].find(btn => btn.dataset.tileAnswer === value).click(); }, letter);
    await check(api);
    await api.page.waitForFunction(() => window.__net.length === 1, null, { timeout:5000 });
    await api.page.waitForSelector('[data-tile-answer]');
    const retry = await api.page.evaluate(() => ({ tiles:[...document.querySelectorAll('[data-tile-answer]')].map(btn => btn.dataset.tileAnswer), fixed:document.querySelector('.vocab-build-fixed')?.textContent.replace(/\s+/g, '') ?? '', answer:window.__currentQuestion.markingReference.acceptedAnswers[0].replace(/\s+/g, '') }));
    assert.ok(retry.fixed.length >= 1, 'a supported partial build');
    assert.notEqual(retry.fixed + retry.tiles.join(''), retry.answer, 'the supported retry is not shown solved');
    const sent = (await counters(api)).net;
    await check(api);
    await api.page.waitForTimeout(300);
    assert.equal((await validation(api)).text, MESSAGE);
    assert.equal((await counters(api)).net, sent, 'the empty retry check sends nothing');
    assert.deepEqual(api.errors(), []);
  } finally { await api.close(); }
});

browserTest('mobile 390px: the message fits, is touch-safe and causes no horizontal scroll', async () => {
  const api = await openRebuild({ width:390, height:780 });
  try {
    await check(api);
    const state = await api.page.evaluate(() => { const el = document.querySelector('[data-tile-validation]'); const box = el.getBoundingClientRect(); return { text:el.textContent.trim(), right:box.right, width:window.innerWidth, hScroll:document.documentElement.scrollWidth > document.documentElement.clientWidth }; });
    assert.equal(state.text, MESSAGE);
    assert.ok(state.right <= state.width);
    assert.equal(state.hScroll, false);
  } finally { await api.close(); }
});

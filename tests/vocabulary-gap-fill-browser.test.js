import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { findChromium, loadPlaywright } from './helpers/pathway-geometry-harness.mjs';
import { openMission } from './helpers/question-latency-harness.mjs';

// Real views + real interaction module in headless Chromium: Context → Apply gap-fill is tap-to-fill.
const root = fileURLToPath(new URL('..', import.meta.url));
const browserTest = loadPlaywright() && await findChromium() ? test : test.skip;

browserTest('tap a word: it fills the blank, Check enables, swapping words works, answer is the single chosen word', async () => {
  const api = await openMission({ root, width:390, height:900, pathway:'context' });
  try {
    await api.page.evaluate(async () => {
      await import('/src/vocabulary/foundational-interactions.js');
      const views = await import('/src/vocabulary/views.js');
      views.renderVocabularyQuestion(document.querySelector('#vocabularyApp'), {
        unitNumber:1, unitTitle:'Sports and Free Time', term:'regular', sessionLabel:'1 / 10 activities',
        question:{ type:'drag_word_sentence', responseMode:'drag_gap', prompt:'Complete the sentence.', sourceText:'Students should stay ____ after school.', draggables:['active', 'effort', 'regular', 'compete'], markingReference:{ acceptedAnswers:['active'] } }
      });
    });
    const page = api.page;
    assert.equal(await page.locator('.vocab-drop-zone, select[name="answer"], [draggable="true"]').count(), 0, 'no drop zone, dropdown or draggable element');
    const submit = page.locator('[data-gap-submit]');
    assert.equal(await submit.isDisabled(), true, 'Check is disabled until a word is chosen');
    await page.locator('[data-gap-choice="effort"]').click();
    assert.equal(await submit.isDisabled(), false);
    assert.equal(await page.locator('input[name="answer"]').inputValue(), 'effort');
    assert.match(await page.locator('.vocab-source-text p').innerText(), /Students should stay effort after school\./);
    await page.locator('[data-gap-choice="active"]').click();
    assert.equal(await page.locator('input[name="answer"]').inputValue(), 'active');
    assert.equal(await page.locator('.vocab-gap-filled').count(), 1, 'one filled word, swapped not duplicated');
    assert.match(await page.locator('.vocab-source-text p').innerText(), /Students should stay active after school\./);
    assert.equal(await page.locator('[data-gap-choice][aria-pressed="true"]').count(), 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false);
  } finally { await api.close(); }
});

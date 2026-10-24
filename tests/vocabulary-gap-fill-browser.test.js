import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { findChromium, loadPlaywright } from './helpers/pathway-geometry-harness.mjs';
import { openMission } from './helpers/question-latency-harness.mjs';

// Real views + real interaction module in headless Chromium: Context → Apply gap-fill is drag-to-fill.
const root = fileURLToPath(new URL('..', import.meta.url));
const browserTest = loadPlaywright() && await findChromium() ? test : test.skip;

browserTest('drag a word onto the gap: it fills the blank, Check enables, a tap does not answer, dragging another word swaps it', async () => {
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
    const submit = page.locator('[data-gap-submit]');
    const slot = page.locator('[data-gap-slot]');
    assert.equal(await slot.count(), 1, 'the blank is a visible drop target in the sentence');
    assert.equal(await submit.isDisabled(), true, 'Check is disabled until a word is dragged in');
    const dragTo = async (word, target) => {
      const from = await page.locator(`[data-gap-choice="${word}"]`).boundingBox();
      const to = await target.boundingBox();
      await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
      await page.mouse.down();
      await page.mouse.move(from.x + from.width / 2 + 12, from.y + from.height / 2 - 12, { steps:3 });
      await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps:8 });
      return to;
    };
    // A plain tap is not an answer.
    await page.locator('[data-gap-choice="effort"]').click();
    assert.equal(await submit.isDisabled(), true, 'tapping a word does not fill the gap');
    assert.equal(await page.locator('input[name="answer"]').inputValue(), '');
    // Dropping away from the gap cancels.
    const from = await page.locator('[data-gap-choice="effort"]').boundingBox();
    await page.mouse.move(from.x + 10, from.y + 10);
    await page.mouse.down();
    await page.mouse.move(from.x + 10, from.y + 300, { steps:6 });
    assert.equal(await page.locator('.vocab-gap-ghost').count(), 1, 'a ghost card follows the pointer');
    await page.mouse.up();
    assert.equal(await page.locator('.vocab-gap-ghost').count(), 0);
    assert.equal(await submit.isDisabled(), true, 'dropping away from the gap does nothing');
    // Drag onto the gap.
    await dragTo('effort', slot);
    assert.equal(await page.locator('[data-gap-slot].is-over').count(), 1, 'the gap highlights while hovering');
    await page.mouse.up();
    assert.equal(await submit.isDisabled(), false);
    assert.equal(await page.locator('input[name="answer"]').inputValue(), 'effort');
    assert.match(await page.locator('.vocab-source-text p').innerText(), /Students should stay effort after school\./);
    // Dragging another word swaps it.
    await dragTo('active', slot);
    await page.mouse.up();
    assert.equal(await page.locator('input[name="answer"]').inputValue(), 'active');
    assert.equal(await page.locator('[data-gap-slot]').count(), 1, 'one gap, swapped not duplicated');
    assert.match(await page.locator('.vocab-source-text p').innerText(), /Students should stay active after school\./);
    assert.equal(await page.locator('[data-gap-choice][aria-pressed="true"]').count(), 1);
    // Keyboard users can still answer.
    await page.locator('[data-gap-choice="regular"]').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('input[name="answer"]').inputValue(), 'regular');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false);
  } finally { await api.close(); }
});

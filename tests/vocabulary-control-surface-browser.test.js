// Real-browser audit of the live dispatcher: every control is clicked in the rendered DOM and must land on the screen it promises.
import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { openMission } from './helpers/question-latency-harness.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const PATHWAYS = ['meaning', 'context', 'word_families', 'precision_use', 'spelling_recall'];

async function withApp(t, pathway, run) {
  const api = await openMission({ root, pathway });
  if (!api) { t.skip('no browser available'); return; }
  try { await run(api); } finally { await api.close(); }
}
const visible = (page, selector) => page.evaluate(sel => Boolean(document.querySelector(sel)), selector);
const errorShown = page => page.evaluate(() => document.querySelector('#vocabularyApp')?.textContent ?? '');

for (const pathway of PATHWAYS) {
  test(`${pathway}: pathway card -> sheet -> every selectable activity starts a question; none shows a stage error`, async t => {
    await withApp(t, pathway, async api => {
      const { page } = api;
      await page.click(`.vocab-pathway-card[data-pathway="${pathway}"]`);
      await page.waitForSelector('[data-practice-sheet]');
      const families = await page.evaluate(() => [...document.querySelectorAll('[data-action="start-practice-choice"]:not([disabled])')].map(b => b.dataset.family));
      assert.ok(families.length > 0, `${pathway} offers at least one selectable activity`);
      for (const familyId of families) {
        if (!await visible(page, '[data-practice-sheet]')) { await page.click(`.vocab-pathway-card[data-pathway="${pathway}"]`); await page.waitForSelector('[data-practice-sheet]'); }
        await page.click(`[data-action="start-practice-choice"][data-family="${familyId}"]`);
        await page.waitForSelector('[data-form="vocabulary-answer"], [data-choice-answer], [data-evidence-answer], .vocab-match-set, [data-match-word]', { timeout:15000 });
        assert.doesNotMatch(await errorShown(page), /not part of this stage|not available in this pathway/, `${familyId} showed a launch error`);
        await page.click('[data-action="leave-session"], [data-action="back-unit"]');
        await page.waitForSelector(`.vocab-pathway-card[data-pathway="${pathway}"]`);
      }
    });
  });
}

test('Recommended, close, Esc, Mixed Practice, View All Words, sound and Back all reach the screen they promise', async t => {
  await withApp(t, 'meaning', async api => {
    const { page } = api;
    await page.click('.vocab-pathway-card[data-pathway="meaning"]'); await page.waitForSelector('[data-practice-sheet]');
    await page.click('[data-action="close-practice-sheet"]');
    assert.equal(await visible(page, '[data-practice-sheet]'), false, 'close button dismisses the sheet');
    await page.click('.vocab-pathway-card[data-pathway="meaning"]'); await page.waitForSelector('[data-practice-sheet]');
    await page.keyboard.press('Escape');
    assert.equal(await visible(page, '[data-practice-sheet]'), false, 'Escape dismisses the sheet');
    await page.click('.vocab-pathway-card[data-pathway="meaning"]'); await page.waitForSelector('[data-practice-sheet]');
    await page.click('[data-action="start-recommended"][data-pathway="meaning"]');
    await page.waitForSelector('[data-form="vocabulary-answer"], [data-choice-answer], [data-evidence-answer], [data-match-word]', { timeout:15000 });
    await page.click('[data-action="leave-session"], [data-action="back-unit"]'); await page.waitForSelector('.vocab-pathway-card');
    if (await visible(page, '[data-action="toggle-sound"]')) {
      const before = await page.getAttribute('[data-action="toggle-sound"]', 'aria-pressed');
      await page.click('[data-action="toggle-sound"]');
      assert.notEqual(await page.getAttribute('[data-action="toggle-sound"]', 'aria-pressed'), before, 'sound toggle flips its state');
    }
    await page.click('[data-action="view-all-words"]'); await page.waitForSelector('[data-action="back-unit"]');
    await page.click('[data-action="back-unit"]'); await page.waitForSelector('.vocab-pathway-card');
    await page.click('[data-action="start-mixed-review"]:not([disabled])');
    await page.waitForSelector('[data-form="vocabulary-answer"], [data-choice-answer], [data-evidence-answer], [data-match-word]', { timeout:15000 });
    await page.click('[data-action="leave-session"], [data-action="back-unit"]'); await page.waitForSelector('.vocab-pathway-card');
    await page.click('[data-action="back-units"]'); await page.waitForSelector('.vocab-unit-card');
    assert.deepEqual(api.errors(), [], 'no page errors across the walk');
  });
});

test('game launch and exit return to the unit screen', async t => {
  await withApp(t, 'meaning', async api => {
    const { page } = api;
    const games = await page.evaluate(() => [...document.querySelectorAll('[data-action="open-game"]')].map(b => b.dataset.game));
    assert.ok(games.length >= 2, 'both games have a launch button on the unit screen');
    for (const game of games) {
      await page.click(`[data-action="open-game"][data-game="${game}"]`);
      await page.waitForSelector('[data-game-act]');
      for (let hop = 0; hop < 3 && !await visible(page, '.vocab-pathway-card'); hop += 1) {
        await page.click('[data-game-act="exit-unit"], [data-game-act="lobby"]');
        await page.waitForTimeout(50);
      }
      await page.waitForSelector('.vocab-pathway-card');
    }
    assert.deepEqual(api.errors(), []);
  });
});
import { runQuestions } from './helpers/question-latency-harness.mjs';

test('finish screen: Try another activity opens a sheet whose every selectable option starts', async t => {
  await withApp(t, 'meaning', async api => {
    const { page } = api;
    await runQuestions(api, { count:10 });
    await page.waitForSelector('[data-action="choose-practice"]', { timeout:20000 });
    await page.click('[data-action="choose-practice"]');
    await page.waitForSelector('[data-practice-sheet]');
    const families = await page.evaluate(() => [...document.querySelectorAll('[data-action="start-practice-choice"]:not([disabled])')].map(b => b.dataset.family));
    for (const familyId of families) {
      if (!await visible(page, '[data-practice-sheet]')) { await page.click('.vocab-pathway-card[data-pathway="meaning"]', { timeout:3000 }); await page.waitForSelector('[data-practice-sheet]'); }
      await page.click(`[data-action="start-practice-choice"][data-family="${familyId}"]`);
      await page.waitForSelector('[data-form="vocabulary-answer"], [data-choice-answer], [data-evidence-answer], [data-match-word]', { timeout:15000 });
      assert.doesNotMatch(await errorShown(page), /not part of this stage/, `${familyId} showed a launch error after a finished mission`);
      await page.click('[data-action="leave-session"], [data-action="back-unit"]'); await page.waitForSelector('.vocab-pathway-card');
    }
  });
});

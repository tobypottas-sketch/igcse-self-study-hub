import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { findChromium, loadPlaywright } from './helpers/pathway-geometry-harness.mjs';
import { openMission } from './helpers/question-latency-harness.mjs';
import { playCompletionSequence } from '../src/vocabulary/completion-sequence.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const browserTest = loadPlaywright() && await findChromium() ? test : test.skip;

test('completion CSS is presentation-only, scoped to the playing state and has a reduced-motion fallback', () => {
  const css = readFileSync(new URL('../vocabulary-completion.css', import.meta.url), 'utf8');
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.doesNotMatch(css, /pointer-events\s*:\s*none/, 'never blocks input');
  assert.match(readFileSync(new URL('../vocabulary.html', import.meta.url), 'utf8'), /vocabulary-completion\.css[\s\S]*vocabulary-a11y\.css/);
});

test('playCompletionSequence is a no-op without a card and under reduced motion', () => {
  assert.doesNotThrow(() => playCompletionSequence({ querySelector:() => null }));
  const card = { dataset:{ completionSequence:'done' }, querySelector:() => null, addEventListener(){}, removeEventListener(){} };
  playCompletionSequence({ querySelector:() => card }, { win:{ matchMedia:() => ({ matches:true }) } });
  assert.equal(card.dataset.completionSequence, 'done');
});

async function finishMission(api) {
  await api.start();
  for (let n = 0; n < 9; n += 1) { await api.answer(true); await api.clickNext(10000); }
  await api.answer(true);
  await api.page.evaluate(() => document.querySelector('[data-action="next-question"]').click());
  await api.page.waitForSelector('[data-completion-sequence]', { timeout:10000 });
}

for (const [label, width, height] of [['desktop', 1280, 900], ['mobile', 390, 780]]) {
  browserTest(`sequence plays, can be skipped, never shifts layout or overflows (${label})`, async () => {
    const api = await openMission({ root, width, height });
    try {
      await finishMission(api);
      const page = api.page;
      assert.equal(await page.getAttribute('[data-completion-sequence]', 'data-completion-sequence'), 'playing');
      const before = await page.evaluate(() => { const r = document.querySelector('.vocab-finish-actions').getBoundingClientRect().top - document.querySelector('.vocab-finish-score').getBoundingClientRect().top; return r; });
      assert.ok(await page.isVisible('[data-action="skip-animation"]'));
      await page.click('[data-action="skip-animation"]');
      assert.equal(await page.getAttribute('[data-completion-sequence]', 'data-completion-sequence'), 'done');
      const after = await page.evaluate(() => ({ top:document.querySelector('.vocab-finish-actions').getBoundingClientRect().top - document.querySelector('.vocab-finish-score').getBoundingClientRect().top, count:document.querySelector('[data-count-up]').textContent, score:document.querySelector('[data-completion-score]').dataset.score, over:document.documentElement.scrollWidth > innerWidth }));
      assert.equal(after.top, before, 'no layout shift when the sequence ends');
      assert.equal(after.count, after.score);
      assert.equal(after.over, false);
      assert.equal(await page.isVisible('[data-action="skip-animation"]'), false);
      assert.deepEqual(api.errors(), []);
    } finally { await api.close(); }
  });
}

browserTest('sequence finishes by itself and buttons work while it plays', async () => {
  const api = await openMission({ root });
  try {
    await finishMission(api);
    await api.page.waitForFunction(() => document.querySelector('[data-completion-sequence]').dataset.completionSequence === 'done', null, { timeout:5000 });
    assert.ok(await api.page.isVisible('[data-action="back-unit"]'));
  } finally { await api.close(); }
});

browserTest('reduced motion shows the static final state', async () => {
  const api = await openMission({ root, reducedMotion:true });
  try {
    await finishMission(api);
    const r = await api.page.evaluate(() => ({ state:document.querySelector('[data-completion-sequence]').dataset.completionSequence, skip:document.querySelector('[data-action="skip-animation"]').hidden, fill:getComputedStyle(document.querySelector('.vocab-finish-ring__fill')).animationName }));
    assert.deepEqual(r, { state:'done', skip:true, fill:'none' });
  } finally { await api.close(); }
});

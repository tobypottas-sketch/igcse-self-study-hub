import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { findChromium, loadPlaywright, serve } from './helpers/pathway-geometry-harness.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const playwright = loadPlaywright();
const executablePath = await findChromium();
const browserTest = playwright && executablePath ? test : test.skip;
const fixtures = [
  ['meaning', { type:'meaning_match', responseMode:'choice', prompt:'Which meaning fits?', sourceText:'The event was thrilling.', options:['exciting','quiet'] }],
  ['context', { type:'drag_word_sentence', responseMode:'drag_gap', prompt:'Complete the sentence.', sourceText:'The event was ____.', draggables:['thrilling','quiet'] }],
  ['word_families', { type:'word_family_switch', responseMode:'text', prompt:'Use the correct form from the prefer word family.', sourceText:'They have a ____ for morning lessons.' }],
  ['paraphrasing', { type:'complete_paraphrase', responseMode:'text', prompt:'Complete the paraphrase of “very exciting”: ___', sourcePhrase:'very exciting' }],
  ['precision_use', { type:'improve_vocabulary', responseMode:'text', prompt:'Replace “very exciting” with a precise word.', sourceText:'The event was ____.' }],
  ['spelling_recall', { type:'spell_word', responseMode:'spelling', prompt:'Type the word that means “very exciting”.', spellingPattern:'t _ _ _ _ _ _ _ _' }]
];
let browser, page, server;
test.before(async () => {
  if (!playwright || !executablePath) return;
  const hosted = await serve(root); server = hosted.server;
  browser = await playwright.chromium.launch({ executablePath, headless:true });
  page = await browser.newPage({ reducedMotion:'reduce' });
  await page.route('**/src/vocabulary/router.js*', route => route.fulfill({ contentType:'text/javascript', body:'export async function bootApp() {}' }));
  await page.goto(`${hosted.origin}/vocabulary.html`);
  await page.evaluate(() => import('/src/vocabulary/foundational-interactions.js'));
});
test.after(async () => { await browser?.close(); server?.close(); });
async function render(pathwayId, question, extra = {}) {
  await page.evaluate(async args => {
    const { renderVocabularyQuestion } = await import('/src/vocabulary/views.js');
    renderVocabularyQuestion(document.querySelector('#vocabularyApp'), { unitNumber:1, unitTitle:'Synthetic unit', sessionLabel:'1 / 10', term:'thrilling', pathwayStage:{ meaning:'recognise', context:'apply', word_families:'recall', paraphrasing:'recall', precision_use:'apply', spelling_recall:'recall' }[args.pathwayId] ?? 'recall', ...args });
  }, { pathwayId, question, ...extra });
}

for (const width of [1280,768,390,320]) for (const [pathway, question] of fixtures) {
  browserTest(`${pathway}: stimulus leads instruction and answers stay separate at ${width}px`, async () => {
    await page.setViewportSize({ width, height:900 });
    await render(pathway,question);
    const metrics = await page.evaluate(() => {
      const prompt = document.querySelector('.vocab-question-prompt');
      const source = document.querySelector('.vocab-question-context p');
      const panel = document.querySelector('.vocab-question-context');
      const answer = document.querySelector('.vocab-answer-form');
      return { instruction:parseFloat(getComputedStyle(prompt).fontSize), stimulus:parseFloat(getComputedStyle(source).fontSize), weight:parseFloat(getComputedStyle(prompt).fontWeight), padding:parseFloat(getComputedStyle(panel).paddingTop), separation:answer.getBoundingClientRect().top - document.querySelector('.vocab-question-context:last-of-type').getBoundingClientRect().bottom, overflow:document.documentElement.scrollWidth > innerWidth };
    });
    assert.ok(metrics.stimulus > metrics.instruction, JSON.stringify(metrics));
    assert.ok(metrics.weight <= 600, 'instruction has supporting weight');
    assert.ok(metrics.padding >= 16, 'stimulus has comfortable padding');
    assert.ok(metrics.separation >= 16, 'answers are separated from the stimulus');
    assert.equal(metrics.overflow,false);
    if (pathway === 'meaning') {
      assert.equal(await page.locator('.vocab-target-language').innerText(),'thrilling');
      const target = await page.locator('.vocab-target-pill').boundingBox();
      const instruction = await page.locator('h1').boundingBox();
      assert.ok(target.y >= instruction.y + instruction.height);
    }
    if (['word_families','paraphrasing','precision_use'].includes(pathway)) {
      const gap = await page.locator('.vocab-language-gap').first().evaluate(el => ({ display:getComputedStyle(el).display, border:getComputedStyle(el).borderBottomStyle, width:el.getBoundingClientRect().width }));
      assert.equal(gap.display,'inline-block');
      assert.equal(gap.border,'solid');
      assert.ok(gap.width >= 40);
    }
  });
}

browserTest('gap keyboard interaction and correct feedback keep the same controls and answer', async () => {
  await render('context',fixtures[1][1]);
  assert.equal(await page.locator('[data-gap-submit]').isDisabled(),true);
  await page.locator('[data-gap-choice="thrilling"]').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('input[name="answer"]').inputValue(),'thrilling');
  assert.equal(await page.locator('[data-gap-submit]').isDisabled(),false);
  await render('context',fixtures[1][1], { feedback:{ correct:true, filledAnswer:'thrilling', message:'Correct.' } });
  assert.equal(await page.locator('[data-gap-correct]').innerText(),'thrilling');
  assert.equal(await page.locator('[data-action="next-question"]').count(),1);
});

browserTest('typed rewrite retains labelled input, keyboard focus and retry support', async () => {
  await render('paraphrasing',fixtures[3][1], { retry:true, feedback:{ correct:false, message:'Try again.' }, support:{ action:'retry', kind:'partial_text', clue:'t' } });
  await page.getByRole('textbox', { name:'Try your answer again' }).fill('thrilling');
  assert.equal(await page.locator('input[name="answer"]').inputValue(),'thrilling');
  assert.equal(await page.locator('.vocab-retry-stage').count(),1);
  assert.match(await page.locator('#vocab-support-hint').innerText(), /start with t/);
});

browserTest('matching cue and multi-slot tasks retain clear gaps, usable inputs and mobile wrapping', async () => {
  await page.setViewportSize({ width:320, height:900 });
  await render('word_families', { type:'word_family_match', responseMode:'matching', prompt:'Match the correct form.', sourceText:'They ____ daily.', matchCue:'They ____ daily.', matchOptions:['train','training'] });
  assert.equal(await page.locator('.vocab-match-cue .vocab-language-gap').count(),1);
  assert.equal(await page.locator('.vocab-question-context').count(),0, 'the matching cue is not duplicated');
  assert.ok(await page.locator('.vocab-match-cue').evaluate(el => parseFloat(getComputedStyle(el).fontSize) > parseFloat(getComputedStyle(document.querySelector('h1')).fontSize)));
  await page.locator('[data-match-card="train"]').click();
  assert.equal(await page.locator('input[name="answer"]').inputValue(),'train');
  await render('precision_use', { type:'upgrade_passage', responseMode:'slots', prompt:'Improve each sentence.', slots:[{ label:'Sentence 1', sourceText:'The event was ____.' },{ label:'Sentence 2', sourceText:'It was a ____ occasion.' }] });
  await page.locator('[data-slot-input]').first().fill('thrilling');
  assert.equal(await page.locator('[data-slot-input]').count(),2);
  assert.equal(await page.locator('[data-slot-input]').first().inputValue(),'thrilling');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),false);
});

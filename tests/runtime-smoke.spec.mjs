import { test, expect } from 'playwright/test';
import fs from 'node:fs';

// CI installs the real supabase-js from npm and serves it for the CDN import, so these checks never depend on a third-party CDN being reachable.
const SUPABASE_BUNDLE = process.env.SUPABASE_JS_BUNDLE && fs.existsSync(process.env.SUPABASE_JS_BUNDLE) ? fs.readFileSync(process.env.SUPABASE_JS_BUNDLE,'utf8') : null;
test.beforeEach(async ({ page }) => {
  if (SUPABASE_BUNDLE) await page.route('**/cdn.jsdelivr.net/npm/@supabase/**', route => route.fulfill({ contentType:'application/javascript', body:SUPABASE_BUNDLE }));
});

test('Hub boots to the sign-in screen without browser errors', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await expect(page.locator('h1')).toHaveText('Sign in');
  await expect(page.locator('form[data-form="login"]')).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test('forgot-password flow opens from the sign-in screen', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.locator('[data-action="forgot-password"]').click();
  await expect(page.locator('h1')).toHaveText('Reset password');
  await expect(page.locator('form[data-form="forgot-password"]')).toBeVisible();
  await expect(page.locator('input[name="email"]')).toBeVisible();
  expect(pageErrors).toEqual([]);
});


// Exercise the dictionary renderer with the real page stylesheet cascade, without sign-in.
for (const width of [1280, 1024, 768, 641, 390, 320]) {
  test(`dictionary context remains prominent and contained at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height:900 });
    await page.route('**/src/vocabulary/router.js', route => route.fulfill({ body:'', contentType:'text/javascript' }));
    await page.goto('http://127.0.0.1:4173/vocabulary.html');
    await page.evaluate(async () => {
      const { renderVocabularyWords } = await import('/src/vocabulary/views.js');
      renderVocabularyWords(document.querySelector('#vocabularyApp'), {
        unitNumber:1, unitTitle:'Sports and Free Time',
        words:[
          { term:'athletes', partOfSpeech:'noun', definition:'people who train and compete in sports', contextSentence:'Elite athletes usually train several times a week.' },
          { term:'atmosphere', partOfSpeech:'noun', definition:'the feeling or mood of a place', contextSentence:'The crowd created an exciting atmosphere before the match.' },
          { term:'urge', partOfSpeech:'verb', definition:'to strongly encourage someone to do something', contextSentence:'Doctors urge teenagers to stay active for their health.' },
          { term:'leisure', partOfSpeech:'noun', definition:'free time when you are not working or studying', contextSentence:'Many students use their leisure to play sport or meet friends, while others prefer to relax at home after a long and demanding day at school.' }
        ]
      });
    });
    await expect(page.locator('.vocab-word-row')).toHaveCount(4);
    await expect(page.locator('.vocab-word-pathway')).toHaveCount(24);
    await expect(page.locator('.vocab-word-list details, .vocab-word-list summary')).toHaveCount(0);

    const layout = await page.locator('.vocab-dictionary-entry').evaluateAll(entries => entries.map(entry => {
      const box = entry.querySelector('.vocab-dictionary-entry__context');
      const label = box.querySelector('span');
      const sentence = box.querySelector('p');
      const style = getComputedStyle(box);
      const quote = getComputedStyle(box, '::before');
      const sentenceStyle = getComputedStyle(sentence);
      const baseline = element => {
        const marker = document.createElement('i');
        marker.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
        element.prepend(marker);
        const y = marker.getBoundingClientRect().top;
        marker.remove();
        return y;
      };
      // Measure the actual quote ink, rather than the much larger font line box.
      const probe = document.createElement('span');
      Object.assign(probe.style, {
        position:'absolute', top:quote.top, right:quote.right,
        font:quote.font, lineHeight:quote.lineHeight, visibility:'hidden',
        padding:'0', margin:'0', letterSpacing:quote.letterSpacing
      });
      probe.textContent = '“';
      box.append(probe);
      const quoteBaseline = baseline(probe);
      const probeRect = probe.getBoundingClientRect();
      const canvas = document.createElement('canvas').getContext('2d');
      canvas.font = quote.font;
      const ink = canvas.measureText('“');
      const quoteInk = {
        left:probeRect.left - ink.actualBoundingBoxLeft,
        right:probeRect.left + ink.actualBoundingBoxRight,
        top:quoteBaseline - ink.actualBoundingBoxAscent,
        bottom:quoteBaseline + ink.actualBoundingBoxDescent
      };
      probe.remove();
      const range = document.createRange();
      range.selectNodeContents(sentence);
      const boxRect = box.getBoundingClientRect();
      const pathwaysRect = entry.closest('.vocab-word-row').querySelector('.vocab-word-pathways').getBoundingClientRect();
      const sentenceWidth = sentence.getBoundingClientRect().width;
      const withoutQuote = document.createElement('style');
      withoutQuote.textContent = '.vocab-dictionary-entry__context::before{display:none!important}';
      document.head.append(withoutQuote);
      const sentenceWidthWithoutQuote = sentence.getBoundingClientRect().width;
      const heightWithoutQuote = box.getBoundingClientRect().height;
      withoutQuote.remove();
      const lineCount = new Set([...range.getClientRects()].map(rect => Math.round(rect.top))).size;
      return {
        term:entry.querySelector('.vocab-dictionary-entry__term').textContent,
        lineCount,
        fullWidth:Math.abs(boxRect.left - pathwaysRect.left) < 1 && Math.abs(boxRect.right - pathwaysRect.right) < 1,
        rightPadding:parseFloat(style.paddingRight),
        sentenceRightPadding:parseFloat(sentenceStyle.paddingRight),
        sentenceBackground:sentenceStyle.backgroundImage,
        quotePosition:quote.position,
        sentenceWidthWithoutQuote,
        sentenceLayoutWidth:sentenceWidth,
        quoteContained:quoteInk.left >= boxRect.left + 4 && quoteInk.right <= boxRect.right - 4 &&
          quoteInk.top >= boxRect.top + 4 && quoteInk.bottom <= boxRect.bottom - 4,
        height:boxRect.height,
        heightWithoutQuote,
        verticalExcess:boxRect.height - sentence.getBoundingClientRect().height -
          (innerWidth <= 640 ? label.getBoundingClientRect().height + parseFloat(style.rowGap) : 0),
        insetDifference:Math.abs(
          Math.min(label.getBoundingClientRect().top, sentence.getBoundingClientRect().top) - boxRect.top -
          (boxRect.bottom - Math.max(label.getBoundingClientRect().bottom, sentence.getBoundingClientRect().bottom))),
        quoteAlpha:Number(quote.color.match(/[\d.]+/g).at(-1)),
        rowGap:parseFloat(getComputedStyle(entry.closest('.vocab-word-row')).rowGap),

        labelWeight:Number(getComputedStyle(label).fontWeight),
        headwordSize:parseFloat(getComputedStyle(entry.querySelector('.vocab-dictionary-entry__term')).fontSize),
        sentenceWidth:sentence.clientWidth - parseFloat(sentenceStyle.paddingLeft) - parseFloat(sentenceStyle.paddingRight),
        sentenceSize:parseFloat(sentenceStyle.fontSize),
        definitionSize:parseFloat(getComputedStyle(entry.querySelector('.vocab-dictionary-entry__definition')).fontSize),
        labelSize:parseFloat(getComputedStyle(label).fontSize),
        sentenceWeight:Number(sentenceStyle.fontWeight),
        quoteContent:quote.content,
        quoteTop:parseFloat(quote.top), quoteRight:parseFloat(quote.right),
        quoteLineHeight:parseFloat(quote.lineHeight),
        quoteSize:parseFloat(quote.fontSize),
        centreDifference:Math.abs(
          (label.getBoundingClientRect().top + label.getBoundingClientRect().bottom) / 2 -
          (sentence.getBoundingClientRect().top + sentence.getBoundingClientRect().bottom) / 2),
        columns:style.gridTemplateColumns.split(' ').length
      };
    }));
    for (const entry of layout) {
      expect(entry.fullWidth).toBe(true);
      expect(entry.rightPadding).toBeLessThanOrEqual(24);
      expect(entry.sentenceRightPadding).toBe(0);
      expect(entry.sentenceBackground).toBe('none');
      expect(entry.quotePosition).toBe('absolute');
      expect(entry.sentenceLayoutWidth).toBe(entry.sentenceWidthWithoutQuote);
      if (width >= 1024 && ['athletes', 'atmosphere'].includes(entry.term)) expect(entry.lineCount).toBe(1);
      if (width <= 390 && entry.term === 'leisure') expect(entry.lineCount).toBeGreaterThan(1);
      expect(entry.sentenceSize).toBeGreaterThanOrEqual(entry.definitionSize * 1.15);
      expect(entry.sentenceSize).toBeLessThan(entry.headwordSize);
      expect(entry.sentenceSize).toBeGreaterThan(entry.labelSize);
      expect(entry.sentenceWeight).toBeGreaterThanOrEqual(650);
      expect(entry.labelSize).toBeLessThanOrEqual(10);
      expect(entry.labelWeight).toBeLessThanOrEqual(700);
      expect(entry.verticalExcess).toBeGreaterThanOrEqual(20);
      expect(entry.verticalExcess).toBeLessThanOrEqual(28);
      expect(entry.insetDifference).toBeLessThan(1);
      expect(entry.height).toBe(entry.heightWithoutQuote);
      if (width >= 1024 && entry.lineCount === 1) expect(entry.height).toBeLessThanOrEqual(56);
      expect(entry.rowGap).toBeGreaterThanOrEqual(10);
      expect(entry.rowGap).toBeLessThanOrEqual(14);
      expect(entry.quoteContained).toBe(true);
      expect(entry.quoteAlpha).toBeLessThanOrEqual(.045);
      expect(entry.quoteSize).toBeGreaterThanOrEqual(88);
      expect(entry.quoteContent).toContain('“');
      expect(entry.quoteTop).toBeGreaterThanOrEqual(0);
      expect(entry.quoteTop).toBeLessThanOrEqual(4);
      expect(entry.quoteRight).toBeGreaterThanOrEqual(4);
      expect(entry.quoteRight).toBeLessThanOrEqual(8);
      expect(entry.quoteLineHeight).toBeGreaterThanOrEqual(entry.quoteSize);
      if (width > 640) {
        expect(entry.sentenceWidth).toBeGreaterThanOrEqual(240);
        expect(entry.columns).toBe(2);
        expect(entry.centreDifference).toBeLessThan(1);
      } else {
        expect(entry.columns).toBe(1);
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

// Use the real student controller through the router; replace only the Supabase boundary.
for (const saveMode of ['success', 'failed', 'pending']) {
  test(`student can leave after a correct answer with ${saveMode} persistence`, async ({ page }) => {
    const { mockVocabularyStudent } = await import('./fixtures-vocabulary-student.mjs');
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await mockVocabularyStudent(page, saveMode);
    await page.locator('[data-choice-answer="leisure"]').click();
    await expect(page.locator('.vocab-feedback')).toContainText('Correct');
    await expect(page.locator('[data-action="next-question"]')).toBeVisible();
    if (saveMode === 'failed') await expect(page.locator('[data-vocab-sync-warning]')).toBeVisible();
    const back = page.locator('[data-action="leave-session"]');
    await expect(back).toHaveText('← Unit 1');
    expect(await back.evaluate(button => {
      const rect = button.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
      return !button.disabled && !button.closest('[inert], [aria-modal="true"]') &&
        getComputedStyle(button).pointerEvents !== 'none' && (hit === button || button.contains(hit));
    })).toBe(true);
    if (saveMode === 'pending') await page.locator('[data-action="next-question"]').click();
    await back.click();
    await expect(page.locator('.vocab-pathways')).toBeVisible();
    if (saveMode === 'pending') await page.evaluate(() => window.settleVocabularySave());
    await expect(page.locator('.vocab-pathways')).toBeVisible();
    // A failed save is retried automatically (1 try + 2 retries). Every try must carry the SAME attempt id, so the server records one attempt.
    const sent = await page.evaluate(() => window.vocabularyAttempts.map(entry => entry.attemptId));
    expect(new Set(sent).size).toBe(1);
    expect(sent.length).toBe(saveMode === 'failed' ? 3 : 1);
    await page.locator('[data-action="back-units"]').click();
    await expect(page.locator('[data-action="open-unit"][data-unit="1"]')).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('student Next advances normally and supported retry still works', async ({ page }) => {
  const { mockVocabularyStudent } = await import('./fixtures-vocabulary-student.mjs');
  await mockVocabularyStudent(page);
  await page.locator('[data-choice-answer]').filter({ hasNotText:'leisure' }).first().click();
  await expect(page.locator('.is-retry')).toBeVisible();
  await page.locator('[data-choice-answer="leisure"]').click();
  await expect(page.locator('.vocab-feedback')).toContainText('Correct');
  await page.locator('[data-action="next-question"]').click();
  await expect(page.locator('[data-choice-answer]')).not.toHaveCount(0);
  const attempts = await page.evaluate(() => window.vocabularyAttempts);
  expect(attempts).toHaveLength(2);
  expect(attempts[0].firstAttempt).toBe(true);
  expect(attempts[1].retryUsed).toBe(true);
  await page.locator('[data-action="leave-session"]').click();
  await expect(page.locator('.vocab-pathways')).toBeVisible();
  await page.locator('[data-action="open-pathway"][data-pathway="meaning"]').click();
  await page.locator('[data-action="start-recommended"][data-pathway="meaning"]').click();
  await expect(page.locator('[data-form="vocabulary-answer"]')).toBeVisible();
});

test('student can submit and advance when language-bank activities have not been published', async ({ page }) => {
  const { mockVocabularyStudent } = await import('./fixtures-vocabulary-student.mjs');
  await mockVocabularyStudent(page, 'unpublished');
  await page.locator('[data-choice-answer="leisure"]').click();
  await expect(page.locator('.vocab-feedback')).toContainText('Correct');
  await page.locator('[data-action="next-question"]').click();
  await expect(page.locator('[data-choice-answer]')).not.toHaveCount(0);
  expect(await page.evaluate(() => window.vocabularyAttempts[0].contentSource)).toBe('context');
  await expect(page.locator('[data-vocab-sync-warning]')).toHaveCount(0);
  await page.locator('[data-action="leave-session"]').click();
  await expect(page.locator('.vocab-pathways')).toBeVisible();
});

test('new Vocabulary sessions vary answer order while preserving the same question', async ({ page }) => {
  await page.addInitScript(() => {
    let session = 0;
    Object.defineProperty(crypto,'randomUUID',{ value:() => `00000000-0000-4000-8000-${String(++session).padStart(12,'0')}` });
  });
  const { mockVocabularyStudent } = await import('./fixtures-vocabulary-student.mjs');
  await mockVocabularyStudent(page);
  const orders = new Set(); let material;
  for (let session = 0; session < 6; session++) {
    const choices = await page.locator('[data-choice-answer]').evaluateAll(nodes => nodes.map(node => node.dataset.choiceAnswer));
    const current = { prompt:await page.locator('.vocab-question-prompt').textContent(), context:await page.locator('.vocab-question-context').textContent(), options:[...choices].sort() };
    if (material) expect(current).toEqual(material); else material = current;
    orders.add(JSON.stringify(choices));
    if (session < 5) {
      await page.locator('[data-action="leave-session"]').click();
      await page.locator('[data-action="open-pathway"][data-pathway="context"]').click();
      await page.locator('[data-action="start-recommended"][data-pathway="context"]').click();
    }
  }
  expect(orders.size).toBeGreaterThan(1);
});


test('Context Continue avoids repeating the preceding ten-question set', async ({ page }) => {
  const { mockVocabularyStudent } = await import('./fixtures-vocabulary-student.mjs');
  const { default:unit } = await import('../content/vocabulary/releases/unit-01.js');
  const { planPathwayQuestion } = await import('../src/vocabulary/pathway-planner.js');
  const content = {...unit,itemsById:Object.fromEntries(unit.items.map(row => [row.vocabularyId,row])),contextsByOccurrence:{}};
  for (const row of unit.contexts) (content.contextsByOccurrence[row.occurrenceId] ??= []).push(row);
  await mockVocabularyStudent(page,'continue');
  const firstSources = [];
  for (let i = 0; i < 10; i++) {
    const target = unit.occurrences[i];
    const question = planPathwayQuestion({content,target,pathwayId:'context',stageId:'recognise',seed:`${target.occurrenceId}:${i}:adaptive`}).question;
    firstSources.push(await page.locator('.vocab-question-context').textContent());
    const answer = question.markingReference.acceptedAnswers[0];
    await page.locator(`[data-choice-answer=${JSON.stringify(answer)}]`).click();
    await expect(page.locator('.vocab-feedback')).toContainText('Correct');
    await page.locator('[data-action="next-question"]').click();
  }
  await expect(page.locator('[data-action="continue-practice"]')).toBeVisible();
  await page.locator('[data-action="continue-practice"]').click();
  await expect(page.locator('[data-choice-answer]')).not.toHaveCount(0);
  expect(firstSources).not.toContain(await page.locator('.vocab-question-context').textContent());
  await expect(page.locator('[data-vocab-sync-warning]')).toHaveCount(0);
});

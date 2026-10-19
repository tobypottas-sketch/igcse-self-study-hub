import { test, expect } from 'playwright/test';

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
          { term:'urge', partOfSpeech:'verb', definition:'to strongly encourage someone to do something', contextSentence:'Doctors urge teenagers to stay active for their health.' },
          { term:'leisure', partOfSpeech:'noun', definition:'free time when you are not working or studying', contextSentence:'Many students use their leisure to play sport or meet friends, while others prefer to relax at home after a long and demanding day at school.' }
        ]
      });
    });
    await expect(page.locator('.vocab-word-row')).toHaveCount(2);
    await expect(page.locator('.vocab-word-pathway')).toHaveCount(12);
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
      const overlapsSentence = [...range.getClientRects()].some(rect =>
        quoteInk.left < rect.right && quoteInk.right > rect.left &&
        quoteInk.top < rect.bottom && quoteInk.bottom > rect.top);
      const boxRect = box.getBoundingClientRect();
      return {
        quoteContained:quoteInk.left >= boxRect.left + 4 && quoteInk.right <= boxRect.right - 4 &&
          quoteInk.top >= boxRect.top + 4 && quoteInk.bottom <= boxRect.bottom - 4,
        overlapsSentence,
        quoteAlpha:Number(quote.color.match(/[\d.]+/g).at(-1)),
        rowGap:parseFloat(getComputedStyle(entry.closest('.vocab-word-row')).rowGap),
        verticalPadding:parseFloat(style.paddingTop),
        labelWeight:Number(getComputedStyle(label).fontWeight),
        headwordSize:parseFloat(getComputedStyle(entry.querySelector('.vocab-dictionary-entry__term')).fontSize),
        sentenceSize:parseFloat(sentenceStyle.fontSize),
        definitionSize:parseFloat(getComputedStyle(entry.querySelector('.vocab-dictionary-entry__definition')).fontSize),
        labelSize:parseFloat(getComputedStyle(label).fontSize),
        sentenceWeight:Number(sentenceStyle.fontWeight),
        quoteContent:quote.content,
        quoteTop:parseFloat(quote.top), quoteRight:parseFloat(quote.right),
        quoteLineHeight:parseFloat(quote.lineHeight),
        quoteSize:parseFloat(quote.fontSize),
        baselineDifference:Math.abs(baseline(label) - baseline(sentence)),
        columns:style.gridTemplateColumns.split(' ').length
      };
    }));
    for (const entry of layout) {
      expect(entry.sentenceSize).toBeGreaterThanOrEqual(entry.definitionSize * 1.15);
      expect(entry.sentenceSize).toBeLessThan(entry.headwordSize);
      expect(entry.sentenceSize).toBeGreaterThan(entry.labelSize);
      expect(entry.sentenceWeight).toBeGreaterThanOrEqual(650);
      expect(entry.labelSize).toBeLessThanOrEqual(10);
      expect(entry.labelWeight).toBeLessThanOrEqual(700);
      expect(entry.verticalPadding).toBeGreaterThanOrEqual(20);
      expect(entry.rowGap).toBeGreaterThanOrEqual(10);
      expect(entry.rowGap).toBeLessThanOrEqual(14);
      expect(entry.quoteContained).toBe(true);
      expect(entry.overlapsSentence).toBe(false);
      expect(entry.quoteAlpha).toBeLessThanOrEqual(.045);
      expect(entry.quoteSize).toBeGreaterThanOrEqual(88);
      expect(entry.quoteContent).toContain('“');
      expect(entry.quoteTop).toBeGreaterThanOrEqual(0);
      expect(entry.quoteTop).toBeLessThanOrEqual(4);
      expect(entry.quoteRight).toBeGreaterThanOrEqual(4);
      expect(entry.quoteRight).toBeLessThanOrEqual(8);
      expect(entry.quoteLineHeight).toBeGreaterThanOrEqual(entry.quoteSize);
      if (width > 640) {
        expect(entry.columns).toBe(2);
        expect(entry.baselineDifference).toBeLessThan(1);
      } else {
        expect(entry.columns).toBe(1);
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

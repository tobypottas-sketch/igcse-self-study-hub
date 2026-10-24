import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { renderPracticeSheet } from '../src/vocabulary/views.js';
import { activityFamilies } from '../src/vocabulary/activity-families.js';
import { findChromium, loadPlaywright } from './helpers/pathway-geometry-harness.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const PATHWAYS = ['meaning', 'context', 'word_families', 'paraphrasing', 'precision_use', 'spelling_recall'];
// desktop, laptop, tablet, large and small phones, and short landscape phones
const VIEWPORTS = [[1440, 900], [1280, 720], [1024, 600], [768, 1024], [430, 932], [390, 844], [375, 667], [360, 640], [360, 500], [320, 568], [320, 480], [667, 375], [568, 320]];

const browserTest = loadPlaywright() && await findChromium() ? test : test.skip;

browserTest('the practice sheet never needs vertical scrolling, for every pathway at every tested screen size', async () => {
  const playwright = loadPlaywright();
  const browser = await playwright.chromium.launch({ executablePath: await findChromium() });
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sheet-'));
  const html = fs.readFileSync(path.join(root, 'vocabulary.html'), 'utf8');
  const links = [...html.matchAll(/<link[^>]+href="([^"]+\.css)"[^>]*>/g)].map(match => pathToFileURL(path.join(root, match[1])).href);
  const failures = [];
  try {
    const page = await browser.newPage();
    for (const pathwayId of PATHWAYS) {
      const families = activityFamilies(pathwayId);
      // Worst case for height: every option carries a hint line and one has the "Last time" badge.
      const options = families.map((family, index) => ({ family, status: index % 2 ? 'short' : 'locked', hint: index % 2 ? 'Short set: 4 words' : 'Unlocks after you clear Recognise' }));
      const body = renderPracticeSheet({ pathwayId, options, lastFamilyId: families[1]?.id });
      fs.writeFileSync(path.join(dir, 'sheet.html'), `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">${links.map(href => `<link rel="stylesheet" href="${href}">`).join('')}</head><body>${body}</body></html>`);
      for (const [width, height] of VIEWPORTS) {
        await page.setViewportSize({ width, height });
        await page.goto(pathToFileURL(path.join(dir, 'sheet.html')).href);
        await page.waitForTimeout(350);
        const m = await page.evaluate(() => {
          const sheet = document.querySelector('.vocab-sheet');
          const box = sheet.getBoundingClientRect();
          return { scroll: sheet.scrollHeight, client: sheet.clientHeight, top: box.top, bottom: box.bottom, vh: innerHeight };
        });
        if (m.scroll > m.client + 1 || m.top < -1 || m.bottom > m.vh + 1) failures.push(`${pathwayId} ${width}x${height}: scroll ${m.scroll}/${m.client}, top ${Math.round(m.top)}, bottom ${Math.round(m.bottom)}`);
      }
    }
  } finally {
    await browser.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
  assert.deepEqual(failures, []);
});

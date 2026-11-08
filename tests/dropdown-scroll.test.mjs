import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { findChromium, loadPlaywright, serve } from './helpers/pathway-geometry-harness.mjs';

// Regression guard for "the page jumps when I open the practice-question dropdown".
// Cause (reproduced): place() called window.scrollBy() whenever less than ~6.5 rows of room were left below the picker,
// moving the document 160-594px; setActive() used Element.scrollIntoView(), which also scrolls the window.

const review = readFileSync('review-writing.html', 'utf8');
const email = readFileSync('email-writing-app.html', 'utf8');
const fn = (html, name) => { const from = html.indexOf('function ' + name); return html.slice(from, html.indexOf('\n}\n', from)); };
const codeOnly = source => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\s\/\/ .*$/gm, '');
const COMBOS = [
  ['Informal Email', codeOnly(fn(email, 'enhanceTaskSelect'))],
  ['Review Writing', codeOnly(fn(review, 'enhanceQuestionSelect'))]
];

for (const [name, code] of COMBOS) {
  test(`${name} picker never scrolls the document itself`, () => {
    assert.ok(code.length > 1500, 'combobox source located');
    for (const forbidden of [/\bscrollBy\s*\(/, /\bscrollTo\s*\(/, /\.scrollIntoView\s*\(/, /\bscrollingElement\b/, /\.scrollTop\s*=(?!\s*(?:top|bottom)\b)/]) {
      assert.doesNotMatch(code, forbidden, `${name}: ${forbidden}`);
    }
    // Focus is never allowed to scroll the page; the list's own box is the only thing that scrolls.
    const focusCalls = code.match(/\.focus\([^)]*\)/g) ?? [];
    assert.ok(focusCalls.length >= 2);
    for (const call of focusCalls) assert.match(call, /preventScroll:\s*true/, `${name}: ${call}`);
    assert.match(code.replace(/\s+/g, ''), /list\.scrollTop=/);
  });
}

const playwright = loadPlaywright();
const executablePath = await findChromium();
const browserTest = playwright && executablePath ? test : test.skip;

const STUB = "export function createClient(){const q={select(){return q},eq(){return q},single:async()=>({data:{id:'u1',role:'student',display_name:'S',active:true,must_change_password:false},error:null})};return {auth:{getUser:async()=>({data:{user:{id:'u1'}},error:null}),getSession:async()=>({data:{session:{access_token:'x'}},error:null}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},from:()=>q};}";
const PAGES = [
  { name: 'Informal Email', file: 'email-writing-app.html', combo: '#examTaskCombo', list: '#examTaskList' },
  { name: 'Review Writing', file: 'review-writing.html', combo: '#questionCombo', list: '#questionList' }
];
const VIEWPORTS = [
  { label: 'desktop', width: 1100, height: 900 },
  { label: 'short desktop', width: 1100, height: 600 },
  { label: 'phone', width: 390, height: 700, isMobile: true, hasTouch: true }
];

browserTest('opening, navigating, selecting and dismissing a practice-question picker never moves the page', async () => {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const { server, origin } = await serve(root);
  const browser = await playwright.chromium.launch({ executablePath });
  const failures = [];
  try {
    for (const pg of PAGES) for (const vp of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: !!vp.isMobile, hasTouch: !!vp.hasTouch });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.route('https://cdn.jsdelivr.net/**', r => r.fulfill({ contentType: 'application/javascript', body: STUB }));
      await page.goto(`${origin}/${pg.file}`);
      await page.waitForSelector(pg.combo, { state: 'attached' });
      await page.waitForTimeout(800);
      await page.evaluate(() => {
        document.documentElement.style.scrollBehavior = 'auto';
        const spacer = document.createElement('div'); spacer.style.height = '1600px'; document.body.append(spacer);
      });
      const y = () => page.evaluate(() => Math.round(window.scrollY));
      const place = fraction => page.evaluate(([sel, f]) => {
        const r = document.querySelector(sel).getBoundingClientRect();
        window.scrollTo({ top: Math.max(0, window.scrollY + r.top - Math.round(window.innerHeight * f)), behavior: 'instant' });
      }, [pg.combo, fraction]);
      // Picker near the top, middle and bottom of the viewport: the bottom cases are the ones that used to scroll the document.
      for (const fraction of [0.2, 0.5, 0.85]) {
        const tag = `${pg.name} / ${vp.label} / picker at ${Math.round(fraction * 100)}%`;
        await place(fraction); await page.waitForTimeout(120);
        const start = await y();
        await page.click(pg.combo); await page.waitForTimeout(200);
        const opened = await y();
        for (const key of ['ArrowDown', 'End', 'PageUp', 'Home']) { await page.keyboard.press(key); await page.waitForTimeout(40); }
        const navigated = await y();
        const box = await page.$eval(pg.list, e => { const r = e.getBoundingClientRect(); return { top: r.top, bottom: r.bottom }; });
        await page.keyboard.press('Escape'); await page.waitForTimeout(80);
        const escaped = await y();
        await page.click(pg.combo); await page.waitForTimeout(120);
        await page.click(`${pg.list} [role=option]:nth-child(2)`); await page.waitForTimeout(200);
        const selected = await y();
        await page.click(pg.combo); await page.waitForTimeout(120);
        await page.mouse.click(4, Math.round(vp.height / 2)); await page.waitForTimeout(120);
        const outside = await y();
        for (const [what, value] of [['open', opened], ['keys', navigated], ['Escape', escaped], ['select', selected], ['click-outside', outside]]) {
          if (value !== start) failures.push(`${tag}: ${what} moved the page ${start} -> ${value}`);
        }
        if (box.top < -1 || box.bottom > vp.height + 1) failures.push(`${tag}: menu left the viewport (${Math.round(box.top)}..${Math.round(box.bottom)} of ${vp.height})`);
        const selectedValue = await page.$eval(pg.combo, e => e.textContent.trim());
        if (!selectedValue) failures.push(`${tag}: button lost its label after selecting`);
      }
      // Keyboard use after the student has scrolled away with the menu open must not drag the page back to the list.
      await place(0.3); await page.click(pg.combo); await page.waitForTimeout(150);
      await page.evaluate(sel => { const r = document.querySelector(sel).getBoundingClientRect(); window.scrollBy({ top: Math.round(r.bottom + 40), behavior: 'instant' }); }, pg.list);
      await page.waitForTimeout(100);
      const away = await y();
      await page.keyboard.press('ArrowDown'); await page.keyboard.press('End'); await page.waitForTimeout(100);
      if (await y() !== away) failures.push(`${pg.name} / ${vp.label}: arrow keys pulled the page back to the menu (${away} -> ${await y()})`);
      if (errors.length) failures.push(`${pg.name} / ${vp.label}: page errors ${errors.join('; ')}`);
      await ctx.close();
    }
  } finally { await browser.close(); server.close(); }
  assert.deepEqual(failures, []);
});

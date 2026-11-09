import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { findChromium, loadPlaywright, serve } from './helpers/pathway-geometry-harness.mjs';

// Regression guard for "the Email / Review menus open upwards and cover the page header".
// Cause (reproduced): place() set is-up whenever fewer than min(6.5 rows, 200px) were free below AND there was more room above,
// so a picker in the lower half of an ordinary window flipped upwards even though a usable (3-row) scrolling menu fitted below.

const review = readFileSync('review-writing.html', 'utf8');
const email = readFileSync('email-writing-app.html', 'utf8');
const fn = (html, name) => { const from = html.indexOf('function ' + name); return html.slice(from, html.indexOf('\n}\n', from)); };
const squash = text => text.replace(/\s+/g, '');

test('both pickers flip upwards only when a 3-row menu does not fit below', () => {
  for (const [name, code] of [['Email', fn(email, 'enhanceTaskSelect')], ['Review', fn(review, 'enhanceQuestionSelect')]]) {
    const c = squash(code);
    assert.ok(c.includes('usable=row*3+8'), `${name}: usable height is three rows`);
    assert.ok(c.includes('constup=below<usable&&above>below;'), `${name}: upward only when below is not usable`);
    assert.doesNotMatch(c, /Math\.min\(want,200\)/, `${name}: old 200px threshold removed`);
  }
});

const playwright = loadPlaywright();
const executablePath = await findChromium();
const browserTest = playwright && executablePath ? test : test.skip;

const STUB = "export function createClient(){const q={select(){return q},eq(){return q},single:async()=>({data:{id:'u1',role:'student',display_name:'S',active:true,must_change_password:false},error:null})};return {auth:{getUser:async()=>({data:{user:{id:'u1'}},error:null}),getSession:async()=>({data:{session:{access_token:'x'}},error:null}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},from:()=>q};}";
const PAGES = [
  { name: 'Informal Email', file: 'email-writing-app.html', combo: '#examTaskCombo', list: '#examTaskList', header: '.app-header' },
  { name: 'Review Writing', file: 'review-writing.html', combo: '#questionCombo', list: '#questionList', header: null }
];
const VIEWPORTS = [
  { label: 'desktop ample', width: 1280, height: 900 },
  { label: 'desktop moderate', width: 1280, height: 700 },
  { label: 'short window', width: 1100, height: 480 },
  { label: 'tablet', width: 820, height: 1000, isMobile: true, hasTouch: true },
  { label: 'phone', width: 390, height: 700, isMobile: true, hasTouch: true }
];

browserTest('menus open downwards when usable, upwards only when necessary, never move the page or overflow', async () => {
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
        const spacer = document.createElement('div'); spacer.style.height = '1800px'; document.body.append(spacer);
      });
      const y = () => page.evaluate(() => Math.round(window.scrollY));
      const place = fraction => page.evaluate(([sel, f]) => {
        const r = document.querySelector(sel).getBoundingClientRect();
        window.scrollTo({ top: Math.max(0, window.scrollY + r.top - Math.round(window.innerHeight * f)), behavior: 'instant' });
      }, [pg.combo, fraction]);
      const clickAt = async sel => {
        const c = await page.$eval(sel, el => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
        await page.mouse.click(c.x, c.y);
      };
      for (const fraction of [0.12, 0.4, 0.7, 0.88]) {
        const tag = `${pg.name} / ${vp.label} / picker at ${Math.round(fraction * 100)}%`;
        await place(fraction); await page.waitForTimeout(120);
        const start = await y();
        await clickAt(pg.combo); await page.waitForTimeout(220);
        const m = await page.evaluate(({ list, combo, header }) => {
          const l = document.querySelector(list), lr = l.getBoundingClientRect(), b = document.querySelector(combo).getBoundingClientRect();
          const rows = [...l.querySelectorAll('[role=option]')];
          const row = rows[0].offsetHeight, usable = row * 3 + 8, spaceBelow = window.innerHeight - b.bottom - 12;
          const inBox = rows.filter(li => { const r = li.getBoundingClientRect(); return r.top >= lr.top - 0.5 && r.bottom <= lr.bottom + 0.5; });
          const covered = inBox.filter(li => { const r = li.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !(h && li.contains(h)); }).length;
          const hdr = header && document.querySelector(header);
          return {
            up: l.classList.contains('is-up'), spaceBelow, usable, top: lr.top, bottom: lr.bottom, height: lr.height, covered, shown: inBox.length,
            scrolls: l.scrollHeight > l.clientHeight + 1, hOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            headerBottom: hdr ? hdr.getBoundingClientRect().bottom : 0, gap: lr.top - b.bottom, vh: window.innerHeight
          };
        }, pg);
        const opened = await y();
        if (!m.up && m.spaceBelow < m.usable && m.spaceBelow < 0) failures.push(`${tag}: menu opened downwards with no room`);
        if (m.spaceBelow >= m.usable && m.up) failures.push(`${tag}: opened UPWARDS although ${Math.round(m.spaceBelow)}px (>= ${m.usable}) was free below`);
        if (!m.up && m.spaceBelow >= m.usable && Math.abs(m.gap - 4) > 2) failures.push(`${tag}: downward menu is ${Math.round(m.gap)}px from the selector, not directly beneath`);
        if (m.up && m.top < m.headerBottom - 1) failures.push(`${tag}: upward menu covers the page header (${Math.round(m.top)} < ${Math.round(m.headerBottom)})`);
        if (m.top < -1 || m.bottom > m.vh + 1) failures.push(`${tag}: menu leaves the viewport (${Math.round(m.top)}..${Math.round(m.bottom)} of ${m.vh})`);
        if (m.covered) failures.push(`${tag}: ${m.covered} rows covered by other content`);
        if (m.shown < 2) failures.push(`${tag}: only ${m.shown} rows usable`);
        if (m.hOverflow) failures.push(`${tag}: horizontal overflow`);
        if (opened !== start) failures.push(`${tag}: opening moved the page ${start} -> ${opened}`);
        // Keyboard, then Escape.
        for (const key of ['ArrowDown', 'End', 'PageUp', 'Home']) { await page.keyboard.press(key); await page.waitForTimeout(30); }
        if (await y() !== start) failures.push(`${tag}: keys moved the page`);
        await page.keyboard.press('Escape'); await page.waitForTimeout(80);
        if (await page.$eval(pg.list, e => !e.hidden)) failures.push(`${tag}: Escape did not close`);
        if (await page.evaluate(sel => document.activeElement === document.querySelector(sel), pg.combo) !== true) failures.push(`${tag}: focus not returned to the selector`);
        // Selection by keyboard (Enter), then by pointer/tap, then click-outside.
        await page.keyboard.press('Enter'); await page.waitForTimeout(120);
        await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter'); await page.waitForTimeout(120);
        const afterKey = await page.$eval(pg.combo, e => e.textContent.trim());
        if (!afterKey) failures.push(`${tag}: keyboard selection lost the label`);
        await clickAt(pg.combo); await page.waitForTimeout(150);
        const opt = await page.$eval(`${pg.list} [role=option]:nth-child(2)`, el => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
        if (vp.hasTouch) await page.touchscreen.tap(opt.x, opt.y); else await page.mouse.click(opt.x, opt.y);
        await page.waitForTimeout(150);
        if (await page.$eval(pg.list, e => !e.hidden)) failures.push(`${tag}: choosing an option left the menu open`);
        await clickAt(pg.combo); await page.waitForTimeout(120);
        await page.mouse.click(3, Math.round(vp.height / 2)); await page.waitForTimeout(120);
        if (await page.$eval(pg.list, e => !e.hidden)) failures.push(`${tag}: click outside did not close`);
        if (await y() !== start) failures.push(`${tag}: select/dismiss moved the page`);
      }
      if (errors.length) failures.push(`${pg.name} / ${vp.label}: page errors ${errors.join('; ')}`);
      await ctx.close();
    }
  } finally { await browser.close(); server.close(); }
  assert.deepEqual(failures, []);
});

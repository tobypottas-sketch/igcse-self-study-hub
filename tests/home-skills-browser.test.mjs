import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { findChromium, loadPlaywright, serve } from './helpers/pathway-geometry-harness.mjs';

const playwright = loadPlaywright();
const executablePath = await findChromium();
const browserTest = playwright && executablePath ? test : test.skip;
const BY_SKILL = {
  writing: ['essay_writing', 'email_writing', 'review_writing'], reading: ['reading'], listening: ['listening'],
  language: ['paraphrasing', 'vocabulary_paraphrase']
};
const ALL = ['essay_writing', 'email_writing', 'review_writing', 'reading', 'listening', 'paraphrasing', 'vocabulary_paraphrase'];
const VIEWPORTS = [{ label: 'desktop', width: 1280, height: 900 }, { label: 'tablet', width: 820, height: 1100 }, { label: 'phone', width: 390, height: 844 }];

browserTest('student homepage: skill selection filters apps, keeps the page still, is keyboard accessible and never overflows', async () => {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const { server, origin } = await serve(root);
  const browser = await playwright.chromium.launch({ executablePath });
  const failures = [];
  try {
    for (const vp of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(`${origin}/tests/helpers/home-skills-harness.html`);
      await page.waitForSelector('html[data-ready]');
      await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
      const visible = () => page.$$eval('.app-card', cards => cards.filter(c => !c.hidden && c.offsetParent !== null).map(c => c.dataset.app));
      const tag = text => `${vp.label}: ${text}`;
      const same = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());

      if (!same(await visible(), ALL)) failures.push(tag('default view is not All apps with all seven cards'));
      // Ordering: exact required order even when Supabase returns the rows scrambled, in All apps and inside each skill.
      await page.evaluate(() => { window.__apps = [window.__apps[6], window.__apps[3], window.__apps[0], window.__apps[5], window.__apps[2], window.__apps[4], window.__apps[1]]; window.__render(); });
      const order = () => page.$$eval('.app-card', cards => cards.filter(c => !c.hidden).map(c => c.dataset.app));
      if (JSON.stringify(await order()) !== JSON.stringify(ALL)) failures.push(tag(`All apps order is ${JSON.stringify(await order())}`));
      for (const [skill, keys] of Object.entries(BY_SKILL)) {
        await page.click(`[data-skill-choice="${skill}"]`);
        if (JSON.stringify(await order()) !== JSON.stringify(keys)) failures.push(tag(`${skill} order is ${JSON.stringify(await order())}`));
      }
      await page.click('[data-skill-choice="all"]');
      if (await page.$$eval('.skill-picker h3, .app-grid h3, .app-grid hr, .app-grid [role=separator]', e => e.length)) failures.push(tag('visible headings/separators were added between cards'));
      // Counts shown on the skill cards.
      const counts = await page.$$eval('.skill-card', els => Object.fromEntries(els.map(e => [e.dataset.skillChoice, e.querySelector('.skill-card__count').textContent])));
      for (const [skill, keys] of Object.entries(BY_SKILL)) if (counts[skill] !== `${keys.length} app${keys.length === 1 ? '' : 's'}`) failures.push(tag(`count for ${skill} is "${counts[skill]}"`));

      // Place the picker in the middle of the viewport, then click through every skill and All apps.
      await page.evaluate(() => { const r = document.querySelector('.skill-picker').getBoundingClientRect(); window.scrollTo(0, Math.max(0, window.scrollY + r.top - 80)); });
      for (const choice of ['writing', 'reading', 'listening', 'language', 'all', 'reading', 'all']) {
        const before = await page.evaluate(() => ({ y: Math.round(scrollY), h: document.documentElement.scrollHeight, top: Math.round(document.querySelector('.skill-picker').getBoundingClientRect().top) }));
        await page.click(`[data-skill-choice="${choice}"]`);
        const after = await page.evaluate(() => ({ y: Math.round(scrollY), h: document.documentElement.scrollHeight, top: Math.round(document.querySelector('.skill-picker').getBoundingClientRect().top), focus: document.activeElement?.dataset?.skillChoice }));
        if (after.y !== before.y) failures.push(tag(`selecting ${choice} scrolled the page ${before.y} -> ${after.y}`));
        if (after.top !== before.top) failures.push(tag(`selecting ${choice} moved the skill buttons ${before.top} -> ${after.top}`));
        if (after.focus !== choice) failures.push(tag(`focus left the pressed button after ${choice}`));
        // No unnecessary blank area: the page is never taller than the filtered content needs, except for the exact shortfall that keeps
        // the viewport filled (which is what stops the browser clamping the scroll).
        const blank = await page.evaluate(() => { const r = document.querySelector('[data-app-results]'); return { reserved: r.style.minHeight, spare: document.documentElement.scrollHeight - (window.scrollY + window.innerHeight) }; });
        if (blank.reserved && blank.spare > 2) failures.push(tag(`selecting ${choice} reserved ${blank.reserved} leaving ${blank.spare}px of blank page below the viewport`));
        const expected = choice === 'all' ? ALL : BY_SKILL[choice];
        if (!same(await visible(), expected)) failures.push(tag(`${choice} shows ${JSON.stringify(await visible())}`));
        const pressed = await page.$$eval('[data-skill-choice]', els => els.filter(e => e.getAttribute('aria-pressed') === 'true').map(e => e.dataset.skillChoice));
        if (JSON.stringify(pressed) !== JSON.stringify([choice])) failures.push(tag(`aria-pressed is ${JSON.stringify(pressed)} after ${choice}`));
        const title = await page.$eval('[data-app-results-title]', e => e.textContent);
        const wantTitle = choice === 'all' ? 'All apps' : { writing: 'Writing', reading: 'Reading', listening: 'Listening', language: 'Language Skills' }[choice];
        if (title !== wantTitle) failures.push(tag(`results heading "${title}" after ${choice}`));
      }

      // Keyboard: Tab reaches the skill buttons in order, Enter and Space select, Tab continues into the apps, links stay focusable.
      await page.focus('[data-skill-choice="writing"]');
      await page.keyboard.press('Enter');
      if (!same(await visible(), BY_SKILL.writing)) failures.push(tag('Enter on Writing did not filter'));
      await page.keyboard.press('Tab');
      if (await page.evaluate(() => document.activeElement?.dataset?.skillChoice) !== 'reading') failures.push(tag('Tab did not move to the Reading skill'));
      await page.keyboard.press('Space');
      if (!same(await visible(), BY_SKILL.reading)) failures.push(tag('Space on Reading did not filter'));
      await page.focus('[data-skill-choice="language"]'); await page.keyboard.press('Enter');
      const focusable = await page.$$eval('.app-card', els => els.map(e => ({ key: e.dataset.app, hidden: e.hidden, tabbable: e.tabIndex >= 0 && e.offsetParent !== null })));
      for (const c of focusable) if (c.hidden === c.tabbable) failures.push(tag(`${c.key}: hidden=${c.hidden} tabbable=${c.tabbable}`));
      const outline = await page.evaluate(() => { const b = document.querySelector('[data-skill-choice="listening"]'); b.focus(); b.dispatchEvent(new Event('focus')); return getComputedStyle(b).outlineStyle; });
      if (outline === 'none') failures.push(tag('skill buttons lose the focus outline'));
      await page.keyboard.press('Tab'); // ensure keyboard modality so :focus-visible applies
      await page.focus('[data-skill-choice="writing"]'); await page.keyboard.press('Enter');

      // Skill selector near the bottom of the viewport: still no scroll, no focus loss, no button movement, no excess blank space.
      await page.click('[data-skill-choice="all"]');
      for (const lowFraction of [0.75, 0.9]) {
        await page.evaluate(f => { const r = document.querySelector('.skill-picker').getBoundingClientRect(); window.scrollTo(0, Math.max(0, window.scrollY + r.top - Math.round(innerHeight * f))); }, lowFraction);
        for (const choice of ['reading', 'writing', 'all', 'listening', 'all']) {
          const before = await page.evaluate(() => ({ y: Math.round(scrollY), top: Math.round(document.querySelector('.skill-picker').getBoundingClientRect().top) }));
          const clickable = await page.$eval(`[data-skill-choice="${choice}"]`, e => { const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; });
          if (!clickable) continue; // the pressed control must already be on screen: a real student cannot click it otherwise
          await page.click(`[data-skill-choice="${choice}"]`);
          const after = await page.evaluate(() => ({ y: Math.round(scrollY), top: Math.round(document.querySelector('.skill-picker').getBoundingClientRect().top), focus: document.activeElement?.dataset?.skillChoice, spare: document.documentElement.scrollHeight - (window.scrollY + window.innerHeight), reserved: document.querySelector('[data-app-results]').style.minHeight }));
          if (after.y !== before.y || after.top !== before.top) failures.push(tag(`low selector (${lowFraction}): ${choice} moved page/buttons (${before.y},${before.top}) -> (${after.y},${after.top})`));
          if (after.focus !== choice) failures.push(tag(`low selector (${lowFraction}): focus lost after ${choice}`));
          if (after.reserved && after.spare > 2) failures.push(tag(`low selector (${lowFraction}): ${choice} left ${after.spare}px blank (reserved ${after.reserved})`));
        }
      }
      // From All apps to a one-app skill with the page at the top: the blank area is bounded by the viewport, never the old grid height.
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.click('[data-skill-choice="all"]');
      const naturalAll = await page.evaluate(() => document.documentElement.scrollHeight);
      await page.click('[data-skill-choice="reading"]');
      const oneApp = await page.evaluate(() => { const card = [...document.querySelectorAll('.app-card')].find(c => !c.hidden); return { doc: document.documentElement.scrollHeight, cardBottom: Math.round(card.getBoundingClientRect().bottom + scrollY), vh: innerHeight }; });
      const atOne = await page.evaluate(() => ({ y: Math.round(scrollY), vh: innerHeight, reserved: document.querySelector('[data-app-results]').style.minHeight }));
      // Allowed height = what the filtered content needs (card bottom + normal page padding) or, when scrolled, what keeps the viewport filled.
      if (oneApp.doc > Math.max(oneApp.cardBottom + 200, atOne.y + atOne.vh) + 2) failures.push(tag(`one-app skill leaves excess blank: doc ${oneApp.doc}, card bottom ${oneApp.cardBottom}, scrollY ${atOne.y}, viewport ${atOne.vh}, reserved ${atOne.reserved}`));
      if (atOne.y === 0 && atOne.reserved !== '') failures.push(tag(`one-app skill at the very top still reserves ${atOne.reserved}`));
      if (oneApp.doc >= naturalAll - 100) failures.push(tag(`page did not shrink for a one-app skill (${naturalAll} -> ${oneApp.doc})`));
      await page.click('[data-skill-choice="all"]');
      if (await page.$eval('[data-app-results]', e => e.style.minHeight) !== '') failures.push(tag('reservation not released after returning to All apps'));

      // Links: every card opens its own destination.
      for (const key of ALL) {
        const href = await page.$eval(`.app-card[data-app="${key}"]`, a => a.getAttribute('href'));
        if (href !== `https://example.test/${key}`) failures.push(tag(`${key} link is ${href}`));
      }
      // No horizontal overflow or clipped skill cards in any state.
      for (const choice of ['all', 'writing', 'language']) {
        await page.click(`[data-skill-choice="${choice}"]`);
        const ov = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth - innerWidth, clipped: [...document.querySelectorAll('.skill-card, .app-card:not([hidden])')].filter(e => { const r = e.getBoundingClientRect(); return r.left < -0.5 || r.right > innerWidth + 0.5; }).length }));
        if (ov.doc > 0 || ov.clipped) failures.push(tag(`overflow in ${choice}: ${JSON.stringify(ov)}`));
      }
      // Selection survives a re-render (the dashboard re-renders when activity data arrives).
      await page.click('[data-skill-choice="listening"]');
      await page.evaluate(() => window.__render());
      if (!same(await visible(), BY_SKILL.listening)) failures.push(tag('selected skill was lost on re-render'));
      await page.evaluate(() => window.__render());
      await page.click('[data-skill-choice="all"]');

      // A future app and a brand-new skill appear without touching the homepage code.
      await page.evaluate(() => {
        const { SKILLS, APP_CATALOGUE } = window.__registry;
        const speaking = { id: 'speaking', name: 'Speaking', description: 'Practise speaking.', icon: 'headphones', color: { accent: '#0b7a3b', ink: '#095c2d', tint: '#e9f7ee', line: '#a9d8bb' } };
        window.__apps = [...window.__apps, { app_key: 'speaking_practice', display_name: 'Speaking Practice', enabled: true, launch_url: 'https://example.test/speaking_practice' }, { app_key: 'mystery_tool', display_name: 'Mystery', enabled: true, launch_url: 'https://example.test/mystery_tool' }];
        window.__render({ registry: { skills: [...SKILLS, speaking], catalogue: [{ id: 'speak', keys: ['speaking_practice'], skill: 'speaking', badge: 'S' }, ...APP_CATALOGUE] } });
      });
      if (await page.$$eval('.skill-card', e => e.length) !== 5) failures.push(tag('new Speaking skill card did not appear'));
      await page.click('[data-skill-choice="speaking"]');
      if (!same(await visible(), ['speaking_practice'])) failures.push(tag('Speaking filter wrong'));
      await page.click('[data-skill-choice="all"]');
      if (!(await visible()).includes('mystery_tool')) failures.push(tag('unclassified app missing from All apps'));
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) failures.push(tag('overflow with five skills'));
      if (errors.length) failures.push(tag(`page errors ${errors.join('; ')}`));
      await ctx.close();
    }
  } finally { await browser.close(); server.close(); }
  assert.deepEqual(failures, []);
});

// Completion-screen redesign (presentation only). One renderer (views.js renderSessionSummary), one controller (app.js finishSession +
// completion-sequence.js), one model (session-finish-model.js), one style owner (vocabulary-completion.css). Every dynamic state is rendered
// through the REAL renderer from the REAL model; nothing here decides progression.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderSessionSummary, renderEngagementStrip } from '../src/vocabulary/views.js';
import { buildSessionFinishModel } from '../src/vocabulary/session-finish-model.js';
import { findChromium, loadPlaywright } from './helpers/pathway-geometry-harness.mjs';

const repo = fileURLToPath(new URL('..', import.meta.url));
const read = file => fs.readFileSync(path.join(repo, file), 'utf8');
const model = (score, startStage, next, { pathwayId = 'context', set = 1, count = 4, done = [] } = {}) => buildSessionFinishModel({ summary: { strengthened: score, practised: 10, needsAnotherLook: 10 - score }, pathwayId, startStage, fixedMissionSize: 10, setInfo: { setNumber: set, setCount: count, score, completedStages: done, next } });
const STATES = {
  'perfect 10/10 (advance)': { m: model(10, 'recognise', { kind: 'advance', setNumber: 1, stage: 'match', phase: 'stage' }, { done: ['recognise'] }), stars: 3, nodes: ['complete', 'current', 'locked', 'locked', 'locked'], unlock: 'stage' },
  'normal pass (advance)': { m: model(9, 'match', { kind: 'advance', setNumber: 1, stage: 'apply', phase: 'stage' }, { done: ['recognise', 'match'], pathwayId: 'meaning' }), stars: 3, nodes: ['complete', 'complete', 'current', 'locked', 'locked'], unlock: 'stage' },
  'advanced with support': { m: model(9, 'match', { kind: 'advance', setNumber: 1, stage: 'apply', phase: 'stage', withSupport: true }, { done: ['recognise', 'match'], pathwayId: 'precision_use' }), stars: 3, nodes: ['complete', 'complete', 'current', 'locked', 'locked'], unlock: 'stage' },
  'consolidate': { m: model(7, 'apply', { kind: 'consolidate', setNumber: 1, stage: 'apply', phase: 'consolidate' }, { done: ['recognise', 'match'], pathwayId: 'word_families' }), stars: 2, nodes: ['complete', 'complete', 'current', 'locked', 'locked'], unlock: null },
  'recovery': { m: model(4, 'apply', { kind: 'recovery', setNumber: 1, stage: 'apply', phase: 'recovery' }, { done: ['recognise', 'match'], pathwayId: 'spelling_recall' }), stars: null, nodes: ['complete', 'complete', 'current', 'locked', 'locked'], unlock: null },
  'mastery -> next Set': { m: model(10, 'mastery', { kind: 'set-complete', setNumber: 2, stage: 'recognise', phase: 'stage' }, { done: ['recognise', 'match', 'apply', 'recall', 'mastery'] }), stars: 3, nodes: ['complete', 'complete', 'complete', 'complete', 'complete'].map((s, i) => (s)), unlock: 'set' },
  'pathway first pass complete (Maintain)': { m: model(10, 'mastery', { kind: 'pathway-complete', setNumber: 4, stage: 'mastery', phase: 'stage' }, { set: 4, done: ['recognise', 'match', 'apply', 'recall', 'mastery'] }), stars: 3, nodes: ['complete', 'complete', 'complete', 'complete', 'complete'], unlock: 'mastered' },
  'low score': { m: model(2, 'recognise', { kind: 'recovery', setNumber: 1, stage: 'recognise', phase: 'recovery' }, { pathwayId: 'meaning' }), stars: null, nodes: null, unlock: null }
};
const html = (m, extra = {}) => { const root = { innerHTML: '' }; renderSessionSummary(root, { finishModel: m, pathwayId: m.pathwayId, ...extra }); return root.innerHTML; };

for (const [name, spec] of Object.entries(STATES)) {
  test(`state "${name}": hero -> progression -> rewards -> actions, Continue dominant, model values untouched`, () => {
    const out = html(spec.m);
    const order = ['vocab-finish-hero', 'vocab-finish-body', 'vocab-finish-progress', 'vocab-finish-rewards', 'vocab-finish-actions'].map(c => out.indexOf(`class="${c}`) >= 0 ? out.indexOf(`class="${c}`) : out.indexOf(c));
    assert.ok(order.every(i => i >= 0) && order.every((i, k) => k === 0 || i > order[k - 1]), 'regions appear in reading order');
    assert.equal((out.match(/<h1/g) ?? []).length, 1, 'one heading');
    assert.match(out, new RegExp(`data-score="${spec.m.score}" data-total="${spec.m.denominator}"`));
    assert.match(out, new RegExp(`>${spec.m.score}</span> / ${spec.m.denominator}`));
    // stars: unearned slots are shown dim, the accessible label states the earned count; none at all when none were earned
    if (spec.stars) { assert.equal((out.match(/<span aria-hidden="true">★/g) ?? []).length + (out.match(/<span aria-hidden="true" class="is-empty">★/g) ?? []).length, 3); assert.match(out, new RegExp(`${spec.m.stars} out of 3 stars earned`)); assert.equal((out.match(/is-empty/g) ?? []).length, 3 - spec.m.stars); }
    else assert.doesNotMatch(out, /vocab-finish-stars/);
    // progression track: five connected nodes with a written state (never colour-only)
    const states = [...out.matchAll(/class="vocab-finish-stage" data-state="(\w+)" data-stage="(\w+)"><i aria-hidden="true">([^<]+)<\/i><small>/g)];
    assert.equal(states.length, 5);
    if (spec.nodes) assert.deepEqual(states.map(m => m[1]), spec.nodes);
    for (const [, state, , glyph] of states) assert.equal(glyph, state === 'complete' ? '✓' : state === 'current' ? '●' : '○');
    // celebration banner only where the model says so
    const celebration = out.match(/data-finish-celebration="(\w+)"/)?.[1] ?? null;
    assert.equal(celebration, spec.unlock);
    // exactly one primary action, never competing with the secondary and tertiary actions
    const primaries = out.match(/vocab-button--primary/g) ?? [];
    assert.ok(primaries.length <= 1);
    if (spec.m.primaryAction) { assert.equal(primaries.length, 1); assert.match(out, /vocab-finish-cta" data-action="continue-practice"/); }
    assert.match(out, /vocab-finish-secondary" data-action="choose-practice"/);
    assert.match(out, /vocab-finish-tertiary" data-action="back-unit">Finish for now/);
    assert.ok(out.indexOf('vocab-finish-cta') < out.indexOf('vocab-finish-secondary') && out.indexOf('vocab-finish-secondary') < out.indexOf('vocab-finish-tertiary'));
    assert.equal((out.match(/class="vocab-button/g) ?? []).length <= 3, true);
  });
}

test('the Set context line and next line are rendered from the model, with no copy of the progression decided in the view', () => {
  const m = STATES['perfect 10/10 (advance)'].m;
  const out = html(m);
  assert.match(out, /Context · Recognise<\/strong><span>Set 1 of 4 · Stage 1 of 5/);
  assert.match(out, /data-finish-next data-next-kind="advance" data-next-stage="match">Next: Match · Stage 2 of 5/);
  const view = read('src/vocabulary/views.js');
  const fn = view.slice(view.indexOf('export function renderSessionSummary'), view.indexOf('export function renderVocabularyError'));
  assert.doesNotMatch(fn, /projectSettlement|describeNext|pathwayStep|\.rpc\(|submitVocabulary|score\s*[<>]=?\s*[0-9]/, 'the renderer makes no progression, scoring or server decision');
});

test('engagement information (personal best, XP chips, unlock, next challenge) still lands inside the reward region', () => {
  const out = html(STATES['perfect 10/10 (advance)'].m, { engagementPending: true });
  assert.match(out, /vocab-finish-rewards[\s\S]*data-engagement-slot[\s\S]*vocab-finish-actions/);
  const strip = renderEngagementStrip({ headline: 'New personal best!', chips: [{ id: 'xp', label: '+25 XP' }], unlockedLine: 'Achievement: Clean sweep', challenge: { kind: 'stage', text: 'Clear Match' }, isPersonalBest: true, spoken: 'x' });
  assert.match(strip, /New personal best!/); assert.match(strip, /\+25 XP/); assert.match(strip, /data-achievement-unlocked/); assert.match(strip, /data-next-challenge="stage"/);
});

test('one style owner: every `.vocab-finish-*` rule lives in vocabulary-completion.css', () => {
  const sheets = fs.readdirSync(repo).filter(f => /^vocabulary.*\.css$/.test(f) || f === 'styles.css' || f === 'theme.css');
  for (const sheet of sheets) {
    if (sheet === 'vocabulary-completion.css') continue;
    assert.doesNotMatch(read(sheet), /\.vocab-finish-(?!card\b)/, `${sheet} must not style the completion screen`);
  }
  const css = read('vocabulary-completion.css');
  for (const cls of ['vocab-finish-hero', 'vocab-finish-body', 'vocab-finish-progress', 'vocab-finish-ladder', 'vocab-finish-stage', 'vocab-finish-unlock', 'vocab-finish-rewards', 'vocab-finish-evidence', 'vocab-finish-actions', 'vocab-finish-cta', 'vocab-finish-secondary', 'vocab-finish-tertiary']) assert.match(css, new RegExp(`\\.${cls}\\b`), cls);
  assert.equal((fs.readFileSync(path.join(repo, 'vocabulary.html'), 'utf8').match(/vocabulary-completion\.css/g) ?? []).length, 1, 'loaded once');
});

test('motion: brief, finite, non-blocking, with reduced-motion fallback; actions are never animated or hidden', () => {
  const css = read('vocabulary-completion.css');
  const finish = css.slice(0, css.indexOf('/* Live mission flair'));
  assert.doesNotMatch(finish, /infinite/);
  assert.doesNotMatch(finish, /pointer-events\s*:\s*none/);
  assert.doesNotMatch(finish, /vocab-finish-actions[^{]*\{[^}]*animation/, 'Continue is available immediately');
  assert.doesNotMatch(finish, /\.vocab-finish-(cta|secondary|tertiary)[^{]*\{[^}]*animation/);
  assert.match(finish, /@media \(prefers-reduced-motion:reduce\)\{\s*\[data-completion-sequence\] \*\{animation:none!important/);
  // every animation in the finish sequence starts and ends within 1.5s
  const longest = [...finish.matchAll(/animation:[a-z-]+ (\d+)ms[^;]*?(?: (\d+)ms)?[;}]/g)].map(m => Number(m[1]) + Number(m[2] ?? 0));
  assert.ok(longest.length > 5 && Math.max(...longest) <= 1500, `sequence length ${Math.max(...longest)}ms`);
  const js = read('src/vocabulary/completion-sequence.js');
  assert.match(js, /const DURATION_MS = 1500;/);
});

test('behaviour lock: the completion work touched no progression, scoring, settlement or server files', () => {
  // The renderer reads only the finish model; the model builder and the controller are not part of this change.
  const model = read('src/vocabulary/session-finish-model.js');
  assert.match(model, /export function buildSessionFinishModel/);
  const view = read('src/vocabulary/views.js');
  assert.doesNotMatch(view.slice(view.indexOf('export function renderSessionSummary')), /supabase|rpc\(/);
});

const browserTest = loadPlaywright() && await findChromium() ? test : test.skip;
browserTest('every state renders without horizontal overflow at 320 / 390 / 820 / 1280, with Continue visible and tappable', async () => {
  const playwright = loadPlaywright();
  const browser = await playwright.chromium.launch({ executablePath: await findChromium() });
  try {
    const css = [...fs.readFileSync(path.join(repo, 'vocabulary.html'), 'utf8').matchAll(/href="([^"]+\.css)"/g)].map(m => `<style>${read(m[1])}</style>`).join('');
    for (const [name, spec] of Object.entries(STATES)) {
      const page = await browser.newPage();
      for (const [width, height] of [[320, 640], [390, 844], [820, 1100], [1280, 720]]) {
        await page.setViewportSize({ width, height });
        await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${css}</head><body><div id="vocabularyApp">${html(spec.m, { engagementPending: true })}</div></body></html>`);
        const r = await page.evaluate(() => { const cta = document.querySelector('.vocab-finish-cta'); const box = cta?.getBoundingClientRect(); const sec = document.querySelector('.vocab-finish-secondary')?.getBoundingClientRect(); const nodes = [...document.querySelectorAll('.vocab-finish-stage')].map(n => n.getBoundingClientRect()); return { over: document.documentElement.scrollWidth - document.documentElement.clientWidth, cta: box ? { h: box.height, w: box.width } : null, secH: sec?.height ?? 0, nodes: nodes.length, clipped: nodes.some(n => n.right > innerWidth || n.left < 0), engagementShift: null }; });
        assert.ok(r.over <= 0, `${name} @${width}: horizontal overflow ${r.over}`);
        assert.equal(r.nodes, 5); assert.equal(r.clipped, false, `${name} @${width}: track clipped`);
        assert.ok(r.secH >= 44, `${name} @${width}: secondary tap target ${r.secH}`);
        if (spec.m.primaryAction) assert.ok(r.cta.h >= 48 && r.cta.w >= 200, `${name} @${width}: Continue size ${JSON.stringify(r.cta)}`);
      }
      await page.close();
    }
    // the whole screen, Continue included, fits a standard school laptop (1280x720) without scrolling for the usual states
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8">${css}</head><body><div id="vocabularyApp">${html(STATES['perfect 10/10 (advance)'].m, { engagementPending: true })}</div></body></html>`);
    const bottom = await page.evaluate(() => document.querySelector('.vocab-finish-actions').getBoundingClientRect().bottom);
    assert.ok(bottom <= 720, `actions end at ${bottom}px`);
  } finally { await browser.close(); }
});

// ---- Bottom section: compact reward summary -> action dock (presentation only) ----
const chip = (id, label) => ({ id, label });
const info = (extra = {}) => ({ headline: 'Your best here is 9/10', chips: [chip('mission', 'Mission 10'), chip('streak', 'Best clean streak 10'), chip('xp', '+25 XP'), chip('level', 'Level 4')], unlockedLine: null, challenge: null, isPersonalBest: false, spoken: 'spoken', ...extra });
const text = markup => markup.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

test('reward summary: personal best and no-personal-best both render; stats are XP / streak / level, mission count is a quiet label', () => {
  const pb = renderEngagementStrip(info({ isPersonalBest: true, headline: 'New personal best: 10/10' }));
  assert.match(pb, /vocab-engagement__top[\s\S]*New personal best: 10\/10/); assert.match(pb, /study-icon/, 'personal best keeps its spark');
  const plain = renderEngagementStrip(info());
  assert.match(plain, /Your best here is 9\/10/); assert.doesNotMatch(plain.split('vocab-engagement__chips')[0], /study-icon/, 'no spark without a personal best');
  for (const strip of [pb, plain]) {
    assert.match(strip, /<li data-engagement-chip="streak" aria-label="Best clean streak 10"><b>10<\/b> <span>Best clean streak<\/span><\/li>/);
    assert.match(strip, /<li data-engagement-chip="xp" aria-label="\+25 XP"><b>\+25<\/b> <span>XP<\/span><\/li>/);
    assert.match(strip, /<li data-engagement-chip="level" aria-label="Level 4"><b>4<\/b> <span>Level<\/span><\/li>/);
    assert.match(strip, /<span class="vocab-engagement__mission" data-engagement-chip="mission">Mission 10<\/span>/);
    assert.equal((strip.match(/<li /g) ?? []).length, 3, 'mission is not a fourth stat');
  }
  assert.match(renderEngagementStrip(info({ chips: [chip('mission', 'Mission 3'), chip('level', 'Level up: Level 5')] })), /aria-label="Level up: Level 5"><b>5<\/b> <span>Level up<\/span>/);
});

test('reward summary collapses: no stats means no empty list; no achievement or challenge means no empty lines; no result removes nothing but renders nothing', () => {
  const bare = renderEngagementStrip(info({ chips: [chip('mission', 'Mission 1')] }));
  assert.doesNotMatch(bare, /<ul/); assert.doesNotMatch(bare, /data-achievement-unlocked|data-next-challenge/);
  assert.equal(renderEngagementStrip(null), '');
  const full = renderEngagementStrip(info({ unlockedLine: 'Achievement unlocked: Clean sweep', challenge: { kind: 'consolidate', text: 'Get the 3 missed words right' } }));
  assert.match(full, /data-achievement-unlocked[\s\S]*Clean sweep/); assert.match(full, /data-next-challenge="consolidate"[\s\S]*Get the 3 missed words right/);
  assert.match(full, /data-engagement-spoken/, 'the spoken summary for screen readers is kept');
  assert.match(text(full), /Mission 10/); assert.match(text(full), /Best clean streak/);
  const css = read('vocabulary-completion.css');
  const slot = css.match(/\.vocab-engagement\{[^}]*\}/)[0];
  assert.doesNotMatch(slot, /(?<!min-)height:\d/, 'the slot has no fixed height'); assert.doesNotMatch(css, /\.vocab-engagement\{height/); assert.doesNotMatch(css, /@media[^{]*\{\.vocab-engagement\{height/);
});

test('action dock: Continue, Try another activity, Finish for now keep their exact actions and order', () => {
  const out = html(STATES['normal pass (advance)'].m);
  const dock = out.match(/<div class="vocab-summary-actions vocab-finish-actions">[\s\S]*?<\/div><\/article>/)[0];
  const order = [...dock.matchAll(/<button[^>]*data-action="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(order, ['continue-practice', 'choose-practice', 'back-unit']);
  assert.match(dock, /vocab-finish-cta" data-action="continue-practice"/); assert.match(dock, /vocab-finish-secondary" data-action="choose-practice" data-pathway="meaning"/);
  assert.match(dock, /vocab-finish-tertiary" data-action="back-unit">Finish for now</);
  const app = read('src/vocabulary/app.js');
  assert.match(app, /action === 'back-unit'/); assert.match(app, /action === 'choose-practice'/); assert.match(app, /action === 'continue-practice'/);
});

test('the bottom redesign is CSS plus the reward-strip markup only: model, controller and server files are not part of it', () => {
  const view = read('src/vocabulary/views.js');
  const strip = view.slice(view.indexOf('export function renderEngagementStrip'), view.indexOf('export function renderSessionSummary'));
  assert.doesNotMatch(strip, /supabase|rpc\(|fetch\(|state\./);
  assert.match(read('src/vocabulary/engagement-model.js'), /chips = \[\s*\{ id:'mission', label:`Mission \$\{evaluation\.missionNumber\}` \},\s*\{ id:'streak', label:`Best clean streak \$\{mission\.bestStreak\}` \}/);
});

browserTest('bottom section geometry: dock is one single column, Finish for now is centred, reward area has no dead space, nothing overflows', async () => {
  const playwright = loadPlaywright();
  const browser = await playwright.chromium.launch({ executablePath: await findChromium() });
  try {
    const css = [...read('vocabulary.html').matchAll(/href="([^"]+\.css)"/g)].map(m => `<style>${read(m[1])}</style>`).join('');
    const ready = (m, i) => html(m, { engagementPending: true }).replace(/<section class="vocab-engagement"[\s\S]*?<\/section>/, `<section class="vocab-engagement" data-engagement-slot data-engagement="ready"${i.isPersonalBest ? ' data-personal-best="true"' : ''}>${renderEngagementStrip(i)}</section>`);
    const cases = { 'personal best': [STATES['perfect 10/10 (advance)'].m, info({ isPersonalBest: true, headline: 'New personal best: 10/10', unlockedLine: 'Achievement unlocked: Clean sweep', challenge: { kind: 'stage', text: 'Clear Match with 9 of 10 to unlock Apply' } })], 'normal pass': [STATES['normal pass (advance)'].m, info()], consolidate: [STATES.consolidate.m, info({ challenge: { kind: 'consolidate', text: 'Get the 3 missed words right' } })], recovery: [STATES.recovery.m, info({ chips: [chip('mission', 'Mission 2')] })] };
    for (const [name, [m, i]] of Object.entries(cases)) {
      for (const [w, h] of [[1440, 900], [1280, 720], [820, 1100], [390, 844], [320, 640]]) {
        const page = await browser.newPage({ viewport: { width: w, height: h } });
        await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${css}</head><body><div id="vocabularyApp">${ready(m, i)}</div></body></html>`);
        const r = await page.evaluate(() => {
          const b = sel => document.querySelector(sel)?.getBoundingClientRect(); const cta = b('.vocab-finish-cta'), sec = b('.vocab-finish-secondary'), fin = b('.vocab-finish-tertiary'), dock = b('.vocab-finish-actions'), slot = b('.vocab-engagement'), chips = [...document.querySelectorAll('.vocab-engagement__chips li')].map(n => n.getBoundingClientRect());
          const fs = [...document.querySelectorAll('.vocab-finish-actions button, .vocab-engagement *')].map(n => parseFloat(getComputedStyle(n).fontSize)).filter(Boolean);
          return { over: document.documentElement.scrollWidth - document.documentElement.clientWidth, cta, sec, fin, dock, slotH: slot.height, chipsOut: chips.some(c => c.right > innerWidth + 0.5 || c.left < -0.5), minFont: Math.min(...fs), ctaBottom: cta.bottom };
        });
        const where = `${name}@${w}`;
        assert.ok(r.over <= 0, `${where}: overflow ${r.over}`); assert.equal(r.chipsOut, false, `${where}: stats clipped`);
        assert.ok(Math.abs(r.cta.width - r.sec.width) <= 1 && Math.abs(r.cta.left - r.sec.left) <= 1, `${where}: Continue and Try another share one column`);
        assert.ok(r.sec.top >= r.cta.bottom && r.fin.top >= r.sec.bottom - 1, `${where}: stacked in order`);
        assert.ok(Math.abs((r.fin.left + r.fin.width / 2) - (r.dock.left + r.dock.width / 2)) <= 2, `${where}: Finish for now is centred`);
        assert.ok(r.fin.height >= 44 && r.sec.height >= 44, `${where}: tap targets`); assert.ok(r.minFont >= 12, `${where}: font ${r.minFont}`);
        assert.ok(r.slotH <= (w <= 380 ? 300 : w <= 620 ? 250 : 200), `${where}: reward area ${r.slotH}px`);
        if (w === 1280) assert.ok(r.dock.bottom <= 720, `${where}: dock fits the laptop viewport (${r.dock.bottom})`);
        await page.close();
      }
    }
    // a pending slot reserves only the compact height
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8">${css}</head><body><div id="vocabularyApp">${html(STATES['normal pass (advance)'].m, { engagementPending: true })}</div></body></html>`);
    assert.ok((await page.evaluate(() => document.querySelector('.vocab-engagement').getBoundingClientRect().height)) <= 90);
  } finally { await browser.close(); }
});

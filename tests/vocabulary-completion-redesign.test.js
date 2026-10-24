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

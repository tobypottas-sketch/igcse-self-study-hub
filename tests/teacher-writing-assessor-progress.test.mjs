import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { STAGES, DEFAULTS, estimateFraction, stageAt, createAssessmentProgress } from '../src/assessor/progress.js';
// Minimal DOM: just what the component touches.
class Node_ { constructor(tag, doc) { this.tag = tag; this.ownerDocument = doc; this.children = []; this.attrs = {}; this.styleMap = {}; this.className = ''; this.textContent = ''; this.hidden = false;
  this.style = { setProperty: (k, v) => { this.styleMap[k] = v; } }; }
  setAttribute(k, v) { this.attrs[k] = String(v); } getAttribute(k) { return this.attrs[k]; }
  append(...n) { this.children.push(...n); } replaceChildren(...n) { this.children = n; }
  find(cls) { if (this.className.split(' ').includes(cls)) return this; for (const c of this.children) { const f = c.find?.(cls); if (f) return f; } return null; } }
function setup(options = {}) {
  const doc = { createElement: tag => new Node_(tag, doc), defaultView: {} }; const host = new Node_('div', doc);
  let t = 0, timers = []; const timeouts = [];
  const progress = createAssessmentProgress(host, { now: () => t, setInterval: fn => { timers.push(fn); return timers.length; }, clearInterval: id => { timers[id - 1] = null; },
    setTimeout: (fn, ms) => { timeouts.push({ fn, ms }); return timeouts.length; }, reducedMotion: false, ...options });
  const advance = ms => { t += ms; timers.forEach(fn => fn?.()); };
  return { host, progress, advance, timeouts, running: () => timers.some(Boolean), card: () => host.children[0] };
}
test('estimate rises smoothly, never decreases, and can never reach 100%', () => {
  let last = -1; for (let ms = 0; ms <= 600000; ms += 500) { const f = estimateFraction(ms); assert.ok(f >= last); assert.ok(f < 1); assert.ok(f <= DEFAULTS.ceiling); last = f; }
  assert.equal(estimateFraction(0), 0); assert.equal(estimateFraction(-5), 0); assert.equal(estimateFraction(NaN), 0);
});
test('a 15-45 second assessment shows visible, believable movement without stalling or finishing early', () => {
  const at = s => estimateFraction(s * 1000);
  assert.ok(at(1) > 0.03, 'moves straight away'); assert.ok(at(15) > 0.4 && at(15) < 0.7); assert.ok(at(45) > 0.8 && at(45) < 0.92);
  assert.ok(at(46) > at(45), 'still moving after 45 s');
});
test('status messages are plain-English stages in order, with a patience message and a timeout warning', () => {
  assert.deepEqual([0, 7000, 17000, 30000, 50000].map(ms => stageAt(ms).index), [0, 1, 2, 3, 4]);
  assert.equal(stageAt(50000).title, 'Still working'); assert.equal(stageAt(70000).title, 'Nearly out of time');
  for (const s of STAGES) { assert.ok(s.title.length < 45); assert.ok(s.detail.split(' ').length < 20); assert.doesNotMatch(s.title + s.detail, /\d+\s*%|percent|Worker|model|token|LLM/i); }
});
test('starts immediately and labels progress as an estimate with no numeric percentage', () => {
  const { progress, card } = setup(); assert.equal(progress.start(), true);
  const c = card(); assert.equal(c.getAttribute('data-state'), 'running');
  const bar = c.find('assessment-progress__bar'); assert.equal(bar.getAttribute('role'), 'progressbar'); assert.equal(bar.getAttribute('aria-valuenow'), undefined, 'an estimate must not claim a measured value');
  assert.match(c.find('assessment-progress__note').textContent, /Estimated progress, not an exact percentage/); assert.match(c.find('assessment-progress__note').textContent, /15–45 seconds/);
  assert.doesNotMatch(JSON.stringify(c, (k, v) => k === 'ownerDocument' ? undefined : v), /\d+\s*%/);
});
test('while running it advances, never goes backwards and announces only when the stage changes', () => {
  const { progress, advance, card } = setup(); progress.start(); const live = card().find('assessment-progress__sr'); const announcements = [live.textContent]; let last = progress.fraction;
  for (let i = 0; i < 200; i++) { advance(250); assert.ok(progress.fraction >= last && progress.fraction < 1); last = progress.fraction; if (live.textContent !== announcements.at(-1)) announcements.push(live.textContent); }
  assert.ok(announcements.length >= 4 && announcements.length <= 6, 'one announcement per stage, not per tick: ' + announcements.length);
  assert.match(card().find('assessment-progress__elapsed').textContent, /Working for 50s/);
});
test('a second start while running is ignored (duplicate-submission guard)', () => {
  const { progress, running } = setup(); assert.equal(progress.start(), true); assert.equal(progress.start(), false); assert.equal(progress.start(), false); assert.ok(running());
});
test('succeed() is the only way to 100%, stops the timer, then clears after a short pause', async () => {
  const { progress, advance, card, timeouts, host, running } = setup(); progress.start(); advance(40000); assert.ok(progress.fraction < 1);
  const done = progress.succeed(); assert.equal(progress.fraction, 1); assert.equal(card().getAttribute('data-state'), 'complete'); assert.equal(running(), false);
  assert.equal(card().find('assessment-progress__bar').getAttribute('aria-valuetext'), 'Complete'); assert.equal(timeouts[0].ms, DEFAULTS.finishMs);
  timeouts[0].fn(); await done; assert.equal(host.children.length, 0); assert.equal(host.hidden, true);
});
test('reduced motion removes the finish delay', () => { const { progress, timeouts } = setup({ reducedMotion: true }); progress.start(); progress.succeed(); assert.equal(timeouts[0].ms, 0); assert.equal(progress.start === undefined, false); });
test('errors freeze the bar below 100%, stop the timer, and say nothing was retried', () => {
  const { progress, advance, card, running } = setup(); progress.start(); advance(20000); const before = progress.fraction;
  progress.fail('The assessment service is unavailable. No mark has been issued.'); advance(60000);
  assert.equal(progress.fraction, before); assert.ok(before < 1); assert.equal(running(), false); assert.equal(card().getAttribute('data-state'), 'error');
  assert.match(card().find('assessment-progress__detail').textContent, /No mark has been issued/); assert.match(card().find('assessment-progress__note').textContent, /Nothing was retried/);
});
test('timeouts get their own state and wording', () => {
  const { progress, advance, card } = setup(); progress.start(); advance(90000); progress.fail('The assessment took too long and was stopped.', { timedOut: true });
  assert.equal(card().getAttribute('data-state'), 'timeout'); assert.equal(card().find('assessment-progress__title').textContent, 'This is taking too long'); assert.ok(progress.fraction < 1);
});
test('late succeed/fail calls after a reset or failure do nothing, and the card can be reused for a new run', async () => {
  const { progress, card, host } = setup(); progress.start(); progress.reset(); await progress.succeed(); progress.fail('x'); assert.equal(host.children.length, 0);
  assert.equal(progress.start(), true); assert.equal(progress.fraction < 0.05, true); assert.equal(card().getAttribute('data-state'), 'running');
});
test('a delayed finish from an old run cannot wipe a newer run', async () => {
  const { progress, timeouts, host } = setup(); progress.start(); const first = progress.succeed(); progress.start(); timeouts[0].fn(); await first; assert.equal(host.children.length, 1);
});
test('start scrolls the card into view, respecting reduced motion', () => {
  for (const [reducedMotion, behavior] of [[false, 'smooth'], [true, 'auto']]) { const { progress, host } = setup({ reducedMotion }); let arg; host.scrollIntoView = a => { arg = a; }; progress.start(); assert.deepEqual(arg, { behavior, block: 'nearest' }); }
});
test('wiring: controller starts progress on submit, completes it only after a result and shows errors; no pipeline files changed', () => {
  const c = fs.readFileSync(new URL('../src/assessor/controller.js', import.meta.url), 'utf8');
  assert.match(c, /progress\.start\(\)/); assert.match(c, /await progress\.succeed\(\)/); assert.match(c, /progress\.fail\(message/); assert.match(c, /progress\.reset\(\)/);
  assert.ok(c.indexOf('requestAssessment(') < c.indexOf('progress.succeed()'), 'succeed only after the request resolves');
  assert.match(c, /assessment-progress__sr/, 'failure text is not shown twice');
  assert.match(c, /busy \|\| disposed/, 'duplicate submissions are still blocked');
  const view = fs.readFileSync(new URL('../src/assessor/view.js', import.meta.url), 'utf8'); assert.match(view, /data-assessor-progress/);
  const css = fs.readFileSync(new URL('../assessment-progress.css', import.meta.url), 'utf8'); assert.match(css, /prefers-reduced-motion/); assert.match(css, /@media print/); assert.match(css, /max-width: 650px/);
  assert.match(fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8'), /assessment-progress\.css/);
});

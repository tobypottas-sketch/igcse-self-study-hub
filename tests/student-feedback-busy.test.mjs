import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mountStudentFeedback } from '../src/assessor/student-feedback.js';
import { FeedbackError } from '../src/assessor/student-client.js';

class Node_ {
  constructor(tag, doc) { this.tag = tag; this.ownerDocument = doc; this.children = []; this.attrs = {}; this.className = ''; this.textContent = ''; this.hidden = false; this.disabled = false; this.checked = false; this.handlers = {};
    this.style = { setProperty() {} }; this.classList = { add: c => { if (!this.className.split(' ').includes(c)) this.className = (this.className + ' ' + c).trim(); }, remove: c => { this.className = this.className.split(' ').filter(x => x !== c).join(' '); }, toggle: () => {} }; }
  setAttribute(k, v) { this.attrs[k] = String(v); } append(...n) { this.children.push(...n); } prepend(...n) { this.children.unshift(...n); } replaceChildren(...n) { this.children = n; }
  addEventListener(type, fn) { (this.handlers[type] ||= []).push(fn); } removeEventListener() {} focus() {} scrollIntoView() {}
  click() { if (!this.disabled) (this.handlers.click || []).forEach(fn => fn({})); }
  find(cls) { if (this.className.split(' ').includes(cls)) return this; for (const c of this.children) { const f = c.find?.(cls); if (f) return f; } return null; }
}
function setup(request, extra = {}) {
  const doc = { createElement: tag => new Node_(tag, doc), createTextNode: text => ({ textContent: text }), defaultView: { addEventListener() {}, removeEventListener() {}, setInterval: () => 1, clearInterval() {}, setTimeout: fn => { fn(); return 1; }, performance: { now: () => 0 }, matchMedia: () => ({ matches: true }) } };
  const host = new Node_('div', doc); const log = [];
  const feedback = mountStudentFeedback(host, { app: 'review', getClient: async () => ({}), getTask: () => 'Write a review of a film for the school magazine.', getResponse: () => 'I watched a film last week and I liked it because it was exciting.',
    request, onBusyChange: busy => log.push(busy), progressOptions: { reducedMotion: true, setInterval: () => 1, clearInterval() {}, setTimeout: fn => { fn(); return 1; }, now: () => 0 }, ...extra });
  const section = host.children[0]; const consent = section.children.find(c => c.className === 'sf-consent').children[0]; const button = section.children.find(c => c.className === 'sf-button');
  return { feedback, log, button, consent, host };
}
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
const GOOD = { partial: true, strengths: [], improvements: [], nextStep: '', lengthNotice: null, scores: null };

test('busy is reported true while the request runs and false when it succeeds, and the request is not aborted by anything else', async () => {
  let release, signal;
  const { log, button, consent } = setup((client, input, options) => { signal = options.signal; return new Promise(resolve => { release = () => resolve(GOOD); }); });
  consent.checked = true; button.click(); await tick();
  assert.deepEqual(log, [true]);
  assert.equal(signal.aborted, false);
  release(); await tick(); await tick();
  assert.deepEqual(log, [true, false]);
  assert.equal(signal.aborted, false, 'a finished request was never cancelled');
});

test('busy is restored to false after every kind of failure', async () => {
  for (const failure of [new FeedbackError('too long', 'timeout'), new FeedbackError('limit', 'rate_daily'), new FeedbackError('offline', 'network'), new Error('unexpected')]) {
    const { log, button, consent } = setup(async () => { throw failure; });
    consent.checked = true; button.click(); await tick(); await tick();
    assert.deepEqual(log, [true, false], failure.code ?? failure.message);
    assert.equal(button.disabled, false, 'the button works again');
  }
});

test('a second click while busy does not start another request or report busy again', async () => {
  let calls = 0, release;
  const { log, button, consent } = setup(() => { calls++; return new Promise(resolve => { release = () => resolve(GOOD); }); });
  consent.checked = true; button.click(); await tick(); button.click(); await tick();
  assert.equal(calls, 1); assert.deepEqual(log, [true]);
  release(); await tick(); await tick(); assert.deepEqual(log, [true, false]);
});

test('clear() and dispose() release the busy state, and a throwing page callback never breaks feedback', async () => {
  let release;
  const first = setup(() => new Promise(resolve => { release = () => resolve(GOOD); }));
  first.consent.checked = true; first.button.click(); await tick();
  first.feedback.clear(); assert.deepEqual(first.log, [true, false]);
  release(); await tick(); await tick(); assert.deepEqual(first.log, [true, false], 'a cleared request does not report again');
  const second = setup(async () => GOOD, { onBusyChange: () => { throw new Error('page bug'); } });
  second.consent.checked = true; second.button.click(); await tick(); await tick();
  assert.equal(second.button.disabled, false);
});

test('apps that do not pass onBusyChange (Informal Email, Essay) behave as before', async () => {
  const { button, consent } = setup(async () => GOOD, { onBusyChange: undefined });
  consent.checked = true; button.click(); await tick(); await tick();
  assert.equal(button.disabled, false);
  for (const file of ['src/assessor/email-feedback.js', 'src/assessor/essay-feedback.js']) assert.doesNotMatch(readFileSync(file, 'utf8'), /onBusyChange|review-feedback-busy/);
});

test('Review Writing locks its task controls while busy and never cancels the request', () => {
  const html = readFileSync('review-writing.html', 'utf8');
  assert.match(readFileSync('src/assessor/review-feedback.js', 'utf8'), /onBusyChange: busy => window\.dispatchEvent\(new CustomEvent\('review-feedback-busy'/);
  assert.match(html, /Feedback is being prepared\. You can change tasks when it's ready\./);
  const lock = html.slice(html.indexOf('function setFeedbackBusy'), html.indexOf("window.addEventListener('review-feedback-busy'"));
  for (const part of ["[data-topic]", "$('questionSelect').disabled=busy", "$('customPrompt').disabled=busy", "$('taskBusyNote').hidden=!busy"]) assert.ok(lock.includes(part), part);
  for (const guard of ['if(feedbackBusy||!QUESTIONS[topic])return;', 'if(feedbackBusy){renderQuestionOptions();return;}', 'if(feedbackBusy){e.target.value=state.customPrompt;return;}', 'function switchBackToWorkTask(){\n if(feedbackBusy)return;']) assert.ok(html.includes(guard), guard);
  assert.doesNotMatch(readFileSync('src/assessor/review-feedback.js', 'utf8'), /feedback\.clear\(\)[^\n]*busy/);
});

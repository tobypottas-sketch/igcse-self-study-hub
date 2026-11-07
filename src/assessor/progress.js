// Reusable "assessment in progress" interface for every writing app that uses the shared assessor.
// Progress is ESTIMATED from elapsed time (the Worker reports no real progress), so the bar never claims a
// measured percentage and can only reach 100% when succeed() is called after a real, validated result.
export const STAGES = Object.freeze([
  { from: 0,     title: 'Reading your writing',                    detail: 'Getting the task and your response ready.' },
  { from: 6000,  title: 'Finding evidence in your writing',        detail: 'Looking for real words and sentences to talk about.' },
  { from: 16000, title: 'Checking the evidence',                   detail: 'Making sure every comment is backed up by your text.' },
  { from: 28000, title: 'Writing clear feedback',                  detail: 'Choosing the most useful points to show you.' },
  { from: 42000, title: 'Still working',                           detail: 'Longer writing can take a little more time. Please keep this page open.' },
]);
export const DEFAULTS = Object.freeze({ timeoutMs: 90000, tickMs: 250, ceiling: 0.94, curveMs: 16000, finishMs: 450 });
// Smooth, always-increasing curve that slows down and can never reach the ceiling (so never 100%).
export function estimateFraction(elapsedMs, { ceiling = DEFAULTS.ceiling, curveMs = DEFAULTS.curveMs } = {}) {
  const t = Number.isFinite(elapsedMs) && elapsedMs > 0 ? elapsedMs : 0;
  return ceiling * (1 - Math.exp(-t / curveMs));
}
export function stageAt(elapsedMs, timeoutMs = DEFAULTS.timeoutMs) {
  if (elapsedMs >= timeoutMs - 25000 && elapsedMs >= 60000)
    return { index: STAGES.length, title: 'Nearly out of time', detail: 'The check will stop by itself soon. If it does, no mark is given and you can try again.' };
  let index = 0;
  STAGES.forEach((stage, i) => { if (elapsedMs >= stage.from) index = i; });
  return { index, ...STAGES[index] };
}
const el = (doc, tag, className, text) => { const node = doc.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; };
export function createAssessmentProgress(host, options = {}) {
  const doc = host.ownerDocument;
  const win = doc.defaultView || globalThis;
  const now = options.now || (() => (win.performance || globalThis.performance).now());
  const every = options.setInterval || ((fn, ms) => win.setInterval(fn, ms));
  const stopEvery = options.clearInterval || (id => win.clearInterval(id));
  const later = options.setTimeout || ((fn, ms) => win.setTimeout(fn, ms));
  const reduced = options.reducedMotion ?? !!win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const timeoutMs = options.timeoutMs ?? DEFAULTS.timeoutMs;
  const label = options.label || 'Assessing your writing';
  let startedAt = 0, timer = null, active = false, fraction = 0, stageIndex = -1, run = 0;
  let card, bar, fill, title, detail, elapsed, live, note;
  function build() {
    card = el(doc, 'section', 'assessment-progress'); card.setAttribute('data-state', 'idle');
    title = el(doc, 'h2', 'assessment-progress__title', label);
    detail = el(doc, 'p', 'assessment-progress__detail');
    bar = el(doc, 'div', 'assessment-progress__bar');
    // Honest semantics: no aria-valuenow, because the value is an estimate; the text says so.
    bar.setAttribute('role', 'progressbar'); bar.setAttribute('aria-label', label);
    bar.setAttribute('aria-valuetext', 'Working. Progress is an estimate.');
    fill = el(doc, 'div', 'assessment-progress__fill'); bar.append(fill);
    const meta = el(doc, 'p', 'assessment-progress__meta');
    note = el(doc, 'span', 'assessment-progress__note', 'Estimated progress, not an exact percentage. Usually 15–45 seconds.');
    elapsed = el(doc, 'span', 'assessment-progress__elapsed'); meta.append(note, elapsed);
    live = el(doc, 'p', 'assessment-progress__sr'); live.setAttribute('aria-live', 'polite'); live.setAttribute('role', 'status');
    card.append(title, detail, bar, meta, live); host.replaceChildren(card); host.hidden = false;
  }
  function paint(value) {
    fraction = Math.max(fraction, Math.min(1, value));          // never moves backwards
    fill.style.setProperty('--assessment-progress', fraction.toFixed(4));
    fill.style.setProperty('transform', 'scaleX(' + fraction.toFixed(4) + ')');
  }
  function tick() {
    if (!active) return;
    const ms = Math.max(0, now() - startedAt);
    const stage = stageAt(ms, timeoutMs);
    if (stage.index !== stageIndex) {
      stageIndex = stage.index; title.textContent = stage.title; detail.textContent = stage.detail;
      live.textContent = stage.title + '. ' + stage.detail;     // announced only when the stage changes, not every tick
    }
    elapsed.textContent = 'Working for ' + Math.floor(ms / 1000) + 's';
    paint(estimateFraction(ms));
  }
  function stopTimer() { if (timer !== null) { stopEvery(timer); timer = null; } }
  return {
    get active() { return active; },
    get fraction() { return fraction; },
    // Starts immediately; a second call while running is ignored (duplicate-submission guard).
    start() {
      if (active) return false;
      run++; active = true; fraction = 0; stageIndex = -1; startedAt = now(); build();
      card.setAttribute('data-state', 'running'); if (reduced) card.setAttribute('data-reduced-motion', 'true');
      tick(); timer = every(tick, DEFAULTS.tickMs);
      // The card sits below the form: bring it into view so the person sees that the request landed.
      host.scrollIntoView?.({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' });
      return true;
    },
    // Only call after a real, validated result: this is the only path to 100%.
    succeed() {
      if (!active) return Promise.resolve();
      const mine = run; active = false; stopTimer();
      card.setAttribute('data-state', 'complete'); title.textContent = 'Estimate ready'; detail.textContent = 'Check the evidence and marks below.';
      bar.setAttribute('aria-valuenow', '100'); bar.setAttribute('aria-valuetext', 'Complete'); note.textContent = ''; elapsed.textContent = '';
      paint(1);
      return new Promise(resolve => later(() => { if (mine === run) this.reset(); resolve(); }, reduced ? 0 : DEFAULTS.finishMs));
    },
    // Freezes the bar where it was (never 100%) and shows what happened and what to do next.
    fail(message, { timedOut = false } = {}) {
      if (!active) return; active = false; stopTimer();
      card.setAttribute('data-state', timedOut ? 'timeout' : 'error');
      title.textContent = timedOut ? 'This is taking too long' : 'Something went wrong';
      detail.textContent = message || 'No mark has been issued. You can try again.';
      bar.setAttribute('aria-valuetext', 'Stopped. No result.'); note.textContent = 'No mark has been issued. Nothing was retried automatically.'; elapsed.textContent = '';
    },
    // Remove everything (clear button, navigation, sign-out).
    reset() { run++; active = false; stopTimer(); fraction = 0; stageIndex = -1; host.replaceChildren(); host.hidden = true; },
  };
}

// Staff-only, read-only question preview for the vocabulary diagnostic.
// Items come only from the authenticated review API (`review-list` /
// `review-detail` via the vocabulary-diagnostic Edge Function, which checks
// the caller is an active teacher/admin). Nothing is fetched from static
// files, stored in the browser or logged.
import { escapeHtml } from '../views/html.js';
import { auditDiagnosticItem } from './diagnostic-quality-audit.js';

const PAGE_SIZE = 10;
export const PREVIEW_LEVELS = Object.freeze(['A1', 'A2', 'B1', 'B2', 'C1']);
const e = value => escapeHtml(String(value ?? ''));

const STATUS = {
  draft: ['Draft', 'draft'],
  language_reviewed: ['Language reviewed', 'reviewed'],
  assessment_reviewed: ['Assessment reviewed', 'reviewed'],
  pilot: ['Pilot', 'pilot'],
  approved: ['Approved', 'approved'],
  retired: ['Retired', 'retired']
};
export function statusInfo(status) {
  const [label, tone] = STATUS[status] || [String(status || 'Unknown'), 'draft'];
  return { label, tone };
}
const CONSTRUCTS = { meaning_in_context: 'Meaning in context', precise_meaning: 'Precise meaning', collocation_sense: 'Collocation' };
export function constructLabel(construct) {
  return CONSTRUCTS[construct] || (construct ? String(construct).replaceAll('_', ' ') : 'Type not recorded');
}
export function classifyPreviewError(error) {
  return /access denied|auth required|staff access/i.test(String(error?.message || '')) ? 'denied' : 'error';
}
const STAGES = { language: 'Language', assessment: 'Assessment', cefr: 'CEFR reference' };
const DECISIONS = { approve: 'approved', flag: 'flagged', reject: 'rejected', verify: 'verified' };
export function reviewLabel(review) {
  if (review?.stage === 'flag') return 'Flagged';
  return `${STAGES[review?.stage] || String(review?.stage || 'Review')} ${DECISIONS[review?.decision] || String(review?.decision || '')}`.trim();
}
export function reviewSummary(reviews = []) {
  const has = (stage, decision) => reviews.some(r => r.stage === stage && r.decision === decision);
  const concerns = reviews.filter(r => r.decision === 'flag' || r.decision === 'reject');
  return {
    language: has('language', 'approve'),
    assessment: has('assessment', 'approve'),
    cefr: has('cefr', 'verify'),
    concerns
  };
}

export function createPreviewModel(invoke, { level = 'all', index = 0 } = {}) {
  const state = {
    level: PREVIEW_LEVELS.includes(level) ? level : 'all',
    index: Math.max(0, Number(index) || 0),
    total: null, phase: 'loading', error: '',
    item: null, reviews: [], selected: null, showKey: false
  };
  const pages = new Map();
  const details = new Map();
  let token = 0;
  const levelPayload = () => (state.level === 'all' ? {} : { level: state.level });

  async function page(n) {
    if (!pages.has(n)) {
      const data = await invoke('list', { page: n, ...levelPayload() });
      pages.set(n, Array.isArray(data?.items) ? data.items : []);
      state.total = Math.max(0, Number(data?.total) || 0);
    }
    return pages.get(n);
  }
  function detail(ref) {
    const key = `${ref.id}@${ref.version}`;
    if (!details.has(key)) {
      details.set(key, invoke('detail', { itemId: ref.id, version: Number(ref.version) })
        .catch(err => { details.delete(key); throw err; }));
    }
    return details.get(key);
  }
  async function go(target) {
    const mine = ++token;
    state.phase = 'loading'; state.error = ''; state.selected = null;
    try {
      if (state.total === null) await page(0);
      if (mine !== token) return;
      if (!state.total) { state.phase = 'empty'; state.item = null; state.index = 0; return; }
      const idx = Math.max(0, Math.min(target, state.total - 1));
      const list = await page(Math.floor(idx / PAGE_SIZE));
      const ref = list[idx % PAGE_SIZE];
      if (!ref) throw new Error('The question list returned an incomplete page.');
      const data = await detail(ref);
      if (mine !== token) return;
      if (!data?.item || !Array.isArray(data.item.options)) throw new Error('Question details are unavailable.');
      state.index = idx; state.item = data.item;
      state.reviews = Array.isArray(data.reviews) ? data.reviews : [];
      state.phase = 'ready';
      const next = idx + 1;
      if (next < state.total && Math.floor(next / PAGE_SIZE) === Math.floor(idx / PAGE_SIZE) && list[next % PAGE_SIZE])
        detail(list[next % PAGE_SIZE]).catch(() => {});
    } catch (err) {
      if (mine !== token) return;
      state.phase = classifyPreviewError(err);
      state.error = err?.message || 'Unavailable';
    }
  }
  return {
    state,
    load: () => go(state.index),
    next: () => go(state.index + 1),
    previous: () => go(state.index - 1),
    setLevel(level) {
      state.level = PREVIEW_LEVELS.includes(level) ? level : 'all';
      pages.clear(); state.total = null; state.index = 0;
      return go(0);
    },
    select(optionId) {
      if (state.phase === 'ready' && state.item.options.some(o => o.id === optionId)) state.selected = optionId;
    },
    toggleKey() { state.showKey = !state.showKey; }
  };
}

function stateCard(title, body = '', action = '') {
  return `<div class="dp-card dp-state" role="status" aria-live="polite"><h2>${e(title)}</h2>${body ? `<p>${body}</p>` : ''}${action}</div>`;
}

function questionCard(s) {
  const x = s.item;
  const status = statusInfo(x.status);
  const key = x.correctOptionId;
  const options = x.options.map(o => {
    const isKey = s.showKey && o.id === key;
    const isMiss = s.showKey && s.selected === o.id && o.id !== key;
    const cls = ['dp-option', s.selected === o.id ? 'is-selected' : '', isKey ? 'is-key' : '', isMiss ? 'is-miss' : ''].filter(Boolean).join(' ');
    return `<button type="button" role="radio" aria-checked="${s.selected === o.id}" class="${cls}" data-preview="select" data-option="${e(o.id)}">`
      + `<span class="dp-letter">${e(o.id)}</span><span class="dp-text">${e(o.text)}`
      + `${s.showKey && o.rationale ? `<small>${e(o.rationale)}</small>` : ''}</span>`
      + `${isKey ? '<span class="dp-key">Correct</span>' : ''}</button>`;
  }).join('');
  const outcome = s.showKey && s.selected
    ? `<span class="dp-outcome ${s.selected === key ? 'is-right' : 'is-wrong'}">${s.selected === key ? 'Your choice matches the key' : `Key is ${e(key)}`}</span>` : '';
  return `<article class="dp-card" aria-labelledby="dp-stem">
    <header class="dp-meta">
      <span class="dp-level" title="Provisional CEFR level (hypothesis, not calibrated)">${e(x.level)}<small>provisional</small></span>
      <span class="dp-target"><strong>${e(x.lemma)}</strong><small>${e(constructLabel(x.construct))}</small></span>
      <span class="dp-status dp-status--${e(status.tone)}">${e(status.label)}</span>
    </header>
    <p id="dp-stem" class="dp-stem" tabindex="-1">${e(x.stem)}</p>
    <div class="dp-options" role="radiogroup" aria-labelledby="dp-stem">${options}</div>
    <div class="dp-actions"><button type="button" class="dp-toggle" data-preview="key" aria-pressed="${s.showKey}">${s.showKey ? 'Hide answer' : 'Show answer'}</button>${outcome}</div>
    <footer class="dp-foot">${e(x.id)} · v${e(x.version)}${x.sense ? ` · ${e(x.sense)}` : ''}</footer>
  </article>`;
}

function reviewPanel(s) {
  const r = reviewSummary(s.reviews);
  const tick = (label, ok) => `<li class="${ok ? 'is-done' : ''}"><span aria-hidden="true">${ok ? '✓' : '–'}</span>${e(label)}<span class="dp-sr">${ok ? ' complete' : ' not yet'}</span></li>`;
  const signals = auditDiagnosticItem(s.item).issues;
  const concerns = r.concerns.map(c => `<li><strong>${e(reviewLabel(c))}</strong> ${e(c.notes)}</li>`).join('');
  const auto = signals.map(f => `<li class="dp-auto"><strong>Auto-check · ${e(f.code.replaceAll('_', ' '))}</strong> ${e(f.message)}</li>`).join('');
  const history = s.reviews.map(h => `<li><strong>${e(reviewLabel(h))}</strong><time>${e(String(h.createdAt || '').slice(0, 10))}</time><p>${e(h.notes)}</p></li>`).join('');
  return `<section class="dp-review" aria-label="Review status">
    <ul class="dp-stages">${tick('Language', r.language)}${tick('Assessment', r.assessment)}${tick('CEFR reference', r.cefr)}</ul>
    ${concerns || auto ? `<ul class="dp-concerns">${concerns}${auto}</ul>` : '<p class="dp-quiet">No concerns recorded.</p>'}
    ${history ? `<details class="dp-history"><summary>Review history (${s.reviews.length})</summary><ul>${history}</ul></details>` : ''}
  </section>`;
}

export function renderPreview(s) {
  const levelOptions = ['all', ...PREVIEW_LEVELS].map(l => `<option value="${l}" ${s.level === l ? 'selected' : ''}>${l === 'all' ? 'All levels' : l}</option>`).join('');
  const position = s.total ? `${s.index + 1} of ${s.total}` : '';
  const ready = s.phase === 'ready';
  let body;
  if (s.phase === 'loading') body = stateCard('Loading question…');
  else if (s.phase === 'empty') body = stateCard('No questions at this level');
  else if (s.phase === 'denied') body = stateCard('Staff access only', 'Diagnostic questions are available to active teacher and admin accounts.', '<a class="dp-link" href="./">Back to the Hub</a>');
  else if (s.phase === 'error') body = stateCard('Couldn’t load this question', e(s.error), '<button type="button" class="dr-primary" data-preview="retry">Try again</button>');
  else body = questionCard(s) + reviewPanel(s);
  return `<main class="dr-shell dp-shell">
  <header class="dr-topbar"><a href="./vocabulary.html">← Teacher analytics</a><span>Vocabulary diagnostic · Staff only</span></header>
  <div class="dp-bar">
    <button type="button" class="dr-back" data-preview="exit">← Review queue</button>
    <h1>Question preview</h1>
    <label class="dp-filter"><span class="dp-sr">Level</span><select id="preview-level" data-preview="level">${levelOptions}</select></label>
    <span class="dp-position" aria-live="polite">${e(position)}</span>
  </div>
  ${body}
  <nav class="dp-nav" aria-label="Question navigation">
    <button type="button" data-preview="previous" ${ready && s.index > 0 ? '' : 'disabled'}>‹ Previous</button>
    <button type="button" class="dp-open" data-preview="review" ${ready ? '' : 'disabled'}>Open full review</button>
    <button type="button" data-preview="next" ${ready && s.index < s.total - 1 ? '' : 'disabled'}>Next ›</button>
  </nav>
</main>`;
}

export function createTeacherPreview({ root, invoke, level = 'all', index = 0, onExit, onOpenReview }) {
  const model = createPreviewModel(invoke, { level, index });
  let focusStem = false;
  const paint = () => {
    root.innerHTML = renderPreview(model.state);
    if (focusStem && model.state.phase === 'ready') { root.querySelector('#dp-stem')?.focus({ preventScroll: true }); focusStem = false; }
  };
  const run = async (promise, focus = false) => { paint(); await promise; focusStem = focus; paint(); };
  function onClick(event) {
    const button = event.target.closest('[data-preview]');
    if (!button || !root.contains(button) || button.disabled) return;
    const action = button.dataset.preview;
    if (action === 'exit') { destroy(); onExit?.(); return; }
    if (action === 'review' && model.state.item) { const { id, version } = model.state.item; destroy(); onOpenReview?.(id, Number(version)); return; }
    if (action === 'select') { model.select(button.dataset.option); paint(); return; }
    if (action === 'key') { model.toggleKey(); paint(); return; }
    if (action === 'next') void run(model.next(), true);
    if (action === 'previous') void run(model.previous(), true);
    if (action === 'retry') void run(model.load());
  }
  function onChange(event) {
    if (event.target.id === 'preview-level') void run(model.setLevel(event.target.value));
  }
  function onKey(event) {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(event.target?.tagName || '')) return;
    if (model.state.phase !== 'ready') return;
    if (event.key === 'ArrowRight' && model.state.index < model.state.total - 1) { event.preventDefault(); void run(model.next(), true); }
    if (event.key === 'ArrowLeft' && model.state.index > 0) { event.preventDefault(); void run(model.previous(), true); }
  }
  function destroy() {
    root.removeEventListener('click', onClick);
    root.removeEventListener('change', onChange);
    document.removeEventListener('keydown', onKey);
  }
  function start() {
    root.addEventListener('click', onClick);
    root.addEventListener('change', onChange);
    document.addEventListener('keydown', onKey);
    return run(model.load());
  }
  return { start, destroy, model };
}

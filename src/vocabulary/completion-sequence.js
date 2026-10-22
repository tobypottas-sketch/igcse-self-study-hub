// Presentation-only completion sequence. Final state is always in the markup;
// this module only plays an optional ~2.6s intro and lets students skip it.
const DURATION_MS = 2600;
const COUNT_MS = 900;
const COUNT_DELAY_MS = 450;

export function prefersReducedMotion(win = globalThis) {
  try { return Boolean(win.matchMedia?.('(prefers-reduced-motion: reduce)').matches); } catch { return false; }
}

export function playCompletionSequence(root, { win = globalThis } = {}) {
  const card = root?.querySelector?.('[data-completion-sequence]');
  if (!card || prefersReducedMotion(win)) return { skip() {} };
  const skipButton = card.querySelector('[data-action="skip-animation"]');
  const countEl = card.querySelector('[data-count-up]');
  const target = Number(card.querySelector('[data-completion-score]')?.dataset.score ?? 0);
  let finished = false; let raf = 0; let timer = 0; let countTimer = 0;

  const finish = () => {
    if (finished) return; finished = true;
    win.clearTimeout?.(timer); win.clearTimeout?.(countTimer); win.cancelAnimationFrame?.(raf);
    card.dataset.completionSequence = 'done';
    if (countEl) countEl.textContent = String(target);
    if (skipButton) skipButton.hidden = true;
    card.removeEventListener('click', onClick);
  };
  const onClick = event => {
    if (event.target.closest?.('.vocab-finish-actions')) return;
    finish();
  };

  card.dataset.completionSequence = 'playing';
  if (skipButton) skipButton.hidden = false;
  card.addEventListener('click', onClick);
  if (countEl && target > 0) {
    countEl.textContent = '0';
    countTimer = win.setTimeout(() => {
      const start = win.performance?.now?.() ?? Date.now();
      const tick = now => {
        if (finished) return;
        const t = Math.min(1, ((now ?? Date.now()) - start) / COUNT_MS);
        countEl.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
        if (t < 1) raf = win.requestAnimationFrame(tick);
      };
      raf = win.requestAnimationFrame(tick);
    }, COUNT_DELAY_MS);
  }
  timer = win.setTimeout(finish, DURATION_MS);
  return { skip: finish };
}

// Cache-first visual return for the Unit -> All units navigation.
// The Vocabulary app still owns state and performs its normal Home refresh; this adapter only
// restores the last rendered Home DOM immediately so the back click never feels unresponsive.
const root = document.getElementById('vocabularyApp');

if (root) {
  let cachedHome = null;
  let refreshPending = false;
  let ignoreOwnMutation = false;
  let queuedUnit = null;

  const isHome = () => Boolean(root.querySelector?.('.vocab-unit-card[data-action="open-unit"]'))
    && !root.querySelector?.('[data-action="back-units"]');

  const rememberHome = () => {
    if (!refreshPending && isHome()) cachedHome = root.innerHTML;
  };

  const observer = new MutationObserver(() => {
    if (ignoreOwnMutation || !isHome()) return;
    if (!refreshPending) {
      cachedHome = root.innerHTML;
      return;
    }

    // The app's normal showHome() refresh has now repainted Home with fresh data.
    refreshPending = false;
    cachedHome = root.innerHTML;
    const unit = queuedUnit;
    queuedUnit = null;
    if (unit != null) queueMicrotask(() => root.querySelector?.(`.vocab-unit-card[data-action="open-unit"][data-unit="${unit}"]`)?.click?.());
  });

  observer.observe(root, { childList:true, subtree:true });
  queueMicrotask(rememberHome);

  root.addEventListener('click', event => {
    const back = event.target?.closest?.('[data-action="back-units"]');
    if (back && cachedHome && !refreshPending) {
      // Paint first. Do not stop propagation: the app's existing back-units handler still runs
      // immediately afterwards and refreshes dashboard / mission / merit data as before.
      refreshPending = true;
      ignoreOwnMutation = true;
      root.innerHTML = cachedHome;
      queueMicrotask(() => { ignoreOwnMutation = false; });
      return;
    }

    if (!refreshPending) return;
    const unitCard = event.target?.closest?.('.vocab-unit-card[data-action="open-unit"]');
    if (!unitCard) return;

    // showHome() in the existing controller is still refreshing. Queue an immediate re-entry click
    // until that authoritative repaint completes so it cannot overwrite the newly opened unit.
    event.preventDefault();
    event.stopImmediatePropagation();
    queuedUnit = Number(unitCard.dataset.unit);
  }, true);
}

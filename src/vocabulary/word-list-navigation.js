const ALPHABET = Object.freeze('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));

function initialLetter(value) {
  const match = String(value ?? '').trim().toUpperCase().match(/[A-Z]/);
  return match?.[0] ?? null;
}

export function buildAlphabetModel(terms = []) {
  const available = new Set(terms.map(initialLetter).filter(Boolean));
  return ALPHABET.map(letter => ({
    letter,
    available:available.has(letter),
    targetId:`vocab-letter-${letter.toLowerCase()}`
  }));
}

let cleanupScroll = null;
let observedRoot = null;
let observer = null;

function clearScrollHandler() {
  if (cleanupScroll) cleanupScroll();
  cleanupScroll = null;
}

function buildNavigator(doc, model) {
  const nav = doc.createElement('nav');
  nav.className = 'vocab-az-nav';
  nav.setAttribute('aria-label', 'A to Z vocabulary navigation');
  nav.innerHTML = model.map(item => item.available
    ? `<a data-az-letter="${item.letter}" href="#${item.targetId}" aria-label="Jump to words beginning with ${item.letter}">${item.letter}</a>`
    : `<span data-az-letter="${item.letter}" data-letter-disabled="true" aria-disabled="true">${item.letter}</span>`
  ).join('');
  return nav;
}

function enhanceWordsView(root, win) {
  const list = root?.querySelector?.('.vocab-word-list');
  if (!list || list.dataset.azEnhanced === 'true') return;

  const rows = [...list.querySelectorAll?.('.vocab-word-row') ?? []];
  const terms = rows.map(row => row.querySelector?.('.vocab-dictionary-entry__term')?.textContent ?? '');
  if (!terms.length) return;

  list.dataset.azEnhanced = 'true';
  const doc = root.ownerDocument ?? globalThis.document;
  const model = buildAlphabetModel(terms);

  const firstByLetter = new Map();
  rows.forEach((row,index) => {
    const letter = initialLetter(terms[index]);
    if (!letter || firstByLetter.has(letter)) return;
    const targetId = `vocab-letter-${letter.toLowerCase()}`;
    row.id = targetId;
    row.dataset.vocabLetter = letter;
    firstByLetter.set(letter,row);
  });

  const shell = list.closest?.('.vocab-shell') ?? root;
  const hero = shell.querySelector?.('.vocab-unit-hero');
  if (hero) hero.id = 'vocab-words-top';
  else shell.id = 'vocab-words-top';

  const nav = buildNavigator(doc,model);
  list.before(nav);

  const backToTop = doc.createElement('a');
  backToTop.className = 'vocab-back-to-top';
  backToTop.href = '#vocab-words-top';
  backToTop.setAttribute('aria-label','Back to top');
  backToTop.setAttribute('aria-hidden','true');
  backToTop.innerHTML = '<span aria-hidden="true">↑</span> Back to top';
  shell.append(backToTop);

  clearScrollHandler();
  const updateBackToTop = () => {
    const visible = Number(win?.scrollY ?? 0) > 480;
    backToTop.classList.toggle('is-visible',visible);
    backToTop.setAttribute('aria-hidden', visible ? 'false' : 'true');
  };
  win?.addEventListener?.('scroll',updateBackToTop,{ passive:true });
  updateBackToTop();
  cleanupScroll = () => win?.removeEventListener?.('scroll',updateBackToTop);
}

export function setupWordsNavigation(root = globalThis.document?.getElementById?.('vocabularyApp'), win = globalThis.window) {
  if (!root) return () => {};
  enhanceWordsView(root,win);
  if (observedRoot === root && observer) return () => {};
  observer?.disconnect?.();
  observedRoot = root;
  observer = typeof MutationObserver !== 'undefined'
    ? new MutationObserver(() => {
        const list = root.querySelector?.('.vocab-word-list');
        if (!list) clearScrollHandler();
        enhanceWordsView(root,win);
      })
    : null;
  observer?.observe?.(root,{ childList:true, subtree:true });
  return () => {
    clearScrollHandler();
    observer?.disconnect?.();
    observer = null;
    observedRoot = null;
  };
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  setupWordsNavigation(document.getElementById('vocabularyApp'),window);
}

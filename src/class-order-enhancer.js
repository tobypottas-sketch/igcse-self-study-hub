import { compareClassNames, isClassName } from './class-order.js';

function reorder(parent, nodes, getName) {
  const sorted = [...nodes].sort((a, b) => compareClassNames(getName(a), getName(b)));
  if (sorted.every((node, index) => node === nodes[index])) return;
  for (const node of sorted) parent.append(node);
}

function sortClassSelect(select) {
  const options = [...select.options];
  const classOptions = options.filter(option => isClassName(option.textContent));
  if (classOptions.length < 2) return;
  const fixed = options.filter(option => !isClassName(option.textContent));
  const sorted = [...classOptions].sort((a, b) => compareClassNames(a.textContent, b.textContent));
  const desired = [...fixed, ...sorted];
  if (desired.every((option, index) => option === options[index])) return;
  for (const option of desired) select.append(option);
}

function sortClassCards(root) {
  for (const grid of root.querySelectorAll?.('.vocab-class-chooser__grid, .admin-class-grid') ?? []) {
    const selector = grid.matches('.vocab-class-chooser__grid') ? '.vocab-class-card' : '.admin-class-card';
    const cards = [...grid.querySelectorAll(`:scope > ${selector}`)];
    if (cards.length < 2) continue;
    reorder(grid, cards, card => card.querySelector('.vocab-class-card__title, h3')?.textContent ?? '');
  }
}

export function applyClassOrdering(root = document) {
  for (const select of root.querySelectorAll?.('select') ?? []) sortClassSelect(select);
  sortClassCards(root);
}

if (typeof document !== 'undefined') {
  const run = () => applyClassOrdering(document);
  run();
  const observer = new MutationObserver(run);
  observer.observe(document.documentElement, { childList:true, subtree:true });
}

export function classGradeVariant(className = '') {
  const match = String(className).trim().toUpperCase().match(/^G(9|10|11)\b/);
  return match ? `g${match[1]}` : 'default';
}

export function applyClassGradeIdentity(root = document) {
  const cards = root.querySelectorAll?.('.vocab-class-chooser .vocab-class-card') ?? [];
  for (const card of cards) {
    const title = card.querySelector('.vocab-class-card__title');
    card.dataset.gradeVariant = classGradeVariant(title?.textContent ?? '');
    card.querySelector('.vocab-class-card__icon')?.remove();
  }
}

function boot() {
  const app = document.getElementById('vocabularyApp');
  if (!app) return;
  applyClassGradeIdentity(app);
  new MutationObserver(() => applyClassGradeIdentity(app)).observe(app, { childList:true, subtree:true });
}

if (typeof document !== 'undefined' && typeof MutationObserver !== 'undefined') boot();

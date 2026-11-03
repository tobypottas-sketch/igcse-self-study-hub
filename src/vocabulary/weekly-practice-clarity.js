export function practiceListMeta(total, visible) {
  const safeTotal = Math.max(0, Number(total) || 0);
  const safeVisible = Math.max(0, Number(visible) || 0);
  return {
    heading: `Not active recently (${safeTotal})`,
    note: safeTotal > safeVisible ? `Showing ${safeVisible} of ${safeTotal} students.` : ''
  };
}

export function clarifyWeeklyPractice(root = document) {
  const panels = root.querySelectorAll?.('[data-habits-panel]') ?? [];
  for (const panel of panels) {
    if (panel.dataset.practiceClarity === 'true') continue;
    const heading = [...panel.querySelectorAll('h3')].find(node => /^Gone quiet \(\d+\)$/.test(node.textContent?.trim() ?? ''));
    const list = heading?.nextElementSibling;
    if (!heading || !list?.matches?.('.vocab-rows')) continue;

    const match = heading.textContent.trim().match(/\((\d+)\)$/);
    const total = Number(match?.[1] ?? 0);
    const visible = list.querySelectorAll('li').length;
    const meta = practiceListMeta(total, visible);

    heading.textContent = meta.heading;
    heading.title = 'No mission completed within the recent-practice window';
    if (meta.note) {
      const note = document.createElement('p');
      note.className = 'vocab-muted-line vocab-habits-list-note';
      note.textContent = meta.note;
      list.insertAdjacentElement('afterend', note);
    }
    panel.dataset.practiceClarity = 'true';
  }
}

function boot() {
  const app = document.getElementById('vocabularyApp');
  if (!app) return;
  clarifyWeeklyPractice(app);
  new MutationObserver(() => clarifyWeeklyPractice(app)).observe(app, { childList:true, subtree:true });
}

if (typeof document !== 'undefined' && typeof MutationObserver !== 'undefined') boot();

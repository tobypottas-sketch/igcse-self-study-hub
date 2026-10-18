const root = document.getElementById('vocabularyApp');
let draggedValue = '';

function answerSelect(node) {
  const form = node?.closest?.('[data-form="vocabulary-answer"]');
  return form?.querySelector?.('select[name="answer"]') ?? null;
}

function dropZone(node) {
  const form = node?.closest?.('[data-form="vocabulary-answer"]');
  return form?.querySelector?.('[data-drop-target], [data-gap-drop]') ?? null;
}

function setAnswer(node, value) {
  const select = answerSelect(node);
  if (!select) return;
  const next = String(value ?? '').trim();
  if (![...select.options].some(option => option.value === next)) return;
  select.value = next;
  select.dispatchEvent(new Event('change', { bubbles:true }));
  const zone = dropZone(node);
  if (zone) {
    zone.textContent = next || 'Drop answer here';
    zone.classList.toggle('is-filled', Boolean(next));
  }
}

root?.addEventListener('dragstart', event => {
  const token = event.target?.closest?.('[data-drag-value], [data-drag-gap-value]');
  if (!token) return;
  draggedValue = token.dataset.dragValue ?? token.dataset.dragGapValue ?? '';
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', draggedValue);
  }
  token.classList.add('is-dragging');
});

root?.addEventListener('dragend', event => {
  const token = event.target?.closest?.('[data-drag-value], [data-drag-gap-value]');
  token?.classList?.remove('is-dragging');
  draggedValue = '';
});

root?.addEventListener('dragover', event => {
  const zone = event.target?.closest?.('[data-drop-target], [data-gap-drop]');
  if (!zone) return;
  event.preventDefault();
  zone.classList.add('is-active');
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
});

root?.addEventListener('dragleave', event => {
  const zone = event.target?.closest?.('[data-drop-target], [data-gap-drop]');
  zone?.classList?.remove('is-active');
});

root?.addEventListener('drop', event => {
  const zone = event.target?.closest?.('[data-drop-target], [data-gap-drop]');
  if (!zone) return;
  event.preventDefault();
  zone.classList.remove('is-active');
  const value = event.dataTransfer?.getData('text/plain') || draggedValue;
  setAnswer(zone, value);
});

root?.addEventListener('click', event => {
  const token = event.target?.closest?.('[data-drag-value], [data-drag-gap-value]');
  if (!token) return;
  const value = token.dataset.dragValue ?? token.dataset.dragGapValue ?? '';
  setAnswer(token, value);
});

root?.addEventListener('change', event => {
  const select = event.target?.closest?.('[data-drag-fallback], [data-drag-gap-fallback]');
  if (!select) return;
  const zone = dropZone(select);
  if (!zone) return;
  zone.textContent = select.value || 'Drop answer here';
  zone.classList.toggle('is-filled', Boolean(select.value));
});

const root = document.getElementById('vocabularyApp');

function answerInput(node) {
  const form = node?.closest?.('[data-form="vocabulary-answer"]');
  return form?.querySelector?.('input[name="answer"]') ?? null;
}

function selectMatchCard(card) {
  const form = card?.closest?.('[data-form="vocabulary-answer"]');
  const input = answerInput(card);
  if (!form || !input) return;
  const value = String(card.dataset.matchCard ?? '').trim();
  input.value = value;
  for (const candidate of form.querySelectorAll?.('[data-match-card]') ?? []) {
    const selected = candidate === card;
    candidate.classList.toggle('is-selected',selected);
    candidate.setAttribute('aria-pressed',selected ? 'true' : 'false');
  }
  input.dispatchEvent(new Event('change',{ bubbles:true }));
}

function gapSlotFor(node) {
  const scope = node?.closest?.('.vocab-question-card') ?? document;
  return scope.querySelector?.('[data-gap-slot]') ?? null;
}

// Drag-to-fill gap: the learner drags a word card onto the blank in the sentence above (mouse, touch or pen, via pointer events).
// Dropping puts the word in the blank and in the answer field; dragging a different word onto the blank swaps it. A plain tap does
// nothing but nudge the blank. Keyboard users press Enter or Space on a word, which fills the blank directly.
function fillGap(chip) {
  const form = chip?.closest?.('[data-form="vocabulary-answer"]');
  const input = answerInput(chip);
  if (!form || !input) return;
  const value = String(chip.dataset.gapChoice ?? '').trim();
  if (!value) return;
  input.value = value;
  for (const candidate of form.querySelectorAll?.('[data-gap-choice]') ?? []) {
    const selected = candidate === chip;
    candidate.classList.toggle('is-selected',selected);
    candidate.setAttribute('aria-pressed',selected ? 'true' : 'false');
  }
  const submit = form.querySelector?.('[data-gap-submit]');
  if (submit) { submit.disabled = false; submit.removeAttribute('aria-disabled'); }
  const slot = gapSlotFor(chip);
  if (!slot) return;
  slot.textContent = value;
  slot.classList.add('is-filled','vocab-gap-filled');
  slot.setAttribute('aria-label',`Gap filled with ${value}`);
  input.dispatchEvent(new Event('change',{ bubbles:true }));
}

function nudgeGap(chip) {
  const slot = gapSlotFor(chip);
  if (!slot) return;
  slot.classList.remove('is-nudge');
  void slot.offsetWidth;
  slot.classList.add('is-nudge');
}

const DRAG_THRESHOLD = 6;
let drag = null;

function overSlot(slot, x, y) {
  const box = slot.getBoundingClientRect();
  const pad = 22;
  return x >= box.left - pad && x <= box.right + pad && y >= box.top - pad && y <= box.bottom + pad;
}
function endDrag() {
  if (!drag) return;
  drag.ghost?.remove();
  drag.chip.classList.remove('is-dragging');
  drag.slot?.classList.remove('is-over');
  try { drag.chip.releasePointerCapture?.(drag.pointerId); } catch { /* pointer already released */ }
  drag = null;
}

root?.addEventListener('pointerdown', event => {
  const chip = event.target?.closest?.('[data-gap-choice]');
  if (!chip || (event.pointerType === 'mouse' && event.button !== 0)) return;
  endDrag();
  drag = { chip, pointerId:event.pointerId, x0:event.clientX, y0:event.clientY, moved:false, ghost:null, slot:gapSlotFor(chip), offsetX:0, offsetY:0 };
  try { chip.setPointerCapture?.(event.pointerId); } catch { /* capture is optional */ }
});
root?.addEventListener('pointermove', event => {
  if (!drag || event.pointerId !== drag.pointerId) return;
  if (!drag.moved) {
    if (Math.hypot(event.clientX - drag.x0,event.clientY - drag.y0) < DRAG_THRESHOLD) return;
    drag.moved = true;
    const box = drag.chip.getBoundingClientRect();
    drag.offsetX = drag.x0 - box.left;
    drag.offsetY = drag.y0 - box.top;
    const ghost = drag.chip.cloneNode(true);
    ghost.removeAttribute('data-gap-choice');
    ghost.className = 'vocab-gap-chip vocab-gap-ghost';
    ghost.style.width = `${box.width}px`;
    document.body.append(ghost);
    drag.ghost = ghost;
    drag.chip.classList.add('is-dragging');
  }
  event.preventDefault();
  drag.ghost.style.transform = `translate(${event.clientX - drag.offsetX}px,${event.clientY - drag.offsetY}px)`;
  drag.slot?.classList.toggle('is-over',Boolean(drag.slot) && overSlot(drag.slot,event.clientX,event.clientY));
});
root?.addEventListener('pointerup', event => {
  if (!drag || event.pointerId !== drag.pointerId) return;
  const { chip, moved, slot } = drag;
  const dropped = moved && slot && overSlot(slot,event.clientX,event.clientY);
  endDrag();
  if (dropped) fillGap(chip);
  else if (!moved) nudgeGap(chip);
});
root?.addEventListener('pointercancel', () => endDrag());
// Dragging must not start a text selection or the browser's own image/link drag.
root?.addEventListener('dragstart', event => { if (event.target?.closest?.('[data-gap-choice]')) event.preventDefault(); });

root?.addEventListener('click', event => {
  const card = event.target?.closest?.('[data-match-card]');
  if (card) {
    selectMatchCard(card);
    return;
  }
  const chip = event.target?.closest?.('[data-gap-choice]');
  // Pointer clicks (detail > 0) are not answers: words must be dragged. A keyboard-activated click has detail 0.
  if (chip && event.detail === 0) fillGap(chip);
});

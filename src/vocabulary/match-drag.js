// Drag-and-drop for the Meaning → Match set (mouse, touch and pen via pointer events). Drag a word card onto a definition card, or
// a definition onto a word. A press that does not move is a normal tap and is left to the tap-to-pair handler, which also keeps
// the keyboard path working.
const THRESHOLD = 6;
const ITEM = '[data-match-word], [data-match-definition]';
let drag = null;
let suppressUntil = 0;
let detachCurrent = null;

const sideOf = node => (node.dataset.matchWord != null ? 'word' : 'definition');
const idOf = node => node.dataset.matchWord ?? node.dataset.matchDefinition;

export function matchDragJustEnded() { return Date.now() < suppressUntil; }

function targetAt(x, y, source) {
  const node = document.elementFromPoint(x, y)?.closest?.(ITEM);
  if (!node || node === source || sideOf(node) === sideOf(source) || node.disabled) return null;
  return node;
}
function clear() {
  if (!drag) return;
  drag.ghost?.remove();
  drag.source.classList.remove('is-dragging');
  drag.over?.classList.remove('is-drop-target');
  drag = null;
  detachCurrent?.();
}

export function installMatchDrag(root, { canDrag, onPair }) {
  // Move/up/cancel are listened for on `window` for the length of one drag (not on the card): they keep working if the card is
  // repainted mid-drag and do not depend on pointer capture, which some browsers handle differently on <button> elements.
  const move = event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (!drag.moved) {
      if (Math.hypot(event.clientX - drag.x0, event.clientY - drag.y0) < THRESHOLD) return;
      drag.moved = true;
      const box = drag.source.getBoundingClientRect();
      drag.dx = drag.x0 - box.left; drag.dy = drag.y0 - box.top;
      const ghost = drag.source.cloneNode(true);
      ghost.removeAttribute('data-match-word'); ghost.removeAttribute('data-match-definition'); ghost.removeAttribute('id');
      ghost.classList.add('vocab-match-ghost');
      ghost.style.width = `${box.width}px`;
      document.body.append(ghost);
      drag.ghost = ghost;
      drag.source.classList.add('is-dragging');
    }
    event.preventDefault();
    drag.ghost.style.transform = `translate(${event.clientX - drag.dx}px,${event.clientY - drag.dy}px)`;
    const over = targetAt(event.clientX, event.clientY, drag.source);
    if (over !== drag.over) { drag.over?.classList.remove('is-drop-target'); over?.classList.add('is-drop-target'); drag.over = over; }
  };
  const up = event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const { source, moved } = drag;
    const target = moved ? targetAt(event.clientX, event.clientY, source) : null;
    clear();
    if (!moved) return;
    suppressUntil = Date.now() + 400; // the browser may fire a click after a drag; ignore it
    if (target) {
      const wordNode = sideOf(source) === 'word' ? source : target;
      const defNode = sideOf(source) === 'definition' ? source : target;
      onPair(idOf(wordNode), idOf(defNode), sideOf(source), idOf(source));
    }
  };
  const cancel = () => clear();
  const detach = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', cancel); };
  detachCurrent = detach;
  root.addEventListener('pointerdown', event => {
    const source = event.target?.closest?.(ITEM);
    if (!source || source.disabled || !canDrag() || (event.pointerType === 'mouse' && event.button !== 0)) return;
    clear();
    drag = { source, pointerId: event.pointerId, x0: event.clientX, y0: event.clientY, moved: false, ghost: null, over: null, dx: 0, dy: 0 };
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
  });
  // Stops Safari/Firefox starting a text selection or their own drag from a card (which would cancel our pointer stream).
  root.addEventListener('mousedown', event => { if (event.target?.closest?.(ITEM) && canDrag()) event.preventDefault(); });
  root.addEventListener('dragstart', event => { if (event.target?.closest?.(ITEM)) event.preventDefault(); });
}

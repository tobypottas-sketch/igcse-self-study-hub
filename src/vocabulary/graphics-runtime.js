import { reportGraphicFailure } from './graphics-registry.js';

// Progressive enhancement for PNG illustrations. The inline SVG is painted first; a PNG is layered over it and only
// replaces it once it has loaded. A PNG that fails to load is removed, so there is never a broken-image icon and the
// slot keeps the SVG. This only toggles classes on existing markup: it injects no artwork and never changes layout.
export function installGraphicsHandlers(root) {
  if (!root?.addEventListener) return;
  // load/error do not bubble, so listen in the capture phase on the stable root.
  root.addEventListener('load', event => {
    const image = event.target;
    if (!image?.matches?.('img[data-art-png]')) return;
    if (!image.naturalWidth) { removeBroken(image); return; }
    image.closest('[data-art-slot]')?.classList.add('is-png-ready');
  }, true);
  root.addEventListener('error', event => {
    const image = event.target;
    if (image?.matches?.('img[data-art-png]')) removeBroken(image);
  }, true);
}
function removeBroken(image) {
  reportGraphicFailure(image.getAttribute?.('src'));
  const slot = image.closest?.('[data-art-slot]');
  slot?.classList.remove('is-png-ready', 'has-png');
  slot?.classList.add('png-failed');
  image.remove();
}

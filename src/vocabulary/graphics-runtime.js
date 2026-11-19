import { reportGraphicFailure } from './graphics-registry.js';

// Progressive enhancement for PNG illustrations. The inline SVG is painted first; a PNG is layered over it and only
// replaces it once it has loaded. A PNG that fails to load is removed, so there is never a broken-image icon and the
// slot keeps the SVG. This only toggles classes on existing markup: it injects no artwork and never changes layout.
export function installGraphicsHandlers(root) {
  if (!root?.addEventListener) return;
  watchRebuilds(root);
  reveal(root);
  // load/error do not bubble, so listen in the capture phase on the stable root.
  root.addEventListener('load', event => {
    const image = event.target;
    if (!image?.matches?.('img[data-art-png]')) return;
    if (!image.naturalWidth) { removeBroken(image); return; }
    markReady(image);
  }, true);
  root.addEventListener('error', event => {
    const image = event.target;
    if (image?.matches?.('img[data-art-png]')) {
      // One bounded delivery fallback: removing the source selects img.src,
      // the unchanged original PNG. Only an original failure uses the SVG.
      const source=image.closest('picture[data-art-delivery]')?.querySelector('source');
      if(source && image.currentSrc!==image.src){source.remove();image.src=image.getAttribute('src');return;}
      removeBroken(image);
    }
  }, true);
}
// A screen is rebuilt with innerHTML (Back to All units, the post-navigation refresh, ...), which creates brand-new <img> elements
// and slots: each starts hidden (opacity 0, SVG hidden) until its own load event fires, so every cover blinked out and faded back
// in. A PNG that has already loaded is in the browser cache, so a rebuilt slot is revealed in the same task that inserted it, before
// the next paint, and the already-loaded <img> element is reused (a loaded element is painted immediately; a new one is not).
const loaded = new Map();   // src -> the <img> that finished loading
function markReady(image){
 if(!image?.naturalWidth)return;
 loaded.set(image.getAttribute('src'),image);
 image.closest('[data-art-slot]')?.classList.add('is-png-ready');
}
function reveal(container) {
 // A cached or instantly decoded image may be complete before the capture
 // listener fires. Inspect the DOM's actual state, rather than relying solely
 // on a previous load event. Reused images remain anchored to their new slot.
 const images=[
  ...(container.matches?.('img[data-art-png]')?[container]:[]),
  ...(container.querySelectorAll?.('img[data-art-png]')??[])
 ];
 for(const image of images){
   if(image.complete && image.naturalWidth>0){markReady(image);continue;}
   const known=loaded.get(image.getAttribute('src'));
   if(known?.complete && known.naturalWidth>0){
     if(known!==image && !known.isConnected){
       // The bitmap is reusable, but its scheduling belongs to the new slot.
       // A formerly lazy home tile can now be a high-priority hero.
       known.loading=image.loading;known.fetchPriority=image.fetchPriority;
       image.replaceWith(known);markReady(known);
     }
     else if(image.complete && image.naturalWidth>0)markReady(image);
   }
 }
}
function watchRebuilds(root) {
  if (typeof MutationObserver !== 'function') return;
  new MutationObserver(records => {
    for (const record of records) for (const node of record.addedNodes) if (node.nodeType === 1) reveal(node);
  }).observe(root, { childList:true, subtree:true });
}
function removeBroken(image) {
  loaded.delete(image.getAttribute?.('src'));
  reportGraphicFailure(image.getAttribute?.('src'));
  const slot = image.closest?.('[data-art-slot]');
  slot?.classList.remove('is-png-ready', 'has-png');
  slot?.classList.add('png-failed');
  image.remove();
}

const art = (name, widths) => ({name, widths});
const structure = art('structure-organisation', [256, 512]);
const practise = art('stage-practise', [256, 512]);

export const reviewArtwork = {
  hero: art('academy-hero', [384, 768, 1152]),
  pathways: {
    structure: {
      banner: structure,
      stages: [
        art('stage-discover', [256, 512]),
        art('stage-explore', [256, 512]),
        practise,
        practise,
        art('stage-master', [256, 512])
      ]
    }
  }
};

const sizes = {
  hero: '(max-width: 560px) calc(100vw - 76px), (max-width: 840px) 40vw, (max-width: 1240px) 44vw, 545px',
  card: '144px',
  banner: '(max-width: 560px) 96px, 136px',
  stage: '(max-width: 560px) 120px, (max-width: 800px) 180px, 246px'
};

export function renderArtwork(parent, artwork, placement) {
  const {name, widths} = artwork;
  const url = width => new URL(`../../../assets/writing/${name}-${width}.webp`, import.meta.url).href;
  const img = parent.ownerDocument.createElement('img');
  img.className = `wa-art wa-art--${placement}`;
  img.alt = '';
  img.width = 1536;
  img.height = 1024;
  img.decoding = 'async';
  img.loading = placement === 'card' ? 'lazy' : 'eager';
  if (placement === 'hero') img.fetchPriority = 'high';
  img.sizes = sizes[placement];
  img.srcset = widths.map(width => `${url(width)} ${width}w`).join(', ');
  img.src = url(widths[0]);
  parent.append(img);
  return img;
}

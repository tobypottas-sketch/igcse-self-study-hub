const art = (name, widths, dimensions = [1536, 1024]) => ({name, widths, dimensions});
const structure = art('structure-organisation', [256, 512]);
const expressionStage = name => ({
  ...art(name, [256, 512, 768], [1672, 941]),
  sizes: '(max-width: 680px) calc(100vw - 60px), 246px'
});
const developmentStage = stage => ({
  ...art(`idea-development-${stage}`, [256, 512, 768], [1448, 1086]),
  sizes: '(max-width: 680px) calc(100vw - 60px), 246px'
});
const practise = art('stage-practise', [256, 512]);

export const reviewArtwork = {
  hero: art('academy-hero', [384, 768, 1152]),
  studio: {
    hero: art('studio-neon-focus', [160, 320, 640], [1254, 1254]),
    context: art('studio-creative-flow', [96, 192, 384], [1254, 1254])
  },
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
    },
    development: {
      card: art('idea-development-banner', [192], [2172, 724]),
      banner: {
        ...art('idea-development-banner', [256, 512], [2172, 724]),
        sizes: '(max-width: 960px) 25vw, 240px'
      },
      stages: ['discover', 'explore', 'practise', 'apply', 'master'].map(developmentStage)
    },
    cohesion: {
      banner: art('grammar-cohesion-banner', [256, 512]),
      stages: ['discover', 'explore', 'practise', 'apply', 'master'].map(stage => ({
        ...art(`grammar-cohesion-${stage}`, [256, 512, 768]),
        sizes: '(max-width: 680px) calc(100vw - 60px), 246px'
      }))
    },
    editing: {
      banner: art('editing-improvement-banner', [256, 512]),
      stages: ['discover', 'explore', 'practise', 'apply', 'master'].map(stage => ({
        ...art(`editing-improvement-${stage}`, [256, 512, 768]),
        sizes: '(max-width: 680px) calc(100vw - 60px), 246px'
      }))
    },
    expression: {
      card: art('expression-card',[192],[192,128]),
      banner: art('vocabulary-expression', [256, 512], [1672, 941]),
      stages: [
        expressionStage('expression-discover'),
        expressionStage('expression-explore'),
        expressionStage('expression-practise'),
        expressionStage('expression-apply'),
        expressionStage('expression-master')
      ]
    }
  },
  homeCards: {
    cohesion: art('grammar-cohesion-card', [192], [192, 128]),
    editing: art('editing-improvement-card', [192], [192, 128]),
    exam: art('exam-mastery-card', [192], [192, 128])
  }
};

const sizes = {
  hero: '(max-width: 560px) calc(100vw - 76px), (max-width: 840px) 40vw, (max-width: 1240px) 44vw, 545px',
  'studio-hero': '(max-width: 520px) 132px, (max-height: 650px) 166px, 220px',
  'studio-context': '(max-width: 520px) 68px, 88px',
  card: '144px',
  banner: '(max-width: 560px) 96px, 136px',
  stage: '(max-width: 560px) 120px, (max-width: 800px) 180px, 246px'
};

export function renderArtwork(parent, artwork, placement) {
  const {name, widths, dimensions} = artwork;
  const url = width => new URL(`../../../assets/writing/${name}-${width}.webp`, import.meta.url).href;
  const img = parent.ownerDocument.createElement('img');
  img.className = `wa-art wa-art--${placement}`;
  img.alt = '';
  [img.width, img.height] = dimensions;
  img.decoding = 'async';
  img.loading = placement === 'card' ? 'lazy' : 'eager';
  if (['hero', 'studio-hero'].includes(placement)) img.fetchPriority = 'high';
  img.sizes = artwork.sizes ?? sizes[placement];
  if (artwork.format === 'svg') {
    img.src = new URL(`../../../assets/writing/${name}.svg`, import.meta.url).href;
  } else {
    img.srcset = widths.map(width => `${url(width)} ${width}w`).join(', ');
    img.src = url(widths[0]);
  }
  parent.append(img);
  return img;
}

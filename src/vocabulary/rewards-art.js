// PNG-only artwork for the Vocabulary Builder Rewards Shop.
// Source images live in assets/vocabulary/rewards/ and are included in this repo.
// Do not substitute crude inline SVG illustrations or remote URLs.
const REWARD_ARTWORK = Object.freeze({
  midnight:'midnight.png',
  forest:'forest.png',
  sakura:'sakura.png',
  ocean:'ocean.png',
  'gold-frame':'gold-frame.png',
  'aurora-frame':'aurora-frame.png',
  'scholar-frame':'scholar-frame.png',
  'word-wizard':'word-wizard.png',
  'word-explorer':'word-explorer.png',
  'language-ace':'language-ace.png',
  'pixel-badge':'pixel-badge.png',
  sparkle:'sparkle.png',
  // Original immersive themes: four collectible badge-slot rewards.
  'forest-guardian-badge':'forest-guardian-badge.png',
  'ocean-explorer-badge':'ocean-explorer-badge.png',
  'sakura-spirit-badge':'sakura-spirit-badge.png',
  'midnight-scholar-badge':'midnight-scholar-badge.png',
  // Staged Neon District assets. Do not enable the catalogue until PNGs are deployed.
  'neon-district':'neon-district.png',
  'cyber-pulse-frame':'cyber-pulse-frame.png',
  'neon-hacker-badge':'neon-hacker-badge.png',
  'cyber-legend':'cyber-legend.png',
  'electric-pulse':'electric-pulse.png',
  // Celestial Realms: original six-PNG collection, kept out of sale until deployed.
  'celestial-realms':'celestial-realms-preview.png',
  'astral-halo-frame':'astral-halo-frame.png',
  'starseer-emblem':'starseer-emblem.png',
  'sky-wanderer':'sky-wanderer.png',
  'stardust-trail':'stardust-trail.png'
});
export const REWARD_ARTWORK_DIR='assets/vocabulary/rewards/';
export const rewardArtworkPath=id=>
  Object.prototype.hasOwnProperty.call(REWARD_ARTWORK,id)
    ? REWARD_ARTWORK_DIR+REWARD_ARTWORK[id]
    : null;

export function rewardIllustration(id) {
  const path=rewardArtworkPath(id);
  if(!path)return '<span class="vocab-shop-empty-icon" aria-hidden="true">✦</span>';
  // Decorative: the reward title and description are adjacent to the image.
  return `<img class="vocab-shop-illustration" src="${path}" alt="" loading="lazy" decoding="async">`;
}
export const bannerIllustration=`<img class="vocab-shop-illustration" src="${REWARD_ARTWORK_DIR}shop-banner.png" alt="" loading="eager" decoding="async" fetchpriority="high">`;

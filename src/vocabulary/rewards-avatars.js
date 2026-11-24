// Avatar IDs are shared by the catalogue and peer identity rendering.
export const AVATAR_COLLECTIONS = Object.freeze({
  'avatar-classic-explorer': 'Starter',
  'avatar-study-hero': 'Starter',
  'avatar-pixel-bot': 'Starter',
  'avatar-pocket-dragon': 'Starter',
  'avatar-forest-ranger': 'Forest',
  'avatar-woodland-guardian': 'Forest',
  'avatar-shadow-fox': 'Forest',
  'avatar-ocean-voyager': 'Ocean',
  'avatar-ocean-navigator': 'Ocean',
  'avatar-aqua-shark': 'Ocean',
  'avatar-blossom-wanderer': 'Sakura',
  'avatar-sakura-spirit': 'Sakura',
  'avatar-sakura-kitsune': 'Sakura',
  'avatar-night-scholar': 'Midnight',
  'avatar-lunar-mage': 'Midnight',
  'avatar-phantom-cat': 'Midnight',
  'avatar-cyber-hacker': 'Neon District',
  'avatar-neon-runner': 'Neon District',
  'avatar-cyber-mech': 'Neon District',
  'avatar-star-seer': 'Celestial Realms',
  'avatar-astral-sorceress': 'Celestial Realms',
  'avatar-cosmic-dragon': 'Celestial Realms',
  'avatar-wasteland-survivor': 'Afterlight',
  'avatar-dawn-pathfinder': 'Afterlight',
  'avatar-zombie-survivor': 'Afterlight',
  'avatar-voxel-adventurer': 'Blockverse',
  'avatar-voxel-architect': 'Blockverse',
  'avatar-emerald-golem': 'Blockverse'
});

export function avatarArtworkPath(id) {
  return Object.hasOwn(AVATAR_COLLECTIONS, id) ? `assets/vocabulary/rewards/${id}.webp` : null;
}

// The initials remain underneath the portrait and are revealed if it fails.
if (typeof document !== 'undefined') {
  document.addEventListener('error', event => {
    if (event.target?.matches?.('img.vocab-avatar-character')) event.target.remove();
  }, true);
}

export function renderAvatarArtwork(id, lazy = false) {
  const path = avatarArtworkPath(id);
  return path ? `<img class="vocab-avatar-character" src="${path}" alt="" decoding="async"${lazy?' loading="lazy"':''}>` : '';
}

export function avatarInitials(name) {
  return String(name ?? '').trim().split(/\s+/).slice(0,2)
    .map(word => Array.from(word)[0] ?? '').join('').toUpperCase() || '?';
}

export function renderLeaderboardAvatar(row) {
  const art = renderAvatarArtwork(row.avatarId, true);
  if (!art) return '';
  const initials = avatarInitials(row.name).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  return `<span class="vocab-leaderboard-portrait" aria-hidden="true"><span>${initials}</span>${art}</span>`;
}

// Premium cosmetic expansion registry. Pure metadata only: this file does not
// grant rewards, publish catalogue rows or change earned/spendable XP.
export const PREMIUM_COLLECTIONS=Object.freeze([
  {id:'neon-district',label:'Neon District',themeId:'neon-district',rewards:[
    ['neon-district','themes','Neon District Theme',2500],
    ['cyber-pulse-frame','frames','Cyber Pulse Frame',1200],
    ['neon-hacker-badge','badges','Neon Hacker Badge',800],
    ['cyber-legend','titles','Cyber Legend',1000],
    ['electric-pulse','effects','Electric Pulse',1600]
  ]},
  {id:'celestial-realms',label:'Celestial Realms',themeId:'celestial-realms',rewards:[
    ['celestial-realms','themes','Celestial Realms Theme',2500],
    ['astral-halo-frame','frames','Astral Halo Frame',1200],
    ['starseer-emblem','badges','Starseer Emblem',800],
    ['sky-wanderer','titles','Sky Wanderer',1000],
    ['stardust-trail','effects','Stardust Trail',1500]
  ]},
  {id:'blockverse',label:'Blockverse',themeId:'blockverse',rewards:[
    ['blockverse','themes','Blockverse Theme',2000],
    ['voxel-master-frame','frames','Voxel Master Frame',800],
    ['diamond-block-badge','badges','Diamond Block Badge',600],
    ['master-builder','titles','Master Builder',1200],
    ['pixel-burst','effects','Pixel Burst',1000]
  ]},
  {id:'afterlight',label:'Afterlight',themeId:'afterlight',rewards:[
    ['afterlight','themes','Afterlight Theme',2200],
    ['survivor-frame','frames','Survivor Frame',800],
    ['last-explorer-badge','badges','Last Explorer Badge',600],
    ['the-pathfinder','titles','The Pathfinder',1200],
    ['golden-sunrays','effects','Golden Sunrays',1400]
  ]},
  {id:'dreamwave',label:'Dreamwave',themeId:'dreamwave',rewards:[
    ['dreamwave','themes','Dreamwave Theme',2000],
    ['iridescent-frame','frames','Iridescent Frame',800],
    ['chrome-star-badge','badges','Chrome Star Badge',600],
    ['dream-icon','titles','Dream Icon',1500],
    ['prismatic-glow','effects','Prismatic Glow',1200]
  ]}
].map(collection=>Object.freeze({...collection,rewards:Object.freeze(collection.rewards.map(row=>Object.freeze(row)))})));

// Original-theme and universal live-effects collection. Metadata only;
// product unlocks always require the server catalogue and verified ownership.
export const ORIGINAL_ANIMATED_EFFECTS=Object.freeze([
  ['forest-fireflies','Forest Fireflies',900],
  ['ocean-bubbles','Ocean Bubbles',900],
  ['sakura-petals','Falling Sakura Petals',1000],
  ['midnight-starlight','Midnight Starlight',1000],
  ['rainbow-aura','Rainbow Aura',1600]
].map(row=>Object.freeze(row)));

export const STANDARD_THEME_IDS=Object.freeze(['midnight','forest','ocean','sakura']);
export const PREMIUM_THEME_IDS=Object.freeze(PREMIUM_COLLECTIONS.map(c=>c.themeId));
export const SUPPORTED_THEME_IDS=Object.freeze([...STANDARD_THEME_IDS,...PREMIUM_THEME_IDS]);
export const EQUIPMENT_CATEGORIES=Object.freeze(['themes','frames','badges','titles','effects','avatars']);
// Badges is a distinct fifth slot. Pixel Badge is now a real badge;
// the database migration preserves all legacy ownership and spent XP.
export const LEGACY_CATEGORIES=Object.freeze(['themes','frames','titles','effects']);
export const hasBadgeCatalog=shop=>Array.isArray(shop?.rewards)&&shop.rewards.some(r=>r.category==='badges');
export const visibleEquipmentCategories=shop=>EQUIPMENT_CATEGORIES.filter(category=>
  category==='badges'?hasBadgeCatalog(shop):category!=='avatars'||shop?.rewards?.some(row=>row.category==='avatars'));

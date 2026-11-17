// Pure, immutable catalogue for the Vocabulary Builder rewards preview.
// Cosmetic rewards only: none changes questions, marks, mastery, merits or learning access.
// Prices are proposals until the server-authoritative wallet and redemption RPC ship.
export const REWARD_CATEGORIES = Object.freeze([
  { id:'all', label:'All' }, { id:'themes', label:'Themes' },
  { id:'frames', label:'Frames' }, { id:'titles', label:'Titles' },
  { id:'effects', label:'Effects' }
]);
const rewards = [
  ['midnight','Midnight Theme','themes',600,'A calmer dark theme for focused study.','🌙'],
  ['forest','Forest Theme','themes',600,'A fresh, nature-inspired look.','🌿'],
  ['sakura','Sakura Theme','themes',900,'A soft pink springtime palette.','🌸'],
  ['ocean','Ocean Theme','themes',900,'Cool blue shades for your workspace.','🌊'],
  ['gold-frame','Golden Frame','frames',800,'A golden border for your profile.','🏅'],
  ['aurora-frame','Aurora Frame','frames',1800,'A luminous, colourful profile frame.','💠'],
  ['scholar-frame','Scholar Frame','frames',1200,'An elegant academic profile border.','📚'],
  ['word-wizard','Word Wizard','titles',1000,'A title for dedicated vocabulary learners.','🧙'],
  ['word-explorer','Word Explorer','titles',350,'Celebrate your curiosity about words.','🧭'],
  ['language-ace','Language Ace','titles',1600,'For students reaching new heights.','🏆'],
  ['pixel-badge','Pixel Badge','effects',400,'Retro-style decoration for your profile.','✨'],
  ['sparkle','Sparkle Effect','effects',1100,'A gentle sparkle around your avatar.','⭐']
];
export const REWARDS = Object.freeze(rewards.map(([id,name,category,price,description,icon]) =>
  Object.freeze({ id,name,category,price,description,icon,kind:'cosmetic' })));
export const REWARD_IDS = Object.freeze(new Set(REWARDS.map(reward => reward.id)));
export function rewardsForCategory(category='all') {
  if (category === 'all') return [...REWARDS];
  if (!REWARD_CATEGORIES.some(row => row.id === category)) return [];
  return REWARDS.filter(reward => reward.category === category);
}

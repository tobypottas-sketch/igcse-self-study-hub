import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {rewardArtworkPath} from '../src/vocabulary/rewards-art.js';
import {studentIdentityView,renderIdentityShowcase,applyRewardTheme} from '../src/vocabulary/rewards-equipped-home.js';
import {SUPPORTED_THEME_IDS,PREMIUM_COLLECTIONS} from '../src/vocabulary/rewards-premium-registry.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('Neon District is a complete planned five-piece collection',()=>{
 const neon=PREMIUM_COLLECTIONS.find(x=>x.id==='neon-district');
 assert.ok(neon);
 assert.equal(neon.rewards.length,5);
 assert.deepEqual(new Set(neon.rewards.map(x=>x[1])),new Set(['themes','frames','badges','titles','effects']));
 assert.ok(SUPPORTED_THEME_IDS.includes('neon-district'));
 for(const [id] of neon.rewards)assert.ok(rewardArtworkPath(id)?.endsWith(id+'.png'));
});
test('theme CSS is scoped and loaded after existing style cascade',()=>{
 const css=read('vocabulary-premium-neon-district.css');
 const html=read('vocabulary.html');
 assert.match(css,/#vocabularyApp\.vocab-real-theme--neon-district/);
 assert.match(css,/--neon-cyan:/);
 assert.match(css,/--neon-pink:/);
 assert.match(css,/var\(--unit-wallpaper\)/);
 assert.match(css,/\.vocab-shop-redesign/);
 assert.match(css,/@media\(forced-colors:active\)/);
 assert.ok(html.indexOf('vocabulary-premium-neon-district.css')>html.indexOf('vocabulary-reward-identity.css'));
});
test('Neon rewards are staged disabled, not unexpectedly sold',()=>{
 const sql=read('supabase/sql/neon-district-catalog-staged.sql');
 for(const id of ['neon-district','cyber-pulse-frame','neon-hacker-badge','cyber-legend','electric-pulse'])
  assert.ok(sql.includes("'"+id+"'"));
 assert.equal((sql.match(/false\)/g)||[]).length,5);
 assert.doesNotMatch(sql,/update\s+public\.vocabulary_reward_catalog\s+set\s+enabled\s*=\s*true/i);
});

test('asset files must exist before Neon District can be merged or sold',()=>{
 const paths=['neon-district.png','neon-district-preview.png','cyber-pulse-frame.png','neon-hacker-badge.png','cyber-legend.png','electric-pulse.png'];
 for(const filename of paths){
  const relative='../assets/vocabulary/rewards/'+filename;
  const bytes=readFileSync(new URL(relative,import.meta.url));
  assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a','Invalid PNG: '+filename);
  assert.ok(bytes.readUInt32BE(16)>=500,'PNG is too small: '+filename);
  assert.ok(bytes.readUInt32BE(20)>=500,'PNG is too short: '+filename);
 }
});

test('electric pulse remains separate from Badge and survives theme changes',()=>{
 const rewards=[
  {reward_id:'neon-hacker-badge',category:'badges',name:'Neon Hacker Badge'},
  {reward_id:'electric-pulse',category:'effects',name:'Electric Pulse'},
  {reward_id:'neon-district',category:'themes',name:'Neon District Theme'}
 ];
 const owned=rewards.map(r=>({reward_id:r.reward_id,category:r.category,equipped:true}));
 const shop={shopMode:'production',rewards,owned};
 const identity=studentIdentityView(shop,'Test Student');
 assert.match(identity.badge,/neon-hacker-badge\.png$/);
 assert.match(identity.effectArt,/electric-pulse\.png$/);
 const html=renderIdentityShowcase(shop,'Test Student');
 assert.match(html,/class="vocab-student-identity__badge"/);
 assert.match(html,/class="vocab-student-identity__effect"/);
 assert.match(html,/3 \/ 5/);
 const css=read('vocabulary-premium-neon-district.css');
 assert.match(css,/\.vocab-student-identity__effect/);
 const classes=new Set();
 const root={classList:{add:v=>classes.add(v),remove:(...values)=>values.forEach(v=>classes.delete(v))}};
 applyRewardTheme(root,shop);
 assert.ok(classes.has('vocab-real-effect--electric-pulse'));
 applyRewardTheme(root,{...shop,owned:owned.filter(x=>x.category!=='themes')});
 assert.ok(classes.has('vocab-real-effect--electric-pulse'));
 assert.ok(!classes.has('vocab-real-theme--neon-district'));
});

test('Neon home contrast overrides actual dashboard owners without changing cosmetics semantics',()=>{
 const css=read('vocabulary-premium-neon-district.css');
 const dashboard=read('vocabulary-rewards-dashboard.css');
 const progress=read('vocabulary-progress.css');
 const html=read('vocabulary.html');
 for(const selector of [
  '.vocab-progress-entry',
  '.vocab-student-identity__slot',
  '.vocab-student-identity__slot.is-equipped',
  '.vocab-student-identity__title-label',
  '.vocab-rewards-home-card__body strong',
  '.vocab-rewards-home-card__test-note'
 ]){
   assert.ok(css.includes(selector),'Neon contrast missing: '+selector);
 }
 assert.match(progress,/\.vocab-shell--home>\.vocab-progress-entry/);
 assert.match(dashboard,/\.vocab-student-identity__theme\{/);
 assert.match(css,/\.vocab-progress-entry\s*\{\s*background:[^;]+!important;/);
 assert.match(css,/\.vocab-student-identity\s*\{\s*background:[^;]+!important;/);
 assert.match(css,/\.vocab-student-identity__title-label\s*\{[^}]+color:[^;]+!important;/);
 assert.match(css,/@media\(forced-colors:active\)/);
 assert.match(html,/vocabulary-premium-neon-district\.css\?v=neon-leaderboard-contrast-v3/);
 assert.ok(html.indexOf('vocabulary-premium-neon-district.css')>html.indexOf('vocabulary-rewards-dashboard.css'));
 assert.doesNotMatch(css,/\.vocab-student-identity\s+span\s*\{/);
});

test('Neon leaderboard dark header uses light heading and class text',()=>{
 const css=read('vocabulary-premium-neon-district.css');
 const leader=read('vocabulary-leaderboard-polish.css');
 const html=read('vocabulary.html');
 const scope='#vocabularyApp.vocab-real-theme--neon-district .vocab-shop-redesign .vocab-shop-leaderboard .vocab-shop-leaderboard__head';
 assert.match(leader,/\.vocab-shop-leaderboard__head\s*\{[^}]+background:linear-gradient/);
 assert.ok(css.includes(scope+' h2{'));
 assert.ok(css.includes(scope+' small{'));
 assert.match(css,/\.vocab-shop-leaderboard__head h2\s*\{\s*color:#fff!important;/);
 assert.match(css,/\.vocab-shop-leaderboard__head small\s*\{\s*color:#e3f4ff!important;/);
 assert.match(css,/\.vocab-shop-leaderboard__tabs button\.is-active\s*\{\s*color:#fff!important;/);
 assert.match(css,/\.vocab-shop-leaderboard__tabs button:not\(\.is-active\)\s*\{\s*color:#214e70!important;/);
 assert.match(html,/neon-leaderboard-contrast-v3/);
});

test('Electric Pulse actually animates the avatar aura, including mini profile, with accessible reduced motion',()=>{
 const css=read('vocabulary-effects-animated.css');
 const html=read('vocabulary.html');
 assert.match(css,/#vocabularyApp\.vocab-real-effect--electric-pulse \.vocab-student-identity__effect\{/);
 assert.match(css,/animation:vocab-electric-pulse-art 3\.8s ease-in-out infinite/);
 assert.match(css,/#vocabularyApp\.vocab-real-effect--electric-pulse \.vocab-student-identity__avatar::before\{/);
 assert.match(css,/@keyframes vocab-electric-pulse-ring/);
 assert.match(css,/@keyframes vocab-electric-pulse-art/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 const reduced=css.slice(css.indexOf('@media(prefers-reduced-motion:reduce)',css.indexOf('@keyframes vocab-electric-pulse-art')));
 assert.match(reduced,/vocab-real-effect--electric-pulse/);
 assert.match(reduced,/animation:none!important/);
 assert.match(css,/\.vocab-student-identity-mini \.vocab-student-identity__effect\{/);
 assert.match(css,/\.vocab-student-identity__initials\{z-index:2\}/);
 assert.match(css,/@media print,\(forced-colors:active\)/);
 assert.doesNotMatch(css,/\.vocab-answer--correct|\.vocab-answer--wrong/);
 assert.match(html,/vocabulary-effects-animated\.css\?v=rainbow-full-colour-motion-v1/);
});

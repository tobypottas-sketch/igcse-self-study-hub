// Student-facing equipped identity and app-wide cosmetic theme controller.
// The backend owns inventory; only equipped items found in its returned catalogue
// can influence presentation. No learning content, grades, mastery or XP changes.
import {rewardArtworkPath} from './rewards-art.js?v=afterlight-v1';
import {ensureRewardsDashboard} from './rewards-home-layout.js';
import {SUPPORTED_THEME_IDS,EQUIPMENT_CATEGORIES,visibleEquipmentCategories} from './rewards-premium-registry.js';
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const THEMES=new Set(SUPPORTED_THEME_IDS);
const EFFECTS=new Set(['sparkle','electric-pulse','stardust-trail','forest-fireflies','ocean-bubbles','sakura-petals','midnight-starlight','rainbow-aura','golden-sunrays']);
const ANIMATED_EFFECTS=new Set(['forest-fireflies','ocean-bubbles','sakura-petals','midnight-starlight','rainbow-aura','golden-sunrays']);
const CATEGORIES=EQUIPMENT_CATEGORIES;
const ROOT_CLASSES=[...THEMES].map(x=>'vocab-real-theme--'+x);
const EFFECT_CLASSES=[...EFFECTS].map(x=>'vocab-real-effect--'+x);

export function equippedCosmetics(shop){
 if(!(shop?.shopMode==='production'||(shop?.shopMode==='sandbox'&&shop?.sandboxEnabled===true))||!Array.isArray(shop.owned)||!Array.isArray(shop.rewards))return {};
 const catalog=new Map(shop.rewards.map(r=>[r.reward_id,r]));
 const active={};
 for(const item of shop.owned){
   const reward=catalog.get(item.reward_id);
   if(item.equipped===true&&reward?.category===item.category&&CATEGORIES.includes(item.category))
     active[item.category]=item.reward_id;
 }
 return active;
}

export function studentIdentityView(shop,displayName='Student'){
 const active=equippedCosmetics(shop);
 const sandboxPreview=shop?.shopMode==='sandbox'&&shop.sandboxEnabled===true;
 const items=new Map((shop?.rewards??[]).map(r=>[r.reward_id,r]));
 const name=String(displayName||'Student').trim().slice(0,65)||'Student';
 const initials=name.split(/\s+/).slice(0,2).map(p=>p[0]?.toUpperCase()??'').join('');
 return {
   name,initials,active,sandboxPreview,
   title:active.titles?items.get(active.titles)?.name??'':'',
   titleArt:active.titles?rewardArtworkPath(active.titles):null,
   frame:active.frames?rewardArtworkPath(active.frames):null,
   badge:active.badges?rewardArtworkPath(active.badges):active.effects==='sparkle'?rewardArtworkPath('sparkle'):null,
   effectArt:['electric-pulse','stardust-trail'].includes(active.effects)||ANIMATED_EFFECTS.has(active.effects)?rewardArtworkPath(active.effects):null,
   animatedEffect:ANIMATED_EFFECTS.has(active.effects)?active.effects:null,
   effectName:active.effects?items.get(active.effects)?.name??'':'',
   themeName:active.themes?items.get(active.themes)?.name??'':''
 };
}
function avatar(identity,compact=false){
 const motion=identity.animatedEffect;
 const particles=motion?`<span class="vocab-cosmetic-particles" aria-hidden="true">${Array.from({length:6},(_,i)=>`<i class="vocab-cosmetic-particle vocab-cosmetic-particle--${i+1}"></i>`).join('')}</span>`:'';
 return `<span class="vocab-student-identity__avatar${identity.frame?' has-frame':''}${identity.badge?' has-badge':''}${motion?' has-animated-effect':''}" ${motion?`data-cosmetic-effect="${motion}"`:``} aria-hidden="true">
   ${identity.frame?`<img class="vocab-student-identity__frame" src="${identity.frame}" alt="" decoding="async">`:''}
   <span class="vocab-student-identity__initials">${escapeHtml(identity.initials)}</span>
   ${identity.badge?`<img class="vocab-student-identity__badge" src="${identity.badge}" alt="" decoding="async">`:''}
   ${identity.effectArt?`<img class="vocab-student-identity__effect" src="${identity.effectArt}" alt="" decoding="async">`:''}
   ${particles}
 </span>`;
}
function profileProgressSummary(shop,engagement=null){
 const xp=engagement?.level;
 const ready=xp&&Number.isFinite(xp.xp)&&Number.isFinite(xp.level);
 const next=ready&&Number.isFinite(xp.next)?xp.next:null;
 const pct=ready?Math.max(0,Math.min(100,Number(xp.progressPercent)||0)):null;
 const spendable=shop?.wallet?.available;
 const canSpend=Number.isSafeInteger(spendable)&&spendable>=0;
 const isTest=shop?.shopMode==='sandbox';
 const balance=canSpend?`<div class="vocab-student-identity__metric vocab-student-identity__metric--wallet"><span class="vocab-student-identity__metric-label">${isTest?'Test XP':'Available XP'}</span><strong>${spendable.toLocaleString('en')}</strong></div>`:'';
 const learning=ready?`<div class="vocab-student-identity__level">
   <div class="vocab-student-identity__level-top"><span><strong>Level ${xp.level}</strong> <span>· ${next===null?'Top level':`Level ${xp.level+1} next`}</span></span><b>${xp.xp.toLocaleString('en')}${next===null?' XP':` / ${next.toLocaleString('en')} XP`}</b></div>
   <div class="vocab-student-identity__level-track" role="progressbar" aria-label="Learning XP towards next level" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><span style="width:${pct}%"></span></div>
  </div>`:'';
 return learning||balance?`<div class="vocab-student-identity__progress" aria-label="Student learning and rewards progress">${learning}${balance}</div>`:'';
}
export function renderIdentityShowcase(shop,displayName='Student',engagement=null){
 const id=studentIdentityView(shop,displayName);
 const active=id.active;
 const labels={themes:'Theme',frames:'Frame',badges:'Badge',titles:'Title',effects:'Effect'};
 const equippedCount=Object.keys(active).length;
 const itemNames=new Map((shop?.rewards??[]).map(item=>[item.reward_id,item.name]));
 const categories=visibleEquipmentCategories(shop);
 const status=categories.map(category=>{
   const reward=active[category];
   return reward?`${itemNames.get(reward)??labels[category]} ${category==='themes'?'active':'equipped'}`:`${labels[category]} not equipped`;
 }).join('; ');
 const summary=`${equippedCount} / ${categories.length} ${id.sandboxPreview?'test equipped':'equipped'}: ${status}`;
 const title=id.title
   ?(id.titleArt
     ?`<span class="vocab-student-identity__title-art"><img src="${id.titleArt}" alt="${escapeHtml(id.title)} title artwork" decoding="async"></span>`
     :`<span class="vocab-student-identity__title">${escapeHtml(id.title)}</span>`)
   :'';
 return `<section class="vocab-real-cosmetics vocab-student-identity" data-real-cosmetics aria-label="Your student profile and equipped rewards">
   <div class="vocab-student-identity__portrait">${avatar(id)}</div>
   <div class="vocab-student-identity__text">
     <span class="vocab-student-identity__eyebrow">${id.sandboxPreview?'Preview':'MY STUDENT PROFILE'}</span>
     <h2>${escapeHtml(id.name)}</h2>
     <span class="vocab-student-identity__stamp"><span aria-hidden="true">${equippedCount} / ${categories.length} equipped</span><span class="vocab-sr-only">${escapeHtml(summary)}</span></span>
   </div>
   ${profileProgressSummary(shop,engagement)}
   <div class="vocab-student-identity__extras" aria-label="Equipped title artwork">${title||'<span class="vocab-student-identity__detail">Choose a title in the shop</span>'}</div>
 </section>`;
}
export function applyRewardTheme(root,shop){
 if(!root?.classList)return {};
 root.classList.remove(...ROOT_CLASSES,...EFFECT_CLASSES);
 const active=equippedCosmetics(shop);
 if(THEMES.has(active.themes))root.classList.add('vocab-real-theme--'+active.themes);
 if(EFFECTS.has(active.effects))root.classList.add('vocab-real-effect--'+active.effects);
 return active;
}
export function decorateStudentIdentity(root,shop,displayName='Student'){
 const id=studentIdentityView(shop,displayName);
 const header=root?.querySelector?.('.vocab-topbar');
 if(!header)return;
 header.querySelector('[data-student-identity-mini]')?.remove();
 const chip=document.createElement('div');
 chip.dataset.studentIdentityMini='true';
 chip.className='vocab-student-identity-mini';
 chip.setAttribute('aria-label',id.name+(id.title?' · '+id.title:'')+(id.effectName?' · '+id.effectName:'')+(id.sandboxPreview?' · test cosmetics preview':''));
 chip.innerHTML=avatar(id,true)+`<span class="vocab-student-identity-mini__name">${escapeHtml(id.name)}${id.title?(id.titleArt?`<small class="vocab-student-identity-mini__title-art"><img src="${id.titleArt}" alt="${escapeHtml(id.title)} title" decoding="async"></small>`:`<small>${escapeHtml(id.title)}</small>`):id.sandboxPreview?'<small>Test cosmetics preview</small>':''}</span>`;
 // The course code and navigation remain accessible; add a compact identity at
 // the far end without replacing the existing page header controls.
 header.append(chip);
}
export function renderEquippedCosmetics(root,shop,displayName='Student',engagement=null){
 const home=root?.querySelector?.('.vocab-shell--home');
 applyRewardTheme(root,shop);
 if(!home)return;
 const layout=ensureRewardsDashboard(home);
 const main=layout?.querySelector('[data-rewards-dashboard-main]');
 if(!main)return;
 main.querySelector('[data-real-cosmetics]')?.remove();
 main.insertAdjacentHTML('afterbegin',renderIdentityShowcase(shop,displayName,engagement));
 decorateStudentIdentity(root,shop,displayName);
}

// Student-facing equipped identity and app-wide cosmetic theme controller.
// The backend owns inventory; only equipped items found in its returned catalogue
// can influence presentation. No learning content, grades, mastery or XP changes.
import {rewardArtworkPath} from './rewards-art.js';
import {ensureRewardsDashboard} from './rewards-home-layout.js';
import {SUPPORTED_THEME_IDS,EQUIPMENT_CATEGORIES,visibleEquipmentCategories} from './rewards-premium-registry.js';
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const THEMES=new Set(SUPPORTED_THEME_IDS);
const EFFECTS=new Set(['sparkle','pixel-badge']);
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
   badge:active.badges?rewardArtworkPath(active.badges):active.effects==='pixel-badge'?rewardArtworkPath(active.effects):null,
   effectName:active.effects?items.get(active.effects)?.name??'':'',
   themeName:active.themes?items.get(active.themes)?.name??'':''
 };
}
function avatar(identity,compact=false){
 return `<span class="vocab-student-identity__avatar${identity.frame?' has-frame':''}${identity.badge?' has-badge':''}" aria-hidden="true">
   ${identity.frame?`<img class="vocab-student-identity__frame" src="${identity.frame}" alt="" decoding="async">`:''}
   <span class="vocab-student-identity__initials">${escapeHtml(identity.initials)}</span>
   ${identity.badge?`<img class="vocab-student-identity__badge" src="${identity.badge}" alt="" decoding="async">`:''}
 </span>`;
}
export function renderIdentityShowcase(shop,displayName='Student'){
 const id=studentIdentityView(shop,displayName);
 const active=id.active;
 const labels={themes:'Theme',frames:'Frame',badges:'Badge',titles:'Title',effects:'Effect'};
 const equippedCount=Object.keys(active).length;
 const itemNames=new Map((shop?.rewards??[]).map(item=>[item.reward_id,item.name]));
 const categories=visibleEquipmentCategories(shop);
 const status=categories.map(category=>{
   const reward=active[category];
   const detail=reward?`${itemNames.get(reward)??labels[category]} ${category==='themes'?'active':'equipped'}`:`${labels[category]} not equipped`;
   return `<span class="vocab-student-identity__slot${reward?' is-equipped':''}" aria-label="${escapeHtml(detail)}" title="${escapeHtml(detail)}">
     <span class="vocab-student-identity__slot-dot" aria-hidden="true"></span>${labels[category]}
   </span>`;
 }).join('');
 const title=id.title
   ?(id.titleArt
     ?`<span class="vocab-student-identity__title-art"><img src="${id.titleArt}" alt="${escapeHtml(id.title)} title artwork" decoding="async"><span class="vocab-student-identity__title-label">${escapeHtml(id.title)}</span></span>`
     :`<span class="vocab-student-identity__title">${escapeHtml(id.title)}</span>`)
   :'';
 return `<section class="vocab-real-cosmetics vocab-student-identity" data-real-cosmetics aria-label="Your student profile and equipped rewards">
   <div class="vocab-student-identity__portrait">${avatar(id)}</div>
   <div class="vocab-student-identity__text">
     <span class="vocab-student-identity__eyebrow">${id.sandboxPreview?'TEST COSMETICS PREVIEW':'MY STUDENT PROFILE'}</span>
     <h2>${escapeHtml(id.name)}</h2>
     <div class="vocab-student-identity__slots" aria-label="Equipped reward categories">${status}</div>
     <span class="vocab-student-identity__stamp">${equippedCount} / ${categories.length} ${id.sandboxPreview?'test equipped':'equipped'}</span>
   </div>
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
export function renderEquippedCosmetics(root,shop,displayName='Student'){
 const home=root?.querySelector?.('.vocab-shell--home');
 applyRewardTheme(root,shop);
 if(!home)return;
 const layout=ensureRewardsDashboard(home);
 const main=layout?.querySelector('[data-rewards-dashboard-main]');
 if(!main)return;
 main.querySelector('[data-real-cosmetics]')?.remove();
 main.insertAdjacentHTML('afterbegin',renderIdentityShowcase(shop,displayName));
 decorateStudentIdentity(root,shop,displayName);
}

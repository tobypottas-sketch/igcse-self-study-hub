import {renderLeaderboardAvatar} from './rewards-avatars.js';
// Full leaderboard lives in a dedicated, accessible overlay; the Rewards Shop
// always keeps its seven-row preview. No ranking or XP calculations here.
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const xp=value=>Number.isFinite(Number(value))&&Number(value)>=0?Math.floor(Number(value)).toLocaleString('en'):'0';
const PAGE_SIZE=12;
export const leaderboardPageSize=PAGE_SIZE;

export function leaderboardModal(board,view={}){
 const period=view.period==='all'?'all':'weekly';
 const scope=view.scope==='school'?'school':'class';
 const tab=(name,label,value,selected)=>`<button type="button" data-action="sandbox-leaderboard" data-${name}="${value}" aria-pressed="${selected===value}" class="${selected===value?'is-active':''}">${label}</button>`;
 return `<div class="vocab-leaderboard-overlay" data-leaderboard-overlay>
  <section class="vocab-leaderboard-dialog" role="dialog" aria-modal="true" aria-labelledby="vocabFullLeaderboardTitle" data-leaderboard-dialog tabindex="-1">
   <header class="vocab-leaderboard-dialog__head">
    <div><p class="vocab-leaderboard-dialog__eyebrow">⚡ VERIFIED PRACTICE XP</p>
      <h2 id="vocabFullLeaderboardTitle">🏆 Leaderboard</h2>
      <p>Climb the rankings by practising vocabulary.</p></div>
    <button type="button" class="vocab-leaderboard-dialog__close" data-action="sandbox-leaderboard-expand" aria-label="Close leaderboard">✕ <span>Close</span></button>
   </header>
   <div class="vocab-leaderboard-dialog__switches">
    <div class="vocab-shop-leaderboard__tabs" role="group" aria-label="Leaderboard group">${tab('scope','My Class','class',scope)}${tab('scope','All Classes','school',scope)}</div>
    <div class="vocab-shop-leaderboard__tabs" role="group" aria-label="Leaderboard period">${tab('period','This Week','weekly',period)}${tab('period','All Time','all',period)}</div>
   </div>
   <div class="vocab-leaderboard-dialog__body">
     <div class="vocab-leaderboard-podium" data-leaderboard-podium></div>
     <div class="vocab-leaderboard-tools">
       <label class="vocab-leaderboard-search"><span class="vocab-leaderboard-search__label">Find a classmate</span>
         <input type="search" data-leaderboard-search placeholder="Search by first or last name…" autocomplete="off" aria-controls="vocabFullLeaderboardResults"></label>
       <label class="vocab-leaderboard-active"><input type="checkbox" data-leaderboard-active checked> Active learners only</label>
     </div>
     <div class="vocab-leaderboard-list-head"><strong>Rankings</strong><span data-leaderboard-count></span></div>
     <div id="vocabFullLeaderboardResults" class="vocab-leaderboard-results" data-leaderboard-results aria-live="polite"></div>
     <div class="vocab-leaderboard-pages" data-leaderboard-pages></div>
   </div>
   <footer class="vocab-leaderboard-dialog__footer">
      <div data-leaderboard-my-rank></div>
      <small>Verified practice XP only — shop credits do not count.</small>
   </footer>
  </section>
 </div>`;
}

function resultRow(row){
 const rank=Number(row.rank)||0;
 const podium=rank>=1&&rank<=3?' is-podium is-podium--'+rank:'';
 return `<div class="vocab-shop-leaderboard__row${row.isYou?' is-you':''}${podium}">
  <span class="vocab-shop-leaderboard__rank" aria-label="Rank ${rank}">${rank<=3?['🥇','🥈','🥉'][rank-1]:rank}</span>
  <span class="vocab-shop-leaderboard__name">${renderLeaderboardAvatar(row)}${escapeHtml(row.name)}${row.isYou?'<small>Your rank</small>':''}</span>
  <strong class="vocab-shop-leaderboard__xp">${xp(row.xp)} <span>XP</span></strong>
 </div>`;
}
export function installLeaderboardModal(root,board,view={}){
 const overlay=root.querySelector?.('[data-leaderboard-overlay]');
 if(!overlay)return;
 const dialog=overlay.querySelector('[data-leaderboard-dialog]');
 const results=overlay.querySelector('[data-leaderboard-results]');
 const pager=overlay.querySelector('[data-leaderboard-pages]');
 const count=overlay.querySelector('[data-leaderboard-count]');
 const search=overlay.querySelector('[data-leaderboard-search]');
 const active=overlay.querySelector('[data-leaderboard-active]');
 const podium=overlay.querySelector('[data-leaderboard-podium]');
 const myRank=overlay.querySelector('[data-leaderboard-my-rank]');
 const state={page:0,term:'',activeOnly:true};
 const all=board?.ok&&Array.isArray(board.rows)?board.rows:[];
 const top=all.filter(row=>row.rank<=3&&Number(row.xp)>0).slice(0,3);
 podium.innerHTML=top.length?`<div class="vocab-leaderboard-podium__title">⭐ TOP LEARNERS</div><div class="vocab-leaderboard-podium__places">${top.map(row=>`<div class="vocab-leaderboard-podium__place is-rank-${row.rank}"><span>${['🥇','🥈','🥉'][row.rank-1]}</span><strong>${renderLeaderboardAvatar(row)}${escapeHtml(row.name)}</strong><small>${xp(row.xp)} XP</small></div>`).join('')}</div>`:'';
 const me=board?.me;
 myRank.innerHTML=me?`<span>YOUR POSITION</span><strong>#${Number(me.rank)||0} · ${xp(me.xp)} XP</strong>`:'';
 function update(){
  const filtered=all.filter(row=>(!state.activeOnly||Number(row.xp)>0)&&String(row.name??'').toLocaleLowerCase().includes(state.term));
  const pages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
  state.page=Math.min(state.page,pages-1);
  const start=state.page*PAGE_SIZE;
  const entries=filtered.slice(start,start+PAGE_SIZE);
  results.innerHTML=entries.map(resultRow).join('')||
    `<p class="vocab-leaderboard-empty">${board?.ok?'No matching students. Try another name or show all learners.':'Leaderboard unavailable right now. Please try again.'}</p>`;
  count.textContent=`${filtered.length} learner${filtered.length===1?'':'s'}`;
  pager.innerHTML=filtered.length>PAGE_SIZE?`<button type="button" data-leaderboard-page="previous" ${state.page===0?'disabled':''}>← Previous</button>
    <span>Page ${state.page+1} of ${pages}</span>
    <button type="button" data-leaderboard-page="next" ${state.page===pages-1?'disabled':''}>Next →</button>`:'';
 }
 search.addEventListener('input',()=>{state.term=search.value.trim().toLocaleLowerCase();state.page=0;update()});
 active.addEventListener('change',()=>{state.activeOnly=active.checked;state.page=0;update()});
 pager.addEventListener('click',event=>{
  const target=event.target.closest('[data-leaderboard-page]');
  if(!target||target.disabled)return;
  state.page+=target.dataset.leaderboardPage==='next'?1:-1;
  update();
  results.scrollIntoView?.({block:'nearest',behavior:'instant'});
 });
 overlay.addEventListener('click',event=>{
  if(event.target===overlay)overlay.querySelector('[data-action="sandbox-leaderboard-expand"]')?.click();
 });
 overlay.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();overlay.querySelector('[data-action="sandbox-leaderboard-expand"]')?.click();return}
  if(event.key!=='Tab')return;
  const controls=[...overlay.querySelectorAll('button:not(:disabled),input:not(:disabled)')];
  if(!controls.length)return;
  const first=controls[0],last=controls[controls.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
 });
 // Prevent screen readers and keyboard users from reaching the Rewards Shop behind the dialog.
 root.querySelectorAll('.vocab-shop-redesign > :not(.vocab-leaderboard-overlay)').forEach(element=>{element.inert=true});
 update();
 dialog.focus({preventScroll:true});
}

/** Refresh only the fixed overlay, never the underlying Rewards Shop.
 * Changing scope/period previously replaced root.innerHTML and moved the
 * document underneath an open dialog. Preserve focus without scrolling. */
export function updateLeaderboardModal(root,board,view={}){
 const previous=root?.querySelector?.('[data-leaderboard-overlay]');
 if(!previous)return false;
 const focused=previous.contains(document.activeElement)?document.activeElement:null;
 const focusAction=focused?.dataset.action;
 const focusScope=focused?.dataset.scope;
 const focusPeriod=focused?.dataset.period;
 const production=Boolean(root.querySelector('.vocab-shell--production'));
 let html=leaderboardModal(board,view);
 if(production)html=html.replace(/data-action="sandbox-/g,'data-action="real-');
 const template=document.createElement('template');
 template.innerHTML=html.trim();
 const next=template.content.firstElementChild;
 if(!next)return false;
 previous.replaceWith(next);
 installLeaderboardModal(root,board,view);
 const controls=[...next.querySelectorAll('button')];
 const restore=controls.find(button=>button.dataset.action===focusAction &&
   (focusScope?button.dataset.scope===focusScope:true) &&
   (focusPeriod?button.dataset.period===focusPeriod:true));
 restore?.focus({preventScroll:true});
 return true;
}
/** Show selected tabs immediately while the verified XP request is pending.
 * Never destroy the dialog, its scroll position, or the shop behind it. */
export function markLeaderboardTabPending(root,view={}){
 const overlay=root?.querySelector?.('[data-leaderboard-overlay]');
 if(!overlay)return false;
 for(const button of overlay.querySelectorAll('[data-scope],[data-period]')){
  const selected=button.dataset.scope!==undefined?
    button.dataset.scope===view.scope:button.dataset.period===view.period;
  button.classList.toggle('is-active',selected);
  button.setAttribute('aria-pressed',String(selected));
 }
 overlay.querySelector('[data-leaderboard-results]')?.setAttribute('aria-busy','true');
 return true;
}

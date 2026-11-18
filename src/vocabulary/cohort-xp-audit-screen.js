// Admin-only canonical XP reconciliation and explicitly confirmed wallet initialization.
// Server functions recheck permissions and calculate XP; the browser has no service key.
const safe=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const count=value=>Number.isSafeInteger(value)&&value>=0?value:0;
const fmt=value=>count(value).toLocaleString('en');
export function aggregateCohortAudit(pages){
 const total={examined:0,totalStudents:0,withMissions:0,zeroXp:0,timeZoneSensitive:0,missingWallets:0,walletDiscrepancies:0,earnedXpSum:0,withoutMissionsWithXp:0,masteryWithoutMissions:0,components:{missions:0,personalBests:0,weeklyGoals:0,achievements:0,stageClears:0,pathwayMasteries:0,unitMasteries:0},pages:pages.length};
 for(const page of pages){
  if(!page||page.ok!==true||page.auditOnly!==true||page.readyForWalletFunding!==false||
    !Number.isInteger(page.examined)||page.examined<0||
    !page.summary||!Number.isInteger(page.totalStudents))
    throw new Error('The audit returned incomplete or unsafe results.');
  total.examined+=page.examined;total.totalStudents=page.totalStudents;
  for(const key of ['withMissions','zeroXp','timeZoneSensitive','missingWallets','walletDiscrepancies','earnedXpSum','withoutMissionsWithXp','masteryWithoutMissions']){
   const value=page.summary[key];
   if(!Number.isSafeInteger(value)||value<0)throw new Error('The audit returned an invalid '+key+' count.');
   total[key]+=value;
  }
  for(const key of Object.keys(total.components)){
   const value=page.summary.components?.[key];
   if(!Number.isSafeInteger(value)||value<0)throw new Error('The audit returned an invalid XP component.');
   total.components[key]+=value;
  }
  if(Object.values(page.summary.components).reduce((a,b)=>a+b,0)!==page.summary.earnedXpSum)throw new Error('XP components did not reconcile.');
 }
 if(Object.values(total.components).reduce((a,b)=>a+b,0)!==total.earnedXpSum)throw new Error('Lifetime XP totals did not reconcile.');
 if(total.examined!==total.totalStudents)throw new Error('The full student cohort was not examined.');
 return total;
}
export function renderCohortAudit(root,{pages=[],loading=false,error='',complete=false,funding=false,fundedStudents=0,fundingError=''}={}){
 const current=pages.length?pages[pages.length-1]:null;
 const examined=pages.reduce((sum,page)=>sum+count(page.examined),0);
 const expected=count(current?.totalStudents);
 const pct=expected?Math.min(100,Math.round(100*examined/expected)):0;
 const summary=complete?aggregateCohortAudit(pages):null;
 const tile=(value,label)=>`<div class="vocab-cohort-tile"><strong>${fmt(value)}</strong><span>${safe(label)}</span></div>`;
 root.innerHTML=`<main class="vocab-shell vocab-cohort-audit">
 <header class="vocab-topbar"><a href="./vocabulary.html" class="vocab-back">← Teacher analytics</a><span>Administrator · XP reconciliation</span></header>
 <section class="vocab-cohort-header"><span class="vocab-kicker">XP Rewards Shop · Release readiness</span>
 <h1>Student XP reconciliation</h1>
 <p>Audit real vocabulary practice and mastery XP across all active students. Once every XP component reconciles, an administrator can explicitly initialize secure wallets. Purchases remain disabled.</p>
 <div class="vocab-cohort-guard">The cohort scan is read-only · Wallet initialization requires separate confirmation · Real purchases remain disabled</div></section>
 <section class="vocab-cohort-body" aria-live="polite">
 <div class="vocab-cohort-run"><div><h2>Cohort scan</h2><p>${complete?'Full audit complete':loading?'Scanning active student accounts…':error?'The audit did not complete.': 'Ready to check the complete cohort.'}</p></div>
 <button type="button" data-action="run-cohort-audit" ${loading||funding?'disabled':''}>${loading?'Checking…':complete?'Run audit again':'Run full read-only audit'}</button></div>
 <div class="vocab-cohort-track" role="progressbar" aria-label="Students examined" aria-valuemin="0" aria-valuemax="${expected||100}" aria-valuenow="${examined}"><span style="width:${pct}%"></span></div>
 <p class="vocab-cohort-count">${fmt(examined)} of ${expected?fmt(expected):'—'} students checked · ${pages.length} batches</p>
 ${error?`<p class="vocab-cohort-error" role="alert">${safe(error)}</p>`:''}
 ${fundingError?`<p class="vocab-cohort-error" role="alert">${safe(fundingError)}</p>`:''}
 ${summary?`<div class="vocab-cohort-tiles">
 ${tile(summary.examined,'Students examined')}${tile(summary.withMissions,'With recorded missions')}
 ${tile(summary.zeroXp,'Zero calculated XP')}${tile(summary.timeZoneSensitive,'Timezone differences')}
 ${tile(summary.missingWallets,'Wallets not initialised')}${tile(summary.walletDiscrepancies,'Wallet discrepancies')}
 ${tile(summary.earnedXpSum,'Total lifetime XP (all students)')}
 ${tile(summary.masteryWithoutMissions,'Mastery records without missions')}
 ${tile(summary.withoutMissionsWithXp,'Earned XP without missions')}</div>
 <section class="vocab-cohort-breakdown"><h2>Where student XP comes from</h2><div class="vocab-cohort-tiles">
 ${tile(summary.components.missions,'Completed missions')}
 ${tile(summary.components.personalBests,'Personal bests')}
 ${tile(summary.components.weeklyGoals,'Weekly goals')}
 ${tile(summary.components.achievements,'Achievements')}
 ${tile(summary.components.stageClears,'Passed stages')}
 ${tile(summary.components.pathwayMasteries,'Mastered pathways')}
 ${tile(summary.components.unitMasteries,'Mastered units')}
 </div><p class="vocab-cohort-footnote">These seven components must add up exactly to the lifetime total. Checking them does not award XP.</p></section>
 <p class="vocab-cohort-footnote">Students with no missions may still have mastery or achievement XP. Wallet credits are cumulative lifetime XP, never extra XP added per scan.</p>
 <section class="vocab-cohort-funding"><h2>Verified XP wallets</h2>
 <p>${funding?'Initializing wallets in authenticated batches…':summary.missingWallets===0?'Every active student has a wallet.':'Initialize missing wallets using this completed audit. Each batch must match the audited XP totals before any credits are written.'}</p>
 ${fundedStudents?'<p class="vocab-cohort-guard">'+fmt(fundedStudents)+' student wallets verified in this operation.</p>':''}
 ${summary.timeZoneSensitive===0&&summary.walletDiscrepancies===0&&summary.missingWallets>0?
 `<button type="button" data-action="initialize-cohort-wallets" ${loading||funding?'disabled':''}>${funding?'Initialising…':'Initialize verified wallets'}</button>`:
 '<p class="vocab-cohort-footnote">Wallet initialization is unavailable when timezone differences or wallet discrepancies are present, or when all wallets already exist.</p>'}
 </section>`:''}
 </section></main>`;
}
export async function startVocabularyCohortAudit({root,client,profile}){
 if(profile?.role!=='admin'){root.textContent='Administrator access required.';return;}
 let running=false;
 let auditedPages=[];
 const run=async()=>{
  if(running)return;running=true;
  const pages=[];let error='';
  renderCohortAudit(root,{loading:true});
  try{
   for(let page=0;page<100;page++){
    const response=await client.functions.invoke('vocabulary-reward-cohort-audit',{body:{page}});
    if(response.error||response.data?.ok!==true||response.data?.auditOnly!==true||
       response.data?.readyForWalletFunding!==false||response.data?.page!==page)
     throw new Error('Could not verify cohort batch '+(page+1)+'. No credits were changed.');
    pages.push(response.data);
    if(response.data.more===false){
      aggregateCohortAudit(pages);auditedPages=pages;renderCohortAudit(root,{pages,complete:true});return;
    }
    if(response.data.more!==true)throw new Error('The audit did not confirm whether all student batches were checked.');
    renderCohortAudit(root,{pages,loading:true});
   }
   throw new Error('Too many batches; the audit was not completed.');
  }catch(e){error=e instanceof Error?e.message:'The XP audit could not be completed.';
   renderCohortAudit(root,{pages,error});
  }finally{running=false;}
 };
 const initialise=async()=>{
  if(running||!auditedPages.length)return;
  const current=aggregateCohortAudit(auditedPages);
  if(current.timeZoneSensitive!==0||current.walletDiscrepancies!==0||current.missingWallets===0)return;
  // Explicit action; no XP credits may be produced by merely opening this screen.
  if(typeof globalThis.confirm!=='function'||!globalThis.confirm(
    'Initialize verified XP wallets for '+current.examined+' students? This creates real spendable XP balances from server-verified progress. Real purchases remain disabled.'
  ))return;
  running=true;
  let fundedStudents=0;
  renderCohortAudit(root,{pages:auditedPages,complete:true,funding:true});
  try{
   for(const batch of auditedPages){
    const expected={
     totalStudents:batch.totalStudents,examined:batch.examined,
     earnedXpSum:batch.summary.earnedXpSum,components:batch.summary.components
    };
    const response=await client.functions.invoke('vocabulary-reward-cohort-fund',{
     body:{action:'initialize',page:batch.page,expected}
    });
    if(response.error||response.data?.ok!==true||response.data?.initialized!==true||
      response.data?.page!==batch.page||response.data?.synchronised!==batch.examined||
      response.data?.verifiedEarned!==batch.summary.earnedXpSum)
      throw new Error('Batch '+(batch.page+1)+' could not be verified. Some earlier wallets may already be initialized. Run the full audit again before retrying.');
    fundedStudents+=response.data.synchronised;
    renderCohortAudit(root,{pages:auditedPages,complete:true,funding:true,fundedStudents});
   }
   // Read-only audit confirms final wallet coverage after all writes.
   auditedPages=[];
   running=false;
   await run();
  }catch(error){
   renderCohortAudit(root,{pages:auditedPages,complete:true,fundedStudents,
    fundingError:error instanceof Error?error.message:'Funding was not verified; run the audit again before retrying.'});
  }finally{running=false;}
 };
 root.addEventListener('click',event=>{
  if(event.target?.closest?.('[data-action="run-cohort-audit"]'))void run();
  if(event.target?.closest?.('[data-action="initialize-cohort-wallets"]'))void initialise();
 });
 renderCohortAudit(root);
}

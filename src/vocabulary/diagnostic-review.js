import { getSupabaseClient } from '../supabase.js';
import { escapeHtml } from '../views/html.js';
import { auditDiagnosticItem } from './diagnostic-quality-audit.js';

const root=document.getElementById('diagnosticReview');
const state={client:null,level:'all',page:0,total:0,items:[],selected:null,details:null,busy:false,notice:''};
const e=value=>escapeHtml(String(value??''));
const human=s=>({draft:'Draft',language_reviewed:'Language reviewed',assessment_reviewed:'Assessment reviewed',pilot:'Pilot',approved:'Approved',retired:'Retired'})[s]||s;

async function invoke(action,payload={}){
  const {data,error}=await state.client.functions.invoke('vocabulary-diagnostic',{
    body:{action:'review-'+action,payload}
  });
  if(error){
    let detail=null;
    try{detail=await error.context?.json?.()}catch{}
    if(typeof detail?.error==='string')throw new Error(detail.error.replaceAll('_',' ').toLowerCase());
    throw new Error('Diagnostic review service unavailable. Please try again.');
  }
  if(data?.error)throw new Error(data.error.replaceAll('_',' ').toLowerCase());
  return data;
}

function frame(body){
  root.innerHTML='<main class="dr-shell"><header class="dr-topbar"><a href="./vocabulary.html">← Teacher analytics</a><span>Vocabulary diagnostic · Staff only</span></header>'+body+'</main>';
}
function status(message){const node=root.querySelector('[data-review-status]');if(node)node.textContent=message;}

function listView(){
 const start=state.page*10;
 const items=state.items.map(item=>`<button type="button" class="dr-item" data-action="open" data-id="${e(item.id)}" data-version="${e(item.version)}"><span><strong>${e(item.lemma)}</strong> <span class="dr-level">${e(item.level)}</span><small>${e(item.construct?.replaceAll('_',' '))}</small></span><span class="dr-item-meta">${item.flags?'<b>Flagged · '+e(item.flags)+'</b>':e(human(item.status))}<small>Language ${item.languageApproved?'✓':'—'} · Assessment ${item.assessmentApproved?'✓':'—'} · CEFR ${item.cefrVerified?'✓':'—'}</small></span><span aria-hidden="true">›</span></button>`).join('');
 frame(`<section class="dr-hero"><p class="dr-kicker">ASSESSMENT QUALITY</p><h1>Diagnostic question review</h1><p>Review original questions before they can be used in a student pilot. CEFR levels are provisional until independently verified.</p></section>
 <section class="dr-panel"><div class="dr-toolbar"><label for="review-level">Level <select id="review-level" data-action="level"><option value="all">All levels</option>${['A1','A2','B1','B2','C1'].map(x=>`<option value="${x}" ${x===state.level?'selected':''}>${x}</option>`).join('')}</select></label><span>${e(state.total)} draft-bank items</span></div>
 <div class="dr-list">${items||'<p>No questions found.</p>'}</div>
 <footer class="dr-footer"><span>Showing ${state.total?start+1:0}–${Math.min(start+state.items.length,state.total)} of ${state.total}</span><div><button type="button" data-action="previous" ${state.page===0?'disabled':''}>Previous</button><button type="button" data-action="next" ${(state.page+1)*10>=state.total?'disabled':''}>Next 10</button></div></footer></section>
 <p class="dr-footnote">Private draft bank · No student assignments · Review decisions are recorded against your staff account.</p><p role="status" data-review-status>${e(state.notice)}</p>`);
}

function detailView(){
 const x=state.details.item;
 const reviews=state.details.reviews||[];
 const audit=auditDiagnosticItem(x);
 const auditMarkup=`<section class="dr-quality" aria-label="Automatic quality checks"><h3>Automatic quality checks · advisory</h3><p>These signals identify possible problems, not proof of answer quality. A reviewer must still check plausibility, ambiguity and CEFR suitability.</p>${audit.issues.length?`<ul>${audit.issues.map(f=>`<li><strong>${e(f.severity)} · ${e(f.code.replaceAll('_',' '))}</strong>: ${e(f.message)}</li>`).join('')}</ul>`:'<p>No automatic warning found. This does not mean the question is approved.</p>'}<p><strong>Human checklist:</strong> One defensible answer · three believable near-misses · no grammar or answer-position giveaway · appropriate difficulty.</p></section>`;
 const opts=x.options.map(o=>`<li class="${o.id===x.correctOptionId?'dr-correct':''}"><strong>${e(o.id)}.</strong> ${e(o.text)} ${o.id===x.correctOptionId?'<span class="dr-key">Keyed answer</span>':''}<small>${e(o.rationale)}</small></li>`).join('');
 const flags=reviews.filter(x=>x.decision==='flag'||x.decision==='reject');
 frame(`<button class="dr-back" data-action="back">← All questions</button><section class="dr-hero dr-hero--small"><p class="dr-kicker">PRIVATE STAFF REVIEW · ${e(x.id)} · v${e(x.version)}</p><h1>${e(x.lemma)} <span class="dr-level">${e(x.level)}</span></h1><p>Tested sense: ${e(x.sense)}</p><p><strong>Status:</strong> ${e(human(x.status))}</p></section>
 <div class="dr-columns"><section class="dr-panel"><h2>Question and answers</h2><p class="dr-question">${e(x.stem)}</p><ol class="dr-options">${opts}</ol>${auditMarkup}<h3>CEFR reference</h3><p>${e(x.levelReference?.referenceNotes||'Not documented')}</p><p class="dr-muted">Verification: ${e(x.levelReference?.status||'unverified')} · Source: ${e(x.source?.referenceNotes||'not recorded')}</p></section>
 <section class="dr-panel"><h2>Review decision</h2><p>Check whether every option is defensible, the distractors are plausible, and the assigned word sense matches the proposed level.</p>${flags.length?'<p class="dr-warning">This item has a flag or rejection. It requires a new version and fresh review before approval.</p>':''}
 <label for="review-stage">Review type</label><select id="review-stage"><option value="language">Language and answer quality</option><option value="assessment">Assessment design</option><option value="cefr">CEFR reference verification</option><option value="flag">Flag for revision</option></select>
 <label for="review-decision">Decision</label><select id="review-decision"><option value="approve">Approve this review stage</option><option value="flag">Flag problem</option><option value="reject">Reject item</option></select>
 <fieldset class="dr-human-checks"><legend>Required before approval</legend><label><input type="checkbox" data-quality-confirm="single-key"> Exactly one defensible answer</label><label><input type="checkbox" data-quality-confirm="distractors"> Three plausible distractors for this level</label><label><input type="checkbox" data-quality-confirm="no-clues"> No obvious wording, grammar or position clues</label><label><input type="checkbox" data-quality-confirm="level"> Appropriate vocabulary sense and proposed level</label></fieldset><label for="review-notes">Evidence / review notes</label><textarea id="review-notes" rows="5" maxlength="1500" placeholder="Explain any issue or record your supporting evidence. For CEFR verification, cite the specific permitted reference and sense."></textarea>
 <button type="button" class="dr-primary" data-action="save" ${state.busy?'disabled':''}>Save review decision</button><p role="status" data-review-status>${e(state.notice)}</p>
 <h3>Review history</h3><div class="dr-history">${reviews.length?reviews.map(r=>`<div><strong>${e(r.stage)} · ${e(r.decision)}</strong><small>${e(r.createdAt)}</small><p>${e(r.notes)}</p></div>`).join(''):'<p>No review decisions recorded yet.</p>'}</div>
 </section></div>`);
}

async function load(){
 state.notice='';const data=await invoke('list',{page:state.page,...(state.level==='all'?{}:{level:state.level})});
 state.items=data.items||[];state.total=data.total||0;state.selected=null;state.details=null;listView();
}
async function detail(id,version){
 state.notice='';state.details=await invoke('detail',{itemId:id,version});
 state.selected={id,version};detailView();
}
async function save(){
 if(state.busy||!state.selected)return;
 const stage=root.querySelector('#review-stage')?.value;
 const decision=root.querySelector('#review-decision')?.value;
 const notes=root.querySelector('#review-notes')?.value?.trim()??'';
 if(decision==='approve' && root.querySelectorAll('[data-quality-confirm]:checked').length!==4){state.notice='Confirm all four quality checks before approving this stage.';status(state.notice);return;}
 if(decision==='approve' && state.details?.item && !auditDiagnosticItem(state.details.item).canApprove){state.notice='Blocking structural quality issue: flag this item for revision instead of approving.';status(state.notice);return;}
 if(notes.length<12||(stage==='cefr'&&decision==='verify'&&notes.length<30)){
   state.notice='Please provide a specific explanation or reference before saving.';status(state.notice);return;
 }
 state.busy=true;status('Saving review…');
 try{await invoke('decision',{itemId:state.selected.id,version:state.selected.version,stage,decision,notes});await detail(state.selected.id,state.selected.version);state.notice='Review recorded.';status(state.notice);}
 catch(err){state.notice=err.message;status(state.notice)}
 finally{state.busy=false}
}

root.addEventListener('click',event=>{
 const b=event.target.closest('[data-action]');if(!b)return;
 const a=b.dataset.action;
 const perform=async()=>{
   if(a==='back'){await load();return;}
   if(a==='open'){await detail(b.dataset.id,Number(b.dataset.version));return;}
   if(a==='previous'){state.page=Math.max(0,state.page-1);await load();return;}
   if(a==='next'){state.page++;await load();return;}
   if(a==='save'){await save();}
 };
 void perform().catch(err=>{state.notice=err.message;status(state.notice)});
});
root.addEventListener('change',event=>{
 if(event.target.id==='review-stage'){
   const decision=root.querySelector('#review-decision');
   const stage=event.target.value;
   const pairs=stage==='cefr'?[['verify','Verify CEFR reference'],['flag','Flag problem'],['reject','Reject item']]
      :stage==='flag'?[['flag','Flag for revision']]
      :[['approve','Approve this review stage'],['flag','Flag problem'],['reject','Reject item']];
   if(decision)decision.innerHTML=pairs.map(([value,label])=>'<option value="'+value+'">'+label+'</option>').join('');
 }
 if(event.target.dataset.action==='level'){
  state.level=event.target.value;state.page=0;void load().catch(err=>{state.notice=err.message;status(state.notice)});
 }
});
(async()=>{
 try{
  const client=await getSupabaseClient();
  const {data:{user},error}=await client.auth.getUser();
  if(error||!user){frame('<h1>Sign in required</h1><p><a href="./">Return to the Hub</a></p>');return;}
  const {data:profile,error:profileError}=await client.from('profiles').select('role,active').eq('id',user.id).single();
  if(profileError||!profile?.active||!['teacher','admin'].includes(profile.role)){
    frame('<h1>Staff access only</h1><p>This diagnostic review is unavailable to student accounts.</p><p><a href="./">Back to Hub</a></p>');return;
  }
  state.client=client;await load();
 }catch(err){frame('<h1>Unable to open review queue</h1><p>'+e(err.message)+'</p><p><a href="./vocabulary.html">Return to teacher analytics</a></p>')}
})();

// No answer keys or item text in this list. Open the existing authenticated
// full-review page to make a genuine, per-item decision.
import { escapeHtml } from '../views/html.js';
const e=x=>escapeHtml(String(x??''));
const FILTERS=new Set(['all','language','assessment','cefr','flagged']);
export function validateReviewWorklist(data,form='A'){
 if(data?.form!==form||data?.total!==40||!Array.isArray(data.items)||data.items.length!==40)
   throw new Error('Form '+form+' worklist is incomplete.');
 const rows=data.items;
 for(const [i,r] of rows.entries()){
   if(r?.position!==i+1||typeof r.id!=='string'||!r.id||
      !Number.isInteger(r.version)||r.version<1||typeof r.lemma!=='string'||
      !['A1','A2','B1','B2','C1'].includes(r.level)||
      ['correctOptionId','stem','options','answer'].some(k=>Object.hasOwn(r,k)))
     throw new Error('Form worklist returned unexpected content.');
 }
 return rows;
}
export function renderReviewWorklist(rows,{loading=false,error='',filter='all'}={}){
 const header='<div class="dr-worklist-head"><div><h2>Form A · Approval worklist</h2>'
   +'<p>Work through the actual 40-question form in order. Approval is recorded individually against the exact question version.</p></div>'
   +'<button type="button" class="dr-readiness-refresh" data-action="refresh-worklist" '+(loading?'disabled':'')+'>Refresh</button></div>';
 if(error)return '<section class="dr-panel dr-worklist">'+header+'<p role="alert">'+e(error)+'</p></section>';
 if(loading&&!rows)return '<section class="dr-panel dr-worklist">'+header+'<p role="status">Loading Form A questions…</p></section>';
 if(!rows)return '<section class="dr-panel dr-worklist">'+header+'<p>The worklist is unavailable.</p></section>';
 const choice=FILTERS.has(filter)?filter:'all';
 const outstanding=(r)=>choice==='language'?!r.languageApproved:
   choice==='assessment'?!r.assessmentApproved:
   choice==='cefr'?!r.cefrVerified:
   choice==='flagged'?!!r.flagged:true;
 const selected=rows.filter(outstanding);
 const complete=kind=>rows.filter(x=>x[kind]).length;
 const controls=[['all','All 40'],['language','Language pending'],['assessment','Assessment pending'],['cefr','CEFR pending'],['flagged','Flagged']]
   .map(([value,name])=>'<option value="'+value+'" '+(value===choice?'selected':'')+'>'+name+'</option>').join('');
 const entries=selected.map(r=>'<button type="button" class="dr-worklist-item" data-action="open" data-worklist="1" data-id="'+e(r.id)+'" data-version="'+r.version+'">'
   +'<span class="dr-worklist-index">'+r.position+'</span><span class="dr-worklist-topic"><strong>'+e(r.lemma)+'</strong>'
   +'<small>'+e(r.level)+' · Version '+r.version+'</small></span><span class="dr-worklist-checks" aria-label="Approval status">'
   +'<span title="Language">'+(r.languageApproved?'✓':'—')+' L</span>'
   +'<span title="Assessment">'+(r.assessmentApproved?'✓':'—')+' A</span>'
   +'<span title="CEFR reference">'+(r.cefrVerified?'✓':'—')+' C</span>'
   +(r.flagged?'<b>Flagged</b>':'')+'</span><span aria-hidden="true">›</span></button>').join('');
 return '<section class="dr-panel dr-worklist">'+header
   +'<div class="dr-worklist-summary"><span><b>'+complete('languageApproved')+'/40</b> Language</span>'
   +'<span><b>'+complete('assessmentApproved')+'/40</b> Assessment</span>'
   +'<span><b>'+complete('cefrVerified')+'/40</b> CEFR reference</span></div>'
   +'<div class="dr-worklist-controls"><label for="review-worklist-filter">Show <select id="review-worklist-filter">'+controls+'</select></label>'
   +'<span>'+selected.length+' questions</span></div>'
   +'<div class="dr-worklist-items">'+(entries||'<p class="dr-worklist-empty">No questions match this filter.</p>')+'</div>'
   +'<p class="dr-worklist-note">A tick means an authenticated reviewer recorded that specific approval. Review each question before signing off. Assessment approval must be independent of language approval; CEFR evidence must be recorded separately.</p></section>';
}

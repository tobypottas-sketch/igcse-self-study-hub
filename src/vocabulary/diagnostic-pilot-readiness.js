// Teacher-facing, read-only view of authoritative diagnostic form readiness.
// These counts are not permission to promote a draft form or to assign students.
import { escapeHtml } from '../views/html.js';

const e=value=>escapeHtml(String(value??''));
const bands=['A1','A2','B1','B2','C1'];

export function summarizePilotReadiness(data){
  if(!Array.isArray(data?.forms))throw new Error('Diagnostic form readiness is unavailable.');
  return data.forms.filter(x=>['DIAG-BASELINE-A-DRAFT','DIAG-BASELINE-B-DRAFT'].includes(x?.formCode))
    .sort((a,b)=>a.formCode.localeCompare(b.formCode))
    .map(row=>{
      const total=Number(row.total)||0;
      const language=Number(row.languageApproved)||0;
      const assessment=Number(row.assessmentApproved)||0;
      const cefr=Number(row.cefrVerified)||0;
      const flagged=Number(row.flagged)||0;
      const balanced=bands.every(b=>Number(row.bands?.[b])===8);
      const authorisedPilot=row.status==='pilot' && !!row.reviewReady;
      return {
        label:row.formCode.includes('-A-')?'Form A':'Form B',
        total,language,assessment,cefr,flagged,balanced,
        status:String(row.status||'unknown'),
        ready:authorisedPilot&&total===40&&balanced&&!flagged&&
          language===40&&assessment===40&&cefr===40
      };
    });
}

export function renderPilotReadiness(data,{loading=false,error=''}={}){
  const heading='<div class="dr-readiness-heading"><div><h2>Pilot readiness</h2><p>Live approval status from the private question bank—not a release control.</p></div>'
    +'<button type="button" class="dr-readiness-refresh" data-action="refresh-readiness" '+(loading?'disabled':'')+'>'
    +(loading?'Checking…':'Refresh status')+'</button></div>';
  if(error)return '<section class="dr-panel dr-readiness">'+heading+'<p role="status">Could not check pilot readiness: '+e(error)+'</p></section>';
  if(loading||!data)return '<section class="dr-panel dr-readiness">'+heading+'<p role="status">Checking Form A and B approval status…</p></section>';
  let forms;
  try{forms=summarizePilotReadiness(data)}catch(err){
    return '<section class="dr-panel dr-readiness">'+heading+'<p role="status">'+e(err.message)+'</p></section>';
  }
  if(forms.length!==2)return '<section class="dr-panel dr-readiness">'+heading+'<p role="status">Both forms must be present before the pilot can be considered.</p></section>';
  const cards=forms.map(f=>'<div class="dr-readiness-card"><div class="dr-readiness-title"><strong>'+e(f.label)+'</strong><span>'+e(f.status==='draft'?'Draft · Not available to students':f.ready?'Pilot ready':'Not ready for student use')+'</span></div>'
      +'<div class="dr-readiness-metrics"><span><b>'+f.total+'/40</b><small>Questions</small></span>'
      +'<span><b>'+f.language+'/40</b><small>Language</small></span>'
      +'<span><b>'+f.assessment+'/40</b><small>Assessment</small></span>'
      +'<span><b>'+f.cefr+'/40</b><small>CEFR reference</small></span></div>'
      +'<p class="dr-readiness-foot">'+(f.balanced?'8 questions per CEFR band':'CEFR band distribution needs checking')
      +' · '+f.flagged+' flagged items</p></div>').join('');
  return '<section class="dr-panel dr-readiness">'+heading
    +'<div class="dr-readiness-grid">'+cards+'</div>'
    +'<p class="dr-readiness-guidance"><strong>Next:</strong> Obtain genuine language, independent assessment and CEFR-reference sign-off; approve one pilot form through a controlled release; then assign a dedicated test student. Previewing questions does not count as approval. No changes can be made from this panel.</p></section>';
}

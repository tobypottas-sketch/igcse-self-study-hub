// Read-only staff preview of the single NGSL 1.2, 50-question baseline.
import {escapeHtml} from '../views/html.js';
import {ngslPromptMarkup} from './ngsl-question-format.js';
const e=value=>escapeHtml(String(value??''));

export function validateTeacherFormPreview(data){
  if(data?.form!=='A'||data?.total!==50||!Array.isArray(data.questions)||data.questions.length!==50)
    throw new Error('The NGSL diagnostic is incomplete or unavailable.');
  for(const [i,q] of data.questions.entries()){
    if(q?.position!==i+1||typeof q.target!=='string'||!q.target.trim()
      ||typeof q.stem!=='string'||!q.stem.trim()||!Array.isArray(q.options)||q.options.length!==4
      ||q.options.some((o,j)=>o?.id!=='ABCD'[j]||typeof o.text!=='string'||!o.text.trim())
      ||['key','answer','correct','correctOptionId','correct_option_id','ngslRank','ngslBand','rationale'].some(k=>Object.hasOwn(q,k))
      ||q.options.some(o=>Object.hasOwn(o,'correct')||Object.hasOwn(o,'rationale')))
      throw new Error('The NGSL preview response is unsafe.');
  }
  return data.questions;
}
function shuffleOptions(options){
  const copy=options.slice();
  for(let i=copy.length-1;i>0;i--){
    const bytes=new Uint32Array(1);
    crypto.getRandomValues(bytes);
    const j=bytes[0]%(i+1);
    [copy[i],copy[j]]=[copy[j],copy[i]];
  }
  return copy.map((o,i)=>({id:'ABCD'[i],text:o.text}));
}
export async function startDiagnosticTeacherPreview(root,client){
  let questions=null,index=0,busy=false;
  const selections=new Map();
  const shell=html=>{root.innerHTML='<main class="vocab-shell diag-player ngsl-player">'
    +'<header class="vocab-topbar"><a class="vocab-back" href="./vocabulary.html">← Back to Vocabulary</a>'
    +'<span>NGSL vocabulary diagnostic · Teacher preview</span></header>'+html+'</main>';};
  function render(){
    const q=questions[index];
    const opts=q.options.map(o=>'<label class="diag-option '+(selections.get(q.position)===o.id?'diag-option--selected':'')+'">'
      +'<input type="radio" name="teacher-preview-answer" value="'+e(o.id)+'" '
      +(selections.get(q.position)===o.id?'checked':'')+'/>'
      +'<span class="diag-option-key" aria-hidden="true">'+e(o.id)+'</span><span>'+e(o.text)+'</span></label>').join('');
    shell('<p class="diag-preview-notice">Teacher-only · No answers, scores or student records saved</p>'
      +'<section class="diag-assessment"><div class="diag-meta"><span>One NGSL diagnostic</span>'
      +'<span>Question '+q.position+' of 50</span></div>'+ngslPromptMarkup(q.stem,q.target)
      +'<fieldset class="diag-choices"><legend>Choose one meaning</legend>'+opts+'</fieldset>'
      +'<div class="diag-actions"><button type="button" class="diag-secondary" data-preview="restart">Restart preview</button>'
      +'<button type="button" class="diag-secondary" data-preview="previous" '+(index===0?'disabled':'')+'>Previous</button>'
      +'<button type="button" class="diag-primary" data-preview="next" '+(index===49?'disabled':'')+'>Next question</button></div>'
      +'<p class="diag-message">Selections are for preview only.</p></section>');
  }
  async function load(){
    if(busy)return;
    busy=true;
    shell('<section class="diag-hero"><h1>Loading NGSL diagnostic…</h1><p role="status">Checking secure questions.</p></section>');
    try{
      const {data,error}=await client.functions.invoke('vocabulary-diagnostic',{
        body:{action:'ngsl-form-preview',payload:{form:'A'}}
      });
      if(error||data?.error)throw new Error('Could not load the NGSL teacher preview.');
      const original=validateTeacherFormPreview(data);
      // The teacher preview keeps one stable shuffle for this visit.
      const order=original.slice();
      for(let i=order.length-1;i>0;i--){
        const bytes=new Uint32Array(1);crypto.getRandomValues(bytes);
        const j=bytes[0]%(i+1);[order[i],order[j]]=[order[j],order[i]];
      }
      questions=order.map((q,i)=>({...q,position:i+1,options:shuffleOptions(q.options)}));
      selections.clear();index=0;render();
    }catch(err){
      shell('<section class="diag-hero"><h1>Preview unavailable</h1><p role="alert">'+e(err.message)
       +'</p><button type="button" class="diag-primary" data-preview="restart">Try again</button></section>');
    }finally{busy=false}
  }
  root.addEventListener('click',event=>{
    const action=event.target?.closest?.('[data-preview]')?.dataset.preview;
    if(!action||busy)return;
    if(action==='restart'){void load();return;}
    if(!questions)return;
    if(action==='next'&&index<49){index++;render();}
    if(action==='previous'&&index>0){index--;render();}
  });
  root.addEventListener('change',event=>{
    if(event.target?.name!=='teacher-preview-answer'||!questions||busy)return;
    if(!'ABCD'.includes(event.target.value))return;
    selections.set(questions[index].position,event.target.value);render();
  });
  await load();
}

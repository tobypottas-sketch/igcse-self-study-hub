// Two staff-only modes: a synthetic student walkthrough and a real,
// read-only draft-form preview. The real preview never starts a student session.
import { initialiseVocabularyDiagnostic } from './diagnostic-student.js?v=pilot-ready-v2';
import { escapeHtml } from '../views/html.js';

const e = value => escapeHtml(String(value ?? ''));
const SAMPLE = [
  {stem:'The travellers arrived ___ the station just before midday.',options:['on','at','in','to']},
  {stem:'The event was postponed because of bad weather. What happened?',options:['It began earlier than planned.','It moved to a later date.','It was held at another venue.','It finished ahead of schedule.']},
  {stem:'Which response best expresses uncertainty?',options:['I am completely certain.','There can be no doubt.','I cannot yet make a definite judgement.','I have already reached my final decision.']},
  {stem:'The committee sought to reconcile conflicting accounts. What did they aim to do?',options:['Ignore both accounts entirely.','Identify a workable agreement between them.','Publish only the earliest account.','Delay the discussion indefinitely.']}
];

function sampleQuestion(position) {
  const item = SAMPLE[position-1];
  return item && {sessionId:'synthetic-session',questionId:'synthetic-'+position,questionVersion:1,
    position,stem:item.stem,options:item.options.map((text,i)=>({id:'ABCD'[i],text})),allowUnknown:true};
}

async function startSample(root) {
  let position=1;
  const client={functions:{invoke:async (_name,{body})=>{
    if(body.action==='start'){position=1;return {data:{state:'in_progress',question:sampleQuestion(position)},error:null};}
    if(body.action==='respond'){
      if(body.payload.position!==position)return {data:{error:'OUT_OF_SEQUENCE'},error:null};
      position++;
      if(position>SAMPLE.length)return {data:{state:'completed',result:{total:SAMPLE.length}},error:null};
      return {data:{state:'in_progress',question:sampleQuestion(position)},error:null};
    }
    if(body.action==='pause')return {data:{state:'interrupted'},error:null};
    return {data:{error:'INVALID_REQUEST'},error:null};
  }}};
  return initialiseVocabularyDiagnostic({root,client,assignmentId:'synthetic-assignment',
    previewMode:true,onComplete:()=>window.location.replace('./vocabulary.html')});
}

export function validateTeacherFormPreview(data,form) {
  if(data?.form!==form || data?.total!==40 || !Array.isArray(data.questions) || data.questions.length!==40)
    throw new Error('The draft form is incomplete or unavailable.');
  const seen = new Set();
  for(const q of data.questions){
    if(!Number.isInteger(q.position)||q.position<1||q.position>40||seen.has(q.position)
      ||typeof q.stem!=='string'||!q.stem.trim()
      ||!Array.isArray(q.options)||q.options.length!==4
      ||q.options.some((o,i)=>o?.id!=='ABCD'[i]||typeof o.text!=='string'||!o.text.trim())
      ||['correctOptionId','correct_option_id','answer','key','rationale'].some(k=>Object.hasOwn(q,k))
      ||q.options.some(o=>Object.hasOwn(o,'correct')||Object.hasOwn(o,'rationale'))){
      throw new Error('The preview response is not safe to display.');
    }
    seen.add(q.position);
  }
  return data.questions;
}

export async function startDiagnosticTeacherPreview(root,client) {
  let form='A', position=0, questions=null, busy=false, error='';
  const selections = new Map();
  const shell = content => {
    root.innerHTML='<main class="vocab-shell diag-player"><header class="vocab-topbar">'
      +'<a class="vocab-back" href="./vocabulary.html">← Back to Vocabulary</a><span>Vocabulary diagnostic · Teacher preview</span></header>'
      +content+'</main>';
  };
  function chooser() {
    questions=null;error='';
    shell('<p class="diag-preview-notice" role="note">Teacher-only preview · No student records are saved</p>'
      +'<section class="diag-hero"><p class="diag-kicker">DIAGNOSTIC PREVIEW</p><h1>Choose what to preview</h1>'
      +'<p>Try the sample student walkthrough, or review the real questions currently assembled in Form A or Form B.</p>'
      +'<div class="diag-actions diag-preview-modes">'
      +'<button type="button" class="diag-secondary" data-teacher-preview="sample">Sample walkthrough · 4 questions</button>'
      +'<button type="button" class="diag-primary" data-teacher-preview="real">Review real diagnostic · Form A/B</button>'
      +'</div><p class="diag-message" role="status"></p></section>');
  }
  function view() {
    if(!questions) return;
    const q=questions[position];
    const opts=q.options.map(o=>'<label class="diag-option '+(selections.get(q.position)===o.id?'diag-option--selected':'')+'">'
      +'<input type="radio" name="teacher-preview-answer" value="'+e(o.id)+'" '+(selections.get(q.position)===o.id?'checked':'')+'/>'
      +'<span class="diag-option-key" aria-hidden="true">'+e(o.id)+'</span><span>'+e(o.text)+'</span></label>').join('');
    shell('<p class="diag-preview-notice" role="note">Real draft Form '+e(form)+' · Teacher-only · No answers, scores or student records are saved</p>'
      +'<section class="diag-assessment"><div class="diag-meta"><label for="teacher-form">Form '
      +'<select id="teacher-form" data-teacher-form><option value="A" '+(form==='A'?'selected':'')+'>A</option>'
      +'<option value="B" '+(form==='B'?'selected':'')+'>B</option></select></label>'
      +'<span>Question '+e(q.position)+' of 40</span></div>'
      +'<h1 class="diag-prompt">'+e(q.stem)+'</h1>'
      +'<fieldset class="diag-choices"><legend>Choose one answer (preview only)</legend>'+opts+'</fieldset>'
      +'<div class="diag-actions"><button type="button" class="diag-secondary" data-teacher-preview="chooser">← Preview modes</button>'
      +'<button type="button" class="diag-secondary" data-teacher-preview="previous" '+(position===0?'disabled':'')+'>Previous</button>'
      +'<button type="button" class="diag-primary" data-teacher-preview="next" '+(position===39?'disabled':'')+'>Next question</button>'
      +'</div><p class="diag-message" role="status">Your selections stay on this screen only and are never submitted.</p></section>');
  }
  async function loadForm(nextForm) {
    if(busy)return;
    busy=true;error='';
    shell('<p class="diag-preview-notice">Teacher preview · Real diagnostic questions</p><section class="diag-hero">'
      +'<h1>Loading Form '+e(nextForm)+'…</h1><p role="status">Checking the secure draft form.</p></section>');
    try{
      const {data, error:serviceError}=await client.functions.invoke('vocabulary-diagnostic',{
        body:{action:'review-form-preview',payload:{form:nextForm}}
      });
      if(serviceError || data?.error)throw new Error('Unable to load this draft form. Staff-only preview may not yet be deployed.');
      questions=validateTeacherFormPreview(data,nextForm);
      form=nextForm;position=0;selections.clear();
      view();
    }catch(err){
      error=err.message||'Preview unavailable.';
      shell('<p class="diag-preview-notice">Teacher preview · No student records are saved</p>'
        +'<section class="diag-hero"><h1>Could not open Form '+e(nextForm)+'</h1><p role="alert">'+e(error)+'</p>'
        +'<div class="diag-actions"><button class="diag-secondary" type="button" data-teacher-preview="chooser">← Preview modes</button>'
        +'<button class="diag-primary" type="button" data-teacher-preview="retry" data-form="'+e(nextForm)+'">Try again</button></div></section>');
    }finally{busy=false}
  }
  root.addEventListener('click',event=>{
    const button=event.target?.closest?.('[data-teacher-preview]');
    if(!button||busy)return;
    const action=button.dataset.teacherPreview;
    if(action==='chooser'){chooser();return}
    if(action==='sample'){void startSample(root);return}
    if(action==='real'){void loadForm('A');return}
    if(action==='retry'){void loadForm(button.dataset.form==='B'?'B':'A');return}
    if(!questions)return;
    if(action==='next'&&position<39){position++;view()}
    if(action==='previous'&&position>0){position--;view()}
  });
  root.addEventListener('change',event=>{
    if(event.target?.id==='teacher-form'){
      const next=event.target.value;
      if(['A','B'].includes(next)&&next!==form)void loadForm(next);
      return;
    }
    if(event.target?.name==='teacher-preview-answer' && questions && 'ABCD'.includes(event.target.value)){
      selections.set(questions[position].position,event.target.value);
      view();
    }
  });
  chooser();
}

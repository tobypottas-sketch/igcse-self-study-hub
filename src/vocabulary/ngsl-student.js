// Single NGSL 1.2 baseline: authenticated, one 50-question assessment per student.
// Questions/answer ordering and results are owned by the server; nothing is scored here.
import {escapeHtml} from '../views/html.js';
import {ngslPromptMarkup} from './ngsl-question-format.js';
const e=x=>escapeHtml(String(x??''));
const BANDS=[1,2,3,4,5];
const FOUNDATION_LEVELS=[
 {max:14,label:'Beginning',message:'Start by strengthening your recognition of common English words.',image:'assets/vocabulary/diagnostic/ChatGPT Image Nov 17, 2026, 10_46_12 AM-1.png'},
 {max:24,label:'Developing',message:'You recognise some common English vocabulary, but there are gaps to strengthen.',image:'assets/vocabulary/diagnostic/ChatGPT Image Nov 17, 2026, 10_46_14 AM-2.png'},
 {max:34,label:'Building confidence',message:'You recognise many of these words. Keep practising less familiar vocabulary.',image:'assets/vocabulary/diagnostic/ChatGPT Image Nov 17, 2026, 10_46_15 AM-3.png'},
 {max:44,label:'Strong',message:'You recognise most of these words. Focus on the meanings you missed.',image:'assets/vocabulary/diagnostic/ChatGPT Image Nov 17, 2026, 10_46_16 AM-4.png'},
 {max:50,label:'Advanced recognition',message:'You recognised almost all the selected words. Keep extending your vocabulary through practice.',image:'assets/vocabulary/diagnostic/ChatGPT Image Nov 17, 2026, 10_46_18 AM-5.png'}
];
function foundationLevel(correct){return FOUNDATION_LEVELS.find(level=>correct<=level.max);}

function validQuestion(q){
 if(!q||typeof q.sessionId!=='string'||!/^NGSL-\d{1,2}$/.test(q.questionId??'')||
 !Number.isInteger(q.position)||q.position<1||q.position>50||q.total!==50||
 typeof q.target!=='string'||typeof q.stem!=='string'||!Array.isArray(q.options)||q.options.length!==4||
 q.options.some((o,i)=>o.id!=='ABCD'[i]||typeof o.text!=='string'||!o.text.trim())||
 ['correct','correctAnswer','key','rank','ngslRank','ngslBand','sourceLetter'].some(k=>Object.hasOwn(q,k)))
 throw new Error('The assessment question is unavailable. Please contact your teacher.');
 return q;
}
export async function startNGSLDiagnostic({root,client,onComplete}){
 if(!root||!client)throw new Error('NGSL diagnostic requires an authenticated session.');
 const state={question:null,answer:null,busy:false,pending:null,error:'',complete:false,started:false};
 async function api(action,payload={}){
  const {data,error}=await client.functions.invoke('vocabulary-diagnostic',{body:{action:'ngsl-'+action,payload}});
  if(error){let detail;try{detail=await error.context?.json?.()}catch{}
   throw new Error(detail?.error==='AUTH_REQUIRED'?'Sign in again to continue.':
     'Could not save your assessment. Check your connection and try again.');}
  if(data?.error)throw new Error(data.error==='OUT_OF_SEQUENCE'?
    'This question is out of sequence. Refresh to resume safely.':
    data.error==='FORM_INVALID'?'Your teacher needs to check this assessment.':
    'Could not save your assessment. Please try again.');
  return data;
 }
 function shell(html){
  root.innerHTML='<main class="vocab-shell diag-player ngsl-player"><header class="vocab-topbar">'
   +'<a class="vocab-back" href="./">← Hub</a><span>NGSL vocabulary diagnostic</span></header>'
   +html+'</main>';
 }
 function intro(){
  shell('<section class="diag-hero"><p class="diag-kicker">VOCABULARY STARTING POINT</p>'
   +'<h1>50 vocabulary questions</h1><p>Read the highlighted word and choose its meaning. '
   +'There are four choices for each question. Take your time—there is no time limit.</p>'
   +'<p>Your answers are saved as you go. You can exit and continue later without losing your place.</p>'
   +'<div class="diag-actions"><button class="diag-primary" type="button" data-ngsl="start">Start or continue</button></div>'
   +'<p role="status" class="diag-message"></p></section>');
 }
 function question(){
  const q=validQuestion(state.question);
  const options=q.options.map(o=>'<label class="diag-option '+(state.answer===o.id?'diag-option--selected':'')+'">'
   +'<input type="radio" name="ngsl-answer" value="'+e(o.id)+'" '+(state.answer===o.id?'checked ':'')
   +(state.busy?'disabled ':'')+'/><span class="diag-option-key">'+e(o.id)+'</span><span>'+e(o.text)+'</span></label>').join('');
  shell('<section class="diag-assessment"><div class="diag-meta"><span>Question '+q.position+' of 50</span>'
   +'<span>Choose one meaning</span></div>'+ngslPromptMarkup(q.stem,q.target)
   +'<fieldset class="diag-choices"><legend>Choose the correct meaning.</legend>'+options+'</fieldset>'
   +'<div class="diag-actions"><button type="button" class="diag-secondary" data-ngsl="pause" '
   +(state.busy?'disabled':'')+'>Save & exit</button>'
   +'<button type="button" class="diag-primary" data-ngsl="submit" '
   +(!state.answer||state.busy?'disabled':'')+'>'+(state.busy?'Saving…':q.position===50?'Finish assessment':'Next question')+'</button></div>'
   +'<p class="diag-message" role="status">'+e(state.error)+'</p></section>');
 }
 function completed(result){
  state.complete=true;
  const total=Number(result?.total),correct=Number(result?.correct);
  if(total!==50||!Number.isInteger(correct)||correct<0||correct>50)throw new Error('The saved score could not be verified.');
  const bands=BANDS.map(b=>{
   const row=result?.bandScores?.[String(b)];
   const n=Number(row?.correct);
   return '<span><b>Band '+b+'</b> '+(Number.isInteger(n)&&n>=0&&n<=10?n+'/10':'—')+'</span>';
  }).join('');
  const foundation=foundationLevel(correct);
  const missed=Array.isArray(result?.missedTargets)?result.missedTargets:[];
  const words=missed.map(x=>e(x.target)).filter(Boolean);
  shell('<section class="diag-hero"><p class="diag-kicker">ASSESSMENT COMPLETE</p>'
    +'<h1>Your NGSL vocabulary profile</h1>'
    +'<div class="ngsl-result-top"><div class="ngsl-score"><strong>'+correct+'/50</strong><span>'+e(result.percentage)+'%</span></div>'
    +'<img class="ngsl-result-art" src="'+e(foundation.image)+'" alt="" /></div>'
    +'<div class="ngsl-foundation"><strong>'+e(foundation.label)+' vocabulary foundation</strong>'
    +'<p>'+e(foundation.message)+'</p></div>'
    +'<div class="ngsl-band-results">'+bands+'</div>'
    +(words.length?'<h2>Words to practise</h2><p class="ngsl-missed">'+words.join(', ')+'</p>':
      '<p>Excellent work — no missed targets in this assessment.</p>')
    +'<p>This measures recognition of selected NGSL words, not a certified CEFR level.</p>'
    +'<div class="diag-actions"><button type="button" class="diag-primary" data-ngsl="finish">Continue to Vocabulary Builder</button></div>'
    +'</section>');
 }
 async function start(){
  if(state.busy)return;state.busy=true;
  try{
    const result=await api('start',{});
    state.started=true;
    if(result.state==='completed'){completed(result.result);return;}
    state.question=validQuestion(result.question);state.answer=null;state.pending=null;state.error='';question();
  }catch(err){state.error=err.message;const status=root.querySelector('.diag-message');if(status)status.textContent=state.error;}
  finally{state.busy=false;if(state.question&&!state.complete)question();}
 }
 async function submit(){
  if(state.busy||!state.question||!['A','B','C','D'].includes(state.answer))return;
  state.busy=true;state.error='';question();
  try{
   if(!state.pending)state.pending={
    sessionId:state.question.sessionId,questionId:state.question.questionId,position:state.question.position,
    answerId:state.answer,requestId:crypto.randomUUID()
   };
   const result=await api('respond',state.pending);
   if(result.state==='completed'){
    state.pending=null;
    let summary=result.result;
    if(!summary){const hist=await api('history',{});summary=hist.result;}
    completed(summary);return;
   }
   state.question=validQuestion(result.question);state.answer=null;state.pending=null;
  }catch(err){state.error=err.message}
  finally{state.busy=false;if(!state.complete)question()}
 }
 async function pause(){
  if(state.busy||!state.question)return;
  state.busy=true;
  try{await api('pause',{sessionId:state.question.sessionId});
   shell('<section class="diag-hero"><h1>Assessment paused</h1>'
    +'<p>Your previous answers are saved. You can return to the same question later.</p>'
    +'<a href="./" class="diag-primary diag-link">Back to Hub</a></section>');
  }catch(err){state.error=err.message;state.busy=false;question();}
 }
 root.addEventListener('change',event=>{
  if(event.target?.name!=='ngsl-answer'||state.busy||state.complete||state.pending)return;
  if(!'ABCD'.includes(event.target.value))return;
  state.answer=event.target.value;question();
 });
 root.addEventListener('click',event=>{
  const action=event.target?.closest?.('[data-ngsl]')?.dataset.ngsl;
  if(action==='start')void start();
  if(action==='submit')void submit();
  if(action==='pause')void pause();
  if(action==='finish'&&state.complete)onComplete?.();
 });
 intro();
}

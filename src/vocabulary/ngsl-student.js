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
 const state={question:null,answer:null,busy:false,pending:null,error:'',complete:false,started:false,monitoring:false,fullscreenUsed:false,focusLosses:0,lastFocusAt:0};
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
 // Browser monitoring is advisory, not a device lockdown. Events are logged
 // under this authenticated assessment session and never affect the score.
 async function securityEvent(type){
  const q=state.question;
  if(!state.monitoring||!q||state.complete||!root.querySelector('.ngsl-player'))return;
  try{await api('integrity-event',{
   sessionId:q.sessionId,eventId:crypto.randomUUID(),type,position:q.position
  });}catch{ /* An offline/blocked telemetry request must never prevent answers. */ }
 }
 function markFocusLoss(type){
  if(!state.monitoring||state.complete||!root.querySelector('.ngsl-player'))return;
  const now=Date.now();
  if(now-state.lastFocusAt<1200)return; // blur + visibilitychange = one departure
  state.lastFocusAt=now;state.focusLosses++;
  void securityEvent(type);
  const banner=root.querySelector('[data-integrity-notice]');
  if(banner){
   banner.hidden=false;
   banner.textContent='You left the assessment screen. This event has been noted for teacher review. Return to your questions when ready.';
  }
 }
 function onVisibility(){if(document.hidden)markFocusLoss('tab_hidden');else if(state.monitoring)void securityEvent('focus_return');}
 function onBlur(){if(!document.hidden)markFocusLoss('window_blur');}
 function onFullscreen(){
  if(state.monitoring&&state.fullscreenUsed&&!document.fullscreenElement){
   void securityEvent('fullscreen_exit');
   const banner=root.querySelector('[data-integrity-notice]');
   if(banner){banner.hidden=false;banner.textContent='Fullscreen was exited. This has been noted for teacher review.';}
  }
 }
 document.addEventListener('visibilitychange',onVisibility);
 window.addEventListener('blur',onBlur);
 document.addEventListener('fullscreenchange',onFullscreen);
 function stopMonitoring(){state.monitoring=false;}
 function requestFullscreen(){
  if(!document.fullscreenEnabled||!root.requestFullscreen)return;
  // Must be called inside a direct click, before the first awaited API call.
  try{
   const result=root.requestFullscreen();
   Promise.resolve(result).then(()=>{state.fullscreenUsed=Boolean(document.fullscreenElement);}).catch(()=>{});
  }catch{ /* fullscreen denied; assessment remains accessible */ }
 }
 function shell(html){
  root.innerHTML='<main class="vocab-shell diag-player ngsl-player"><header class="vocab-topbar">'
   +'<a class="vocab-back" href="./">← Hub</a><span>NGSL vocabulary diagnostic</span></header>'
   +html+'</main>';
 }
 function intro(){
  shell('<section class="diag-hero ngsl-welcome">'
   +'<div class="ngsl-welcome-grid">'
   +'<div class="ngsl-welcome-content">'
   +'<p class="diag-kicker">YOUR VOCABULARY STARTING POINT</p>'
   +'<h1>Ready to find your starting point?</h1>'
   +'<p class="ngsl-welcome-lead">Choose the meaning of each highlighted word.</p>'
   +'<div class="ngsl-welcome-facts" aria-label="Assessment details">'
   +'<span><strong>50</strong><small>questions</small></span>'
   +'<span><strong>4</strong><small>choices each</small></span>'
   +'<span><strong>∞</strong><small>no time limit</small></span>'
   +'</div>'
   +'<p class="ngsl-welcome-save">Your answers save automatically. During this assessment, leaving the tab or exiting fullscreen is recorded for teacher review. Fullscreen is requested when supported but cannot lock your device. You can save and exit when needed.</p>'
   +'<div class="diag-actions"><button class="diag-primary" type="button" data-ngsl="start">Start or continue <span aria-hidden="true">→</span></button></div>'
   +'<p role="status" class="diag-message"></p>'
   +'</div>'
   +'<div class="ngsl-welcome-visual"><img src="assets/vocabulary/diagnostic/ChatGPT Image Nov 17, 2026, 10_46_12 AM-1.png" alt="A student looking up a mountain trail" /></div>'
   +'</div></section>');
 }
 function question(){
  const q=validQuestion(state.question);
  const options=q.options.map(o=>'<label class="diag-option '+(state.answer===o.id?'diag-option--selected':'')+'">'
   +'<input type="radio" name="ngsl-answer" value="'+e(o.id)+'" '+(state.answer===o.id?'checked ':'')
   +(state.busy?'disabled ':'')+'/><span class="diag-option-key">'+e(o.id)+'</span><span>'+e(o.text)+'</span></label>').join('');
  shell('<section class="diag-assessment"><div class="diag-meta"><span>Question '+q.position+' of 50</span>'
   +'<span>Choose one meaning</span></div>'+ngslPromptMarkup(q.stem,q.target)
   +'<fieldset class="diag-choices"><legend>Choose the correct meaning.</legend>'+options+'</fieldset>'
   +'<p class="ngsl-integrity-note" data-integrity-notice role="status" hidden></p>'
   +'<div class="diag-actions"><button type="button" class="diag-secondary" data-ngsl="pause" '
   +(state.busy?'disabled':'')+'>Save & exit</button>'
   +'<button type="button" class="diag-primary" data-ngsl="submit" '
   +(!state.answer||state.busy?'disabled':'')+'>'+(state.busy?'Saving…':q.position===50?'Finish assessment':'Next question')+'</button></div>'
   +'<p class="diag-message" role="status">'+e(state.error)+'</p></section>');
 }
 function completed(result){
  state.complete=true;stopMonitoring();
  const total=Number(result?.total),correct=Number(result?.correct);
  if(total!==50||!Number.isInteger(correct)||correct<0||correct>50)throw new Error('The saved score could not be verified.');
  const frequencyLabels=['Most common','Very common','Common','Less common','Less frequent'];
  const bands=BANDS.map(b=>{
   const row=result?.bandScores?.[String(b)];
   const n=Number(row?.correct);
   const valid=Number.isInteger(n)&&n>=0&&n<=10;
   const percent=valid?n*10:null;
   return '<div class="ngsl-band-card ngsl-band-card--'+b+'"><span class="ngsl-band-name">Group '+b+'</span>'
    +'<strong>'+(valid?percent+'%':'—')+'</strong>'
    +'<span class="ngsl-band-track" aria-hidden="true"><span style="width:'+(valid?percent:0)+'%"></span></span>'
    +'<small>'+frequencyLabels[b-1]+'</small></div>';
  }).join('');
  const foundation=foundationLevel(correct);
  const missed=Array.isArray(result?.missedTargets)?result.missedTargets:[];
  const words=missed.map(x=>e(x.target)).filter(Boolean);
  const pct=Number(result?.percentage);
  const percentage=Number.isFinite(pct)&&pct>=0&&pct<=100&&Math.abs(pct-correct*2)<0.01?pct:correct*2;
  shell('<section class="diag-hero ngsl-completed"><p class="diag-kicker">ASSESSMENT COMPLETE</p>'
    +'<h1>Your vocabulary results</h1>'
    +'<div class="ngsl-result-top"><div class="ngsl-result-summary">'
      +'<p class="ngsl-result-eyebrow">YOUR RESULT</p>'
      +'<div class="ngsl-score"><strong>'+percentage+'%</strong><span>'+correct+' / 50 correct</span></div>'
      +'<h2>'+e(foundation.label)+' vocabulary foundation</h2>'
      +'</div><img class="ngsl-result-art" src="'+e(foundation.image)+'" alt="Student on a mountain journey" /></div>'
    +'<section class="ngsl-group-section" aria-label="Vocabulary frequency groups">'
      +'<h2>Your word groups</h2>'
      +'<p>10 words per group · most common to less common</p>'
      +'<div class="ngsl-band-results">'+bands+'</div></section>'
    +(words.length?'<section class="ngsl-review-section" aria-label="Words to revisit">'
      +'<div class="ngsl-review-intro"><div><span class="ngsl-review-label">WORDS TO REVISIT</span>'
      +'<h2>'+words.length+' words to practise</h2></div></div>'
      +'<details class="ngsl-word-details"><summary>Show words <span aria-hidden="true">⌄</span></summary>'
      +'<ul class="ngsl-missed-list">'+words.map(word=>'<li>'+word+'</li>').join('')+'</ul></details></section>':
      '<p class="ngsl-all-correct">You recognised every word!</p>')
    +'<div class="diag-actions"><button type="button" class="diag-primary" data-ngsl="finish">Continue to Vocabulary Builder</button></div>'
    +'</section>');
 }
 async function start(){
  if(state.busy)return;state.busy=true;
  try{
    const result=await api('start',{});
    state.started=true;
    if(result.state==='completed'){completed(result.result);return;}
    state.question=validQuestion(result.question);state.monitoring=true;state.answer=null;state.pending=null;state.error='';question();
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
  try{await api('pause',{sessionId:state.question.sessionId});stopMonitoring();
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
  if(action==='start'){requestFullscreen();void start();}
  if(action==='submit')void submit();
  if(action==='pause')void pause();
  if(action==='finish'&&state.complete)onComplete?.();
 });
 intro();
}

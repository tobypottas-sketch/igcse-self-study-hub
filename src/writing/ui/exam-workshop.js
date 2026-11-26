import {el,action} from './lesson-shell.js?v=12';
import {wordStatus} from '../engine/drafts.js';
import {deadlineFor,practiceMinutes,remainingSeconds,submitExamAttempt} from '../engine/exam-attempt.js';

export function renderExamWorkshop(host,task,attempt,{passes,onProgress,onStudio,master=false}){
 const win=host.ownerDocument.defaultView;
 const clock=()=>win.Date.now();
 function field(parent,label,rows,value,onInput){
  const wrapper=el(parent,'label','wa-apply-instruction',label);
  const input=el(wrapper,'textarea','wa-writing-input wa-apply-input');
  input.rows=rows;
  input.value=value;
  input.oninput=()=>onInput(input.value);
  return input;
 }
 function draw(focus=false){
  host.replaceChildren();
  const title=el(host,'h3','wa-apply-title',task.title);
  title.tabIndex=-1;
  el(host,'p','wa-muted','Original examination-style Academy task · Drafts are kept for this visit.');
  el(host,'p','wa-apply-original',task.prompt);
  if(focus)title.focus();
  if(attempt.submitted){
   const review=el(host,'section','wa-exam-review');
   const original=el(review,'article','wa-apply-source');
   el(original,'h4','','Submitted response');
   el(original,'p','wa-muted',wordStatus(attempt.submitted.text).count+' words · '+(
    attempt.deadline===null?'Untimed practice':attempt.submitted.expired?'Submitted after practice time elapsed':'Submitted within practice time'));
   el(original,'p','wa-apply-original',attempt.submitted.text);
   const comparison=el(review,'article','wa-apply-model');
   el(comparison,'h4','','One possible response');
   el(comparison,'p','wa-apply-model-text',task.example);
   el(review,'p','wa-muted','Read both reviews and work through the four checks below. Then answer each of the three reflection prompts in at least three words.');
   const checklist=el(review,'fieldset','wa-apply-checklist');
   el(checklist,'legend','','Four-pass review');
   passes.forEach(([label,description],index)=>{
    const row=el(checklist,'label','wa-check wa-apply-check');
    const check=el(row,'input','');
    check.type='checkbox';
    check.checked=attempt.checks.has(index);
    el(row,'span','',label+'. '+description);
    check.onchange=()=>{
     if(check.checked)attempt.checks.add(index);
     else attempt.checks.delete(index);
     sync();
    };
   });
   const reflection=el(review,'div','');
   ['One strength in your content. Name a detail that answers the task well.','One improvement to your language or organisation. Name a sentence or paragraph you would change.','One specific target for your next review. Say what you will do differently.'].forEach((label,index)=>{
    field(reflection,label,2,attempt.reflection[index],value=>{attempt.reflection[index]=value;sync();});
   });
   const revision=el(review,'details','wa-explore-brief');
   el(revision,'summary','','Revise your response (optional)');
   field(revision,'Revised response',8,attempt.revision,value=>{attempt.revision=value;});
   const status=el(review,'p','wa-muted');
   status.setAttribute('role','status');
   if(onStudio)action(review,'Open Writing Studio →',onStudio);
   function sync(){
    const complete=attempt.checks.size===passes.length&&attempt.reflection.every(value=>value.trim().split(/\s+/).filter(Boolean).length>=3);
    const academyComplete=onProgress(complete);
    const message=complete
     ? (master&&academyComplete?'Academy learning programme complete. You planned, wrote and reviewed independently. ':'Writing and self-reflection complete. ')+'Your next target: '+attempt.reflection[2]
     : 'Tick each check after reviewing it. Write at least three words in each reflection box.';
    if(status.textContent!==message)status.textContent=message;
   }
   sync();
   return title;
  }
  if(!attempt.started&&task.timer){
   el(host,'p','wa-muted',practiceMinutes+' minutes is the recommended time for this Academy simulation. Untimed practice uses the same task.');
   const start=timed=>{
    attempt.started=true;
    attempt.deadline=timed?deadlineFor(clock()):null;
    draw(true);
   };
   action(host,'Start 20-minute practice',()=>start(true));
   action(host,'Start untimed practice',()=>start(false));
   return title;
  }
  attempt.started=true;
  if(task.guided){
   const details=el(host,'details','wa-explore-brief');
   el(details,'summary','','Planning checklist');
   const list=el(details,'ul','');
   for(const item of ['Identify the reader and purpose.','Select evidence for each required judgement.','Link your recommendation to your evaluation.'])el(list,'li','',item);
  }
  const notes=field(host,'Planning notes (optional)',3,attempt.notes,value=>{attempt.notes=value;});
  const response=field(host,'Your review',9,attempt.draft,value=>{attempt.draft=value;updateCount();});
  if(master||task.timer)response.spellcheck=false;
  const stats=el(host,'div','wa-exam-stats');
  const count=el(stats,'span','','');
  const timer=attempt.deadline===null?null:el(stats,'span','','');
  const expiry=el(host,'p','wa-muted');
  expiry.setAttribute('role','status');
  const overtime=action(host,'Continue in overtime',()=>{attempt.overtime=true;updateClock();response.focus();});
  overtime.hidden=true;
  const message=el(host,'p','wa-answer');
  message.setAttribute('role','status');
  const submit=action(host,'Submit response',()=>{
   if(!attempt.draft.trim()){message.textContent='Write a response before submitting.';return;}
   if(wordStatus(attempt.draft).status!=='within'&&!confirmed){
    confirmed=true;
    message.textContent='Your review is outside 120–160 words. You can keep writing or select Submit anyway.';
    submit.textContent='Submit anyway';
    return;
   }
   if(submitExamAttempt(attempt,clock()))draw(true);
  });
  let confirmed=false;
  function updateCount(){
   const {count:words}=wordStatus(attempt.draft);
   count.textContent=words+' words · Target 120–160';
   if(confirmed){confirmed=false;submit.textContent='Submit response';message.textContent='';}
  }
  function updateClock(){
   if(!timer)return;
   const seconds=remainingSeconds(attempt.deadline,clock());
   timer.textContent='Academy practice · '+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
   const expired=seconds===0;
   const notice=expired?(attempt.overtime?'Overtime practice · Your original writing is preserved.':'Practice time elapsed. Submit your review or continue in overtime.'):'';
   if(expiry.textContent!==notice)expiry.textContent=notice;
   overtime.hidden=!expired||attempt.overtime;
   response.readOnly=expired&&!attempt.overtime;
   notes.readOnly=response.readOnly;
  }
  updateCount();
  updateClock();
  if(timer){
   const tick=win.setInterval(()=>{
    if(!timer.isConnected||remainingSeconds(attempt.deadline,clock())===0){
     if(timer.isConnected)updateClock();
     win.clearInterval(tick);
    }else updateClock();
   },250);
  }
  return title;
 }
 return draw();
}

import {extraReviewModels} from '../content/review-explore-models.js?v=1';
import {mountLesson,el,action} from './lesson-shell.js?v=9';
import {reviewArtwork} from './editorial-art.js?v=6';
import {discovery,companions,applicationTasks} from '../content/review-active-v2.js';
import {guidedTask,independentTask,toolkit,improvement,selfCheck} from '../content/review-guided-v1.js';
import {reviewExam,blueprint,model,structureActivities} from '../content/review-structure-v1.js';
import {scoreItem,validateActivities} from '../engine/activities.js';
const activities=validateActivities(structureActivities);
function add(p,tag,cls,t){const n=p.ownerDocument.createElement(tag);n.className=cls||'';if(t)n.textContent=t;p.append(n);return n;}
function button(p,t,fn){const n=add(p,'button','wa-action',t);n.type='button';n.addEventListener('click',fn);return n;}
export function renderExamReference(p,{includeToolkit=true}={}){
 const s=add(p,'aside','wa-exam-reference');add(s,'strong','','0511 · Paper 1 Exercise 6 · 120–160 words · Content /6 · Language /9');
 add(s,'p','','Introduce → Describe → Evaluate → Recommend');
 const d=add(s,'details','');add(d,'summary','','Review blueprint & exam checklist');
 const ol=add(d,'ol','');for(const x of blueprint)add(ol,'li','',x.title+': '+x.guidance);
 add(d,'p','','Recommended scaffold, not a compulsory four-paragraph format. Cover all task requirements; develop ideas; use appropriate register, accurate and varied language, and clear organisation.');
 add(d,'p','','Description and evaluation may share a paragraph. Use formal or semi-formal language suited to the audience. Title, paragraph count and balance of praise and criticism are flexible.');
 const ul=add(d,'ul','');for(const x of selfCheck)add(ul,'li','',x);
 if(includeToolkit){const k=add(d,'details','');add(k,'summary','','Language toolkit');const kl=add(k,'ul','');for(const x of toolkit)add(kl,'li','',x);}
 return s;
}
export function renderStructure(root,onBack,onStudio){
 const state={model:0,paragraph:0,identified:new Set(),discovered:new Set(),discoveryIndex:0,annotations:new Map(),applyIndex:0,applications:applicationTasks.map(()=>({written:'',revealed:false,checks:new Set()})),attempts:new Map(),active:null,written:'',revealed:false,checks:new Set()};
 const models=[{...model,category:'Café',sentenceTips:[['Names the café, establishes the time and explains the reason for visiting.','Introduces an initial evaluation through the atmosphere and welcome.'],['Describes location, seating and menu.','Provides specific examples of food.','Evaluates affordability for students.'],['Balances crowding with praise for staff.','Balances a specific delay against food quality.','Explains the practical benefit of a quiet corner.'],['Identifies a suitable audience and reason.','Offers advice about timing.']],purposes:['Introduction','Description','Evaluation','Recommendation']},{...guidedTask,title:'Willow Kitchen',category:'Restaurant',purposes:['Introduction','Evaluation','Evaluation','Recommendation'],sentenceTips:[['Establishes the reason for visiting.','Adds useful location and price information.'],['States a clear preference.','Supports the judgement with sensory detail.','Explains why the portion was suitable.','Adds a specific example of flexibility.'],['Signals a shift to criticism.','Explains the wait and the effect of noise.'],['Identifies an audience and a reason.','Offers practical advice addressing the drawback.']]},...extraReviewModels];
 const practice=activities.filter(a=>a.level!=='Mastery check'),master=activities.find(a=>a.level==='Mastery check');
 function quiz(host,a,ctx){
  host.replaceChildren();let run=state.attempts.get(a.id);if(!run){run={index:0,correct:0,selected:null,order:[],checked:false,done:false};state.attempts.set(a.id,run);}
  function draw(){ctx.refresh?.();host.replaceChildren();el(host,'p','wa-kicker',a.level+' / '+a.title);if(run.done){el(host,'h3','','Activity complete');el(host,'p','wa-score',run.correct+' / '+a.items.length+' correct');el(host,'p','wa-muted','Practice result, not a Cambridge grade.');action(host,'Try again',()=>{state.attempts.delete(a.id);ctx.incomplete();quiz(host,a,ctx);});return;}
  const item=a.items[run.index];el(host,'p','wa-muted','Question '+(run.index+1)+' of '+a.items.length);el(host,'h3','wa-question-prompt',item.prompt);
  const options=el(host,'div','wa-options');const feedback=el(host,'p','wa-answer');feedback.setAttribute('role','status');
  item.options.forEach((text,i)=>{const position=run.order.indexOf(i);const b=action(options,(a.type==='order'&&position>=0?(position+1)+'. ':'')+text,()=>{if(a.type==='order')run.order.push(i);else run.selected=i;draw();const buttons=host.querySelectorAll('.wa-options button');if(!buttons[i].disabled)buttons[i].focus();else host.querySelector('.wa-options button:not(:disabled)')?.focus();},'wa-action wa-option');b.disabled=run.checked||(a.type==='order'&&position>=0);if(a.type==='choice')b.setAttribute('aria-pressed',String(run.selected===i));});
  if(run.checked){const ok=scoreItem(item,a.type==='order'?run.order:run.selected);feedback.textContent=(ok?'Correct. ':'Not quite. ')+item.rationale;feedback.dataset.result=ok?'correct':'retry';action(host,run.index+1===a.items.length?'Finish activity':'Next question',()=>{run.index++;run.checked=false;run.selected=null;run.order=[];if(run.index===a.items.length){run.done=true;if(a===master?run.correct===a.items.length:practice.every(x=>state.attempts.get(x.id)?.done))ctx.complete();}draw();},'wa-action wa-next');}
  else{const check=action(host,'Check answer',()=>{run.checked=true;if(scoreItem(item,a.type==='order'?run.order:run.selected))run.correct++;draw();});check.disabled=a.type==='order'?run.order.length!==item.options.length:run.selected===null;if(a.type==='order')action(host,'Reset order',()=>{run.order=[];draw();});}
  }draw();
 }
 mountLesson(root,{title:'Structure & Organisation',artwork:reviewArtwork.pathways.structure,onBack,reference:renderExamReference,companions,renderStage(body,i,ctx){
 if(i===0){
 const host=el(body,'div','wa-discovery');
 function draw(){host.replaceChildren();const n=state.discoveryIndex,item=discovery[n];el(host,'p','wa-kicker','CHALLENGE '+(n+1)+' / '+discovery.length);el(host,'h3','',item.prompt);el(host,'p','',item.context);
 const list=el(host,'div','wa-options');const f=el(host,'p','wa-answer');f.setAttribute('role','status');
 item.options.forEach((t,j)=>{const b=action(list,String.fromCharCode(65+j)+' · '+t,()=>{const ok=j===item.answer;f.textContent=ok?'Correct. '+item.rationale:'Not quite. Compare the purpose of each option and try again.';f.dataset.result=ok?'correct':'retry';if(ok){state.discovered.add(n);if(state.discovered.size===discovery.length)ctx.complete();}for(const other of list.querySelectorAll('button'))other.setAttribute('aria-pressed',String(other===b));},'wa-action wa-option');b.setAttribute('aria-pressed','false');});
 if(state.discovered.has(n)){f.textContent='Completed. '+item.rationale;f.dataset.result='correct';}
 const controls=el(host,'div','wa-stage-foot');const prev=action(controls,'← Previous challenge',()=>{state.discoveryIndex--;draw();});prev.disabled=n===0;const next=action(controls,'Next challenge →',()=>{state.discoveryIndex++;draw();});next.disabled=n===discovery.length-1;
 }draw();
 }else if(i===1){
 const desk=el(body,'div','wa-explore-desk');
 el(desk,'p','wa-explore-intro','Read like an editor. Identify the paragraph’s purpose, then investigate how each sentence contributes.');
 const toolbar=el(desk,'div','wa-explore-toolbar');
 const picker=el(toolbar,'details','wa-explore-picker');
 const trigger=el(picker,'summary','wa-explore-picker-trigger');
 const menu=el(picker,'div','wa-explore-picker-menu');
 const icons={'Café':'☕','Restaurant':'🍴','Film':'▣','Book':'▤','Music festival':'♫','Attraction':'◇','Video game':'✣','Museum':'⌂'};
 const host=el(desk,'div','wa-model-explorer');
 let briefOpen=true;
 function updatePicker(){const m=models[state.model];trigger.replaceChildren();const icon=el(trigger,'span','wa-explore-category-icon',icons[m.category]||'▤');icon.setAttribute('aria-hidden','true');const copy=el(trigger,'span','wa-explore-picker-copy');el(copy,'span','wa-explore-eyebrow',m.category+' review');el(copy,'strong','',m.title);el(trigger,'span','wa-explore-chevron','⌄').setAttribute('aria-hidden','true');menu.querySelectorAll('button').forEach((b,j)=>b.setAttribute('aria-pressed',String(j===state.model)));}
 models.forEach((m,j)=>{const b=action(menu,'',()=>{state.model=j;state.paragraph=0;picker.open=false;briefOpen=true;updatePicker();draw();trigger.focus();},'wa-action wa-explore-model-choice');el(b,'span','wa-explore-category-icon',icons[m.category]||'▤').setAttribute('aria-hidden','true');const copy=el(b,'span','');el(copy,'strong','',m.title);el(copy,'small','',m.category+' review');});
 // Dismiss on outside pointer interaction; detach when the stage is removed.
 const doc=picker.ownerDocument;
 const dismiss=e=>{if(picker.open&&!picker.contains(e.target))picker.open=false;};
 const observer=new doc.defaultView.MutationObserver(()=>{if(!picker.isConnected){doc.removeEventListener('pointerdown',dismiss,true);observer.disconnect();}});
 doc.addEventListener('pointerdown',dismiss,true);
 observer.observe(doc.documentElement,{childList:true,subtree:true});
 picker.addEventListener('keydown',e=>{if(e.key==='Escape'&&picker.open){picker.open=false;trigger.focus();}});
 function draw(){
  host.replaceChildren();const m=models[state.model],n=state.paragraph,key=state.model+':'+n;
  const brief=el(host,'details','wa-explore-brief');brief.open=briefOpen;el(brief,'summary','','Exam brief');el(brief,'p','',m.prompt);brief.addEventListener('toggle',()=>{briefOpen=brief.open;});
  const paper=el(host,'article','wa-explore-paper');const meta=el(paper,'div','wa-explore-paper-meta');el(meta,'span','wa-explore-eyebrow','MODEL '+String(state.model+1).padStart(2,'0')+' / '+m.category.toUpperCase());el(meta,'span','wa-explore-position','Paragraph '+(n+1)+' of '+m.paragraphs.length);
  el(paper,'h3','wa-explore-headline',m.title);
  const progress=el(paper,'div','wa-explore-progress');progress.setAttribute('aria-hidden','true');m.paragraphs.forEach((_,j)=>{const segment=el(progress,'span','');segment.dataset.current=String(j===n);segment.dataset.done=String(state.identified.has(state.model+':'+j));});
  const prose=el(paper,'p','wa-model-text wa-explore-prose');
  const pieces=m.paragraphs[n].match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g)||[m.paragraphs[n]];
  const selected=state.annotations.get(key)||new Set();state.annotations.set(key,selected);
  const note=el(paper,'div','wa-explore-note');el(note,'span','wa-explore-eyebrow','EDITOR’S NOTE');const detail=el(note,'p','','Identify the paragraph’s purpose to unlock sentence annotations.');detail.setAttribute('role','status');
  const sentenceTips=m.sentenceTips?.[n];let unlocked=state.identified.has(key);const sentenceButtons=[];
  pieces.forEach((sentence,j)=>{const b=el(prose,'span','wa-phrase wa-explore-sentence',sentence.trim());b.setAttribute('role','button');b.tabIndex=unlocked?0:-1;b.setAttribute('aria-disabled',String(!unlocked));const activate=()=>{if(!unlocked)return;selected.clear();selected.add(j);sentenceButtons.forEach((item,k)=>item.setAttribute('aria-pressed',String(k===j)));detail.textContent=sentenceTips?.[j]||m.notes[n];};b.onclick=activate;b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}};b.setAttribute('aria-pressed',String(selected.has(j)));sentenceButtons.push(b);prose.append(' ');});
  if(unlocked)detail.textContent=selected.size?(sentenceTips?.[[...selected][0]]||m.notes[n]):'Select any sentence to investigate its contribution.';
  const question=el(host,'section','wa-explore-question');el(question,'p','wa-explore-eyebrow','IDENTIFY THE PURPOSE');el(question,'h3','','What is this paragraph mainly trying to achieve?');const choices=el(question,'div','wa-move-options');const f=el(question,'p','wa-answer');f.setAttribute('role','status');const answerButtons=[];
  ['Introduction','Description','Evaluation','Recommendation'].forEach((t,j)=>{const b=action(choices,'',()=>{answerButtons.forEach(item=>item.setAttribute('aria-pressed',String(item===b)));if(t===m.purposes[n]){state.identified.add(key);unlocked=true;sentenceButtons.forEach(item=>{item.tabIndex=0;item.setAttribute('aria-disabled','false');});progress.children[n].dataset.done='true';detail.textContent='Select any sentence to investigate its contribution.';f.textContent='Correct. '+m.notes[n];f.dataset.result='correct';if(models.some((entry,k)=>entry.paragraphs.every((_,x)=>state.identified.has(k+':'+x))))ctx.complete();}else{f.textContent='Not quite. Think about the main purpose of this paragraph.';f.dataset.result='retry';}},'wa-action wa-explore-choice');el(b,'span','wa-explore-choice-letter',String.fromCharCode(65+j));el(b,'span','',t==='Evaluation'?'Opinion & Evaluation':t);b.setAttribute('aria-pressed',String(unlocked&&t===m.purposes[n]));answerButtons.push(b);});
  if(unlocked){f.textContent='Correct. '+m.notes[n];f.dataset.result='correct';}
  const controls=el(host,'div','wa-stage-foot wa-explore-controls');const prev=action(controls,'← Previous paragraph',()=>{state.paragraph--;draw();host.querySelector('.wa-explore-headline').focus();});prev.disabled=n===0;const next=action(controls,'Next paragraph →',()=>{state.paragraph++;draw();host.querySelector('.wa-explore-headline').focus();});next.disabled=n===m.paragraphs.length-1;paper.querySelector('h3').tabIndex=-1;
  const full=el(host,'details','wa-explore-full');el(full,'summary','','Read complete model');for(const p of m.paragraphs)el(full,'p','wa-explore-full-prose',p);el(full,'p','wa-muted','Original teaching model, not examiner-marked. '+m.paragraphs.join(' ').trim().split(/\s+/).length+' words.');
 }
 updatePicker();draw();
 }else if(i===2){
 const desk=el(body,'div','wa-practise-desk');
 el(desk,'p','wa-practise-intro','Choose a short challenge. Complete all five to finish this stage.');
 const header=el(desk,'div','wa-practise-library-header');el(header,'span','wa-practise-eyebrow','CHALLENGE LIBRARY');const count=el(header,'span','wa-practise-count');
 const cards=el(desk,'div','wa-practise-library');const host=el(desk,'div','wa-question wa-practise-question');
 const icons=['◎','↕','✎','▤','✦'];const buttons=[];
 function syncCards(){count.textContent=practice.filter(a=>state.attempts.get(a.id)?.done).length+' / '+practice.length+' complete';buttons.forEach((b,j)=>{const a=practice[j];b.setAttribute('aria-pressed',String(state.active===a.id));b.dataset.done=String(!!state.attempts.get(a.id)?.done);b.querySelector('.wa-practise-card-status').textContent=state.attempts.get(a.id)?.done?'✓ Complete':a.items.length+' question'+(a.items.length===1?'':'s');});}
 const presentationCtx={...ctx,complete:()=>{ctx.complete();syncCards();},incomplete:()=>{ctx.incomplete();syncCards();},refresh:syncCards};
 practice.forEach((a,j)=>{const b=action(cards,'',()=>{state.active=a.id;syncCards();quiz(host,a,presentationCtx);},'wa-action wa-practise-card');b.dataset.level=a.level.toLowerCase();const top=el(b,'span','wa-practise-card-top');el(top,'span','wa-practise-icon',icons[j]).setAttribute('aria-hidden','true');el(top,'span','wa-practise-level',a.level);el(b,'strong','wa-practise-card-title',a.title);el(b,'span','wa-practise-card-status');buttons.push(b);});
 syncCards();if(state.active)quiz(host,practice.find(a=>a.id===state.active),presentationCtx);else{el(host,'p','wa-practise-empty','Select a challenge above to begin.');}
 
 }else if(i===3){
 const host=el(body,'div','wa-apply-work wa-apply-desk');
 function draw(){
 host.replaceChildren();const n=state.applyIndex,item=applicationTasks[n],run=state.applications[n];
 const isComplete=(x,j)=>!!x.written.trim()&&x.revealed&&x.checks.size===applicationTasks[j].checks.length;
 const header=el(host,'div','wa-apply-header');el(header,'span','wa-apply-eyebrow','WRITING WORKSHOP');el(header,'span','wa-apply-position','Task '+(n+1)+' of '+applicationTasks.length);
 const meter=el(host,'div','wa-apply-progress');meter.setAttribute('aria-hidden','true');applicationTasks.forEach((_,j)=>{const segment=el(meter,'span','');segment.dataset.current=String(j===n);segment.dataset.done=String(isComplete(state.applications[j],j));});
 const title=el(host,'h3','wa-apply-title',item.title);title.tabIndex=-1;
 const source=el(host,'article','wa-apply-source');el(source,'p','wa-apply-eyebrow','ORIGINAL WRITING');el(source,'p','wa-apply-original',item.prompt);
 const editor=el(host,'section','wa-apply-editor');el(editor,'p','wa-apply-eyebrow','YOUR REVISION');const l=el(editor,'label','wa-apply-instruction',item.question);l.htmlFor='wa-improvement';const input=el(editor,'textarea','wa-writing-input wa-apply-input');input.id=l.htmlFor;input.rows=4;input.value=run.written;input.placeholder='Write your own response…';
 const tools=el(editor,'div','wa-apply-tools');const reveal=action(tools,'Compare with an example →',()=>{if(!run.written.trim()){status.textContent='Write your own response first.';return;}run.revealed=true;comparison.hidden=false;reveal.setAttribute('aria-expanded','true');status.textContent='Compare your writing with the example. Different well-supported answers are welcome.';progress();},'wa-action wa-apply-reveal');
 reveal.setAttribute('aria-expanded',String(run.revealed));reveal.setAttribute('aria-controls','wa-apply-comparison');
 const wordCount=el(tools,'span','wa-apply-word-count');function updateCount(){const words=run.written.trim()?run.written.trim().split(/\s+/).length:0;wordCount.textContent=words+' word'+(words===1?'':'s');}updateCount();
 const status=el(host,'p','wa-answer wa-apply-status');status.setAttribute('role','status');
 const comparison=el(host,'section','wa-apply-comparison');comparison.id='wa-apply-comparison';comparison.hidden=!run.revealed;
 const model=el(comparison,'article','wa-apply-model');el(model,'p','wa-apply-eyebrow','ONE POSSIBLE RESPONSE');el(model,'p','wa-apply-model-text',item.example);
 const checklist=el(comparison,'div','wa-apply-checklist');el(checklist,'h3','','Review your revision');const checkCount=el(checklist,'p','wa-apply-check-count');
 function progress(){checkCount.textContent=run.checks.size+' of '+item.checks.length+' checks completed';applicationTasks.forEach((_,j)=>meter.children[j].dataset.done=String(isComplete(state.applications[j],j)));if(state.applications.every(isComplete))ctx.complete();else ctx.incomplete();}
 item.checks.forEach((t,k)=>{const l=el(checklist,'label','wa-check wa-apply-check');const cb=el(l,'input','');cb.type='checkbox';cb.checked=run.checks.has(k);cb.onchange=()=>{if(cb.checked)run.checks.add(k);else run.checks.delete(k);progress();};el(l,'span','',t);});
 checkCount.textContent=run.checks.size+' of '+item.checks.length+' checks completed';
 input.oninput=()=>{run.written=input.value;run.checks.clear();for(const cb of comparison.querySelectorAll('input'))cb.checked=false;updateCount();progress();};
 const controls=el(host,'div','wa-stage-foot wa-apply-controls');const prev=action(controls,'← Previous task',()=>{state.applyIndex--;draw();host.querySelector('.wa-apply-title').focus();});prev.disabled=n===0;const next=action(controls,'Next task →',()=>{state.applyIndex++;draw();host.querySelector('.wa-apply-title').focus();});next.disabled=n===applicationTasks.length-1;
 }draw();
 }else{const host=el(body,'div','wa-question');quiz(host,master,ctx);const end=el(body,'details','wa-tip');el(end,'summary','','Apply it in your own review');el(end,'h3','','Independent task · Community sports event');el(end,'p','',independentTask.prompt);action(end,'Open Writing Studio →',()=>onStudio({initialTask:independentTask.id,initialMode:'Gold'}));}
 }});
}

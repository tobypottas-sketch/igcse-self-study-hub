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
 const models=[{...model,category:'Café',purposes:['Introduction','Description','Evaluation','Recommendation']},{...guidedTask,title:'Willow Kitchen',category:'Restaurant',purposes:['Introduction','Description','Evaluation','Recommendation']},...extraReviewModels];
 const practice=activities.filter(a=>a.level!=='Mastery check'),master=activities.find(a=>a.level==='Mastery check');
 function quiz(host,a,ctx){
  host.replaceChildren();let run=state.attempts.get(a.id);if(!run){run={index:0,correct:0,selected:null,order:[],checked:false,done:false};state.attempts.set(a.id,run);}
  function draw(){host.replaceChildren();el(host,'p','wa-kicker',a.level+' / '+a.title);if(run.done){el(host,'h3','','Activity complete');el(host,'p','wa-score',run.correct+' / '+a.items.length+' correct');el(host,'p','wa-muted','Practice result, not a Cambridge grade.');action(host,'Try again',()=>{state.attempts.delete(a.id);ctx.incomplete();quiz(host,a,ctx);});return;}
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
 }else if(i===1){el(body,'p','','Explore one paragraph at a time. Identify its main purpose before revealing the annotation.');const selector=el(body,'div','wa-model-selector');selector.style.cssText='display:flex;align-items:center;flex-wrap:wrap;gap:12px;margin:16px 0';const label=el(selector,'label','','Model review');label.htmlFor='wa-model-select';const select=el(selector,'select','wa-writing-input');select.style.cssText='width: min(100%, 300px); min-width:0; max-width:100%; margin:0; font-size:1rem';select.id=label.htmlFor;models.forEach((m,n)=>{const o=el(select,'option','',m.title+' · '+m.category);o.value=n;});select.value=state.model;el(selector,'span','wa-muted',models.length+' model reviews');const host=el(body,'div','wa-model-explorer');
 function draw(){host.replaceChildren();const m=models[state.model],n=state.paragraph;const key=state.model+':'+n;el(host,'p','wa-muted',m.prompt);const part=el(host,'article','wa-model-part');el(part,'p','wa-kicker','PARAGRAPH '+(n+1)+' / '+m.paragraphs.length);const text=el(part,'p','wa-model-text');const pieces=m.paragraphs[n].match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g)||[m.paragraphs[n]];const selected=state.annotations.get(key)||new Set();state.annotations.set(key,selected);const detail=el(part,'p','wa-annotation');detail.setAttribute('role','status');const sentenceTips=m.sentenceTips?.[n]||(state.model===0&&n===0?['Names the café, establishes the time and explains the reason for visiting.','Introduces an initial evaluation through the atmosphere and welcome.']:null);pieces.forEach((sentence,j)=>{const b=action(text,sentence.trim(),()=>{selected.add(j);b.setAttribute('aria-pressed','true');detail.textContent=sentenceTips?.[j]||m.notes[n];},'wa-phrase');b.setAttribute('aria-pressed',String(selected.has(j)));text.append(' ');});if(selected.size)detail.textContent=m.notes[n];el(part,'p','wa-muted','Select a sentence to reveal its contribution.');const choices=el(host,'div','wa-move-options');const f=el(host,'p','wa-answer');f.setAttribute('role','status');['Introduction','Description','Evaluation','Recommendation'].forEach(t=>action(choices,t,()=>{if(t===m.purposes[n]){state.identified.add(key);f.textContent='Correct. '+m.notes[n];f.dataset.result='correct';if(models.some((entry,k)=>entry.paragraphs.every((_,x)=>state.identified.has(k+':'+x))))ctx.complete();}else{f.textContent='Not quite. Think about the main purpose of this paragraph.';f.dataset.result='retry';}}));if(state.identified.has(key))f.textContent=m.notes[n];const controls=el(host,'div','wa-stage-foot');const prev=action(controls,'← Previous paragraph',()=>{state.paragraph--;draw();});prev.disabled=n===0;const next=action(controls,'Next paragraph →',()=>{state.paragraph++;draw();});next.disabled=n===m.paragraphs.length-1;
 const full=el(host,'details','');el(full,'summary','','Read complete model');for(const p of m.paragraphs)el(full,'p','',p);el(full,'p','wa-muted','Original teaching model, not examiner-marked. '+m.paragraphs.join(' ').trim().split(/\s+/).length+' words.');}
 select.onchange=()=>{state.model=Number(select.value);state.paragraph=0;draw();};draw();
 }else if(i===2){el(body,'p','','Choose a short challenge. Complete all five to finish this stage.');const cards=el(body,'div','wa-activity-list');const host=el(body,'div','wa-question');practice.forEach(a=>action(cards,a.level+' · '+a.title,()=>{state.active=a.id;quiz(host,a,ctx);},'wa-action wa-challenge'));if(state.active)quiz(host,practice.find(a=>a.id===state.active),ctx);
 }else if(i===3){
 const host=el(body,'div','wa-apply-work');
 function draw(){host.replaceChildren();const n=state.applyIndex,item=applicationTasks[n],run=state.applications[n];el(host,'p','wa-kicker','WRITING TASK '+(n+1)+' / '+applicationTasks.length);el(host,'h3','',item.title);el(host,'p','wa-weak-opinion',item.prompt);const l=el(host,'label','',item.question);l.htmlFor='wa-improvement';const input=el(host,'textarea','wa-writing-input');input.id=l.htmlFor;input.rows=4;input.value=run.written;input.placeholder='Write your own response…';const status=el(host,'p','wa-answer');status.setAttribute('role','status');
 const reveal=action(host,'Compare with an example',()=>{if(!run.written.trim()){status.textContent='Write your own response first.';return;}run.revealed=true;comparison.hidden=false;status.textContent='Compare your writing with the example. Different well-supported answers are welcome.';});
 const comparison=el(host,'div','wa-model-part wa-move-0');comparison.hidden=!run.revealed;el(comparison,'h3','','One possible response');el(comparison,'p','',item.example);
 function progress(){if(state.applications.every((x,j)=>x.written.trim()&&x.revealed&&x.checks.size===applicationTasks[j].checks.length))ctx.complete();else ctx.incomplete();}
 item.checks.forEach((t,k)=>{const l=el(comparison,'label','wa-check');const cb=el(l,'input','');cb.type='checkbox';cb.checked=run.checks.has(k);cb.onchange=()=>{if(cb.checked)run.checks.add(k);else run.checks.delete(k);progress();};l.append(' '+t);});
 input.oninput=()=>{run.written=input.value;run.checks.clear();for(const cb of comparison.querySelectorAll('input'))cb.checked=false;progress();};
 const controls=el(host,'div','wa-stage-foot');const prev=action(controls,'← Previous writing task',()=>{state.applyIndex--;draw();});prev.disabled=n===0;const next=action(controls,'Next writing task →',()=>{state.applyIndex++;draw();});next.disabled=n===applicationTasks.length-1;
 }draw();
 }else{const host=el(body,'div','wa-question');quiz(host,master,ctx);const end=el(body,'details','wa-tip');el(end,'summary','','Apply it in your own review');el(end,'h3','','Independent task · Community sports event');el(end,'p','',independentTask.prompt);action(end,'Open Writing Studio →',()=>onStudio({initialTask:independentTask.id,initialMode:'Gold'}));}
 }});
}

import {guidedTask,independentTask,toolkit,improvement,selfCheck} from '../content/review-guided-v1.js';
import {reviewExam,blueprint,model,structureActivities} from '../content/review-structure-v1.js';
import {scoreItem,validateActivities} from '../engine/activities.js';
const activities=validateActivities(structureActivities);
function add(p,tag,cls,t){const n=p.ownerDocument.createElement(tag);n.className=cls||'';if(t)n.textContent=t;p.append(n);return n;}
function button(p,t,fn){const n=add(p,'button','wa-action',t);n.type='button';n.addEventListener('click',fn);return n;}
export function renderExamReference(p){
 const s=add(p,'aside','wa-exam-reference');add(s,'strong','','0511 · Paper 1 Exercise 6 · 120–160 words · Content /6 · Language /9');
 add(s,'p','','Introduce → Describe → Evaluate → Recommend');
 const d=add(s,'details','');add(d,'summary','','Review blueprint & exam checklist');
 const ol=add(d,'ol','');for(const x of blueprint)add(ol,'li','',x.title+': '+x.guidance);
 add(d,'p','','Recommended scaffold, not a compulsory four-paragraph format. Cover all task requirements; develop ideas; use appropriate register, accurate and varied language, and clear organisation.');
 add(d,'p','','Description and evaluation may share a paragraph. Use formal or semi-formal language suited to the audience. Title, paragraph count and balance of praise and criticism are flexible.');
 const ul=add(d,'ul','');for(const x of selfCheck)add(ul,'li','',x);
 const k=add(d,'details','');add(k,'summary','','Language toolkit');const kl=add(k,'ul','');for(const x of toolkit)add(kl,'li','',x);
 return s;
}
export function renderStructure(root,onBack){
 root.replaceChildren();const shell=add(root,'div','wa-shell wa-learning');
 const nav=add(shell,'nav','wa-nav');button(nav,'← All pathways',onBack);add(nav,'span','wa-preview','Staff preview');
 add(shell,'h1','','Structure & Organisation');renderExamReference(shell);
 const learn=add(shell,'section','wa-lesson');add(learn,'h2','','Learn from a model review');add(learn,'p','',model.prompt);add(learn,'h3','',model.title);
 for(let i=0;i<model.paragraphs.length;i++){const part=add(learn,'div','wa-model-part');add(part,'strong','',blueprint[i].title);add(part,'p','',model.paragraphs[i]);add(part,'p','wa-annotation',model.notes[i]);}
 add(learn,'p','wa-muted','Original teaching model, not an examiner-marked response. '+model.paragraphs.join(' ').trim().split(/\s+/).length+' words.');
 const guided=add(shell,'section','wa-lesson');add(guided,'h2','','Learn · Willow Kitchen');add(guided,'p','',guidedTask.prompt);
 for(let i=0;i<guidedTask.paragraphs.length;i++){const part=add(guided,'div','wa-guided-part wa-model-part');add(part,'strong','',i===1?'Description & evaluation':i===2?'Evaluation':blueprint[i].title);add(part,'p','',guidedTask.paragraphs[i]);add(part,'p','wa-annotation',guidedTask.notes[i]);}
 add(guided,'p','wa-muted','Original teaching model, not examiner-marked. '+guidedTask.paragraphs.join(' ').trim().split(/\s+/).length+' words.');
 const improve=add(shell,'section','wa-lesson');add(improve,'h2','','Improve · Develop your opinion');add(improve,'p','','Weak opinion: '+improvement.prompt);add(improve,'h3','',improvement.question);
 const label=add(improve,'label','','Rewrite the opinion using a concrete detail.');label.htmlFor='wa-improvement';const input=add(improve,'textarea','wa-writing-input');input.id='wa-improvement';input.rows=4;input.placeholder='Write your own improved opinion…';
 const reveal=button(improve,'Compare with an example',()=>{if(!input.value.trim()){status.textContent='Write your own improvement first.';return;}status.textContent='Compare your writing with the example. Different well-supported answers are welcome.';comparison.hidden=false;});
 const status=add(improve,'p','wa-answer');status.setAttribute('role','status');const comparison=add(improve,'div','wa-model-part');comparison.hidden=true;add(comparison,'p','',improvement.example);add(comparison,'strong','','Why this works');add(comparison,'p','','Specific food detail and value for the reader replace a vague judgement. Check your own response:');for(const x of improvement.checks){const line=add(comparison,'label','wa-check');const cb=add(line,'input','');cb.type='checkbox';line.append(' '+x);}
 const practice=add(shell,'section','wa-lesson');add(practice,'h2','','Practise & check understanding');
 const choices=add(practice,'div','wa-activity-list');const host=add(practice,'div','wa-question');
 const state=new Map();
 function open(a){let index=0;let correct=0;function draw(){host.replaceChildren();add(host,'h3','',a.title+' · '+a.level);add(host,'p','wa-muted','Question '+(index+1)+' of '+a.items.length);
 const item=a.items[index];add(host,'p','wa-question-prompt',item.prompt);const options=add(host,'div','wa-options');const feedback=add(host,'p','wa-answer');feedback.setAttribute('role','status');let selected=null;let order=[];let checked=false;
 const check=button(host,'Check answer',()=>{if(checked)return;checked=true;const ok=scoreItem(item,a.type==='order'?order:selected);if(ok)correct++;feedback.textContent=(ok?'Correct. ':'Not quite. ')+item.rationale;check.disabled=true;for(const b of options.querySelectorAll('button'))b.disabled=true;button(host,index+1===a.items.length?'Finish activity':'Next question',()=>{index++;if(index<a.items.length)draw();else{state.set(a.id,correct);host.replaceChildren();add(host,'h3','','Activity complete');add(host,'p','',correct+' / '+a.items.length+' correct. Practice result only; not a Cambridge grade.');button(host,'Try again',()=>open(a));}});});check.disabled=true;
 item.options.forEach((text,i)=>{const b=button(options,text,()=>{if(a.type==='order'){order.push(i);b.textContent=order.length+'. '+text;b.disabled=true;check.disabled=order.length!==item.options.length;}else{selected=i;for(const other of options.querySelectorAll('button'))other.setAttribute('aria-pressed',String(other===b));check.disabled=false;}});if(a.type==='choice')b.setAttribute('aria-pressed','false');});
 if(a.type==='order')button(host,'Reset order',()=>{if(!checked)draw();});
 }draw();}
 for(const a of activities)button(choices,a.level+' · '+a.title,()=>open(a));
 const end=add(shell,'section','wa-lesson');add(end,'h2','','Apply it in your own review');add(end,'h3','','Independent task · Community sports event');add(end,'p','',independentTask.prompt);add(end,'p','wa-muted','Integrated planning and draft recovery are still in development. To practise now, copy this task into the existing Studio’s custom question field.');const a=add(end,'a','wa-primary','Open Writing Studio →');a.href='./review-writing.html';
}

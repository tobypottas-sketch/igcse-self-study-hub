import {guidedTask,independentTask,selfCheck,toolkit} from '../content/review-guided-v1.js';
import {createDraftStore,wordStatus} from '../engine/drafts.js';
import {renderExamReference} from './structure.js?v=5';
function add(p,t,c,v){const n=p.ownerDocument.createElement(t);n.className=c||'';if(v)n.textContent=v;p.append(n);return n;}
function btn(p,t,fn){const b=add(p,'button','wa-action',t);b.type='button';b.onclick=fn;return b;}
export function renderStudio(root,{accountId,onBack,initialTask='review-willow-kitchen',initialMode}){
 const tasks=[guidedTask,independentTask];let task=tasks.find(t=>t.id===initialTask)||tasks[0];let store,draft;
 let storage;try{storage=root.ownerDocument.defaultView.localStorage;}catch{storage=null;}
 function load(){store=createDraftStore(storage,accountId,task);draft=store.load();}
 load();if(initialMode){draft.mode=initialMode;}
 let status;
 function save(){const ok=store.save(draft);if(status)status.textContent=ok?'Saved on this browser for this account.':'Not saved — browser storage unavailable. Copy your answer before leaving.';}
 function draw(){
 root.replaceChildren();const shell=add(root,'div','wa-shell wa-learning wa-studio');const nav=add(shell,'nav','wa-nav');btn(nav,'← Academy',()=>{save();onBack();});add(nav,'span','wa-preview','Staff preview');
 add(shell,'h1','','Writing Studio');renderExamReference(shell);
 const controls=add(shell,'section','wa-lesson');const label=add(controls,'label','','Choose a review task');label.htmlFor='wa-task';const sel=add(controls,'select','wa-writing-input');sel.id='wa-task';for(const t of tasks){const o=add(sel,'option','',t===guidedTask?'Restaurant · Willow Kitchen':'Community sports event');o.value=t.id;}sel.value=task.id;sel.onchange=()=>{save();task=tasks.find(t=>t.id===sel.value);load();draw();};
 add(controls,'h2','','Your task');add(controls,'p','',task.prompt);add(controls,'p','wa-muted','Audience: '+task.audience+' · Publication: '+task.publication);
 const modes=add(controls,'div','wa-studio-tabs');for(const m of ['Bronze','Silver','Gold']){const b=btn(modes,m,()=>{draft.mode=m;save();draw();});b.setAttribute('aria-pressed',String(draft.mode===m));}
 add(controls,'p','wa-muted',draft.mode==='Bronze'?'Guided · planning prompts and sentence starters':draft.mode==='Silver'?'Supported · planning questions':'Independent · minimal guidance');
 const tabs=add(shell,'nav','wa-studio-tabs');tabs.setAttribute('aria-label','Writing stages');for(const s of ['Plan','Write','Review']){const b=btn(tabs,s,()=>{draft.stage=s;save();draw();});b.setAttribute('aria-pressed',String(draft.stage===s));}
 status=add(shell,'p','wa-muted');status.setAttribute('role','status');save();
 const panel=add(shell,'section','wa-lesson');add(panel,'h2','',draft.stage);
 if(draft.stage==='Plan'){
 const prompts=[['audience','Who will read your review?','My readers are …'],['reason','Why did you visit?','I went because …'],['feature1','Which feature stood out, and why?','What stood out was …'],['feature2','What other feature or drawback mattered?','The main drawback was …'],['recommendation','Who would enjoy it, and why?','I would recommend it to … because …']];
 const guide=add(panel,'details','');guide.open=draft.mode!=='Gold';add(guide,'summary','','Optional planning notes');for(const [key,q,start] of prompts){const l=add(guide,'label','',q);l.htmlFor='wa-note-'+key;const x=add(guide,'textarea','wa-writing-input');x.id=l.htmlFor;x.rows=2;x.value=draft.notes[key];if(draft.mode==='Bronze')x.placeholder=start;x.oninput=()=>{draft.notes[key]=x.value;save();};}
 add(panel,'p','wa-muted','Your notes are kept separately and never inserted into your answer.');btn(panel,'Continue to Write →',()=>{draft.stage='Write';save();draw();});
 }else if(draft.stage==='Write'){
 const notes=add(panel,'details','');add(notes,'summary','','My planning notes');for(const [k,v] of Object.entries(draft.notes))if(v.trim())add(notes,'p','',k+': '+v);
 if(draft.mode==='Bronze'){const tips=add(panel,'details','');tips.open=true;add(tips,'summary','','Sentence starters');for(const t of toolkit)add(tips,'p','',t);}
 const l=add(panel,'label','','Write your review in continuous prose');l.htmlFor='wa-answer-editor';const x=add(panel,'textarea','wa-writing-input wa-editor');x.id=l.htmlFor;x.rows=12;x.value=draft.answer;const count=add(panel,'p','wa-count');count.setAttribute('aria-live','polite');function update(){const w=wordStatus(draft.answer);count.textContent=w.count+' words · '+(w.status==='within'?'Within target':w.status==='below'?'Below target':'Above target')+' (120–160)';}update();x.oninput=()=>{draft.answer=x.value;update();save();};btn(panel,'Review my writing →',()=>{if(!draft.answer.trim()){x.focus();return;}if(draft.original===null)draft.original=draft.answer;draft.stage='Review';save();draw();});
 }else{
 const w=wordStatus(draft.answer);add(panel,'p','wa-count',w.count+' words · '+w.status+' target (120–160)');add(panel,'p','wa-muted','Self-review only. Automated feedback and teacher submission are not connected in this preview.');
 for(const q of selfCheck){const l=add(panel,'label','wa-check');const c=add(l,'input','');c.type='checkbox';l.append(' '+q);}
 const compare=add(panel,'div','wa-compare');for(const [title,text] of [['Original draft',draft.original??'No revision snapshot yet.'],['Current draft',draft.answer]]){const box=add(compare,'article','wa-model-part');add(box,'h3','',title);add(box,'p','wa-prose',text);}
 btn(panel,'Revise my writing →',()=>{if(draft.original===null&&draft.answer.trim())draft.original=draft.answer;draft.stage='Write';save();draw();});
 }
 btn(shell,'Clear this task’s preview draft',()=>{if(root.ownerDocument.defaultView.confirm('Delete your local preview draft and notes for this task?')){if(store.clear()){draft=store.load();draw();}else status.textContent='Could not clear browser storage.';}});
 }
 draw();
}

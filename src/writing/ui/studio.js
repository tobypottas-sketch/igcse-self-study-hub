import {reviewStudioConfig} from '../content/review-studio-config.js';
import {createDraftStore,wordStatus} from '../engine/drafts.js';
import {renderExamReference} from './structure.js?v=6';
import {renderArtwork,reviewArtwork} from './editorial-art.js?v=8';
import {el as add,action as btn} from './lesson-shell.js?v=6';
const support={Bronze:'Guided · questions and sentence starters',Silver:'Supported · planning questions',Gold:'Independent · minimal guidance'};
export function renderStudio(root,options){return renderWorkspace(root,{...options,config:reviewStudioConfig,reference:renderExamReference,artwork:reviewArtwork.studio});}
export function renderWorkspace(root,{accountId,onBack,initialTask,initialMode,config,reference,artwork}){
 const {tasks,fields,min,max}=config;let task=tasks.find(t=>t.id===initialTask)||tasks[0];let store,draft,status,saved=null,focusMode=false;
 const view=root.ownerDocument.defaultView;
 let companionOpen=view.matchMedia('(min-width: 700px)').matches;
 let storage;try{storage=root.ownerDocument.defaultView.localStorage;}catch{storage=null;}
 function load(){store=createDraftStore(storage,accountId,task);draft=store.load();saved=null;}
 load();if(initialMode)draft.mode=initialMode;
 function showSaveStatus(){
  status.textContent=saved===null?'Draft saves on this browser':saved?'✓ Draft saved on this browser':'Draft not saved — copy your work before leaving.';
  status.dataset.saved=String(saved!==false);
 }
 function save(){saved=store.save(draft);showSaveStatus();}
 function go(stage){draft.stage=stage;if(stage==='Review'&&draft.answer.trim()&&draft.original===null)draft.original=draft.answer;save();draw(true);}
 function draw(focus=false){
 root.replaceChildren();const shell=add(root,'div','wa-shell wa-studio wa-workspace');shell.dataset.focus=String(focusMode&&draft.stage==='Write');
 const nav=add(shell,'nav','wa-nav');btn(nav,'← Academy',()=>{save();onBack();});add(nav,'span','wa-preview','Staff preview');
 const hero=add(shell,'header','wa-studio-hero');const copy=add(hero,'div','');add(copy,'p','wa-kicker',config.genre.toUpperCase());add(copy,'h1','','The Writing Studio');add(copy,'p','','Find your voice. Make every word count.');if(artwork?.hero)renderArtwork(hero,artwork.hero,'studio-hero');
 const top=add(shell,'div','wa-workspace-toolbar');const tabs=add(top,'nav','wa-workspace-tabs');tabs.setAttribute('aria-label','Writing stages');
 for(const stage of ['Plan','Write','Review']){const b=btn(tabs,stage,()=>go(stage),'wa-workspace-tab');b.setAttribute('aria-pressed',String(draft.stage===stage));}
 status=add(top,'p','wa-save-status');status.setAttribute('role','status');showSaveStatus();
 const grid=add(shell,'div','wa-workspace-grid');const sidebar=add(grid,'aside','wa-workspace-sidebar');const companion=add(sidebar,'details','wa-companion');companion.open=companionOpen;
 add(companion,'summary','','Writing companion · '+task.title);
 companion.ontoggle=()=>{if(companion.isConnected)companionOpen=companion.open;};
 const brief=add(companion,'section','wa-brief');
 const label=add(brief,'label','','Writing task');label.htmlFor='wa-task';const sel=add(brief,'select','wa-writing-input');sel.id='wa-task';for(const t of tasks){const o=add(sel,'option','',t.title);o.value=t.id;}sel.value=task.id;sel.onchange=()=>{save();task=tasks.find(t=>t.id===sel.value);load();draw();root.querySelector('#wa-task').focus();};
 add(brief,'p','',task.scenario||task.prompt);add(brief,'p','wa-muted',task.audience+' · '+task.publication);
 if(task.ideas?.length){const options=add(brief,'details','');add(options,'summary','','Ideas to consider');const ideas=add(options,'div','wa-idea-chips');for(const idea of task.ideas)add(ideas,'span','',idea);}
 const full=add(brief,'details','');add(full,'summary','','Full exam task');add(full,'p','',task.prompt);
 const modes=add(companion,'section','wa-support-panel');add(modes,'h3','','Choose your support');const modebar=add(modes,'div','wa-studio-tabs');for(const m of Object.keys(support)){const b=btn(modebar,m,()=>{draft.mode=m;save();draw();root.querySelector('[data-mode='+m+']').focus();});b.setAttribute('aria-pressed',String(draft.mode===m));b.dataset.mode=m;}add(modes,'p','wa-muted',support[draft.mode]);
 if(draft.stage!=='Plan'){const notes=add(companion,'details','wa-notes-panel');add(notes,'summary','','My planning notes');for(const f of fields){if(draft.notes[f.key]?.trim()){add(notes,'strong','',f.title);add(notes,'p','wa-prose',draft.notes[f.key]);}}if(!Object.values(draft.notes).some(v=>v.trim()))add(notes,'p','wa-muted','No notes yet.');btn(notes,'Edit plan',()=>go('Plan'));}
 const tips=add(companion,'details','wa-notes-panel');add(tips,'summary','','Language toolkit');
 for(const tip of config.languageSupport[draft.mode])add(tips,'p','',tip);
 const referenceBox=reference(companion);referenceBox.classList.add('wa-workspace-reference');
 const panel=add(grid,'section','wa-workspace-main');const stageIntro=add(panel,'div','wa-workspace-intro');const intro=add(stageIntro,'div','');const heading=add(intro,'h2','wa-workspace-heading',draft.stage==='Plan'?'Build your plan':draft.stage==='Write'?'Write your draft':'Refine your writing');heading.tabIndex=-1;
 if(draft.stage!=='Write'&&artwork?.context)renderArtwork(stageIntro,artwork.context,'studio-context');
 if(draft.stage==='Plan'){
 add(intro,'p','wa-muted','Collect ideas before writing. Your notes stay separate from your answer.');
 const board=add(panel,'div','wa-plan-board');for(const f of fields){const card=add(board,'div','wa-plan-card');card.dataset.tone=f.tone;const l=add(card,'label','',f.title);l.htmlFor='wa-note-'+f.key;if(draft.mode!=='Gold')add(card,'p','',f.question);const x=add(card,'textarea','wa-writing-input');x.id=l.htmlFor;x.rows=2;x.value=draft.notes[f.key];x.placeholder=draft.mode==='Bronze'?f.starter:'';x.oninput=()=>{draft.notes[f.key]=x.value;save();};}
 btn(panel,'Continue to Write →',()=>go('Write'),'wa-action wa-next');
 }else if(draft.stage==='Write'){
 const tools=add(panel,'div','wa-editor-tools');add(tools,'p','wa-muted','Continuous prose · title optional');const focusBtn=btn(tools,focusMode?'Exit focus mode':'Focus mode',()=>{focusMode=!focusMode;shell.dataset.focus=String(focusMode);focusBtn.textContent=focusMode?'Exit focus mode':'Focus mode';focusBtn.setAttribute('aria-pressed',String(focusMode));});focusBtn.setAttribute('aria-pressed',String(focusMode));
 const focusBrief=add(panel,'details','wa-focus-brief');add(focusBrief,'summary','','Full exam task');add(focusBrief,'p','',task.prompt);
 const l=add(panel,'label','wa-visually-hidden','Write your review in continuous prose');l.htmlFor='wa-answer-editor';const x=add(panel,'textarea','wa-writing-input wa-editor');x.id=l.htmlFor;x.rows=9;x.value=draft.answer;x.placeholder='Start writing your review here…';
 const meter=add(panel,'div','wa-word-meter');const count=add(meter,'p','wa-count');count.setAttribute('aria-live','polite');const track=add(meter,'div','wa-word-track');track.setAttribute('aria-hidden','true');const target=add(track,'div','wa-word-target');const scale=Math.ceil(max*1.25);target.style.left=(min/scale*100)+'%';target.style.width=((max-min)/scale*100)+'%';const fill=add(track,'div','wa-word-fill');function update(){const w=wordStatus(draft.answer,min,max);count.textContent=w.count+' words · '+(w.status==='within'?'Within target':w.status==='below'?'Below target':'Above target')+' ('+min+'–'+max+')';meter.dataset.status=w.status;fill.style.width=Math.min(100,w.count/scale*100)+'%';}update();x.oninput=()=>{draft.answer=x.value;update();save();};
 btn(panel,'Review my writing →',()=>{if(!draft.answer.trim()){x.focus();return;}go('Review');},'wa-action wa-next');
 }else{
 const w=wordStatus(draft.answer,min,max);add(intro,'p','wa-count',w.count+' words · '+w.status[0].toUpperCase()+w.status.slice(1)+' target ('+min+'–'+max+')');
 const check=add(panel,'section','wa-review-checklist');add(check,'h3','','Before you finish');for(const q of config.selfCheck){const l=add(check,'label','wa-check');const c=add(l,'input','');c.type='checkbox';l.append(' '+q);}
 const compare=add(panel,'div','wa-compare');for(const [title,text] of [['Original draft',draft.original??'No revision snapshot yet.'],['Current revised draft',draft.answer]]){const box=add(compare,'article','wa-revision-card');add(box,'h3','',title);add(box,'p','wa-prose',text||'No writing yet.');}
 btn(panel,'Revise my writing →',()=>go('Write'),'wa-action wa-next');
 }
 const footer=add(shell,'footer','wa-workspace-footer');add(footer,'span','wa-muted','Local preview · drafts are saved on this browser for this account.');const manage=add(footer,'details','');add(manage,'summary','','Manage draft');btn(manage,'Clear this task’s preview draft',()=>{if(root.ownerDocument.defaultView.confirm('Delete your local preview draft and notes for this task?')){if(store.clear()){load();draw(true);}else status.textContent='Could not clear browser storage.';}});
 if(focus){heading.focus({preventScroll:true});heading.scrollIntoView({block:'nearest'});}
 }
 draw();
}

import {reviewStudioConfig} from '../content/review-studio-config.js?v=3';
import {createDraftStore,wordStatus} from '../engine/drafts.js';
import {renderExamReference} from './structure.js?v=8';
import {renderArtwork,reviewArtwork} from './editorial-art.js?v=8';
import {el as add,action as btn} from './lesson-shell.js?v=6';
const support={Bronze:'Fully guided',Silver:'Some guidance',Gold:'Independent'};
export function renderStudio(root,options){return renderWorkspace(root,{...options,config:reviewStudioConfig,reference:parent=>renderExamReference(parent,{includeToolkit:false}),artwork:reviewArtwork.studio});}
export function renderWorkspace(root,{accountId,onBack,initialTask,initialMode,config,reference,artwork}){
 const {tasks,fields,min,max,answerLabel,answerPlaceholder}=config;let task=tasks.find(t=>t.id===initialTask)||tasks[0];let store,draft,status,saved=null,focusMode=false;const checkedByTask=new Map();let phraseCategory=0;
 const view=root.ownerDocument.defaultView;
 let storage;try{storage=root.ownerDocument.defaultView.localStorage;}catch{storage=null;}
 function load(){store=createDraftStore(storage,accountId,task);draft=store.load();saved=null;}
 load();if(initialMode)draft.mode=initialMode;
 function showSaveStatus(){
  const message=saved===null?'Draft saves on this browser':saved?'✓ Draft saved on this browser':'Draft not saved — copy your work before leaving.';
  if(status.textContent!==message)status.textContent=message;
  status.dataset.saved=String(saved!==false);
 }
 function save(){saved=store.save(draft);showSaveStatus();}
 function go(stage){draft.stage=stage;if(stage==='Review'&&draft.answer.trim()&&draft.original===null)draft.original=draft.answer;save();draw(true);}
 function draw(focus=false){
 const companionOpen=root.querySelector('.wa-companion')?.open??view.matchMedia('(min-width: 700px)').matches;
 root.replaceChildren();const shell=add(root,'div','wa-shell wa-studio wa-workspace');shell.dataset.focus=String(focusMode&&draft.stage==='Write');shell.dataset.stage=draft.stage.toLowerCase();
 const nav=add(shell,'nav','wa-nav');btn(nav,'← Academy',()=>{save();onBack();});add(nav,'span','wa-preview','Staff preview');
 const hero=add(shell,'header','wa-studio-hero');const copy=add(hero,'div','');add(copy,'p','wa-kicker',config.genre.toUpperCase());add(copy,'h1','','The Writing Studio');add(copy,'p','wa-studio-tagline','Find your voice. Make every word count.');if(artwork?.hero)renderArtwork(hero,artwork.hero,'studio-hero');
 const top=add(shell,'div','wa-workspace-toolbar');const tabs=add(top,'nav','wa-workspace-tabs');tabs.setAttribute('aria-label','Writing stages');
 for(const [i,stage] of ['Plan','Write','Review'].entries()){const b=btn(tabs,'',()=>go(stage),'wa-workspace-tab');add(b,'span','wa-studio-step',String(i+1).padStart(2,'0'));add(b,'span','',stage);b.setAttribute('aria-pressed',String(draft.stage===stage));}
 status=add(top,'p','wa-save-status');status.setAttribute('role','status');showSaveStatus();
 const grid=add(shell,'div','wa-workspace-grid');const sidebar=add(grid,'aside','wa-workspace-sidebar');const companion=add(sidebar,'details','wa-companion');companion.open=companionOpen;
 add(companion,'summary','wa-studio-companion-title','Writing companion');
 const brief=add(companion,'section','wa-brief');
 const label=add(brief,'label','','Writing task');label.htmlFor='wa-task';const sel=add(brief,'select','wa-writing-input');sel.id='wa-task';for(const t of tasks){const o=add(sel,'option','',t.title);o.value=t.id;}sel.value=task.id;sel.onchange=()=>{save();task=tasks.find(t=>t.id===sel.value);load();draw();root.querySelector('#wa-task').focus();};
 const mission=add(brief,'div','wa-studio-mission');add(mission,'p','wa-studio-eyebrow','YOUR MISSION');add(mission,'p','wa-studio-scenario',task.shortMission||task.scenario||task.prompt);const meta=add(mission,'div','wa-studio-brief-meta');add(meta,'span','',min+'–'+max+' words');add(meta,'span','',task.publication);
 const modes=add(companion,'section','wa-support-panel');add(modes,'h3','','Support level');const modebar=add(modes,'div','wa-studio-tabs');const modeButtons=[];
 const guidanceUpdates=[];const draftUpdates=[];let insertPhrase=null;
 for(const m of Object.keys(support)){const b=btn(modebar,m,()=>{if(draft.mode===m)return;const sx=view.scrollX,sy=view.scrollY,sideY=sidebar.scrollTop;draft.mode=m;refreshSupport();save();view.scrollTo(sx,sy);sidebar.scrollTop=sideY;});b.dataset.mode=m;modeButtons.push(b);}
 const supportText=add(modes,'p','wa-muted');
 const help=add(companion,'section','wa-studio-help');add(help,'p','wa-studio-eyebrow','NEED A HAND?');
 function resource(title,icon){const d=add(help,'details','wa-studio-resource');const summary=add(d,'summary','');const mark=add(summary,'span','wa-studio-resource-icon',icon);mark.setAttribute('aria-hidden','true');add(summary,'span','',title);return d;}
 const full=resource('Full exam task','▤');add(full,'p','',task.prompt);
 if(task.ideas?.length){const options=resource('Idea bank','✦');const ideas=add(options,'div','wa-idea-chips');for(const idea of task.ideas)add(ideas,'span','',idea);}
 if(draft.stage!=='Plan'){const notes=resource('My planning notes','✎');for(const f of fields){if(draft.notes[f.key]?.trim()){add(notes,'strong','',f.title);add(notes,'p','wa-prose',draft.notes[f.key]);}}if(!Object.values(draft.notes).some(v=>v.trim()))add(notes,'p','wa-muted','No notes yet.');btn(notes,'Edit plan',()=>go('Plan'));}
 const tips=resource('Useful language','Aa');const tipContent=add(tips,'div','wa-studio-tip-content');
 const exam=resource('Exam checklist','✓');
 const checks=config.quickChecks||config.selfCheck;const checked=checkedByTask.get(task.id)||new Set();checkedByTask.set(task.id,checked);
 const marks=add(exam,'div','wa-check-marks');for(const mark of config.markBreakdown||[]){const tile=add(marks,'div','');add(tile,'strong','',String(mark.marks));add(tile,'span','',mark.label);}
 const checkHeader=add(exam,'div','wa-check-header');add(checkHeader,'strong','','Ready to finish?');const checkCount=add(checkHeader,'span','');
 const track=add(exam,'div','wa-check-track');track.setAttribute('role','progressbar');track.setAttribute('aria-label','Self-check progress');track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax',String(checks.length+1));const checkFill=add(track,'span','');
 const checklist=add(exam,'div','wa-quick-checklist');const checkInputs=[];
 function refreshChecks(){const within=wordStatus(draft.answer,min,max).status==='within';const total=checked.size+Number(within);checkCount.textContent=total+'/'+(checks.length+1);track.setAttribute('aria-valuenow',String(total));checkFill.style.width=(total/(checks.length+1)*100)+'%';for(const [i,input] of checkInputs.entries())input.checked=checked.has(i);wordCheck.dataset.done=String(within);wordIcon.textContent=within?'✓':'○';}
 checks.forEach((q,i)=>{const l=add(checklist,'label','wa-quick-check');const c=add(l,'input','');c.type='checkbox';checkInputs.push(c);add(l,'span','',q);c.onchange=()=>{if(c.checked)checked.add(i);else checked.delete(i);refreshChecks();};});
 const wordCheck=add(checklist,'div','wa-quick-check wa-auto-check');const wordIcon=add(wordCheck,'span','wa-auto-icon');add(wordCheck,'span','',min+'–'+max+' words (automatic)');
 if(config.blueprint){const blueprint=resource(config.blueprint.title,'▤');const board=add(blueprint,'div','wa-studio-blueprint');add(board,'p','wa-blueprint-exam',config.blueprint.exam);for(const move of config.blueprint.moves){const row=add(board,'div','wa-blueprint-move');row.dataset.tone=move.tone;const icon=add(row,'span','wa-blueprint-icon',move.icon);icon.setAttribute('aria-hidden','true');const copy=add(row,'div','wa-blueprint-copy');add(copy,'strong','',move.label);add(copy,'span','',move.hint);}add(board,'p','wa-blueprint-reminder',config.blueprint.reminder);}else if(reference){const detail=add(exam,'details','wa-studio-reference-detail');add(detail,'summary','','More exam guidance');const referenceBox=reference(detail);referenceBox.classList.add('wa-workspace-reference');}
 refreshChecks();draftUpdates.push(()=>{checked.clear();refreshChecks();});
 function renderPhrases(){
  tipContent.replaceChildren();const categories=config.phraseBank;
  if(!categories?.length){for(const tip of config.languageSupport[draft.mode])add(tipContent,'p','',tip);return;}
  phraseCategory=Math.min(phraseCategory,categories.length-1);
  const tabs=add(tipContent,'div','wa-phrase-tabs');for(const [i,cat] of categories.entries()){const b=btn(tabs,cat.label,()=>{phraseCategory=i;renderPhrases();tipContent.querySelectorAll('.wa-phrase-tab')[i]?.focus({preventScroll:true});},'wa-action wa-phrase-tab');b.setAttribute('aria-pressed',String(i===phraseCategory));}
  const list=add(tipContent,'div','wa-phrase-list');const message=add(tipContent,'p','wa-phrase-status');message.setAttribute('role','status');
  for(const phrase of categories[phraseCategory].phrases[draft.mode]||[]){const row=add(list,'div','wa-phrase-row');add(row,'span','',phrase+' …');const button=btn(row,draft.stage==='Write'?'Insert':'Copy',async()=>{if(draft.stage==='Write'&&insertPhrase){insertPhrase(phrase);message.textContent='Phrase inserted.';return;}try{await view.navigator.clipboard.writeText(phrase);message.textContent='Copied.';}catch{message.textContent='Copy unavailable. Select the phrase manually.';}},'wa-action wa-phrase-use');button.setAttribute('aria-label',(draft.stage==='Write'?'Insert ':'Copy ')+phrase);}
 }
 function refreshSupport(){modeButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===draft.mode)));supportText.textContent=support[draft.mode];renderPhrases();guidanceUpdates.forEach(update=>update());}
 refreshSupport();
 const resources=[...help.querySelectorAll(':scope > details')];
 if(draft.stage==='Plan'){const ideas=resources.find(d=>d.querySelector('summary')?.textContent.includes('Idea bank'));if(ideas)ideas.open=true;}else if(draft.stage==='Write')tips.open=true;else exam.open=true;
 const panel=add(grid,'section','wa-workspace-main');const stageIntro=add(panel,'div','wa-workspace-intro');const intro=add(stageIntro,'div','');const heading=add(intro,'h2','wa-workspace-heading',draft.stage==='Plan'?(config.genre==='Review Writing'?'Plan your review':'Plan your writing'):draft.stage==='Write'?'Write your draft':'Refine your writing');heading.tabIndex=-1;
 if(draft.stage!=='Write'&&artwork?.context)renderArtwork(stageIntro,artwork.context,'studio-context');
 if(draft.stage==='Plan'){
 add(intro,'p','wa-muted','Make a few quick notes.');
 const toolbar=add(panel,'div','wa-plan-toolbar');const progress=add(toolbar,'div','wa-plan-progress-track');progress.setAttribute('role','progressbar');progress.setAttribute('aria-label','Planning notes');progress.setAttribute('aria-valuemin','0');progress.setAttribute('aria-valuemax',String(fields.length));const fill=add(progress,'span','');
 const board=add(panel,'div','wa-plan-board');const cards=[];
 function refreshPlan(){const count=fields.filter(f=>draft.notes[f.key]?.trim()).length;progress.setAttribute('aria-valuenow',String(count));progress.setAttribute('aria-valuetext',count+' of '+fields.length+' notes filled');fill.style.width=(count/Math.max(1,fields.length)*100)+'%';cards.forEach(({card,field,marker})=>{const filled=!!draft.notes[field.key]?.trim();card.dataset.filled=String(filled);marker.hidden=!filled;});}
 for(const [i,f] of fields.entries()){const reader=f.tone==='reader';const card=add(board,'div','wa-plan-card');card.dataset.tone=f.tone;const header=add(card,'div','wa-plan-card-header');const index=add(header,'span','wa-plan-number',reader?'◎':String(fields.slice(0,i+1).filter(item=>item.tone!=='reader').length).padStart(2,'0'));index.setAttribute('aria-hidden','true');const copy=add(header,'div','wa-plan-card-copy');const l=add(copy,'label','',reader?'Audience':f.title);l.htmlFor='wa-note-'+f.key;const question=add(copy,'p','wa-plan-guidance',reader?'Who are you writing for?':f.question);const marker=add(header,'span','wa-plan-note-state','✓');marker.setAttribute('aria-label','Note added');const x=add(card,'textarea','wa-writing-input');x.id=l.htmlFor;x.rows=reader?1:2;x.value=draft.notes[f.key]??'';const update=()=>{question.style.visibility=draft.mode==='Gold'?'hidden':'visible';question.setAttribute('aria-hidden',String(draft.mode==='Gold'));x.placeholder=draft.mode==='Bronze'?f.starter:'';};guidanceUpdates.push(update);update();cards.push({card,field:f,marker});x.oninput=()=>{draft.notes[f.key]=x.value;refreshPlan();save();};}
 refreshPlan();const footer=add(panel,'div','wa-plan-footer');add(footer,'p','wa-muted','Notes only — not your final answer.');btn(footer,'Continue to Write →',()=>go('Write'),'wa-action wa-next');
 }else if(draft.stage==='Write'){
 add(intro,'p','wa-muted','Make every word count.');
 const desk=add(panel,'section','wa-write-desk');
 const tools=add(desk,'div','wa-write-toolbar');const toolLeft=add(tools,'div','wa-write-tool-group');
 add(toolLeft,'span','wa-studio-eyebrow','YOUR DRAFT');
 const quick=add(desk,'div','wa-write-quick-reference');quick.hidden=true;
 const briefPanel=add(quick,'section','');add(briefPanel,'h3','','Exam task');add(briefPanel,'p','',task.prompt);briefPanel.hidden=true;
 const notesPanel=add(quick,'section','');add(notesPanel,'h3','','Planning notes');notesPanel.hidden=true;
 let hasNotes=false;for(const f of fields){if(draft.notes[f.key]?.trim()){hasNotes=true;const row=add(notesPanel,'div','wa-write-note');add(row,'strong','',f.title);add(row,'p','wa-prose',draft.notes[f.key]);}}
 if(!hasNotes)add(notesPanel,'p','wa-muted','No planning notes yet.');
 btn(notesPanel,'Edit plan →',()=>go('Plan'),'wa-action wa-write-tool');
 const close=btn(quick,'Close ×',()=>toggleReference(null),'wa-action wa-write-tool wa-write-ref-close');let currentReference=null;
 const toolRight=add(tools,'div','wa-write-tool-group');const refs=[];
 function toggleReference(name){currentReference=currentReference===name?null:name;quick.hidden=!currentReference;briefPanel.hidden=currentReference!=='brief';notesPanel.hidden=currentReference!=='notes';refs.forEach(({name,b})=>b.setAttribute('aria-expanded',String(currentReference===name)));}
 for(const [name,label] of [['brief','Exam task'],['notes','My notes']]){const b=btn(toolRight,label,()=>toggleReference(name),'wa-action wa-write-tool');b.setAttribute('aria-expanded','false');refs.push({name,b});}
 const focusBtn=btn(toolRight,focusMode?'Exit focus':'Focus',()=>{const sy=view.scrollY,sx=view.scrollX;focusMode=!focusMode;shell.dataset.focus=String(focusMode);focusBtn.textContent=focusMode?'Exit focus':'Focus';focusBtn.setAttribute('aria-pressed',String(focusMode));view.scrollTo(sx,sy);},'wa-action wa-write-tool wa-write-focus');focusBtn.setAttribute('aria-pressed',String(focusMode));
 const paper=add(desk,'div','wa-write-paper');const l=add(paper,'label','wa-visually-hidden',answerLabel);l.htmlFor='wa-answer-editor';const x=add(paper,'textarea','wa-writing-input wa-editor');x.id=l.htmlFor;x.rows=9;x.value=draft.answer;x.placeholder=answerPlaceholder;
 const foot=add(desk,'div','wa-write-meter-footer');const meter=add(foot,'div','wa-word-meter wa-write-meter');const meterTop=add(meter,'div','wa-write-meter-top');const count=add(meterTop,'p','wa-count');count.setAttribute('aria-live','polite');const targetText=add(meterTop,'span','wa-write-target-label',min+'–'+max+' target');
 const track=add(meter,'div','wa-word-track');track.setAttribute('aria-hidden','true');const target=add(track,'div','wa-word-target');const scale=Math.ceil(max*1.25);target.style.left=(min/scale*100)+'%';target.style.width=((max-min)/scale*100)+'%';const fill=add(track,'div','wa-word-fill');
 const stateText=add(meter,'p','wa-write-meter-status');
 const bottom=add(panel,'div','wa-write-bottom');add(bottom,'p','wa-muted','Write in paragraphs. A title is optional.');const review=btn(bottom,'Review my writing →',()=>{if(!draft.answer.trim()){x.focus();return;}go('Review');},'wa-action wa-next');
 function update(){const w=wordStatus(draft.answer,min,max);count.textContent=w.count+' word'+(w.count===1?'':'s');stateText.textContent=w.status==='within'?'✓ Within target':w.status==='below'?(min-w.count)+' more to reach target':(w.count-max)+' over target';meter.dataset.status=w.status;fill.style.width=Math.min(100,w.count/scale*100)+'%';review.disabled=!draft.answer.trim();}
 update();x.oninput=()=>{draft.answer=x.value;update();draftUpdates.forEach(fn=>fn());save();};insertPhrase=phrase=>{const start=x.selectionStart,end=x.selectionEnd;const before=x.value.slice(0,start),after=x.value.slice(end);const leading=before&&!/\s$/.test(before)?' ':'';const trailing=after&&/^\s/.test(after)?'':' ';x.setRangeText(leading+phrase+trailing,start,end,'end');x.oninput();x.focus({preventScroll:true});};

 }else{
 const w=wordStatus(draft.answer,min,max);add(intro,'p','wa-count',w.count+' words · '+w.status[0].toUpperCase()+w.status.slice(1)+' target ('+min+'–'+max+')');
 const check=add(panel,'section','wa-review-checklist');add(check,'h3','','Before you finish');add(check,'p','wa-muted','Use the exam checklist to review your draft.');btn(check,'Open exam checklist',()=>{companion.open=true;exam.open=true;exam.querySelector('summary').focus({preventScroll:true});exam.scrollIntoView({block:'nearest'});});
 const compare=add(panel,'div','wa-compare');for(const [title,text] of [['Original draft',draft.original??'No revision snapshot yet.'],['Current revised draft',draft.answer]]){const box=add(compare,'article','wa-revision-card');add(box,'h3','',title);add(box,'p','wa-prose',text||'No writing yet.');}
 btn(panel,'Revise my writing →',()=>go('Write'),'wa-action wa-next');
 }
 const footer=add(shell,'footer','wa-workspace-footer');add(footer,'span','wa-muted','Local preview · drafts are saved on this browser for this account.');const manage=add(footer,'details','');add(manage,'summary','','Manage draft');btn(manage,'Clear this task’s preview draft',()=>{if(root.ownerDocument.defaultView.confirm('Delete your local preview draft and notes for this task?')){if(store.clear()){checkedByTask.delete(task.id);load();draw(true);}else status.textContent='Could not clear browser storage.';}});
 if(focus){heading.focus({preventScroll:true});heading.scrollIntoView({block:'nearest'});}
 }
 draw();
}

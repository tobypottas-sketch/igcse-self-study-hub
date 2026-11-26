import {exam,examModels,examMocks,modelContext} from '../content/review-exam-20261125.js';
import {newExamAttempt} from '../engine/exam-attempt.js';
import {renderExamWorkshop} from './exam-workshop.js?v=2';
import {editing,editingModels} from '../content/review-editing.js?v=2';
import {cohesion,cohesionModels} from '../content/review-cohesion.js?v=2';
import * as development from '../content/review-development-v1.js';
import * as expression from '../content/review-expression-v1.js';
import {extraReviewModels} from '../content/review-explore-models.js?v=1';
import {mountLesson,el,action} from './lesson-shell.js?v=13';
import {reviewArtwork} from './editorial-art.js?v=15';
import {companions} from '../content/review-active-v2.js';
import {pathways} from '../content/review-pedagogy.js?v=5';
import {newWritingRun,renderResponseWorkshop} from './response-workshop.js?v=3';
import {guidedTask,independentTask,toolkit} from '../content/review-guided-v1.js';
import {blueprint,model} from '../content/review-structure-v1.js';
import {scoreItem,validateActivities,shuffledIndexes,hasWritingAttempt,writingComplete} from '../engine/activities.js?v=3';

function add(p,tag,cls,t){const n=p.ownerDocument.createElement(tag);n.className=cls||'';if(t)n.textContent=t;p.append(n);return n;}
function button(p,t,fn){const n=add(p,'button','wa-action',t);n.type='button';n.addEventListener('click',fn);return n;}
export function renderExamReference(p,{includeToolkit=true}={}){
 const s=add(p,'aside','wa-exam-reference wa-exam-reference-v2');
 const bar=add(s,'div','wa-reference-bar');const identity=add(bar,'div','wa-reference-identity');add(identity,'span','wa-reference-label','CAMBRIDGE IGCSE ESL 0511');add(identity,'strong','','Paper 1 · Exercise 6');
 const facts=add(bar,'div','wa-reference-facts');for(const [value,label] of [['120–160','words'],['6','content marks'],['9','language marks']]){const fact=add(facts,'div','wa-reference-fact');add(fact,'b','',value);add(fact,'span','',label);}
 const d=add(s,'details','wa-reference-disclosure');const summary=add(d,'summary','');add(summary,'span','wa-reference-summary-icon','▤').setAttribute('aria-hidden','true');add(summary,'span','','Review blueprint & exam checklist');
 const layout=add(d,'div','wa-reference-layout');const moves=add(layout,'section','');add(moves,'h3','','Four writing moves');const grid=add(moves,'div','wa-reference-moves');
 const short=[['Introduce','Set the scene and give a first impression.'],['Describe','Select relevant, specific details.'],['Evaluate','Explain strengths and weaknesses.'],['Recommend','Say who would enjoy it, and why.']];
 short.forEach(([title,hint],i)=>{const card=add(grid,'div','wa-reference-move');card.dataset.move=String(i);add(card,'span','wa-reference-number',String(i+1).padStart(2,'0'));const copy=add(card,'div','');add(copy,'h4','',title);add(copy,'p','',hint);});
 add(moves,'p','wa-reference-reminder','Four writing moves, not four compulsory paragraphs. A title is optional.');
 const check=add(layout,'section','wa-reference-check');add(check,'h3','','Before you finish');const checks=['Cover all task requirements.','Write for the intended audience.','Support opinions with specific details.','Use clear paragraphs and natural, accurate language.','Give a useful recommendation.','Stay within 120–160 words.'];for(const item of checks){const row=add(check,'div','wa-reference-check-row');add(row,'span','','✓').setAttribute('aria-hidden','true');add(row,'span','',item);}
 if(includeToolkit){const k=add(d,'details','wa-reference-toolkit');add(k,'summary','','Useful language');const list=add(k,'div','wa-reference-phrases');for(const x of toolkit)add(list,'span','',x);}
 const more=add(d,'details','wa-reference-detail');add(more,'summary','','Detailed guidance');const ol=add(more,'ol','');for(const x of blueprint)add(ol,'li','',x.title+': '+x.guidance);add(more,'p','','Description and evaluation may share a paragraph. Choose a register that suits the audience. Paragraph count and balance of praise and criticism are flexible.');

 return s;
}
export function renderStructure(root,onBack,onStudio){return renderPathway(root,onBack,onStudio);}
export function renderExpression(root,onBack,onStudio){return renderPathway(root,onBack,onStudio,expression);}
export function renderDevelopment(root,onBack,onStudio){return renderPathway(root,onBack,onStudio,development);}
export function renderCohesion(root,onBack,onStudio){return renderPathway(root,onBack,onStudio,cohesion);}
export function renderEditing(root,onBack,onStudio){return renderPathway(root,onBack,onStudio,editing);}
export function renderExam(root,onBack,onStudio){return renderPathway(root,onBack,onStudio,exam);}
function renderPathway(root,onBack,onStudio,config=null){
 const isExam=config===exam;
 const isExpression=config===expression, isDevelopment=config===development, hasLens=!!config;
 const editorialModels=isExam?examModels:config===editing?editingModels:config===cohesion?cohesionModels:null;
 const pathwayKey=isExam?'exam':config===editing?'editing':config===cohesion?'cohesion':isDevelopment?'development':isExpression?'expression':'structure';
 const course=editorialModels?config:pathways[pathwayKey];
 const goldTasks=[course.gold].flat();
 const practice=validateActivities(course.practice);
 const checkpoint=validateActivities([{id:pathwayKey+'-transfer',type:'choice',items:[course.analysis].flat()}])[0];
 const stageCompanions=editorialModels?course.companions:(config?.companions??companions).map((tip,index)=>index===4
  ? ['Work independently','Read the new situation carefully and apply what you learnt.','Use the criteria to reflect on your own writing.']
  : tip);
 const state={model:0,paragraph:0,identified:new Set(),discovered:new Set(),discoveryIndex:0,
  annotations:new Map(),exploreDrafts:new Map(),applyIndex:0,applications:course.apply.map(isExam?newExamAttempt:newWritingRun),
  attempts:new Map(),active:null,discoverNotes:new Map(),goldIndex:0,gold:goldTasks.map(newWritingRun),transfer:newWritingRun(),mockIndex:0,mocks:examMocks.map(newExamAttempt)};
 const gold={id:pathwayKey+'-writing',title:course.goldTitle??goldTasks[0].title,level:'Gold'};
 const challenges=[...practice,gold];
 const baseModels=[{...model,category:'Café',sentenceTips:[['Names the café, establishes the time and explains the reason for visiting.','Introduces an initial evaluation through the atmosphere and welcome.'],['Describes location, seating and menu.','Provides specific examples of food.','Evaluates affordability for students.'],['Balances crowding with praise for staff.','Balances a specific delay against food quality.','Explains the practical benefit of a quiet corner.'],['Identifies a suitable audience and reason.','Offers advice about timing.']],purposes:['Introduction','Description','Evaluation','Recommendation']},{...guidedTask,title:'Willow Kitchen',category:'Restaurant',purposes:['Introduction','Evaluation','Evaluation','Recommendation'],sentenceTips:[['Establishes the reason for visiting.','Adds useful location and price information.'],['States a clear preference.','Supports the judgement with sensory detail.','Explains why the portion was suitable.','Adds a specific example of flexibility.'],['Signals a shift to criticism.','Explains the wait and the effect of noise.'],['Identifies an audience and a reason.','Offers practical advice addressing the drawback.']]},...extraReviewModels];
 const models=isDevelopment?config.developmentModels(baseModels):isExpression?config.expressionModels(baseModels):baseModels;
 const hasFinished = a => !!state.attempts.get(a.id)?.done;
 function quiz(host,a,onFinish){
  let run=state.attempts.get(a.id);
  if(!run){
   run={index:0,correct:0,selected:null,order:[],checked:false,done:false,
    displays:a.items.map(item=>shuffledIndexes(item.options.length))};
   state.attempts.set(a.id,run);
  }
  function draw(moveFocus=false){
   host.replaceChildren();
   el(host,'p','wa-kicker',a.level ? a.level+' / '+a.title : 'Analysis');
   if(run.done){
    const done=el(host,'h3','','Analysis complete');
    done.tabIndex=-1;
    el(host,'p','wa-score',run.correct+' / '+a.items.length+' objective decisions correct');
    if(a!==checkpoint)action(host,'Try again',()=>{
     state.attempts.delete(a.id);
     onFinish();
     quiz(host,a,onFinish);
     host.querySelector('h3').focus();
    });
    if(moveFocus)done.focus();
    return;
   }
   const item=a.items[run.index];
   const ordered=a.type==='order';
   const display=run.displays[run.index];
   el(host,'p','wa-muted','Question '+(run.index+1)+' of '+a.items.length);
   const prompt=el(host,'h3','wa-question-prompt',item.prompt);
   prompt.tabIndex=-1;
   const options=el(host,'div','wa-options');
   const feedback=el(host,'div','wa-answer');
   feedback.setAttribute('role','status');
   display.forEach(i=>{
    const position=run.order.indexOf(i);
    const button=action(options,(ordered&&position>=0?(position+1)+'. ':'')+item.options[i],()=>{
     if(ordered)run.order.push(i);
     else run.selected=i;
     draw();
     const selected=optionButtonsAfterDraw(i);
     selected?.focus();
    },'wa-action wa-option');
    button.dataset.option=String(i);
    button.disabled=ordered&&position>=0;
    if(!ordered)button.setAttribute('aria-pressed',String(run.selected===i));
    button.disabled=button.disabled||run.checked;
   });
   function optionButtonsAfterDraw(index){
    return host.querySelector('[data-option="'+index+'"]:not(:disabled)')
     || host.querySelector('.wa-option:not(:disabled)') || host.querySelector('.wa-next:not(:disabled)');
   }
   const response=ordered?run.order:run.selected;
   if(run.checked){
    const ok=scoreItem(item,response);
    feedback.dataset.result=ok?'correct':'retry';
    el(feedback,'p','',ok?'That fits the criterion.':'Review the reasoning below.');
    if(item.explanations){
     const reasons=el(feedback,'ul','');
     display.forEach(index=>{
      const reason=el(reasons,'li','');
      el(reason,'strong','',item.options[index]+' ');
      reason.append(item.explanations[index]);
     });
    }else el(feedback,'p','',item.rationale);
    action(host,run.index+1===a.items.length?'Finish analysis':'Next question',()=>{
     run.index++;
     run.checked=false;
     run.selected=null;
     run.order=[];
     if(run.index===a.items.length)run.done=true;
     draw(true);
     if(run.done)onFinish();
    },'wa-action wa-next');
    if(moveFocus){feedback.tabIndex=-1;feedback.focus();}
   }else{
    const check=action(host,'Check answer',()=>{
     run.checked=true;
     if(scoreItem(item,response))run.correct++;
     draw(true);
    },'wa-action wa-next');
    check.disabled=ordered?run.order.length!==item.options.length:run.selected===null;
    if(ordered)action(host,'Undo last selection',()=>{run.order.pop();draw();host.querySelector('.wa-option:not(:disabled)')?.focus();}).disabled=!run.order.length;
    if(moveFocus)prompt.focus();
   }
  }
  draw();
 }
 mountLesson(root,{title:course.title??(isDevelopment?'Idea Development':isExpression?'Vocabulary & Expression':'Structure & Organisation'),pathwayNumber:course.number??(isDevelopment?'03':isExpression?'02':'01'),artwork:reviewArtwork.pathways[pathwayKey]??reviewArtwork.pathways.structure,onBack,reference:renderExamReference,companions:stageCompanions,renderStage(body,i,ctx){
 const shell=body.closest('.wa-shell');
 shell.classList.toggle('wa-independent-stage',isExam&&i===4);

 if(course.passes && (isExam?i===0:[0,3,4].includes(i))){
  const guide=el(body,'details','wa-explore-brief wa-editing-passes');
  el(guide,'summary','','Four-pass editing strategy');
  const steps=el(guide,'ol','');
  for(const [name,description] of course.passes){
   const step=el(steps,'li','');
   el(step,'strong','',name+'. ');
   step.append(description);
  }
  el(guide,'p','wa-muted','Use these passes to check your draft. Give the most time to the weakness that most affects the reader.');
 }
 if(i===0){
 const host=el(body,'div','wa-discovery');
 function draw(){
  host.replaceChildren();
  const n=state.discoveryIndex,item=course.discover[n];
  el(host,'p','wa-kicker','Contrast '+(n+1)+' / '+course.discover.length);
  const prompt=el(host,'h3','',item.prompt);
  prompt.tabIndex=-1;
  const contrast=el(host,'div','wa-options');
  el(contrast,'p','wa-apply-source',item.before);
  el(contrast,'p','wa-apply-source',item.after);
  function recordReflection(){
   state.discovered.add(n);
   if(state.discovered.size===course.discover.length)ctx.complete();
  }
  {
   const label=el(host,'label','wa-apply-instruction','Write a short observation.');
   const response=el(label,'textarea','wa-writing-input wa-apply-input');
   response.rows=2;
   response.value=state.discoverNotes.get(n)??'';
   response.readOnly=state.discovered.has(n);
   response.oninput=()=>state.discoverNotes.set(n,response.value);
   const feedback=el(host,'p','wa-answer');
   feedback.setAttribute('role','status');
   const reveal=action(host,'Check what changed',()=>{
    if(!hasWritingAttempt(response.value,3)){
     feedback.textContent='Write at least three words about what changed.';
     return;
    }
    recordReflection();
    response.readOnly=true;
    reveal.hidden=true;
    feedback.textContent=item.principle;
    feedback.tabIndex=-1;
    feedback.focus();
   });
   reveal.hidden=response.readOnly;
   if(response.readOnly)feedback.textContent=item.principle;
  }
  const controls=el(host,'div','wa-stage-foot');
  const prev=action(controls,'← Previous contrast',()=>{state.discoveryIndex--;draw().focus();});
  prev.disabled=n===0;
  const next=action(controls,'Next contrast →',()=>{state.discoveryIndex++;draw().focus();});
  next.disabled=n===course.discover.length-1;
  return prompt;
 }draw();
 }else if(i===1){
 const desk=el(body,'div','wa-explore-desk');
 el(desk,'p','wa-explore-intro','Read a paragraph and explain one editorial decision. Then compare your reasoning and inspect the sentences.');
 if(isExam)el(desk,'p','wa-muted','Complete three paragraph investigations of your choice. Read the complete review alongside its task.');
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
  const brief=el(host,'details','wa-explore-brief');brief.open=briefOpen;el(brief,'summary','','Exam brief');el(brief,'p','',m.prompt);
  if(isExam){
   const [audience,publication]=modelContext[m.title];
   el(brief,'p','wa-muted','Audience: '+audience+' · Publication: '+publication);
   el(brief,'p','wa-muted','Content: relevance, task fulfilment, development, audience and purpose. Language: vocabulary, grammar, organisation, cohesion and register.');
  }
  brief.addEventListener('toggle',()=>{briefOpen=brief.open;});
  const paper=el(host,'article','wa-explore-paper');const meta=el(paper,'div','wa-explore-paper-meta');el(meta,'span','wa-explore-eyebrow','MODEL '+String(state.model+1).padStart(2,'0')+' / '+m.category.toUpperCase());el(meta,'span','wa-explore-position','Paragraph '+(n+1)+' of '+m.paragraphs.length);
  el(paper,'h3','wa-explore-headline',m.title);
  const progress=el(paper,'div','wa-explore-progress');progress.setAttribute('aria-hidden','true');m.paragraphs.forEach((_,j)=>{const segment=el(progress,'span','');segment.dataset.current=String(j===n);segment.dataset.done=String(state.identified.has(state.model+':'+j));});
  const prose=el(paper,'p','wa-model-text wa-explore-prose');
  const pieces=m.paragraphs[n].match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g)||[m.paragraphs[n]];
  const selected=state.annotations.get(key)||new Set();state.annotations.set(key,selected);
  const note=el(paper,'div','wa-explore-note');el(note,'span','wa-explore-eyebrow','EDITOR’S NOTE');const detail=el(note,'p','','Write your editorial note to open the sentence annotations.');detail.setAttribute('role','status');
  const lens=editorialModels?.[m.title][n]??m.expression?.[n];const sentenceTips=hasLens?pieces.map((sentence,j)=>sentence.toLowerCase().includes(lens.phrase.toLowerCase())?lens.rationale:(isDevelopment||editorialModels)?m.sentenceTips?.[n]?.[j]||'Consider what this detail adds to the judgement.':'Read this sentence in context. Look for precise, natural word combinations.'):m.sentenceTips?.[n];let unlocked=state.identified.has(key);const sentenceButtons=[];
  pieces.forEach((sentence,j)=>{const b=el(prose,'span','wa-phrase wa-explore-sentence',sentence.trim());b.setAttribute('role','button');b.tabIndex=unlocked?0:-1;b.setAttribute('aria-disabled',String(!unlocked));const activate=()=>{if(!unlocked)return;selected.clear();selected.add(j);sentenceButtons.forEach((item,k)=>item.setAttribute('aria-pressed',String(k===j)));detail.textContent=sentenceTips?.[j]||m.notes[n];};b.onclick=activate;b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}};b.setAttribute('aria-pressed',String(selected.has(j)));sentenceButtons.push(b);prose.append(' ');});
  if(unlocked)detail.textContent=selected.size?(sentenceTips?.[[...selected][0]]||m.notes[n]):'Select a sentence to examine its contribution.';
  const question=el(host,'section','wa-explore-question');
  const editorialPrompt=editorialModels?lens.prompt:isExpression
   ? 'Find “'+lens.phrase+'” in context. Suggest an alternative, then explain what would change in meaning, emphasis or tone.'
   : isDevelopment
    ? 'Find “'+lens.phrase+'” in context. Explain which judgement it supports or what it helps the reader decide.'
    : [
     'Imagine swapping the first and last sentences. Explain what the reader would learn first and how that would change the flow.',
     'Choose two details to keep together. Explain what their connection helps the reader understand.',
     'Pick a sentence to move into a paragraph on its own. Explain which link or contrast the reader would lose.'
    ][(n+state.model)%3];
  const label=el(question,'label','wa-question-prompt',editorialPrompt);
  const response=el(label,'textarea','wa-writing-input wa-apply-input');
  response.rows=3;
  response.value=state.exploreDrafts.get(key)??'';
  response.readOnly=unlocked;
  response.oninput=()=>state.exploreDrafts.set(key,response.value);
  const feedback=el(question,'p','wa-answer');
  feedback.setAttribute('role','status');
  const reveal=action(question,'Compare with the editor’s note',()=>{
   const minimum=lens?.min??10;
   if(!hasWritingAttempt(response.value,minimum)){
    feedback.textContent=editorialModels?'Write at least '+minimum+' words in response to the prompt.':'Write at least ten words explaining your decision.';
    return;
   }
   state.identified.add(key);
   unlocked=true;
   response.readOnly=true;
   reveal.hidden=true;
   sentenceButtons.forEach(button=>{button.tabIndex=0;button.setAttribute('aria-disabled','false');});
   progress.children[n].dataset.done='true';
   detail.textContent='Select a sentence to examine its contribution.';
   feedback.textContent=lens?.rationale??m.notes[n];
   if(isExam?state.identified.size>=3:m.paragraphs.every((_,j)=>state.identified.has(state.model+':'+j)))ctx.complete();
  });
  reveal.hidden=unlocked;
  if(unlocked)feedback.textContent=lens?.rationale??m.notes[n];
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
 const complete=a=>a===gold ? goldTasks.every((task,j)=>writingComplete(state.gold[j],task)) : hasFinished(a);
 function syncCards(){
  count.textContent=challenges.filter(complete).length+' / '+challenges.length+' complete';
  buttons.forEach((button,j)=>{
   const a=challenges[j];
   button.setAttribute('aria-pressed',String(state.active===a.id));
   button.dataset.done=String(complete(a));
   button.querySelector('.wa-practise-card-status').textContent=complete(a)?'✓ Complete':a===gold?(goldTasks.length>1?goldTasks.length+' writing tasks':'Writing task'):a.items.length+' decision'+(a.items.length===1?'':'s');
  });
  if(challenges.every(complete))ctx.complete();
  else ctx.incomplete();
 }
 function open(a,focus=false){
  state.active=a.id;
  if(a===gold){
   if(goldTasks.length===1)renderResponseWorkshop(host,goldTasks[0],state.gold[0],syncCards);
   else renderGold();
  }
  else quiz(host,a,syncCards);
  syncCards();
  if(focus){const heading=host.querySelector('h3');heading.focus({preventScroll:true});}
 }
 function renderGold(focus=false){
  host.replaceChildren();
  const index=state.goldIndex;
  el(host,'p','wa-kicker','Gold · Task '+(index+1)+' of '+goldTasks.length);
  const workshop=el(host,'div','wa-apply-work');
  const title=renderResponseWorkshop(workshop,goldTasks[index],state.gold[index],syncCards);
  const controls=el(host,'div','wa-stage-foot');
  action(controls,'← Previous Gold task',()=>{state.goldIndex--;renderGold(true);}).disabled=index===0;
  action(controls,'Next Gold task →',()=>{state.goldIndex++;renderGold(true);}).disabled=index===goldTasks.length-1;
  if(focus)title.focus({preventScroll:true});
 }
 challenges.forEach((a,j)=>{
  const button=action(cards,'',()=>open(a,true),'wa-action wa-practise-card');
  button.dataset.level=a.level.toLowerCase();
  const top=el(button,'span','wa-practise-card-top');
  el(top,'span','wa-practise-icon',icons[j]).setAttribute('aria-hidden','true');
  el(top,'span','wa-practise-level',a.level);
  el(button,'strong','wa-practise-card-title',a.title);
  el(button,'span','wa-practise-card-status');
  buttons.push(button);
 });
 if(state.active)open(challenges.find(a=>a.id===state.active));
 else{syncCards();el(host,'p','wa-practise-empty','Select a challenge above to begin.');}
 }else if(i===3){
 const host=el(body,'div','wa-apply-work wa-apply-desk');
 function draw(){
  host.replaceChildren();
  const n=state.applyIndex;
  const header=el(host,'div','wa-apply-header');
  el(header,'span','wa-apply-eyebrow','Writing workshop');
  el(header,'span','wa-apply-position','Task '+(n+1)+' of '+course.apply.length);
  const meter=el(host,'div','wa-apply-progress');
  meter.setAttribute('aria-hidden','true');
  course.apply.forEach((_,j)=>{el(meter,'span','').dataset.current=String(j===n);});
  const workshop=el(host,'div','');
  function progress(){
   const done=course.apply.map((task,j)=>isExam?state.applications[j].complete:writingComplete(state.applications[j],task));
   done.forEach((value,j)=>{meter.children[j].dataset.done=String(value);});
   if(done.every(Boolean))ctx.complete();
   else ctx.incomplete();
  }
  const attempt=state.applications[n];
  const title=isExam?renderExamWorkshop(workshop,course.apply[n],attempt,{
   passes:course.passes,onProgress:complete=>{attempt.complete=complete;progress();}
  }):renderResponseWorkshop(workshop,course.apply[n],attempt,progress);
  progress();
  const controls=el(host,'div','wa-stage-foot wa-apply-controls');
  const prev=action(controls,'← Previous task',()=>{state.applyIndex--;draw().focus();});
  prev.disabled=n===0;
  const next=action(controls,'Next task →',()=>{state.applyIndex++;draw().focus();});
  next.disabled=n===course.apply.length-1;
  return title;
 }draw();
 }else if(isExam){
 const desk=el(body,'div','wa-master-desk');
 const decision=el(desk,'div','wa-question wa-master-question');
 const writing=el(desk,'div','wa-apply-work wa-exam-workshop');
 function showMock(){
  if(!hasFinished(checkpoint))return;
  writing.replaceChildren();
  const label=el(writing,'label','wa-apply-instruction','Mock review task');
  const picker=el(label,'select','wa-writing-input');
  examMocks.forEach((task,index)=>{
   const option=el(picker,'option','',task.title);
   option.value=String(index);
  });
  picker.value=String(state.mockIndex);
  picker.onchange=()=>{state.mockIndex=Number(picker.value);showMock();writing.querySelector('select').focus();};
  const mock=examMocks[state.mockIndex];
  const attempt=state.mocks[state.mockIndex];
  renderExamWorkshop(el(writing,'div',''),{...mock,timer:true},attempt,{
   master:true,passes:course.passes,
   onProgress:complete=>{
    attempt.complete=complete;
    if(state.mocks.some(item=>item.complete))ctx.complete();
    else ctx.incomplete();
    return ctx.allComplete();
   },
   onStudio:()=>onStudio({initialTask:independentTask.id,initialMode:'Gold'})
  });
 }
 quiz(decision,checkpoint,showMock);
 showMock();
 }else{
 const desk=el(body,'div','wa-master-desk');
 el(desk,'p','wa-master-intro','Make an editorial decision, then apply the skill in a fresh review situation.');
 const decision=el(desk,'div','wa-question wa-master-question');
 const writing=el(desk,'div','wa-apply-work');
 function showWriting(){
  if(!hasFinished(checkpoint))return;
  renderResponseWorkshop(writing,course.master,state.transfer,complete=>{
   if(complete)ctx.complete();
   else ctx.incomplete();
  });
 }
 quiz(decision,checkpoint,()=>{
  showWriting();
 });
 showWriting();
 const end=el(desk,'details','wa-master-studio');
 const summary=el(end,'summary','');
 el(summary,'strong','','Write a full review in Writing Studio');
 const content=el(end,'div','wa-master-studio-content');
 el(content,'p','',independentTask.prompt);
 action(content,'Open Writing Studio →',()=>onStudio({initialTask:independentTask.id,initialMode:'Gold'}),'wa-action wa-master-launch');
 }
 }});
}

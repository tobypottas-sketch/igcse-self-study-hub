import {el, action} from './lesson-shell.js';
import {checkRecognition, objectiveEvidence, recognitionResult} from '../engine/recognition.js?v=2';

export function renderRecognition(host, item, run, onCheck) {
 if (item.context) el(host,'p','wa-question-source',item.context);
 if (item.original) {
  const source=el(host,'div','wa-question-source wa-revision-source');
  el(source,'strong','','Original');
  el(source,'p','',item.original);
 }
 if (item.gap) {
  const source=el(host,'p','wa-question-source');
  source.append(item.gap[0]);
  const gap=el(source,'span','wa-vocabulary-gap','____');
  gap.setAttribute('aria-label','missing word');
  source.append(item.gap[1]);
 }
 const prompt = el(host,'h3','wa-question-prompt wa-question-clear',item.prompt);
 prompt.tabIndex = -1;
 const options = el(host,'div',item.sentenceSelection?'wa-options wa-sentence-extract'
  :item.original?'wa-options wa-revision-options':item.plans?'wa-options wa-plan-options':'wa-options');
 options.setAttribute('role','group');
 options.setAttribute('aria-label',item.prompt);
 const tools = el(host,'div','wa-stage-foot');
 const feedback = el(host,'div','wa-answer wa-recognition-feedback');
 feedback.setAttribute('role','status');
 feedback.tabIndex = -1;
 let selection = run.selection??null;
 const display=item.sentenceSelection?item.optionIds:run.order;
 const buttons = display.map((key,position)=>{
  const index=item.optionIds.indexOf(key);
  const b = action(options,item.plans?'':item.options[index],()=>{
   selection = key;
   run.selection = key;
   syncControls();
  },'wa-action wa-option');
  if(item.plans){
   el(b,'span','wa-plan-title','Plan '+String.fromCharCode(65+position));
   item.plans[index].forEach((paragraph,n)=>{
    const group=el(b,'span','wa-plan-group');
    el(group,'strong','','Paragraph '+(n+1));
    for(const detail of paragraph)el(group,'span','',detail);
   });
  }
  b.dataset.optionId = key;
  b.dataset.option = String(index);
  return b;
 });
 const check = action(tools,'Check answer',()=>{
  if (!checkRecognition(item,run,selection)) return;
  selection = null;
  delete run.selection;
  showFeedback();
  feedback.focus({preventScroll:true});
  feedback.scrollIntoView({block:'nearest',inline:'nearest'});
  onCheck();
 },'wa-action wa-next');

 function syncControls() {
  const done = recognitionResult(item,run)!=='pending';
  buttons.forEach((button,index)=>{
   const key = display[index];
   button.disabled = done || run.attempts.includes(key);
   button.setAttribute('aria-pressed',String(selection===key));
  });
  check.disabled = done || selection===null;
  check.hidden = done;
 }

 function showFeedback() {
  syncControls();
  feedback.replaceChildren();
  feedback.dataset.evidence = objectiveEvidence(item,run);
  if (!run.attempts.length) return;
  const result = recognitionResult(item,run);
  const last = item.optionIds.indexOf(run.attempts.at(-1));
  feedback.dataset.result = result==='first'||result==='retry'?'correct':'retry';
  const labels = {pending:'Try another answer',first:'Correct on your first try',retry:'Correct after a retry',supported:'Completed with an explanation'};
  el(feedback,'strong','',labels[result]);
  el(feedback,'p','',item.explanations[last]);
  if (result==='supported') {
   const best=item.plans?'Plan '+String.fromCharCode(65+display.indexOf(item.optionIds[item.answer])):item.options[item.answer];
   el(feedback,'p','','Best answer: '+best);
   el(feedback,'p','',item.rationale);
  }
  if (result!=='pending' && item.tip) el(feedback,'p','wa-muted',item.tip);
 }
 showFeedback();
 return prompt;
}

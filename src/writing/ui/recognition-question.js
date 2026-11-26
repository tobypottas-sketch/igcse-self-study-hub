import {el, action} from './lesson-shell.js';
import {checkRecognition, recognitionResult} from '../engine/recognition.js';

export function renderRecognition(host, item, run, onCheck) {
 const prompt = el(host,'h3','wa-question-prompt',item.prompt);
 prompt.tabIndex = -1;
 if (item.context) el(host,'p','wa-apply-source',item.context);
 const options = el(host,'div','wa-options');
 options.setAttribute('role','group');
 options.setAttribute('aria-label',item.prompt);
 const tools = el(host,'div','wa-stage-foot');
 const feedback = el(host,'div','wa-answer wa-recognition-feedback');
 feedback.setAttribute('role','status');
 feedback.tabIndex = -1;
 let selection = null;
 const buttons = run.order.map(key=>{
  const b = action(options,item.options[item.optionIds.indexOf(key)],()=>{
   selection = key;
   syncControls();
  },'wa-action wa-option');
  b.dataset.optionId = key;
  return b;
 });
 const check = action(tools,'Check answer',()=>{
  if (!checkRecognition(item,run,selection)) return;
  selection = null;
  showFeedback();
  feedback.focus({preventScroll:true});
  feedback.scrollIntoView({block:'nearest',inline:'nearest'});
  onCheck();
 },'wa-action wa-next');

 function syncControls() {
  const done = recognitionResult(item,run)!=='pending';
  buttons.forEach((button,index)=>{
   const key = run.order[index];
   button.disabled = done || run.attempts.includes(key);
   button.setAttribute('aria-pressed',String(selection===key));
  });
  check.disabled = done || selection===null;
  check.hidden = done;
 }

 function showFeedback() {
  syncControls();
  feedback.replaceChildren();
  if (!run.attempts.length) return;
  const result = recognitionResult(item,run);
  const last = item.optionIds.indexOf(run.attempts.at(-1));
  feedback.dataset.result = result==='first'||result==='retry'?'correct':'retry';
  const labels = {pending:'Try another answer',first:'Correct on your first try',retry:'Correct after a retry',supported:'Completed with an explanation'};
  el(feedback,'strong','',labels[result]);
  el(feedback,'p','',item.explanations[last]);
  if (result==='supported') {
   el(feedback,'p','','Best answer: '+item.options[item.answer]);
   el(feedback,'p','',item.rationale);
  }
  if (result!=='pending' && item.tip) el(feedback,'p','wa-muted',item.tip);
 }
 showFeedback();
 return prompt;
}

import {el, action} from './lesson-shell.js';

export function renderSentenceSequence(host,item,display,run,redraw){
 const bank=el(host,'section','wa-sequence-bank');
 el(bank,'h4','','Available sentences');
 const choices=el(bank,'div','wa-options');
 const response=el(host,'section','wa-sequence-response');
 const heading=el(response,'h4','','Your sequence');
 heading.tabIndex=-1;
 heading.dataset.sequenceHeading='';
 const list=el(response,'ol','wa-sequence-list');
 if(!run.order.length)el(response,'p','wa-muted','Select a sentence to start.');
 function change(update,selector){
  update();
  redraw();
  (host.querySelector(selector)??host.querySelector('[data-sequence-heading]'))?.focus();
 }
 if(!run.checked)for(const index of display){
  if(run.order.includes(index))continue;
  const b=action(choices,item.options[index],()=>change(()=>run.order.push(index),'[data-remove="'+index+'"]'),'wa-action wa-option');
  b.dataset.option=String(index);
 }
 if(!choices.childElementCount)bank.hidden=true;
 run.order.forEach((index,position)=>{
  const row=el(list,'li','wa-sequence-row');
  el(row,'p','',item.options[index]);
  if(run.checked)return;
  const controls=el(row,'div','wa-sequence-controls');
  function move(delta){
   const other=position+delta;
   change(()=>{[run.order[position],run.order[other]]=[run.order[other],run.order[position]];},'[data-remove="'+index+'"]');
  }
  const up=action(controls,'Move up',()=>move(-1));
  up.disabled=position===0;
  up.setAttribute('aria-label','Move sentence '+(position+1)+' up');
  const down=action(controls,'Move down',()=>move(1));
  down.disabled=position===run.order.length-1;
  down.setAttribute('aria-label','Move sentence '+(position+1)+' down');
  const remove=action(controls,'Remove',()=>change(()=>run.order.splice(position,1),'[data-option="'+index+'"]'));
  remove.dataset.remove=String(index);
  remove.setAttribute('aria-label','Remove sentence '+(position+1));
 });
}

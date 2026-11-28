// Vocabulary pathway adapter; production activation is separately gated.
import {createActiveLearningClock} from '../tracking/active-learning-clock.js';
const pathways=new Set(['meaning','context','word_families','paraphrasing','precision_use','spelling_recall']);
export function vocabularyTimingContext(state,screen) {
  if(screen!=='question'||state.preview||state.finishPending||state.handoffPending||!state.session||!state.current)return null;
  // Some curated fallbacks carry a browser-only language-bank ID. Only
  // count them when the app also resolves the persisted unit activity.
  if(state.current.question?.contentSource==='language_bank'&&!state.current.activityRecord)return null;
  const pathway=state.pathwayId ?? (state.mixedReview?state.current.pathwayPlan?.pathwayId:null);
  const unit=state.currentUnitNumber;
  const activity=state.current.question?.contentId;
  if(!pathways.has(pathway)||!Number.isInteger(unit)||unit<1||typeof activity!=='string'||!activity)return null;
  return {module:'vocabulary_paraphrase',unit,pathway,activity,mode:'practice',occurrence:state.current.target?.occurrenceId??null,questionType:state.current.question?.type??null,source:state.current.activityRecord?'unit_activity':state.current.context?'context':'item'};
}
export function createVocabularyTiming({clock=createActiveLearningClock(),outbox,onError=()=>{}}) {
  let key=null, current=null, retained=[];
  function save(){
    retained.push(...clock.drain());
    if(!retained.length)return;
    try{while(retained.length){const chunk=retained.slice(0,120);outbox.enqueue(chunk);retained=retained.slice(chunk.length);}}catch(e){onError(e);}
  }
  function sync(state,screen){
    const context=vocabularyTimingContext(state,screen),next=context?JSON.stringify(context):null;
    if(next===key&&(!context||current===state.current))return;
    clock.leave();save();key=next;current=context?state.current:null;
    if(context){clock.enter(context);clock.interaction();}
  }
  return {
    sync,
    interaction(trusted){if(trusted===true&&key)clock.interaction();},
    visibility(value){clock.visibility(value);if(!value)save();},
    focus(value){clock.focus(value);if(!value)save();},
    tick(){clock.tick();},
    flush(){save();return Promise.resolve().then(()=>outbox.flush()).catch(onError);},
    stop(){clock.leave();key=null;current=null;save();}
  };
}

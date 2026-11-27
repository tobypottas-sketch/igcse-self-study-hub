// Isolated Vocabulary pathway adapter. No production entrypoint imports this yet.
import {createActiveLearningClock} from '../tracking/active-learning-clock.js';
const pathways=new Set(['meaning','context','word-families','paraphrasing','precision-use','spelling-recall']);
export function vocabularyTimingContext(state,screen) {
  if(screen!=='question'||state.preview||state.finishPending||state.handoffPending||!state.session||!state.current)return null;
  const pathway=state.pathwayId ?? (state.mixedReview?state.current.pathwayPlan?.pathwayId:null);
  const unit=state.currentUnitNumber;
  const activity=state.current.question?.contentId;
  if(!pathways.has(pathway)||!Number.isInteger(unit)||unit<1||typeof activity!=='string'||!activity)return null;
  return {module:'vocabulary_paraphrase',unit,pathway,activity,mode:'practice'};
}
export function createVocabularyTiming({clock=createActiveLearningClock(),outbox,onError=()=>{}}) {
  let key=null, retained=[];
  function save(){
    retained.push(...clock.drain());
    if(!retained.length)return;
    try{outbox.enqueue(retained);retained=[];}catch(e){onError(e);}
  }
  function sync(state,screen){
    const context=vocabularyTimingContext(state,screen),next=context?JSON.stringify(context):null;
    if(next===key)return;
    clock.leave();save();key=next;
    if(context){clock.enter(context);clock.interaction();}
  }
  return {
    sync,
    interaction(trusted){if(trusted===true&&key)clock.interaction();},
    visibility(value){clock.visibility(value);if(!value)save();},
    focus(value){clock.focus(value);if(!value)save();},
    tick(){clock.tick();},
    flush(){save();return Promise.resolve().then(()=>outbox.flush()).catch(onError);},
    stop(){clock.leave();key=null;save();}
  };
}

// Browser lifecycle bridge. No network transport is supplied by default.
import {createVocabularyTiming} from './active-learning-adapter.js';
import {createDurableTimingOutbox} from '../tracking/durable-timing-outbox.js';
import {createActiveLearningTransport} from '../tracking/active-learning-transport.js';
export const VOCABULARY_ACTIVE_TIME_V2_ENABLED=false;
export function installVocabularyTiming({enabled=false,root,state,doc,win,outbox,clock,eligible=()=>true,onError=()=>{}}) {
  if(!enabled||state.preview||!root||!outbox)return null;
  const timer=createVocabularyTiming({outbox,clock,onError});
  const listeners=[];let disposed=false;
  const listen=(target,type,fn,options)=>{target.addEventListener(type,fn,options);listeners.push(()=>target.removeEventListener(type,fn,options));};
  let stoppedQuestion=null, suspended=false;
  const sync=()=>{
    if(disposed||suspended)return;
    const question=Boolean(root.querySelector('[data-study-question]'));
    if(!question || stoppedQuestion!==state.current)stoppedQuestion=null;
    timer.sync(state,question&&stoppedQuestion!==state.current&&eligible(state)?'question':'other');
  };
  const visibility=()=>timer.visibility(doc.visibilityState==='visible');
  const focus=()=>timer.focus(doc.hasFocus());
  const flush=()=>{void timer.flush();};
  const stop=()=>{stoppedQuestion=state.current;timer.stop();flush();};
  const taskInput=e=>{
    if(suspended||!e.isTrusted||!e.target?.closest?.('[data-study-question]'))return;
    sync();timer.interaction(true);
  };
  for(const type of ['pointerdown','keydown','input','touchstart'])listen(root,type,taskInput,{passive:true,capture:true});
  listen(doc,'visibilitychange',()=>{visibility();if(doc.hidden)flush();});
  listen(win,'blur',()=>{focus();flush();});
  listen(win,'focus',focus);
  listen(win,'pagehide',()=>{suspended=true;timer.visibility(false);timer.focus(false);flush();});
  listen(win,'pageshow',()=>{suspended=false;visibility();focus();sync();});
  listen(win,'online',flush);
  const observer=new win.MutationObserver(sync);
  observer.observe(root,{childList:true,subtree:true});
  const tick=win.setInterval(()=>{sync();timer.tick();},5000);
  const save=win.setInterval(flush,30000);
  visibility();focus();sync();
  return {sync,stop,dispose(){if(disposed)return;disposed=true;stop();observer.disconnect();win.clearInterval(tick);win.clearInterval(save);listeners.forEach(fn=>fn());}};
}

// Entry point stays inert unless the compile-time gate and explicit enable are true.
export async function startGatedVocabularyTiming({enabled=false,root,state,doc,win}) {
  if(!VOCABULARY_ACTIVE_TIME_V2_ENABLED||!enabled||state.preview||!state.userKey)return null;
  const userId=state.userKey;
  const {data:eligible,error}=await state.client.rpc('active_learning_v2_pilot_enabled',{p_student:userId});
  if(error||eligible!==true||state.userKey!==userId)return null;
  const {data:identity,error:identityError}=await state.client.auth.getUser();
  if(identityError||identity?.user?.id!==userId||state.userKey!==userId)return null;
  let current=userId;
  const send=createActiveLearningTransport({client:state.client,onTrackingDisabled:()=>deactivate()});
  const outbox=createDurableTimingOutbox({storage:win.localStorage,userId,currentUserId:()=>current,send,id:()=>win.crypto.randomUUID()});
  const bridge=installVocabularyTiming({enabled:true,root,state,doc,win,outbox,
    eligible:state=>state.timingSetMembers?.unit===state.currentUnitNumber&&
      state.timingSetMembers.rows.some(row=>row.occurrence_id===state.current?.target?.occurrenceId&&
        row.pathway_id===(state.pathwayId??(state.mixedReview?state.current?.pathwayPlan?.pathwayId:null))),
    onError:()=>console.warn('Active learning timing save deferred.')});
  function deactivate(){
    if(current===null)return;
    bridge?.stop();
    current=null;
    // Do not invoke Supabase auth methods synchronously in the auth callback.
    win.setTimeout(()=>{bridge?.dispose();data?.subscription?.unsubscribe();},0);
  }
  const {data}=state.client.auth.onAuthStateChange((_event,session)=>{
    if(session?.user?.id!==userId)deactivate();
  });
  return bridge;
}

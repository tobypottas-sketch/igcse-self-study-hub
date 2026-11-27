// Browser lifecycle bridge. No network transport is supplied by default.
import {createVocabularyTiming} from './active-learning-adapter.js';
export const VOCABULARY_ACTIVE_TIME_V2_ENABLED=false;
export function installVocabularyTiming({enabled=false,root,state,doc,win,outbox,clock,onError=()=>{}}) {
  if(!enabled||state.preview||!root||!outbox)return null;
  const timer=createVocabularyTiming({outbox,clock,onError});
  const listeners=[];let disposed=false;
  const listen=(target,type,fn,options)=>{target.addEventListener(type,fn,options);listeners.push(()=>target.removeEventListener(type,fn,options));};
  const sync=()=>timer.sync(state,root.querySelector('[data-study-question]')?'question':'other');
  const visibility=()=>timer.visibility(doc.visibilityState==='visible');
  const focus=()=>timer.focus(doc.hasFocus());
  const flush=()=>{void timer.flush();};
  const stop=()=>{timer.stop();flush();};
  const taskInput=e=>{
    if(!e.isTrusted||!e.target?.closest?.('[data-study-question]'))return;
    sync();timer.interaction(true);
  };
  for(const type of ['pointerdown','keydown','input','touchstart'])listen(root,type,taskInput,{passive:true,capture:true});
  listen(doc,'visibilitychange',()=>{visibility();if(doc.hidden)flush();});
  listen(win,'blur',()=>{focus();flush();});
  listen(win,'focus',focus);
  listen(win,'pagehide',()=>{stop();});
  listen(win,'pageshow',()=>{visibility();focus();sync();});
  listen(win,'online',flush);
  const observer=new win.MutationObserver(sync);
  observer.observe(root,{childList:true,subtree:true});
  const tick=win.setInterval(()=>{sync();timer.tick();},5000);
  const save=win.setInterval(flush,30000);
  visibility();focus();sync();
  return {sync,stop,dispose(){if(disposed)return;disposed=true;stop();observer.disconnect();win.clearInterval(tick);win.clearInterval(save);listeners.forEach(fn=>fn());}};
}

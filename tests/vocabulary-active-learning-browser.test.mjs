import test from 'node:test';
import assert from 'node:assert/strict';
import {installVocabularyTiming,VOCABULARY_ACTIVE_TIME_V2_ENABLED} from '../src/vocabulary/active-learning-browser.js';
import {createActiveLearningClock} from '../src/tracking/active-learning-clock.js';
import {vocabularyTimingContext} from '../src/vocabulary/active-learning-adapter.js';
function fixture(){
 let t=0,visible=true,focused=true,question=false;const saved=[],intervals=[],listeners=new Map();let observer;
 const target=()=>({addEventListener(k,f){listeners.set(this.id+k,f);},removeEventListener(k){listeners.delete(this.id+k);}});
 const doc={...target(),id:'doc',get visibilityState(){return visible?'visible':'hidden'},get hidden(){return !visible},hasFocus:()=>focused};
 const win={...target(),id:'win',MutationObserver:class{constructor(f){observer=f;}observe(){}disconnect(){}},setInterval(f){intervals.push(f);return intervals.length;},clearInterval(){}};
 const root={...target(),id:'root',querySelector:()=>question?{}:null};
 const state={currentUnitNumber:3,pathwayId:'word_families',session:{},current:{question:{contentId:'a'}}};
 const clock=createActiveLearningClock({now:()=>t,wallNow:()=>100000+t});
 const args={root,state,doc,win,clock,outbox:{enqueue:r=>saved.push(...r),flush:async()=>{}}};
 return {args,saved,state,screen:v=>{question=v;observer?.();},step:ms=>{t+=ms;intervals[0]?.();},visible:v=>{visible=v;listeners.get('docvisibilitychange')?.();},event:(k,e)=>listeners.get(k)?.(e),total:()=>saved.reduce((n,r)=>n+r.endMs-r.startMs,0)};
}
test('disabled gate and missing transport create no listeners or timer',()=>{const f=fixture();assert.equal(VOCABULARY_ACTIVE_TIME_V2_ENABLED,false);assert.equal(installVocabularyTiming(f.args),null);assert.equal(installVocabularyTiming({...f.args,enabled:true,outbox:null}),null);});
test('canonical underscore pathway identifiers supported',()=>{const f=fixture();for(const p of ['word_families','precision_use','spelling_recall']){f.state.pathwayId=p;assert.equal(vocabularyTimingContext(f.state,'question').pathway,p);}});
test('real question lifecycle bridge excludes home and hidden time',()=>{const f=fixture(),a=installVocabularyTiming({...f.args,enabled:true});f.step(5000);f.screen(true);f.step(3000);f.visible(false);f.step(5000);f.visible(true);f.step(2000);f.event('rootpointerdown',{isTrusted:true,target:{closest:()=>({})}});f.step(4000);f.screen(false);f.step(5000);a.dispose();assert.equal(f.total(),7000);});
test('untrusted input cannot restart an idle clock',()=>{const f=fixture(),a=installVocabularyTiming({...f.args,enabled:true});f.screen(true);for(let i=0;i<4;i++)f.step(30000);f.event('rootpointerdown',{isTrusted:false,target:{closest:()=>({})}});f.step(5000);a.dispose();assert.equal(f.total(),120000);});

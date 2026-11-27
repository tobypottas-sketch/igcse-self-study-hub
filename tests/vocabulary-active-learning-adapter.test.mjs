import test from 'node:test';
import assert from 'node:assert/strict';
import {createVocabularyTiming,vocabularyTimingContext} from '../src/vocabulary/active-learning-adapter.js';
import {createActiveLearningClock} from '../src/tracking/active-learning-clock.js';
function fixture(){
 let t=0;const saved=[];let fail=false;
 const clock=createActiveLearningClock({now:()=>t,wallNow:()=>100000+t});
 const adapter=createVocabularyTiming({clock,outbox:{enqueue:r=>{if(fail)throw Error('quota');saved.push(...r);},flush:async()=>{} }});
 const state={currentUnitNumber:3,pathwayId:'meaning',session:{},current:{question:{contentId:'activity-a'}}};
 adapter.visibility(true);adapter.focus(true);
 return {adapter,state,saved,step:ms=>{t+=ms;adapter.tick();},fail:v=>fail=v};
}
test('home, loading, finish and staff preview excluded',()=>{const f=fixture();for(const screen of ['home','loading','summary']){f.adapter.sync(f.state,screen);f.step(5000);}f.state.preview=true;f.adapter.sync(f.state,'question');f.step(5000);f.adapter.stop();assert.equal(f.saved.length,0);});
test('question and feedback rerender preserve clock, navigation stops it',()=>{const f=fixture();f.adapter.sync(f.state,'question');f.step(5000);f.adapter.sync(f.state,'question');f.step(3000);f.adapter.sync(f.state,'summary');f.step(5000);f.adapter.stop();assert.equal(f.saved.reduce((n,r)=>n+r.endMs-r.startMs,0),8000);});
test('mixed practice attributes only resolved pathways',()=>{const f=fixture();f.state.pathwayId=null;f.state.mixedReview=true;assert.equal(vocabularyTimingContext(f.state,'question'),null);f.state.current.pathwayPlan={pathwayId:'context'};assert.equal(vocabularyTimingContext(f.state,'question').pathway,'context');});
test('new question saves previous activity before switching',()=>{const f=fixture();f.adapter.sync(f.state,'question');f.step(3000);f.state.current.question.contentId='activity-b';f.adapter.sync(f.state,'question');f.step(2000);f.adapter.stop();assert.deepEqual(f.saved.map(r=>[r.context.activity,r.endMs-r.startMs]),[['activity-a',3000],['activity-b',2000]]);});
test('storage failure retains unsaved intervals for retry',async()=>{const f=fixture();f.adapter.sync(f.state,'question');f.step(3000);f.fail(true);f.adapter.stop();assert.equal(f.saved.length,0);f.fail(false);await f.adapter.flush();assert.equal(f.saved.reduce((n,r)=>n+r.endMs-r.startMs,0),3000);});

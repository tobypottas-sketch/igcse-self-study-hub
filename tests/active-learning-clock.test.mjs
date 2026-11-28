import test from 'node:test';
import assert from 'node:assert/strict';
import { createActiveLearningClock, createTimingOutbox } from '../src/tracking/active-learning-clock.js';
function fixture() {
  let t=0,w=1000000;
  const clock=createActiveLearningClock({now:()=>t,wallNow:()=>w});
  const step=(ms,wall=ms)=>{t+=ms;w+=wall;clock.tick();};
  const enter=(activity='a',module='vocabulary_paraphrase')=>clock.enter({module,activity,pathway:'meaning',unit:1});
  const total=()=>clock.drain().reduce((n,x)=>n+x.endMs-x.startMs,0);
  clock.visibility(true);clock.focus(true);
  return {clock,step,enter,total};
}
test('no time outside activity or before interaction',()=>{const f=fixture();f.step(10000);f.enter();f.step(10000);assert.equal(f.total(),0);});
test('measures real elapsed time and clips idle boundary',()=>{const f=fixture();f.enter();f.clock.interaction();for(let i=0;i<4;i++)f.step(29000);f.step(10000);assert.equal(f.total(),120000);});
test('hidden or unfocused time never counts; resume needs evidence',()=>{const f=fixture();f.enter();f.clock.interaction();f.step(5000);f.clock.visibility(false);f.step(5000);f.clock.visibility(true);f.step(5000);f.clock.interaction();f.step(3000);f.clock.focus(false);f.step(5000);assert.equal(f.total(),8000);});
test('transition attributes intervals to original activity',()=>{const f=fixture();f.enter('a');f.clock.interaction();f.step(2000);f.enter('b');f.clock.interaction();f.step(3000);f.clock.leave();f.step(5000);const r=f.clock.drain();assert.deepEqual(r.map(x=>[x.context.activity,x.endMs-x.startMs]),[['a',2000],['b',3000]]);});
test('suspension and wall jumps are excluded',()=>{const f=fixture();f.enter();f.clock.interaction();f.step(40000);f.step(5000,90000);assert.equal(f.total(),0);});
test('listening playback permits uninterrupted eligible audio only',()=>{const f=fixture();f.enter('a','listening');f.clock.playback(true);for(let i=0;i<5;i++)f.step(30000);f.clock.playback(false);f.step(10000);assert.equal(f.total(),150000);});
test('non-listening playback does not grant time',()=>{const f=fixture();f.enter();f.clock.playback(true);f.step(10000);assert.equal(f.total(),0);});
test('failed transport retains same batch ID; concurrent flush is serial',async()=>{let fail=true,calls=[];const o=createTimingOutbox({id:()=> 'batch1',send:async b=>{calls.push(b.id);if(fail)throw Error('offline');}});o.enqueue([{context:{module:'reading'},startMs:1,endMs:2}]);const p=o.flush();assert.equal(p,o.flush());await assert.rejects(p);assert.equal(o.size(),1);fail=false;await o.flush();assert.equal(o.size(),0);assert.deepEqual(calls,['batch1','batch1']);});

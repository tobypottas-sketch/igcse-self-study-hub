import test from 'node:test';
import assert from 'node:assert/strict';
import {createActiveLearningTransport} from '../src/tracking/active-learning-transport.js';
import {createActiveLearningClock} from '../src/tracking/active-learning-clock.js';
const batch={id:'b',intervals:[{},{}]};
function fixture(){const calls=[];let who='s',reply={batchId:'b',accepted:2,inserted:2};const client={auth:{getUser:async()=>({data:{user:{id:who}}})},functions:{invoke:async(name,opts)=>{calls.push({name,opts});return {data:reply};}}};return {send:createActiveLearningTransport({client}),calls,who:v=>who=v,reply:v=>reply=v};}
test('auth-bound request and exact acknowledgement',async()=>{const f=fixture();await f.send(batch,'s');assert.equal(f.calls[0].opts.body.expectedUserId,'s');});
test('identity switch prevents request',async()=>{const f=fixture();f.who('other');await assert.rejects(f.send(batch,'s'));assert.equal(f.calls.length,0);});
test('replay acknowledgement accepted; partial or wrong batch rejected',async()=>{const f=fixture();f.reply({batchId:'b',accepted:2,inserted:0});await f.send(batch,'s');for(const r of [{batchId:'wrong',accepted:2,inserted:2},{batchId:'b',accepted:1,inserted:1},{batchId:'b',accepted:2,inserted:1}]){f.reply(r);await assert.rejects(f.send(batch,'s'));}});
test('fractional monotonic clock produces integer server-compatible intervals',()=>{let t=0;const c=createActiveLearningClock({now:()=>t,wallNow:()=>1000+Math.floor(t)});c.visibility(true);c.focus(true);c.enter({module:'reading',activity:'a'});c.interaction();t=1234.567;const [r]=c.drain();assert.equal(r.startMs,1000);assert.equal(r.endMs,2234);});

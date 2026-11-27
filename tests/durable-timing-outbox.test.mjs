import test from 'node:test';
import assert from 'node:assert/strict';
import {createDurableTimingOutbox} from '../src/tracking/durable-timing-outbox.js';
function fixture(){
 const m=new Map();let who='a',time=1000,n=0,fail=false;const sent=[];
 const storage={get length(){return m.size},key:i=>[...m.keys()][i],getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};
 const make=(userId='a')=>createDurableTimingOutbox({storage,userId,currentUserId:()=>who,id:()=>String(++n),now:()=>time,send:async(b,u)=>{sent.push([b.id,u]);if(fail)throw Error('offline');}});
 const interval={startMs:1,endMs:2,context:{module:'reading',activity:'a',response:'private'}};
 return {m,make,sent,interval,who:v=>who=v,time:v=>time=v,fail:v=>fail=v};
}
test('persists across reconstruction, strips private content and retries same ID',async()=>{const f=fixture();f.make().enqueue([f.interval]);assert.equal([...f.m.values()][0].includes('private'),false);f.fail(true);await assert.rejects(f.make().flush());f.fail(false);await f.make().flush();assert.deepEqual(f.sent,[['1','a'],['1','a']]);assert.equal(f.m.size,0);});
test('account switch cannot flush or enqueue prior account data',async()=>{const f=fixture(),a=f.make();a.enqueue([f.interval]);f.who('b');await assert.rejects(a.flush());assert.throws(()=>a.enqueue([f.interval]));await f.make('b').flush();assert.equal(f.sent.length,0);assert.equal(f.m.size,1);});
test('separate tabs append distinct batches',async()=>{const f=fixture();f.make().enqueue([f.interval]);f.make().enqueue([f.interval]);await f.make().flush();assert.equal(f.sent.length,2);});
test('expired offline data is discarded rather than backdated',async()=>{const f=fixture();f.make().enqueue([f.interval]);f.time(86402000);await f.make().flush();assert.equal(f.sent.length,0);assert.equal(f.m.size,0);});

test('oversized batch cannot be persisted',()=>{const f=fixture();assert.throws(()=>f.make().enqueue(Array(121).fill(f.interval)));assert.equal(f.m.size,0);});

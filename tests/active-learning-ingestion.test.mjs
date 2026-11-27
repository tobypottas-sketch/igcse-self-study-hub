import test from 'node:test';
import assert from 'node:assert/strict';
import {ingestActiveLearning} from '../src/tracking/active-learning-ingestion.js';
function fixture(){
 const now=100000000, id='11111111-1111-4111-8111-111111111111';
 const body={expectedUserId:'s',batch:{id,intervals:[{startMs:now-1000,endMs:now,context:{module:'reading',activity:'a'},class_id:'forged'}]}};
 const calls=[];
 return {body,calls,args:{request:{json:async()=>body},authenticate:async()=>({id:'s',role:'student',active:true,mustChangePassword:false}),resolveContext:async c=>c,persist:async x=>{calls.push(x);return 1;},now:()=>now}};
}
test('server derives identity, strips client class, returns batch acknowledgement',async()=>{const f=fixture(),r=await ingestActiveLearning(f.args);assert.equal(r.inserted,1);assert.equal(f.calls[0].studentId,'s');assert.equal('class_id' in f.calls[0].rows[0],false);});
test('duplicate acknowledgement is successful',async()=>{const f=fixture();f.args.persist=async()=>0;assert.equal((await ingestActiveLearning(f.args)).accepted,1);});
test('identity mismatch cannot reach persistence',async()=>{const f=fixture();f.body.expectedUserId='other';await assert.rejects(ingestActiveLearning(f.args));assert.equal(f.calls.length,0);});
test('unpublished activity cannot reach persistence',async()=>{const f=fixture();f.args.resolveContext=async()=>null;await assert.rejects(ingestActiveLearning(f.args));assert.equal(f.calls.length,0);});
test('database failure is not acknowledged',async()=>{const f=fixture();f.args.persist=async()=>{throw Error('unavailable');};await assert.rejects(ingestActiveLearning(f.args));});

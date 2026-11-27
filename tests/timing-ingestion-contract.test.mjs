import test from 'node:test';
import assert from 'node:assert/strict';
import {validateTimingBatch} from '../src/tracking/timing-ingestion-contract.js';
const now=100000000, id='11111111-1111-4111-8111-111111111111';
function f(){return {now,expectedUserId:'student',principal:{id:'student',role:'student',active:true,mustChangePassword:false},batch:{id,intervals:[{startMs:now-5000,endMs:now,context:{module:'vocabulary_paraphrase',unit:1,pathway:'meaning',activity:'a',mode:'practice'},student_id:'forged',class_id:'forged'}]},resolveContext:async c=>c};}
test('identity and context are server-derived; forged class ignored',async()=>{const rows=await validateTimingBatch(f());assert.equal(rows[0].student_id,'student');assert.equal('class_id' in rows[0],false);assert.equal(rows[0].pathway_id,'meaning');});
test('inactive, staff, reset-required and switched accounts rejected',async()=>{for(const patch of [{active:false},{role:'teacher'},{mustChangePassword:true},{id:'other'}]){const x=f();Object.assign(x.principal,patch);await assert.rejects(validateTimingBatch(x));}});
test('invalid future, stale, reversed and oversized intervals rejected',async()=>{for(const patch of [{endMs:now+3000},{startMs:now-86400001},{startMs:now+1},{startMs:now-31000}]){const x=f();Object.assign(x.batch.intervals[0],patch);await assert.rejects(validateTimingBatch(x));}});
test('unpublished context and missing pathway rejected',async()=>{const x=f();x.resolveContext=async()=>null;await assert.rejects(validateTimingBatch(x));const y=f();y.batch.intervals[0].context.pathway=null;await assert.rejects(validateTimingBatch(y));});
test('batch size and malformed identifiers rejected',async()=>{const x=f();x.batch.id='bad';await assert.rejects(validateTimingBatch(x));const y=f();y.batch.intervals=Array(121).fill(y.batch.intervals[0]);await assert.rejects(validateTimingBatch(y));});

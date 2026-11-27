import test from 'node:test';
import assert from 'node:assert/strict';
import {unionActiveMilliseconds as total} from '../src/tracking/active-learning-union.js';
const s=(startMs,endMs)=>({startMs,endMs});
test('duplicates and partially overlapping devices count once',()=>assert.equal(total([s(0,30),s(0,30),s(20,50),s(60,70)]),60));
test('report boundaries clip before union',()=>assert.equal(total([s(0,30),s(20,50)],{start:10,end:40}),30));
test('invalid intervals and empty evidence add no duration',()=>assert.equal(total([s(10,5),s(NaN,20)]),0));

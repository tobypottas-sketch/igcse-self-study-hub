import test from 'node:test';
import assert from 'node:assert/strict';
import {recordVocabularyMission} from '../src/vocabulary/data.js';

const mission = {mission_id:'synthetic-mission',unit_number:1,score:10,duplicate:false};
const sets = [{unit_number:1,pathway_id:'context',set_number:1,stage:'match',phase:'stage',status:'active',completed_stages:['recognise'],weak_target_ids:[]}];

test('recording receives the authoritative Set rows in the same RPC response',async () => {
  const calls=[];
  const client={rpc:async (name,args) => {calls.push({name,args});return {data:name==='record_vocabulary_mission_with_sets'?{...mission,pathway_sets:sets}:mission,error:null};}};
  const result=await recordVocabularyMission(client,mission.mission_id);
  assert.deepEqual(calls,[{name:'record_vocabulary_mission_with_sets',args:{p_mission_id:mission.mission_id}}]);
  assert.deepEqual(result,{...mission,pathway_sets:sets});
});

for (const code of ['PGRST202','42883']) test(`old deployments fall back only when the new RPC does not exist (${code})`,async () => {
  const calls=[];
  const result=await recordVocabularyMission({rpc:async name => {calls.push(name);return name==='record_vocabulary_mission_with_sets'?{data:null,error:{code}}:{data:mission,error:null};}},mission.mission_id);
  assert.deepEqual(calls,['record_vocabulary_mission_with_sets','record_vocabulary_mission']);
  assert.deepEqual(result,mission);
});

for (const code of ['42501','P0001','NETWORK']) test(`recording does not resend after a non-missing-function error (${code})`,async () => {
  const calls=[];
  const result=await recordVocabularyMission({rpc:async name => {calls.push(name);return {data:null,error:{code}};}},mission.mission_id);
  assert.equal(result,null);
  assert.deepEqual(calls,['record_vocabulary_mission_with_sets']);
});

test('an uncertain transport exception does not trigger a second recording request',async () => {
  const calls=[];
  const result=await recordVocabularyMission({rpc:async name => {calls.push(name);throw new Error('Synthetic connection loss');}},mission.mission_id);
  assert.equal(result,null);
  assert.deepEqual(calls,['record_vocabulary_mission_with_sets']);
});

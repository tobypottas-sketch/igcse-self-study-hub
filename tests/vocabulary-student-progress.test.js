import test from 'node:test';
import assert from 'node:assert/strict';
import {loadStudentVocabularyProgress,summariseVocabularyProgress,sampleVocabularyProgress,renderStudentVocabularyProgress} from '../src/vocabulary/student-progress.js';

function clientWith(events,{failAttempts=false,failTime=false}={}) {
  const calls=[];
  return {
    calls,
    from(table) {
      assert.equal(table,'activity_events');
      const filters={};
      let head=false;
      const query={
        select(_columns,options={}) { head=options.head===true; return query; },
        eq(field,value) { filters[field]=value; return query; },
        order() { return query; },
        range(a,b) {
          calls.push({...filters,range:[a,b]});
          if(failTime) return Promise.resolve({error:new Error('time query failed')});
          const filtered=events.filter(event=>Object.entries(filters).every(([key,value])=>event[key]===value));
          return Promise.resolve({data:filtered.slice(a,b+1).map(({id,active_seconds})=>({id,active_seconds})),count:filtered.length,error:null});
        },
        then(resolve,reject) {
          calls.push({...filters,head});
          if(failAttempts) return Promise.resolve({count:null,error:new Error('count failed')}).then(resolve,reject);
          const count=events.filter(event=>Object.entries(filters).every(([key,value])=>event[key]===value)).length;
          return Promise.resolve({count,error:null}).then(resolve,reject);
        }
      };
      return query;
    }
  };
}
test('student-scoped full-history count and paged active-time total',async()=>{
  const data=[
    ...Array.from({length:1105},(_,i)=>({id:'t'+i,user_id:'u1',app_key:'vocabulary_paraphrase',event_type:'active_time',active_seconds:60})),
    ...Array.from({length:7},(_,i)=>({id:'a'+i,user_id:'u1',app_key:'vocabulary_paraphrase',event_type:'question_attempt'})),
    {id:'other',user_id:'u2',app_key:'vocabulary_paraphrase',event_type:'question_attempt'},
    {id:'wrong-app',user_id:'u1',app_key:'reading',event_type:'question_attempt'}
  ];
  const client=clientWith(data);
  const progress=await loadStudentVocabularyProgress(client,'u1');
  assert.equal(progress.attempts,7);
  assert.equal(progress.activeSeconds,1105*60);
  assert.ok(client.calls.some(call=>call.range?.[0]===1000));
  assert.ok(client.calls.every(call=>call.user_id==='u1'));
  assert.ok(client.calls.every(call=>call.app_key==='vocabulary_paraphrase'));
});
test('partial tracking failures are unavailable, not zero',async()=>{
  const data=[{id:'x',user_id:'u1',app_key:'vocabulary_paraphrase',event_type:'active_time',active_seconds:60}];
  const result=await loadStudentVocabularyProgress(clientWith(data,{failAttempts:true}),'u1');
  assert.equal(result.attempts,null);
  assert.equal(result.attemptsAvailable,false);
  assert.equal(result.activeSeconds,60);
  const missing=await loadStudentVocabularyProgress(clientWith(data,{failTime:true}),'u1');
  assert.equal(missing.activeSeconds,null);
  assert.equal(missing.timeAvailable,false);
});
test('staff preview has no student history queries',async()=>{
  const client={from(){throw Error('Unexpected DB query')}};
  const result=await loadStudentVocabularyProgress(client,'preview-id',{preview:true});
  assert.equal(result.preview,true);
  assert.equal(result.attempts,null);
});
test('only persisted contiguous stage completions are counted',()=>{
  const s=summariseVocabularyProgress({
    dashboard:{
      occurrences:[{occurrence_id:'occ-1'},{occurrence_id:'occ-2'}],
      global:[{vocabulary_id:'v1',status:'mastered'},{vocabulary_id:'v2',status:'building'}],
      unit:[
        {occurrence_id:'occ-1',contextual_evidence:{pathwayProgress:{meaning:{completedStages:['recognise','match']}}}},
        {occurrence_id:'occ-2',contextual_evidence:{pathwayProgress:{meaning:{completedStages:['recognise','apply']}}}}
      ]
    },
    missions:[{mission_id:'m1'}],
    engagement:{weekly:{done:2,goal:4},achievementsUnlocked:3,achievementsTotal:14},
    recorded:{attempts:22,activeSeconds:130,attemptsAvailable:true,timeAvailable:true}
  });
  assert.equal(s.wordsMastered,1);
  assert.equal(s.completedMissions,1);
  assert.equal(s.pathways.find(p=>p.id==='meaning').cleared,3);
  assert.equal(s.pathways.find(p=>p.id==='meaning').total,10);
  assert.equal(s.pathways.find(p=>p.id==='meaning').wordsProgressing,2);
  assert.equal(s.pathways.find(p=>p.id==='meaning').wordCount,2);
  assert.equal(s.pathways.find(p=>p.id==='meaning').percent,100);
  assert.equal(s.attempts,22);
  assert.equal(s.activeSeconds,130);
});
test('student screen renders escaped name, actual values, and a back action',()=>{
  const root={innerHTML:''};
  const summary=summariseVocabularyProgress({
    dashboard:{occurrences:[],global:[],unit:[]},
    engagement:{weekly:{done:1,goal:4},achievementsUnlocked:0,achievementsTotal:14},
    recorded:{attempts:0,activeSeconds:0,attemptsAvailable:true,timeAvailable:true}
  });
  renderStudentVocabularyProgress(root,{summary,displayName:'<script>alert(1)</script>'});
  assert.doesNotMatch(root.innerHTML,/<script>/);
  assert.match(root.innerHTML,/&lt;script&gt;/);
  assert.match(root.innerHTML,/data-action="progress-back-home"/);
  assert.match(root.innerHTML,/Question attempts/);
  assert.match(root.innerHTML,/My Vocabulary Journey|MY VOCABULARY JOURNEY/);
});


test('staff preview engagement is null and must still render safely',()=>{
  // homeEngagement() intentionally returns null for staff preview.
  const summary=summariseVocabularyProgress({
    dashboard:{occurrences:[{occurrence_id:'one'}],global:[],unit:[]},
    missions:[],
    engagement:null,
    recorded:{attempts:null,activeSeconds:null,attemptsAvailable:false,timeAvailable:false,preview:true}
  });
  assert.equal(summary.weekly,null);
  assert.equal(summary.achievementsUnlocked,null);
  assert.equal(summary.achievementsTotal,null);
  assert.equal(summary.attempts,null);
  const root={innerHTML:''};
  renderStudentVocabularyProgress(root,{summary,displayName:'Teacher',preview:true});
  assert.match(root.innerHTML,/DEMONSTRATION DATA/);
  assert.match(root.innerHTML,/data-action="progress-back-home"/);
});

test('staff demonstration has clearly fictional, populated metrics',()=>{
  const summary=sampleVocabularyProgress();
  assert.equal(summary.demo,true);
  assert.ok(summary.attempts>0);
  assert.ok(summary.activeSeconds>0);
  assert.ok(summary.achievementsUnlocked>0);
  assert.ok(summary.pathways.every(p=>p.wordsProgressing>0 && p.cleared>0 && p.wordCount>0));
  const root={innerHTML:''};
  renderStudentVocabularyProgress(root,{summary,displayName:'Staff Member',preview:true});
  assert.match(root.innerHTML,/DEMONSTRATION DATA/);
  assert.match(root.innerHTML,/fictional examples/);
  assert.match(root.innerHTML,/words progressing/);
  assert.match(root.innerHTML,/stages completed/);
  assert.doesNotMatch(root.innerHTML,/word-stage steps/);
  assert.doesNotMatch(root.innerHTML,/Staff Member/);
});
test('real student figures remain exact and are never replaced by example data',()=>{
  const live=summariseVocabularyProgress({
    dashboard:{occurrences:[],unit:[],global:[]},
    missions:[],engagement:{weekly:{done:0,goal:4},achievementsUnlocked:0,achievementsTotal:14},
    recorded:{attempts:0,activeSeconds:0,attemptsAvailable:true,timeAvailable:true}
  });
  const root={innerHTML:''};
  renderStudentVocabularyProgress(root,{summary:live,displayName:'Learner',preview:false});
  assert.equal(live.demo,undefined);
  assert.equal(live.attempts,0);
  assert.equal(live.wordsMastered,0);
  assert.doesNotMatch(root.innerHTML,/DEMONSTRATION DATA/);
  assert.doesNotMatch(root.innerHTML,/1,248/);
  assert.match(root.innerHTML,/Learner/);
});

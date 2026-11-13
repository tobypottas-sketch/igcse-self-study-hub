import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateVocabularyUsage, loadVocabularyStaffUsage, renderVocabularyStaffUsage } from '../src/vocabulary/staff-usage.js';

const data={
 role:'teacher',
 classes:[{id:'c1',class_name:'Grade 9 ESL'},{id:'c2',class_name:'Grade 10 ESL'}],
 profiles:[{id:'s1',display_name:'Learner One'},{id:'s2',display_name:'Learner Two'},{id:'s3',display_name:'Learner Three'}],
 memberships:[{class_id:'c1',student_id:'s1'},{class_id:'c1',student_id:'s2'},{class_id:'c2',student_id:'s2'},{class_id:'c2',student_id:'s3'}],
 events:[
 {id:'e1',user_id:'s1',occurred_at:'2026-11-11T10:00:00Z',event_type:'question_attempt'},
 {id:'e2',user_id:'s1',occurred_at:'2026-11-11T10:01:00Z',event_type:'active_time',active_seconds:60},
 {id:'e3',user_id:'s2',occurred_at:'2026-11-10T10:00:00Z',event_type:'question_attempt'},
 {id:'e4',user_id:'s3',occurred_at:'2026-10-01T10:00:00Z',event_type:'question_attempt'}
 ],
 mastery:[{student_id:'s1',status:'mastered',vocabulary_id:'word1'},{student_id:'s2',status:'mastered',vocabulary_id:'word2'}]
};
const now=new Date('2026-11-13T12:00:00Z');
test('all classes counts overlapping students once',()=>{
 const a=calculateVocabularyUsage(data,{days:0,now});
 assert.equal(a.overview.studentCount,3);
 assert.equal(a.overview.attempts,3);
 assert.equal(a.overview.seconds,60);
 assert.equal(a.overview.mastered,2);
});
test('date period changes activity but current mastered stays constant',()=>{
 const a=calculateVocabularyUsage(data,{days:7,now});
 assert.equal(a.overview.attempts,2);
 assert.equal(a.overview.studentCount,3);
 assert.equal(a.overview.mastered,2);
 assert.equal(a.overview.activeStudents,2);
});
test('class filter hides other class students and refuses foreign student details',()=>{
 const a=calculateVocabularyUsage(data,{days:0,now,classId:'c1',studentId:'s3'});
 assert.equal(a.overview.studentCount,2);
 assert.equal(a.student,null);
 assert.equal(a.overview.attempts,2);
});
test('render escapes student names, offers real actions and no demo metrics',()=>{
 const root={innerHTML:''};
 renderVocabularyStaffUsage(root,{...data,profiles:[{id:'s1',display_name:'<script>danger</script>'}]},{now});
 assert.doesNotMatch(root.innerHTML,/<script>/);
 assert.match(root.innerHTML,/&lt;script&gt;/);
 assert.match(root.innerHTML,/data-action="staff-usage-class"/);
 assert.match(root.innerHTML,/data-action="staff-usage-select-class"/);
 assert.match(root.innerHTML,/data-action="staff-usage-search"/);
 assert.match(root.innerHTML,/data-vocab-usage-student-row/);
 assert.match(root.innerHTML,/data-action="staff-usage-student"/);
 assert.match(root.innerHTML,/data-action="staff-usage-back"/);
 assert.doesNotMatch(root.innerHTML,/DEMONSTRATION DATA/);
});
test('admin view includes active users without a class',()=>{
 const a=calculateVocabularyUsage({...data,role:'admin',profiles:[...data.profiles,{id:'unassigned',display_name:'New Learner'}]},{days:30,now});
 assert.equal(a.overview.studentCount,4);
 assert.equal(a.overview.inactive,2);
});
test('teacher class permissions constrain the user and event query before loading',async()=>{
 const calls=[];
 const allClasses=[{id:'c1',class_name:'Owned',active:true},{id:'c2',class_name:'Not owned',active:true}];
 const allMemberships=[{class_id:'c1',student_id:'s1',ended_at:null},{class_id:'c2',student_id:'s2',ended_at:null}];
 const results={
  classes:allClasses,student_class_memberships:allMemberships,teacher_classes:[{teacher_id:'teacher1',class_id:'c1'}],
  profiles:[{id:'s1',role:'student',active:true,display_name:'One'},{id:'s2',role:'student',active:true,display_name:'Two'}],
  activity_events:[{id:'e1',user_id:'s1',event_type:'question_attempt',occurred_at:'2026-11-10T00:00:00Z'}],
  vocabulary_global_mastery:[]
 };
 const client={from(table){
  const filters=[];
  const builder={
   select(){return builder},eq(k,v){filters.push([k,'eq',v]);return builder},
   is(k,v){filters.push([k,'is',v]);return builder},
   in(k,vs){filters.push([k,'in',vs]);return builder},
   order(){return builder},
   range(from,to){
    calls.push({table,filters:[...filters]});
    const data=results[table].filter(row=>filters.every(([k,op,v])=>op==='eq'?row[k]===v:op==='is'?row[k]===v:v.includes(row[k])));
    return Promise.resolve({data:data.slice(from,to+1),count:data.length,error:null});
   }
  };
  return builder;
 }};
 const loaded=await loadVocabularyStaffUsage(client,{id:'teacher1',role:'teacher'});
 assert.deepEqual(loaded.classes.map(row=>row.id),['c1']);
 assert.deepEqual(loaded.profiles.map(row=>row.id),['s1']);
 const eventCall=calls.find(row=>row.table==='activity_events');
 assert.ok(eventCall.filters.some(([k,op,v])=>k==='user_id'&&op==='in'&&v.length===1&&v[0]==='s1'));
 assert.ok(!calls.some(row=>row.table==='activity_events'&&row.filters.some(([k,op,v])=>k==='user_id'&&v.includes('s2'))));
});

test('seven-day chart partitions dates without duplicating attempts',()=>{
 const root={innerHTML:''};
 renderVocabularyStaffUsage(root,data,{days:7,now});
 const chart=root.innerHTML.match(/<div class="vocab-usage-chart"[\s\S]*?<\/div><\/article>/)?.[0] ?? '';
 assert.match(chart,/vocab-usage-bar/);
 // The fixture has two attempts in the selected week, not duplicated across buckets.
 assert.ok(chart.includes('>1</strong>'));
 assert.doesNotMatch(chart,/>2<\/strong>/);
});

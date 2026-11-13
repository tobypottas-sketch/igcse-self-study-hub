import test from 'node:test';
import assert from 'node:assert/strict';
import { loadVocabularyTeacherClassList } from '../src/vocabulary/teacher-data.js';

function clientFor(rows,calls){
  return {from(table){
    const filters=[];
    const query={
      select(){return query;},
      eq(key,value){filters.push([key,'eq',value]);return query;},
      is(key,value){filters.push([key,'is',value]);return query;},
      order(){return query;},
      range(first,last){
        calls.push({table,filters:[...filters]});
        const data=(rows[table]??[]).filter(row=>filters.every(([key,op,value])=>op==='eq'?row[key]===value:row[key]===value));
        return Promise.resolve({data:data.slice(first,last+1),count:data.length,error:null});
      }
    };
    return query;
  }};
}
test('teacher chooser is assignment scoped and never requests activity or mastery',async()=>{
  const calls=[];
  const rows={
    classes:[{id:'a',class_name:'Assigned',active:true},{id:'b',class_name:'Not assigned',active:true}],
    student_class_memberships:[{class_id:'a',student_id:'s1',ended_at:null},{class_id:'a',student_id:'s1',ended_at:null},{class_id:'b',student_id:'s2',ended_at:null}],
    teacher_classes:[{teacher_id:'t1',class_id:'a'}]
  };
  const data=await loadVocabularyTeacherClassList(clientFor(rows,calls),{id:'t1',role:'teacher'});
  assert.deepEqual(data.classes.map(row=>row.id),['a']);
  assert.equal(data.classes[0].students.length,1);
  assert.deepEqual([...new Set(calls.map(row=>row.table))].sort(),['classes','student_class_memberships','teacher_classes']);
});
test('admin chooser includes all active classes without teacher assignment query',async()=>{
  const calls=[];
  const rows={
    classes:[{id:'a',class_name:'Active',active:true},{id:'b',class_name:'Inactive',active:false}],
    student_class_memberships:[],teacher_classes:[]
  };
  const result=await loadVocabularyTeacherClassList(clientFor(rows,calls),{id:'administrator',role:'admin'});
  assert.deepEqual(result.classes.map(row=>row.id),['a']);
  assert.ok(!calls.some(row=>row.table==='teacher_classes'));
});
test('non-staff access rejected before reading data',async()=>{
  const calls=[];
  await assert.rejects(()=>loadVocabularyTeacherClassList(clientFor({},calls),{id:'student',role:'student'}),/Staff authorisation/);
  assert.equal(calls.length,0);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { applyActivityListFilters, newActivityListState } from '../src/admin/activity-list-ui.js';
import { renderAdmin } from '../src/views/admin.js';

function fakeList(){
  const rows=Array.from({length:269},(_,i)=>({
    dataset:{
      classId:i<50?'c1':'c2',
      studentName:'student '+i,
      needsAttention:i<54?'true':'false',
      newMerits:i<3?'true':'false',
      started:i<80?'true':'false'
    },
    hidden:true
  }));
  const table={dataset:{},querySelectorAll:()=>rows};
  const count={textContent:''},next={hidden:true,textContent:''},empty={hidden:true,textContent:''};
  const root={querySelector(sel){
    return sel==='.activity-table'?table:
      sel==='[data-activity-list-count]'?count:
      sel==='[data-action="activity-show-more"]'?next:
      sel==='[data-activity-list-empty]'?empty:null;
  }};
  return {root,rows,table,count,next,empty};
}
test('default staff Activity shows ten attention records, never the whole roster',()=>{
 const ui=fakeList();
 const result=applyActivityListFilters(ui.root,newActivityListState());
 assert.deepEqual(result,{matching:54,showing:10});
 assert.equal(ui.rows.filter(row=>!row.hidden).length,10);
 assert.equal(ui.count.textContent,'Showing 10 of 54 students');
 assert.equal(ui.next.hidden,false);
});
test('Load more reveals ten additional matching records only',()=>{
 const ui=fakeList(),state=newActivityListState();
 state.limit=20;
 const result=applyActivityListFilters(ui.root,state);
 assert.equal(result.showing,20);
 assert.equal(result.matching,54);
 assert.equal(ui.rows.filter(row=>!row.hidden).length,20);
});
test('class and status filters constrain results together',()=>{
 const ui=fakeList(),state={...newActivityListState(),classId:'c2',state:'started'};
 const result=applyActivityListFilters(ui.root,state);
 assert.equal(result.matching,30);
 assert.equal(result.showing,10);
 assert.ok(ui.rows.filter(row=>!row.hidden).every(row=>row.dataset.classId==='c2'));
});
test('search reaches an arbitrary student beyond the first page',()=>{
 const ui=fakeList(),state={...newActivityListState(),state:'all',search:'student 263'};
 const result=applyActivityListFilters(ui.root,state);
 assert.equal(result.matching,1);
 assert.equal(result.showing,1);
 assert.equal(ui.rows[263].hidden,false);
 assert.equal(ui.next.hidden,true);
});
test('not started and new merits can be viewed without opening all students',()=>{
 const ui=fakeList();
 assert.equal(applyActivityListFilters(ui.root,{...newActivityListState(),state:'notstarted'}).matching,189);
 assert.equal(applyActivityListFilters(ui.root,{...newActivityListState(),state:'merits'}).matching,3);
});
test('no matching rows has an explicit empty state',()=>{
 const ui=fakeList(),result=applyActivityListFilters(ui.root,{...newActivityListState(),search:'unfindable'});
 assert.equal(result.showing,0);
 assert.equal(ui.empty.hidden,false);
 assert.equal(ui.next.hidden,true);
});
test('Activity render defaults to attention and includes paging controls',()=>{
 const root={innerHTML:''};
 renderAdmin(root,{profile:{role:'admin',display_name:'Teacher'},section:'activity',activityDashboard:{
   pendingMerits:0,needsAttention:1,
   students:[{studentId:'s1',displayName:'Practised Student',classId:'c1',className:'G9 ESL',needsAttention:true,hasStarted:true,activityThisWeek:4,pathways:{}},
             {studentId:'s2',displayName:'Not Started Student',classId:'c1',className:'G9 ESL',needsAttention:false,hasStarted:false,activityThisWeek:0,pathways:{}}]
 }});
 assert.match(root.innerHTML,/value="attention" selected/);
 assert.match(root.innerHTML,/value="notstarted"/);
 assert.match(root.innerHTML,/data-action="activity-show-more"/);
 assert.match(root.innerHTML,/data-activity-list-empty/);
 assert.match(root.innerHTML,/data-student-name="not started student"/);
 assert.match(root.innerHTML,/data-student-name="not started student"[^>]* hidden>/);
 assert.match(root.innerHTML,/data-action="activity-student"/);
});

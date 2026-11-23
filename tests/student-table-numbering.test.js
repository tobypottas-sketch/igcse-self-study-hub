import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderAdmin} from '../src/views/admin.js';
import {renderNGSLClassReport} from '../src/vocabulary/ngsl-teacher-results.js';

const source=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const root=()=>({innerHTML:''});

test('admin account directory numbers each class independently, not teacher accounts',()=>{
 const node=root();
 const make=(id,displayName,group)=>({id,displayName,email:id+'@school.test',role:'student',active:true,currentClass:group});
 renderAdmin(node,{
   profile:{display_name:'Admin',role:'admin'},section:'accounts',
   classes:[],accounts:[
     make('a1','Alpha, First','G9 A'),make('a2','Beta, Second','G9 A'),
     make('b1','Gamma, Third','G9 B'),
     {id:'t1',displayName:'Teacher',email:'teacher@school.test',role:'teacher',active:true}
   ]
 });
 const sections=[...node.innerHTML.matchAll(/<details class="admin-student-group"[\s\S]*?<\/details>/g)];
 assert.equal(sections.length,2);
 assert.deepEqual([...sections[0][0].matchAll(/data-student-number>(\d+)<\/td>/g)].map(x=>Number(x[1])),[1,2]);
 assert.deepEqual([...sections[1][0].matchAll(/data-student-number>(\d+)<\/td>/g)].map(x=>Number(x[1])),[1]);
 assert.match(node.innerHTML, /<th scope="col" class="student-row-number">#<\/th>/);
});

test('class Activity and teacher analytics contain student-first # cells',()=>{
 const admin=source('src/views/admin.js');
 const filters=source('src/admin/activity-list-ui.js');
 const teacher=source('src/vocabulary/teacher-views.js');
 assert.match(admin,/classNumbers\.set\(classKey/);
 assert.match(admin,/data-activity-row[\s\S]*?data-student-number/);
 assert.match(filters,/visibleNumbers\.set\(classKey,next\)/);
 assert.match(teacher,/const rows = students\.map\(\(student, index\)/);
 assert.match(teacher,/vocab-student-number/);
});

test('NGSL diagnostic renders a correctly numbered six-column student report',()=>{
 const node=root();
 const dataset={
  classes:[{id:'c1',className:'Class 1',students:[{id:'s1'},{id:'s2'}]}],
  names:new Map([['s1','Alpha'],['s2','Bravo']]),
  results:new Map(),integrity:new Map(),integrityAvailable:true
 };
 renderNGSLClassReport(node,dataset,'c1');
 assert.match(node.innerHTML, /<th class="vocab-student-number">#<\/th><th>Student<\/th>/);
 assert.match(node.innerHTML, /<td class="vocab-student-number">1<\/td><td>Alpha<\/td>/);
 assert.match(node.innerHTML, /<td class="vocab-student-number">2<\/td><td>Bravo<\/td>/);
 assert.match(source('src/vocabulary/ngsl-teacher-results.js'), /colspan="7"/);
});

test('polished diagnostic page and staff usage number the currently displayed rows',()=>{
 const polished=source('src/vocabulary/ngsl-teacher-report-polished.js');
 const usage=source('src/vocabulary/staff-usage.js');
 assert.match(polished,/page\*PAGE_SIZE\+index\+1/);
 assert.match(polished,/rows\.map\(\(row,index\)=>/);
 assert.match(polished,/colspan="7"/);
 assert.match(usage,/const tableRow=\(s,index\)=>/);
 assert.match(usage,/numberCell\.textContent=String\(shown\)/);
 assert.match(usage,/class="vocab-student-number" data-student-number/);
});

test('visible rows are renumbered on admin account filtering and tables remain presentation-only',()=>{
 const app=source('src/app.js');
 const adminCss=source('admin.css');
 const vocabularyCss=source('vocabulary.css');
 assert.match(app,/numberCell\.textContent=String\(visible\)/);
 assert.match(adminCss,/\.admin-table \.student-row-number/);
 assert.match(vocabularyCss,/#vocabularyApp table \.vocab-student-number/);
 assert.doesNotMatch(source('src/admin/activity-list-ui.js'),/\.from\(['"]profiles['"]\)/);
});

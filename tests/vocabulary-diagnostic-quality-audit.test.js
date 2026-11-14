import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditDiagnosticItem} from '../src/vocabulary/diagnostic-quality-audit.js';

const item=(options,correctOptionId='A',stem='The class starts at nine.')=>({stem,options:options.map((text,i)=>({id:'ABCD'[i],text})),correctOptionId});
test('valid but potentially easy questions stay reviewable, never auto-approved',()=>{
 const r=auditDiagnosticItem(item(['The class begins at nine each morning.','The class meets on Mondays.','The class has a new teacher.','The class meets in Room 4.']));
 assert.equal(r.requiresHumanReview,true);
 assert.equal(r.canApprove,true);
 assert.ok(r.issues.some(x=>x.code==='correct_longest'));
});
test('duplicate answers are blocking',()=>{
 const r=auditDiagnosticItem(item(['Arrives at nine.','Arrives at nine!','Leaves at nine.','Arrives at ten.']));
 assert.equal(r.canApprove,false);
 assert.ok(r.issues.some(x=>x.code==='duplicate_option'));
});
test('missing answer key or option blocks approval',()=>{
 assert.equal(auditDiagnosticItem(item(['A','B','C','D'],'Z')).canApprove,false);
 assert.equal(auditDiagnosticItem(item(['A','B','C'])).canApprove,false);
});
test('large answer-length clue is flagged',()=>{
 const r=auditDiagnosticItem(item(['The train arrived more than forty minutes after the time shown on the original timetable.','The train was red.','The train was clean.','The train was full.']));
 assert.ok(r.issues.some(x=>x.code==='length_outlier'));
});
test('staff review uses advisory audit, not automatic approval',()=>{
 const ui=readFileSync(new URL('../src/vocabulary/diagnostic-review.js',import.meta.url),'utf8');
 assert.match(ui,/auditDiagnosticItem\(x\)/);
 assert.match(ui,/Human checklist:/);
 assert.match(ui,/data-quality-confirm="distractors"/);
 assert.match(ui,/Confirm all four quality checks before approving this stage/);
 assert.match(ui,/Blocking structural quality issue/);
 assert.match(ui,/This does not mean the question is approved/);
});

test('backend enforces and persists the four quality attestations',()=>{
 const sql=readFileSync(new URL('../supabase/diagnostic/review_api.sql',import.meta.url),'utf8');
 const edge=readFileSync(new URL('../supabase/functions/vocabulary-diagnostic/index.ts',import.meta.url),'utf8');
 const ui=readFileSync(new URL('../src/vocabulary/diagnostic-review.js',import.meta.url),'utf8');
 assert.match(sql,/QUALITY_CONFIRMATIONS_REQUIRED/);
 assert.match(sql,/jsonb_typeof\(v_quality\)/);
 assert.match(sql,/jsonb_object_keys/);
 assert.match(sql,/quality_confirmations\)/);
 assert.match(edge,/payload\.qualityConfirmations/);
 assert.match(edge,/Object\.keys\(payload\.qualityConfirmations\)\.length===4/);
 assert.match(ui,/qualityConfirmations:\s*true|singleKey:true/);
 assert.match(ui,/\['approve','verify'\]\.includes\(decision\)/);
});

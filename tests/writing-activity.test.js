import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWritingRows, submissionPayload } from '../src/writing/submissions.js';
test('submission preserves question and paragraphs independently of AI', () => {
  assert.deepEqual(submissionPayload('review_writing','Restaurant review','First paragraph.\n\nSecond paragraph.'), {app_key:'review_writing',task:'Restaurant review',response:'First paragraph.\n\nSecond paragraph.'});
});
test('blank responses are rejected', () => assert.throws(()=>submissionPayload('review_writing','Restaurant review','   ')));
test('report counts missing students and excludes unrelated tasks and dates', () => {
  const roster=[{studentId:'a',displayName:'A',classId:'x'},{studentId:'b',displayName:'B',classId:'x'},{studentId:'c',displayName:'C',classId:'y'}];
  const submissions=[{student_id:'a',app_key:'review_writing',task:'Restaurant',submitted_at:'2026-11-24T02:00:00Z'},{student_id:'b',app_key:'review_writing',task:'Film',submitted_at:'2026-11-24T02:00:00Z'},{student_id:'b',app_key:'review_writing',task:'Restaurant',submitted_at:'2026-11-23T02:00:00Z'}];
  const rows=buildWritingRows(roster,submissions,{classId:'x',appKey:'review_writing',from:'2026-11-24',to:'2026-11-24',task:'Restaurant'});
  assert.deepEqual(rows.map(r=>[r.studentId,r.submissions.length]),[['a',1],['b',0]]);
});

test('independent writing evidence separates a draft, comparison, revision and self-review',async()=>{
 const {writingEvidence}=await import('../src/writing/engine/activities.js');
 const task={min:3,checks:['Evidence'],allowKeep:true};
 const run={draft:'',original:'',revision:'',checks:new Set()};
 assert.equal(writingEvidence(run,task),'not-attempted');
 run.draft='An unfinished review.';
 assert.equal(writingEvidence(run,task),'draft');
 run.original=run.revision=run.draft;
 assert.equal(writingEvidence(run,task),'compared');
 run.revision='An unfinished review!';
 assert.equal(writingEvidence(run,task),'revised-or-retained');
 run.checks.add(0);
 assert.equal(writingEvidence(run,task),'self-reviewed');
});

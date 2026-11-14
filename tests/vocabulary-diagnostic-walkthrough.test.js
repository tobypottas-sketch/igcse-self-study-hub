import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const router=read('src/vocabulary/router.js');
const student=read('src/vocabulary/diagnostic-student.js');
const walkthrough=read('src/vocabulary/diagnostic-teacher-walkthrough.js');
const teacher=read('src/vocabulary/teacher-app.js');
const page=read('vocabulary.html');
test('the real student diagnostic is routed only for assigned students or explicit opt-in',()=>{
 assert.match(router,/DIAGNOSTIC_BASELINE_GATE_ENABLED \|\| voluntaryDiagnosticRequested/);
 assert.match(router,/diagnosticStatus\?\.baselineAssignmentId/);
 assert.match(router,/initialiseVocabularyDiagnostic/);
 assert.match(router,/diagnostic-student\.js\?v=provisional-v1/);
});
test('mandatory vocabulary gate is still disabled',()=>{
 const gate=read('src/vocabulary/diagnostic-entry-gate.js');
 assert.match(gate,/DIAGNOSTIC_BASELINE_GATE_ENABLED=false/);
});
test('staff walkthrough cannot be entered by a student',()=>{
 assert.match(router,/\(profile\.role === 'teacher' \|\| profile\.role === 'admin'\) && diagnosticWalkthroughRequested/);
 assert.match(router,/startDiagnosticTeacherPreview/);
 assert.match(teacher,/vocabulary\.html\?diagnostic-preview=1/);
 assert.match(page,/vocabulary-diagnostic-student\.css\?v=diagnostic-results-v1/);
});
test('walkthrough uses synthetic prompts, not a stored bank or answers',()=>{
 assert.match(walkthrough,/SAMPLE = \[/);
 assert.match(walkthrough,/previewMode:true/);
 assert.doesNotMatch(walkthrough,/fetch\(|supabase\.from\(|review-detail|correctOptionId|correct_option_id|levelHypothesis|keyedAnswer/);
 assert.match(student,/Teacher preview · Sample questions only · No student records are saved/);
});
test('result feedback does not invent an uncalibrated level',()=>{
 assert.match(student,/result\?\.correct/);
 assert.match(student,/result\?\.unknown/);
 assert.doesNotMatch(student,/levelEstimate\s*\|\|\s*['"]B1/);
});

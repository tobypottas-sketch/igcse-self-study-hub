import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { scoreProvisionalDiagnostic, VOCABULARY_BANDS } from '../supabase/functions/vocabulary-diagnostic/provisional-scoring.js';
const bands=(scores,unknowns=[0,0,0,0,0])=>Object.fromEntries(VOCABULARY_BANDS.map((k,i)=>[k,{administered:8,correct:scores[i],unknown:unknowns[i]}]));
test('returns null for absent, incomplete, or malformed evidence',()=>{
 assert.equal(scoreProvisionalDiagnostic(null,40),null);
 assert.equal(scoreProvisionalDiagnostic(bands([7,7,7,7,7]),39),null);
 const incomplete=bands([7,7,7,7,7]);delete incomplete.B1;
 assert.equal(scoreProvisionalDiagnostic(incomplete,40),null);
 const impossible=bands([7,7,7,7,7]);impossible.A2.unknown=3;
 assert.equal(scoreProvisionalDiagnostic(impossible,40),null);
 const wrongCount=bands([7,7,7,7,7]);wrongCount.C1.administered=5;
 assert.equal(scoreProvisionalDiagnostic(wrongCount,40),null);
});
test('provisional placement relies on strong fundamentals, not just total score',()=>{
 assert.equal(scoreProvisionalDiagnostic(bands([8,8,8,8,8]),40).provisionalLevel,'C1');
 assert.equal(scoreProvisionalDiagnostic(bands([7,7,7,7,1]),40).provisionalLevel,'B2');
 assert.equal(scoreProvisionalDiagnostic(bands([7,7,6,2,8]),40).provisionalLevel,'B1');
 assert.equal(scoreProvisionalDiagnostic(bands([3,8,8,8,8]),40).provisionalLevel,'A1');
 assert.equal(scoreProvisionalDiagnostic(bands([5,6,6,6,6]),40).provisionalLevel,'C1');
});
test('correct responses and unknowns produce cautious feedback and practical recommendation',()=>{
 const r=scoreProvisionalDiagnostic(bands([6,6,3,2,1],[1,1,4,5,5]),40);
 assert.equal(r.correct,18);assert.equal(r.unsure,16);assert.equal(r.provisional,true);
 assert.equal(r.scoreStatus,'provisional');
 assert.equal(r.provisionalLevel,'A2');
 assert.match(r.caution,/extra care/);
 assert.match(r.practice.advice,/Meaning|Context|Families|Paraphrasing|Precision/);
});
test('score and recommendations only appear through server-side path',()=>{
 const api=readFileSync(new URL('../supabase/functions/vocabulary-diagnostic/index.ts',import.meta.url),'utf8');
 const student=readFileSync(new URL('../src/vocabulary/diagnostic-student.js',import.meta.url),'utf8');
 assert.match(api,/scoreProvisionalDiagnostic\(result\.result\.coverage,result\.result\.total\)/);
 assert.match(api,/action==='respond' && result\?\.state==='completed'/);
 assert.match(student,/result\?\.scoreStatus==='provisional'/);
 assert.match(student,/esc\(result\.practice\.advice\)/);
 assert.doesNotMatch(student,/import .*provisional-scoring/);
});

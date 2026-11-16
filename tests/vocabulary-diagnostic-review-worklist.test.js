import test from 'node:test';
import assert from 'node:assert/strict';
import {validateReviewWorklist,renderReviewWorklist} from '../src/vocabulary/diagnostic-review-worklist.js';
const make=()=>({
 form:'A',total:40,items:Array.from({length:40},(_,i)=>({
   position:i+1,id:'diagnostic-item-'+(i+1),version:2,lemma:'word-'+(i+1),
   level:['A1','A2','B1','B2','C1'][Math.floor(i/8)],
   languageApproved:false,assessmentApproved:false,cefrVerified:false,flagged:false
 }))
});
test('accepts full ordered current-version Form A worklist without keys',()=>{
 const data=make();assert.equal(validateReviewWorklist(data).length,40);
 assert.match(renderReviewWorklist(data.items),/Form A · Approval worklist/);
});
test('blocks incomplete, mismatched, out-of-order or key-bearing worklists',()=>{
 const data=make();
 assert.throws(()=>validateReviewWorklist({...data,form:'B'}));
 assert.throws(()=>validateReviewWorklist({...data,total:39}));
 const wrong=make();wrong.items[5].position=7;assert.throws(()=>validateReviewWorklist(wrong));
 const unsafe=make();unsafe.items[0].correctOptionId='C';assert.throws(()=>validateReviewWorklist(unsafe));
 const text=make();text.items[0].stem='private question';assert.throws(()=>validateReviewWorklist(text));
});
test('filters pending stages and reports authentic approval counters',()=>{
 const data=make();
 data.items[0].languageApproved=true;
 data.items[1].assessmentApproved=true;
 data.items[2].cefrVerified=true;
 data.items[3].flagged=true;
 const all=renderReviewWorklist(data.items);
 assert.match(all,/1\/40/);
 assert.equal((all.match(/data-action="open"/g)||[]).length,40);
 assert.equal((renderReviewWorklist(data.items,{filter:'language'}).match(/data-action="open"/g)||[]).length,39);
 assert.equal((renderReviewWorklist(data.items,{filter:'assessment'}).match(/data-action="open"/g)||[]).length,39);
 assert.equal((renderReviewWorklist(data.items,{filter:'cefr'}).match(/data-action="open"/g)||[]).length,39);
 assert.equal((renderReviewWorklist(data.items,{filter:'flagged'}).match(/data-action="open"/g)||[]).length,1);
});
test('does not render untrusted item text as markup and has no bulk approval',()=>{
 const data=make();data.items[0].lemma='<img src=x onerror=alert(1)>';
 const html=renderReviewWorklist(validateReviewWorklist(data));
 assert.doesNotMatch(html,/<img/);
 assert.match(html,/&lt;img/);
 assert.doesNotMatch(html,/data-action="(?:approve|publish|assign|bulk-approve)"/);
});

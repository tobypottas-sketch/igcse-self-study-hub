import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDiagnosticItem, auditDiagnosticBank, LEVELS } from '../tools/diagnostic/item-quality.js';

// This is a deliberately PUBLIC, synthetic test fixture — not a scored item bank.
const draft = (changes={}) => ({
  itemId:'diag-example-001',version:1,formFamily:'fixture-example',
  levelHypothesis:'B1',construct:'meaning_in_context',domain:'school',
  lemma:'revise',partOfSpeech:'verb',sense:'change or improve a piece of work',
  stem:'The teacher asked the class to revise their plans before Friday. What does revise mean in this sentence?',
  options:[
    {id:'A',text:'Change parts of them',rationale:'The target meaning is to adjust or improve existing plans.'},
    {id:'B',text:'Explain them to others',rationale:'Explaining the plans does not necessarily involve changing them.'},
    {id:'C',text:'Deliver them to someone',rationale:'Delivering is moving the plans, not reviewing their contents.'},
    {id:'D',text:'Forget them completely',rationale:'Forgetting plans is not the intended action.'}
  ],
  correctOptionId:'A',
  source:{origin:'original',rightsStatus:'author_owned',referenceNotes:'Synthetic author-written test fixture, not approved for delivery.'},
  review:{status:'draft',authorId:'author-1',languageReviewerId:null,assessmentReviewerId:null,
    languageReviewedAt:null,assessmentReviewedAt:null},
  ...changes
});
const reviewed = changes => draft({
  review:{status:'pilot',authorId:'a',languageReviewerId:'b',assessmentReviewerId:'c',
    languageReviewedAt:'2026-11-01T10:00:00Z',assessmentReviewedAt:'2026-11-02T10:00:00Z'},
  ...changes
});
const codes = result=>result.errors.map(x=>x.code);

test('well-shaped draft is accepted for editing but not piloting',()=>{
  assert.equal(validateDiagnosticItem(draft()).ok,true);
  assert.ok(codes(validateDiagnosticItem(draft(),{forPilot:true})).includes('NOT_PILOT_APPROVED'));
});
test('reviewed original item can pass structural pilot gate',()=>{
  const result=validateDiagnosticItem(reviewed(),{forPilot:true});
  assert.deepEqual(result.errors,[]);
  assert.equal(result.ok,true);
});
test('four distinct options with fixed IDs and a real answer are mandatory',()=>{
  const x=draft({options:[draft().options[0],draft().options[0]],correctOptionId:'E'});
  const c=codes(validateDiagnosticItem(x));
  assert.ok(c.includes('OPTION_COUNT'));
  assert.ok(c.includes('ANSWER_ID')||c.includes('OPTION_COUNT'));
});
test('duplicate option text is rejected even with punctuation/case changes',()=>{
  const item=draft();item.options[3].text=' change parts of them!! ';
  assert.ok(codes(validateDiagnosticItem(item)).includes('DUPLICATE_OPTIONS'));
});
test('a conspicuously long correct answer among single words is rejected',()=>{
  const item=draft();
  item.options[0].text='Make important changes to an existing piece of work';
  item.options.slice(1).forEach((o,i)=>o.text=['Stop','Move','Speak'][i]);
  assert.ok(codes(validateDiagnosticItem(item)).includes('LONG_KEY_LEAK'));
});
test('rights and original provenance are required',()=>{
  const item=draft({source:{origin:'licensed',rightsStatus:'unverified',referenceNotes:'A licensed publisher, rights not yet granted.'}});
  const errors=codes(validateDiagnosticItem(item,{forPilot:true}));
  assert.ok(errors.includes('LICENSE'));
  assert.ok(errors.includes('RIGHTS_UNVERIFIED'));
});
test('distinct, timestamped reviewers are mandatory before pilot',()=>{
  const item=reviewed();
  item.review.assessmentReviewerId=item.review.authorId;
  assert.ok(codes(validateDiagnosticItem(item,{forPilot:true})).includes('INDEPENDENT_REVIEW'));
  item.review.assessmentReviewerId='c';item.review.languageReviewedAt=null;
  assert.ok(codes(validateDiagnosticItem(item,{forPilot:true})).includes('REVIEW_DATES'));
});
test('unique overlapping stem/key language must be inspected, not silently approved',()=>{
  const item=reviewed();
  item.options[0].text='Revise their plans carefully';
  const result=validateDiagnosticItem(item,{forPilot:true});
  assert.ok(result.warnings.some(w=>w.code==='STEM_KEY_OVERLAP'));
  assert.ok(codes(result).includes('UNRESOLVED_FLAGS'));
});
test('bank catches duplicate version and reports all five level hypotheses',()=>{
  const items=LEVELS.map((level,i)=>draft({itemId:'diag-example-'+(i+1).toString().padStart(3,'0'),formFamily:'family-'+i,levelHypothesis:level}));
  const a=auditDiagnosticBank(items);
  assert.equal(a.ok,true);
  assert.equal(a.total,5);
  for(const level of LEVELS)assert.equal(a.byBand[level],1);
  const duplicate=auditDiagnosticBank([...items,items[0]]);
  assert.ok(duplicate.failures.some(x=>x.code==='DUPLICATE_VERSION'));
});
test('bank flags variants sharing the same target content family',()=>{
  const bank=auditDiagnosticBank([draft(),draft({itemId:'diag-example-002'})]);
  assert.equal(bank.sharedFamilies.length,1);
  assert.deepEqual(bank.sharedFamilies[0].items,['diag-example-001','diag-example-002']);
});
test('invalid construct, missing sense and absent item ID block authoring',()=>{
  const c=codes(validateDiagnosticItem(draft({itemId:'x',construct:'spelling',sense:''})));
  assert.ok(c.includes('ITEM_ID'));assert.ok(c.includes('CONSTRUCT'));assert.ok(c.includes('SENSE'));
});

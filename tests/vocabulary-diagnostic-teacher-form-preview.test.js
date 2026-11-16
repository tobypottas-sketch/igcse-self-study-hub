import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTeacherFormPreview } from '../src/vocabulary/diagnostic-teacher-walkthrough.js';

const make = () => ({
  form:'B',total:40,questions:Array.from({length:40},(_,i)=>({
    position:i+1,stem:'Sample prompt '+(i+1),
    options:'ABCD'.split('').map(id=>({id,text:'Choice '+id}))
  }))
});

test('accepts exactly 40 ordered, key-free real form questions',()=>{
  const data=make();
  assert.equal(validateTeacherFormPreview(data,'B').length,40);
});
test('rejects a wrong form, missing question, duplicate positions and out-of-order options',()=>{
  const data=make();
  assert.throws(()=>validateTeacherFormPreview(data,'A'));
  data.questions.pop(); assert.throws(()=>validateTeacherFormPreview(data,'B'));
  data.questions.push({...data.questions[0]}); assert.throws(()=>validateTeacherFormPreview(data,'B'));
  data.questions[39].position=40; data.questions[0].options.reverse();
  assert.throws(()=>validateTeacherFormPreview(data,'B'));
});
test('refuses answer keys and rationale in public preview payload',()=>{
  for(const [target,key] of [['question','correctOptionId'],['question','correct_option_id'],['question','rationale'],['option','correct']]){
    const data=make();
    if(target==='question')data.questions[0][key]='B';
    else data.questions[0].options[0][key]=true;
    assert.throws(()=>validateTeacherFormPreview(data,'B'));
  }
});

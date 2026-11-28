import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveVocabularyTimingContext as resolve} from '../supabase/functions/_shared/active-learning-vocabulary-resolver.js';
const c={module:'vocabulary_paraphrase',mode:'practice',unit:3,pathway:'meaning',occurrence:'o',questionType:'definition_to_word',source:'item',activity:'item:v:s'};
const lookup={publishedMember:async()=>true,occurrence:async()=>({unit_number:3,vocabulary_id:'v',sense_id:'s',status:'live',active:true}),item:async()=>({status:'live',senses:[{senseId:'s'}]}),context:async()=>null,activity:async()=>null};
test('live item and correct pathway resolve',async()=>assert.deepEqual(await resolve(c,lookup),c));
test('wrong unit, pathway, item or unsupported module rejected',async()=>{for(const patch of [{unit:4},{pathway:'context'},{activity:'item:other:s'},{module:'reading'}])assert.equal(await resolve({...c,...patch},lookup),null);});
test('inactive occurrence rejected',async()=>assert.equal(await resolve(c,{...lookup,occurrence:async()=>({...await lookup.occurrence(),active:false})}),null));
test('context must match occurrence and sense',async()=>{const x={...c,pathway:'context',questionType:'choose_word_sentence',source:'context',activity:'ctx'};assert.equal(await resolve(x,{...lookup,context:async()=>({status:'live',occurrence_id:'other',sense_id:'s',context_type:'sentence'})}),null);});

test('unpublished set membership fails closed',async()=>assert.equal(await resolve(c,{...lookup,publishedMember:async()=>false}),null));

test('a released word-family variant maps to the canonical item identity', async () => {
  const variant = {...c,pathway:'word_families',questionType:'family_multi_form',activity:'item:v:s:family:13'};
  assert.equal((await resolve(variant,lookup)).activity,'item:v:s');
  assert.equal(await resolve({...variant,activity:'item:v:other:family:13'},lookup),null);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFoundationalActivity, definitionWordDistractors } from '../src/vocabulary/foundational-activity-builder.js';
import { assessBuiltQuestion } from '../src/vocabulary/question-quality-gate.js';

function fixture(term,partOfSpeech,meaning,wrong,misleadingDistractors){
  const item={vocabularyId:'test-'+term,term,partOfSpeech,coreMeaning:meaning,
    senses:[{senseId:'s1',meaning,misleadingDistractors,
      gapDistractors:[{contextId:'gap1',answer:term,wrong}]}]};
  return {item,occurrence:{vocabularyId:item.vocabularyId,occurrenceId:'occ-'+term,senseId:'s1'},unitItems:[item],seed:'fixed'};
}
function optionsFor(args){
  return buildFoundationalActivity({activityType:'definition_to_word',readinessStage:'building',...args}).options;
}
test('guaranteed question offers comparable verbs, never long explanations',()=>{
 const args=fixture('guaranteed','verb','promised that something would definitely happen',
   ['doubted','denied','regretted'],
   ['warned that something might go wrong','asked whether something was true','refused to say whether something would happen']);
 const options=optionsFor(args);
 assert.equal(options.length,4);
 assert.ok(options.includes('guaranteed'));
 assert.deepEqual(new Set(options),new Set(['guaranteed','doubted','denied','regretted']));
 assert.ok(options.every(x=>x.trim().split(/\s+/).length===1));
});
test('outlet question uses vocabulary alternatives, not other definitions of outlet',()=>{
 const args=fixture('outlet','noun','a shop where a business sells its products',
   ['factory','office','farm'],
   ['a plug socket for electrical equipment','a pipe that carries water away','a way of expressing strong feelings']);
 const options=optionsFor(args);
 assert.deepEqual(new Set(options),new Set(['outlet','factory','office','farm']));
 assert.ok(!options.some(x=>x.startsWith('a plug')));
});
test('participant question presents plausible other roles rather than descriptions',()=>{
 const args=fixture('participant','noun','a person who takes part in an activity or event',
   ['spectator','organiser','customer'],
   ['a person who organises an event','a person who pays for an event','a person who watches an event']);
 const options=optionsFor(args);
 assert.deepEqual(new Set(options),new Set(['participant','spectator','organiser','customer']));
});
test('two-word targets use comparable two-word alternatives from same-POS unit terms',()=>{
 const args=fixture('remote control','noun','a device to operate equipment at a distance',
   ['camera case','torch','newspaper'],
   ['a person who controls a vehicle','a device that uses power','something that is far away']);
 args.unitItems.push(
   {vocabularyId:'other1',term:'phone charger',partOfSpeech:'noun'},
   {vocabularyId:'other2',term:'battery pack',partOfSpeech:'noun'}
 );
 const options=optionsFor(args);
 assert.equal(options.length,4);
 assert.ok(options.every(option=>option.split(/\s+/).length===2));
 assert.ok(options.includes('remote control'));
});
test('no comparable alternatives means no unsafe question is served',()=>{
 const args=fixture('angle of view','noun','how much of a scene is visible',
   ['camera','lens','tripod'],
   ['the distance from camera to scene','how light enters the camera','the view of the world']);
 assert.throws(()=>optionsFor(args),/three comparable vocabulary-word alternatives/);
});
test('quality gate rejects the old definition-prose leak even when a question builds',()=>{
 const q={type:'definition_to_word',options:[
  'guaranteed','asked whether something was true','warned that something might go wrong',
  'refused to say whether something would happen'],markingReference:{acceptedAnswers:['guaranteed']}};
 const verdict=assessBuiltQuestion(q);
 assert.equal(verdict.ok,false);
 assert.ok(verdict.violations.includes('NON_LEXICAL_DISTRACTOR'));
 const good=assessBuiltQuestion({...q,options:['guaranteed','doubted','denied','regretted']});
 assert.equal(good.ok,true);
});
test('authored misleading meanings can never substitute for lexical alternatives',()=>{
 const args=fixture('participant','noun','a person who takes part in something',
  ['a person who organises','a person who watches','a person who pays'],
  ['an organiser','a spectator','a customer']);
 args.unitItems.push(
  {vocabularyId:'a',term:'spectator',partOfSpeech:'noun'},
  {vocabularyId:'b',term:'organiser',partOfSpeech:'noun'},
  {vocabularyId:'c',term:'customer',partOfSpeech:'noun'}
 );
 const chosen=definitionWordDistractors(args).options;
 assert.deepEqual(new Set(chosen),new Set(['spectator','organiser','customer']));
});

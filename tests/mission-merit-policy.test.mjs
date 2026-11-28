import test from 'node:test';
import assert from 'node:assert/strict';
import {qualifyingMissions,missionMeritProgress} from '../src/vocabulary/merits.js';
const m=(stage,unit=4,set=1)=>({unit_number:unit,pathway_id:'meaning',pathway_stage:stage,mission_kind:'pathway',set_number:set,outcome:'pass',completed_at:'2026-11-27T01:00:00Z'});
test('historical passes qualify; repeated passes do not',()=>{const rows=[m('recognise'),m('match'),m('apply'),m('recognise')];assert.equal(qualifyingMissions(rows).length,3);assert.equal(missionMeritProgress(rows).eligibleByProgress,1)});
test('mastery bonus and previous awards preserved',()=>{assert.equal(missionMeritProgress([m('recognise')],1,2).earned,2);assert.equal(missionMeritProgress([m('recognise'),m('match'),m('apply')],1).eligibleByProgress,2)});
test('failed and mixed missions excluded',()=>assert.equal(qualifyingMissions([{...m('recognise'),outcome:'fail'},{...m('match'),mission_kind:'mixed'}]).length,0));

const passes=n=>Array.from({length:n},(_,i)=>m(['recognise','match','apply','recall','mastery'][i%5],4,Math.floor(i/5)+1));
test('first merit at three, subsequent merits at five-pass intervals',()=>{for(const [n,earned,next] of [[0,0,3],[2,0,1],[3,1,5],[7,1,1],[8,2,5],[13,3,5],[18,4,5],[23,5,5],[28,6,5],[30,6,3],[33,7,5]]){const s=missionMeritProgress(passes(n));assert.equal(s.eligibleByProgress,earned,'passes '+n);assert.equal(s.toNext,next,'next at '+n)}});
test('no weekly cap; mastery bonus and previous high-water mark remain',()=>{assert.equal(missionMeritProgress(passes(30),1).eligibleByProgress,7);const s=missionMeritProgress(passes(30),0,10);assert.equal(s.earned,10);assert.equal(s.eligibleByProgress,6);assert.equal(s.toNext,23);assert.equal(missionMeritProgress(passes(53),0,10).eligibleByProgress,11)});

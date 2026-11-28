import test from 'node:test';
import assert from 'node:assert/strict';
import {qualifyingMissions,missionMeritProgress} from '../src/vocabulary/merits.js';
const m=(stage,unit=4,set=1)=>({unit_number:unit,pathway_id:'meaning',pathway_stage:stage,mission_kind:'pathway',set_number:set,outcome:'pass',completed_at:'2026-11-27T01:00:00Z'});
test('historical passes qualify; repeated passes do not',()=>{const rows=[m('recognise'),m('match'),m('apply'),m('recognise')];assert.equal(qualifyingMissions(rows).length,3);assert.equal(missionMeritProgress(rows).eligibleByProgress,1)});
test('mastery bonus and previous awards preserved',()=>{assert.equal(missionMeritProgress([m('recognise')],1,2).earned,2);assert.equal(missionMeritProgress([m('recognise'),m('match'),m('apply')],1).eligibleByProgress,2)});
test('failed and mixed missions excluded',()=>assert.equal(qualifyingMissions([{...m('recognise'),outcome:'fail'},{...m('match'),mission_kind:'mixed'}]).length,0));

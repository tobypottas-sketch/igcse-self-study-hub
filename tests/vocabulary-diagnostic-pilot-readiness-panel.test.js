import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizePilotReadiness,renderPilotReadiness} from '../src/vocabulary/diagnostic-pilot-readiness.js';

const make=()=>({forms:['A','B'].map(form=>({
 formCode:'DIAG-BASELINE-'+form+'-DRAFT',status:'draft',total:40,
 bands:{A1:8,A2:8,B1:8,B2:8,C1:8},languageApproved:0,
 assessmentApproved:0,cefrVerified:0,flagged:0,reviewReady:false
}))});

test('draft forms are not marked ready despite balanced coverage and no flags',()=>{
 const forms=summarizePilotReadiness(make());
 assert.equal(forms.length,2);
 assert.deepEqual(forms.map(f=>f.label),['Form A','Form B']);
 assert.deepEqual(forms.map(f=>f.ready),[false,false]);
 assert.ok(forms.every(f=>f.balanced));
});

test('release requires a pilot form plus independent approval and CEFR evidence',()=>{
 const data=make();
 data.forms[0].status='pilot';
 data.forms[0].reviewReady=true;
 data.forms[0].languageApproved=40;
 data.forms[0].assessmentApproved=40;
 data.forms[0].cefrVerified=40;
 assert.equal(summarizePilotReadiness(data)[0].ready,true);
 data.forms[0].flagged=1;
 assert.equal(summarizePilotReadiness(data)[0].ready,false);
 data.forms[0].flagged=0;
 data.forms[0].bands.C1=7;
 assert.equal(summarizePilotReadiness(data)[0].ready,false);
});

test('rendered readiness panel is read-only and does not offer publishing',()=>{
 const html=renderPilotReadiness(make());
 assert.match(html,/Pilot readiness/);
 assert.match(html,/0\/40/);
 assert.match(html,/Previewing questions does not count as approval/);
 assert.doesNotMatch(html,/data-action="(?:approve|publish|assign|start)"/);
});

test('unexpected text is HTML escaped in the staff panel',()=>{
 const data=make();
 data.forms[0].status='<img src=x onerror=alert(1)>';
 const html=renderPilotReadiness(data);
 assert.doesNotMatch(html,/<img/);
 assert.match(html,/Not ready for student use/);
});

test('fails safely when readiness information is missing or malformed',()=>{
 assert.throws(()=>summarizePilotReadiness(null));
 assert.match(renderPilotReadiness(null),/Checking Form A and B/);
 assert.match(renderPilotReadiness({forms:[]}),/Both forms must be present/);
});

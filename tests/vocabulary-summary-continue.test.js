import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const app = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');
const views = fs.readFileSync(new URL('../src/vocabulary/views.js', import.meta.url), 'utf8');

test('session summary Continue practising action is wired to a controller handler', () => {
  assert.match(views, /data-action="continue-practice"/);
  assert.match(app, /action === 'continue-practice'/);
});

test('Continue practising resumes the same practice context and retains selection history', () => {
  const handler = app.match(/function continuePractice\(\) \{[\s\S]*?\n\}/)[0];
  const cases = [
    [{pathwayId:'context'},'pathway',['context',true]],
    [{mixedReview:true},'mixed',[true]],
    [{session:{mode:'timed',durationMinutes:5}},'session',['timed',5,true]],
    [{practiceFocus:'context'},'session',['adaptive',null,true]]
  ];
  for (const [state,route,args] of cases) {
    const calls = [];
    vm.runInNewContext(`${handler}; continuePractice();`,{state,
      startPathwaySession:(...args) => calls.push(['pathway',args]),
      startMixedReview:(...args) => calls.push(['mixed',args]),
      startSession:(...args) => calls.push(['session',args])});
    assert.deepEqual(calls,[[route,args]]);
  }
});

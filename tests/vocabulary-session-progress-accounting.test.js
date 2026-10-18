import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createSession, completeAttempt, isSessionComplete } from '../src/vocabulary/session.js';
import { renderSessionSummary, renderVocabularyUnit } from '../src/vocabulary/views.js';

const appSource = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');

test('adaptive completion is based on completed priority targets, not raw attempt count', () => {
  let session = createSession({ unitNumber:1, targetIds:['a','b'], now:new Date('2026-10-18T00:00:00Z') });
  session = completeAttempt(session, { targetId:'a', completeTarget:false, strengthened:false });
  session = completeAttempt(session, { targetId:'a', completeTarget:false, strengthened:false });
  assert.equal(session.completedAttempts.length, 2);
  assert.equal(session.completedTargetIds.length, 0);
  assert.equal(isSessionComplete(session), false);

  session = completeAttempt(session, { targetId:'a', completeTarget:true, strengthened:true });
  assert.deepEqual(session.completedTargetIds, ['a']);
  assert.equal(isSessionComplete(session), false);
  session = completeAttempt(session, { targetId:'b', completeTarget:true, strengthened:true });
  assert.equal(isSessionComplete(session), true);
});

test('live adaptive progress label uses completed targets rather than attempts', () => {
  assert.match(appSource, /state\.session\.completedTargetIds\.length} \/ \$\{state\.session\.targetIds\.length} words complete/);
  assert.doesNotMatch(appSource, /completedAttempts\.length} \/ \$\{state\.session\.targetIds\.length} activities/);
});

test('supported success does not inflate session strengthened count before the target is completed', () => {
  assert.match(appSource, /strengthened:completeTarget && result\.correct/);
});

test('unit route describes the fixed session as ten priority words, not ten activities', () => {
  const root = { innerHTML:'' };
  renderVocabularyUnit(root, { unitNumber:1, unitTitle:'Sports and free time', progress:{ mastered:0,total:50,needsAnotherLook:0,reviewDue:0 }, practiceFocus:'adaptive' });
  assert.match(root.innerHTML, /10-word session/);
  assert.match(root.innerHTML, /Ten priority words/);
  assert.doesNotMatch(root.innerHTML, /10-activity session|Ten priority activities/);
});

test('session summary labels target-level counts as words', () => {
  const root = { innerHTML:'' };
  renderSessionSummary(root, { summary:{ practised:10, strengthened:8, secure:2, mastered:1, needsAnotherLook:2 } });
  assert.match(root.innerHTML, /words completed/);
  assert.match(root.innerHTML, /words strengthened/);
  assert.match(root.innerHTML, /2 words still need another look/);
  assert.doesNotMatch(root.innerHTML, /activities completed|successful activities/);
});

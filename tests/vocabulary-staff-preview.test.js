import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderTeacherOverview } from '../src/vocabulary/teacher-views.js';
import { buildSessionFinishModel } from '../src/vocabulary/session-finish-model.js';
import { renderSessionSummary } from '../src/vocabulary/views.js';

function fakeRoot() { return { innerHTML:'' }; }

test('teacher analytics exposes a student activity preview route', () => {
  const root = fakeRoot();
  renderTeacherOverview(root, { className:'11 ESL 2' });
  assert.match(root.innerHTML, /vocabulary\.html\?preview=1/);
  assert.match(root.innerHTML, /Preview student activities/i);
});

test('teacher class chooser also exposes student activity preview', () => {
  const source = fs.readFileSync(new URL('../src/vocabulary/teacher-app.js', import.meta.url), 'utf8');
  assert.match(source, /Choose a class[\s\S]*vocabulary\.html\?preview=1/);
});

test('staff preview uses the real shared activity flow but suppresses persistence and evidence tracking', () => {
  const app = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');
  const sessionTargets = fs.readFileSync(new URL('../src/vocabulary/session-targets.js', import.meta.url), 'utf8');
  assert.match(app, /buildTargetPracticeQuestion\(/);
  assert.match(sessionTargets, /planNextActivity\(/);
  assert.match(sessionTargets, /buildActivity\(/);
  assert.equal((sessionTargets.match(/buildActivity\(/g) ?? []).length, 1, 'shared generation has one builder call site');
  assert.match(app, /if\s*\(!state\.preview\)\s+void\s+persistVocabularyAttempt\(/);
  assert.match(app, /if\s*\(!state\.preview\).*trackVocabularyEvent/s);
});

test('staff preview UI includes all four interaction primitives through the shared question renderer', () => {
  const source = fs.readFileSync(new URL('../src/vocabulary/views.js', import.meta.url), 'utf8');
  assert.match(source, /data-choice-answer/);
  assert.match(source, /data-tile-answer/);
  assert.match(source, /data-evidence-answer/);
  assert.match(source, /name="answer"/);
});

test('staff preview finish stays session-level even if supplied post-state is advanced', () => {
  const finishModel = buildSessionFinishModel({
    summary:{ practised:10, strengthened:10, needsAnotherLook:0 },
    pathwayId:'meaning',
    startStage:'match',
    postPathwayState:{ currentStage:'mastery', mastered:true, completedStages:['recognise','match','apply','recall','mastery'] },
    preview:true
  });
  assert.equal(finishModel.variant,'session');
  const target = fakeRoot();
  renderSessionSummary(target,{ summary:{ practised:10, strengthened:10, needsAnotherLook:0 }, pathwayId:'meaning', finishModel });
  assert.match(target.innerHTML,/Preview only — no progress has been saved\./);
  assert.doesNotMatch(target.innerHTML,/Your progress is saved|UNLOCKED|MEANING MASTERED/);
});

test('vocabulary router lets staff choose preview mode instead of forcing analytics', () => {
  const source = fs.readFileSync(new URL('../src/vocabulary/router.js', import.meta.url), 'utf8');
  assert.match(source, /URLSearchParams[\s\S]*\.get\(['"]preview['"]\)/);
  assert.match(source, /profile\.role === ['"]teacher['"]|profile\.role === ['"]admin['"]/);
});
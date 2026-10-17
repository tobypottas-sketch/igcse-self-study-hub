import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderTeacherOverview } from '../src/vocabulary/teacher-views.js';

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

test('staff preview uses the real activity flow but suppresses persistence and evidence tracking', () => {
  const source = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');
  assert.match(source, /buildActivity\(/);
  assert.match(source, /planNextActivity\(/);
  assert.match(source, /if\s*\(!state\.preview\)\s+void\s+persistVocabularyAttempt\(/);
  assert.match(source, /if\s*\(!state\.preview\).*trackVocabularyEvent/s);
});

test('staff preview UI includes all four interaction primitives through the shared question renderer', () => {
  const source = fs.readFileSync(new URL('../src/vocabulary/views.js', import.meta.url), 'utf8');
  assert.match(source, /data-choice-answer/);
  assert.match(source, /data-tile-answer/);
  assert.match(source, /data-evidence-answer/);
  assert.match(source, /name="answer"/);
});

test('vocabulary router lets staff choose preview mode instead of forcing analytics', () => {
  const source = fs.readFileSync(new URL('../src/vocabulary/router.js', import.meta.url), 'utf8');
  assert.match(source, /URLSearchParams[\s\S]*\.get\(['"]preview['"]\)/);
  assert.match(source, /profile\.role === ['"]teacher['"]|profile\.role === ['"]admin['"]/);
});

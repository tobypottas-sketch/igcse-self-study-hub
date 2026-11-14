import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const css=readFileSync(new URL('../vocabulary-diagnostic-student.css',import.meta.url),'utf8');
const html=readFileSync(new URL('../vocabulary.html',import.meta.url),'utf8');
const player=readFileSync(new URL('../src/vocabulary/diagnostic-student.js',import.meta.url),'utf8');

test('diagnostic wallpaper reuses the existing Hub artwork and stays scoped',()=>{
  assert.match(css,/body:has\(#vocabularyApp \.diag-player\)/);
  assert.match(css,/assets\/vocabulary\/themes\/learning-study-skills-wallpaper\.svg/);
  assert.match(css,/#vocabularyApp \.diag-(?:hero|assessment)/);
});
test('visible answer states, focus and small-screen presentation are styled',()=>{
  for(const token of ['.diag-option--selected','.diag-unsure','.diag-option:focus-within','.diag-primary:disabled','prefers-reduced-motion','max-width:600px']) assert.ok(css.includes(token),token);
  assert.match(css,/var\(--c-teal\)/);
  assert.match(css,/var\(--focus-ring\)/);
});
test('new stylesheet is cache-busted on Vocabulary entry page',()=>{
  assert.match(html,/vocabulary-diagnostic-student\.css\?v=diagnostic-theme-v2/);
});
test('UI polish leaves the student answer-submission path intact',()=>{
  assert.match(player,/requestId:crypto\.randomUUID\(\)/);
  assert.match(player,/invoke\('respond',state\.request\)/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const studentCss = fs.readFileSync(new URL('../vocabulary-extra.css', import.meta.url),'utf8');
const teacherCss = fs.readFileSync(new URL('../vocabulary-teacher.css', import.meta.url),'utf8');

test('student word detail has dedicated six-pathway layout and compact mobile fallback', () => {
  for (const selector of ['.vocab-word-pathways','.vocab-word-pathway','.vocab-word-evidence']) assert.match(studentCss,new RegExp(selector.replace('.','\\.')));
  assert.match(studentCss,/\.vocab-word-pathways\{[^}]*grid-template-columns:repeat\(6,minmax\(0,1fr\)\)/);
  assert.match(studentCss,/@media\(max-width:760px\)[\s\S]*\.vocab-word-pathways\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.doesNotMatch(studentCss,/#[a-f0-9]{3,6}[^}]*red/i);
});

test('teacher pathway matrix has dedicated wide-panel, six-column and mobile rules', () => {
  for (const selector of ['.vocab-teacher-panel--wide','.vocab-teacher-pathway-row','.vocab-teacher-pathway-cells','.vocab-teacher-pathway']) assert.match(teacherCss,new RegExp(selector.replace('.','\\.')));
  assert.match(teacherCss,/\.vocab-teacher-pathway-cells\{[^}]*grid-template-columns:repeat\(6,minmax\(0,1fr\)\)/);
  assert.match(teacherCss,/@media\(max-width:900px\)[\s\S]*\.vocab-teacher-pathway-cells\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(teacherCss,/@media\(max-width:620px\)[\s\S]*\.vocab-teacher-pathway-cells\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});

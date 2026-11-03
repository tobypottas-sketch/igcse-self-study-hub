import test from 'node:test';
import assert from 'node:assert/strict';
import { compareClassNames, sortClasses } from '../src/class-order.js';
import { readFile } from 'node:fs/promises';

const adminView = await readFile(new URL('../src/views/admin.js', import.meta.url), 'utf8');
const teacherApp = await readFile(new URL('../src/vocabulary/teacher-app.js', import.meta.url), 'utf8');

const names = [
  'G10 ESL 6', 'G9 ESL 1', 'G11 ESL 2', 'G9 ESL 4', 'G9 ESL 2',
  'G11 ESL 3', 'G10 ESL 5', 'G10 ESL 7', 'G9 ESL 5'
];

const expected = [
  'G9 ESL 1', 'G9 ESL 2', 'G9 ESL 4', 'G9 ESL 5',
  'G10 ESL 5', 'G10 ESL 6', 'G10 ESL 7',
  'G11 ESL 2', 'G11 ESL 3'
];

test('class names sort by grade then numerical class suffix', () => {
  assert.deepEqual([...names].sort(compareClassNames), expected);
});

test('class row helper preserves rows while sorting by className', () => {
  const rows = names.map((className, index) => ({ id:index, className }));
  assert.deepEqual(sortClasses(rows).map(row => row.className), expected);
});

test('vocabulary chooser and admin class menus share the class sorter', () => {
  assert.match(teacherApp, /sortClasses\(teacherState\.data\?\.classes/);
  assert.match(adminView, /import \{[^}]*sortClasses[^}]*\} from '\.\.\/class-order\.js'/);
  assert.match(adminView, /sortClasses\(model\.classes/);
  assert.match(adminView, /sortClasses\(\[\.\.\.new Map\(dashboard\.students/);
});

test('All classes remains a pinned sentinel before sorted activity options', () => {
  assert.match(adminView, /<option value=\"all\">All classes<\/option>\$\{classes\.map/);
});

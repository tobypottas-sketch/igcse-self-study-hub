import test from 'node:test';
import assert from 'node:assert/strict';
import { compareClassNames, sortClasses } from '../src/class-order.js';
import { readFile } from 'node:fs/promises';

const enhancer = await readFile(new URL('../src/class-order-enhancer.js', import.meta.url), 'utf8');
const hubHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const vocabularyHtml = await readFile(new URL('../vocabulary.html', import.meta.url), 'utf8');

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

test('shared enhancer sorts chooser/admin class cards and class select options', () => {
  assert.match(enhancer, /\.vocab-class-chooser__grid, \.admin-class-grid/);
  assert.match(enhancer, /querySelectorAll\?\.\('select'\)/);
  assert.match(enhancer, /const fixed = options\.filter\(option => !isClassName/);
  assert.match(enhancer, /const desired = \[\.\.\.fixed, \.\.\.sorted\]/);
});

test('Hub and Vocabulary both load the same versioned class-order enhancer', () => {
  assert.match(hubHtml, /src\/class-order-enhancer\.js\?v=class-order-v1/);
  assert.match(vocabularyHtml, /src\/class-order-enhancer\.js\?v=class-order-v1/);
});

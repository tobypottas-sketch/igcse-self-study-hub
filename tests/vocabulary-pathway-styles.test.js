import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = [
  'vocabulary.css',
  'vocabulary-extra.css',
  'vocabulary-refresh.css',
  'vocabulary-foundational.css'
].map(path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')).join('\n');

const requiredSelectors = [
  '.vocab-pathways',
  '.vocab-pathway-grid',
  '.vocab-pathway-card',
  '.vocab-pathway-card__head',
  '.vocab-pathway-ladder',
  '.vocab-pathway-stage',
  '.vocab-pathway-card__coverage',
  '.vocab-pathway-card__cta'
];

test('fixed vocabulary pathway UI has a complete styling contract', () => {
  for (const selector of requiredSelectors) {
    assert.match(css, new RegExp(selector.replaceAll('.', '\\.') + '(?=[\\s,{:#.\\[])'), `Missing CSS for ${selector}`);
  }
  assert.match(css, /\.vocab-pathway-stage\[data-state="current"\]/, 'Current pathway stage must have an explicit visual state');
  assert.match(css, /\.vocab-pathway-stage\[data-state="complete"\]/, 'Completed pathway stage must have an explicit visual state');
  assert.match(css, /\.vocab-pathway-card\[data-pathway-status="unavailable"\]/, 'Unavailable pathways must be deliberately styled');
  assert.match(css, /@media[^{}]*max-width[^{}]*\{[\s\S]*?\.vocab-pathway-grid/, 'Pathway grid must have responsive styling');
});

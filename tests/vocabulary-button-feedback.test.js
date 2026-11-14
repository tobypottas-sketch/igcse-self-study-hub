import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const stylesheet=readFileSync(new URL('../vocabulary-button-feedback.css', import.meta.url),'utf8');
const html=readFileSync(new URL('../vocabulary.html', import.meta.url),'utf8');

test('button feedback is loaded on the shared Vocabulary entry page',()=>{
  assert.match(html,/vocabulary-button-feedback\.css\?v=press-feel-v1/);
});

test('press interactions are scoped to the Vocabulary app and never global',()=>{
  const rules=stylesheet.split('\n').filter(line=>line.trim().startsWith('#vocabularyApp'));
  assert.ok(rules.length>=5);
  assert.ok(!stylesheet.includes('body button:active'));
  assert.ok(!stylesheet.includes('button:active {'));
});

test('click feedback covers main buttons, links, choices and semantic actions',()=>{
  assert.match(stylesheet,/:is\(button:not\(\.vocab-gap-chip\),a\.vocab-button,a\.vocab-back,a\.vocab-link,\[role="button"\]\)/);
  assert.match(stylesheet,/translateY\(2px\) scale\(\.975\)/);
  assert.match(stylesheet,/\.vocab-choice,.vocab-evidence-option/);
});

test('disabled actions, drag chips and keyboard focus are protected',()=>{
  assert.match(stylesheet,/:not\(\.vocab-gap-chip\)/);
  assert.match(stylesheet,/:not\(:disabled\):not\(\[aria-disabled="true"\]\):active/);
  assert.match(stylesheet,/:focus-visible/);
});

test('touch and reduced-motion preferences are respected',()=>{
  assert.match(stylesheet,/touch-action: manipulation/);
  assert.match(stylesheet,/@media \(hover:hover\) and \(pointer:fine\)/);
  assert.match(stylesheet,/@media \(prefers-reduced-motion: reduce\)/);
  assert.match(stylesheet,/transition: none !important/);
  assert.equal(stylesheet.split('{').length,stylesheet.split('}').length);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const meaningCss = readFileSync(new URL('../vocabulary-meaning-canvas.css', import.meta.url),'utf8');
const studyCss = readFileSync(new URL('../vocabulary-study-app.css', import.meta.url),'utf8');

test('meaning recognise questions can grow naturally and never use the retired fixed 560px canvas', () => {
  assert.doesNotMatch(meaningCss,/height:\s*560px/);
  assert.doesNotMatch(meaningCss,/max-height:\s*560px/);
  assert.match(meaningCss,/height:\s*auto/);
  assert.match(meaningCss,/max-height:\s*none/);
});

test('study question layout uses a compact mockup-like composition', () => {
  assert.match(studyCss,/\.vocab-shell--session\{[^}]*width:min\(720px/i);
  assert.match(studyCss,/\.vocab-study-question-header\{[^}]*background:linear-gradient/i);
  assert.match(studyCss,/\.vocab-question-card\[data-study-question\][\s\S]*padding:0 22px 24px/i);
  assert.match(studyCss,/\.vocab-choice-card\{[\s\S]*min-height:64px/i);
  assert.match(studyCss,/\.vocab-question-context\{[^}]*background:color-mix/i);
});

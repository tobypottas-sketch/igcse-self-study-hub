import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const meaningCss = readFileSync(new URL('../vocabulary-meaning-canvas.css', import.meta.url),'utf8');
const fidelityUrl = new URL('../vocabulary-question-fidelity.css', import.meta.url);
const html = readFileSync(new URL('../vocabulary.html', import.meta.url),'utf8');

test('meaning recognise questions can grow naturally and never use the retired fixed 560px canvas', () => {
  assert.doesNotMatch(meaningCss,/height:\s*560px/);
  assert.doesNotMatch(meaningCss,/max-height:\s*560px/);
  assert.match(meaningCss,/height:\s*auto/);
  assert.match(meaningCss,/max-height:\s*none/);
});

test('question fidelity layer is loaded after the existing study and pathway styles', () => {
  assert.ok(existsSync(fidelityUrl),'vocabulary-question-fidelity.css should exist');
  assert.match(html,/vocabulary-question-fidelity\.css/);
  assert.ok(html.indexOf('vocabulary-question-fidelity.css') > html.indexOf('vocabulary-study-art.css'));
});

test('study question layout uses a compact mockup-like composition', () => {
  assert.ok(existsSync(fidelityUrl),'vocabulary-question-fidelity.css should exist');
  const css = readFileSync(fidelityUrl,'utf8');
  assert.match(css,/\.vocab-shell--session\{[^}]*width:min\(720px/i);
  assert.match(css,/@media\(min-width:701px\)[\s\S]*?\.vocab-shell--session\{[^}]*width:min\(880px/i);
  assert.match(css,/\.vocab-study-question-header\{[^}]*background:linear-gradient/i);
  assert.match(css,/\.vocab-question-card\[data-study-question\]\{[^}]*padding:0 22px 24px/i);
  assert.match(css,/\.vocab-choice-card\{[^}]*min-height:64px/i);
  assert.match(css,/\.vocab-question-context\{[^}]*background:color-mix/i);
  assert.match(css,/\.vocab-choice-grid\{[^}]*grid-template-columns:1fr/i);
});

test('staff preview stays compact on desktop study sessions', () => {
  const css = readFileSync(fidelityUrl,'utf8');
  assert.match(css,/@media\(min-width:701px\)[\s\S]*?\.vocab-preview-banner\{[^}]*padding:8px 11px/i);
  assert.match(css,/\.vocab-preview-banner>div\{[^}]*display:flex/i);
  assert.match(css,/\.vocab-preview-banner span\{[^}]*text-overflow:ellipsis/i);
});

test('moving to the next question does not replay the full-card fade animation', () => {
  const css = readFileSync(fidelityUrl,'utf8');
  assert.match(css,/\.vocab-shell--session \.vocab-question-card\.study-enter\{[^}]*animation:none!important/i);
});

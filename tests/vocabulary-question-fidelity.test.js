import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const meaningCss = readFileSync(new URL('../vocabulary-meaning-canvas.css', import.meta.url),'utf8');
const studyArtCss = readFileSync(new URL('../vocabulary-study-art.css', import.meta.url),'utf8');
const html = readFileSync(new URL('../vocabulary.html', import.meta.url),'utf8');

test('meaning recognise questions can grow naturally and never use the retired fixed 560px canvas', () => {
  assert.doesNotMatch(meaningCss,/height:\s*560px/);
  assert.doesNotMatch(meaningCss,/max-height:\s*560px/);
  assert.match(meaningCss,/height:\s*auto/);
  assert.match(meaningCss,/max-height:\s*none/);
});

test('question fidelity styles stay in the approved study-art stylesheet', () => {
  assert.doesNotMatch(html,/vocabulary-question-fidelity\.css/);
  assert.match(html,/vocabulary-study-art\.css/);
});

test('study question layout uses a compact mockup-like composition', () => {
  assert.match(studyArtCss,/\.vocab-shell--session\{[^}]*width:min\(720px/i);
  assert.match(studyArtCss,/@media\(min-width:701px\)[\s\S]*?\.vocab-shell--session\{[^}]*width:min\(880px/i);
  assert.match(studyArtCss,/\.vocab-study-question-header\{[^}]*background:linear-gradient/i);
  assert.match(studyArtCss,/\.vocab-question-card\[data-study-question\]\{[^}]*padding:0 22px 24px/i);
  assert.match(studyArtCss,/\.vocab-choice-card\{[^}]*min-height:64px/i);
  assert.match(studyArtCss,/\.vocab-question-context\{[^}]*background:color-mix/i);
  assert.match(studyArtCss,/\.vocab-choice-grid\{[^}]*grid-template-columns:1fr/i);
});

test('staff preview stays compact on desktop study sessions', () => {
  assert.match(studyArtCss,/@media\(min-width:701px\)[\s\S]*?\.vocab-preview-banner\{[^}]*padding:8px 11px/i);
  assert.match(studyArtCss,/\.vocab-preview-banner>div\{[^}]*display:flex/i);
  assert.match(studyArtCss,/\.vocab-preview-banner span\{[^}]*text-overflow:ellipsis/i);
});

test('moving to the next question does not replay the full-card fade animation', () => {
  assert.match(studyArtCss,/\.vocab-shell--session \.vocab-question-card\.study-enter\{[^}]*animation:none/i);
});

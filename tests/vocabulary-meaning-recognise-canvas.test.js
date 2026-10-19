import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const views = fs.readFileSync(new URL('../src/vocabulary/views.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../vocabulary-refresh.css', import.meta.url), 'utf8');

test('question cards expose pathway and rung hooks for scoped layout', () => {
  assert.match(views, /class="vocab-question-card"[^>]*data-pathway="\$\{escapeHtml\(fixedPathwayId \?\? ''\)\}"/);
  assert.match(views, /data-pathway-stage="\$\{escapeHtml\(fixedPathwayStage \?\? ''\)\}"/);
  assert.match(views, /data-question-type="\$\{escapeHtml\(question\?\.type \?\? ''\)\}"/);
});

test('Meaning Recognise owns a fixed desktop quiz canvas without horizontal overflow', () => {
  assert.match(css, /@media\(min-width:801px\)[\s\S]*\.vocab-question-card\[data-pathway="meaning"\]\[data-pathway-stage="recognise"\]\{[^}]*height:/);
  assert.match(css, /\.vocab-question-card\[data-pathway="meaning"\]\[data-pathway-stage="recognise"\]\{[^}]*display:flex[^}]*flex-direction:column[^}]*overflow-x:hidden/s);
  assert.match(css, /\.vocab-question-card\[data-pathway="meaning"\]\[data-pathway-stage="recognise"\] \.vocab-response-stage[^}]*margin-top:auto/s);
  assert.match(css, /\.vocab-question-card\[data-pathway="meaning"\]\[data-pathway-stage="recognise"\] \.vocab-choice-grid[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/s);
});

test('Meaning Recognise text can wrap internally but cannot create horizontal scrolling', () => {
  assert.match(css, /\.vocab-question-card\[data-pathway="meaning"\]\[data-pathway-stage="recognise"\] \.vocab-question-prompt[^}]*overflow-wrap:anywhere/s);
  assert.match(css, /\.vocab-question-card\[data-pathway="meaning"\]\[data-pathway-stage="recognise"\] \.vocab-choice[^}]*overflow-wrap:anywhere/s);
  assert.match(css, /\.vocab-shell--session[^}]*min-width:0/s);
});

test('narrow mobile Meaning Recognise falls back to natural height and one-column answers', () => {
  assert.match(css, /@media\(max-width:520px\)[\s\S]*\.vocab-question-card\[data-pathway="meaning"\]\[data-pathway-stage="recognise"\]\{[^}]*height:auto[^}]*min-height:0/s);
  assert.match(css, /@media\(max-width:520px\)[\s\S]*\.vocab-question-card\[data-pathway="meaning"\]\[data-pathway-stage="recognise"\] \.vocab-choice-grid\{[^}]*grid-template-columns:1fr/s);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../vocabulary.html', import.meta.url),'utf8');
let css = '';
try { css = readFileSync(new URL('../vocabulary-study-app.css', import.meta.url),'utf8'); } catch {}

test('vocabulary page loads the shared study-app stylesheet after existing vocabulary component styles', () => {
  assert.match(html,/vocabulary-study-app\.css/);
  assert.ok(html.indexOf('vocabulary-study-app.css') > html.indexOf('vocabulary-meaning-canvas.css'));
});

test('study app defines restrained shared motion tokens in approved ranges', () => {
  assert.match(css,/--study-motion-press:\s*120ms/);
  assert.match(css,/--study-motion-state:\s*160ms/);
  assert.match(css,/--study-motion-question:\s*190ms/);
  assert.match(css,/--study-motion-stage:\s*520ms/);
  assert.match(css,/--study-motion-celebrate:\s*720ms/);
});

test('study app exposes all six pathway accents and common motion classes', () => {
  for (const accent of ['meaning','context','word-families','paraphrasing','precision','spelling']) {
    assert.match(css,new RegExp(`\\[data-study-accent=["']${accent}["']\\]`));
  }
  for (const cls of ['study-icon','study-progress','study-enter','study-success','study-error','study-milestone']) {
    assert.match(css,new RegExp(`\\.${cls}\\b`));
  }
});

test('answer option letters are rendered as separate visual key badges', () => {
  assert.match(css,/\.vocab-choice-card\s*\{/);
  assert.match(css,/\.vocab-choice-card__key\s*\{/);
  assert.match(css,/border-radius:\s*50%/);
  assert.match(css,/display:\s*inline-grid/);
  assert.match(css,/gap:\s*14px/);
});

test('question screen has the mockup hierarchy rather than generic form styling', () => {
  assert.match(css,/\.vocab-study-question-header\s*\{/);
  assert.match(css,/\.vocab-study-question-header__path\s*\{/);
  assert.match(css,/\.vocab-question-card\[data-study-question\]/);
  assert.match(css,/\.vocab-choice-grid\s*\{/);
  assert.match(css,/grid-template-columns:\s*repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/\.vocab-question-session-progress\s*\{/);
});

test('completion and milestone screens have distinct visual structures', () => {
  assert.match(css,/\.vocab-summary-card\[data-study-completion\]/);
  assert.match(css,/\.vocab-summary-grid\s*\{/);
  assert.match(css,/\[data-study-milestone="stage_advanced"\]/);
  assert.match(css,/\[data-study-milestone="mastered"\]/);
});

test('reduced motion disables new transitions and animations', () => {
  assert.match(css,/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css,/animation-duration:\s*0\.01ms\s*!important/);
  assert.match(css,/transition-duration:\s*0\.01ms\s*!important/);
});

test('keyboard focus, mobile layout, wrapping and overflow safeguards are explicit', () => {
  assert.match(css,/:focus-visible/);
  assert.match(css,/@media\s*\(max-width:\s*620px\s*\)/);
  assert.match(css,/min-width:\s*0/);
  assert.match(css,/overflow-wrap:\s*anywhere/);
  assert.match(css,/overflow-x:\s*clip/);
});

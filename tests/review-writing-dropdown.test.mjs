import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const review = readFileSync('review-writing.html', 'utf8');
const email = readFileSync('email-writing-app.html', 'utf8');
const emailCss = readFileSync('email-writing-hub-polish.css', 'utf8');
const fn = (html, name) => { const from = html.indexOf('function ' + name); return html.slice(from, html.indexOf('\n}\n', from)); };
const reviewCombo = fn(review, 'enhanceQuestionSelect');
const emailCombo = fn(email, 'enhanceTaskSelect');
const squash = text => text.replace(/\s+/g, '');

test('Review Writing uses the same listbox pattern as Informal Email instead of a native select menu', () => {
  assert.ok(reviewCombo.length > 1500 && emailCombo.length > 1500);
  // Behaviours that make the Email picker smooth: bounded list, roles, keyboard model, click-outside, Escape, focus return, type-ahead.
  for (const piece of ["setAttribute('aria-haspopup','listbox')", "setAttribute('role','listbox')", "setAttribute('role','option')", "'aria-activedescendant'", "document.addEventListener('pointerdown',outside,true)", "window.addEventListener('resize',place)",
    "list.scrollTop=", "row*6.5+8", "classList.toggle('is-up',up)", "k==='Escape')close(true)", "k==='Tab'){close(false);return;}", "'PageDown'", "'Home'", "'End'", "focus({preventScroll:true})", "dispatchEvent(new Event('change',{bubbles:true}))", "tabIndex=-1;select.setAttribute('aria-hidden','true')"]) {
    assert.ok(squash(reviewCombo).includes(squash(piece)), 'Review: ' + piece);
  }
  for (const piece of ["setAttribute('aria-haspopup', 'listbox')", "setAttribute('role', 'listbox')", "row * 6.5 + 8", "classList.toggle('is-up', up)", "k === 'Escape') close(true)", "k === 'Tab') { close(false); return; }"]) assert.ok(emailCombo.includes(piece), 'Email still has: ' + piece);
});

test('the combo keeps the native select as the source of truth (same id and change event) and hides it', () => {
  assert.match(review, /<select id="questionSelect"/);
  assert.match(review, /questionCombo=enhanceQuestionSelect\(\$\('questionSelect'\)\);\s*load\(\);/);
  assert.match(review, /\.task-select-native\{position:absolute!important;width:1px!important;height:1px!important;/);
  assert.doesNotMatch(review, /<label class="label" for="questionSelect"/, 'a label for the hidden select would focus it');
});

test('the dimensions follow Informal Email: 560px wide, 46px button, 44px rows, bounded scrolling list above the page', () => {
  for (const rule of ['max-width:560px', 'min-height:46px', 'min-height:44px', 'z-index:30', 'overflow-y:auto', 'overscroll-behavior:contain', 'bottom:calc(100% + 4px)']) {
    assert.ok(squash(review).includes(squash(rule)), 'Review CSS ' + rule);
    assert.ok(squash(emailCss).includes(squash(rule)), 'Email CSS ' + rule);
  }
  assert.match(review, /@media\(max-width:540px\)\{\.task-combo\{width:100%\}\}/);
  assert.doesNotMatch(review, /\.question-picker select\{/, 'the old full-width native select styling is gone');
});

test('the picker stays locked while AI feedback is being prepared, and rebuilds its options when the category changes', () => {
  assert.match(review, /if\(questionCombo\)questionCombo\.setDisabled\(busy\);/);
  assert.match(reviewCombo, /setDisabled\(disabled\)\{btn\.disabled=disabled;if\(disabled\)close\(false\);\}/);
  assert.match(reviewCombo, /if\(!list\.hidden\|\|btn\.disabled\)return;/);
  assert.match(reviewCombo, /if\(optionKey!==builtFor\)build\(\);/);
  assert.match(review, /if\(questionCombo\)questionCombo\.sync\(\);/);
});

test('this change leaves the 20 questions, their wording and the Informal Email picker alone', () => {
  assert.match(email, /function enhanceTaskSelect\(select\)/);
  assert.equal((review.match(/id:'(restaurant|film|book|experience)-\d',title:/g) || []).length, 20);
});

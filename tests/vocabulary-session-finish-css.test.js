import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../vocabulary.html', import.meta.url),'utf8');
const css = readFileSync(new URL('../vocabulary-session-finish.css', import.meta.url),'utf8');

test('finish stylesheet loads after shared study art so scoped overrides win safely', () => {
  assert.match(html,/vocabulary-session-finish\.css/);
  assert.ok(html.indexOf('vocabulary-session-finish.css') > html.indexOf('vocabulary-study-art.css'));
});

test('mission finish card has dedicated stars evidence ladder and action layouts', () => {
  for (const cls of ['vocab-shell--finish','vocab-finish-card','vocab-finish-stars','vocab-finish-evidence','vocab-finish-ladder','vocab-finish-stage','vocab-finish-actions']) {
    assert.match(css,new RegExp(`\\.${cls}\\b`));
  }
  assert.match(css,/\.vocab-finish-evidence\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/s);
  assert.match(css,/\.vocab-finish-actions\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/s);
});

test('finish variants use the approved restrained animation envelopes', () => {
  assert.match(css,/--finish-motion-session:620ms/);
  assert.match(css,/--finish-motion-stage:820ms/);
  assert.match(css,/--finish-motion-mastery:980ms/);
  assert.match(css,/data-finish-variant="session"/);
  assert.match(css,/data-finish-variant="stage-complete"/);
  assert.match(css,/data-finish-variant="mastered"/);
  assert.doesNotMatch(css,/2000ms/);
});

test('mobile finish layout stacks actions and cannot force horizontal scrolling', () => {
  assert.match(css,/@media\s*\(max-width:620px\)/);
  assert.match(css,/\.vocab-finish-actions\{grid-template-columns:1fr\}/);
  assert.match(css,/\.vocab-finish-ladder\{[^}]*min-width:0/s);
  assert.match(css,/\.vocab-finish-stage\{[^}]*min-width:0/s);
});

test('finish-specific reduced motion disables card star artwork and stage animations', () => {
  assert.match(css,/@media\s*\(prefers-reduced-motion:reduce\)/);
  for (const token of ['vocab-finish-card','vocab-finish-stars','vocab-completion-art__image','vocab-finish-stage']) {
    assert.match(css,new RegExp(token));
  }
  assert.match(css,/animation:none!important/);
});

test('screen-reader summary is visually hidden without removing it from accessibility tree', () => {
  assert.match(css,/\.vocab-finish-sr\{[^}]*position:absolute[^}]*width:1px[^}]*height:1px/s);
  assert.match(css,/clip:rect\(0 0 0 0\)/);
});

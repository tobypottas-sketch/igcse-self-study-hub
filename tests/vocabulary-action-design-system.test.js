import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const css=read('vocabulary-action-design-system.css');

test('shared action styling loads last, after existing component and reward styles',()=>{
 const html=read('vocabulary.html');
 const sheet='vocabulary-action-design-system.css?v=shared-actions-v1';
 assert.ok(html.indexOf(sheet)>html.indexOf('vocabulary-support-buttons.css'));
 assert.ok(html.indexOf(sheet)>html.indexOf('vocabulary-rewards-dashboard.css'));
 assert.ok(html.indexOf(sheet)>html.indexOf('vocabulary-header-identity-space.css'));
});

test('visual variants cover shared actions, unit check, mixed practice and vocabulary bank',()=>{
 for(const selector of ['.vocab-button--primary','.vocab-button--bank',
  '.vocab-unit-check-card__cta','.vocab-support-card--mixed',
  '.vocab-summary-actions','.vocab-unit-check-nav','.vocab-back--chip']){
  assert.ok(css.includes(selector),selector+' missing');
 }
 assert.match(css,/linear-gradient\(112deg/);
 assert.match(css,/focus-visible/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/aria-disabled="true"/);
 assert.match(css,/@media\(max-width:520px\)/);
});

test('assessment choices, game answers, word tiles and grading states are not restyled',()=>{
 for(const selector of ['.vocab-choice','.vocab-tile','.gm-option',
  '.vocab-unit-check-choice','.vocab-unit-check-question-nav__item',
  '.vocab-answer--correct','.vocab-feedback--incorrect']){
  assert.ok(!css.includes(selector),selector+' must retain its task-specific styling');
 }
 const views=read('src/vocabulary/views.js');
 assert.match(views,/data-action="start-mixed-review"/);
 assert.match(views,/data-action="view-all-words"/);
 const unitCheck=read('src/vocabulary/unit-check-view.js');
 assert.match(unitCheck,/vocab-button vocab-button--primary vocab-unit-check-card__cta/);
 assert.match(unitCheck,/data-unit-check-action="start"/);
});

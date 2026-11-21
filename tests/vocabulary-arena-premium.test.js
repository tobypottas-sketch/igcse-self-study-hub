// Unified Vocabulary arena regression checks.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(root,'vocabulary-arena-premium.css'),'utf8');
const html=fs.readFileSync(path.join(root,'vocabulary.html'),'utf8');
const views=fs.readFileSync(path.join(root,'src/vocabulary/views.js'),'utf8');
test('unified cards own noncolliding layout',()=>{
 for(const term of ['grid-template-areas','identity art','status art','coverage art','evidence evidence','ladder ladder','cta cta'])
  assert.ok(css.includes(term),term);
 assert.match(css,/\.vocab-pathway-card__art\.has-png/);
 assert.match(css,/position:relative!important/);
 assert.match(css,/max-width:620px/);
 assert.match(css,/max-width:380px/);
});
test('accessible responsive progression retains current/completed/locked states',()=>{
 for(const marker of ['data-state="current"','data-state="complete"','data-state="locked"','focus-visible','forced-colors:active'])
  assert.ok(css.includes(marker),marker);
 assert.doesNotMatch(css,/vocab-shell--session\s*\{/);
});

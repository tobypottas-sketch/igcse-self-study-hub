// Unified Vocabulary arena regression checks.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(root,'vocabulary-arena-premium.css'),'utf8');
const html=fs.readFileSync(path.join(root,'vocabulary.html'),'utf8');
const views=fs.readFileSync(path.join(root,'src/vocabulary/views.js'),'utf8');
test('availability count is semantic and never a white chip',()=>{
 assert.match(views,/class="vocab-pathway-card__coverage-label">WORD COVERAGE/);
 assert.match(views,/class="vocab-pathway-card__coverage-count"/);
 assert.match(views,/state\.coverageCount \/ Math\.max\(1,state\.totalCount\)/);
 assert.match(css,/\.vocab-pathway-card__coverage:not\(\.vocab-pathway-card__held\)/);
 assert.match(css,/background:none!important/);
});
test('stage label and mission panel are readable and phase-aware',()=>{
 for(const t of ['vocab-pathway-card__status-label','vocab-pathway-card__status-value','data-set-phase','data-pathway-to-clear'])
  assert.ok(views.includes(t),t);
 assert.match(views,/Follow-up · Pass with 8\/10 correct/);
 assert.match(views,/Recovery mission, then one fresh mission/);
 assert.match(css,/\.vocab-pathway-card__to-clear/);
});
test('CTA is a span inside one parent interactive button',()=>{
 assert.match(views,/class="vocab-pathway-card__cta"/);
 assert.match(css,/border-radius:5px!important/);
 assert.match(css,/\.vocab-pathway-stage\[data-state="current"\]/);
});

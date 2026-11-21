// Unified Vocabulary arena regression checks.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(root,'vocabulary-arena-premium.css'),'utf8');
const html=fs.readFileSync(path.join(root,'vocabulary.html'),'utf8');
const views=fs.readFileSync(path.join(root,'src/vocabulary/views.js'),'utf8');
test('legacy cascade was retired, not patched a fourth time',()=>{
 assert.match(html,/vocabulary-arena-premium\.css\?v=unified-arena-20261121/);
 assert.doesNotMatch(html,/vocabulary-arena-theme-contrast\.css|vocabulary-arena-premium-repair\.css/);
 assert.ok(!fs.existsSync(path.join(root,'vocabulary-arena-premium-repair.css')));
 assert.ok(!fs.existsSync(path.join(root,'vocabulary-arena-theme-contrast.css')));
});
test('text and backing surfaces use matching shared ink variables',()=>{
 for(const term of ['--unit-ink','--unit-sub','--unit-line','color:var(--unit-ink)!important','background:none!important'])
  assert.ok(css.includes(term),term);
});

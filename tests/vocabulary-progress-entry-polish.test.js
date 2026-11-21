const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(root,'vocabulary-progress.css'),'utf8');
const views=fs.readFileSync(path.join(root,'src/vocabulary/views.js'),'utf8');
const html=fs.readFileSync(path.join(root,'vocabulary.html'),'utf8');
test('Journey gateway retains the original navigation action',()=>{
 assert.match(views,/class="vocab-progress-entry"/);
 assert.match(views,/data-action="open-my-progress"/);
 assert.match(views,/data-my-progress-error/);
});
test('gateway remains a compact single-row entry with an accessible action',()=>{
 assert.match(css,/#vocabularyApp \.vocab-shell--home>\.vocab-progress-entry\{/);
 assert.match(css,/min-height:99px!important/);
 assert.match(css,/border-radius:6px!important/);
 assert.match(css,/button:focus-visible/);
 assert.match(css,/button:disabled/);
 assert.match(css,/@media\(max-width:640px\)/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/forced-colors:active/);
});
test('CSS is refreshed without touching progress data modules',()=>{
 assert.match(html,/vocabulary-progress\.css\?v=progress-entry-polish-v3/);
 assert.match(css,/\.vocab-shell--journey/);
});

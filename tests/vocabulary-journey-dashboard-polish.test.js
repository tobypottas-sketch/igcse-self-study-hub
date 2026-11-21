// Vocabulary Journey visual polish — do not change underlying student evidence.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const js=fs.readFileSync(path.join(root,'src/vocabulary/student-progress.js'),'utf8');
const css=fs.readFileSync(path.join(root,'vocabulary-progress.css'),'utf8');
const html=fs.readFileSync(path.join(root,'vocabulary.html'),'utf8');
const app=fs.readFileSync(path.join(root,'src/vocabulary/app.js'),'utf8');
const router=fs.readFileSync(path.join(root,'src/vocabulary/router.js'),'utf8');

test('data definitions and authenticated read path remain unchanged',()=>{
 for(const token of ["function persistedCompletions(", "export function summariseVocabularyProgress(",
   "countQuery=client.from('activity_events')", "row.status==='mastered'",
   "engagement?.weekly ?? null", "wordsProgressing", "completedMissions=missions.length"])
   assert.ok(js.includes(token),token);
 assert.match(js,/if \(preview\) return \{ attempts:null/);
 assert.match(js,/await Promise\.allSettled\(\[attemptsRequest,timeRequest\]\)/);
});
test('Journey uses compact hierarchy and hides explanatory density',()=>{
 for(const t of ['YOUR LEARNING DASHBOARD','Vocabulary <em>Journey</em>',
  'vocab-journey-stat__head','vocab-journey-week__top','Your skill progression',
  '<details class="vocab-journey-help">','How is progress counted?',
  'vocab-journey-pathway__track','aria-valuenow'])
   assert.ok(js.includes(t),t);
 assert.doesNotMatch(js,/MY VOCABULARY JOURNEY/);
 assert.doesNotMatch(js,/Words progressing have completed at least one stage in that pathway\. The bars show/);
});
test('theme colours, layout, accessibility and responsive sizing',()=>{
 for(const t of ['vocab-journey-hero','vocab-journey-stats','vocab-journey-stat',
 'vocab-journey-week','vocab-journey-pathways-panel',
 'data-pathway-tone="context"','data-pathway-tone="families"',
 'data-pathway-tone="paraphrasing"','data-pathway-tone="precision"',
 'data-pathway-tone="recall"','max-width:900px','max-width:560px','max-width:360px',
 'forced-colors:active','focus-visible'])
  assert.ok(css.includes(t),t);
 assert.match(css,/\.vocab-journey-stat>strong/);
 assert.match(css,/\.vocab-journey-pathway__sr/);
});
test('asset cache paths are refreshed for returning students',()=>{
 assert.match(html,/vocabulary-progress\.css\?v=journey-dashboard-v2/);
 assert.match(html,/router\.js\?v=journey-dashboard-v2/);
 assert.match(router,/app\.js\?v=journey-dashboard-v2/);
 assert.match(app,/student-progress\.js\?v=journey-dashboard-v2/);
});

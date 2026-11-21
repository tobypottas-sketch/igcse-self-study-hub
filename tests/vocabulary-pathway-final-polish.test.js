// Regression guard for compact, premium Vocabulary pathway cards.
// Run: node --test tests/vocabulary-pathway-final-polish.test.js
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const views=fs.readFileSync(path.join(root,'src/vocabulary/views.js'),'utf8');
const css=fs.readFileSync(path.join(root,'vocabulary-arena-premium-repair.css'),'utf8');

test('word availability is data-driven, never shown as a white chip or mastery',()=>{
 assert.match(views,/class="vocab-pathway-card__coverage-label">WORD COVERAGE/);
 assert.match(views,/class="vocab-pathway-card__coverage-count"/);
 assert.match(views,/aria-label="\$\{escapeHtml\(state\.coverageCount\)\} of \$\{escapeHtml\(state\.totalCount\)\} words available"/);
 assert.match(views,/state\.coverageCount \/ Math\.max\(1,state\.totalCount\)/);
 assert.match(views,/class="vocab-pathway-card__coverage-track" aria-hidden="true"/);
 assert.match(css,/\.vocab-pathway-card__coverage:not\(\.vocab-pathway-card__held\)/);
 assert.match(css,/background:none!important/);
});

test('stage status has a separate label and preserves progress states',()=>{
 assert.match(views,/class="vocab-pathway-card__status-label"/);
 assert.match(views,/class="vocab-pathway-card__status-value"/);
 assert.match(views,/const statusEyebrow = unavailable/);
 assert.match(views,/state\.set\?\.firstPassComplete \? 'Maintain'/);
 assert.match(views,/data-state="\$\{visualState\}"/);
 assert.match(css,/\.vocab-pathway-card__status-label/);
 assert.match(css,/\.vocab-pathway-card__status-value/);
});

test('missions stay phase-aware, concise and accessible',()=>{
 assert.match(views,/Follow-up · Pass with 8\/10 correct/);
 assert.match(views,/Recovery mission, then one fresh mission/);
 assert.match(views,/Fresh mission · Pass with 8\/10 correct/);
 assert.match(views,/data-set-phase="\$\{escapeHtml\(set\.phase\)\}"/);
 assert.match(views,/data-pathway-to-clear/);
 assert.match(css,/\.vocab-pathway-card__to-clear/);
});

test('track keeps five stages, responsive controls and one parent button',()=>{
 assert.match(views,/PATHWAY_STAGES\.map/);
 assert.match(views,/<button type="button" class="vocab-pathway-card/);
 assert.match(views,/class="vocab-pathway-card__cta"/);
 assert.doesNotMatch(views,/class="vocab-pathway-card__cta"><button/);
 assert.match(css,/\.vocab-pathway-stage\[data-state="locked"\]/);
 assert.match(css,/border-radius:5px!important/);
 assert.match(css,/@media\(max-width:620px\)/);
});

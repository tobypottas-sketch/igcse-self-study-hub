import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderVocabularyUnit } from '../src/vocabulary/views.js';

const css = fs.readFileSync(new URL('../vocabulary-layout-stability.css', import.meta.url), 'utf8');

function root(){ return { innerHTML:'' }; }

test('pathway cards render the evidence shell on first paint instead of inserting it later', () => {
  const target = root();
  renderVocabularyUnit(target,{
    unitNumber:1,
    unitTitle:'Sports and Free Time',
    progress:{ mastered:0,total:50,needsAnotherLook:0,reviewDue:0,stages:{} },
    pathwayStates:{
      meaning:{ currentStage:'recognise',coverageCount:48,totalCount:50,available:true }
    }
  });
  const meaningCard = target.innerHTML.match(/<button[^>]*data-pathway="meaning"[\s\S]*?<\/button>/)?.[0] ?? '';
  assert.match(meaningCard,/class="vocab-pathway-card__evidence"/);
  assert.match(meaningCard,/data-pathway-evidence-shell/);
  assert.match(meaningCard,/Recognise evidence/);
  assert.match(meaningCard,/No saved evidence yet/);
  assert.ok(
    meaningCard.indexOf('vocab-pathway-card__evidence') < meaningCard.indexOf('vocab-pathway-ladder'),
    'evidence shell should be present before the ladder in the initial HTML'
  );
});

test('pathway cards reserve a dedicated evidence row from first paint', () => {
  assert.match(css, /grid-template-areas:\s*"identity status"\s*"coverage coverage"\s*"evidence evidence"\s*"ladder ladder"\s*"cta cta"/s);
  assert.match(css, /grid-template-rows:\s*auto\s+auto\s+minmax\(60px,auto\)/s);
  assert.match(css, /\.vocab-pathway-card__evidence\s*\{[^}]*grid-area:evidence[^}]*width:100%[^}]*min-height:60px/s);
});

test('pathway card header uses explicit regions with generous spacing', () => {
  assert.match(css, /\.vocab-pathway-card\s*\{[^}]*column-gap:28px[^}]*row-gap:16px[^}]*padding:28px 30px 24px/s);
  assert.match(css, /\.vocab-pathway-card__identity\s*\{[^}]*grid-area:identity[^}]*display:flex/s);
  assert.match(css, /\.vocab-pathway-card__status\s*\{[^}]*grid-area:status[^}]*justify-self:end/s);
  assert.match(css, /\.vocab-pathway-card__coverage\s*\{[^}]*grid-area:coverage[^}]*justify-self:start/s);
  assert.match(css, /\.vocab-pathway-ladder\s*\{[^}]*grid-area:ladder/s);
  assert.match(css, /\.vocab-pathway-card__cta\s*\{[^}]*grid-area:cta/s);
});

test('decorative pathway artwork is restored without participating in card layout', () => {
  assert.doesNotMatch(css, /\.vocab-pathway-card__art\s*\{[^}]*display:none!important/s);
  assert.match(css, /\.vocab-pathway-card__art\s*\{[^}]*position:absolute/s);
  assert.match(css, /\.vocab-pathway-card__art\s*\{[^}]*pointer-events:none/s);
  assert.match(css, /\.vocab-pathway-card__art\s*\{[^}]*z-index:0/s);
  assert.match(css, /\.vocab-pathway-card\s*>\s*:not\(\.vocab-pathway-card__art\)\s*\{[^}]*z-index:1/s);
});

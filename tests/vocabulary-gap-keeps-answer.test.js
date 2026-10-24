import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderVocabularyQuestion } from '../src/vocabulary/views.js';
const question = { type:'fill_the_gap', responseMode:'drag_gap', prompt:'Drag the correct word into the gap.', sourceText:'The charity continues to ____ the government to increase funding.', draggables:['order','instruct','make','urge'], answer:'urge' };
function html(feedback) { const root = { innerHTML:'' }; renderVocabularyQuestion(root, { unitNumber:1, unitTitle:'U', question, term:'urge', sessionLabel:'x', feedback }); return root.innerHTML; }
test('correct drag-gap answer keeps the word in the sentence, styled gold', () => {
  const out = html({ correct:true, message:'Nailed it', filledAnswer:'urge' });
  assert.match(out, /class="vocab-gap-slot is-filled vocab-gap-filled is-correct-answer"[^>]*>urge<\/span>/);
});
test('before checking (and on a wrong answer) the gap stays empty', () => {
  for (const feedback of [null, { correct:false, message:'Try again' }]) { const out = html(feedback); assert.match(out, /data-gap-slot aria-label="Gap in the sentence">____/); assert.doesNotMatch(out, /is-correct-answer/); }
});
test('app passes the learner answer on a correct check, and CSS has gold + reduced motion', () => {
  assert.match(readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8'), /filledAnswer:result\.correct \? String\(rawAnswer/);
  const css = readFileSync(new URL('../vocabulary-support.css', import.meta.url), 'utf8');
  assert.match(css, /\.vocab-gap-slot\.is-correct-answer/);
  assert.match(css, /prefers-reduced-motion:reduce\)\{\.vocab-gap-slot\.is-correct-answer::after/);
});

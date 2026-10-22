import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { questionLook } from '../src/vocabulary/views.js';

test('questionLook maps question types to activity-family looks', () => {
  assert.equal(questionLook({ type:'word_family_choice', responseMode:'choice' }), 'family');
  assert.equal(questionLook({ type:'build_paraphrase' }), 'paraphrase');
  assert.equal(questionLook({ type:'type_missing_word' }), 'recall');
  assert.equal(questionLook({ type:'definition_to_word', responseMode:'choice' }), 'choose');
  assert.equal(questionLook(null), 'other');
});
test('families CSS loads before the accessibility layer and respects reduced motion', () => {
  const html = readFileSync(new URL('../vocabulary.html', import.meta.url), 'utf8');
  assert.match(html, /vocabulary-families\.css[\s\S]*vocabulary-a11y\.css/);
  assert.match(readFileSync(new URL('../vocabulary-families.css', import.meta.url), 'utf8'), /prefers-reduced-motion:reduce/);
});

import { renderVocabularyQuestion } from '../src/vocabulary/views.js';
test('the entrance cue is only on a new question, not on repaints of the same one', () => {
  const q = { type:'meaning_match', prompt:'What does "zq-unique" mean?', responseMode:'choice', options:['a','b'], pathwayId:'meaning', pathwayStage:'recognise' };
  const render = extra => { const root = { innerHTML:'', querySelector:() => null }; renderVocabularyQuestion(root, { unitNumber:1, unitTitle:'U', question:q, term:'zq', sessionLabel:'P', pathwayId:'meaning', pathwayStage:'recognise', sessionPosition:1, ...extra }); return root.innerHTML; };
  assert.match(render(), /data-question-fresh/);
  assert.doesNotMatch(render(), /data-question-fresh/);
  assert.doesNotMatch(render({ feedback:{ correct:true, message:'ok' } }), /data-question-fresh/);
});

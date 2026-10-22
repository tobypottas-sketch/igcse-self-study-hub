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

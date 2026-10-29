import test from 'node:test';
import assert from 'node:assert/strict';
import { renderVocabularyQuestion } from '../src/vocabulary/views.js';

function render(question) {
  const root = { innerHTML:'' };
  renderVocabularyQuestion(root, {
    unitNumber:1,
    unitTitle:'Sports and Free Time',
    question,
    term:'encourage',
    sessionLabel:'1 / 10 activities'
  });
  return root.innerHTML;
}

test('context appended to a task prompt is split into a separate reading beat', () => {
  const context = 'Doctors urge teenagers to stay active for their health.';
  const html = render({
    type:'meaning_in_context', responseMode:'choice',
    prompt:`What does “urge” mean in this context? ${context}`,
    sourceText:context,
    options:['strongly encourage','ignore','prevent','describe']
  });
  assert.match(html, /<h1 class="vocab-question-prompt">What does “urge” mean in this context\?<\/h1>/);
  assert.match(html, /<span>In context<\/span><p>Doctors urge teenagers to stay active for their health\.<\/p>/);
  assert.equal((html.match(/Doctors urge teenagers to stay active for their health\./g) ?? []).length, 1);
});

test('quoted source is shown once in its own panel, outside the instruction', () => {
  const phrase = 'strongly encourage students to';
  const html = render({
    type:'phrase_match', responseMode:'choice',
    prompt:`Which phrase keeps the meaning of “${phrase}”?`,
    sourcePhrase:phrase,
    options:['urge students to','stop students from','allow students to','ask students about']
  });
  assert.match(html, /<h1 class="vocab-question-prompt">Which phrase keeps the meaning\?<\/h1>/);
  assert.match(html, /Original phrase/);
  assert.equal((html.replace(/<[^>]*>/g, '').match(/strongly encourage students to/g) ?? []).length, 1);
});

test('a genuinely additional source remains visible even when task wording is short', () => {
  const html = render({
    type:'same_idea', responseMode:'choice',
    prompt:'Which sentence has the same meaning?',
    sourceIdea:'Regular exercise can improve both physical and mental health.',
    options:['Exercise may help the body and mind.','Exercise only changes appearance.']
  });
  assert.match(html, /Original idea/);
  assert.match(html, /Regular exercise can improve both physical and mental health\./);
});

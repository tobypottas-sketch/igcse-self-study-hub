import test from 'node:test';
import assert from 'node:assert/strict';
import { renderVocabularyQuestion } from '../src/vocabulary/views.js';

const render = (question, extra = {}) => {
  const root = { innerHTML:'' };
  renderVocabularyQuestion(root, { unitNumber:1, unitTitle:'Synthetic unit', term:'thrilling', sessionLabel:'1 / 10', question, ...extra });
  return root.innerHTML;
};
const heading = html => html.match(/<h1 class="vocab-question-prompt">([\s\S]*?)<\/h1>/)?.[1];

test('instruction comes before the visible target and context, then the existing answers', () => {
  const html = render({ type:'meaning_match', responseMode:'choice', prompt:'Which meaning fits?', sourceText:'The final was thrilling.', options:['exciting','quiet'] });
  assert.ok(html.indexOf('vocab-question-prompt') < html.indexOf('vocab-target-pill'));
  assert.ok(html.indexOf('vocab-target-pill') < html.indexOf('vocab-question-context'));
  assert.match(html, /The final was <strong class="vocab-target-language">thrilling<\/strong>\./);
  assert.ok(html.indexOf('vocab-question-context') < html.indexOf('vocab-answer-form'));
  assert.match(html, /data-choice-answer="exciting"/);
});

test('typed Context and Word Families gaps are visible slots without interactive drag hooks', () => {
  for (const type of ['type_missing_word','word_family_switch']) {
    const html = render({ type, responseMode:'text', prompt:'Complete the sentence.', sourceText:'It was a ____ event.' });
    assert.match(html, /class="vocab-language-gap" role="img" aria-label="Missing word">____<\/span>/);
    assert.doesNotMatch(html, /data-gap-slot/);
    assert.match(html, /<input name="answer" required/);
    assert.doesNotMatch(html, /vocab-target-pill/);
  }
});

test('Paraphrasing separates original phrase and exact incomplete rewrite from instruction', () => {
  const q = { type:'complete_paraphrase', responseMode:'text', prompt:'Complete the paraphrase of “very exciting”: ___', sourcePhrase:'very exciting', markingReference:{ acceptedAnswers:['thrilling'] } };
  const before = structuredClone(q);
  const html = render(q);
  assert.equal(heading(html), 'Complete the paraphrase.');
  assert.match(html, /<span>Original phrase<\/span><p>very exciting<\/p>/);
  assert.match(html, /<span>Your rewrite<\/span><p><span class="vocab-language-gap"/);
  assert.equal((html.match(/very exciting/g) ?? []).length, 1);
  assert.doesNotMatch(html, /thrilling/);
  assert.deepEqual(q, before);
});

test('quoted phrase tasks move the original into one panel and retain the task meaning', () => {
  const html = render({ type:'phrase_match', responseMode:'choice', prompt:'Which phrase keeps the meaning of “very exciting”?', sourcePhrase:'very exciting', options:['thrilling','silent'] });
  assert.equal(heading(html), 'Which phrase keeps the meaning?');
  assert.match(html, /<span>Original phrase<\/span><p>very exciting<\/p>/);
  assert.equal((html.match(/very exciting/g) ?? []).length, 1);
});

test('Precision highlights only the quoted weak language, with the source separate', () => {
  const html = render({ type:'improve_vocabulary', responseMode:'text', prompt:'Replace “very exciting” with a precise word.', sourceText:'The event was ____.' });
  assert.match(heading(html), /Replace “<strong class="vocab-target-language">very exciting<\/strong>” with a precise word\./);
  assert.match(html, /<span>In context<\/span><p>The event was /);
  assert.doesNotMatch(html, /thrilling/);
});

test('Spelling & Recall shows the exact meaning separately without exposing the hidden word', () => {
  const html = render({ type:'spell_word', responseMode:'spelling', prompt:'Type the word that means “very exciting”.', spellingPattern:'t _ _ _ _ _ _ _ _' });
  assert.equal(heading(html), 'Type the word.');
  assert.match(html, /<span>Meaning<\/span><p>very exciting<\/p>/);
  assert.match(html, /t _ _ _ _ _ _ _ _/);
  assert.doesNotMatch(html, /thrilling/);
});

test('existing drag gaps keep their event hook and correct-answer state', () => {
  const q = { type:'drag_word_sentence', responseMode:'drag_gap', prompt:'Complete the sentence.', sourceText:'The event was ____.', draggables:['thrilling','quiet'] };
  assert.match(render(q), /class="vocab-gap-slot" data-gap-slot/);
  assert.match(render(q, { feedback:{ correct:true, filledAnswer:'thrilling' } }), /data-gap-correct[^>]*>thrilling<\/span>/);
});

test('unknown prompts and HTML-like source text retain wording and remain escaped', () => {
  const html = render({ type:'unknown_task', responseMode:'text', prompt:'Compare “A” and “B” without adding information.', sourceText:'A < B & C > D.' });
  assert.equal(heading(html), 'Compare “A” and “B” without adding information.');
  assert.match(html, /A &lt; B &amp; C &gt; D\./);
  assert.doesNotMatch(html, /vocab-target-language/);
});

test('target emphasis matches whole visible words, never substrings or answer keys', () => {
  const html = render({ type:'meaning_match', responseMode:'choice', prompt:'Which meaning fits?', sourceText:'Art can be part of life. ART matters.', options:['creativity'], markingReference:{ acceptedAnswers:['secret-answer'] } }, { term:'art' });
  assert.match(html, /<strong class="vocab-target-language">Art<\/strong> can be part of life\. <strong class="vocab-target-language">ART<\/strong> matters\./);
  assert.doesNotMatch(html, /secret-answer/);
});

test('both Spelling Apply variants separate meaning from instruction without changing tiles', () => {
  for (const [prompt, instruction] of [
    ['Rebuild the word meaning “very exciting”.','Rebuild the word.'],
    ['Fill in the missing letters of the word meaning “very exciting”.','Fill in the missing letters.']
  ]) {
    const html = render({ type:'spelling_rebuild', responseMode:'tiles', prompt, tiles:['t','r','h'], missingTemplate:[null,'h',null] });
    assert.equal(heading(html), instruction);
    assert.match(html, /<span>Meaning<\/span><p>very exciting<\/p>/);
    assert.match(html, /data-tile-answer="r"/);
    assert.match(html, /data-missing-template=/);
    assert.doesNotMatch(html, /thrilling/);
  }
});

test('matching sentence cues use the same noninteractive gap treatment without duplicating the cue', () => {
  const html = render({ type:'word_family_match', responseMode:'matching', prompt:'Match the correct form.', sourceText:'They ____ daily.', matchCue:'They ____ daily.', matchOptions:['train','training'] });
  assert.match(html, /class="vocab-match-cue">They <span class="vocab-language-gap"/);
  assert.equal((html.match(/They /g) ?? []).length,1);
  assert.match(html, /data-match-card="train"/);
});

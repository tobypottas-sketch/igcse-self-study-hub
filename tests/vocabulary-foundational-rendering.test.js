import test from 'node:test';
import assert from 'node:assert/strict';
import { renderVocabularyQuestion } from '../src/vocabulary/views.js';
import { buildSupportStep } from '../src/vocabulary/scaffolding.js';

function root() { return { innerHTML:'' }; }
function render(question, support = null, retry = false) {
  const target = root();
  renderVocabularyQuestion(target, {
    unitNumber:1,
    unitTitle:'Sports and Free Time',
    question,
    term:'active',
    sessionLabel:'1 / 10 activities',
    support,
    retry
  });
  return target.innerHTML;
}

const pairs = [
  { vocabularyId:'v_active', term:'active', definition:'doing things energetically' },
  { vocabularyId:'v_effort', term:'effort', definition:'physical or mental work' },
  { vocabularyId:'v_regular', term:'regular', definition:'happening often' },
  { vocabularyId:'v_compete', term:'compete', definition:'try to win' }
];

test('Meaning Match without its set of pairs refuses to render a dropdown fallback', () => {
  assert.throws(() => render({
    type:'word_definition_match', responseMode:'matching', prompt:'Match each word with its definition.',
    pairs, primaryEvidenceTargetId:'v_active', markingReference:{ acceptedAnswers:['doing things energetically'] }
  }), /Meaning Match needs its set/);
});

test('Meaning Apply situation tasks render as accessible choice cards: no chips, drop zone or dropdown', () => {
  for (const [type, options, answer] of [
    ['drag_definition_word', ['active','effort','regular','compete'], 'regular'],
    ['drag_word_definition', pairs.map(pair => pair.definition), 'happening often']
  ]) {
    const html = render({
      type, responseMode:'choice', prompt:'Which word best fits this situation?\nThe gym opens every Monday, Wednesday and Friday.',
      options, primaryEvidenceTargetId:'v_regular', markingReference:{ acceptedAnswers:[answer] }
    });
    assert.equal((html.match(/data-choice-answer=/g) ?? []).length, 4, type);
    assert.match(html, /The gym opens every Monday/, type);
    assert.doesNotMatch(html, /<select|draggable|data-drag-|data-drop-target|vocab-drop-zone|vocab-drag-token|vocab-accessible-fallback|data-match-card|data-match-word|data-correct=/, type);
  }
});

test('gap-fill response is drag-to-fill: word cards, a drop slot in the sentence, no dropdown, Check disabled until a word is dragged in', () => {
  const html = render({
    type:'drag_word_sentence', responseMode:'drag_gap', prompt:'Complete the sentence.',
    sourceText:'Students should stay ____ after school.', draggables:['active','effort','regular','compete'],
    markingReference:{ acceptedAnswers:['active'] }
  });
  assert.match(html, /Students should stay <span class="vocab-gap-slot" data-gap-slot[^>]*>____<\/span> after school\./);
  assert.match(html, /Drag a word into the gap/);
  assert.equal((html.match(/data-gap-choice=/g) ?? []).length, 4);
  assert.match(html, /<input type="hidden" name="answer" value="">/);
  assert.match(html, /data-gap-submit disabled/);
  assert.doesNotMatch(html, /<select|draggable|data-drag-|data-gap-drop|vocab-drop-zone|vocab-drag-token|vocab-accessible-fallback|Drop word here/);
});

test('spelling response keeps a real text input and shows only the bounded pattern clue', () => {
  const html = render({
    type:'spell_word', responseMode:'spelling', prompt:'Type the word.', spellingPattern:'a _ _ _ _ _',
    markingReference:{ acceptedAnswers:['active'] }
  });
  assert.match(html, /a _ _ _ _ _/);
  assert.match(html, /name="answer"/);
  assert.doesNotMatch(html, />active</);
});

test('first matching miss narrows the primary target choices; spelling miss reveals only a partial clue', () => {
  const matching = buildSupportStep({
    responseMode:'matching', pairs, primaryEvidenceTargetId:'v_active',
    markingReference:{ acceptedAnswers:['doing things energetically'] }
  }, { correct:false, attemptNumber:1 });
  assert.equal(matching.action, 'retry');
  assert.equal(matching.kind, 'narrow_match');
  assert.equal(matching.options.length, 2);
  assert.ok(matching.options.includes('doing things energetically'));

  const spelling = buildSupportStep({ responseMode:'spelling', markingReference:{ acceptedAnswers:['active'] } }, { correct:false, attemptNumber:1 });
  assert.equal(spelling.kind, 'partial_text');
  assert.notEqual(spelling.clue.toLocaleLowerCase('en'), 'active');
  assert.match(spelling.clue, /^a…$/i);
});
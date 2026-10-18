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

test('matching response renders an operable single-target answer with non-pointer controls', () => {
  const html = render({
    type:'word_definition_match', responseMode:'matching', prompt:'Match each word with its definition.',
    pairs, primaryEvidenceTargetId:'v_active', markingReference:{ acceptedAnswers:['doing things energetically'] }
  });
  assert.match(html, /data-match-target="v_active"/);
  assert.match(html, /name="answer"/);
  assert.match(html, /<select[^>]*data-match-select/);
  assert.match(html, /type="submit"/);
});

test('drag-match response has pointer affordances and a keyboard\/click fallback without embedding correctness', () => {
  const html = render({
    type:'drag_word_definition', responseMode:'drag_match', prompt:'Drag each word to the correct definition.',
    pairs, primaryEvidenceTargetId:'v_active', markingReference:{ acceptedAnswers:['doing things energetically'] }
  });
  assert.match(html, /draggable="true"/);
  assert.match(html, /data-drag-value=/);
  assert.match(html, /data-drop-target=/);
  assert.match(html, /<select[^>]*data-drag-fallback/);
  assert.doesNotMatch(html, /data-correct=/);
});

test('drag-gap response renders the sentence, draggable word bank and keyboard\/click fallback', () => {
  const html = render({
    type:'drag_word_sentence', responseMode:'drag_gap', prompt:'Drag the correct word into the gap.',
    sourceText:'Students should stay ____ after school.', draggables:['active','effort','regular','compete'],
    markingReference:{ acceptedAnswers:['active'] }
  });
  assert.match(html, /Students should stay ____ after school\./);
  assert.match(html, /data-drag-gap-value=/);
  assert.match(html, /data-gap-drop/);
  assert.match(html, /<select[^>]*data-drag-gap-fallback/);
  assert.match(html, /name="answer"/);
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

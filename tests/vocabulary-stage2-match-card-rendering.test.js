import test from 'node:test';
import assert from 'node:assert/strict';
import { renderVocabularyQuestion } from '../src/vocabulary/views.js';

function root() { return { innerHTML:'' }; }
function render(question, support = null, retry = false) {
  const host = root();
  renderVocabularyQuestion(host, {
    unitNumber:1,
    unitTitle:'Sports and Free Time',
    question,
    term:'preference',
    sessionLabel:'1 / 10 activities',
    support,
    retry
  });
  return host.innerHTML;
}

const normalized = {
  type:'word_family_match',
  responseMode:'matching',
  prompt:'Match the word-family cue to the correct form.',
  sourceText:'Her ____ is for individual sports.',
  matchCue:'Her ____ is for individual sports.',
  matchOptions:['prefer','preference','preferable','preferably'],
  matchPresentation:'word_family_form',
  primaryEvidenceTargetId:'v_preference',
  markingReference:{ acceptedAnswers:['preference'] }
};

test('normalized Stage 2 matching renders selectable Match Cards and no visible select', () => {
  const html = render(normalized);
  assert.match(html,/class="vocab-match-card-grid"/);
  assert.equal((html.match(/data-match-card=/g) ?? []).length,4);
  assert.match(html,/type="hidden" name="answer"/);
  assert.doesNotMatch(html,/<select/);
  assert.equal((html.match(/Her ____ is for individual sports\./g) ?? []).length,1);
});

test('narrowed Stage 2 retry renders two Match Cards rather than a dropdown', () => {
  const html = render(normalized,{ action:'retry', kind:'narrow_match', options:['preference','preferably'] },true);
  assert.equal((html.match(/data-match-card=/g) ?? []).length,2);
  assert.doesNotMatch(html,/<select/);
  assert.match(html,/Try again/);
  assert.match(html,/Try again with two choices/);
});

test('generic legacy matching without normalized Match Card fields retains its select fallback', () => {
  const html = render({
    type:'word_definition_match', responseMode:'matching', prompt:'Match each word with its definition.',
    pairs:[
      { vocabularyId:'v_preference', term:'preference', definition:'a greater liking for one option' },
      { vocabularyId:'v_selection', term:'selection', definition:'a range to choose from' }
    ],
    primaryEvidenceTargetId:'v_preference',
    markingReference:{ acceptedAnswers:['a greater liking for one option'] }
  });
  assert.match(html,/<select[^>]*data-match-select/);
  assert.doesNotMatch(html,/vocab-match-card-grid/);
});

test('spelling Match makes all variants directly comparable at once', () => {
  const html = render({
    type:'spelling_cue_match', responseMode:'matching', prompt:'Match the meaning cue to the correctly spelled word.',
    matchCue:'a greater liking for one option',
    matchOptions:['preference','preferance','prefrence','ppreference'],
    matchPresentation:'spelling_visual_discrimination',
    markingReference:{ acceptedAnswers:['preference'] }
  });
  for (const option of ['preference','preferance','prefrence','ppreference']) assert.match(html,new RegExp(`>${option}<`));
  assert.doesNotMatch(html,/<select/);
});
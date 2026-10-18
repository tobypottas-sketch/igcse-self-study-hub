import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderVocabularyQuestion, renderSessionSummary, renderVocabularyUnit } from '../src/vocabulary/views.js';

function root() { return { innerHTML:'' }; }

const meaningQuestion = {
  type:'meaning_match',
  prompt:'What does “leisure” mean in this context? Many students use their leisure to play sport or meet friends.',
  sourceText:'Many students use their leisure to play sport or meet friends.',
  responseMode:'choice',
  options:['free time','school work','money','competition']
};

test('question prompt is visually separated from its example/context and comes first', () => {
  const host = root();
  renderVocabularyQuestion(host, {
    unitNumber:1,
    unitTitle:'Sports and free time',
    question:meaningQuestion,
    term:'leisure',
    sessionLabel:'1 / 10 activities'
  });
  assert.match(host.innerHTML, /class="vocab-question-prompt"/);
  assert.match(host.innerHTML, /class="vocab-question-context/);
  const promptIndex = host.innerHTML.indexOf('vocab-question-prompt');
  const contextIndex = host.innerHTML.indexOf('vocab-question-context');
  assert.ok(promptIndex >= 0 && contextIndex > promptIndex, 'prompt should appear before the context/example');
});

test('incorrect supported retry renders as a distinct spacious learning stage', () => {
  const host = root();
  renderVocabularyQuestion(host, {
    unitNumber:1,
    unitTitle:'Sports and free time',
    question:meaningQuestion,
    term:'leisure',
    sessionLabel:'2 / 10 activities',
    feedback:{ correct:false, message:'Not quite. Check the meaning carefully and try once more with support.' },
    retry:true,
    support:{ action:'retry', kind:'narrow_choices', options:['free time','competition'] }
  });
  assert.match(host.innerHTML, /class="vocab-retry-stage"/);
  assert.match(host.innerHTML, /class="vocab-retry-stage__head"/);
  assert.match(host.innerHTML, />Try again</);
  assert.match(host.innerHTML, /vocab-choice-fieldset is-retry/);
});

test('ten-activity completion gets a celebration but timed completion stays calm', () => {
  const ten = root();
  renderSessionSummary(ten, { summary:{ practised:10, strengthened:8, secure:2, mastered:1, needsAnotherLook:2 } });
  assert.match(ten.innerHTML, /class="vocab-celebration"/);
  assert.match(ten.innerHTML, /aria-hidden="true"/);

  const timed = root();
  renderSessionSummary(timed, { durationMinutes:10, summary:{ practised:14, strengthened:10, secure:2, mastered:1, needsAnotherLook:3 } });
  assert.doesNotMatch(timed.innerHTML, /vocab-celebration/);
});

test('timed route explains that activity styles are mixed rather than focus-locked', () => {
  const host = root();
  renderVocabularyUnit(host, {
    unitNumber:1,
    unitTitle:'Sports and free time',
    progress:{ mastered:0, total:50, needsAnotherLook:0, reviewDue:0 },
    practiceFocus:'meaning_context'
  });
  assert.match(host.innerHTML, /Mixed practice/);
  assert.match(host.innerHTML, /mix(?:es|ed).*activity styles/i);
  assert.doesNotMatch(host.innerHTML, /Stay in this skill area/i);
});

test('quiz theme defines richer support, success and accent states with reduced-motion coverage', () => {
  const css = fs.readFileSync(new URL('../vocabulary-refresh.css', import.meta.url), 'utf8');
  const html = fs.readFileSync(new URL('../vocabulary.html', import.meta.url), 'utf8');
  for (const token of ['--violet','--success','--warning','vocab-retry-stage','vocab-celebration','vocab-question-context']) {
    assert.ok(css.includes(token), `expected refreshed quiz CSS to include ${token}`);
  }
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(html, /vocabulary-refresh\.css/);
});

test('Vocabulary Builder CI also runs on main after merges', () => {
  const workflow = fs.readFileSync(new URL('../.github/workflows/vocabulary-builder-ci.yml', import.meta.url), 'utf8');
  assert.match(workflow, /branches:\s*\[[^\]]*main[^\]]*\]/);
});

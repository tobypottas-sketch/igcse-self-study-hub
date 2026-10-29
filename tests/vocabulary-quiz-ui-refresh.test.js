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

const sameIdeaQuestion = {
  type:'same_idea',
  prompt:'Which sentence expresses the same idea as this?\nMina has a preference for individual sports rather than team games.',
  sourceIdea:'Mina has a preference for individual sports rather than team games.',
  responseMode:'choice',
  options:['Mina prefers solo sports to team games.','Mina dislikes all team sports.','Mina only plays sport alone.','Mina prefers watching team games.']
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

test('same-idea questions render the original idea as a separate reading beat instead of inside the heading', () => {
  const host = root();
  renderVocabularyQuestion(host, {
    unitNumber:1,
    unitTitle:'Sports and free time',
    question:sameIdeaQuestion,
    term:'preference',
    sessionLabel:'1 / 10 activities'
  });
  const heading = host.innerHTML.match(/<h1 class="vocab-question-prompt">([\s\S]*?)<\/h1>/)?.[1] ?? '';
  assert.match(heading, /Which sentence expresses the same idea as this\?/);
  assert.doesNotMatch(heading, /Mina has a preference/);
  assert.match(host.innerHTML, /<span>Original idea<\/span><p>Mina has a <strong class="vocab-target-language">preference<\/strong> for individual sports rather than team games\.<\/p>/);
});

test('incorrect narrow-choice retry stays compact and does not repeat support instructions above the answers', () => {
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
  assert.match(host.innerHTML, /vocab-retry-stage/);
  assert.match(host.innerHTML, /vocab-choice-fieldset is-retry/);
  assert.doesNotMatch(host.innerHTML, /This one has been simplified/);
  assert.doesNotMatch(host.innerHTML, /Try again with two possibilities/);
  assert.doesNotMatch(host.innerHTML, /vocab-retry-stage__head/);
});

test('correct feedback and Continue control live in a spaced response stage', () => {
  const host = root();
  renderVocabularyQuestion(host, {
    unitNumber:1,
    unitTitle:'Sports and free time',
    question:sameIdeaQuestion,
    term:'preference',
    sessionLabel:'3 / 10 activities',
    feedback:{ correct:true, message:'Correct — you tracked the whole idea accurately.' }
  });
  assert.match(host.innerHTML, /class="vocab-response-stage is-correct"/);
  assert.match(host.innerHTML, /vocab-feedback[^\"]*is-positive/);
  assert.match(host.innerHTML, /data-action="next-question">Next question/);
});

test('ten-activity completion gets a celebration but timed completion stays calm', () => {
  const ten = root();
  renderSessionSummary(ten, { summary:{ practised:10, strengthened:8, secure:2, mastered:1, needsAnotherLook:2 } });
  assert.match(ten.innerHTML, /vocab-completion-rays/);
  assert.match(ten.innerHTML, /aria-hidden="true"/);

  const timed = root();
  renderSessionSummary(timed, { durationMinutes:10, summary:{ practised:14, strengthened:10, secure:2, mastered:1, needsAnotherLook:3 } });
  assert.doesNotMatch(timed.innerHTML, /vocab-completion-rays/);
  assert.match(timed.innerHTML, /data-study-completion-art/, 'the slot is still reserved so the card never changes size');
});

test('Mixed Practice is explicitly review-only rather than a hidden replacement for pathway learning', () => {
  const host = root();
  renderVocabularyUnit(host, {
    unitNumber:1,
    unitTitle:'Sports and free time',
    progress:{ mastered:0, total:50, needsAnotherLook:0, reviewDue:0 },
    pathwayStates:{},
    contentReady:true
  });
  assert.match(host.innerHTML, /Mixed Practice/);
  assert.match(host.innerHTML, /Review only/);
  assert.match(host.innerHTML, /already unlocked across the six pathways/);
  assert.match(host.innerHTML, /does not skip you ahead/);
  assert.doesNotMatch(host.innerHTML, /Stay in this skill area/i);
});

test('quiz theme keeps response states spaced and long answer choices inside the card', () => {
  const css = fs.readFileSync(new URL('../vocabulary-refresh.css', import.meta.url), 'utf8');
  const html = fs.readFileSync(new URL('../vocabulary.html', import.meta.url), 'utf8');
  for (const token of ['--violet','--success','--warning','vocab-retry-stage','vocab-celebration','vocab-question-context','vocab-response-stage']) {
    assert.ok(css.includes(token), `expected refreshed quiz CSS to include ${token}`);
  }
  assert.match(css, /\.vocab-response-stage\s*\{[\s\S]*?display:grid;[\s\S]*?gap:/);
  assert.match(css, /\.vocab-choice-grid\s*\{[\s\S]*?minmax\(0,1fr\)/);
  assert.match(css, /\.vocab-choice[^\{]*\{[\s\S]*?overflow-wrap:/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(html, /vocabulary-refresh\.css/);
});

test('Vocabulary Builder CI also runs on main after merges', () => {
  const workflow = fs.readFileSync(new URL('../.github/workflows/vocabulary-builder-ci.yml', import.meta.url), 'utf8');
  assert.match(workflow, /branches:\s*\[[^\]]*main[^\]]*\]/);
});
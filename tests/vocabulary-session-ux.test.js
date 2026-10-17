import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildQuestion } from '../src/vocabulary/questions.js';
import { renderVocabularyQuestion, renderVocabularyUnit, supportiveFeedback } from '../src/vocabulary/views.js';

const item = {
  vocabularyId:'vocab_leisure',
  term:'leisure',
  coreMeaning:'free time when you are not working or studying',
  senses:[{
    senseId:'leisure_1',
    acceptedParaphrases:['free time'],
    misleadingDistractors:['salary','training','deadline']
  }]
};
const occurrence = { occurrenceId:'u1_leisure', vocabularyId:item.vocabularyId, senseId:'leisure_1' };
const contexts = [
  { contextId:'ctx-meaning', type:'meaning_context', text:'Many students use their leisure to play sport or meet friends.', acceptedAnswers:['free time'], activityTypes:['meaning_match','context_inference','identify_inaccurate_paraphrase'] },
  { contextId:'ctx-paraphrase', type:'paraphrase_context', text:'Young people often spend their free time online.', targetRewrite:'free time', acceptedAnswers:['leisure'], activityTypes:['paraphrase_match','question_text_bridge','replace_phrase'] },
  { contextId:'ctx-production', type:'production_context', text:'Reading is a popular ___ activity.', targetRewrite:'free-time', acceptedAnswers:['leisure'], activityTypes:['context_gap_fill','produce_paraphrase','use_target','mini_mixed_check'] }
];
const newMastery = { status:'new', strandEvidence:{ meaning:0, recognition:0, context:0, paraphrasing:0, production:0 } };

function root() { return { innerHTML:'' }; }

test('unit page exposes all seven Cambridge 0511 practice modes', () => {
  const target = root();
  renderVocabularyUnit(target, { unitNumber:1, unitTitle:'Sports and Free Time', progress:{ mastered:0,total:50,needsAnotherLook:0,reviewDue:0 }, practiceFocus:'adaptive' });
  const modes = [
    ['learn','Learn the Vocabulary'],
    ['context','Understand in Context'],
    ['question_text','Question ↔ Text'],
    ['phrase_paraphrase','Phrase Paraphrasing'],
    ['idea_paraphrase','Idea Paraphrasing'],
    ['writing','Writing Vocabulary'],
    ['adaptive','Adaptive 0511 Mix']
  ];
  for (const [id,label] of modes) {
    assert.match(target.innerHTML, new RegExp(label.replace('&','&amp;'), 'i'));
    assert.match(target.innerHTML, new RegExp(`data-practice-focus="${id}"`));
  }
  for (const minutes of [5,10,15,20]) assert.match(target.innerHTML, new RegExp(`>${minutes} min<`));
});

test('question renderer supports choice, tiles, evidence selection and short text', () => {
  const cases = [
    [{ type:'same_idea', responseMode:'choice', prompt:'Choose', options:['A','B'] }, /data-choice-answer=/],
    [{ type:'build_paraphrase', responseMode:'tiles', prompt:'Build', tiles:['take','part','in'] }, /data-tile-answer=/],
    [{ type:'find_evidence', responseMode:'evidence', prompt:'Find', sourceText:'The event was delayed because of rain.', evidenceOptions:['because of rain','the event'] }, /data-evidence-answer=/],
    [{ type:'rewrite_phrase', responseMode:'text', prompt:'Rewrite' }, /name="answer"/]
  ];
  for (const [question, expected] of cases) {
    const target = root();
    renderVocabularyQuestion(target, { unitNumber:1, unitTitle:'Sports and Free Time', question, term:'leisure', sessionLabel:'2 / 10 activities' });
    assert.match(target.innerHTML, expected);
  }
});

test('adaptive mix avoids repeating a recently used activity type across different words', () => {
  const question = buildQuestion({ occurrence, item, contexts, mastery:newMastery, recentQuestionTypes:['meaning_match'] });
  assert.notEqual(question.type, 'meaning_match');
});

test('correct feedback explains the learning instead of saying a word is getting stronger', () => {
  const message = supportiveFeedback({ correct:true, term:'leisure', meaning:'free time', questionType:'meaning_match' });
  assert.equal(message, 'Correct — “leisure” means free time here.');
  assert.doesNotMatch(message, /getting stronger/i);
});

test('answer feedback is calculated locally before server persistence', () => {
  const appSource = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');
  assert.match(appSource, /function\s+handleAnswer\s*\(/);
  assert.doesNotMatch(appSource, /async\s+function\s+handleAnswer\s*\(/);
  assert.match(appSource, /const result\s*=\s*markVocabularyAttemptLocally\(/);
  assert.match(appSource, /if\s*\(!state\.preview\)\s+void\s+persistVocabularyAttempt\(/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { markCuratedAnswer } from '../supabase/functions/_shared/vocabulary-engine.js';
import { VOCABULARY_PATHWAYS, PATHWAY_STAGES, activityTypesForPathwayStage } from '../src/vocabulary/pathway-model.js';
import { planPathwayQuestion } from '../src/vocabulary/pathway-planner.js';
import { buildActivity } from '../src/vocabulary/activity-factory.js';
import { AnswerLeakError, findAnswerLeak, isTypedActivity, normalizeForLeak } from '../src/vocabulary/answer-leak-guard.js';

function contentFor(unit) {
  const content = {
    occurrences:unit.occurrences, items:unit.items, contexts:unit.contexts, activities:unit.activities,
    itemsById:Object.fromEntries(unit.items.map(item => [item.vocabularyId,item])), contextsByOccurrence:{}
  };
  for (const ctx of unit.contexts) (content.contextsByOccurrence[ctx.occurrenceId] ??= []).push(ctx);
  return content;
}
const content = contentFor(unit1);
const byTerm = term => {
  const item = content.items.find(row => row.term === term);
  const occurrence = content.occurrences.find(row => row.vocabularyId === item.vocabularyId);
  return { item, occurrence };
};

// ── Reproduction: allow → allow ────────────────────────────────────────────────────────────────
test('repro: with permissive marking the Recall cue for permit would show a markable answer ("allow")', () => {
  const { item, occurrence } = byTerm('permit');
  const sense = item.senses[0];
  assert.match(sense.meaning, /\ballow\b/);
  // Marking is now exact for Recall the Word (see vocabulary-recall-word-marking.test.js). The guard itself
  // must still protect any typed type whose marker does accept paraphrases, e.g. a spelling rebuild.
  const marked = markCuratedAnswer({ item:{ vocabularyId:item.vocabularyId }, sense, context:{ contextId:'c', acceptedAnswers:['permit'] }, questionType:'spelling_rebuild', rawAnswer:'allow' });
  assert.equal(marked.correct, true);
  const leaky = { type:'spelling_rebuild', responseMode:'text', prompt:`Type the word that means “${sense.meaning}”.`, markingReference:{ acceptedAnswers:['permit'] } };
  assert.deepEqual(findAnswerLeak(leaky,{ item, occurrence }), { field:'prompt', answer:'allow' });
});

// ── Guard rules ────────────────────────────────────────────────────────────────────────────────
test('guard: matching is case-insensitive and ignores punctuation, hyphens and curly quotes', () => {
  const base = { type:'rewrite_phrase', responseMode:'text', markingReference:{ acceptedAnswers:['goal-oriented'] } };
  for (const prompt of ['Rewrite: GOAL ORIENTED players','Rewrite: “goal-oriented” players','Rewrite: goal—oriented players']) {
    assert.ok(findAnswerLeak({ ...base, prompt }), `should leak: ${prompt}`);
  }
  assert.equal(normalizeForLeak('Don’t  STOP!'), 'dont stop');
  const shortAnswer = { type:'type_missing_word', responseMode:'text', markingReference:{ acceptedAnswers:["can't"] } };
  assert.ok(findAnswerLeak({ ...shortAnswer, prompt:'Type the word: CAN’T wait' }));
});

test('guard: whole words only, typed responses only, and only the visible student text counts', () => {
  const typed = { type:'type_missing_word', responseMode:'text', markingReference:{ acceptedAnswers:['permit'] } };
  assert.equal(findAnswerLeak({ ...typed, prompt:'They permitted it.' }), null, 'permitted is not permit');
  assert.ok(findAnswerLeak({ ...typed, prompt:'Type the word.', sourceText:'The club does not permit this.' }));
  assert.equal(findAnswerLeak({ ...typed, prompt:'Type the word.', sourceText:'The club does not ____ this.', options:['permit'] }), null);
  assert.equal(findAnswerLeak({ ...typed, responseMode:'choice', prompt:'Which word: permit?' }), null, 'choice questions are out of scope');
  assert.equal(isTypedActivity({ responseMode:'spelling' }), true);
  assert.equal(isTypedActivity({ responseMode:'tiles' }), false);
});

test('guard: exact-answer question types do not treat curated paraphrases as accepted (it follows the marker)', () => {
  const { item, occurrence } = byTerm('permit');
  const spell = { type:'spell_word', responseMode:'spelling', prompt:`Type the word that means “${item.senses[0].meaning}”.`, markingReference:{ acceptedAnswers:['permit'] } };
  assert.equal(findAnswerLeak(spell,{ item, occurrence }), null, 'spell_word only accepts permit, so showing allow is not a leak');
});

// ── Live path: nothing the planner can serve leaks ─────────────────────────────────────────────
test('every typed question the live pathway planner can serve for Unit 1 is free of visible accepted answers', () => {
  const failures = new Map();
  let served = 0;
  for (const pathway of VOCABULARY_PATHWAYS) {
    for (const stage of PATHWAY_STAGES) {
      if (!activityTypesForPathwayStage(pathway.id,stage.id).length) continue;
      for (const target of content.occurrences) {
        for (let round = 0; round < 6; round += 1) {
          let plan;
          try {
            plan = planPathwayQuestion({ pathwayId:pathway.id, stageId:stage.id, content, target, mastery:{ status:'mastered' }, seed:`leak:${round}`, usedContentIds:round % 2 ? [] : content.activities.map(row => row.activityContentId).slice(0,round * 7) });
          } catch { continue; }
          served += 1;
          const leak = findAnswerLeak(plan.question,{ item:plan.item, occurrence:target });
          if (leak) failures.set(`${pathway.id}/${stage.id} ${plan.question.type} ${plan.item.term} shows “${leak.answer}” in ${leak.field}`,true);
        }
      }
    }
  }
  assert.ok(served > 1000, 'the planner should still serve plenty of questions');
  assert.deepEqual([...failures.keys()], []);
});

test('Recall the Word for permit is served with its legitimate synonym cue, and never shows "permit"', () => {
  const { occurrence } = byTerm('permit');
  const plan = planPathwayQuestion({ pathwayId:'meaning', stageId:'recall', content, target:occurrence, mastery:{ status:'mastered' }, seed:'allow' });
  assert.equal(plan.question.type, 'type_word_from_definition');
  assert.deepEqual(plan.question.markingReference.acceptedAnswers, ['permit']);
  assert.equal(findAnswerLeak(plan.question,{ item:plan.item, occurrence }), null);
});

test('a headword-leaking word-family instruction is reframed around another family member, never served verbatim', () => {
  const { item, occurrence } = byTerm('avoid');
  const seen = new Set();
  for (let round = 0; round < 8; round += 1) {
    const question = buildActivity({ activityType:'word_family_switch', occurrence, item, unitActivities:content.activities, unitItems:content.items, mastery:{ status:'mastered' }, seed:`wf:${round}`, usedContentIds:[] });
    seen.add(question.contentId);
    assert.equal(findAnswerLeak(question,{ item, occurrence }), null);
  }
  assert.ok(seen.size >= 1);
});

// ── Factory: regenerate, then fail closed ──────────────────────────────────────────────────────
function writingRecord(id, prompt, sourceText, acceptedAnswers) {
  return { activityContentId:id, unitNumber:99, contentType:'writing_set', status:'approved', activityData:{ taskType:'word_family', prompt, sourceText, acceptedAnswers, linkedVocabularyIds:['vocab_fixture'], primaryEvidenceTargetId:'vocab_fixture' } };
}
const fixtureItem = { vocabularyId:'vocab_fixture', term:'fixture', partOfSpeech:'verb', wordFamily:[], senses:[{ senseId:'fixture_1', meaning:'to mend', acceptedParaphrases:['mend'], misleadingDistractors:[] }] };
const fixtureOccurrence = { occurrenceId:'u99_01_fixture', vocabularyId:'vocab_fixture', senseId:'fixture_1' };
const baseArgs = { activityType:'word_family_switch', occurrence:fixtureOccurrence, item:fixtureItem, mastery:{ status:'mastered' }, seed:'f' };

test('factory regenerates from another record when the first one leaks, whatever the seed', () => {
  const unitActivities = [
    writingRecord('leaky','Use the correct form of fixture.','They ____ the fence.',['fixture']),
    writingRecord('clean','Use the correct form from the word family.','The ____ was quick.',['fixing'])
  ];
  for (const seed of ['a','b','c','d','e','f']) {
    const question = buildActivity({ ...baseArgs, unitActivities, seed });
    assert.equal(question.contentId, 'clean');
  }
});

test('factory fails closed with AnswerLeakError when every available prompt leaks', () => {
  const unitActivities = [writingRecord('leaky','Use the correct form of fixture.','They ____ the fence.',['fixture'])];
  assert.throws(() => buildActivity({ ...baseArgs, unitActivities }), error => error instanceof AnswerLeakError && /fixture/.test(error.message));
});

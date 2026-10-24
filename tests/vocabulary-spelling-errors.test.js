import test from 'node:test';
import assert from 'node:assert/strict';
import u from '../content/vocabulary/releases/unit-01.js';
import { pickSpellingErrors, ruleBasedSpellingErrors } from '../src/vocabulary/spelling-errors.js';
import { buildActivity } from '../src/vocabulary/activity-factory.js';

const mastered = { status:'mastered', strandEvidence:{ meaning:9, recognition:9, context:9, paraphrasing:9, production:9 } };
function distance(a, b) { const d = Array.from({ length:a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]); for (let j = 1; j <= b.length; j += 1) d[0][j] = j; for (let i = 1; i <= a.length; i += 1) for (let j = 1; j <= b.length; j += 1) d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1)); return d[a.length][b.length]; }

test('every Unit 1 word has three distinct, plausible, non-mechanical spelling errors', () => {
  for (const item of u.items) {
    const errors = pickSpellingErrors(item, item.term, 3, 'seed');
    assert.equal(new Set(errors).size, 3, `${item.term}: three distinct errors`);
    for (const error of errors) {
      assert.notEqual(error.toLowerCase(), item.term.toLowerCase());
      assert.ok(!(error[0] === error[1] && item.term[0] !== item.term[1]), `${item.term}: ${error} doubles the first letter`);
      assert.ok(distance(error, item.term) <= 3, `${item.term}: ${error} is too far from the word`);
      assert.ok(!/(.)\1\1/.test(error), `${error} has three repeated letters`);
    }
  }
});

test('served spelling_choice questions never contain mechanical distractors and keep one correct option', () => {
  for (const item of u.items) {
    const occurrence = u.occurrences.find(o => o.vocabularyId === item.vocabularyId);
    const contexts = u.contexts.filter(c => c.vocabularyId === item.vocabularyId);
    for (const used of [[], [`item:${item.vocabularyId}:${occurrence.senseId}`]]) {
      const a = buildActivity({ activityType:'spelling_choice', occurrence, item, contexts, unitActivities:u.activities, unitItems:u.items, unitContexts:u.contexts, unitOccurrences:u.occurrences, mastery:mastered, seed:'t', usedContentIds:used });
      const answer = a.markingReference.acceptedAnswers[0];
      assert.equal(a.options.filter(o => o === answer).length, 1, item.term);
      assert.equal(a.options.length, 4);
      for (const option of a.options.filter(o => o !== answer)) assert.ok(!(option[0] === option[1] && answer[0] !== answer[1]), `${item.term}: ${option}`);
    }
  }
});

test('rule-based fallback gives natural errors for unseen words and inflected forms', () => {
  const errors = ruleBasedSpellingErrors('beautiful');
  assert.ok(errors.length >= 2);
  assert.ok(errors.every(e => e[0] === 'b' && !/(.)\1\1/.test(e)));
  assert.equal(pickSpellingErrors({ term:'avoid' }, 'avoided', 3, 's').length, 3);
});
